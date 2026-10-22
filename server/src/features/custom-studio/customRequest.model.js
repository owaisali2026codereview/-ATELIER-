import mongoose from 'mongoose';

const conceptVariationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  badge: { type: String, default: '' },
  imageUrl: { type: String, required: true },
});

const customRequestSchema = new mongoose.Schema(
  {
    referenceCode: {
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
    guestEmail: { type: String, default: '' },
    clientName: { type: String, default: '' },
    phone: { type: String, default: '' },
    parameters: {
      audience: { type: String, enum: ['men', 'women', 'kids'], default: 'women' },
      category: { type: String, default: 'Evening & Ceremonial Gowns' },
      silhouette: { type: String, default: 'Fluid Architectural Anarkali' },
      neckline: { type: String, default: 'Asymmetric High Cowl' },
      sleeves: { type: String, default: 'Fluted Cape Sleeve' },
      fabric: {
        id: String,
        name: String,
        mill: String,
        composition: String,
      },
      prompt: { type: String, default: '' },
      appliedChips: [{ type: String }],
      budgetTier: { type: String, default: 'premium' },
      deliveryUrgency: { type: String, default: 'standard' },
      uploadedSketches: [{ type: String }],
      customNotes: { type: String, default: '' },
    },
    aiConcepts: [conceptVariationSchema],
    selectedConceptId: { type: String, default: 'concept-1' },
    tailorStatus: {
      type: String,
      enum: [
        'feasibility_review',
        'quote_ready',
        'tailoring_in_progress',
        'dispatched',
        'delivered',
        'rejected',
      ],
      default: 'feasibility_review',
    },
    tailorNotes: { type: String, default: 'Under feasibility inspection with head tailor.' },
    officialQuoteAmount: { type: Number, default: null },
    clientApprovedAt: { type: Date, default: null },
    consultationLog: [
      {
        sender: { type: String, enum: ['client', 'tailor', 'atelier_ai'], default: 'client' },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const CustomRequest = mongoose.model('CustomRequest', customRequestSchema);
