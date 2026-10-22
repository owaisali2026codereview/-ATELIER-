import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  audience: 'women',
  category: 'Evening Gowns',
  silhouette: 'Fluid Architectural',
  neckline: 'Sculptural Asymmetric Drape',
  sleeves: 'Fluted Bracelet Length',
  fabric: '100% Raw Mulberry Silk',
  accentColor: '#4D5543',
  prompt: 'A midnight emerald couture gown with sculptural shoulder pleats and subtle zardozi needlework.',
  selectedChips: ['+ Hand Embroidery', '+ Structured Shoulder'],
  budgetTier: 'Couture Bespoke (Rs. 25,000 - 45,000)',
  deliveryUrgency: 'Standard Salon Tailoring (14 Days)',
  isGenerating: false,
  generationStep: 'ready', // 'idle' | 'analyzing' | 'weaving' | 'rendering' | 'ready'
  generatedConcepts: [
    {
      id: 'concept-1',
      title: 'Concept I: The Emerald Column',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80',
      description: 'Lustrous mulberry silk with sculptural diagonal drape and hand-embroidered resham cuffs.',
      estimatedPrice: 'Rs. 34,500',
      fabricYardage: '4.8 Meters Como Silk',
      tailorFeasibility: '98.5% Feasible'
    },
    {
      id: 'concept-2',
      title: 'Concept II: Structural Asymmetry',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80',
      description: 'Crisp architectural waist taper featuring dual-layered silk organza lining and discreet side pockets.',
      estimatedPrice: 'Rs. 38,000',
      fabricYardage: '5.2 Meters Silk Velvet Blend',
      tailorFeasibility: '96.2% Feasible'
    }
  ],
  selectedConceptIndex: 0,
  quotationSubmitted: false,
  trackingCode: null
};

export const studioSlice = createSlice({
  name: 'studio',
  initialState,
  reducers: {
    setAudience: (state, action) => {
      state.audience = action.payload;
      if (action.payload === 'men') {
        state.category = 'Bespoke Blazers';
        state.neckline = 'Notched Lapel';
        state.prompt = 'Double-breasted unstructured blazer in heavy ecru linen with horn buttons.';
      } else if (action.payload === 'kids') {
        state.category = 'Ceremonial Kurta Sets';
        state.neckline = 'Nehru Mandarin Collar';
        state.prompt = 'Pastel almond mulmul cotton kurta with hand-rolled hems.';
      } else {
        state.category = 'Evening Gowns';
        state.neckline = 'Sculptural Asymmetric Drape';
        state.prompt = 'Midnight emerald couture gown with sculptural shoulder pleats and subtle zardozi needlework.';
      }
    },
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setSilhouette: (state, action) => {
      state.silhouette = action.payload;
    },
    setNeckline: (state, action) => {
      state.neckline = action.payload;
    },
    setSleeves: (state, action) => {
      state.sleeves = action.payload;
    },
    setFabric: (state, action) => {
      state.fabric = action.payload;
    },
    setAccentColor: (state, action) => {
      state.accentColor = action.payload;
    },
    setPrompt: (state, action) => {
      state.prompt = action.payload;
    },
    toggleChip: (state, action) => {
      const chip = action.payload;
      if (state.selectedChips.includes(chip)) {
        state.selectedChips = state.selectedChips.filter((c) => c !== chip);
      } else {
        state.selectedChips.push(chip);
      }
    },
    setBudgetTier: (state, action) => {
      state.budgetTier = action.payload;
    },
    setDeliveryUrgency: (state, action) => {
      state.deliveryUrgency = action.payload;
    },
    startGeneration: (state) => {
      state.isGenerating = true;
      state.generationStep = 'analyzing';
    },
    setGenerationStep: (state, action) => {
      state.generationStep = action.payload;
      if (action.payload === 'ready') {
        state.isGenerating = false;
      }
    },
    selectConcept: (state, action) => {
      state.selectedConceptIndex = action.payload;
    },
    setGeneratedConcepts: (state, action) => {
      state.generatedConcepts = action.payload;
      state.selectedConceptIndex = 0;
    },
    submitQuotation: (state, action) => {
      state.quotationSubmitted = true;
      state.trackingCode = action.payload || `AI-DSN-${Math.floor(1000 + Math.random() * 9000)}`;
    },
    resetStudio: () => initialState
  }
});

export const {
  setAudience,
  setCategory,
  setSilhouette,
  setNeckline,
  setSleeves,
  setFabric,
  setAccentColor,
  setPrompt,
  toggleChip,
  setBudgetTier,
  setDeliveryUrgency,
  startGeneration,
  setGenerationStep,
  selectConcept,
  setGeneratedConcepts,
  submitQuotation,
  resetStudio
} = studioSlice.actions;

export default studioSlice.reducer;
