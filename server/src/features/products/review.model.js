import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    comment: {
      type: String,
      required: [true, 'Review critique is required'],
      trim: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
