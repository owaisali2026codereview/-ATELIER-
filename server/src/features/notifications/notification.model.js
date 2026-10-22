import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recipientRole: {
      type: String,
      enum: ['customer', 'admin', 'tailor_admin', 'super_admin', 'all'],
      default: 'customer',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['order', 'quote', 'status_update', 'studio', 'system'],
      default: 'system',
    },
    referenceId: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
