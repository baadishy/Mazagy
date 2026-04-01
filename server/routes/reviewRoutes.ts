import express from 'express';
import { adminDb } from '../firebaseAdmin';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviewsSnapshot = await adminDb.collection('reviews')
      .where('productId', '==', req.params.productId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const reviews = await Promise.all(reviewsSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const userDoc = await adminDb.collection('users').doc(data.userId).get();
      const userData = userDoc.exists ? userDoc.data() : null;
      return {
        id: doc.id,
        ...data,
        userId: userData ? { id: userDoc.id, name: userData.name } : data.userId
      };
    }));
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
    const productRef = adminDb.collection('products').doc(productId);
    const productDoc = await productRef.get();
    if (!productDoc.exists) return res.status(404).json({ message: 'Product not found' });

    // Check if user already reviewed this product
    const existingReviewSnapshot = await adminDb.collection('reviews')
      .where('userId', '==', userId)
      .where('productId', '==', productId)
      .get();
    
    if (!existingReviewSnapshot.empty) {
      return res.status(400).json({ message: 'لقد قمت بتقييم هذا المنتج مسبقاً' });
    }

    const reviewRef = adminDb.collection('reviews').doc();
    const reviewData = {
      id: reviewRef.id,
      userId,
      productId,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await reviewRef.set(reviewData);

    // Update product average rating and numReviews
    const reviewsSnapshot = await adminDb.collection('reviews').where('productId', '==', productId).get();
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    const numReviews = reviews.length;
    const averageRating = reviews.reduce((acc, item: any) => item.rating + acc, 0) / numReviews;

    await productRef.update({
      numReviews,
      averageRating: Number(averageRating.toFixed(1)),
      updatedAt: new Date().toISOString()
    });

    res.status(201).json(reviewData);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a review
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const reviewRef = adminDb.collection('reviews').doc(req.params.id);
    const reviewDoc = await reviewRef.get();
    if (!reviewDoc.exists) return res.status(404).json({ message: 'Review not found' });

    const reviewData = reviewDoc.data() as any;
    if (reviewData.userId !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const productId = reviewData.productId;
    await reviewRef.delete();

    // Recalculate product rating
    const reviewsSnapshot = await adminDb.collection('reviews').where('productId', '==', productId).get();
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    const numReviews = reviews.length;
    const averageRating = numReviews > 0 
      ? reviews.reduce((acc, item: any) => item.rating + acc, 0) / numReviews 
      : 0;

    await adminDb.collection('products').doc(productId).update({
      numReviews,
      averageRating: Number(averageRating.toFixed(1)),
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
