import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  globalCommissionRate: { type: Number, default: 0.10 }, // 10%
  isTrialEnabled: { type: Boolean, default: true },
  trialDurationDays: { type: Number, default: 30 },
}, { timestamps: true });

export const Settings = mongoose.model('Settings', settingsSchema);
