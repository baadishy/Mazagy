import express from 'express';
import { Notification } from '../models/Notification';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all notifications for current user
router.get('/', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('productId', 'name images');
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification || notification.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all as read
router.put('/read-all', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    await Notification.updateMany({ userId, read: false }, { read: true });
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
    const notification = await Notification.findById(req.params.id);
    
    if (!notification || notification.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
