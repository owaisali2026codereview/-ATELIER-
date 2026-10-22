import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { JOURNAL_DISPATCHES } from '../data/mockData';
import { ArrowRight, BookOpen, X, Sparkles, Clock, Share2, Check } from 'lucide-react';

const ESSAY_FULL_CONTENT = {
  'memory-of-fibers': {
    lead: 'Wooden shuttle looms possess a tactile memory that modern air-jet looms can neither comprehend nor emulate.',
    body: [
      'Deep in Okayama prefecture, vintage Toyoda G3 automatic shuttle looms produce a rhythmic mechanical cadence that reverberates through the valley floor. Built in the mid-20th century, these cast-iron machines handle yarn at gentle tensions that allow each natural cotton and wool filament to retain its idiosyncratic irregularities and breathability.',
      'Unlike high-speed modern industrial looms which stretch synthetic yarns beyond their relaxed elasticity, low-tension shuttle weaving yields a dimensional selvedge edge and subtle slub texture that breathes dynamically with humidity and ambient temperature.',
      'When our master tailors draft an unstructured sports jacket or bespoke trousers, these heirloom textiles adapt to the patron’s gait with an organic drape. Modern algorithmic generative studios can optimize tension maps, but it is this tactile heritage weave that imparts a timeless, heirloom weight to every commissioned silhouette.',
    ],
    pullQuote: 'A machine with human imperfections crafts garments that age gracefully alongside the gentleman.',
    fabricFocus: '100% Selvedge Combed Cotton & Unprocessed Worsted Merino Yarn',
  },
  'floating-canvas-architecture': {
    lead: 'A garment’s soul resides not in its outer shell, but in the unseen floating canvas sewn between its lining and exterior cloth.',
    body: [
      'In ready-to-wear fast fashion, jackets are glued together with chemical fusible adhesives. Within months of dry-cleaning, bubbles form, lapels buckle, and the garment loses its structural breathability.',
      'In contrast, the Atelier floating canvas is constructed from unbleached horsehair woven with natural linen and wool. Suspended by thousands of invisible hand-pad stitches, the canvas floats freely between the cloth, responding directly to the natural heat and contours of the patron’s torso.',
      'Over dozens of wears, this living canvas subtly molds into a bespoke architectural breastplate unique to the wearer. The lapel roll curves with three-dimensional springback, never flattening or separating.',
    ],
    pullQuote: 'True sartorial luxury is entirely three-dimensional: it breathes, softens, and conforms like a second skin.',
    fabricFocus: 'Siberian Horsehair & Irish Linen Interfacing Matrix',
  },
  'julien-vane-interview': {
    lead: 'The future of haute couture does not replace the artisan; it equips the artisan with algorithmic clairvoyance.',
    body: [
      'In our conversation with Creative Director Julien Vane, the discussion centered on the revival of South Asian Zardozi embroidery—a centuries-old craft of sewing real metallic threads onto silk velvet—alongside parametric neural networks.',
      '"For centuries," Vane notes, "bespoke patrons waited months for hand-painted gouache sketches before a single thread was dyed. Today, a patron in London or Dubai can input their silhouette preferences into our AI Custom Studio, generating three-dimensional photorealistic concepts in seconds."',
      '"Yet, the final garment is delivered to real master tailors in Lahore and Karachi who wield the needle with generational intuition. AI serves as the collaborative drafting instrument, while the human touch delivers the heirloom soul."',
    ],
    pullQuote: 'Algorithmic speed gives the artisan the gift of time to focus solely on flawless hand-finishing.',
    fabricFocus: 'Pure Mulberry Silk Velvet & 24K Gold-Dipped Resham Threadwork',
  },
};

