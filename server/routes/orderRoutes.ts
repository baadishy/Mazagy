import express from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Settings } from '../models/Settings.js';
import { Review } from '../models/Review.js';
import { Notification } from '../models/Notification.js';
import { authMiddleware, roleMiddleware, lockMiddleware } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Public Stats (for About Us page)
router.get('/public-stats', async (req, res) => {
  try {
    const [totalOrders, sellersCount, buyersCount, totalUsers, settings] = await Promise.all([
      Order.countDocuments({ status: 'delivered' }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({}),
      Settings.findOne()
    ]);
    
    res.json({
      totalOrders,
      sellersCount,
      buyersCount,
      totalUsers,
      commissionRate: settings?.globalCommissionRate || 0.10,
      trialDurationDays: settings?.trialDurationDays || 30
    });
  } catch (error) {
    console.error('Error in /public-stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity, buyerName, buyerPhone, buyerAddress, deliveryFee, selectedColor, selectedSize } = req.body;
    
    // Egyptian phone validation
    const cleanPhone = buyerPhone?.replace(/\D/g, '');
    if (!/^01[0125][0-9]{8}$/.test(cleanPhone)) {
      return res.status(400).json({ message: 'تنسيق رقم الهاتف غير صحيح. يجب أن يكون رقماً مصرياً صالحاً يبدأ بـ 01' });
    }

    const user = (req as any).user;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;

    const order = new Order({
      productId,
      sellerId: product.sellerId,
      buyerId: user.id,
      buyerName,
      buyerPhone,
      buyerAddress,
      quantity,
      selectedColor,
      selectedSize,
      price: displayPrice,
      deliveryFee,
      status: 'pending'
    });
    await order.save();

    // Create notification for the seller
    const notification = new Notification({
      userId: product.sellerId,
      productId: product._id,
      type: 'sale',
      message: `طلب جديد: قام ${buyerName} بطلب ${quantity} من ${product.name}`,
      read: false
    });
    await notification.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// List Orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    let query = {};
    if (user.role === 'seller') {
      query = { sellerId: user.id };
    } else if (user.role === 'buyer' || user.role === 'user') {
      query = { buyerId: user.id };
    } else if (user.role !== 'admin' && user.role !== 'moderator') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const orders = await Order.find(query)
      .populate('productId', 'name price images')
      .populate('sellerId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Status
router.put('/:id/status', authMiddleware, lockMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order: any = await Order.findById(req.params.id).populate('productId', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Check if user is seller (must be the owner of the order)
    if (order.sellerId.toString() !== (req as any).user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Enforce status transition rules
    const currentStatus = order.status;
    const userRole = (req as any).user.role;
    
    // If current status is final, don't allow changes
    if (currentStatus === 'delivered' || currentStatus === 'rejected' || currentStatus === 'cancelled') {
      return res.status(400).json({ message: 'لا يمكن تغيير حالة طلب منتهي' });
    }

    // Validate transitions
    if (currentStatus === 'pending') {
      if (status !== 'confirmed' && status !== 'rejected') {
        return res.status(400).json({ message: 'انتقال غير صالح للحالة من قيد الانتظار' });
      }
    } else if (currentStatus === 'confirmed') {
      // Sellers can ONLY move to delivered once confirmed. Rejection is no longer possible.
      if (status !== 'delivered') {
        return res.status(400).json({ message: 'لا يمكن رفض الطلب بعد تأكيده. يجب التواصل مع الإدارة في حال وجود مشكلة.' });
      }
    }

    // Calculate commission on confirmation OR delivery to prevent scams
    if (status === 'confirmed' || status === 'delivered') {
      // Only set commission if not already set (to keep the rate from when it was confirmed)
      if (!order.commissionAmount || order.commissionAmount === 0 || status === 'delivered') {
        const seller = await User.findById(order.sellerId);
        const settings = await Settings.findOne() || { globalCommissionRate: 0.10 };
        
        let commissionRate = settings.globalCommissionRate;
        
        // Check for active trial
        if (seller?.isTrialActive && seller.trialEndDate && new Date() < seller.trialEndDate) {
          commissionRate = 0;
        } else if (seller?.isTrialActive) {
          // Trial expired, update seller
          await User.findByIdAndUpdate(seller._id, { isTrialActive: false });
        }

        const productTotal = (order.price || 0) * (order.quantity || 1);
        const commissionAmount = productTotal * commissionRate;
        const sellerEarning = (productTotal - commissionAmount) + (order.deliveryFee || 0);

        order.commissionRate = commissionRate;
        order.commissionAmount = commissionAmount;
        order.sellerEarning = sellerEarning;
        
        if (status === 'confirmed') {
          order.confirmedAt = new Date();
        }
      }
    }

    // Log status change
    order.statusLogs.push({
      status: status,
      timestamp: new Date(),
      user: (req as any).user.id
    });

    order.status = status;
    await order.save();

    // Create notification for the buyer if they exist
    if (order.buyerId) {
      const statusMessages: { [key: string]: string } = {
        'confirmed': 'تم تأكيد طلبك بنجاح',
        'rejected': 'تم إلغاء طلبك من قبل البائع',
        'delivered': 'تم توصيل طلبك بنجاح'
      };

      const msg = statusMessages[status] || 'تم تحديث حالة طلبك';
      
      const notification = new Notification({
        userId: order.buyerId,
        productId: order.productId,
        type: 'order_update',
        message: `${msg}: ${order.productId?.name || 'منتج'}`,
        read: false
      });
      await notification.save();
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel Order (Buyer)
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order: any = await Order.findById(req.params.id).populate('productId', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Check if user is the buyer
    if (!order.buyerId || order.buyerId.toString() !== (req as any).user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Only allow cancellation if status is pending
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel order that is not pending' });
    }

    order.status = 'cancelled';
    await order.save();

    // Create notification for the seller
    const notification = new Notification({
      userId: order.sellerId,
      productId: order.productId,
      type: 'order_update',
      message: `تم إلغاء الطلب من قبل المشتري: ${order.productId?.name || 'منتج'}`,
      read: false
    });
    await notification.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Earnings Logic
router.get('/stats', authMiddleware, roleMiddleware(['seller', 'admin', 'moderator', 'user']), async (req, res) => {
  try {
    const user = (req as any).user;
    let query: any = {};
    if (user.role === 'seller') {
      query.sellerId = user.id;
    } else if (user.role === 'admin' && req.query.sellerId) {
      query.sellerId = req.query.sellerId;
    }
    
    const orders = await Order.find(query).populate('productId', 'name category').lean();
    const relevantOrders = orders.filter(o => o.status === 'delivered' || o.status === 'confirmed');
    
    const totalProductEarnings = relevantOrders.reduce((sum, order) => sum + ((order.price || 0) * (order.quantity || 0)), 0);
    const totalDeliveryEarnings = relevantOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
    
    const totalGMV = totalProductEarnings + totalDeliveryEarnings;
    const totalPlatformCommission = relevantOrders.reduce((sum, order) => sum + (order.commissionAmount || 0), 0);
    
    const totalSellerEarnings = relevantOrders.reduce((sum, order) => {
      if (order.sellerEarning) return sum + order.sellerEarning;
      return sum + ((order.price || 0) * (order.quantity || 0)) + (order.deliveryFee || 0) - (order.commissionAmount || 0);
    }, 0);
    
    // Optimized suspicious activity tracking using aggregation
    let suspiciousSellers: any[] = [];
    if (user.role === 'admin') {
      const suspiciousData = await Order.aggregate([
        {
          $group: {
            _id: "$sellerId",
            total: { $sum: 1 },
            rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
            confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } }
          }
        },
        { $match: { total: { $gt: 5 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "seller"
          }
        },
        { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } }
      ]);

      suspiciousSellers = suspiciousData.map(item => {
        let reasons = [];
        if (item.rejected / item.total > 0.3) reasons.push('معدل رفض عالي (>30%)');
        if (item.confirmed > 10) reasons.push('عدد كبير من الطلبات المؤكدة غير المكتملة');
        
        if (reasons.length > 0) {
          return {
            id: item._id,
            name: item.seller?.name || 'مجهول',
            reasons
          };
        }
        return null;
      }).filter(Boolean);
    }

    // Earnings by day (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const earningsMap: { [key: string]: number } = {};
    relevantOrders.forEach(o => {
      const dateKey = new Date(o.createdAt).toISOString().split('T')[0];
      const amount = (user.role === 'admin' && !req.query.sellerId) 
        ? (o.commissionAmount || 0) 
        : (o.sellerEarning || ((o.price || 0) * (o.quantity || 0)) + (o.deliveryFee || 0) - (o.commissionAmount || 0));
      earningsMap[dateKey] = (earningsMap[dateKey] || 0) + amount;
    });

    const earningsByDay = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('ar-EG', { weekday: 'short' }),
      amount: earningsMap[date] || 0
    }));

    // Orders by status for Pie Chart
    const ordersByStatus = [
      { name: 'معلق', value: orders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
      { name: 'مؤكد', value: orders.filter(o => o.status === 'confirmed').length, color: '#3b82f6' },
      { name: 'مكتمل', value: orders.filter(o => o.status === 'delivered').length, color: '#10b981' },
      { name: 'مرفوض', value: orders.filter(o => o.status === 'rejected').length, color: '#ef4444' },
      { name: 'ملغي', value: orders.filter(o => o.status === 'cancelled').length, color: '#64748b' },
    ].filter(s => s.value > 0);

    // Top Products
    const productSales: { [key: string]: { name: string, sales: number } } = {};
    relevantOrders.forEach(order => {
      const productId = order.productId?._id?.toString() || 'unknown';
      const productName = (order.productId as any)?.name || 'منتج غير معروف';
      if (!productSales[productId]) {
        productSales[productId] = { name: productName, sales: 0 };
      }
      productSales[productId].sales += order.quantity;
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Recent Transactions
    const recentTransactions = relevantOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(o => ({
        id: o._id,
        status: o.status,
        product: (o.productId as any)?.name || 'منتج غير معروف',
        amount: ((o.price || 0) * (o.quantity || 0)) + (o.deliveryFee || 0),
        commission: o.commissionAmount || 0,
        date: o.createdAt,
        buyer: o.buyerName
      }));

    // Sales by Category
    const salesByCategoryMap: { [key: string]: number } = {};
    relevantOrders.forEach(order => {
      const category = (order.productId as any)?.category || 'أخرى';
      salesByCategoryMap[category] = (salesByCategoryMap[category] || 0) + ((order.price || 0) * (order.quantity || 0)) + (order.deliveryFee || 0);
    });

    const salesByCategory = Object.entries(salesByCategoryMap).map(([name, value]) => ({
      name,
      value,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random colors for categories
    }));

    // Review Distribution
    const sellerProducts = await Product.find(user.role === 'admin' ? {} : { sellerId: user.id }).select('_id').lean();
    const sellerProductIds = sellerProducts.map(p => p._id);
    const reviewsData = await Review.aggregate([
      { $match: { productId: { $in: sellerProductIds } } },
      { $group: { _id: "$rating", count: { $sum: 1 } } }
    ]);

    const reviewMap: any = {};
    reviewsData.forEach(r => reviewMap[r._id] = r.count);

    const reviewDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviewMap[rating] || 0
    }));

    const settings = await Settings.findOne() || { globalCommissionRate: 0.10 };

    const stats = {
      totalEarnings: (user.role === 'admin' && !req.query.sellerId) ? totalGMV : totalSellerEarnings,
      totalProductEarnings: totalProductEarnings,
      totalDeliveryEarnings: totalDeliveryEarnings,
      totalGMV: totalGMV,
      totalCommission: totalPlatformCommission,
      totalSellerEarnings: totalSellerEarnings,
      globalCommissionRate: settings.globalCommissionRate,
      suspiciousSellers,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      rejected: orders.filter(o => o.status === 'rejected').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalOrders: orders.length,
      totalProducts: user.role === 'admin' ? await Product.countDocuments({}) : sellerProducts.length,
      totalUsers: user.role === 'admin' ? await User.countDocuments({}) : 0,
      totalSellers: user.role === 'admin' ? await User.countDocuments({ role: 'seller' }) : 0,
      earningsByDay,
      ordersByStatus,
      topProducts,
      recentTransactions,
      salesByCategory,
      reviewDistribution
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error in /stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: List Sellers
router.get('/admin/sellers', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' }).select('-password').lean();
    
    // Get stats for all sellers in one go
    const allSellerStats = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { 
          _id: "$sellerId", 
          totalSales: { $sum: { $multiply: ["$price", "$quantity"] } },
          commission: { $sum: "$commissionAmount" }
      } }
    ]);

    const statsMap: any = {};
    allSellerStats.forEach(s => {
      statsMap[s._id.toString()] = s;
    });

    const sellersWithStats = sellers.map(seller => {
      const stats = statsMap[seller._id.toString()] || { totalSales: 0, commission: 0 };
      return {
        ...seller,
        totalSales: stats.totalSales,
        commission: stats.commission
      };
    });
    
    res.json(sellersWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
