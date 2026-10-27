import {
  generateStudioConcepts,
  submitBespokeRequest,
  getDossierByRef,
  getUserDossiers,
} from './studio.service.js';
import {
  refineConceptsWithAI,
} from './';
import { dispatchNotification } from '../notifications/notification.service.js';
import { CustomRequest } from './customRequest.model.js';

export const uploadSketch = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No sketch image uploaded. Please attach a valid image file.',
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Reference sketch uploaded to atelier vault.',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileUrl,
        size: req.file.size,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateConcepts = async (req, res, next) => {
  try {
    const parameters = req.body.parameters || req.body;
    // Utilize Gemini AI concept synthesis with graceful fallback
    const concepts = await refineConceptsWithAI(parameters);

    res.status(200).json({
      success: true,
      message: 'AI concept variants synthesized successfully.',
      data: concepts,
    });
  } catch (error) {
    next(error);
  }
};

export const consultAssistant = async (req, res, next) => {
  try {
    const { message, history, currentDesignState } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required for the Fashion Design Assistant consultation.',
      });
    }

    // const consultation = await consultDesignAssistant({
    //   message,
    //   history,
    //   currentDesignState,
    // });

    res.status(200).json({
      success: true,
      data: "",
    });
  } catch (error) {
    next(error);
  }
};

export const submitDossier = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const dossier = await submitBespokeRequest(req.body, userId);

    // Dispatch Notifications
    if (userId) {
      await dispatchNotification({
        user: userId,
        recipientRole: 'customer',
        title: `Bespoke Dossier ${dossier.referenceCode} Submitted`,
        message: `Your custom silhouette request for "${dossier.parameters?.category || 'Couture Piece'}" has reached the Master Tailor queue. Official feasibility & quotation review is underway.`,
        type: 'studio',
        referenceId: dossier.referenceCode,
      });
    }

    await dispatchNotification({
      recipientRole: 'admin',
      title: `New Custom Dossier: ${dossier.referenceCode}`,
      message: `A client submitted a custom tailoring commission (${dossier.parameters?.category || 'Bespoke'}) awaiting feasibility assessment.`,
      type: 'studio',
      referenceId: dossier.referenceCode,
    });

    res.status(201).json({
      success: true,
      message: 'Custom bespoke dossier transmitted to master tailors.',
      data: dossier,
    });
  } catch (error) {
    next(error);
  }
};

export const addDossierMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const { refCode } = req.params;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const dossier = await CustomRequest.findOne({ referenceCode: refCode });
    if (!dossier) {
      return res.status(404).json({ success: false, message: 'Bespoke dossier not found.' });
    }

    const isAdmin =
      req.user &&
      ['admin', 'super_admin', 'tailor_admin'].includes(req.user.role);

    const isOwner =
      req.user &&
      dossier.user &&
      (dossier.user._id || dossier.user).toString() === (req.user.id || req.user._id).toString();

    const isGuestAuthorized =
      req.query.email &&
      dossier.guestEmail &&
      req.query.email.toLowerCase().trim() === dossier.guestEmail.toLowerCase().trim();

    if (!isAdmin && !isOwner && !isGuestAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to append notes to this bespoke dossier.',
      });
    }

    const senderRole = isAdmin ? 'tailor' : 'client';
    const messageEntry = {
      sender: senderRole,
      message: message.trim(),
      timestamp: new Date(),
    };

    if (!dossier.consultationLog) {
      dossier.consultationLog = [];
    }
    dossier.consultationLog.push(messageEntry);
    await dossier.save();

    // Notify counterpart
    if (senderRole === 'client') {
      await dispatchNotification({
        recipientRole: 'admin',
        title: `New Note on Dossier ${refCode}`,
        message: `Client added a consultation note: "${message.substring(0, 80)}..."`,
        type: 'quote',
        referenceId: refCode,
      });
    } else if (dossier.user) {
      await dispatchNotification({
        user: dossier.user,
        recipientRole: 'customer',
        title: `Master Tailor Advisory on Dossier ${refCode}`,
        message: `Your master tailor posted: "${message.substring(0, 80)}..."`,
        type: 'quote',
        referenceId: refCode,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consultation note appended to dossier archive.',
      data: dossier,
    });
  } catch (error) {
    next(error);
  }
};

export const getDossier = async (req, res, next) => {
  try {
    const dossier = await getDossierByRef(req.params.refCode);

    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Bespoke design dossier not found.',
      });
    }

    const isAdmin =
      req.user &&
      ['admin', 'super_admin', 'tailor_admin'].includes(req.user.role);

    const isOwner =
      req.user &&
      dossier.user &&
      (dossier.user._id || dossier.user).toString() === (req.user.id || req.user._id).toString();

    const isGuestAuthorized =
      req.query.email &&
      dossier.guestEmail &&
      req.query.email.toLowerCase().trim() === dossier.guestEmail.toLowerCase().trim();

    if (!isAdmin && !isOwner && !isGuestAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access clearance denied for this custom design dossier.',
      });
    }

    res.status(200).json({
      success: true,
      data: dossier,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyDossiers = async (req, res, next) => {
  try {
    const dossiers = await getUserDossiers(req.user.id || req.user._id);
    res.status(200).json({
      success: true,
      count: dossiers.length,
      data: dossiers,
    });
  } catch (error) {
    next(error);
  }
};
