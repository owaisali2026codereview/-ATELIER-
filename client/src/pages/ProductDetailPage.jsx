import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import {
  useGetProductByIdQuery,
  useGetProductsQuery,
  useGetProductReviewsQuery,
  useCreateProductReviewMutation,
} from '../store/api/apiSlice';
import ProductCard from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../data/mockData';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ruler,
  ShoppingBag,
  Sparkles,
  Check,
  ShieldAlert,
  Truck,
  Scissors,
  Loader2,
  ArrowLeft,
  Star,
  MessageSquare,
  Send,
  CheckCircle2,
} from 'lucide-react';

export default function ProductDetailPage({ onOpenSizeGuide }) {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [catalogTick, setCatalogTick] = useState(0);

  // Real-time synchronization listener for Admin CRUD actions
  useEffect(() => {
    let bc = null;
    const triggerSync = () => setCatalogTick((t) => t + 1);

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('atelier_live_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'CATALOG_UPDATED') triggerSync();
        };
      }
    } catch (e) {}

    const handleStorage = (e) => {
      if (
        e.key === 'atelier_product_catalog_sync' ||
        e.key === 'atelier_local_products' ||
        e.key === 'atelier_deleted_product_ids'
      ) {
        triggerSync();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('atelier_catalog_change', triggerSync);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('atelier_catalog_change', triggerSync);
    };
  }, []);

  const { data: apiResponse, isLoading, isError, refetch: refetchProduct } = useGetProductByIdQuery(id, {
    pollingInterval: 3000,
    skip: !id || id === 'undefined',
  });

  const { data: allProductsRes, refetch: refetchAllProducts } = useGetProductsQuery({}, {
    pollingInterval: 4000,
  });

  useEffect(() => {
    if (catalogTick > 0) {
      refetchProduct?.();
      refetchAllProducts?.();
    }
  }, [catalogTick, refetchProduct, refetchAllProducts]);

  // Check if product was deleted by admin
  const isDeleted = useMemo(() => {
    try {
      const deletedIds = JSON.parse(localStorage.getItem('atelier_deleted_product_ids') || '[]');
      return deletedIds.includes(id);
    } catch (e) {
      return false;
    }
  }, [id, catalogTick]);

  // Merge backend data with catalog cache, static archive, and local storage updates
  const product = useMemo(() => {
    if (isDeleted) return null;

    // 1. Direct single product response from backend API
    let base = apiResponse?.data ? { ...apiResponse.data } : null;

    // 2. Fallback to matching item in full products list from backend
    if (!base && allProductsRes?.data && Array.isArray(allProductsRes.data)) {
      const foundInCatalog = allProductsRes.data.find(
        (p) =>
          (p._id && p._id.toString() === id) ||
          (p.id && p.id.toString() === id) ||
          (p.slug && p.slug === id)
      );
      if (foundInCatalog) {
        base = { ...foundInCatalog };
      }
    }

    // 3. Fallback to static archive MOCK_PRODUCTS
    if (!base && Array.isArray(MOCK_PRODUCTS)) {
      const foundMock = MOCK_PRODUCTS.find(
        (p) =>
          p.id === id ||
          p.slug === id ||
          (p._id && p._id.toString() === id)
      );
      if (foundMock) {
        base = {
          ...foundMock,
          _id: foundMock.id,
          rawId: foundMock.id,
          slug: foundMock.slug || foundMock.id,
        };
      }
    }

    // 4. Merge local modifications or newly created products by admin
    try {
      const localProducts = JSON.parse(localStorage.getItem('atelier_local_products') || '[]');
      const match = localProducts.find(
        (p) =>
          (p.rawId && p.rawId.toString() === id) ||
          (p.id && p.id.toString() === id) ||
          (p.slug && p.slug === id) ||
          (base && (
            p.rawId === base._id ||
            p.id === base._id ||
            (p.slug && p.slug === base.slug) ||
            (p.name && base.name && p.name.trim().toLowerCase() === base.name.trim().toLowerCase())
          ))
      );

      if (match) {
        if (!base) {
          base = {
            _id: match.rawId || match.id,
            id: match.id || match.rawId,
            rawId: match.rawId || match.id,
            slug: match.slug || match.id,
            name: match.name,
            subtitle: match.subtitle || `${match.category || 'Luxury'} Atelier Garment`,
            price: Number(match.price),
            originalPrice: match.originalPrice ? Number(match.originalPrice) : undefined,
            stockCount: Number(match.stock ?? 20),
            inStock: Number(match.stock ?? 20) > 0,
            category: (match.category || 'men').toLowerCase(),
            department: match.department || `${(match.category || 'Men').charAt(0).toUpperCase() + (match.category || 'Men').slice(1)}'s Apparel`,
            images: match.images && match.images.length > 0
              ? match.images
              : [match.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80'],
            fabric: match.fabric || '100% Breathable Cotton',
            silhouette: match.silhouette || match.fit || 'Tailored Fit',
            fit: match.fit || 'Tailored Fit',
            care: match.care || 'Dry Clean Recommended',
            careInstructions: match.careInstructions || match.care || 'Dry Clean Recommended',
            description: match.description || 'Crafted with premium tailoring and archival craftsmanship.',
            badge: match.badge || '',
            sizes: match.sizes && match.sizes.length > 0
              ? match.sizes
              : [{ size: 'S', inStock: true }, { size: 'M', inStock: true }, { size: 'L', inStock: true }, { size: 'XL', inStock: true }],
            colors: match.colors && match.colors.length > 0
              ? match.colors
              : [{ name: 'Heritage Classic', hex: '#1E293B', image: match.image }],
          };
        } else {
          base = {
            ...base,
            name: match.name || base.name,
            price: match.price !== undefined ? Number(match.price) : base.price,
            originalPrice: match.originalPrice !== undefined ? Number(match.originalPrice) : base.originalPrice,
            stockCount: match.stock !== undefined ? Number(match.stock) : (base.stockCount ?? 15),
            inStock: match.stock !== undefined ? Number(match.stock) > 0 : (base.inStock ?? true),
            category: (match.category || base.category || '').toLowerCase(),
            department: match.department || base.department,
            images: match.images && match.images.length > 0 ? match.images : (match.image ? [match.image] : base.images),
            fabric: match.fabric || base.fabric,
            silhouette: match.silhouette || match.fit || base.silhouette || base.fit,
            fit: match.fit || base.fit,
            care: match.care || base.care,
            careInstructions: match.careInstructions || match.care || base.careInstructions || base.care,
            description: match.description || base.description,
            badge: match.badge !== undefined ? match.badge : base.badge,
          };
        }
      }
    } catch (e) {}

    // 5. If id was undefined or malformed and nothing matched, use first available product
    if (!base && (id === 'undefined' || !id)) {
      if (allProductsRes?.data?.[0]) base = { ...allProductsRes.data[0] };
      else if (MOCK_PRODUCTS?.[0]) {
        base = {
          ...MOCK_PRODUCTS[0],
          _id: MOCK_PRODUCTS[0].id,
          rawId: MOCK_PRODUCTS[0].id,
          slug: MOCK_PRODUCTS[0].slug || MOCK_PRODUCTS[0].id,
        };
      }
    }

    // Ensure all critical garment specification fields have safe fallbacks
    if (base) {
      if (!base.fabric) base.fabric = '100% Breathable Archival Fabric';
      if (!base.description) base.description = 'Tailored to perfection with house atelier specifications and archival craftsmanship.';
      if (!base.careInstructions) base.careInstructions = base.care || 'Dry clean recommended or machine wash cold on delicate cycle. Press with warm steam.';
      if (!base.silhouette) base.silhouette = base.fit || 'Relaxed Tailored Block';
      if (!base.department) base.department = `${(base.category || 'Atelier').toUpperCase()} Collection`;
      if (!base.stockCount && base.stockCount !== 0) base.stockCount = 12;
      if (base.inStock === undefined) base.inStock = true;
    }

    return base;
  }, [apiResponse, allProductsRes, id, isDeleted, catalogTick]);

  // Normalized media, colors and sizes with multi-angle perspectives
  const images = useMemo(() => {
    let list = [];
    if (Array.isArray(product?.images) && product.images.length > 0) {
      list = [...product.images.filter(Boolean)];
    } else if (product?.image) {
      list = [product.image];
    }

    if (Array.isArray(product?.colors)) {
      product.colors.forEach((c) => {
        if (c.image && !list.includes(c.image)) {
          list.push(c.image);
        }
      });
    }

    // High-fashion complementary perspective angles (ensures at least 4 angles per garment)
    const cat = (product?.category || '').toLowerCase();
    const perspectiveAngles = {
      men: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=80',
      ],
      women: [
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      ],
      kids: [
        'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1000&q=80',
      ],
    };

    const presets = perspectiveAngles[cat] || perspectiveAngles.men;
    presets.forEach((url) => {
      if (list.length < 4 && !list.includes(url)) {
        list.push(url);
      }
    });

    if (list.length === 0) {
      list = ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80'];
    }

    return list;
  }, [product]);

  const colors = useMemo(() => {
    if (product?.colors && product.colors.length > 0) {
      return product.colors.map((c) => ({
        name: c.name || 'Atelier Hue',
        hex: c.hex || '#171717',
        image: c.image || images[0],
      }));
    }
    return [{ name: 'Atelier Classic', hex: '#171717', image: images[0] }];
  }, [product, images]);

  const sizes = useMemo(() => {
    if (product?.sizes && product.sizes.length > 0) {
      return product.sizes.map((s) => (typeof s === 'string' ? s : s.size || 'M'));
    }
    return ['S', 'M', 'L', 'XL'];
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    if (colors.length > 0) setSelectedColor(colors[0]);
  }, [colors]);

  useEffect(() => {
    if (sizes.length > 0) setSelectedSize(sizes[0]);
  }, [sizes]);

  // Dynamic related products query
  const { data: relatedRes } = useGetProductsQuery(
    { category: product?.category },
    { skip: !product?.category }
  );

  const relatedProducts = useMemo(() => {
    const currentId = product?._id || product?.slug || product?.id;
    if (relatedRes?.data && Array.isArray(relatedRes.data) && relatedRes.data.length > 0) {
      const filtered = relatedRes.data.filter((p) => (p._id || p.slug || p.id) !== currentId);
      if (filtered.length > 0) return filtered.slice(0, 3);
    }
    if (Array.isArray(MOCK_PRODUCTS)) {
      return MOCK_PRODUCTS.filter((p) => (p._id || p.slug || p.id) !== currentId).slice(0, 3);
    }
    return [];
  }, [relatedRes, product]);

  // Accordions state
  const [accordionOpen, setAccordionOpen] = useState({
    composition: true,
    fit: false,
    shipping: false,
  });

  // Reviews Query & Mutation
  const productIdOrSlug = product?._id || product?.slug || id;
  const { data: reviewsResponse, isLoading: isLoadingReviews } = useGetProductReviewsQuery(productIdOrSlug, {
    skip: !productIdOrSlug,
  });
  const [createProductReviewMutation, { isLoading: isSubmittingReview }] = useCreateProductReviewMutation();

  const reviewsList = reviewsResponse?.data || [];

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewSuccessMsg('');
    setReviewErrorMsg('');
    if (!reviewComment.trim()) {
      setReviewErrorMsg('Please provide your review critique.');
      return;
    }
    try {
      await createProductReviewMutation({
        idOrSlug: productIdOrSlug,
        rating: reviewRating,
        author: reviewAuthor.trim() || 'Sartorial Patron',
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      }).unwrap();
      setReviewSuccessMsg('Your sartorial critique has been archived successfully.');
      setReviewComment('');
      setReviewTitle('');
      setShowReviewForm(false);
      setTimeout(() => setReviewSuccessMsg(''), 4000);
    } catch (err) {
      setReviewErrorMsg(err?.data?.message || 'Failed to submit critique. Please try again.');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(
      addToCart({
        id: product._id || product.slug || product.id,
        name: product.name,
        price: product.price,
        size: selectedSize || sizes[0] || 'M',
        color: selectedColor?.name || colors[0]?.name || 'Standard',
        image: selectedColor?.image || images[0],
        badge: product.badge,
      })
    );
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  if (isLoading && !product) {
    return (
      <div className="w-full bg-[#FAF9F6] min-h-[70vh] flex flex-col items-center justify-center py-20">
        <Loader2 size={36} className="animate-spin text-[#171717] mb-4" />
        <p className="text-xs uppercase tracking-widest text-[#77736E] font-medium font-mono">
          Retrieving Garment Specification...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full bg-[#FAF9F6] min-h-[70vh] flex flex-col items-center justify-center py-20 px-6 text-center">
        <h2 className="font-editorial text-3xl text-[#171717] mb-2">Garment Not Found in Archive</h2>
        <p className="text-xs text-[#77736E] max-w-md mb-6">
          This piece may have been archived or retired from the seasonal catalogue.
        </p>
        <Link
          to="/collection"
          className="px-6 py-3 bg-[#171717] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#4D5543] transition flex items-center gap-2"
        >
          <ArrowLeft size={14} />
          <span>Return to Full Collection</span>
        </Link>
      </div>
    );
  }

  const currentColor = selectedColor || colors[0];
  const currentSize = selectedSize || sizes[0];

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#77736E] pb-6">
          <Link to="/" className="hover:text-[#171717]">Maison</Link>
          <span>/</span>
          <Link to={`/collection?cat=${(product.category || 'all').toLowerCase()}`} className="hover:text-[#171717]">{product.department}</Link>
          <span>/</span>
          <span className="text-[#171717] font-medium">{product.name}</span>
        </div>

        {/* Main PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Media Gallery (7 cols) with Multiple Angle Thumbnails Aside Main Image */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-5">
            {/* Multi-angle Thumbnail Strip Aside Main Image */}
            <div className="flex md:flex-col gap-3 shrink-0 overflow-x-auto md:overflow-y-auto max-h-[640px] py-1 px-1">
              {images.map((img, idx) => {
                const isActive = activeImageIndex === idx;
                const angleNames = ['Front View', 'Silhouette Drape', 'Fabric Texture', 'Artisanal Finish', 'Model Profile'];
                const angleLabel = angleNames[idx] || `Angle ${idx + 1}`;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    onMouseEnter={() => setActiveImageIndex(idx)}
                    aria-label={`Select ${angleLabel}`}
                    className={`group relative w-16 h-22 md:w-20 md:h-28 rounded-lg overflow-hidden border transition-all duration-300 shrink-0 text-left cursor-pointer ${
                      isActive
                        ? 'border-[#171717] ring-2 ring-[#C5A880] shadow-md scale-102'
                        : 'border-[#DAD7D1] opacity-75 hover:opacity-100 hover:border-[#77736E]'
                    }`}
                  >
                    <img
                      src={img}
                      alt={angleLabel}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-[#171717]/85 backdrop-blur-xs text-white text-[8px] font-sans font-medium px-1 py-0.5 text-center truncate">
                      {angleLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Expansive Primary Image with Navigation Controls */}
            <div className="flex-1 relative aspect-[3/4] bg-[#F1EFEA] rounded-xl overflow-hidden border border-[#DAD7D1] group shadow-sm">
              <img
                key={activeImageIndex}
                src={images[activeImageIndex] || currentColor.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-zoom-in animate-in fade-in duration-300"
              />

              {/* Top Badge */}
              {product.badge && (
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#171717] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded shadow-sm border border-[#DAD7D1]">
                  {product.badge}
                </span>
              )}

              {/* Prev / Next Cycling Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#171717] border border-[#DAD7D1] shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
                    aria-label="Previous Perspective"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#171717] border border-[#DAD7D1] shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
                    aria-label="Next Perspective"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Bottom Counter Pill */}
              <div className="absolute bottom-4 right-4 bg-[#171717]/85 backdrop-blur-md text-white font-mono text-[10px] font-semibold px-3 py-1 rounded-full shadow-md border border-white/20 flex items-center gap-1.5">
                <Eye size={12} className="text-[#C5A880]" />
                <span>Angle {activeImageIndex + 1} of {images.length}</span>
              </div>
            </div>
          </div>

          {/* Right Sticky Purchase Decision Panel (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Department & Inventory Alert */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.16em] text-[#4D5543] font-semibold">
                  {product.department || `${product.category?.toUpperCase()} Collection`}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#DDE6CE]/60 text-[#4D5543] rounded text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4D5543] animate-pulse" />
                  Vault Reserve: Only {product.stockCount || 0} Pieces Available
                </span>
              </div>

              {/* Title & Price */}
              <div>
                <h1 className="font-editorial text-3xl sm:text-4xl text-[#171717] leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs text-[#77736E] mt-1">{product.subtitle}</p>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-2xl font-semibold text-[#171717]">
                    Rs. {Number(product.price).toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-[#77736E] line-through">
                      Rs. {Number(product.originalPrice).toLocaleString()}
                    </span>
                  )}
                  <span className="text-[11px] text-[#77736E]">
                    (Includes insured courier &amp; import duties)
                  </span>
                </div>
              </div>

              <div className="h-[1px] bg-[#DAD7D1]" />

              {/* Color Swatches */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#171717]">Atelier Hue Selection:</span>
                  <span className="text-[#4D5543] font-medium">{currentColor.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-7 h-7 rounded-full border transition-all ${
                        currentColor.name === c.name
                          ? 'ring-2 ring-offset-2 ring-[#171717] scale-110'
                          : 'border-[#DAD7D1] hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#171717]">Calibration / Size:</span>
                  <button
                    type="button"
                    onClick={onOpenSizeGuide}
                    className="text-[#4D5543] hover:text-[#171717] flex items-center gap-1 font-semibold underline underline-offset-4"
                  >
                    <Ruler size={13} />
                    <span>Dual-Unit Size Guide</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2.5 px-2 text-xs font-semibold rounded border transition-all text-center ${
                        currentSize === sz
                          ? 'bg-[#171717] text-white border-[#171717] shadow-sm'
                          : 'bg-white text-[#171717] border-[#DAD7D1] hover:border-[#171717]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Bag Button */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-[#171717] text-white text-xs uppercase tracking-[0.14em] font-semibold rounded hover:bg-[#4D5543] transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group"
                >
                  {addedToast ? (
                    <>
                      <Check size={18} className="text-[#DDE6CE]" />
                      <span>Added to Curated Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>Add to Curated Bag • Rs. {product.price.toLocaleString()}</span>
                    </>
                  )}
                </button>

                {/* Co-Create in AI Studio Promotional Callout */}
                <Link
                  to="/custom-studio"
                  className="w-full py-3 bg-[#FAF9F6] border border-[#4D5543]/40 rounded text-xs uppercase tracking-[0.1em] font-semibold text-[#4D5543] hover:bg-[#DDE6CE]/40 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={15} />
                  <span>Customize This Silhouette in AI Studio</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-[#77736E]">
                <div className="flex items-center gap-2">
                  <Truck size={15} className="text-[#4D5543]" />
                  <span>Insured Global Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scissors size={15} className="text-[#4D5543]" />
                  <span>Hand-Finished in Atelier</span>
                </div>
              </div>

              {/* Accordions */}
              <div className="border-t border-[#DAD7D1] divide-y divide-[#DAD7D1]">
                {/* Composition */}
                <div className="py-4">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('composition')}
                    className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#171717]"
                  >
                    <span>Textile Composition &amp; Care</span>
                    {accordionOpen.composition ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {accordionOpen.composition && (
                    <div className="pt-3 text-xs text-[#77736E] leading-relaxed space-y-2">
                      <p><strong>Primary Textile:</strong> {product.fabric}</p>
                      <p><strong>Description:</strong> {product.description}</p>
                      <p><strong>Care Protocol:</strong> {product.careInstructions}</p>
                    </div>
                  )}
                </div>

                {/* Silhouette */}
                <div className="py-4">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('fit')}
                    className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#171717]"
                  >
                    <span>Tailoring Silhouette &amp; Measure</span>
                    {accordionOpen.fit ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {accordionOpen.fit && (
                    <div className="pt-3 text-xs text-[#77736E] leading-relaxed">
                      <p><strong>Cut:</strong> {product.silhouette}</p>
                      <p className="mt-1">
                        Our house pattern block features natural soft drape with reinforced seam tolerances for longevity.
                      </p>
                    </div>
                  )}
                </div>

                {/* Shipping */}
                <div className="py-4">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('shipping')}
                    className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#171717]"
                  >
                    <span>Complimentary Courier &amp; Returns</span>
                    {accordionOpen.shipping ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {accordionOpen.shipping && (
                    <div className="pt-3 text-xs text-[#77736E] leading-relaxed">
                      <p>
                        Orders dispatched within 24-48 hours via insured courier. Complimentary returns and size exchanges accepted within 30 days of delivery.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete the Look Cross-Sell */}
        <div className="mt-24 pt-12 border-t border-[#DAD7D1]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[11px] uppercase tracking-[0.16em] text-[#4D5543] font-semibold">
                Sartorial Ensembles
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl text-[#171717] mt-1">
                Complete The Look
              </h3>
            </div>
            <Link
              to="/collection"
              className="text-xs uppercase tracking-wider font-semibold text-[#171717] hover:text-[#4D5543]"
            >
              View Full Collection →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id || p.slug || p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Client Reviews & Sartorial Critiques */}
        <div className="mt-20 pt-12 border-t border-[#DAD7D1]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-[0.16em] text-[#4D5543] font-semibold">
                  Patron Registry
                </span>
                <span className="text-[#DAD7D1]">•</span>
                <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold">
                  <Star size={13} fill="currentColor" />
                  <span>{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
                  <span className="text-[#77736E] font-normal">
                    ({reviewsList.length} {reviewsList.length === 1 ? 'Critique' : 'Critiques'})
                  </span>
                </div>
              </div>
              <h3 className="font-editorial text-2xl sm:text-3xl text-[#171717] mt-1">
                Client Reviews &amp; Assessments
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-5 py-2.5 bg-[#171717] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#4D5543] transition flex items-center gap-2 self-start sm:self-auto"
            >
              <MessageSquare size={14} />
              <span>{showReviewForm ? 'Close Critique Form' : 'Write a Critique'}</span>
            </button>
          </div>

          {/* Review Success / Error Alerts */}
          {reviewSuccessMsg && (
            <div className="mb-6 p-4 bg-[#DDE6CE]/40 border border-[#4D5543] rounded-lg text-xs text-[#2A3620] flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#4D5543]" />
              <span>{reviewSuccessMsg}</span>
            </div>
          )}

          {/* Interactive Review Submission Form */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="mb-10 bg-white border border-[#DAD7D1] rounded-xl p-6 sm:p-8 space-y-5 shadow-sm animate-in fade-in"
            >
              <h4 className="font-editorial text-lg text-[#171717]">
                Pen Your Sartorial Assessment
              </h4>

              {reviewErrorMsg && (
                <p className="text-xs text-[#DC2626] font-medium">{reviewErrorMsg}</p>
              )}

              {/* Star Rating Selector */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4D5543] mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-500 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={22}
                        fill={star <= reviewRating ? 'currentColor' : 'none'}
                        className={star <= reviewRating ? 'text-amber-500' : 'text-[#DAD7D1]'}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs text-[#77736E] font-medium font-mono">
                    {reviewRating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4D5543] mb-1">
                    Your Name / Pseudonym
                  </label>
                  <input
                    type="text"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="e.g. Tariq Mansoor, Karachi"
                    className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4D5543] mb-1">
                    Critique Headline
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Exemplary Drapery & Fit"
                    className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4D5543] mb-1">
                  Detailed Critique &amp; Fit Commentary *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details regarding textile breathability, seam finishes, shoulder fit, or styling versatility..."
                  className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717] leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-6 py-2.5 bg-[#171717] hover:bg-black text-white text-xs uppercase tracking-wider font-semibold rounded transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingReview ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>Archive Critique</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2.5 border border-[#DAD7D1] text-xs text-[#77736E] rounded hover:text-[#171717]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {reviewsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviewsList.map((rev) => (
                <div
                  key={rev._id || rev.id}
                  className="bg-white border border-[#DAD7D1] rounded-xl p-6 space-y-3 shadow-sm hover:border-[#171717]/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < rev.rating ? 'currentColor' : 'none'}
                          className={i < rev.rating ? 'text-amber-500' : 'text-[#DAD7D1]'}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#77736E] font-mono">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  {rev.title && (
                    <h5 className="font-semibold text-sm text-[#171717]">{rev.title}</h5>
                  )}

                  <p className="text-xs text-[#77736E] leading-relaxed">
                    "{rev.comment}"
                  </p>

                  <div className="pt-2 border-t border-[#F1EFEA] flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#171717]">{rev.author || 'Patron'}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="text-[#35664A] flex items-center gap-1 font-medium">
                        <Check size={12} />
                        Verified Atelier Commission
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#DAD7D1] rounded-xl p-12 text-center space-y-3">
              <MessageSquare size={32} className="mx-auto text-[#DAD7D1]" />
              <h4 className="font-editorial text-lg text-[#171717]">
                No Critiques Penned Yet
              </h4>
              <p className="text-xs text-[#77736E] max-w-sm mx-auto">
                Be the inaugural patron to register an appraisal on this garment's textile drape and tailoring cut.
              </p>
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="mt-2 px-5 py-2.5 bg-[#171717] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#4D5543] transition"
              >
                Pen the First Critique
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
