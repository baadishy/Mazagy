import express from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Review } from '../models/Review';
import { Notification } from '../models/Notification';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

// Public Stats (for About Us page)
router.get('/public-stats', async (req, res) => {
  try {
    const { User } = await import('../models/User');
    const [totalOrders, sellersCount, buyersCount, totalUsers] = await Promise.all([
      Order.countDocuments({ status: 'delivered' }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({})
    ]);
    
    res.json({
      totalOrders,
      sellersCount,
      buyersCount,
      totalUsers
    });
  } catch (error) {
    console.error('Error in /public-stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity, buyerName, buyerPhone, buyerAddress, deliveryFee } = req.body;
    const user = (req as any).user;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const order = new Order({
      productId,
      sellerId: product.sellerId,
      buyerId: user.id,
      buyerName,
      buyerPhone,
      buyerAddress,
      quantity,
      price: product.price,
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
    } else if (user.role === 'buyer') {
      query = { buyerId: user.id };
    } else if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const orders = await Order.find(query)
      .populate('productId', 'name price images')
      .populate('sellerId', 'name email phone');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order: any = await Order.findById(req.params.id).populate('productId', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Check if user is seller or admin
    if (order.sellerId.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Enforce status transition rules
    const currentStatus = order.status;
    
    // If current status is final, don't allow changes
    if (currentStatus === 'delivered' || currentStatus === 'rejected') {
      return res.status(400).json({ message: 'Cannot change status of a final order' });
    }

    // Validate transitions
    if (currentStatus === 'pending') {
      if (status !== 'confirmed' && status !== 'rejected') {
        return res.status(400).json({ message: 'Invalid status transition from pending' });
      }
    } else if (currentStatus === 'confirmed') {
      if (status !== 'delivered' && status !== 'rejected') {
        return res.status(400).json({ message: 'Invalid status transition from confirmed' });
      }
    }

    order.status = status;
    await order.save();

    // Create notification for the buyer if they exist
    if (order.buyerId) {
      const statusMessages: any = {
        'confirmed': 'تم تأكيد طلبك بنجاح',
        'rejected': 'تم إلغاء طلبك من قبل البائع',
        'delivered': 'تم توصيل طلبك بنجاح'
      };

      const notification = new Notification({
        userId: order.buyerId,
        productId: order.productId,
        type: 'order_update',
        message: `${statusMessages[status]}: ${order.productId?.name || 'منتج'}`,
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
    if (order.buyerId.toString() !== (req as any).user.id) {
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
router.get('/stats', authMiddleware, roleMiddleware(['seller', 'admin']), async (req, res) => {
  try {
    const user = (req as any).user;
    let query: any = {};
    if (user.role === 'seller') {
      query.sellerId = user.id;
    } else if (user.role === 'admin' && req.query.sellerId) {
      query.sellerId = req.query.sellerId;
    }
    
    const orders = await Order.find(query).populate('productId', 'name category');
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    
    const totalProductEarnings = deliveredOrders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
    const totalDeliveryEarnings = deliveredOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
    const totalEarnings = totalProductEarnings + totalDeliveryEarnings;
    const totalCommission = deliveredOrders.reduce((sum, order) => sum + (order.price * order.quantity * 0), 0); // Commission disabled (0%)
    
    // Earnings by day (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const earningsByDay = last7Days.map(date => {
      const dayOrders = deliveredOrders.filter(o => new Date(o.createdAt).toISOString().split('T')[0] === date);
      const dayEarnings = dayOrders.reduce((sum, o) => sum + (o.price * o.quantity) + (o.deliveryFee || 0), 0);
      return { 
        date: new Date(date).toLocaleDateString('ar-EG', { weekday: 'short' }), 
        amount: dayEarnings 
      };
    });

    // Orders by status for Pie Chart
    const ordersByStatus = [
      { name: 'معلق', value: orders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
      { name: 'مؤكد', value: orders.filter(o => o.status === 'confirmed').length, color: '#3b82f6' },
      { name: 'مكتمل', value: deliveredOrders.length, color: '#10b981' },
      { name: 'مرفوض', value: orders.filter(o => o.status === 'rejected').length, color: '#ef4444' },
      { name: 'ملغي', value: orders.filter(o => o.status === 'cancelled').length, color: '#64748b' },
    ].filter(s => s.value > 0);

    // Top Products
    const productSales: { [key: string]: { name: string, sales: number } } = {};
    deliveredOrders.forEach(order => {
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
    const recentTransactions = deliveredOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(o => ({
        id: o._id,
        product: (o.productId as any)?.name || 'منتج غير معروف',
        amount: (o.price * o.quantity) + (o.deliveryFee || 0),
        date: o.createdAt,
        buyer: o.buyerName
      }));

    // Sales by Category
    const salesByCategoryMap: { [key: string]: number } = {};
    deliveredOrders.forEach(order => {
      const category = (order.productId as any)?.category || 'أخرى';
      salesByCategoryMap[category] = (salesByCategoryMap[category] || 0) + (order.price * order.quantity) + (order.deliveryFee || 0);
    });

    const salesByCategory = Object.entries(salesByCategoryMap).map(([name, value]) => ({
      name,
      value,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random colors for categories
    }));

    // Review Distribution
    const sellerProducts = await Product.find(user.role === 'admin' ? {} : { sellerId: user.id });
    const sellerProductIds = sellerProducts.map(p => p._id);
    const reviews = await Review.find({ productId: { $in: sellerProductIds } });
    const reviewDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length
    }));

    const { User } = await import('../models/User');
    const stats = {
      totalEarnings: totalEarnings,
      totalProductEarnings: totalProductEarnings,
      totalDeliveryEarnings: totalDeliveryEarnings,
      totalCommission: totalCommission,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      delivered: deliveredOrders.length,
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
    const { User } = await import('../models/User');
    const sellers = await User.find({ role: 'seller' }).select('-password');
    
    // For each seller, get their earnings
    const sellersWithStats = await Promise.all(sellers.map(async (seller) => {
      const orders = await Order.find({ sellerId: seller._id, status: 'delivered' });
      const totalSales = orders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
      const commission = totalSales * 0; // Commission disabled
      return {
        ...seller.toObject(),
        totalSales,
        commission,
        paymentStatus: 'paid' // Mocking payment status for now
      };
    }));
    
    res.json(sellersWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
