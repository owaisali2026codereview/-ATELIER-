import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

export default function SizeGuideModal({ isOpen, onClose }) {
  const [unit, setUnit] = useState('cm'); // 'cm' | 'inches'
  const [tab, setTab] = useState('women'); // 'women' | 'men' | 'kids'

  if (!isOpen) return null;

  const womenData = [
    { size: 'XS (UK 6)', chest: unit === 'cm' ? '82-85' : '32-33.5', waist: unit === 'cm' ? '64-67' : '25-26.5', hips: unit === 'cm' ? '90-93' : '35.5-36.5' },
    { size: 'S (UK 8)', chest: unit === 'cm' ? '86-89' : '34-35', waist: unit === 'cm' ? '68-71' : '27-28', hips: unit === 'cm' ? '94-97' : '37-38' },
    { size: 'M (UK 10)', chest: unit === 'cm' ? '90-94' : '35.5-37', waist: unit === 'cm' ? '72-76' : '28.5-30', hips: unit === 'cm' ? '98-102' : '38.5-40' },
    { size: 'L (UK 12)', chest: unit === 'cm' ? '95-100' : '37.5-39.5', waist: unit === 'cm' ? '77-82' : '30.5-32.5', hips: unit === 'cm' ? '103-108' : '40.5-42.5' },
    { size: 'XL (UK 14)', chest: unit === 'cm' ? '101-107' : '40-42', waist: unit === 'cm' ? '83-89' : '33-35', hips: unit === 'cm' ? '109-115' : '43-45' }
  ];

  const menData = [
    { size: '38 (S)', chest: unit === 'cm' ? '96-99' : '38-39', waist: unit === 'cm' ? '80-83' : '31.5-32.5', neck: unit === 'cm' ? '38' : '15' },
    { size: '40 (M)', chest: unit === 'cm' ? '100-104' : '40-41', waist: unit === 'cm' ? '84-88' : '33-34.5', neck: unit === 'cm' ? '39.5' : '15.5' },
    { size: '42 (L)', chest: unit === 'cm' ? '105-109' : '42-43', waist: unit === 'cm' ? '89-93' : '35-36.5', neck: unit === 'cm' ? '41' : '16' },
    { size: '44 (XL)', chest: unit === 'cm' ? '110-115' : '44-45', waist: unit === 'cm' ? '94-99' : '37-39', neck: unit === 'cm' ? '42.5' : '16.7' },
    { size: '46 (XXL)', chest: unit === 'cm' ? '116-121' : '46-47.5', waist: unit === 'cm' ? '100-106' : '39.5-41.5', neck: unit === 'cm' ? '44' : '17.3' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#171717]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl max-w-2xl w-full p-4 sm:p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[92vh] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#DAD7D1]">
          <div className="flex items-center gap-2">
            <Ruler size={18} className="text-[#4D5543] shrink-0" />
            <h3 className="font-editorial text-lg sm:text-2xl text-[#171717] leading-tight">
              Atelier Sizing Calibration
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#77736E] hover:text-[#171717] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls: Department & Unit Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex rounded border border-[#DAD7D1] bg-[#F1EFEA] p-0.5">
            {['women', 'men', 'kids'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
                  tab === item
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'text-[#4B5563] hover:text-[#171717]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#77736E]">Measurement Units:</span>
            <div className="flex rounded border border-[#DAD7D1] bg-[#F1EFEA] p-0.5">
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  unit === 'cm' ? 'bg-[#171717] text-white' : 'text-[#4B5563]'
                }`}
              >
                Metric (cm)
              </button>
              <button
                type="button"
                onClick={() => setUnit('inches')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  unit === 'inches' ? 'bg-[#171717] text-white' : 'text-[#4B5563]'
                }`}
              >
                Imperial (in)
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#DAD7D1] rounded bg-white my-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1EFEA] border-b border-[#DAD7D1] text-[#171717] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Standard Size</th>
                <th className="py-3 px-4 font-semibold">Chest / Bust ({unit})</th>
                <th className="py-3 px-4 font-semibold">Waist ({unit})</th>
                <th className="py-3 px-4 font-semibold">
                  {tab === 'men' ? `Collar (${unit})` : `Hips (${unit})`}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DAD7D1]/50">
              {(tab === 'men' ? menData : womenData).map((row) => (
                <tr key={row.size} className="hover:bg-[#FAF9F6] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#171717]">{row.size}</td>
                  <td className="py-3 px-4 text-[#4B5563]">{row.chest}</td>
                  <td className="py-3 px-4 text-[#4B5563]">{row.waist}</td>
                  <td className="py-3 px-4 text-[#4B5563]">{row.hips || row.neck}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tailor Tip */}
        <div className="bg-[#F1EFEA] border border-[#DAD7D1] p-3 rounded text-xs text-[#77736E] flex items-start gap-2.5">
          <span className="text-[#4D5543] font-bold text-sm">✦</span>
          <div>
            <strong className="text-[#171717]">Bespoke Customization Guarantee:</strong> If your measurements fall between standard gradings, our master tailors calibrate individual pattern blocks with zero surcharge within the AI Custom Studio.
          </div>
        </div>
      </div>
    </div>
  );
}
