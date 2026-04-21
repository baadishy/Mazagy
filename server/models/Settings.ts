import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    globalCommissionRate: { type: Number, default: 0.1 }, // 10%
    isTrialEnabled: { type: Boolean, default: true },
    trialDurationDays: { type: Number, default: 30 },
    commissionUpdateDate: { type: Date, default: () => new Date(0) },
  },
  { timestamps: true },
);

export const Settings = mongoose.model("Settings", settingsSchema);
