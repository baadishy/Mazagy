import express from 'express';
import { adminDb } from '../firebaseAdmin';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { uploadToCloudinary } from '../utils/cloudinary';

const router = express.Router();

// CRUD
router.post('/', authMiddleware, roleMiddleware(['seller', 'admin']), async (req, res) => {
  try {
    const { name, description, price, images, isOnSale, salePrice, saleStart, saleEnd, deliveryAvailable, deliveryFee, warranty, category } = req.body;
    
    // Upload images to Cloudinary if they are base64
    const imageUrls = await Promise.all(
      images.map(async (img: string) => {
        if (img.startsWith('data:image/')) {
          return await uploadToCloudinary(img);
        }
        return img; // Already a URL or other format
      })
    );

    const productRef = adminDb.collection('products').doc();
    const productData = {
      id: productRef.id,
      name,
      description,
      price,
      images: imageUrls,
      isOnSale: isOnSale || false,
      salePrice: salePrice || null,
      saleStart: saleStart || null,
      saleEnd: saleEnd || null,
      deliveryAvailable: deliveryAvailable || false,
      deliveryFee: deliveryFee || 0,
      warranty: warranty || 'no warranty',
      category: category || 'أخرى',
      sellerId: (req as any).user.id,
      averageRating: 0,
      numReviews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await productRef.set(productData);

    // Notify followers
    const followersSnapshot = await adminDb.collection('users').where('followingSellers', 'array-contains', (req as any).user.id).get();
    if (!followersSnapshot.empty) {
      const batch = adminDb.batch();
      followersSnapshot.docs.forEach(follower => {
        const notificationRef = adminDb.collection('notifications').doc();
        batch.set(notificationRef, {
          id: notificationRef.id,
          userId: follower.id,
          productId: productRef.id,
          type: 'new_product',
          message: `قام متجر تتابعه بإضافة منتج جديد: ${name}`,
          read: false,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    res.status(201).json(productData);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const productsSnapshot = await adminDb.collection('products').get();
    const products = await Promise.all(productsSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const sellerDoc = await adminDb.collection('users').doc(data.sellerId).get();
      const sellerData = sellerDoc.exists ? sellerDoc.data() : null;
      return {
        id: doc.id,
        ...data,
        sellerId: sellerData ? {
          id: sellerDoc.id,
          name: sellerData.name,
          email: sellerData.email,
          phone: sellerData.phone,
          location: sellerData.location
        } : data.sellerId
      };
    }));
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/seller/:sellerId', async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const [productsSnapshot, sellerDoc] = await Promise.all([
      adminDb.collection('products').where('sellerId', '==', sellerId).get(),
      adminDb.collection('users').doc(sellerId).get()
    ]);

    if (!sellerDoc.exists) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const sellerData = sellerDoc.data() as any;
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate seller's overall rating
    const totalReviews = products.reduce((acc, p: any) => acc + (p.numReviews || 0), 0);
    const totalRatingSum = products.reduce((acc, p: any) => acc + ((p.averageRating || 0) * (p.numReviews || 0)), 0);
    const sellerRating = totalReviews > 0 ? Number((totalRatingSum / totalReviews).toFixed(1)) : 0;

    res.json({
      products,
      seller: {
        id: sellerDoc.id,
        name: sellerData.name,
        email: sellerData.email,
        phone: sellerData.phone,
        location: sellerData.location
      },
      sellerRating,
      totalReviews
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const productDoc = await adminDb.collection('products').doc(req.params.id).get();
    if (!productDoc.exists) return res.status(404).json({ message: 'Product not found' });
    
    const data = productDoc.data() as any;
    const sellerDoc = await adminDb.collection('users').doc(data.sellerId).get();
    const sellerData = sellerDoc.exists ? sellerDoc.data() : null;

    res.json({
      id: productDoc.id,
      ...data,
      sellerId: sellerData ? {
        id: sellerDoc.id,
        name: sellerData.name,
        email: sellerData.email,
        phone: sellerData.phone,
        location: sellerData.location
      } : data.sellerId
    });
  } catch (error) {
    console.error('Error fetching product by id:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const productRef = adminDb.collection('products').doc(req.params.id);
    const productDoc = await productRef.get();
    if (!productDoc.exists) return res.status(404).json({ message: 'Product not found' });
    
    const productData = productDoc.data() as any;
    if (productData.sellerId !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updateData = { ...req.body };
    
    // If images are provided, upload new ones to Cloudinary
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

    const wasOnSale = productData.isOnSale;
    updateData.updatedAt = new Date().toISOString();

    await productRef.update(updateData);
    const updatedProduct = (await productRef.get()).data();

    // Trigger notifications
    const isOnSaleNow = updateData.isOnSale;

    if (!wasOnSale && isOnSaleNow) {
      const usersSnapshot = await adminDb.collection('users').where('wishlist', 'array-contains', req.params.id).get();
      if (!usersSnapshot.empty) {
        const batch = adminDb.batch();
        usersSnapshot.docs.forEach(user => {
          const notificationRef = adminDb.collection('notifications').doc();
          batch.set(notificationRef, {
            id: notificationRef.id,
            userId: user.id,
            productId: req.params.id,
            type: 'sale',
            message: `المنتج "${productData.name}" معروض الآن للبيع بسعر خاص!`,
            read: false,
            createdAt: new Date().toISOString()
          });
        });
        await batch.commit();
      }
    }

    res.json({ id: req.params.id, ...updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const productRef = adminDb.collection('products').doc(req.params.id);
    const productDoc = await productRef.get();
    if (!productDoc.exists) return res.status(404).json({ message: 'Product not found' });
    
    const productData = productDoc.data() as any;
    if (productData.sellerId !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await productRef.delete();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
