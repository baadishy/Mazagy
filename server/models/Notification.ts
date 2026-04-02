import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  title: { type: String },
  message: { type: String, required: true },
  type: { type: String, enum: ['order', 'product', 'system', 'review', 'sale', 'order_update'], default: 'system' },
  read: { type: Boolean, default: false },
  link: { type: String }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
