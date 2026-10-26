import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { useGetProductsQuery } from '../store/api/apiSlice';
import { MOCK_PRODUCTS } from '../data/mockData';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');

  const { data: productsData, isFetching } = useGetProductsQuery(
    { search: query.trim() },
    { skip: !query.trim() }
  );

  if (!isOpen) return null;

  // Backend returned catalog items
  const backendProducts = Array.isArray(productsData?.data) ? productsData.data : [];

  // Mock catalog fallback for search
  const mockFiltered = query.trim()
    ? MOCK_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          (p.department && p.department.toLowerCase().includes(query.toLowerCase())) ||
          (p.fabric && p.fabric.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  // Deduplicate between backend products and mock products
  const combined = [...backendProducts];
  mockFiltered.forEach((mockItem) => {
    const isDuplicate = combined.some(
      (b) =>
        (b._id && b._id.toString() === mockItem.id.toString()) ||
        b.name?.toLowerCase().trim() === mockItem.name?.toLowerCase().trim()
    );
    if (!isDuplicate) {
      combined.push(mockItem);
    }
  });

  const filtered = query.trim() ? combined : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 px-2.5 sm:px-4 bg-[#171717]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl max-w-2xl w-full p-3.5 sm:p-6 shadow-2xl overflow-hidden relative">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-[#DAD7D1]">
          {isFetching ? (
            <Loader2 size={20} className="text-[#4D5543] animate-spin shrink-0" />
          ) : (
            <Search size={20} className="text-[#4D5543] shrink-0" />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search archival suits, silk gowns, fabrics..."
            autoFocus
            className="w-full bg-transparent text-sm sm:text-base text-[#171717] placeholder:text-[#77736E] focus:outline-none font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-[#77736E] hover:text-[#171717] px-1"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#77736E] hover:text-[#171717] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        {!query && (
          <div className="py-6">
            <span className="text-[10px] uppercase tracking-wider text-[#77736E] font-semibold block mb-3">
              Suggested Curations
            </span>
            <div className="flex flex-wrap gap-2">
              {['Oxford Shirts', 'Resham Lawn', 'Unstructured Blazers', 'Selvedge Denim', 'Changthangi Cashmere', 'Miniature Kurta'].map(
                (tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 bg-[#F1EFEA] hover:bg-[#171717] hover:text-white transition-colors rounded text-xs text-[#171717]"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
          <div className="py-4 max-h-96 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#77736E] font-semibold block">
                {filtered.length} Artifacts Found
              </span>
              {isFetching && (
                <span className="text-[10px] text-[#77736E] italic">Searching atelier index...</span>
              )}
            </div>

            {filtered.length === 0 && !isFetching ? (
              <p className="text-xs text-[#77736E] py-6 text-center">
                No matching garments found for "{query}". You can co-create this piece directly in our AI Custom Studio.
              </p>
            ) : (
              filtered.map((item) => {
                const itemId = item._id || item.id || item.slug;
                const itemImg = (Array.isArray(item.images) && item.images[0]) || item.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80';
                const itemPrice = typeof item.price === 'number' ? item.price : Number(item.price) || 0;

                return (
                  <Link
                    key={itemId}
                    to={`/product/${itemId}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2 rounded hover:bg-[#F1EFEA] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={itemImg}
                        alt={item.name}
                        className="w-12 h-14 object-cover rounded bg-[#F1EFEA]"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-[#171717] group-hover:text-[#4D5543] transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-[#77736E]">{item.fabric || item.category || 'Atelier Exclusive'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#171717]">
                        Rs. {itemPrice.toLocaleString()}
                      </span>
                      <ArrowRight size={14} className="text-[#77736E] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
