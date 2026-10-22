import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    senderPhone: { type: String, default: '' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    department: { type: String, default: 'General Inquiries' },
    recipientEmail: { type: String, default: 'info@fashion.com' },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied', 'archived'],
      default: 'unread',
    },
    replyNotes: { type: String, default: '' },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
