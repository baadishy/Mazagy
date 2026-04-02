import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  location: {
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number }
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'seller', 'user'], default: 'user' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  followingSellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commission: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
