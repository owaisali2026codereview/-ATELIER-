import mongoose from 'mongoose';

const colorVariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
  image: { type: String, required: true },
});

const sizeVariantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  stockCount: { type: Number, default: 10 },
  inStock: { type: Boolean, default: true },
});

const productSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    department: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    isSale: { type: Boolean, default: false },
    badge: { type: String, default: '' },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    colors: [colorVariantSchema],
    sizes: [sizeVariantSchema],
    inStock: { type: Boolean, default: true },
    stockCount: { type: Number, default: 10 },
    fabric: { type: String, required: true },
    silhouette: { type: String },
    description: { type: String, required: true },
    careInstructions: { type: String },
    images: [{ type: String }],
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Text index for catalog search
productSchema.index({ name: 'text', fabric: 'text', description: 'text', department: 'text' });

export const Product = mongoose.model('Product', productSchema);
