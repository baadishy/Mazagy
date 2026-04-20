import express from 'express';
import { Settings } from '../models/Settings.js';
import { User } from '../models/User.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get Settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Settings (Admin only)
router.put('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { globalCommissionRate, isTrialEnabled, trialDurationDays } = req.body;
    
    // Validation: Commission rate must be between 0 and 25% (0.25)
    if (globalCommissionRate !== undefined) {
      if (typeof globalCommissionRate !== 'number' || globalCommissionRate < 0 || globalCommissionRate > 0.25) {
        return res.status(400).json({ message: 'العمولة يجب أن تكون بين 0% و 25% فقط' });
      }
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    if (globalCommissionRate !== undefined) settings.globalCommissionRate = globalCommissionRate;
    if (isTrialEnabled !== undefined) settings.isTrialEnabled = isTrialEnabled;
    if (trialDurationDays !== undefined) settings.trialDurationDays = trialDurationDays;
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Toggle Trial for Seller
router.put('/seller-trial/:sellerId', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { isTrialActive, trialDurationDays } = req.body;
    const seller = await User.findById(req.params.sellerId);
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }
    
    seller.isTrialActive = isTrialActive;
    if (isTrialActive) {
      seller.trialStartDate = new Date();
      const duration = trialDurationDays || 30;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);
      seller.trialEndDate = endDate;
    } else {
      // Keep trialStartDate as a record that they HAD a trial
      // Set to an old date to mark it as ended definitively
      seller.trialEndDate = new Date(1000); // Near epoch but distinct
    }
    
    await seller.save();
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
