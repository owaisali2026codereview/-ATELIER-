import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'Atelier AI Haute Couture',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: 'concierge@atelierraffinement.com',
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '0300-1234567',
      trim: true,
    },
    stripeEnabled: {
      type: Boolean,
      default: true,
    },
    jazzCashEnabled: {
      type: Boolean,
      default: true,
    },
    easyPaisaEnabled: {
      type: Boolean,
      default: true,
    },
    currency: {
      type: String,
      default: 'PKR',
    },
    freeShippingThreshold: {
      type: Number,
      default: 10000,
    },
  },
  {
    timestamps: true,
  }
);

export const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
