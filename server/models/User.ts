import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, required: true, unique: true },
    location: {
      address: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "seller", "buyer", "moderator", "user"],
      default: "buyer",
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    followingSellers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commission: { type: Number, default: 0 },
    isTrialActive: { type: Boolean, default: false },
    trialStartDate: { type: Date },
    trialEndDate: { type: Date },
    isLocked: { type: Boolean, default: false },
    hasSeenRules: { type: Boolean, default: false },
    lastPaymentDate: { type: Date },
    subscriptionLockDate: { type: Date },
    lastCommissionAckDate: { type: Date, default: () => new Date(0) },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
