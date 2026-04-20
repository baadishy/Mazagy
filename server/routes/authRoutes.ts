import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Settings } from '../models/Settings.js';
import { authMiddleware } from '../middleware/auth.js';

import { JWT_SECRET } from '../config.js';

const router = express.Router();

const initSellerTrial = async (user: any) => {
  // Only initialize trial if the user has NEVER had a trial started/ended before
  if (user.role === 'seller' && !user.trialStartDate && !user.trialEndDate) {
    const settings = await Settings.findOne() || { isTrialEnabled: true, trialDurationDays: 30 };
    if (settings.isTrialEnabled) {
      user.isTrialActive = true;
      user.trialStartDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + settings.trialDurationDays);
      user.trialEndDate = endDate;
      
      // Calculate lock date (30 days after trial ends)
      const lockDate = new Date(endDate);
      lockDate.setDate(lockDate.getDate() + 30);
      user.subscriptionLockDate = lockDate;
      
      await user.save();
    }
  }
  return user;
};

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, phone, location, password, role } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'رقم الهاتف مستخدم بالفعل' });
    }
    const user = new User({ name, phone, location, password, role });
    
    await initSellerTrial(user);
    
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none' 
    });
    res.status(201).json({ 
      user: { 
        id: user._id, 
        name, 
        role,
        phone: user.phone,
        location: user.location,
        isTrialActive: user.isTrialActive,
        trialEndDate: user.trialEndDate,
        isLocked: user.isLocked,
        subscriptionLockDate: user.subscriptionLockDate,
        hasSeenRules: user.hasSeenRules
      } 
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'رقم الهاتف مستخدم بالفعل' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user: any = await User.findOne({ phone });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
    }

    await initSellerTrial(user);

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none' 
    });
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role,
        phone: user.phone,
        location: user.location,
        isTrialActive: user.isTrialActive,
        trialEndDate: user.trialEndDate,
        isLocked: user.isLocked,
        subscriptionLockDate: user.subscriptionLockDate,
        hasSeenRules: user.hasSeenRules
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Acknowledge Rules
router.post('/acknowledge-rules', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.hasSeenRules = true;
    await user.save();
    
    res.json({ success: true, hasSeenRules: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Login by ID
router.post('/admin/login', async (req, res) => {
  try {
    const { id, password } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'معرف غير صالح' });
    }
    const user: any = await User.findById(id);
    if (!user || user.role !== 'admin' || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none' 
    });
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role,
        phone: user.phone,
        location: user.location,
        isTrialActive: user.isTrialActive,
        trialEndDate: user.trialEndDate,
        isLocked: user.isLocked,
        subscriptionLockDate: user.subscriptionLockDate
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    let user: any = await User.findById((req as any).user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    await initSellerTrial(user);

    // Auto-lock check: if trial + 1 month passed and not manually unlocked
    if (user.role === 'seller' && user.subscriptionLockDate && !user.isLocked) {
      const now = new Date();
      if (now > user.subscriptionLockDate) {
        user.isLocked = true;
        await user.save();
      }
    }

    res.json({
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      wishlist: user.wishlist,
      followingSellers: user.followingSellers,
      location: user.location,
      isTrialActive: user.isTrialActive,
      trialEndDate: user.trialEndDate,
      isLocked: user.isLocked,
      subscriptionLockDate: user.subscriptionLockDate,
      hasSeenRules: user.hasSeenRules
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'معرف مستخدم غير صالح' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, location, password } = req.body;
    const user: any = await User.findById((req as any).user.id);
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (password) user.password = password;
    await user.save();
    res.json({ message: 'Profile updated' });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'رقم الهاتف مستخدم بالفعل' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Wishlist toggle
router.post('/wishlist/:productId', authMiddleware, async (req, res) => {
  try {
    const user: any = await User.findById((req as any).user.id);
    const productId = req.params.productId;
    
    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }
    
    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get wishlist products
router.get('/wishlist', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById((req as any).user.id).populate('wishlist');
    res.json(user?.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow/Unfollow Seller
router.post('/follow/:sellerId', authMiddleware, async (req, res) => {
  try {
    const user: any = await User.findById((req as any).user.id);
    const sellerId = req.params.sellerId;
    
    // Check if seller exists and is actually a seller
    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const index = user.followingSellers.indexOf(sellerId);
    if (index === -1) {
      user.followingSellers.push(sellerId);
    } else {
      user.followingSellers.splice(index, 1);
    }
    
    await user.save();
    res.json(user.followingSellers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all users
router.get('/admin/users', authMiddleware, async (req, res) => {
  try {
    if ((req as any).user.role !== 'admin' && (req as any).user.role !== 'moderator') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Toggle Lock User
router.post('/admin/users/:id/toggle-lock', authMiddleware, async (req, res) => {
  try {
    if ((req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isLocked = !user.isLocked;
    
    // If we are unlocking, we should probably push the subscriptionLockDate forward?
    // User said: "lock the seller until it pays ... until I opens him"
    // So unlocking should probably give them another month? 
    // Usually if they pay, they get another 30 days.
    if (!user.isLocked) {
      user.lastPaymentDate = new Date();
      const nextLockDate = new Date();
      nextLockDate.setDate(nextLockDate.getDate() + 30);
      user.subscriptionLockDate = nextLockDate;
    }
    
    await user.save();
    res.json({ message: user.isLocked ? 'User locked' : 'User unlocked', isLocked: user.isLocked });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete user
router.delete('/admin/users/:id', authMiddleware, async (req, res) => {
  try {
    if ((req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'none' 
  });
  res.json({ message: 'Logged out successfully' });
});

export default router;
