import mongoose from 'mongoose';
import { CustomRequest } from './customRequest.model.js';

export let memoryDossiers = [];

export const generateStudioConcepts = async (parameters) => {
  const { audience, category, silhouette, fabric } = parameters;
  const fabricName = fabric?.name || 'Mulberry Silk';
  const silhouetteName = silhouette || 'Sculptural Tailored Cut';

  return [
    {
      id: 'concept-1',
      title: 'Variant I — Primary Sovereign Blueprint',
      description: `Structured ${silhouetteName} articulated in ${fabricName}. Features razor-sharp hand-rolled edges, internal silk boning, and precise seam balance.`,
      badge: 'Master Tailor Recommendation',
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'concept-2',
      title: 'Variant II — Fluid High-Drape Interpretation',
      description: `Contemporary evening silhouette with organic bias-cut drape, asymmetric cape detailing, and micro-pleating along the lateral seam.`,
      badge: 'Runway Capsule Edit',
      imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'concept-3',
      title: 'Variant III — Architectural Minimalist Silhouette',
      description: `Minimalist monochromatic silhouette focusing strictly on textile provenance and weight, with concealed closure hardware.`,
      badge: 'Archival Focus',
      imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
    },
  ];
};

export const submitBespokeRequest = async (requestData, userId) => {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const referenceCode = `AI-DSN-${randomSuffix}`;

  const validUserId = (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : null;

  const doc = {
    referenceCode,
    user: validUserId,
    clientName: requestData.clientName || requestData.customerName || '',
    phone: requestData.phone || requestData.customerPhone || '',
    guestEmail: requestData.guestEmail || requestData.email || '',
    parameters: requestData.parameters,
    aiConcepts: requestData.aiConcepts || [],
    selectedConceptId: requestData.selectedConceptId || 'concept-1',
    tailorStatus: 'feasibility_review',
    tailorNotes: 'Feasibility review in progress by head tailor. Yardage and pattern viability being checked.',
    officialQuoteAmount: null,
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const customRequest = await CustomRequest.create(doc);
      memoryDossiers.unshift(customRequest);
      return customRequest;
    } catch (err) {
      console.warn('[SubmitBespoke DB Error]:', err.message);
    }
  }

  const memDoc = { ...doc, _id: `dossier_${Date.now()}`, createdAt: new Date() };
  memoryDossiers.unshift(memDoc);
  return memDoc;
};

export const getDossierByRef = async (referenceCode) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const dossier = await CustomRequest.findOne({ referenceCode }).populate('user', 'firstName lastName email');
      if (dossier) return dossier;
    } catch (err) {
      console.warn('[GetDossier DB Error]:', err.message);
    }
  }
  return memoryDossiers.find((d) => d.referenceCode === referenceCode) || null;
};

export const getUserDossiers = async (userId) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const dossiers = await CustomRequest.find({ user: userId }).sort({ createdAt: -1 });
      if (dossiers) return dossiers;
    } catch (err) {
      console.warn('[GetUserDossiers DB Error]:', err.message);
    }
  }
  return memoryDossiers.filter((d) => userId && d.user && d.user.toString() === userId.toString());
};
