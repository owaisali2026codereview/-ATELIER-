import {
  createInquiry,
  getAllInquiries,
  updateInquiryStatusService,
  deleteInquiryService,
} from './inquiry.service.js';
import { dispatchNotification } from '../notifications/notification.service.js';

export const submitInquiry = async (req, res, next) => {
  try {
    const { senderName, senderEmail, senderPhone, subject, message, department, recipientEmail } = req.body;

    if (!senderName?.trim() || !senderEmail?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name, email address, and inquiry message are required.',
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(senderEmail.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const userId = req.user ? (req.user.id || req.user._id) : null;
    const inquiry = await createInquiry(
      {
        senderName,
        senderEmail,
        senderPhone,
        subject: subject || 'Storefront Inquiry',
        message,
        department,
        recipientEmail: recipientEmail || 'info@fashion.com',
      },
      userId
    );

    // Dispatch real-time Admin Notification
    try {
      await dispatchNotification({
        recipientRole: 'admin',
        title: `New Email to ${inquiry.recipientEmail}: "${inquiry.subject}"`,
        message: `${inquiry.senderName} (${inquiry.senderEmail}) sent a message: "${inquiry.message.slice(0, 90)}..."`,
        type: 'system',
        referenceId: inquiry._id.toString(),
      });
    } catch (notifErr) {
      console.warn('[Notification Error]:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Your message has been dispatched to official email ${inquiry.recipientEmail}. Our team will review and respond promptly.`,
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const getInquiriesList = async (req, res, next) => {
  try {
    const inquiries = await getAllInquiries();
    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInquiry = async (req, res, next) => {
  try {
    const { status, replyNotes } = req.body;
    const updated = await updateInquiryStatusService(req.params.id, status, replyNotes);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Inquiry record not found.' });
    }
    res.status(200).json({
      success: true,
      message: 'Inquiry status updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInquiryController = async (req, res, next) => {
  try {
    await deleteInquiryService(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Inquiry removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
