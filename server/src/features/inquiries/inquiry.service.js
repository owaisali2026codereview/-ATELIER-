import mongoose from 'mongoose';
import { Inquiry } from './inquiry.model.js';

export let memoryInquiries = [];

export const createInquiry = async (inquiryData, userId = null) => {
  const doc = {
    senderName: inquiryData.senderName?.trim() || 'Valued Patron',
    senderEmail: inquiryData.senderEmail?.trim().toLowerCase(),
    senderPhone: inquiryData.senderPhone?.trim() || '',
    subject: inquiryData.subject?.trim() || 'General Atelier Inquiry',
    message: inquiryData.message?.trim(),
    department: inquiryData.department || 'General Inquiries',
    recipientEmail: inquiryData.recipientEmail || 'info@fashion.com',
    status: 'unread',
    replyNotes: '',
    user: (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : null,
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const created = await Inquiry.create(doc);
      memoryInquiries.unshift(created);
      return created;
    } catch (err) {
      console.warn('[CreateInquiry DB Error]:', err.message);
    }
  }

  const memDoc = {
    ...doc,
    _id: `inq_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryInquiries.unshift(memDoc);
  return memDoc;
};

export const getAllInquiries = async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      const dbInquiries = await Inquiry.find().sort({ createdAt: -1 });
      if (dbInquiries && dbInquiries.length > 0) return dbInquiries;
    } catch (err) {
      console.warn('[GetInquiries DB Error]:', err.message);
    }
  }
  return memoryInquiries;
};

export const updateInquiryStatusService = async (id, status, replyNotes = '') => {
  if (mongoose.connection.readyState === 1) {
    try {
      const found = await Inquiry.findById(id);
      if (found) {
        if (status) found.status = status;
        if (replyNotes) found.replyNotes = replyNotes;
        return await found.save();
      }
    } catch (err) {
      console.warn('[UpdateInquiry DB Error]:', err.message);
    }
  }

  const item = memoryInquiries.find((i) => i._id.toString() === id.toString());
  if (item) {
    if (status) item.status = status;
    if (replyNotes) item.replyNotes = replyNotes;
    item.updatedAt = new Date();
    return item;
  }
  return null;
};

export const deleteInquiryService = async (id) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Inquiry.findByIdAndDelete(id);
    } catch (err) {
      console.warn('[DeleteInquiry DB Error]:', err.message);
    }
  }
  memoryInquiries = memoryInquiries.filter((i) => i._id.toString() !== id.toString());
  return true;
};
