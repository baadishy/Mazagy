import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  buyerName: { type: String, required: true },
  buyerPhone: { type: String, required: true },
  buyerAddress: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  selectedColor: { type: String },
  selectedSize: { type: String },
  price: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'rejected'], 
    default: 'pending' 
  },
  paymentMethod: { type: String, default: 'cash_on_delivery' },
  commissionRate: { type: Number, default: 0 },
  commissionAmount: { type: Number, default: 0 },
  sellerEarning: { type: Number, default: 0 },
  confirmedAt: { type: Date },
  statusLogs: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    user: { type: String }
  }]
}, { timestamps: true });

// Performance Indexes
orderSchema.index({ sellerId: 1, status: 1 });
orderSchema.index({ buyerId: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
