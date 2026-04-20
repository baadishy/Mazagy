import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: [{ type: String }],
  colors: [{ type: String }],
  sizes: [{ type: String }],
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: Number, default: 0 },
  condition: { type: String, enum: ['new', 'used'], default: 'new' },
  warranty: { type: String, default: 'no warranty' },
  isOnSale: { type: Boolean, default: false },
  salePrice: { type: Number },
  saleStart: { type: Date },
  saleEnd: { type: Date },
  deliveryAvailable: { type: Boolean, default: false },
  deliveryFee: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

// Performance Indexes
productSchema.index({ sellerId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

export const Product = mongoose.model('Product', productSchema);
