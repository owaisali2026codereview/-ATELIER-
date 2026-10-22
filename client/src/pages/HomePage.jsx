import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { JOURNAL_DISPATCHES } from '../data/mockData';
import { useGetProductsQuery } from '../store/api/apiSlice';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Sparkles, CheckCircle2, Shield, Scissors, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
  const [catalogTick, setCatalogTick] = useState(0);

  // Cross-tab real-time sync for admin CRUD operations
  React.useEffect(() => {
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

  const { data: productsRes, isLoading, refetch: refetchProducts } = useGetProductsQuery({}, { pollingInterval: 3000 });

  React.useEffect(() => {
    if (catalogTick > 0) {
      refetchProducts?.();
    }
  }, [catalogTick, refetchProducts]);

  const allProducts = React.useMemo(() => {
    let baseList = productsRes?.data && Array.isArray(productsRes.data) ? [...productsRes.data] : [];

    try {
      const deletedIds = JSON.parse(localStorage.getItem('atelier_deleted_product_ids') || '[]');
      const localProducts = JSON.parse(localStorage.getItem('atelier_local_products') || '[]');

      // 1. Exclude deleted products
      baseList = baseList.filter((p) => {
        const pid = (p._id || p.id || '').toString();
        const pslug = (p.slug || '').toString();
        return !deletedIds.includes(pid) && !deletedIds.includes(pslug);
      });

      // 2. Merge local products
      if (Array.isArray(localProducts)) {
        localProducts.forEach((lp) => {
          const lpid = (lp.rawId || lp.id || '').toString();
          const lpslug = (lp.slug || '').toString();
          if (deletedIds.includes(lpid) || (lpslug && deletedIds.includes(lpslug))) {
            return;
          }

          const existingIdx = baseList.findIndex(
            (p) =>
              (p._id && p._id.toString() === lpid) ||
              (p.id && p.id.toString() === lpid) ||
              (lpslug && p.slug === lpslug)
          );

          if (existingIdx !== -1) {
            baseList[existingIdx] = {
              ...baseList[existingIdx],
              name: lp.name || baseList[existingIdx].name,
              price: Number(lp.price) || baseList[existingIdx].price,
              stockCount: lp.stock !== undefined ? Number(lp.stock) : baseList[existingIdx].stockCount,
              inStock: lp.stock !== undefined ? Number(lp.stock) > 0 : baseList[existingIdx].inStock,
              category: (lp.category || baseList[existingIdx].category || '').toLowerCase(),
              images: lp.image ? [lp.image] : baseList[existingIdx].images,
              fabric: lp.fabric || baseList[existingIdx].fabric,
              description: lp.description || baseList[existingIdx].description,
              badge: lp.badge || baseList[existingIdx].badge,
            };
          } else {
            baseList.unshift({
              _id: lpid,
              id: lpid,
              slug: lpslug || lpid,
              name: lp.name,
              category: (lp.category || 'men').toLowerCase(),
              department: lp.department || `${lp.category}'s Apparel`,
              price: Number(lp.price),
              originalPrice: lp.originalPrice ? Number(lp.originalPrice) : undefined,
              stockCount: Number(lp.stock ?? 20),
              inStock: Number(lp.stock ?? 20) > 0,
              images: [lp.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'],
              fabric: lp.fabric || '100% Breathable Cotton',
              fit: lp.fit || 'Tailored Fit',
              care: lp.care || 'Dry Clean Recommended',
              description: lp.description || '',
              badge: lp.badge || '',
              sizes: [{ size: 'S', inStock: true }, { size: 'M', inStock: true }, { size: 'L', inStock: true }],
              colors: [{ name: 'Heritage Classic', hex: '#1E293B' }],
            });
          }
        });
      }
    } catch (e) {}

    return baseList;
  }, [productsRes, catalogTick]);

  const filteredProducts = React.useMemo(() => {
    if (selectedCategoryTab === 'all') return allProducts;
    return allProducts.filter((p) => {
      const cat = (p.category || '').trim().toLowerCase();
      if (selectedCategoryTab === 'men') {
        return cat === 'men' || cat === 'sartorial';
      }
      if (selectedCategoryTab === 'women') {
        return cat === 'women' || cat === 'couture';
      }
      if (selectedCategoryTab === 'kids') {
        return cat === 'kids' || cat === 'miniature' || cat === 'children';
      }
      return cat === selectedCategoryTab.toLowerCase();
    });
  }, [allProducts, selectedCategoryTab]);

  return (
    <div className="flex flex-col w-full bg-[#FAF9F6]">
      {/* 1. Editorial Hero Section */}
      <section className="relative w-full overflow-hidden bg-[#171717] text-white">
        {/* Background Editorial Media */}
        <div className="relative w-full min-h-[640px] lg:min-h-[740px] flex items-end">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85')"
            }}
          />
          {/* Subtle Scrims */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#171717]/80 via-transparent to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-12 pb-16 pt-28 flex flex-col justify-end">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded border border-white/20">
                <span className="w-2 h-2 rounded-full bg-[#DDE6CE] animate-pulse" />
                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#DDE6CE]">
                  Maison Atelier • Issue 08
                </span>
              </div>

              <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight font-normal">
                Ready-to-Wear <br />
                <span className="italic font-light text-[#DDE6CE]">
                  &amp; AI-Custom Couture
                </span>
              </h1>

              <p className="text-sm sm:text-base text-white/85 max-w-xl font-light leading-relaxed">
                Summer 2026 Collection — Hand-stitched sartorial discipline meets algorithmic bespoke design. Sculptural silhouettes crafted for timeless permanence.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  to="/collection"
                  className="px-8 py-3.5 bg-white text-[#171717] text-xs font-semibold uppercase tracking-[0.12em] rounded hover:bg-[#DDE6CE] transition-all duration-300 shadow-md"
                >
                  Explore Collection
                </Link>
                <Link
                  to="/custom-studio"
                  className="px-8 py-3.5 bg-[#4D5543] text-white text-xs font-semibold uppercase tracking-[0.12em] rounded hover:bg-[#3C4234] transition-all duration-300 flex items-center gap-2 shadow-sm border border-white/20 group"
                >
                  <span>Launch AI Studio</span>
                  <Sparkles size={16} className="text-[#DDE6CE] group-hover:rotate-12 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Archival Metrics Row */}
            <div className="hidden lg:grid grid-cols-3 gap-8 mt-14 pt-6 border-t border-white/20 bg-white/5 backdrop-blur-md px-8 py-5 rounded">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-widest text-white/60">
                  Archival Heritage
                </p>
                <p className="font-editorial text-xl font-medium text-white">
                  100% Pure Long-Staple Fibers
                </p>
              </div>
              <div className="space-y-1 border-l border-white/10 pl-8">
                <p className="text-[11px] uppercase tracking-widest text-white/60">
                  Parametric Precision
                </p>
                <p className="font-editorial text-xl font-medium text-white">
                  0.5mm Tailoring Tolerance
                </p>
              </div>
              <div className="space-y-1 border-l border-white/10 pl-8">
                <p className="text-[11px] uppercase tracking-widest text-white/60">
                  Global Atelier Network
                </p>
                <p className="font-editorial text-xl font-medium text-white">
                  Florence • Lahore • London
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Department Showcases */}
      <section className="w-full py-20 bg-[#FAF9F6]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.16em] text-[#4D5543] font-semibold">
                Curation Protocol
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#171717] mt-1">
                Department Showcases
              </h2>
            </div>
            <p className="text-xs text-[#77736E] max-w-md leading-relaxed">
              Distinct archives dedicated to modern masculine tailoring, heritage feminine draping, and youthful heirloom formalwear.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Men's Sartorial */}
            <Link
              to="/collection?cat=men"
              className="group relative flex flex-col justify-end rounded overflow-hidden aspect-[3/4] bg-[#171717] shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80')"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/90 via-[#171717]/30 to-transparent" />
              <div className="relative z-10 p-8 text-white">
                <span className="text-[10px] uppercase tracking-[0.14em] bg-[#4D5543]/80 px-2.5 py-1 rounded backdrop-blur-sm">
                  Department I
                </span>
                <h3 className="font-editorial text-2xl text-white mt-3 font-normal">
                  Men's Sartorial
                </h3>
                <p className="text-xs text-white/80 mt-1 font-light">
                  Crisp Oxfords, Irish Linen Blazers &amp; Selvedge Trousers
                </p>
                <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold group-hover:translate-x-1 transition-transform">
                  <span>View Archival Series</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            {/* Women's Couture */}
            <Link
              to="/collection?cat=women"
              className="group relative flex flex-col justify-end rounded overflow-hidden aspect-[3/4] bg-[#171717] shadow-sm hover:shadow-2xl transition-all duration-500 lg:-translate-y-4"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80')"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/90 via-[#171717]/30 to-transparent" />
              <div className="relative z-10 p-8 text-white">
                <span className="text-[10px] uppercase tracking-[0.14em] bg-[#4D5543]/80 px-2.5 py-1 rounded backdrop-blur-sm">
                  Department II
                </span>
                <h3 className="font-editorial text-2xl text-white mt-3 font-normal">
                  Women's Couture
                </h3>
                <p className="text-xs text-white/80 mt-1 font-light">
                  Embroidered Lawn, Fluid Anarkalis &amp; Evening Gowns
                </p>
                <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Discover Runway Archive</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            {/* Miniature Archive */}
            <Link
              to="/collection?cat=kids"
              className="group relative flex flex-col justify-end rounded overflow-hidden aspect-[3/4] bg-[#171717] shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1000&q=80')"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/90 via-[#171717]/30 to-transparent" />
              <div className="relative z-10 p-8 text-white">
                <span className="text-[10px] uppercase tracking-[0.14em] bg-[#4D5543]/80 px-2.5 py-1 rounded backdrop-blur-sm">
                  Department III
                </span>
                <h3 className="font-editorial text-2xl text-white mt-3 font-normal">
                  Miniature Archive
                </h3>
                <p className="text-xs text-white/80 mt-1 font-light">
                  Hand-Rolled Festive Kurtas &amp; Ceremonial Heirloom Sets
                </p>
                <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Browse Little Atelier</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Featured Collection Grid */}
      <section className="w-full py-16 bg-[#F1EFEA]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 gap-4 border-b border-[#DAD7D1]">
            <div>
              <span className="text-xs uppercase tracking-[0.16em] text-[#77736E] font-semibold">
                Curated Essentials
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#171717] mt-1">
                Featured Artifacts
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('all')}
                className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all ${
                  selectedCategoryTab === 'all'
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'bg-white text-[#171717] hover:bg-[#FAF9F6]'
                }`}
              >
                All Pieces
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('men')}
                className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all ${
                  selectedCategoryTab === 'men'
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'bg-white text-[#171717] hover:bg-[#FAF9F6]'
                }`}
              >
                Men
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('women')}
                className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all ${
                  selectedCategoryTab === 'women'
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'bg-white text-[#171717] hover:bg-[#FAF9F6]'
                }`}
              >
                Women
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('kids')}
                className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all ${
                  selectedCategoryTab === 'kids'
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'bg-white text-[#171717] hover:bg-[#FAF9F6]'
                }`}
              >
                Kids
              </button>
            </div>
          </div>

          {/* 4-Column Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-[#DAD7D1] rounded p-4 space-y-4">
                  <div className="aspect-[3/4] bg-[#E5E2DC] rounded"></div>
                  <div className="h-4 bg-[#E5E2DC] rounded w-3/4"></div>
                  <div className="h-3 bg-[#E5E2DC] rounded w-1/2"></div>
                </div>
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full py-10 text-center text-xs text-[#77736E]">
                No featured garments in this category yet.
              </div>
            ) : (
              filteredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id || product.slug || product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. Flagship AI Bespoke Atelier Interactive Banner */}
      <section className="w-full py-20 bg-[#FAF9F6] relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Canvas Card */}
            <div className="lg:col-span-6 relative">
              <div className="relative bg-white rounded-lg p-5 shadow-2xl border border-[#DAD7D1]">
                <div className="relative aspect-[4/3] rounded overflow-hidden bg-[#171717]">
                  <img
                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80"
                    alt="AI Generative Fashion Canvas"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute top-4 left-4 bg-[#171717]/90 backdrop-blur-md text-white px-3 py-1.5 rounded flex items-center gap-2 border border-white/20">
                    <span className="w-2 h-2 rounded-full bg-[#DDE6CE] animate-ping" />
                    <span className="text-[10px] tracking-wider uppercase font-semibold">
                      Generative Tailoring Engine 4.2
                    </span>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded shadow-md max-w-xs hidden sm:block border border-[#DAD7D1]">
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="font-semibold text-[#171717]">Silhouette Accuracy</span>
                      <span className="text-[#35664A] font-bold">99.8% Match</span>
                    </div>
                    <div className="w-full bg-[#DAD7D1] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#4D5543] h-full w-[99.8%]" />
                    </div>
                  </div>
                </div>

                {/* 3 Step Interactive Workflow */}
                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  <div className="bg-[#F1EFEA] p-3 rounded">
                    <p className="text-[10px] font-bold uppercase text-[#77736E]">1. Direction</p>
                    <p className="text-xs font-semibold text-[#171717] mt-0.5">Mood &amp; Fabric</p>
                  </div>
                  <div className="bg-[#F1EFEA] p-3 rounded">
                    <p className="text-[10px] font-bold uppercase text-[#77736E]">2. Render</p>
                    <p className="text-xs font-semibold text-[#171717] mt-0.5">3D Draping</p>
                  </div>
                  <div className="bg-[#F1EFEA] p-3 rounded">
                    <p className="text-[10px] font-bold uppercase text-[#77736E]">3. Stitch</p>
                    <p className="text-xs font-semibold text-[#171717] mt-0.5">Master Tailored</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Narrative Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DDE6CE] text-[#4D5543] rounded text-[11px] uppercase tracking-[0.14em] font-semibold">
                <Sparkles size={14} />
                <span>Generative Bespoke Laboratory</span>
              </div>

              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#171717] leading-tight">
                Craft your custom silhouette with generative AI precision.
              </h2>

              <p className="text-sm text-[#4B5563] leading-relaxed">
                From moodboard sketch to tailored doorstep delivery. Select body calibration, desired textile weight, lapel geometry, and drape dynamics. Our intelligent generative atelier drafts exact cutting patterns sent directly to master tailors in Florence and Lahore.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[#4D5543] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-[#171717]">Zero Textile Wastage</h4>
                    <p className="text-[11px] text-[#77736E]">
                      Individual garment patterns are mathematically nested on demand from single archival bolts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[#4D5543] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-[#171717]">Photorealistic Concept Previews</h4>
                    <p className="text-[11px] text-[#77736E]">
                      Observe how ambient light reflects off Raw Mulberry Silk versus 130s Worsted Wool under varied atmospheres.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  to="/custom-studio"
                  className="px-8 py-3.5 bg-[#171717] text-white text-xs uppercase tracking-[0.12em] font-semibold rounded hover:bg-[#4D5543] transition-all duration-300 shadow-md flex items-center gap-2"
                >
                  <span>Enter Custom Studio</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/collection"
                  className="px-6 py-3.5 bg-white text-[#171717] border border-[#DAD7D1] rounded text-xs uppercase tracking-[0.12em] font-semibold hover:bg-[#F1EFEA] transition-colors"
                >
                  Browse Lookbook
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Editorial Journal Teaser */}
      <section className="w-full py-20 bg-[#F1EFEA]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[#DAD7D1] pb-6">
            <div>
              <span className="text-xs uppercase tracking-[0.16em] text-[#4D5543] font-semibold">
                The Journal • Volume XIV
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#171717] mt-1">
                Dispatches From The Maison
              </h2>
            </div>
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#171717] hover:text-[#4D5543] transition-colors"
            >
              <span>Read All Stories</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Primary Feature Story */}
            <article className="lg:col-span-7 flex flex-col group cursor-pointer">
              <div className="relative w-full aspect-[16/10] overflow-hidden rounded bg-[#171717] mb-6 shadow-sm">
                <img
                  src={JOURNAL_DISPATCHES[0].image}
                  alt={JOURNAL_DISPATCHES[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#171717] text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded">
                  Textile History
                </span>
              </div>
              <span className="text-[11px] text-[#77736E] uppercase tracking-widest">
                {JOURNAL_DISPATCHES[0].volume} • {JOURNAL_DISPATCHES[0].readTime}
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl text-[#171717] mt-2 group-hover:text-[#4D5543] transition-colors">
                {JOURNAL_DISPATCHES[0].title}
              </h3>
              <p className="text-xs sm:text-sm text-[#77736E] mt-3 leading-relaxed">
                {JOURNAL_DISPATCHES[0].excerpt}
              </p>
            </article>

            {/* Sibling Stories */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-8">
              {JOURNAL_DISPATCHES.slice(1).map((story) => (
                <article key={story.id} className="flex gap-5 group cursor-pointer">
                  <div className="relative w-36 sm:w-44 aspect-[4/5] shrink-0 overflow-hidden rounded bg-[#171717] shadow-sm">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-wider text-[#4D5543] font-semibold">
                      {story.volume}
                    </span>
                    <h4 className="font-editorial text-lg text-[#171717] mt-1 group-hover:text-[#4D5543] transition-colors line-clamp-2">
                      {story.title}
                    </h4>
                    <p className="text-xs text-[#77736E] mt-2 line-clamp-2">
                      {story.excerpt}
                    </p>
                    <span className="text-[11px] text-[#77736E] mt-3">
                      {story.author} • {story.date}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
