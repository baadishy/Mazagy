import express from 'express';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { uploadToCloudinary } from '../utils/cloudinary';

const router = express.Router();

// Create Product
router.post('/', authMiddleware, roleMiddleware(['seller', 'admin']), async (req, res) => {
  try {
    const { name, description, price, images, category, stock, condition } = req.body;
    
    const imageUrls = await Promise.all(
      images.map(async (img: string) => {
        if (img.startsWith('data:image/')) {
          return await uploadToCloudinary(img);
        }
        return img;
      })
    );

    const product = new Product({
      name,
      description,
      price,
      images: imageUrls,
      category,
      stock,
      condition,
      sellerId: (req as any).user.id
    });

    await product.save();

    // Notify followers
    const followers = await User.find({ followingSellers: (req as any).user.id });
    if (followers.length > 0) {
      const notifications = followers.map(follower => ({
        userId: follower._id,
        productId: product._id,
        type: 'new_product',
        message: `قام متجر تتابعه بإضافة منتج جديد: ${name}`,
        read: false
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('sellerId', 'name email phone location');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get seller products
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const [products, seller] = await Promise.all([
      Product.find({ sellerId }),
      User.findById(sellerId).select('name email phone location')
    ]);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.json({
      products,
      seller,
      sellerRating: 0, // Simplified for now
      totalReviews: 0
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'name email phone location');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by id:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.sellerId.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updateData = { ...req.body };
    
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = await Promise.all(
        updateData.images.map(async (img: string) => {
          if (img.startsWith('data:image/')) {
            return await uploadToCloudinary(img);
          }
          return img;
        })
      );
    }

    Object.assign(product, updateData);
    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.sellerId.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
