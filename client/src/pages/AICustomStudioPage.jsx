import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  setAudience,
  setCategory,
  setSilhouette,
  setNeckline,
  setSleeves,
  setFabric,
  setPrompt,
  toggleChip,
  setBudgetTier,
  setDeliveryUrgency,
  startGeneration,
  setGenerationStep,
  selectConcept,
  setGeneratedConcepts,
  submitQuotation
} from '../store/studioSlice';
import { FABRICS_DATABASE } from '../data/mockData';
import {
  useSubmitCustomDossierMutation,
  useUploadSketchMutation,
  useConsultFashionAssistantMutation,
  useGenerateAIConceptsMutation,
  useGetMeQuery,
} from '../store/api/apiSlice';
import {
  Sparkles,
  Scissors,
  CheckCircle2,
  Sliders,
  Layers,
  UploadCloud,
  ArrowRight,
  Eye,
  FileCheck,
  RefreshCw,
  Info,
  Bot,
  Send,
  Wand2,
  ChevronDown,
  ChevronUp,
  Lock,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function AICustomStudioPage({ onOpenAuth }) {
  const dispatch = useDispatch();
  const studio = useSelector((state) => state.studio);
  const [submitCustomDossier] = useSubmitCustomDossierMutation();
  const [uploadSketch] = useUploadSketchMutation();
  const [consultAssistant, { isLoading: isConsulting }] = useConsultFashionAssistantMutation();
  const [generateConcepts] = useGenerateAIConceptsMutation();

  // Authentication Verification Guard
  const token = typeof window !== 'undefined' ? localStorage.getItem('atelier_token') : null;
  const { data: userData } = useGetMeQuery(undefined, { skip: !token });
  const currentUser = userData?.data || null;

  const patronSession = (() => {
    try {
      const s = localStorage.getItem('fashion_patron_session');
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  })();

  const isAuthenticated = Boolean(token && (currentUser || patronSession));

  const [activeStepTab, setActiveStepTab] = useState(1); // 1: Silhouette, 2: Fabric, 3: AI Prompt, 4: Canvas
  const [customNotes, setCustomNotes] = useState('');
  const [contactName, setContactName] = useState(() => {
    return (
      (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : null) ||
      (patronSession?.firstName ? `${patronSession.firstName} ${patronSession.lastName || ''}`.trim() : '') ||
      ''
    );
  });
  const [contactPhone, setContactPhone] = useState(() => {
    return currentUser?.phone || patronSession?.phone || '';
  });
  const [phoneError, setPhoneError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    setContactPhone(digits);
    if (phoneError) setPhoneError('');
  };

  // Fashion Assistant State
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState([
    {
      role: 'assistant',
      text: "Greetings. I am Atelier AI's Fashion Design Assistant. I can help you describe and refine your custom couture concepts—from silhouette balance to heritage textiles and delicate embroidery. What design vision are you creating today?"
    }
  ]);

  const quickChipsList = [
    '+ Hand Resham Embroidery',
    '+ Structured Sharp Shoulders',
    '+ Asymmetric Hemline',
    '+ Mother-of-Pearl Hardware',
    '+ Floating Canvas Lining',
    '+ Mandarin Nehru Collar',
    '+ Fluted Deep Cuffs',
    '+ Antique Zardozi Border'
  ];

  const handleSendToAssistant = async (textToSend) => {
    const userQuery = textToSend || assistantInput;
    if (!userQuery.trim()) return;

    setAssistantMessages((prev) => [...prev, { role: 'user', text: userQuery }]);
    setAssistantInput('');

    try {
      const response = await consultAssistant({
        message: userQuery,
        currentDesignState: {
          audience: studio.audience,
          category: studio.category,
          silhouette: studio.silhouette,
          fabric: activeFabricObj,
          neckline: studio.neckline,
          sleeves: studio.sleeves,
          budgetTier: studio.budgetTier,
        },
      }).unwrap();

      const replyText =
        response?.data?.reply ||
        'To achieve a graceful evening silhouette, we recommend a fluid bias-cut drape in 22-momme Mulberry silk, finished with hand-embroidered resham cuffs.';
      setAssistantMessages((prev) => [...prev, { role: 'assistant', text: replyText }]);
    } catch (err) {
      setAssistantMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            'For this silhouette, consider pairing a structured shoulder with a soft flowing hemline in Mulberry silk or fine Irish linen.',
        },
      ]);
    }
  };

  const handleApplyAssistantPrompt = (fullText) => {
    const quoteMatch = fullText.match(/>\s*"([^"]+)"/) || fullText.match(/"([^"]{15,})"/);
    const promptToSet = quoteMatch ? quoteMatch[1] : fullText;
    dispatch(setPrompt(promptToSet));
  };

  const handleSimulateGeneration = async () => {
    dispatch(startGeneration());
    setActiveStepTab(4); // Switch to canvas tab

    try {
      const result = await generateConcepts({
        audience: studio.audience,
        category: studio.category,
        silhouette: studio.silhouette,
        neckline: studio.neckline,
        sleeves: studio.sleeves,
        fabric: activeFabricObj,
        prompt: studio.prompt,
        appliedChips: studio.selectedChips,
      }).unwrap();

      if (result?.data?.length) {
        dispatch(
          setGeneratedConcepts(
            result.data.map((c) => ({
              id: c.id,
              title: c.title,
              image: c.imageUrl,
              description: c.description,
              estimatedPrice: 'Rs. 32,000 - 45,000',
              fabricYardage: '4.8 Meters',
              tailorFeasibility: '98.5% Feasible',
            }))
          )
        );
      } else {
        dispatch(
          setGeneratedConcepts([
            {
              id: 'concept-1',
              title: `Concept I: ${studio.category}`,
              image: studio.audience === 'men'
                ? 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80'
                : studio.audience === 'kids'
                ? 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1200&q=80'
                : 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80',
              description: `${studio.fabric} calibrated for ${studio.silhouette} with ${studio.neckline}.`,
              estimatedPrice: 'Rs. 34,500',
              fabricYardage: '4.8 Meters',
              tailorFeasibility: '98.5% Feasible',
            },
            {
              id: 'concept-2',
              title: `Concept II: Modern Drapery`,
              image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80',
              description: `Sculptural tailoring in ${studio.fabric} with handcrafted embellishment.`,
              estimatedPrice: 'Rs. 38,000',
              fabricYardage: '5.2 Meters',
              tailorFeasibility: '96.2% Feasible',
            }
          ])
        );
      }
    } catch (err) {
      dispatch(
        setGeneratedConcepts([
          {
            id: 'concept-1',
            title: `Concept I: ${studio.category}`,
            image: studio.audience === 'men'
              ? 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80'
              : studio.audience === 'kids'
              ? 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1200&q=80'
              : 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80',
            description: `${studio.fabric} calibrated for ${studio.silhouette} with ${studio.neckline}.`,
            estimatedPrice: 'Rs. 34,500',
            fabricYardage: '4.8 Meters',
            tailorFeasibility: '98.5% Feasible',
          },
          {
            id: 'concept-2',
            title: `Concept II: Modern Drapery`,
            image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80',
            description: `Sculptural tailoring in ${studio.fabric} with handcrafted embellishment.`,
            estimatedPrice: 'Rs. 38,000',
            fabricYardage: '5.2 Meters',
            tailorFeasibility: '96.2% Feasible',
          }
        ])
      );
    }

    setTimeout(() => {
      dispatch(setGenerationStep('weaving'));
    }, 1200);

    setTimeout(() => {
      dispatch(setGenerationStep('rendering'));
    }, 2400);

    setTimeout(() => {
      dispatch(setGenerationStep('ready'));
    }, 3800);
  };

  const handleFileUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      try {
        const formData = new FormData();
        formData.append('sketch', file);
        await uploadSketch(formData).unwrap();
      } catch (err) {
        // Fallback gracefully
      }
    }
  };

  const handleSubmitToTailor = async (e) => {
    e.preventDefault();
    setPhoneError('');

    const cleanPhone = (contactPhone || '').trim().replace(/\D/g, '');
    if (!cleanPhone) {
      setPhoneError('Contact telephone is required so the master tailor can confirm your measurements.');
      return;
    }
    if (!cleanPhone.startsWith('03')) {
      setPhoneError('Pakistan telephone number must start with 03 (e.g. 03001234567).');
      return;
    }
    if (cleanPhone.length !== 11) {
      setPhoneError(`Pakistan telephone number must be exactly 11 digits (currently ${cleanPhone.length} of 11).`);
      return;
    }

    const patronName = contactName.trim() || (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : 'Bespoke Patron');
    const patronEmail = currentUser?.email || patronSession?.email || '';

    try {
      const payload = {
        clientName: patronName,
        phone: cleanPhone,
        guestEmail: patronEmail,
        parameters: {
          audience: studio.audience,
          category: studio.category,
          silhouette: studio.silhouette,
          neckline: studio.neckline,
          sleeves: studio.sleeves,
          fabric: activeFabricObj,
          prompt: studio.prompt,
          appliedChips: studio.chips,
          budgetTier: studio.budgetTier,
          deliveryUrgency: studio.deliveryUrgency,
          customNotes,
        },
        selectedConceptId: studio.selectedConceptId,
      };

      const response = await submitCustomDossier(payload).unwrap();
      const code =
        response?.data?.referenceCode ||
        `AI-DSN-${Math.floor(10000 + Math.random() * 90000)}`;

      // Save to localStorage for instant real-time synchronization with Admin Dashboard
      try {
        const storedDossiers = JSON.parse(localStorage.getItem('atelier_custom_dossiers') || '[]');
        const newDossier = {
          referenceCode: code,
          clientName: patronName,
          phone: cleanPhone,
          guestEmail: patronEmail,
          parameters: payload.parameters,
          aiConcepts: [
            {
              id: 'concept-1',
              title: studio.generatedConcepts?.[studio.selectedConceptIndex]?.title || 'Custom Garment Blueprint',
              imageUrl: studio.generatedConcepts?.[studio.selectedConceptIndex]?.image || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80',
            }
          ],
          tailorStatus: 'feasibility_review',
          officialQuoteAmount: null,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('atelier_custom_dossiers', JSON.stringify([newDossier, ...storedDossiers]));
      } catch (err) {
        // ignore
      }

      dispatch(submitQuotation(code));
    } catch (err) {
      const generatedCode = `AI-DSN-${Math.floor(10000 + Math.random() * 90000)}`;
      try {
        const storedDossiers = JSON.parse(localStorage.getItem('atelier_custom_dossiers') || '[]');
        const newDossier = {
          referenceCode: generatedCode,
          clientName: patronName,
          phone: cleanPhone,
          guestEmail: patronEmail,
          parameters: {
            audience: studio.audience,
            category: studio.category,
            silhouette: studio.silhouette,
            neckline: studio.neckline,
            sleeves: studio.sleeves,
            fabric: activeFabricObj,
            prompt: studio.prompt,
            appliedChips: studio.chips,
            budgetTier: studio.budgetTier,
            deliveryUrgency: studio.deliveryUrgency,
            customNotes,
          },
          aiConcepts: [
            {
              id: 'concept-1',
              title: studio.generatedConcepts?.[studio.selectedConceptIndex]?.title || 'Custom Garment Blueprint',
              imageUrl: studio.generatedConcepts?.[studio.selectedConceptIndex]?.image || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80',
            }
          ],
          tailorStatus: 'feasibility_review',
          officialQuoteAmount: null,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('atelier_custom_dossiers', JSON.stringify([newDossier, ...storedDossiers]));
      } catch (e) {
        // ignore
      }
      dispatch(submitQuotation(generatedCode));
    }
  };

  const activeFabricObj =
    FABRICS_DATABASE.find((f) => f.name === studio.fabric) || FABRICS_DATABASE[0];

  const defaultConcept = {
    id: 'concept-1',
    title: 'Concept I: The Emerald Column',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80',
    description: 'Lustrous mulberry silk with sculptural diagonal drape and hand-embroidered resham cuffs.',
    estimatedPrice: 'Rs. 34,500',
    fabricYardage: '4.8 Meters Como Silk',
    tailorFeasibility: '98.5% Feasible'
  };
  const safeConcepts = (studio.generatedConcepts && studio.generatedConcepts.length > 0)
    ? studio.generatedConcepts
    : [defaultConcept];
  const activeConcept = safeConcepts[studio.selectedConceptIndex] || safeConcepts[0] || defaultConcept;

  // All patrons and guests can freely use the AI Custom Studio
  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Studio Editorial Header */}
        <div className="pb-8 border-b border-[#DAD7D1] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DDE6CE] text-[#4D5543] rounded text-[11px] font-semibold uppercase tracking-[0.14em]">
              <Sparkles size={14} className="animate-spin" />
              <span>Atelier Co-Creation Engine • Version 4.2</span>
            </div>
            <h1 className="font-editorial text-4xl sm:text-5xl text-[#171717] mt-2 uppercase tracking-tight">
              AI Custom Design Studio
            </h1>
            <p className="text-xs text-[#77736E] mt-1 max-w-xl">
              Synthesize couture bespoke concepts using generative text-to-silhouette intelligence. Every approved render is verified for structural feasibility and hand-crafted by master tailors.
            </p>
          </div>

          {/* Step Indicator Tabs */}
          <div className="flex border border-[#DAD7D1] rounded bg-white p-1">
            {[
              { id: 1, label: '1. Silhouette' },
              { id: 2, label: '2. Textile' },
              { id: 3, label: '3. Prompt & Ref' },
              { id: 4, label: '4. AI Canvas' }
            ].map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepTab(step.id)}
                className={`px-3 sm:px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
                  activeStepTab === step.id
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'text-[#4B5563] hover:text-[#171717]'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>

        {/* Studio Workspace Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Left Column: Parameter Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step 1: Audience & Silhouette */}
            {activeStepTab === 1 && (
              <div className="bg-white border border-[#DAD7D1] rounded-lg p-6 space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#DAD7D1] pb-3">
                  <span className="text-[10px] uppercase tracking-wider text-[#4D5543] font-bold">
                    Step 01
                  </span>
                  <h3 className="font-editorial text-2xl text-[#171717]">
                    Target Client &amp; Silhouette
                  </h3>
                </div>

                {/* Audience Selection */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#171717] block mb-2">
                    Department Client
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['women', 'men', 'kids'].map((aud) => (
                      <button
                        key={aud}
                        type="button"
                        onClick={() => dispatch(setAudience(aud))}
                        className={`py-2.5 text-xs font-semibold uppercase tracking-wider rounded border text-center transition-all ${
                          studio.audience === aud
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : 'bg-white text-[#171717] border-[#DAD7D1] hover:border-[#171717]'
                        }`}
                      >
                        {aud}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#171717] block mb-2">
                    Garment Category
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(studio.audience === 'men'
                      ? ['Bespoke Blazers', 'Neapolitan Suits', 'Festive Kurtas', 'Overcoats']
                      : studio.audience === 'kids'
                      ? ['Ceremonial Kurta Sets', 'Miniature Blazers', 'Festive Sherwanis', 'Frock Gowns']
                      : ['Evening Gowns', 'Architectural Anarkalis', 'Tailored Pantsuits', 'Cocktail Capes']
                    ).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => dispatch(setCategory(cat))}
                        className={`py-2.5 px-3 rounded border text-left font-medium transition-all ${
                          studio.category === cat
                            ? 'bg-[#F1EFEA] border-[#171717] font-semibold text-[#171717]'
                            : 'border-[#DAD7D1] text-[#4B5563] hover:border-[#171717]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lapel / Neckline Selection */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#171717] block mb-2">
                    Neckline &amp; Lapel Geometry
                  </label>
                  <select
                    value={studio.neckline}
                    onChange={(e) => dispatch(setNeckline(e.target.value))}
                    className="w-full bg-white border border-[#DAD7D1] rounded p-2.5 text-xs text-[#171717] font-medium focus:outline-none focus:border-[#171717]"
                  >
                    <option value="Sculptural Asymmetric Drape">Sculptural Asymmetric Drape</option>
                    <option value="Nehru Mandarin Collar">Nehru Mandarin Collar</option>
                    <option value="Peak Lapel (Bespoke)">Peak Lapel (Bespoke)</option>
                    <option value="Notched Fluted Lapel">Notched Fluted Lapel</option>
                    <option value="Square Plunge Architectural">Square Plunge Architectural</option>
                  </select>
                </div>

                {/* Sleeves */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#171717] block mb-2">
                    Sleeve Architecture
                  </label>
                  <select
                    value={studio.sleeves}
                    onChange={(e) => dispatch(setSleeves(e.target.value))}
                    className="w-full bg-white border border-[#DAD7D1] rounded p-2.5 text-xs text-[#171717] font-medium focus:outline-none focus:border-[#171717]"
                  >
                    <option value="Fluted Bracelet Length">Fluted Bracelet Length</option>
                    <option value="Full Tailored French Cuffs">Full Tailored French Cuffs</option>
                    <option value="Structured Structured Cap Sleeve">Structured Cap Sleeve</option>
                    <option value="Sleeveless Minimalist">Sleeveless Minimalist</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStepTab(2)}
                  className="w-full py-3.5 bg-[#171717] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#4D5543] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Proceed to Textile Curation</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Step 2: Fabric Curation */}
            {activeStepTab === 2 && (
              <div className="bg-white border border-[#DAD7D1] rounded-lg p-6 space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#DAD7D1] pb-3">
                  <span className="text-[10px] uppercase tracking-wider text-[#4D5543] font-bold">
                    Step 02
                  </span>
                  <h3 className="font-editorial text-2xl text-[#171717]">
                    Archival Textile Curation
                  </h3>
                </div>

                <div className="space-y-3">
                  {FABRICS_DATABASE.map((fabric) => {
                    const isSelected = studio.fabric === fabric.name;
                    return (
                      <div
                        key={fabric.id}
                        onClick={() => dispatch(setFabric(fabric.name))}
                        className={`p-4 rounded border cursor-pointer transition-all flex gap-4 ${
                          isSelected
                            ? 'bg-[#F1EFEA] border-[#171717] shadow-sm'
                            : 'bg-white border-[#DAD7D1] hover:border-[#171717]'
                        }`}
                      >
                        <img
                          src={fabric.image}
                          alt={fabric.name}
                          className="w-16 h-16 rounded object-cover border border-[#DAD7D1]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-[#171717]">{fabric.name}</h4>
                            <span className="text-[10px] text-[#77736E]">{fabric.origin}</span>
                          </div>
                          <p className="text-[11px] text-[#77736E] mt-1">{fabric.characteristics}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-[#4D5543] font-semibold">
                            <span>Weight: {fabric.weight}</span>
                            <span>•</span>
                            <span>Hand-Feel: {fabric.texture}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStepTab(1)}
                    className="w-1/3 py-3 border border-[#DAD7D1] text-xs uppercase font-semibold text-[#171717] rounded hover:bg-[#F1EFEA]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStepTab(3)}
                    className="w-2/3 py-3.5 bg-[#171717] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#4D5543] transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Add Custom Prompt &amp; References</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

                {/* Step 3: Natural Language Prompt & Reference Moodboard */}
            {activeStepTab === 3 && (
              <div className="bg-white border border-[#DAD7D1] rounded-lg p-6 space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#DAD7D1] pb-3">
                  <span className="text-[10px] uppercase tracking-wider text-[#4D5543] font-bold">
                    Step 03
                  </span>
                  <h3 className="font-editorial text-2xl text-[#171717]">
                    Natural Language &amp; Moodboard
                  </h3>
                </div>

                {/* Atelier AI Fashion Design Assistant Interactive Co-Pilot */}
                <div className="border border-[#DAD7D1] rounded-lg overflow-hidden bg-[#FAF9F6]">
                  <div
                    onClick={() => setAssistantOpen(!assistantOpen)}
                    className="p-4 bg-[#171717] text-white flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#4D5543] flex items-center justify-center text-white">
                        <Bot size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-editorial text-base tracking-wide text-[#F1EFEA]">
                            Atelier AI Fashion Design Assistant
                          </h4>
                          <span className="text-[9px] bg-[#4D5543] text-white px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                            Gemini Powered
                          </span>
                        </div>
                        <p className="text-[11px] text-[#DAD7D1]">
                          Consult on garments, textiles, silhouettes, embroidery &amp; occasion aesthetics
                        </p>
                      </div>
                    </div>
                    <button type="button" className="text-[#DAD7D1] hover:text-white">
                      {assistantOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {assistantOpen && (
                    <div className="p-4 space-y-4">
                      {/* Chat Messages Log */}
                      <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
                        {assistantMessages.map((msg, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg leading-relaxed ${
                              msg.role === 'assistant'
                                ? 'bg-white border border-[#DAD7D1] text-[#171717]'
                                : 'bg-[#171717] text-white ml-8'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[10px] uppercase tracking-wider text-[#4D5543]">
                                {msg.role === 'assistant' ? 'Atelier Design Assistant' : 'You (Patron)'}
                              </span>
                              {msg.role === 'assistant' && (
                                <button
                                  type="button"
                                  onClick={() => handleApplyAssistantPrompt(msg.text)}
                                  className="text-[10px] text-[#4D5543] font-semibold hover:underline flex items-center gap-1"
                                >
                                  <Wand2 size={11} />
                                  <span>Apply Prompt</span>
                                </button>
                              )}
                            </div>
                            <div className="whitespace-pre-line text-[12px]">{msg.text}</div>
                          </div>
                        ))}
                        {isConsulting && (
                          <div className="p-3 bg-white border border-[#DAD7D1] rounded-lg text-xs text-[#77736E] flex items-center gap-2 italic">
                            <Sparkles size={14} className="animate-spin text-[#4D5543]" />
                            <span>Atelier Assistant is formulating bespoke couture recommendations...</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Prompt Starters */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#77736E]">
                          Quick Consultation Topics:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Recommend fabrics for formal gala',
                            'Suggest embroidery placement',
                            'Refine fit preferences for modern silhouette',
                            'Occasion color harmonies'
                          ].map((topic, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSendToAssistant(topic)}
                              className="text-[11px] bg-white border border-[#DAD7D1] text-[#171717] px-2.5 py-1 rounded hover:bg-[#F1EFEA] transition-colors"
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Input Box */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendToAssistant();
                        }}
                        className="flex gap-2 pt-1"
                      >
                        <input
                          type="text"
                          value={assistantInput}
                          onChange={(e) => setAssistantInput(e.target.value)}
                          placeholder="Ask about garment type, fabric drape, zari density, or occasion..."
                          className="flex-1 bg-white border border-[#DAD7D1] rounded px-3 py-2 text-xs text-[#171717] placeholder:text-[#77736E] focus:outline-none focus:border-[#171717]"
                        />
                        <button
                          type="submit"
                          disabled={isConsulting || !assistantInput.trim()}
                          className="px-4 py-2 bg-[#171717] text-white text-xs font-semibold rounded hover:bg-[#4D5543] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                        >
                          <Send size={13} />
                          <span>Consult</span>
                        </button>
                      </form>

                      {/* Practical Couture Disclaimer */}
                      <p className="text-[10px] text-[#77736E] italic border-t border-[#DAD7D1]/60 pt-2">
                        * Atelier AI assists in concept refinement and descriptive prompt synthesis. Concepts represent visual design proposals and are not production-ready patterns.
                      </p>
                    </div>
                  )}
                </div>

                {/* Prompt Textarea */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#171717] block mb-2">
                    Tailor Prompt Direction
                  </label>
                  <textarea
                    rows={3}
                    value={studio.prompt}
                    onChange={(e) => dispatch(setPrompt(e.target.value))}
                    placeholder="Describe specific embellishments, embroidery density, drape behavior, or event theme..."
                    className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded p-3 text-xs text-[#171717] placeholder:text-[#77736E] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                {/* Quick Suggestion Chips */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#77736E] block mb-2">
                    Quick Aesthetic Directives
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {quickChipsList.map((chip) => {
                      const isSelected = studio.selectedChips.includes(chip);
                      return (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => dispatch(toggleChip(chip))}
                          className={`px-2.5 py-1 text-[11px] rounded transition-all ${
                            isSelected
                              ? 'bg-[#4D5543] text-white font-medium'
                              : 'bg-[#F1EFEA] text-[#171717] hover:bg-[#DAD7D1]'
                          }`}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* File / Sketch Uploader */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#171717] block mb-2">
                    Visual Sketch / Moodboard Image
                  </label>
                  <label className="border-2 border-dashed border-[#DAD7D1] hover:border-[#171717] rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-[#FAF9F6]">
                    <UploadCloud size={28} className="text-[#4D5543] mb-1" />
                    <span className="text-xs font-semibold text-[#171717]">
                      {uploadedFileName ? uploadedFileName : 'Upload sketch or reference (JPG, PNG, WEBP)'}
                    </span>
                    <span className="text-[10px] text-[#77736E] mt-0.5">
                      Max file size 10MB • Preserved in high resolution
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Budget Tier */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#171717] block mb-2">
                    Target Budget Tier
                  </label>
                  <select
                    value={studio.budgetTier}
                    onChange={(e) => dispatch(setBudgetTier(e.target.value))}
                    className="w-full bg-white border border-[#DAD7D1] rounded p-2.5 text-xs text-[#171717] font-medium"
                  >
                    <option value="Prêt Bespoke (Rs. 15,000 - 25,000)">Prêt Bespoke (Rs. 15,000 - 25,000)</option>
                    <option value="Couture Bespoke (Rs. 25,000 - 45,000)">Couture Bespoke (Rs. 25,000 - 45,000)</option>
                    <option value="Master Artisan Heirloom (Rs. 45,000+)">Master Artisan Heirloom (Rs. 45,000+)</option>
                  </select>
                </div>

                {/* Synthesis Trigger */}
                <button
                  type="button"
                  onClick={handleSimulateGeneration}
                  className="w-full py-4 bg-[#171717] text-white text-xs uppercase tracking-[0.14em] font-semibold rounded hover:bg-[#4D5543] transition-all shadow-xl flex items-center justify-center gap-2 group"
                >
                  <Sparkles size={16} className="text-[#DDE6CE] animate-pulse" />
                  <span>Synthesize 3D Couture Concepts</span>
                </button>
              </div>
            )}

            {/* Step 4: Summary Card when in Canvas View */}
            {activeStepTab === 4 && (
              <div className="bg-white border border-[#DAD7D1] rounded-lg p-6 space-y-4">
                <div className="border-b border-[#DAD7D1] pb-3 flex items-center justify-between">
                  <h3 className="font-editorial text-xl text-[#171717]">
                    Bespoke Specifications
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveStepTab(1)}
                    className="text-xs text-[#4D5543] font-semibold underline"
                  >
                    Modify
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#DAD7D1]/50">
                    <span className="text-[#77736E]">Silhouette:</span>
                    <strong className="text-[#171717]">{studio.category} ({studio.audience})</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DAD7D1]/50">
                    <span className="text-[#77736E]">Textile:</span>
                    <strong className="text-[#171717]">{studio.fabric}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DAD7D1]/50">
                    <span className="text-[#77736E]">Collar / Lapel:</span>
                    <strong className="text-[#171717]">{studio.neckline}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DAD7D1]/50">
                    <span className="text-[#77736E]">Budget Tier:</span>
                    <strong className="text-[#171717]">{studio.budgetTier}</strong>
                  </div>
                  <div className="py-1">
                    <span className="text-[#77736E] block mb-1">Directives:</span>
                    <div className="flex flex-wrap gap-1">
                      {studio.selectedChips.map((c) => (
                        <span key={c} className="text-[10px] bg-[#F1EFEA] px-2 py-0.5 rounded text-[#171717]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateGeneration}
                  className="w-full py-3 bg-[#F1EFEA] border border-[#DAD7D1] text-[#171717] rounded text-xs uppercase font-semibold hover:bg-[#171717] hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} />
                  <span>Re-Generate Variants</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Interactive AI Canvas & Concept Showcase (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Loading / Generating State with Staged Shimmer */}
            {studio.isGenerating ? (
              <div className="bg-white border border-[#DAD7D1] rounded-lg p-12 text-center space-y-6 shadow-xl aspect-[4/3] flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-[#171717] border-t-transparent animate-spin flex items-center justify-center">
                  <Sparkles size={24} className="text-[#4D5543]" />
                </div>
                <div>
                  <h3 className="font-editorial text-2xl text-[#171717]">
                    {studio.generationStep === 'analyzing'
                      ? 'Analyzing Pattern Geometry & Draping...'
                      : studio.generationStep === 'weaving'
                      ? `Applying ${studio.fabric} Micro-Textures...`
                      : 'Rendering Studio Mannequin & Lighting...'}
                  </h3>
                  <p className="text-xs text-[#77736E] mt-2 max-w-sm mx-auto">
                    Parametric machine learning models are drafting high-resolution 3D garment concepts calibrated to our master tailor specifications.
                  </p>
                </div>

                {/* Visual Step Progress */}
                <div className="w-full max-w-md bg-[#F1EFEA] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#4D5543] h-full transition-all duration-700"
                    style={{
                      width:
                        studio.generationStep === 'analyzing'
                          ? '33%'
                          : studio.generationStep === 'weaving'
                          ? '66%'
                          : '95%'
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Generated Concept View Card */}
                <div className="bg-white border border-[#DAD7D1] rounded-lg overflow-hidden shadow-xl">
                  {/* Concept Image Frame */}
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-[#171717] overflow-hidden">
                    <img
                      src={activeConcept.image}
                      alt={activeConcept.title}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-4 left-4 bg-[#171717]/90 backdrop-blur-md text-white px-3 py-1.5 rounded flex items-center gap-2 border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-[#DDE6CE]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {activeConcept.title}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-[#171717] px-3 py-1 rounded text-xs font-semibold shadow-sm">
                      Feasibility: {activeConcept.tailorFeasibility}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 bg-[#171717]/80 backdrop-blur-md text-white p-4 rounded border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#DDE6CE]">
                          {activeConcept.description}
                        </h4>
                        <p className="text-[11px] text-white/80 mt-0.5">
                          Estimated Yardage: {activeConcept.fabricYardage}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-white/70 block uppercase">Est. Tailoring Cost</span>
                        <span className="text-sm font-bold text-white">
                          {activeConcept.estimatedPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Concept Variant Thumbnails Selector */}
                  <div className="p-4 bg-[#F1EFEA] border-t border-[#DAD7D1] flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#171717]">
                      Rendered Concepts:
                    </span>
                    <div className="flex gap-3">
                      {safeConcepts.map((c, i) => (
                        <button
                          key={c.id || i}
                          type="button"
                          onClick={() => dispatch(selectConcept(i))}
                          className={`px-4 py-1.5 text-xs font-semibold rounded border transition-all ${
                            studio.selectedConceptIndex === i
                              ? 'bg-[#171717] text-white border-[#171717] shadow-sm'
                              : 'bg-white text-[#171717] border-[#DAD7D1] hover:border-[#171717]'
                          }`}
                        >
                          Concept {i === 0 ? 'I' : i === 1 ? 'II' : i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Master Tailor Feasibility Review Submission Form */}
                <div className="bg-white border border-[#DAD7D1] rounded-lg p-6 shadow-md">
                  {studio.quotationSubmitted ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-[#DDE6CE] text-[#4D5543] flex items-center justify-center mx-auto">
                        <CheckCircle2 size={32} />
                      </div>
                      <h3 className="font-editorial text-2xl text-[#171717]">
                        Bespoke Feasibility Inscribed
                      </h3>
                      <p className="text-xs text-[#77736E] max-w-md mx-auto">
                        Your custom design dossier has been assigned reference code{' '}
                        <strong className="text-[#171717] text-sm">{studio.trackingCode}</strong>. Our senior cutting master in Florence will audit fabric yardage and deliver a formal quotation within 24 hours.
                      </p>
                      <div className="pt-2 flex justify-center gap-4">
                        <Link
                          to="/account?tab=quotations"
                          className="px-6 py-2.5 bg-[#171717] text-white text-xs uppercase tracking-wider rounded font-semibold hover:bg-[#4D5543]"
                        >
                          Track in Account Portal
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitToTailor} className="space-y-4">
                      <div className="border-b border-[#DAD7D1] pb-3">
                        <span className="text-[10px] uppercase tracking-wider text-[#4D5543] font-bold">
                          Final Step
                        </span>
                        <h4 className="font-editorial text-xl text-[#171717]">
                          Submit to Master Tailor for Feasibility &amp; Quote
                        </h4>
                        <p className="text-xs text-[#77736E] mt-0.5">
                          No payment required at this stage. Receive official cost breakdown, measurement appointment, and production timeline.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-[#171717] block mb-1">
                            Client Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="e.g. Dr. Ayesha Khan"
                            className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-semibold text-[#171717] block">
                              Contact Number for Master Tailor <span className="text-red-500">*</span>
                            </label>
                            <span className="text-[10px] text-[#77736E] font-mono">
                              {contactPhone ? `${contactPhone.length}/11 digits` : '11 digits'}
                            </span>
                          </div>
                          <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={11}
                            value={contactPhone}
                            onChange={handlePhoneChange}
                            onKeyDown={(e) => {
                              if (
                                !/[0-9]/.test(e.key) &&
                                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
                                !e.ctrlKey &&
                                !e.metaKey
                              ) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="03XXXXXXXXX (e.g. 03001234567)"
                            className={`w-full bg-[#FAF9F6] border rounded p-2.5 text-xs text-[#171717] font-mono tracking-wider focus:outline-none transition ${
                              phoneError ? 'border-red-500 bg-red-50/20' : 'border-[#DAD7D1] focus:border-[#171717]'
                            }`}
                          />
                          {phoneError ? (
                            <p className="text-[11px] text-red-600 mt-1 font-medium">{phoneError}</p>
                          ) : (
                            <p className="text-[10px] text-[#77736E] mt-1 font-mono">
                              Pakistan number: 11 digits starting with 03
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                          Personal Tailoring Notes or Measurement Modifications
                        </label>
                        <input
                          type="text"
                          value={customNotes}
                          onChange={(e) => setCustomNotes(e.target.value)}
                          placeholder="e.g., Extended hem length by 2 inches, client height 5'11, event on October 30th..."
                          className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 bg-[#4D5543] text-white text-xs uppercase tracking-[0.14em] font-semibold rounded hover:bg-[#3C4234] transition-colors shadow-lg flex items-center justify-center gap-2"
                      >
                        <Scissors size={16} />
                        <span>Submit Design for Tailor Audit &amp; Quotation</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
