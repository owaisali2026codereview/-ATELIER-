import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { useGetWishlistQuery, useToggleWishlistMutation } from '../store/api/apiSlice';
import { Plus, ArrowRight, Check, Heart } from 'lucide-react';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const productId = product._id || product.slug || product.id;
  const productImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'];

  const normalizedColors = Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors.map((c) =>
        typeof c === 'string'
          ? { name: c, hex: '#171717', image: productImages[0] }
          : { ...c, image: c.image || productImages[0] }
      )
    : [{ name: 'Standard', hex: '#171717', image: productImages[0] }];

  const normalizedSizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes.map((s) => (typeof s === 'string' ? s : s.size || 'M'))
    : ['S', 'M', 'L', 'XL'];

  const [selectedColor, setSelectedColor] = useState(normalizedColors[0]);
  const [showQuickSize, setShowQuickSize] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('atelier_token') : null;
  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !token });
  const [toggleWishlistMutation] = useToggleWishlistMutation();

  const [localWishlist, setLocalWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
    } catch (e) {
      return [];
    }
  });

  const isWishlisted = useMemo(() => {
    const rawId = (product._id || product.id || product.slug || '').toString();
    if (token && wishlistData?.data && Array.isArray(wishlistData.data)) {
      return wishlistData.data.some((item) => (item._id || item.id || item.slug || item).toString() === rawId);
    }
    return localWishlist.some((item) => (item._id || item.id || item.slug || item).toString() === rawId);
  }, [token, wishlistData, localWishlist, product]);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rawId = product._id || product.id || product.slug;
    const targetObj = {
      _id: product._id || product.id,
      id: product.id || product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      fabric: product.fabric,
      images: productImages,
      colors: normalizedColors,
      sizes: normalizedSizes,
      badge: product.badge,
    };

    try {
      const stored = JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
      const exists = stored.some((item) => (item._id || item.id || item.slug || item).toString() === rawId.toString());
      let updated;
      if (exists) {
        updated = stored.filter((item) => (item._id || item.id || item.slug || item).toString() !== rawId.toString());
      } else {
        updated = [targetObj, ...stored];
      }
      localStorage.setItem('atelier_wishlist', JSON.stringify(updated));
      setLocalWishlist(updated);
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      // ignore
    }

    if (token && (product._id || product.id)) {
      try {
        await toggleWishlistMutation(product._id || product.id).unwrap();
      } catch (err) {
        // ignore
      }
    }
  };

  const handleQuickAdd = (size) => {
    dispatch(
      addToCart({
        id: productId,
        name: product.name,
        price: product.price,
        size,
        color: selectedColor.name,
        image: selectedColor.image || productImages[0],
        badge: product.badge,
      })
    );
    setShowQuickSize(false);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <div className="group flex flex-col bg-[#FAF9F6] border border-[#DAD7D1]/70 rounded p-3 transition-all duration-300 hover:shadow-xl hover:border-[#171717]/40 relative">
      {/* 3:4 Image Frame */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded bg-[#F1EFEA]">
        <Link to={`/product/${product.slug || productId}`} className="block w-full h-full">
          <img
            src={selectedColor.image || productImages[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.badge && (
            <span className="bg-[#FAF9F6]/95 backdrop-blur-sm text-[#171717] text-[10px] uppercase font-bold tracking-[0.1em] px-2.5 py-1 rounded shadow-sm border border-[#DAD7D1]/60">
              {product.badge}
            </span>
          )}
          {product.isSale && (
            <span className="bg-[#B33A32] text-white text-[10px] uppercase font-bold tracking-[0.1em] px-2 py-0.5 rounded shadow-sm">
              Archival Sale
            </span>
          )}
        </div>

        {/* Wishlist Heart Trigger */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm z-10 ${
            isWishlisted
              ? 'bg-[#171717] text-[#E11D48] scale-105'
              : 'bg-white/80 backdrop-blur-sm text-[#77736E] hover:text-[#E11D48] hover:bg-white'
          }`}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
          title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <Heart size={14} fill={isWishlisted ? '#E11D48' : 'none'} className={isWishlisted ? 'stroke-[#E11D48]' : 'stroke-current'} />
        </button>

        {/* Quick Add Button / Trigger */}
        <button
          type="button"
          onClick={() => setShowQuickSize(!showQuickSize)}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#171717] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md hover:bg-[#4D5543]"
          aria-label="Quick Add to Bag"
        >
          {addedNotice ? <Check size={18} /> : <Plus size={18} />}
        </button>

        {/* Quick Size Overlay Drawer */}
        {showQuickSize && (
          <div className="absolute inset-x-0 bottom-0 bg-[#FAF9F6]/95 backdrop-blur-md p-4 border-t border-[#DAD7D1] animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#171717]">
                Select Fit / Size
              </span>
              <button
                type="button"
                onClick={() => setShowQuickSize(false)}
                className="text-[11px] text-[#77736E] hover:text-[#171717]"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {normalizedSizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleQuickAdd(sz)}
                  className="py-1.5 px-1 bg-white border border-[#DAD7D1] rounded text-[10px] font-medium text-[#171717] hover:bg-[#171717] hover:text-white transition-all text-center"
                >
                  {typeof sz === 'string' ? sz.split(' ')[0] : sz}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Meta & Info */}
      <div className="pt-4 pb-2 px-1 flex flex-col flex-1">
        {/* Color swatches */}
        <div className="flex items-center gap-2 mb-2">
          {normalizedColors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setSelectedColor(c)}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                selectedColor.name === c.name
                  ? 'ring-2 ring-offset-1 ring-[#171717] scale-110'
                  : 'border-[#DAD7D1] hover:scale-105'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
          <span className="text-[11px] text-[#77736E] ml-1">
            {selectedColor.name}
          </span>
        </div>

        {/* Title */}
        <Link
          to={`/product/${product.slug || productId}`}
          className="text-sm font-medium text-[#171717] hover:text-[#4D5543] transition-colors leading-snug line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Subtitle / Specs */}
        <p className="text-[11px] text-[#77736E] mt-1 line-clamp-1">

          {product.subtitle}
        </p>

        {/* Price & Action Row */}
        <div className="mt-3 pt-3 border-t border-[#DAD7D1]/50 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-[#171717]">
              Rs. {product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-[#77736E] line-through">
                Rs. {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.slug || productId || product.id}`}
            className="text-[11px] uppercase tracking-wider font-semibold text-[#4D5543] hover:text-[#171717] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Inspect</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
