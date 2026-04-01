import express from 'express';
import { adminDb } from '../firebaseAdmin';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all notifications for current user
router.get('/', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;
  console.log('Fetching notifications for user:', userId);
  try {
    const notificationsSnapshot = await adminDb.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const notifications = await Promise.all(notificationsSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      let productData = null;
      if (data.productId) {
        const productDoc = await adminDb.collection('products').doc(data.productId).get();
        if (productDoc.exists) {
          const pData = productDoc.data() as any;
          productData = { id: productDoc.id, name: pData.name, images: pData.images };
        }
      }
      return {
        id: doc.id,
        ...data,
        productId: productData || data.productId
      };
    }));

    console.log('Found notifications:', notifications.length);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications handler:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const notificationRef = adminDb.collection('notifications').doc(req.params.id);
    const notificationDoc = await notificationRef.get();
    
    if (!notificationDoc.exists || notificationDoc.data()?.userId !== userId) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notificationRef.update({ read: true, updatedAt: new Date().toISOString() });
    const updatedDoc = await notificationRef.get();
    
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all as read
router.put('/read-all', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const notificationsSnapshot = await adminDb.collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();
    
    const batch = adminDb.batch();
    notificationsSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true, updatedAt: new Date().toISOString() });
    });
    
    await batch.commit();
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const notificationRef = adminDb.collection('notifications').doc(req.params.id);
    const notificationDoc = await notificationRef.get();
    
    if (!notificationDoc.exists || notificationDoc.data()?.userId !== userId) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notificationRef.delete();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
