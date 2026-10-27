import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProductsQuery, useGetCategoriesQuery } from '../store/api/apiSlice';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, Grid3X3, LayoutGrid, RotateCcw, Loader2 } from 'lucide-react';

// Strict category normalization to prevent cross-category bleed (e.g. "women" containing "men")
const matchesCategory = (prodCategory, targetDept) => {
  if (!targetDept || targetDept === 'all') return true;
  const p = (prodCategory || '').trim().toLowerCase();
  const t = targetDept.trim().toLowerCase();

  if (t === 'men') {
    return p === 'men' || p === 'sartorial';
  }
  if (t === 'women') {
    return p === 'women' || p === 'couture';
  }
  if (t === 'kids') {
    return p === 'kids' || p === 'miniature' || p === 'children';
  }
  return p === t;
};

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('cat') || 'all';

  const [department, setDepartment] = useState(categoryParam);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [maxPrice, setMaxPrice] = useState(35000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [columns, setColumns] = useState(4); // 3 or 4
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (categoryParam) {
      setDepartment(categoryParam);
    }
  }, [categoryParam]);

  const handleDepartmentChange = (dept) => {
    setDepartment(dept);
    if (dept === 'all') {
      searchParams.delete('cat');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ cat: dept });
    }
  };

  const handleToggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleToggleFabric = (fabric) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
  };

  const handleResetFilters = () => {
    setDepartment('all');
    setSelectedSizes([]);
    setSelectedFabrics([]);
    setMaxPrice(35000);
    setInStockOnly(false);
    setSortBy('featured');
    searchParams.delete('cat');
    setSearchParams(searchParams);
  };

  const [catalogTick, setCatalogTick] = useState(0);

  // Real-time synchronization listener for Admin CRUD actions
  useEffect(() => {
    let bc = null;
    const triggerSync = () => {
      setCatalogTick((t) => t + 1);
    };

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('atelier_live_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'CATALOG_UPDATED') {
            triggerSync();
          }
        };
      }
    } catch (e) {
      // ignore
    }

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

  const { data: categoriesRes, refetch: refetchCategories } = useGetCategoriesQuery(undefined);
  const dbCategories = categoriesRes?.data || [];

  const { data: apiResponse, isLoading, isFetching, refetch: refetchProducts } = useGetProductsQuery(undefined);

  const refetchSyncRef = React.useRef({ refetchProducts, refetchCategories });
  refetchSyncRef.current = { refetchProducts, refetchCategories };

  useEffect(() => {
    if (catalogTick > 0) {
      refetchSyncRef.current.refetchProducts?.();
      refetchSyncRef.current.refetchCategories?.();
    }
  }, [catalogTick]);

  // Compute live effective products: exclude deleted items & merge admin modifications/creations
  const sourceProducts = React.useMemo(() => {
    let baseList = apiResponse?.data && Array.isArray(apiResponse.data) ? [...apiResponse.data] : [];

    try {
      const deletedIds = JSON.parse(localStorage.getItem('atelier_deleted_product_ids') || '[]');
      const localProducts = JSON.parse(localStorage.getItem('atelier_local_products') || '[]');

      // 1. Exclude any products deleted by Admin
      baseList = baseList.filter((p) => {
        const pid = (p._id || p.id || '').toString();
        const pslug = (p.slug || '').toString();
        return !deletedIds.includes(pid) && !deletedIds.includes(pslug);
      });

      // 2. Merge local products (created or updated by Admin)
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
              (lpslug && p.slug === lpslug) ||
              (lp.name && p.name && p.name.trim().toLowerCase() === lp.name.trim().toLowerCase())
          );

          if (existingIdx !== -1) {
            baseList[existingIdx] = {
              ...baseList[existingIdx],
              name: lp.name || baseList[existingIdx].name,
              price: Number(lp.price) || baseList[existingIdx].price,
              stockCount: lp.stock !== undefined ? Number(lp.stock) : baseList[existingIdx].stockCount,
              inStock: lp.stock !== undefined ? Number(lp.stock) > 0 : baseList[existingIdx].inStock,
              category: (lp.category || baseList[existingIdx].category || '').toLowerCase(),
              department: lp.department || `${(lp.category || '').charAt(0).toUpperCase() + (lp.category || '').slice(1)}'s Collection`,
              images: lp.image ? [lp.image] : (lp.images || baseList[existingIdx].images),
              image: lp.image || baseList[existingIdx].image || baseList[existingIdx].images?.[0],
              fabric: lp.fabric || baseList[existingIdx].fabric,
              description: lp.description || baseList[existingIdx].description,
              badge: lp.badge !== undefined ? lp.badge : baseList[existingIdx].badge,
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
    } catch (e) {
      // ignore
    }

    return baseList;
  }, [apiResponse, catalogTick]);

  // Dynamic category list with live count from sourceProducts and catalog categories
  const categoryTabs = React.useMemo(() => {
    const list = [
      { id: 'all', label: 'All Collections' },
    ];

    const seen = new Set(['all']);

    // 1. Database categories (e.g. Men, Women, Kids, or any custom additions)
    if (Array.isArray(dbCategories)) {
      dbCategories.forEach((c) => {
        const catId = (c.slug || c.name || '').trim().toLowerCase();
        if (catId && !seen.has(catId)) {
          seen.add(catId);
          list.push({
            id: catId,
            label: c.name || (catId.charAt(0).toUpperCase() + catId.slice(1)),
          });
        }
      });
    }

    // 2. Standard categories foundation if not yet registered
    ['men', 'women', 'kids'].forEach((id) => {
      if (!seen.has(id)) {
        seen.add(id);
        list.push({
          id,
          label: id.charAt(0).toUpperCase() + id.slice(1),
        });
      }
    });

    // 3. Dynamic categories found on actual active products
    sourceProducts.forEach((p) => {
      const pcat = (p.category || '').trim().toLowerCase();
      if (pcat && !seen.has(pcat)) {
        seen.add(pcat);
        const rawName = (p.category || '').trim();
        list.push({
          id: pcat,
          label: rawName.charAt(0).toUpperCase() + rawName.slice(1),
        });
      }
    });

    // Populate live counts with matching
    return list.map((cat) => {
      if (cat.id === 'all') {
        return { ...cat, count: sourceProducts.length };
      }
      const matchingCount = sourceProducts.filter((p) =>
        matchesCategory(p.category, cat.id)
      ).length;
      return { ...cat, count: matchingCount };
    });
  }, [dbCategories, sourceProducts]);

  // Filter logic: strict category matching so Men never bleeds into Women or Kids
  const filteredProducts = sourceProducts.filter((product) => {
    if (department !== 'all') {
      if (!matchesCategory(product.category, department)) {
        return false;
      }
    }
    if (maxPrice < 35000 && product.price > maxPrice) {
      return false;
    }
    if (inStockOnly && !product.inStock) {
      return false;
    }
    if (selectedSizes.length > 0) {
      const pSizes = (product.sizes || []).map((s) => (typeof s === 'string' ? s : s.size || ''));
      const hasSize = pSizes.some((s) =>
        selectedSizes.some((sel) => s.toLowerCase().includes(sel.toLowerCase()))
      );
      if (!hasSize) return false;
    }
    if (selectedFabrics.length > 0) {
      const hasFabric = selectedFabrics.some((f) =>
        (product.fabric || '').toLowerCase().includes(f.toLowerCase())
      );
      if (!hasFabric) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'newest') return (b._id || b.id || '').localeCompare(a._id || a.id || '');
    return 0; // featured
  });

  const allAvailableFabrics = ['Cotton', 'Silk', 'Linen', 'Cashmere'];
  const allAvailableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Page Header */}
        <div className="pb-8 border-b border-[#DAD7D1]">
          <span className="text-[11px] uppercase tracking-[0.16em] text-[#4D5543] font-semibold">
            Atelier Ready-to-Wear
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
            <div>
              <h1 className="font-editorial text-4xl sm:text-5xl text-[#171717] uppercase tracking-tight">
                {department === 'men'
                  ? "Men's Collection"
                  : department === 'women'
                  ? "Women's Collection"
                  : department === 'kids'
                  ? "Kids' Collection"
                  : department !== 'all'
                  ? `${department.charAt(0).toUpperCase() + department.slice(1)} Collection`
                  : 'Curated Catalog & Artifacts'}
              </h1>
              <p className="text-xs text-[#77736E] mt-2 max-w-xl">
                Archival garments crafted from natural long-staple fibers, featuring single-needle construction and precision hand-finishing.
              </p>
            </div>

            {/* View controls */}
            <div className="flex items-center gap-4">
              {/* Density toggle */}
              <div className="hidden md:flex items-center border border-[#DAD7D1] rounded bg-white p-1">
                <button
                  type="button"
                  onClick={() => setColumns(3)}
                  className={`p-1.5 rounded transition-colors ${
                    columns === 3 ? 'bg-[#171717] text-white' : 'text-[#77736E]'
                  }`}
                  title="3 Columns"
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setColumns(4)}
                  className={`p-1.5 rounded transition-colors ${
                    columns === 4 ? 'bg-[#171717] text-white' : 'text-[#77736E]'
                  }`}
                  title="4 Columns"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#DAD7D1] rounded px-3 py-2 text-xs text-[#171717] font-medium focus:outline-none focus:border-[#171717]"
              >
                <option value="featured">Sort: Curated Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Latest Runway Additions</option>
              </select>

              {/* Mobile Filter Trigger */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-[#171717] text-white rounded text-xs uppercase"
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Desktop Filter Sidebar */}
          <aside
            className={`lg:col-span-3 space-y-8 lg:block ${
              mobileFilterOpen ? 'block' : 'hidden'
            } bg-[#FAF9F6] lg:bg-transparent p-6 lg:p-0 border lg:border-none border-[#DAD7D1] rounded`}
          >
            {/* Header / Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DAD7D1]">
              <span className="text-xs uppercase tracking-wider font-bold text-[#171717]">
                Filters ({filteredProducts.length} Items)
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-[#77736E] hover:text-[#B33A32] flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#171717] block">
                Category
              </span>
              <div className="flex flex-col space-y-2 text-xs">
                {categoryTabs.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleDepartmentChange(cat.id)}
                    className={`text-left py-1.5 px-2.5 rounded transition-all flex items-center justify-between ${
                      department === cat.id
                        ? 'bg-[#171717] text-white font-semibold shadow-sm'
                        : 'text-[#4B5563] hover:bg-[#F1EFEA]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {cat.count !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          department === cat.id
                            ? 'bg-white/20 text-white'
                            : 'bg-[#E7E5E4] text-[#78716C]'
                        }`}
                      >
                        {cat.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-wider font-semibold text-[#171717]">
                  Maximum Price
                </span>
                <span className="font-semibold text-[#4D5543]">
                  Rs. {maxPrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="4000"
                max="35000"
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#171717] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#77736E]">
                <span>Rs. 4,000</span>
                <span>Rs. 35,000+</span>
              </div>
            </div>

            {/* Size Filter Pills */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#171717] block">
                Garment Fit / Size
              </span>
              <div className="grid grid-cols-4 gap-2">
                {allAvailableSizes.map((sz) => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleToggleSize(sz)}
                      className={`py-2 text-xs font-semibold rounded border transition-all text-center ${
                        isSelected
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : 'bg-white text-[#171717] border-[#DAD7D1] hover:border-[#171717]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fabric Material Filter */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#171717] block">
                Textile &amp; Fiber
              </span>
              <div className="flex flex-col space-y-2 text-xs">
                {allAvailableFabrics.map((fabric) => {
                  const isSelected = selectedFabrics.includes(fabric);
                  return (
                    <label
                      key={fabric}
                      className="flex items-center gap-2 cursor-pointer text-[#4B5563] hover:text-[#171717]"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleFabric(fabric)}
                        className="rounded border-[#DAD7D1] text-[#171717] focus:ring-[#171717]"
                      />
                      <span>{fabric}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* In Stock Only */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#171717] font-medium">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-[#DAD7D1] text-[#171717]"
                />
                <span>Vault In-Stock Only (Immediate Dispatch)</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-9">
            {isLoading ? (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                  columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'
                } gap-6`}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-white border border-[#DAD7D1] rounded p-4 space-y-4">
                    <div className="aspect-[3/4] bg-[#E5E2DC] rounded"></div>
                    <div className="h-4 bg-[#E5E2DC] rounded w-3/4"></div>
                    <div className="h-3 bg-[#E5E2DC] rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : sourceProducts.length === 0 ? (
              <div className="bg-white border border-[#DAD7D1] rounded p-12 text-center space-y-4">
                <h3 className="font-editorial text-2xl text-[#171717]">
                  Seasonal Archive Currently Empty
                </h3>
                <p className="text-xs text-[#77736E] max-w-md mx-auto leading-relaxed">
                  No products are currently published in the catalog. As soon as the store administrator adds garments from the Admin Dashboard, they will immediately appear here in real time.
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-[#DAD7D1] rounded p-12 text-center space-y-4">
                <h3 className="font-editorial text-xl text-[#171717]">
                  No Matching Garments Found
                </h3>
                <p className="text-xs text-[#77736E] max-w-sm mx-auto">
                  No products currently match your filter criteria. Try adjusting your price threshold or selecting an alternative category.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#171717] text-white text-xs uppercase tracking-wider rounded"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                  columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'
                } gap-6`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id || product.slug || product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