export default function JournalPage() {
  const [selectedStory, setSelectedStory] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleOpenEssay = (story) => {
    setSelectedStory(story);
  };

  const handleCloseEssay = () => {
    setSelectedStory(null);
    setCopiedLink(false);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const essayData = selectedStory ? ESSAY_FULL_CONTENT[selectedStory.id] : null;

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="pb-8 border-b border-[#DAD7D1]">
          <span className="text-[11px] uppercase tracking-[0.16em] text-[#4D5543] font-semibold">
            Maison Dispatches
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl text-[#171717] mt-1 uppercase tracking-tight">
            The Atelier Journal
          </h1>
          <p className="text-xs text-[#77736E] mt-2 max-w-xl leading-relaxed">
            Essays on historical textile provenance, artisanal loom preservation, and the intersection of algorithmic craft with human sartorial mastery.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
          {JOURNAL_DISPATCHES.map((story) => (
            <article
              key={story.id}
              onClick={() => handleOpenEssay(story)}
              className="bg-white border border-[#DAD7D1] rounded overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#171717]">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 bg-[#FAF9F6]/95 backdrop-blur-sm text-[#171717] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded">
                  {story.volume}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-[#77736E]">{story.readTime}</span>
                  <h3 className="font-editorial text-xl text-[#171717] mt-2 group-hover:text-[#4D5543] transition-colors leading-snug">
                    {story.title}
                  </h3>
                  <p className="text-xs text-[#77736E] mt-3 leading-relaxed">
                    {story.excerpt}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#DAD7D1]/50 flex items-center justify-between text-xs">
                  <span className="text-[#171717] font-medium">{story.author}</span>
                  <span className="text-[#4D5543] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read Essay</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Editorial Reader Modal */}
      {selectedStory && essayData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#171717]/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#FAF9F6] border border-[#DAD7D1] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* Modal Header Controls */}
            <div className="sticky top-0 z-20 bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-[#DAD7D1] px-6 py-4 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4D5543]">
                {selectedStory.volume}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-1.5 text-[#77736E] hover:text-[#171717] transition-colors rounded-full hover:bg-[#F1EFEA]"
                  title="Copy link"
                >
                  {copiedLink ? <Check size={16} className="text-[#35664A]" /> : <Share2 size={16} />}
                </button>
                <button
                  type="button"
                  onClick={handleCloseEssay}
                  className="p-1.5 text-[#77736E] hover:text-[#171717] transition-colors rounded-full hover:bg-[#F1EFEA]"
                  aria-label="Close reader"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Essay Hero */}
            <div className="relative aspect-[16/9] w-full bg-[#171717]">
              <img
                src={selectedStory.image}
                alt={selectedStory.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                <div className="flex items-center gap-3 text-xs text-stone-300 mb-2">
                  <span>{selectedStory.author}</span>
                  <span>•</span>
                  <span>{selectedStory.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {selectedStory.readTime}
                  </span>
                </div>
                <h2 className="font-editorial text-2xl sm:text-4xl text-white leading-tight">
                  {selectedStory.title}
                </h2>
              </div>
            </div>

            {/* Essay Content Body */}
            <div className="p-6 sm:p-10 space-y-6">
              <p className="text-sm sm:text-base font-editorial italic text-[#171717] leading-relaxed border-l-2 border-[#4D5543] pl-4">
                {essayData.lead}
              </p>

              {essayData.body.map((paragraph, index) => (
                <p key={index} className="text-xs sm:text-sm text-[#4A4744] leading-relaxed font-sans">
                  {paragraph}
                </p>
              ))}

              {/* Editorial Pull Quote */}
              <div className="my-8 py-6 px-8 bg-[#F1EFEA] border-y border-[#DAD7D1] text-center">
                <blockquote className="font-editorial text-lg sm:text-xl text-[#171717] italic">
                  "{essayData.pullQuote}"
                </blockquote>
                <span className="block mt-2 text-[10px] uppercase tracking-widest text-[#77736E] font-semibold">
                  Maison Sartorial Principles
                </span>
              </div>

              {/* Textile Provenance Box */}
              <div className="bg-white border border-[#DAD7D1] rounded-xl p-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4D5543]">
                  Featured Provenance
                </span>
                <p className="text-xs text-[#171717] font-semibold">
                  {essayData.fabricFocus}
                </p>
                <p className="text-[11px] text-[#77736E]">
                  All archival fabrics featured in this dispatch can be requested directly in our AI Bespoke Studio for private tailored commissions.
                </p>
              </div>

              {/* Action Callout */}
              <div className="pt-4 border-t border-[#DAD7D1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Link
                  to="/custom-studio"
                  onClick={handleCloseEssay}
                  className="px-6 py-3 bg-[#171717] hover:bg-black text-white text-xs uppercase tracking-wider font-semibold rounded transition flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>Commission Garment Inspired by Essay</span>
                </Link>
                <button
                  type="button"
                  onClick={handleCloseEssay}
                  className="px-4 py-3 border border-[#DAD7D1] text-xs font-semibold text-[#77736E] hover:text-[#171717] rounded text-center"
                >
                  Close Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
