import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'Pakistan' },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    shippingMethod: {
      type: String,
      enum: ['standard', 'express'],
      default: 'standard',
    },
    shippingCost: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['card', 'apple_pay', 'cod', 'jazzcash', 'easypaisa'],
      default: 'card',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'paid',
    },
    fulfillmentStatus: {
      type: String,
      enum: ['placed', 'garment_inspection', 'pressing', 'dispatched', 'delivered'],
      default: 'placed',
    },
    trackingCode: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model('Order', orderSchema);
