import express from 'express';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name');
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a review
router.post('/', authMiddleware, async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = (req as any).user.id;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(400).json({ message: 'لقد قمت بتقييم هذا المنتج مسبقاً' });
    }

    const review = new Review({
      userId,
      productId,
      rating: Number(rating),
      comment
    });

    await review.save();

    // Update product average rating and numReviews
    const reviews = await Review.find({ productId });
    const numReviews = reviews.length;
    const averageRating = reviews.reduce((acc, item: any) => item.rating + acc, 0) / numReviews;

    product.numReviews = numReviews;
    product.averageRating = Number(averageRating.toFixed(1));
    await product.save();

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a review
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId.toString() !== (req as any).user.id && (req as any).user.role !== 'admin' && (req as any).user.role !== 'moderator') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate product rating
    const reviews = await Review.find({ productId });
    const numReviews = reviews.length;
    const averageRating = numReviews > 0 
      ? reviews.reduce((acc, item: any) => item.rating + acc, 0) / numReviews 
      : 0;

    await Product.findByIdAndUpdate(productId, {
      numReviews,
      averageRating: Number(averageRating.toFixed(1))
    });

    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
