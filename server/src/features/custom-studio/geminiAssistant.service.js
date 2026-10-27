import { GoogleGenAI } from '@google/genai';

const getApiKey = () => {
  return (
    process.env.GEMMI_AI_API ||
    process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API
  );
};

const SYSTEM_INSTRUCTION = `You are Atelier AI's Fashion Design Assistant.

Your purpose is to help customers describe and refine
clothing design concepts.

Ask for missing information when necessary.
Consider garment type, color, fabric, embroidery,
fit preferences, occasion, and reference images.

Return clear, practical design suggestions.
Never claim that a concept is a production-ready pattern.
Do not invent fabric availability, prices, or delivery dates.

Tone & Style:
- Warm, polite, elegant, and expert in haute couture and sartorial craftsmanship.
- Format recommendations with clean markdown bullet points (e.g., Silhouette, Fabric Choice, Embroidery / Ornamentation, Styling Advice).
- Always provide a concise "Recommended Generation Prompt" that the customer can use directly in the Atelier AI Visual Canvas.`;

/**
 * Multi-turn chat consultation with the Atelier AI Fashion Design Assistant
 */
export const consultDesignAssistant = async ({ message, history = [], currentDesignState = {} }) => {
  const apiKey = getApiKey();

  // Construct context regarding what the user currently has selected in the studio
  let stateContext = '';
  if (currentDesignState && Object.keys(currentDesignState).length > 0) {
    stateContext = `\n[Customer's Current Studio State: Audience=${currentDesignState.audience || 'Not set'}, Category=${currentDesignState.category || 'Not set'}, Silhouette=${currentDesignState.silhouette || 'Not set'}, Fabric=${currentDesignState.fabric?.name || currentDesignState.fabric || 'Not set'}, Neckline=${currentDesignState.neckline || 'Not set'}, Sleeves=${currentDesignState.sleeves || 'Not set'}, Target Budget=${currentDesignState.budgetTier || 'Not set'}]\n`;
  }

  // 1. Try official @google/genai SDK
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      // Build conversation contents
      const formattedInput = `${stateContext}Customer message: ${message}`;

      const response = await ai.interactions.create({
        model: 'gemini-3.8-flash',
        input: formattedInput,
        system_instruction: SYSTEM_INSTRUCTION,
      });

      const reply = response.output_text;
      if (reply) {
        return {
          reply,
          provider: 'gemini-3.8-flash',
        };
      }
    } catch (sdkError) {
      console.warn('[Gemini SDK Error, falling back to REST endpoint]:', sdkError.message);

      // 2. Direct REST Fallback
      try {
        const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const restResponse = await fetch(restUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${stateContext}\nCustomer query: ${message}` }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          }),
        });

        if (restResponse.ok) {
          const data = await restResponse.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return {
              reply: text,
              provider: 'gemini-2.5-flash-rest',
            };
          }
        }
      } catch (restError) {
        console.warn('[Gemini REST Fallback Error]:', restError.message);
      }
    }
  }

  // 3. High-Quality Sartorial Fallback if API key is unconfigured or rate-limited
  return {
    reply: generateExpertSartorialFallback(message, currentDesignState),
    provider: 'atelier-sartorial-copilot',
  };
};

/**
 * Refines client design parameters into 3 haute couture concept variants using Gemini intelligence
 */
export const refineConceptsWithAI = async (parameters) => {
  const apiKey = getApiKey();
  const { audience, category, silhouette, fabric, prompt, appliedChips } = parameters;
  const fabricName = fabric?.name || 'Mulberry Silk Charmeuse';
  const silhouetteName = silhouette || 'Fluid Architectural Silhouette';

  let customPromptGuidance = prompt || 'Timeless couture evening piece with hand-draped fluid folds.';

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const analysisPrompt = `Given this customer clothing specification:
- Audience: ${audience || 'Women'}
- Category: ${category || 'Evening Gown'}
- Silhouette: ${silhouetteName}
- Selected Fabric: ${fabricName}
- Accent Chips: ${(appliedChips || []).join(', ')}
- Customer Vision: "${customPromptGuidance}"

Generate 3 distinct couture concept variants formatted as JSON:
[
  {
    "id": "concept-1",
    "title": "Variant I — Sovereign Architectural Blueprint",
    "description": "2-3 sentences explaining silhouette, drape, and structural darting.",
    "badge": "Master Tailor Recommendation"
  },
  {
    "id": "concept-2",
    "title": "Variant II — Fluid Bias-Cut Interpretation",
    "description": "2-3 sentences on fluid movement, necklines, and sleeve construction.",
    "badge": "Runway Capsule Edit"
  },
  {
    "id": "concept-3",
    "title": "Variant III — Minimalist Modernist Redirection",
    "description": "2-3 sentences on clean lines, concealed hardware, and textile purity.",
    "badge": "Archival Focus"
  }
]
Return ONLY raw JSON.`;

      const response = await ai.interactions.create({
        model: 'gemini-3.8-flash',
        input: analysisPrompt,
        system_instruction: SYSTEM_INSTRUCTION,
      });

      const text = response.output_text;
      const cleanJsonMatch = text.match(/\[[\s\S]*\]/);
      if (cleanJsonMatch) {
        const parsed = JSON.parse(cleanJsonMatch[0]);
        // Attach photorealistic high-fashion visual assets
        const curatedVisuals = [
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
        ];

        return parsed.map((item, idx) => ({
          ...item,
          imageUrl: curatedVisuals[idx % curatedVisuals.length],
        }));
      }
    } catch (err) {
      console.warn('[Gemini Concept Generation Fallback]:', err.message);
    }
  }

  // Graceful fallback concepts
  return [
    {
      id: 'concept-1',
      title: 'Variant I — Sovereign Architectural Blueprint',
      description: `Structured ${silhouetteName} articulated in ${fabricName}. Engineered with razor-sharp hand-rolled edges, internal silk boning, and precise seam balance.`,
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

function generateExpertSartorialFallback(message, state) {
  const lower = message.toLowerCase();
  const fabric = state?.fabric?.name || 'heritage silk or wool';
  const silhouette = state?.silhouette || 'structured evening silhouette';

  if (lower.includes('fabric') || lower.includes('textile') || lower.includes('material')) {
    return `### Atelier Textile Consultation

For a refined **${silhouette}**, here are practical fabric suggestions to consider:

* **100% Mulberry Silk Charmeuse (22 Momme):** Ideal for liquid, fluid drapes and evening galas. It possesses a subtle luminous sheen and soft weight.
* **Heavyweight Irish Flax Linen (380gsm):** Excellent for structured, breathable daytime tailoring with rich textural slub.
* **Grade-A Mongolian Cashmere (420gsm):** Unrivaled softness and insulating drape for outerwear and transitional coats.

*Note: As an Atelier design assistant, I do not confirm live mill inventory or set fabric pricing—our master tailors will confirm exact bolt yardage upon feasibility review.*

**Recommended Generation Prompt:**
> "Floor-length evening gown crafted in heavyweight 22-momme Mulberry silk charmeuse, natural fluid drape, muted champagne luster, minimalist seamlines."`;
  }

  if (lower.includes('embroidery') || lower.includes('pattern') || lower.includes('work')) {
    return `### Embroidery & Embellishment Direction

To elevate your bespoke concept with authentic craftsmanship:

* **Resham Threadwork:** Delicate hand-loomed silk floss embroidery along the neckline or cuffs, offering subtle tone-on-tone relief without stiffening the drape.
* **Antique Zardozi & Gota Edging:** Structured metallic ribboning ideal for ceremonial necklines and festive waistbands.
* **Minimalist Seam Reinforcement:** Omitting surface embroidery in favor of double-needle saddle stitching for modern architectural elegance.

**Recommended Generation Prompt:**
> "Structured couture silhouette with delicate tonal Resham floral vine embroidery along the asymmetric neckline, hand-finished French seams."`;
  }

  return `### Atelier AI Design Recommendations

Thank you for sharing your design vision. To refine this into a stunning couture piece:

1. **Silhouette & Fit:** A **${silhouette}** will flatter natural posture while preserving ease of movement. Ensure seam darts are calibrated to your natural waist.
2. **Textile Suggestion:** We recommend pairing this with **${fabric}** for balanced weight and structural memory.
3. **Hardware & Accents:** Concealed lateral zipper closures and hand-rolled hems will keep the visual silhouette clean and unobstructed.

*Design Reminder: This concept serves as an artistic design blueprint for master tailor review, rather than a production pattern.*

**Recommended Generation Prompt:**
> "${silhouette} in luxurious ${fabric}, dramatic asymmetric drape, clean tailored lines, elegant monochromatic color palette."`;
}
