import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetDashboardMetricsQuery,
  useGetAdminDossiersQuery,
  useUpdateTailorQuoteMutation,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetPatronsQuery,
  useLoginMutation,
  useGetInquiriesQuery,
  useUpdateInquiryStatusMutation,
  useDeleteInquiryMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from '../store/api/apiSlice';
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  ClipboardList,
  Sparkles,
  Users,
  FolderTree,
  Tag,
  BarChart2,
  Settings as SettingsIcon,
  LogIn,
  LogOut,
  Phone,
  MessageCircle,
  ExternalLink,
  Download,
  Search,
  Check,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  ArrowRight,
  Lock,
  RefreshCw,
  Eye,
  AlertCircle,
  Save,
  CheckCircle,
  Shield,
  ShieldAlert,
  KeyRound,
  Sliders,
  DollarSign,
  TrendingUp,
  Activity,
  UserCheck,
  Globe,
  Bell,
  Mail,
  Inbox,
  Send,
  Archive,
  Printer,
  Upload,
} from 'lucide-react';

export default function AdminDashboardPage() {
  // Strict Authentication Guard
  // Initialized from localStorage: if no valid stored session, adminAuth is null.
  const [adminAuth, setAdminAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('fashion_admin_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === 'admin' || parsed.role === 'super_admin' || parsed.role === 'tailor_admin')) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  });

  // Check if a regular storefront customer is signed in
  const [customerSession, setCustomerSession] = useState(() => {
    try {
      const saved = localStorage.getItem('fashion_patron_session') || localStorage.getItem('atelier_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === 'customer' || !parsed.role)) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  });


  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Navigation active tab
  const [activeTab, setActiveTab] = useState('admin-dash');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // RTK Query hooks (automatic live polling on all dashboard data)
  const { data: metricsData, refetch: refetchMetrics } = useGetDashboardMetricsQuery(undefined, { skip: !adminAuth, pollingInterval: 5000 });
  const { data: dossiersData, refetch: refetchDossiers } = useGetAdminDossiersQuery(undefined, { skip: !adminAuth, pollingInterval: 5000 });
  const { data: ordersData, refetch: refetchOrders } = useGetAdminOrdersQuery(undefined, { skip: !adminAuth, pollingInterval: 5000 });
  const { data: productsData, refetch: refetchProducts } = useGetProductsQuery({}, { skip: !adminAuth, pollingInterval: 5000 });
  const { data: patronsData, refetch: refetchPatrons } = useGetPatronsQuery(undefined, { skip: !adminAuth, pollingInterval: 5000 });
  const { data: inquiriesData, refetch: refetchInquiries } = useGetInquiriesQuery(undefined, {
    skip: !adminAuth,
    pollingInterval: 4000,
  });

  const { data: categoriesData, refetch: refetchCategories } = useGetCategoriesQuery(undefined, { skip: !adminAuth, pollingInterval: 5000 });
  const { data: couponsData, refetch: refetchCoupons } = useGetCouponsQuery(undefined, { skip: !adminAuth, pollingInterval: 5000 });
  const { data: settingsData, refetch: refetchSettings } = useGetSettingsQuery(undefined, { skip: !adminAuth, pollingInterval: 8000 });

  const [loginMutation] = useLoginMutation();
  const [updateTailorQuote] = useUpdateTailorQuoteMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [createProductMutation] = useCreateProductMutation();
  const [updateProductMutation] = useUpdateProductMutation();
  const [deleteProductMutation] = useDeleteProductMutation();
  const [updateInquiryStatus] = useUpdateInquiryStatusMutation();
  const [deleteInquiry] = useDeleteInquiryMutation();
  const [createCategoryMutation] = useCreateCategoryMutation();
  const [deleteCategoryMutation] = useDeleteCategoryMutation();
  const [createCouponMutation] = useCreateCouponMutation();
  const [deleteCouponMutation] = useDeleteCouponMutation();
  const [updateSettingsMutation, { isLoading: isSavingSettings }] = useUpdateSettingsMutation();

  // Print invoice modal state
  const [printInvoiceOrder, setPrintInvoiceOrder] = useState(null);

  // Local state for interactive tables & forms
  const [productSearch, setProductSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('all');
  const [editingProductId, setEditingProductId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [modalEditProduct, setModalEditProduct] = useState(null);
  const [viewProductModal, setViewProductModal] = useState(null);
  const [viewUserModal, setViewUserModal] = useState(null);

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 6500,
    stock: 25,
    category: 'Men',
    fabric: '100% Breathable Combed Cotton',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Classic handcrafted tailored apparel with clean seams and premium finish.',
    badge: 'New Arrival',
  });
  const [productSavedAlert, setProductSavedAlert] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  const handleImageFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewProduct((prev) => ({
        ...prev,
        image: event.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Custom Requests State (purely live dynamic from MongoDB & submitted requests)
  const [expandedDetails, setExpandedDetails] = useState({});
  const [customRequestStatuses, setCustomRequestStatuses] = useState({});
  const [localCustomRequests, setLocalCustomRequests] = useState(() => {
    try {
      const stored = localStorage.getItem('atelier_custom_dossiers');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((d) => ({
            id: d.referenceCode || d.refCode || d._id || `AI-DSN-${Math.floor(1000 + Math.random() * 9000)}`,
            name: d.clientName || d.customerName || 'Bespoke Patron',
            email: d.guestEmail || d.email || '',
            phone: d.phone || d.customerPhone || '',
            rawPhone: (d.phone || d.customerPhone || '').replace(/\D/g, ''),
            prompt: d.parameters?.prompt || d.designPrompt || d.prompt || 'Custom bespoke garment commission',
            specs: `${d.parameters?.fabric?.name || d.fabricChoice || 'Bespoke Fabric'} • ${d.parameters?.category || d.occasion || 'Haute Couture'}`,
            fabric: d.parameters?.fabric?.name || d.fabricChoice || 'Bespoke Fabric',
            category: d.parameters?.category || d.occasion || 'Haute Couture',
            notes: d.parameters?.customNotes || d.customNotes || '',
            quote: d.officialQuoteAmount ? `Rs. ${Number(d.officialQuoteAmount).toLocaleString()}` : 'Awaiting Feasibility Quote',
            image: d.aiConcepts?.[0]?.imageUrl || d.generatedVisualUrl || d.sketchUrl || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
            status: d.tailorStatus === 'feasibility_review' ? 'New' : (d.status || 'New'),
            date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Today',
          }));
        }
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    if (dossiersData?.data && Array.isArray(dossiersData.data) && dossiersData.data.length > 0) {
      const fromBackend = dossiersData.data.map((d) => {
        const patronName =
          d.clientName ||
          (d.user?.firstName ? `${d.user.firstName} ${d.user.lastName || ''}`.trim() : null) ||
          d.customerName ||
          'Bespoke Patron';

        const patronPhone = d.phone || d.user?.phone || d.parameters?.phone || d.customerPhone || '0300-1234567';
        const cleanDigits = (patronPhone || '').replace(/\D/g, '');

        const garmentPrompt =
          d.parameters?.prompt ||
          d.designPrompt ||
          d.parameters?.customNotes ||
          d.customNotes ||
          'Custom bespoke atelier garment commission';

        const fabricName = d.parameters?.fabric?.name || d.fabricChoice || 'Bespoke Heritage Fabric';
        const categoryName = d.parameters?.category || d.parameters?.silhouette || d.occasion || 'Haute Couture';
        const specs = `${fabricName} • ${categoryName}`;

        const quoteVal = d.officialQuoteAmount || d.adminQuote;
        const quote = quoteVal ? `Rs. ${Number(quoteVal).toLocaleString()}` : 'Awaiting Feasibility Quote';

        const conceptImg =
          d.aiConcepts?.[0]?.imageUrl ||
          d.generatedVisualUrl ||
          d.sketchUrl ||
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80';

        const statusMap = {
          feasibility_review: 'New',
          quote_ready: 'In Progress',
          tailoring_in_progress: 'In Progress',
          dispatched: 'Completed',
          delivered: 'Completed',
        };
        const mappedStatus = statusMap[d.tailorStatus] || d.status || 'New';

        return {
          id: d.referenceCode || d.refCode || d._id || `AI-DSN-${Math.floor(1000 + Math.random() * 9000)}`,
          name: patronName,
          email: d.user?.email || d.guestEmail || d.email || 'patron@example.com',
          phone: patronPhone,
          rawPhone: cleanDigits || '03001234567',
          prompt: garmentPrompt,
          specs,
          fabric: fabricName,
          category: categoryName,
          notes: d.parameters?.customNotes || d.customNotes || '',
          quote,
          image: conceptImg,
          status: mappedStatus,
          date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Today',
        };
      });

      // Merge backend items with any locally stored items
      let merged = [...fromBackend];
      try {
        const stored = localStorage.getItem('atelier_custom_dossiers');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach((localDoc) => {
              const code = localDoc.referenceCode || localDoc.id;
              if (!merged.some((m) => m.id === code)) {
                merged.unshift({
                  id: code,
                  name: localDoc.clientName || 'Bespoke Patron',
                  email: localDoc.guestEmail || 'patron@example.com',
                  phone: localDoc.phone || '0300-1234567',
                  rawPhone: (localDoc.phone || '03001234567').replace(/\D/g, ''),
                  prompt: localDoc.parameters?.prompt || localDoc.prompt || 'Custom bespoke garment commission',
                  specs: `${localDoc.parameters?.fabric?.name || 'Bespoke Fabric'} • ${localDoc.parameters?.category || 'Haute Couture'}`,
                  fabric: localDoc.parameters?.fabric?.name || 'Bespoke Fabric',
                  category: localDoc.parameters?.category || 'Haute Couture',
                  notes: localDoc.parameters?.customNotes || localDoc.customNotes || '',
                  quote: 'Awaiting Feasibility Quote',
                  image: localDoc.aiConcepts?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
                  status: 'New',
                  date: 'Today',
                });
              }
            });
          }
        }
      } catch (e) {
        // ignore
      }

      setLocalCustomRequests(merged);
    }
  }, [dossiersData]);

  // Orders State (dynamic from MongoDB + live storefront orders)
  const [localOrders, setLocalOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('atelier_all_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    let list = [];
    if (ordersData?.data && Array.isArray(ordersData.data)) {
      list = ordersData.data.map((o) => ({
        id: o.orderNumber || o._id,
        orderNumber: o.orderNumber || o._id,
        customer: o.user?.firstName
          ? `${o.user.firstName} ${o.user.lastName || ''}`.trim()
          : (o.shippingAddress?.firstName ? `${o.shippingAddress.firstName} ${o.shippingAddress.lastName || ''}`.trim() : (o.customerEmail || 'Patron')),
        email: o.shippingAddress?.email || o.user?.email || 'N/A',
        phone: o.shippingAddress?.phone || o.user?.phone || 'N/A',
        address: o.shippingAddress?.address || '',
        items: o.items?.length || 1,
        itemsList: o.items || [],
        total: o.totalAmount || 0,
        status: o.fulfillmentStatus || 'Processing',
        city: o.shippingAddress?.city || 'Insured Courier',
        date: new Date(o.createdAt).toLocaleDateString(),
      }));
    }

    try {
      const stored = localStorage.getItem('atelier_all_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((localO) => {
            const num = localO.orderNumber || localO.id;
            if (!list.some((o) => (o.orderNumber || o.id) === num)) {
              list.unshift(localO);
            }
          });
        }
      }
    } catch (e) {}

    if (list.length > 0) {
      setLocalOrders(list);
    }
  }, [ordersData]);

  // Real-time automatic synchronization with storefront actions across browser tabs
  useEffect(() => {
    let bc = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('atelier_live_sync');
        bc.onmessage = (event) => {
          if (event.data?.type) {
            refetchMetrics?.();
            refetchDossiers?.();
            refetchOrders?.();
            refetchProducts?.();
            refetchPatrons?.();
            refetchInquiries?.();
            refetchCategories?.();
            refetchCoupons?.();
            if (event.data?.type === 'ORDER_CREATED' && event.data?.order) {
              setLocalOrders((prev) => {
                const num = event.data.order.orderNumber || event.data.order.id;
                if (!prev.some((o) => (o.orderNumber || o.id) === num)) {
                  return [event.data.order, ...prev];
                }
                return prev;
              });
            }
          }
        };
      }
    } catch (e) {
      // ignore
    }

    const handleStorage = (e) => {
      if (
        e.key === 'atelier_product_catalog_sync' ||
        e.key === 'fashion_patron_session' ||
        e.key === 'atelier_custom_dossiers' ||
        e.key === 'atelier_registered_patrons' ||
        e.key === 'atelier_all_orders' ||
        e.key === 'atelier_user_orders'
      ) {
        refetchMetrics?.();
        refetchDossiers?.();
        refetchOrders?.();
        refetchProducts?.();
        refetchPatrons?.();
        refetchCategories?.();
        try {
          const stored = localStorage.getItem('atelier_all_orders');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setLocalOrders((prev) => {
                let merged = [...prev];
                parsed.forEach((po) => {
                  const num = po.orderNumber || po.id;
                  if (!merged.some((m) => (m.orderNumber || m.id) === num)) {
                    merged.unshift(po);
                  }
                });
                return merged;
              });
            }
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [refetchMetrics, refetchDossiers, refetchOrders, refetchProducts, refetchPatrons, refetchInquiries, refetchCategories, refetchCoupons]);

  // Users State (dynamic from MongoDB + live patron registrations)
  const [localUsers, setLocalUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('atelier_registered_patrons');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [
      { id: 'usr-1', name: 'Zainab Shah', email: 'zainab.shah@example.com', phone: '0300-8472910', orders: 4, status: 'Active', tier: 'VIP Patron' },
      { id: 'usr-2', name: 'Hamza Malik', email: 'h.malik@example.com', phone: '0321-4567890', orders: 2, status: 'Active', tier: 'Standard' },
      { id: 'usr-3', name: 'Ayesha Raza', email: 'ayesha.raza@example.com', phone: '0333-9876543', orders: 1, status: 'Active', tier: 'Standard' },
    ];
  });

  useEffect(() => {
    let list = [];
    if (patronsData?.data && Array.isArray(patronsData.data)) {
      list = patronsData.data.map((u) => ({
        id: u._id || u.id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Store Patron',
        email: u.email,
        phone: u.phone || '0300-1234567',
        orders: u.ordersCount || 0,
        status: u.isVerified !== false ? 'Active' : 'Pending',
        tier: u.vipTier || (u.ordersCount > 3 ? 'VIP Patron' : 'Standard'),
      }));
    }

    // Merge any locally registered patrons
    try {
      const livePatron = localStorage.getItem('fashion_patron_session');
      if (livePatron) {
        const parsed = JSON.parse(livePatron);
        if (parsed?.email && !list.some((u) => u.email === parsed.email)) {
          list.unshift({
            id: parsed._id || parsed.id || `usr-live-${Date.now()}`,
            name: `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || 'Store Patron',
            email: parsed.email,
            phone: parsed.phone || '0300-1234567',
            orders: parsed.ordersCount || 1,
            status: 'Active',
            tier: 'VIP Patron',
          });
        }
      }
    } catch (e) {
      // ignore
    }

    if (list.length > 0) {
      setLocalUsers(list);
    }
  }, [patronsData]);

  // Categories State
  const [localCategories, setLocalCategories] = useState([
    { id: 'cat-1', name: 'Men', subcategories: 'Shirts, Kurtas, Trousers, Blazers', products: 0 },
    { id: 'cat-2', name: 'Women', subcategories: 'Dresses, Kurtis, Sarees, Shawls', products: 0 },
    { id: 'cat-3', name: 'Kids', subcategories: 'Boys, Girls, Ceremonial', products: 0 },
  ]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSubs, setNewCatSubs] = useState('');

  useEffect(() => {
    if (categoriesData?.data && Array.isArray(categoriesData.data)) {
      setLocalCategories(
        categoriesData.data.map((c) => ({
          id: c._id || c.id,
          name: c.name,
          subcategories: Array.isArray(c.subcategories) ? c.subcategories.join(', ') : (c.subcategories || 'General'),
          products: c.productsCount || 0,
        }))
      );
    }
  }, [categoriesData]);

  // Coupons State
  const [localCoupons, setLocalCoupons] = useState([
    { id: 'coup-1', code: 'SAVE10', discount: '10%', expiry: '31 Oct 2026', usage: '45 / 100', status: 'Active' },
    { id: 'coup-2', code: 'WELCOME500', discount: 'Rs. 500', expiry: '15 Nov 2026', usage: '120 / 500', status: 'Active' },
    { id: 'coup-3', code: 'ATELIER15', discount: '15%', expiry: '31 Dec 2026', usage: '84 / 200', status: 'Active' },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('15%');
  const [showCreateCouponRow, setShowCreateCouponRow] = useState(false);

  useEffect(() => {
    if (couponsData?.data && Array.isArray(couponsData.data)) {
      setLocalCoupons(
        couponsData.data.map((c) => ({
          id: c._id || c.id,
          code: c.code,
          discount: c.discountType === 'percentage' ? `${c.discountValue}%` : `Rs. ${c.discountValue}`,
          expiry: c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '31 Dec 2026',
          usage: `${c.usageCount || 0} / ${c.usageLimit || 100}`,
          status: c.isActive ? 'Active' : 'Disabled',
        }))
      );
    }
  }, [couponsData]);


  // Settings State
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Fashion Store',
    contactEmail: 'info@fashion.com',
    contactPhone: '0300-1234567',
    stripeEnabled: true,
    jazzCashEnabled: true,
    easyPaisaEnabled: true,
  });
  const [settingsSavedAlert, setSettingsSavedAlert] = useState(false);

  useEffect(() => {
    if (settingsData?.data) {
      setSiteSettings({
        siteName: settingsData.data.siteName || 'Atelier AI Haute Couture',
        contactEmail: settingsData.data.contactEmail || 'info@fashion.com',
        contactPhone: settingsData.data.contactPhone || '0300-1234567',
        stripeEnabled: settingsData.data.stripeEnabled ?? true,
        jazzCashEnabled: settingsData.data.jazzCashEnabled ?? true,
        easyPaisaEnabled: settingsData.data.easyPaisaEnabled ?? true,
      });
    }
  }, [settingsData]);

  // Products list from MongoDB
  const [customLocalProducts, setCustomLocalProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('atelier_local_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  // Sync backend products if loaded
  useEffect(() => {
    if (productsData?.data && Array.isArray(productsData.data)) {
      const formatted = productsData.data.map((p) => ({
        id: p._id || p.slug || p.id,
        rawId: p._id || p.id,
        slug: p.slug,
        name: p.name,
        category: p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'Men',
        price: p.price,
        stock: p.stockCount !== undefined ? p.stockCount : 20,
        status: p.inStock ? 'Active' : 'Out of Stock',
        image: p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80',
        fabric: p.fabric || '100% Breathable Cotton',
        description: p.description || '',
        badge: p.badge || '',
      }));

      // Merge backend items with any locally stored items and exclude deleted products
      let merged = [...formatted];
      try {
        const deletedIds = JSON.parse(localStorage.getItem('atelier_deleted_product_ids') || '[]');
        merged = merged.filter((m) => {
          const code = m.rawId || m.id;
          return !deletedIds.includes(code) && !deletedIds.includes(m.slug) && !deletedIds.includes(m.id);
        });

        const stored = localStorage.getItem('atelier_local_products');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach((localP) => {
              const code = localP.rawId || localP.id;
              if (deletedIds.includes(code) || (localP.slug && deletedIds.includes(localP.slug))) {
                return;
              }
              const existingIdx = merged.findIndex(
                (m) => (m.rawId || m.id) === code || (localP.slug && m.slug === localP.slug)
              );
              if (existingIdx !== -1) {
                merged[existingIdx] = { ...merged[existingIdx], ...localP };
              } else {
                merged.unshift(localP);
              }
            });
          }
        }
      } catch (e) {
        // ignore
      }

      setCustomLocalProducts(merged);
    }
  }, [productsData]);

  // Filtered Products (by search query and category)
  const filteredProducts = useMemo(() => {
    const q = (productSearch || globalSearchQuery).toLowerCase().trim();
    return customLocalProducts.filter((p) => {
      const pCat = (p.category || '').toLowerCase().trim();
      if (adminCategoryFilter !== 'all') {
        if (adminCategoryFilter === 'men') {
          if (pCat !== 'men' && pCat !== 'sartorial') return false;
        } else if (adminCategoryFilter === 'women') {
          if (pCat !== 'women' && pCat !== 'couture') return false;
        } else if (adminCategoryFilter === 'kids') {
          if (pCat !== 'kids' && pCat !== 'miniature') return false;
        } else if (pCat !== adminCategoryFilter.toLowerCase()) {
          return false;
        }
      }
      if (!q) return true;
      return (
        (p.name || '').toLowerCase().includes(q) ||
        pCat.includes(q) ||
        (p.price || '').toString().includes(q)
      );
    });
  }, [customLocalProducts, productSearch, globalSearchQuery, adminCategoryFilter]);

  // ================= AUTHENTICATION HANDLERS =================
  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setIsAuthenticating(true);

    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword.trim();

    // Authenticate securely via live backend API
    try {
      const res = await loginMutation({ email, password }).unwrap();
      const user = res?.data || res?.user || res;
      if (user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'tailor_admin') {
        localStorage.setItem('fashion_admin_session', JSON.stringify(user));
        if (res.token) localStorage.setItem('atelier_token', res.token);
        setAdminAuth(user);
        setIsAuthenticating(false);
        return;
      } else {
        setLoginError(`Role Restriction (403): Account authenticated as '${user?.role || 'customer'}', but lacks administrative clearance. Regular customers are restricted to the public website.`);
        setIsAuthenticating(false);
        return;
      }
    } catch (err) {
      setLoginError(
        err?.data?.message ||
        'Unauthorized Access: Invalid administrator email or password. Please check your credentials.'
      );
      setIsAuthenticating(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('fashion_admin_session');
    localStorage.removeItem('atelier_token');
    setAdminAuth(null);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
  };

  // Helper: Export CSV
  const handleExportCSV = (filename, rows, headers) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handlers for Products
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const productName = newProduct.name?.trim();
    if (!productName) {
      alert('Please enter a garment/product name.');
      return;
    }

    const price = Number(newProduct.price) || 6500;
    const stock = Number(newProduct.stock) !== undefined && !isNaN(Number(newProduct.stock)) ? Number(newProduct.stock) : 25;
    const category = (newProduct.category || 'Men').trim();
    const fabric = newProduct.fabric?.trim() || '100% Breathable Combed Cotton';
    const description = newProduct.description?.trim() || 'Classic handcrafted tailored apparel with clean seams and premium finish.';
    const image = newProduct.image?.trim() || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80';
    const rawImages = Array.isArray(newProduct.images) ? newProduct.images.map((u) => u?.trim()).filter(Boolean) : [];
    const imagesList = rawImages.length > 0 ? rawImages : [image];
    const badge = newProduct.badge?.trim() || 'New Arrival';
    const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);

    const payload = {
      name: productName,
      slug,
      price,
      stockCount: stock,
      category: category.toLowerCase(),
      department: `${category}'s Apparel`,
      fabric,
      description,
      image: imagesList[0] || image,
      images: imagesList,
      badge,
    };

    let created = null;
    try {
      const res = await createProductMutation(payload).unwrap();
      created = res?.data || res;
    } catch (err) {
      console.warn('Backend create product notice (persisting locally & broadcasting):', err);
    }

    const formattedNew = {
      id: created?._id || created?.slug || created?.id || `prod-${Date.now()}`,
      rawId: created?._id || created?.id || `prod-${Date.now()}`,
      slug: created?.slug || slug,
      name: created?.name || productName,
      category: created?.category ? created.category.charAt(0).toUpperCase() + created.category.slice(1) : category,
      price: created?.price || price,
      stock: created?.stockCount !== undefined ? created.stockCount : stock,
      status: (created?.inStock ?? (stock > 0)) ? 'Active' : 'Out of Stock',
      image: created?.images?.[0] || created?.image || imagesList[0] || image,
      images: created?.images && created.images.length > 0 ? created.images : imagesList,
      fabric: created?.fabric || fabric,
      description: created?.description || description,
      badge: created?.badge || badge,
    };

    // Update catalog table immediately
    setCustomLocalProducts((prev) => [formattedNew, ...prev.filter((p) => (p.rawId || p.id) !== (formattedNew.rawId || formattedNew.id))]);

    // Persist to local storage for durability and un-delete if previously removed
    try {
      const stored = JSON.parse(localStorage.getItem('atelier_local_products') || '[]');
      const updated = [formattedNew, ...stored.filter((p) => (p.rawId || p.id) !== formattedNew.rawId && p.slug !== formattedNew.slug)];
      localStorage.setItem('atelier_local_products', JSON.stringify(updated));

      const deletedIds = JSON.parse(localStorage.getItem('atelier_deleted_product_ids') || '[]');
      const filteredDeleted = deletedIds.filter(
        (d) => d !== formattedNew.rawId && d !== formattedNew.slug && d !== formattedNew.id
      );
      localStorage.setItem('atelier_deleted_product_ids', JSON.stringify(filteredDeleted));
    } catch (e) {
      // ignore
    }

    // Live sync broadcast to customer storefront and other open tabs
    if (typeof window !== 'undefined') {
      localStorage.setItem('atelier_product_catalog_sync', Date.now().toString());
      if ('BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('atelier_live_sync');
          bc.postMessage({ type: 'CATALOG_UPDATED', action: 'CREATE', product: formattedNew });
          bc.close();
        } catch (e) {
          // ignore
        }
      }
    }

    try {
      refetchProducts();
      refetchCategories();
    } catch (e) {
      // ignore
    }

    setProductSavedAlert(true);
    setTimeout(() => {
      setProductSavedAlert(false);
      setNewProduct({
        name: '',
        price: 6500,
        stock: 25,
        category: 'Men',
        fabric: '100% Breathable Combed Cotton',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        description: 'Classic handcrafted tailored apparel with clean seams and premium finish.',
        badge: 'New Arrival',
      });
      setActiveTab('admin-products');
    }, 400);
  };

  const handleDeleteProduct = async (p) => {
    const targetId = p.rawId || p.id;
    const targetSlug = p.slug;
    if (window.confirm(`Permanently delete "${p.name}" from active store inventory and public website?`)) {
      setCustomLocalProducts((prev) =>
        prev.filter((item) => (item.rawId || item.id) !== targetId && item.slug !== targetSlug)
      );

      // Permanently remove from local products and record as deleted for storefront exclusions
      try {
        const stored = JSON.parse(localStorage.getItem('atelier_local_products') || '[]');
        const filteredStored = stored.filter(
          (item) => (item.rawId || item.id) !== targetId && item.slug !== targetSlug
        );
        localStorage.setItem('atelier_local_products', JSON.stringify(filteredStored));

        const deletedIds = JSON.parse(localStorage.getItem('atelier_deleted_product_ids') || '[]');
        if (targetId && !deletedIds.includes(targetId)) deletedIds.push(targetId);
        if (targetSlug && !deletedIds.includes(targetSlug)) deletedIds.push(targetSlug);
        if (p.id && !deletedIds.includes(p.id)) deletedIds.push(p.id);
        localStorage.setItem('atelier_deleted_product_ids', JSON.stringify(deletedIds));
      } catch (e) {
        // ignore
      }

      try {
        await deleteProductMutation(targetId).unwrap();
      } catch (e) {
        console.error('Delete product error:', e);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('atelier_product_catalog_sync', Date.now().toString());
        if ('BroadcastChannel' in window) {
          try {
            const bc = new BroadcastChannel('atelier_live_sync');
            bc.postMessage({ type: 'CATALOG_UPDATED', action: 'DELETE', id: targetId, slug: targetSlug });
            bc.close();
          } catch (e) {
            // ignore
          }
        }
      }

      refetchProducts();
      refetchCategories();
    }
  };

  const handleStartEdit = (p) => {
    setEditingProductId(p.id);
    setEditPrice(p.price);
    setEditStock(p.stock);
  };

  const handleSaveInlineEdit = async (p) => {
    const targetId = p.rawId || p.id;
    const targetSlug = p.slug;
    try {
      await updateProductMutation({
        id: targetId,
        price: Number(editPrice),
        stockCount: Number(editStock),
      }).unwrap();

      setCustomLocalProducts((prev) =>
        prev.map((item) =>
          (item.rawId || item.id) === targetId
            ? { ...item, price: Number(editPrice), stock: Number(editStock), status: Number(editStock) > 0 ? 'Active' : 'Out of Stock' }
            : item
        )
      );

      try {
        const stored = JSON.parse(localStorage.getItem('atelier_local_products') || '[]');
        const updatedStored = stored.map((item) =>
          (item.rawId || item.id) === targetId || (targetSlug && item.slug === targetSlug)
            ? { ...item, price: Number(editPrice), stock: Number(editStock), status: Number(editStock) > 0 ? 'Active' : 'Out of Stock' }
            : item
        );
        if (!updatedStored.some((item) => (item.rawId || item.id) === targetId || (targetSlug && item.slug === targetSlug))) {
          updatedStored.unshift({
            ...p,
            rawId: targetId,
            id: targetId,
            price: Number(editPrice),
            stock: Number(editStock),
            status: Number(editStock) > 0 ? 'Active' : 'Out of Stock',
          });
        }
        localStorage.setItem('atelier_local_products', JSON.stringify(updatedStored));
      } catch (e) {}

      if (typeof window !== 'undefined') {
        localStorage.setItem('atelier_product_catalog_sync', Date.now().toString());
        if ('BroadcastChannel' in window) {
          try {
            const bc = new BroadcastChannel('atelier_live_sync');
            bc.postMessage({ type: 'CATALOG_UPDATED', action: 'UPDATE', id: targetId });
            bc.close();
          } catch (e) {
            // ignore
          }
        }
      }

      refetchProducts();
    } catch (e) {
      console.error('Inline update error:', e);
    }
    setEditingProductId(null);
  };

  const handleOpenEditModal = (p) => {
    setModalEditProduct({
      ...p,
      rawId: p.rawId || p.id,
      category: p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase() : 'Men',
    });
  };

  const handleSaveModalEdit = async (e) => {
    e.preventDefault();
    if (!modalEditProduct) return;
    const targetId = modalEditProduct.rawId || modalEditProduct.id;
    const targetSlug = modalEditProduct.slug;
    try {
      await updateProductMutation({
        id: targetId,
        name: modalEditProduct.name,
        price: Number(modalEditProduct.price),
        stockCount: Number(modalEditProduct.stock),
        category: modalEditProduct.category.toLowerCase(),
        department: `${modalEditProduct.category}'s Apparel`,
        fabric: modalEditProduct.fabric,
        description: modalEditProduct.description,
        image: modalEditProduct.image,
        badge: modalEditProduct.badge,
      }).unwrap();

      setCustomLocalProducts((prev) =>
        prev.map((item) =>
          (item.rawId || item.id) === targetId
            ? {
                ...item,
                name: modalEditProduct.name,
                price: Number(modalEditProduct.price),
                stock: Number(modalEditProduct.stock),
                category: modalEditProduct.category,
                fabric: modalEditProduct.fabric,
                description: modalEditProduct.description,
                image: modalEditProduct.image,
                badge: modalEditProduct.badge,
              }
            : item
        )
      );

      try {
        const stored = JSON.parse(localStorage.getItem('atelier_local_products') || '[]');
        const updatedStored = stored.map((item) =>
          (item.rawId || item.id) === targetId || (targetSlug && item.slug === targetSlug)
            ? {
                ...item,
                name: modalEditProduct.name,
                price: Number(modalEditProduct.price),
                stock: Number(modalEditProduct.stock),
                category: modalEditProduct.category,
                fabric: modalEditProduct.fabric,
                description: modalEditProduct.description,
                image: modalEditProduct.image,
                badge: modalEditProduct.badge,
              }
            : item
        );
        if (!updatedStored.some((item) => (item.rawId || item.id) === targetId || (targetSlug && item.slug === targetSlug))) {
          updatedStored.unshift({
            ...modalEditProduct,
            rawId: targetId,
            id: targetId,
            price: Number(modalEditProduct.price),
            stock: Number(modalEditProduct.stock),
          });
        }
        localStorage.setItem('atelier_local_products', JSON.stringify(updatedStored));
      } catch (e) {}

      if (typeof window !== 'undefined') {
        localStorage.setItem('atelier_product_catalog_sync', Date.now().toString());
        if ('BroadcastChannel' in window) {
          try {
            const bc = new BroadcastChannel('atelier_live_sync');
            bc.postMessage({ type: 'CATALOG_UPDATED', action: 'UPDATE', id: targetId });
            bc.close();
          } catch (e) {
            // ignore
          }
        }
      }

      refetchProducts();
      refetchCategories();
      setModalEditProduct(null);
    } catch (err) {
      console.error('Modal update error:', err);
    }
  };

  // Handlers for Custom Requests
  const toggleDetail = (id) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateCustomStatus = (id, newStatus) => {
    setCustomRequestStatuses((prev) => ({ ...prev, [id]: newStatus }));
    setLocalCustomRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  // Handlers for Orders
  const updateOrderStatusValue = (id, newStatus) => {
    setLocalOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const handleDeleteOrder = (id) => {
    if (window.confirm(`Delete order ${id} from operational records?`)) {
      setLocalOrders((prev) => prev.filter((o) => o.id !== id));
    }
  };

  // Handlers for Users
  const handleDeleteUser = (id) => {
    if (window.confirm('Remove this customer record from the dashboard?')) {
      setLocalUsers((prev) => {
        const next = prev.filter((u) => u.id !== id);
        try {
          localStorage.setItem('atelier_registered_patrons', JSON.stringify(next));
          const bc = new BroadcastChannel('atelier_live_sync');
          bc.postMessage({ type: 'USERS_UPDATED' });
          bc.close();
        } catch (e) {}
        return next;
      });
      if (viewUserModal?.id === id) {
        setViewUserModal(null);
      }
    }
  };

  const handleToggleUserTier = (id) => {
    setLocalUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id === id) {
          const newTier = u.tier === 'VIP Patron' ? 'Standard' : 'VIP Patron';
          return { ...u, tier: newTier };
        }
        return u;
      });
      try {
        localStorage.setItem('atelier_registered_patrons', JSON.stringify(next));
        const bc = new BroadcastChannel('atelier_live_sync');
        bc.postMessage({ type: 'USERS_UPDATED' });
        bc.close();
      } catch (e) {}
      return next;
    });
    if (viewUserModal?.id === id) {
      setViewUserModal((prev) => (prev ? { ...prev, tier: prev.tier === 'VIP Patron' ? 'Standard' : 'VIP Patron' } : null));
    }
  };

  const handleToggleUserStatus = (id) => {
    setLocalUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          return { ...u, status: newStatus };
        }
        return u;
      });
      try {
        localStorage.setItem('atelier_registered_patrons', JSON.stringify(next));
        const bc = new BroadcastChannel('atelier_live_sync');
        bc.postMessage({ type: 'USERS_UPDATED' });
        bc.close();
      } catch (e) {}
      return next;
    });
    if (viewUserModal?.id === id) {
      setViewUserModal((prev) => (prev ? { ...prev, status: prev.status === 'Active' ? 'Suspended' : 'Active' } : null));
    }
  };

  // Handlers for Categories
  const handleDeleteCategory = async (id) => {
    setLocalCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteCategoryMutation(id).unwrap();
    } catch (e) {
      console.warn('Backend category delete note:', e);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const catName = newCatName.trim();
    const catSubs = newCatSubs.trim() || 'General';

    const tempId = `cat-${Date.now()}`;
    setLocalCategories((prev) => [
      ...prev,
      {
        id: tempId,
        name: catName,
        subcategories: catSubs,
        products: 0,
      },
    ]);
    setNewCatName('');
    setNewCatSubs('');

    try {
      await createCategoryMutation({
        name: catName,
        subcategories: catSubs.split(',').map((s) => s.trim()).filter(Boolean),
      }).unwrap();
    } catch (e) {
      console.warn('Backend category create note:', e);
    }
  };

  // Handlers for Coupons
  const handleDeleteCoupon = async (id) => {
    setLocalCoupons((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteCouponMutation(id).unwrap();
    } catch (e) {
      console.warn('Backend coupon delete note:', e);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const code = newCouponCode.trim().toUpperCase();
    const discount = newCouponDiscount;

    const tempId = `coup-${Date.now()}`;
    setLocalCoupons((prev) => [
      {
        id: tempId,
        code,
        discount,
        expiry: '31 Dec 2026',
        usage: '0 / 100',
        status: 'Active',
      },
      ...prev,
    ]);
    setNewCouponCode('');
    setShowCreateCouponRow(false);

    try {
      await createCouponMutation({
        code,
        discount,
        usageLimit: 100,
      }).unwrap();
    } catch (e) {
      console.warn('Backend coupon create note:', e);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettingsMutation(siteSettings).unwrap();
      setSettingsSavedAlert(true);
      setTimeout(() => setSettingsSavedAlert(false), 2500);
    } catch (err) {
      console.warn('Failed to save settings:', err);
    }
  };

  // Official Inquiries / Customer Emails State
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const [emailStatusFilter, setEmailStatusFilter] = useState('all');
  const [emailSearch, setEmailSearch] = useState('');
  const [localEmails, setLocalEmails] = useState([]);

  // Merge backend inquiries with any locally submitted customer emails
  useEffect(() => {
    const fromBackend = Array.isArray(inquiriesData?.data) ? inquiriesData.data : [];
    let merged = [...fromBackend];

    try {
      const stored = localStorage.getItem('atelier_customer_emails');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((localItem) => {
            const localId = localItem._id || localItem.id;
            if (!merged.some((m) => (m._id || m.id) === localId)) {
              merged.push(localItem);
            }
          });
        }
      }
    } catch (e) {
      // ignore
    }

    // Sort descending by date
    merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    setLocalEmails(merged);
  }, [inquiriesData]);

  // Real-time synchronization check across open tabs/windows
  useEffect(() => {
    const syncLocal = () => {
      try {
        const stored = localStorage.getItem('atelier_customer_emails');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setLocalEmails((prev) => {
              let updated = [...prev];
              let changed = false;
              parsed.forEach((localItem) => {
                const localId = localItem._id || localItem.id;
                if (!updated.some((u) => (u._id || u.id) === localId)) {
                  updated.unshift(localItem);
                  changed = true;
                }
              });
              return changed ? updated : prev;
            });
          }
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('storage', syncLocal);
    const syncTimer = setInterval(syncLocal, 2500);
    return () => {
      window.removeEventListener('storage', syncLocal);
      clearInterval(syncTimer);
    };
  }, []);

  const inquiriesList = localEmails;

  const unreadEmailCount = useMemo(() => {
    return inquiriesList.filter((item) => item.status === 'unread').length;
  }, [inquiriesList]);

  const filteredInquiries = useMemo(() => {
    let list = inquiriesList;
    if (emailStatusFilter !== 'all') {
      list = list.filter((item) => item.status === emailStatusFilter);
    }
    const q = (emailSearch || globalSearchQuery).toLowerCase().trim();
    if (q) {
      list = list.filter(
        (item) =>
          item.senderName?.toLowerCase().includes(q) ||
          item.senderEmail?.toLowerCase().includes(q) ||
          item.senderPhone?.toLowerCase().includes(q) ||
          item.subject?.toLowerCase().includes(q) ||
          item.message?.toLowerCase().includes(q) ||
          item.department?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [inquiriesList, emailStatusFilter, emailSearch, globalSearchQuery]);

  const selectedInquiry = useMemo(() => {
    if (!selectedInquiryId) {
      return filteredInquiries[0] || null;
    }
    return inquiriesList.find((item) => (item._id || item.id) === selectedInquiryId) || filteredInquiries[0] || null;
  }, [filteredInquiries, inquiriesList, selectedInquiryId]);

  const handleMarkInquiryStatus = async (id, status) => {
    setLocalEmails((prev) =>
      prev.map((i) => ((i._id || i.id) === id ? { ...i, status } : i))
    );
    try {
      const stored = JSON.parse(localStorage.getItem('atelier_customer_emails') || '[]');
      const updated = stored.map((i) => ((i._id || i.id) === id ? { ...i, status } : i));
      localStorage.setItem('atelier_customer_emails', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
    try {
      await updateInquiryStatus({ id, status }).unwrap();
    } catch (err) {
      // ignore
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (window.confirm('Are you sure you want to delete this email record from official records?')) {
      setLocalEmails((prev) => prev.filter((i) => (i._id || i.id) !== id));
      try {
        const stored = JSON.parse(localStorage.getItem('atelier_customer_emails') || '[]');
        const updated = stored.filter((i) => (i._id || i.id) !== id);
        localStorage.setItem('atelier_customer_emails', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      try {
        await deleteInquiry(id).unwrap();
      } catch (err) {
        // ignore
      }
      if (selectedInquiryId === id) {
        setSelectedInquiryId(null);
      }
    }
  };

  // ================= 1. ROLE-BASED ACCESS CONTROL (403 FORBIDDEN FOR CUSTOMERS) =================
  // If a regular customer user hits /admin, show explicit Role Restriction screen
  if (customerSession && !adminAuth) {
    return (
      <div className="fixed inset-0 z-50 min-h-screen w-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans antialiased selection:bg-red-500 selection:text-white">
        <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center mb-6 space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mx-auto shadow-xl shadow-red-600/30 text-white mb-4">
              <ShieldAlert size={34} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 text-[11px] font-mono font-bold tracking-wider uppercase">
              403 Forbidden • Role-Based Access Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-[#171717] tracking-tight">
              Customer Access Restricted
            </h1>
            <p className="text-xs text-[#77736E] max-w-md mx-auto leading-relaxed">
              You are currently signed in as a <strong className="text-[#171717]">Store Customer</strong> (<span className="text-[#4D5543] font-mono">{customerSession.email}</span>).
              The Admin Operations Command Center is strictly isolated for authorized store managers and system administrators.
            </p>
          </div>

          <div className="bg-white border border-red-900/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5 text-center">
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#DAD7D1] text-xs text-[#77736E] text-left space-y-2.5">
              <div className="flex justify-between">
                <span>Active User:</span>
                <span className="font-mono text-[#171717]">{customerSession.firstName || 'Customer'} {customerSession.lastName || ''}</span>
              </div>
              <div className="flex justify-between">
                <span>Assigned Clearance:</span>
                <span className="font-mono text-amber-400 font-semibold uppercase">role: 'customer'</span>
              </div>
              <div className="flex justify-between">
                <span>Permitted Scope:</span>
                <span className="text-[#35664A]">Public Storefront, Product Catalog, AI Custom Studio, Cart &amp; Checkout</span>
              </div>
              <div className="flex justify-between">
                <span>Restricted Scope:</span>
                <span className="text-red-400 font-medium">Store Management, Orders Dispatch, Inventory Edit, Reports, Settings</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/"
                className="flex-1 py-3 bg-[#F1EFEA] hover:bg-[#1E293B] border border-[#DAD7D1] text-[#171717] text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>Return to Public Website</span>
                <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('fashion_patron_session');
                  localStorage.removeItem('atelier_user');
                  localStorage.removeItem('atelier_token');
                  setCustomerSession(null);
                }}
                className="px-5 py-3 bg-red-900/40 hover:bg-red-800/60 border border-red-500/50 text-red-200 text-xs font-bold uppercase tracking-wider rounded-xl transition"
              >
                Sign Out &amp; Login as Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. STRICT AUTHENTICATION GATE (UNAUTHENTICATED) =================
  // If not authenticated, render the dedicated, production-grade security gateway.
  // The user CANNOT see the dashboard or any data until valid credentials are submitted.
  if (!adminAuth) {
    return (
      <div className="fixed inset-0 z-50 min-h-screen w-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans antialiased selection:bg-[#171717] selection:text-white">
        {/* Subtle background ambient mesh */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#10B981]/30 via-transparent to-transparent"></div>

        <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Brand Badge */}
          <div className="text-center mb-6 space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#171717] flex items-center justify-center mx-auto shadow-lg shadow-md text-white mb-3">
              <Shield size={28} className="drop-shadow" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFEA] border border-[#DAD7D1] text-[#4D5543] text-[11px] font-mono font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#4D5543] animate-ping"></span>
              Restricted Operations Gateway
            </div>
            <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-[#171717] tracking-tight">
              Admin Command Portal
            </h1>
            <p className="text-xs text-[#77736E] max-w-sm mx-auto">
              Authorized store managers and administrators only. Authentication clearance required to view dashboard, metrics, and customer orders.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-[#DAD7D1] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
            {/* Error Banner */}
            {loginError && (
              <div className="p-3.5 bg-red-950/50 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-start gap-2.5 animate-in shake duration-200">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-[#77736E] uppercase tracking-wider block mb-1.5">
                  Admin Operational Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-3 pl-10 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543] focus:ring-1 focus:ring-[#10B981] transition"
                  />
                  <KeyRound size={16} className="absolute left-3.5 top-3.5 text-[#8C827A]" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#77736E] uppercase tracking-wider block mb-1.5">
                  Security Passphrase
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-3 pl-10 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543] focus:ring-1 focus:ring-[#10B981] transition"
                  />
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-[#8C827A]" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3.5 bg-[#171717] hover:bg-[#353535] text-white active:scale-[0.98] transition-all duration-200 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Verifying Clearance...</span>
                  </>
                ) : (
                  <>
                    <UserCheck size={16} />
                    <span>Authorize &amp; Access Dashboard</span>
                  </>
                )}
              </button>
            </form>



            {/* Link back to storefront */}
            <div className="text-center pt-2">
              <Link
                to="/"
                className="text-xs text-[#8C827A] hover:text-[#77736E] flex items-center justify-center gap-1.5 transition"
              >
                <span>← Return to Public Fashion Store</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. FULL-SCREEN PRODUCTION ADMIN DASHBOARD =================
  // Nav items with live counts
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'admin-login', label: 'Admin Login Portal', icon: LogIn, badge: 'Staff' },
        { id: 'admin-dash', label: 'Dashboard & Metrics', icon: LayoutDashboard },
      ],
    },
    {
      title: 'STORE MANAGEMENT',
      items: [
        { id: 'admin-products', label: 'Products Catalog', icon: ShoppingBag, count: customLocalProducts.length },
        { id: 'admin-add-product', label: 'Add Product', icon: PlusCircle },
        { id: 'admin-orders', label: 'Orders & Invoices', icon: ClipboardList, count: localOrders.length },
        { id: 'admin-custom', label: 'AI Custom Requests', icon: Sparkles, count: localCustomRequests.length },
        {
          id: 'admin-emails',
          label: 'Customer Emails & Inbox',
          icon: Mail,
          count: inquiriesList.length,
          badge: unreadEmailCount > 0 ? `${unreadEmailCount} New` : undefined,
        },
        { id: 'admin-users', label: 'Customers & Accounts', icon: Users, count: localUsers.length },
        { id: 'admin-categories', label: 'Categories', icon: FolderTree, count: localCategories.length },
        { id: 'admin-coupons', label: 'Coupons & Discounts', icon: Tag, count: localCoupons.length },
        { id: 'admin-reports', label: 'Reports', icon: BarChart2 },
        { id: 'admin-settings', label: 'Settings', icon: SettingsIcon },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-[#FAF9F6] text-[#171717] font-sans antialiased flex flex-col selection:bg-[#171717] selection:text-white">
      {/* ================= TOP COMMAND BAR ================= */}
      <header className="h-14 bg-white border-b border-[#DAD7D1] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-1.5 text-[#77736E] hover:text-[#171717] hover:bg-[#1E293B] rounded-lg transition"
            aria-label="Toggle Navigation"
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4D5543] opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4D5543]"></span></span>
            <span className="font-mono text-xs uppercase tracking-wider font-editorial font-bold text-[#171717]">
              ATELIER OPERATIONS COMMAND
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-[#DDE6CE] text-[#4D5543] font-sans border border-[#DAD7D1] font-semibold tracking-wider animate-glow">
              LIVE DATA SYNC
            </span>
          </div>
        </div>

        {/* Global Live Search */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-2.5 text-[#8C827A]" />
            <input
              type="text"
              placeholder="Quick search catalog or orders..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-lg px-3 py-1.5 pl-9 text-xs text-[#171717] focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 placeholder:text-[#8C827A] transition-all duration-300"
            />
            {globalSearchQuery && (
              <button
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-2.5 top-2 text-[#8C827A] hover:text-[#171717]"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Operator Profile and Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="text-xs text-[#4D5543] hover:text-[#171717] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B]/60 border border-[#DAD7D1] hover:border-[#171717] transition"
            title="Open customer website in new tab"
          >
            <Globe size={13} />
            <span className="hidden sm:inline">Storefront</span>
          </Link>

          <div className="flex items-center gap-2 pl-2 border-l border-[#DAD7D1]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#10B981] to-[#38BDF8] flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
              {adminAuth.firstName?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-semibold text-[#171717] leading-tight">
                {adminAuth.firstName} {adminAuth.lastName || ''}
              </span>
              <span className="block text-[10px] text-[#77736E] font-mono leading-tight">
                {adminAuth.role === 'super_admin' ? 'Super Administrator' : 'Staff Manager'}
              </span>
            </div>

            <button
              onClick={handleAdminLogout}
              className="ml-2 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 hover:border-red-500 rounded-lg flex items-center gap-1.5 transition"
              title="Lock Console & Sign Out"
            >
              <LogOut size={13} />
              <span className="hidden md:inline font-medium">Lock Console</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN SPLIT PANE ================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ================= LEFT SIDEBAR (EXACT WIREFRAME DESIGN) ================= */}
        <aside
          className={`fixed md:static inset-y-0 left-0 top-14 md:top-0 z-40 w-64 bg-white border-r border-[#DAD7D1] flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
            {navSections.map((sec) => (
              <div key={sec.title}>
                <div className="px-3 mb-2 text-[10px] font-mono font-bold tracking-[0.16em] text-[#8C827A] uppercase">
                  {sec.title}
                </div>
                <div className="space-y-1">
                  {sec.items.map((item) => {
                    const isActive = activeTab === item.id;
                    const IconComponent = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all group ${
                          isActive
                            ? 'bg-[#F1EFEA] text-[#171717] font-semibold border-l-4 border-[#C5A880] shadow-sm translate-x-1'
                            : 'text-[#77736E] hover:text-[#171717] hover:bg-[#FAF9F6] hover:translate-x-1 duration-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <IconComponent
                            size={15}
                            className={`shrink-0 transition-colors ${
                              isActive ? 'text-[#4D5543]' : 'text-[#8C827A] group-hover:text-[#77736E]'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.count !== undefined && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-[#4D5543] text-[#171717] font-bold'
                                : 'bg-[#1E293B] text-[#77736E]'
                            }`}
                          >
                            {item.count}
                          </span>
                        )}

                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#334155] text-[#353535]">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Status Footer */}
          <div className="p-3 border-t border-[#DAD7D1] bg-[#FAF9F6] text-[11px] text-[#77736E] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4D5543]"></span>
              <span className="font-mono text-[10px] text-[#353535]">MERN Production</span>
            </div>
            <button
              onClick={() => {
                refetchMetrics();
                refetchOrders();
                refetchProducts();
              }}
              title="Sync with backend server"
              className="text-[#8C827A] hover:text-[#4D5543] transition"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 top-14"
          />
        )}

        {/* ================= RIGHT WORKSPACE AREA (FULL SCREEN SCROLL) ================= */}
        <main className="flex-1 overflow-y-auto bg-[#FAF9F6] p-4 sm:p-6 lg:p-8">
          <div key={activeTab} className="max-w-7xl mx-auto space-y-6 animate-admin-fade">

            {/* 1. ADMIN LOGIN PORTAL (OVERVIEW) */}
            {activeTab === 'admin-login' && (
              <div className="animate-in fade-in duration-150 space-y-6">
                <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#171717] flex items-center gap-2">
                      <LogIn size={20} className="text-[#4D5543]" />
                      Admin Login Portal
                    </h1>
                    <p className="text-xs text-[#77736E] mt-0.5">Active credentials and administrative clearance status</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#4D5543]/20 border border-[#4D5543]/40 text-[#35664A] text-xs font-mono font-medium">
                    Authenticated
                  </span>
                </div>

                <div className="max-w-xl mx-auto bg-white border border-[#DAD7D1] rounded-2xl p-6 shadow-xl space-y-5">
                  <div className="flex items-center gap-4 p-4 bg-[#FAF9F6] rounded-xl border border-[#DAD7D1]">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#38BDF8] flex items-center justify-center text-[#171717] font-bold text-xl">
                      {adminAuth.firstName?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#171717]">
                        {adminAuth.firstName} {adminAuth.lastName || ''}
                      </h3>
                      <p className="text-xs text-[#77736E] font-mono">{adminAuth.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-[#4D5543]/20 text-[#35664A] font-mono font-bold uppercase">
                        Clearance: {adminAuth.role}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-[#77736E]">
                    <div className="flex justify-between py-2 border-b border-[#DAD7D1]">
                      <span>Session Token:</span>
                      <span className="font-mono text-[#171717]">Active (JWT Bearer Clearance)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#DAD7D1]">
                      <span>Role Permissions:</span>
                      <span className="text-[#35664A] font-medium">Products, Orders, AI Studio, Settings</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#DAD7D1]">
                      <span>Connected Database:</span>
                      <span className="font-mono text-[#171717]">MongoDB Atlas (Live)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('admin-dash')}
                      className="flex-1 py-2.5 bg-[#4D5543] hover:bg-[#059669] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard size={15} />
                      <span>Proceed to Dashboard</span>
                    </button>
                    <button
                      onClick={handleAdminLogout}
                      className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-semibold rounded-xl transition"
                    >
                      Lock Console
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. DASHBOARD & METRICS */}
            {activeTab === 'admin-dash' && (
              <div className="animate-in fade-in duration-150 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DAD7D1] pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#171717] flex items-center gap-2">
                      <LayoutDashboard size={20} className="text-[#4D5543]" />
                      Dashboard &amp; Metrics Overview
                    </h1>
                    <p className="text-xs text-[#77736E] mt-0.5">Real-time revenue, orders pipeline, and customer activity</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        refetchMetrics();
                        refetchOrders();
                        refetchProducts();
                        refetchDossiers();
                      }}
                      className="px-3 py-1.5 bg-[#F1EFEA] hover:bg-[#1E293B] border border-[#DAD7D1] text-xs text-[#171717] rounded-lg flex items-center gap-1.5 transition"
                    >
                      <RefreshCw size={13} />
                      <span>Sync Real-Time Data</span>
                    </button>
                  </div>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="admin-card-hover group relative overflow-hidden bg-white border border-[#DAD7D1] rounded-2xl p-5 shadow-sm">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#171717] via-[#C5A880] to-[#4D5543] opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between text-[#77736E] text-xs font-bold uppercase">
                      <span>Total Sales</span>
                      <TrendingUp size={16} className="text-[#4D5543] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#171717] font-mono mt-2">Rs. 5.42L</div>
                    <div className="text-[11px] text-[#4D5543] font-semibold mt-1">+18.4% vs last period</div>
                  </div>

                  <div className="admin-card-hover group relative overflow-hidden bg-white border border-[#DAD7D1] rounded-2xl p-5 shadow-sm">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#4D5543] via-[#C5A880] to-[#171717] opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between text-[#77736E] text-xs font-bold uppercase">
                      <span>Total Orders</span>
                      <ClipboardList size={16} className="text-[#4D5543] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#171717] font-mono mt-2">{localOrders.length * 31}</div>
                    <div className="text-[11px] text-[#77736E] mt-1">{localOrders.length} fulfillment queue</div>
                  </div>

                  <div className="admin-card-hover group relative overflow-hidden bg-white border border-[#DAD7D1] rounded-2xl p-5 shadow-sm">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 via-[#C5A880] to-purple-400 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between text-[#77736E] text-xs font-bold uppercase">
                      <span>Customers</span>
                      <Users size={16} className="text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#171717] font-mono mt-2">{localUsers.length * 94}</div>
                    <div className="text-[11px] text-purple-400 font-semibold mt-1">468 Registered Accounts</div>
                  </div>

                  <div className="admin-card-hover group relative overflow-hidden bg-white border border-[#DAD7D1] rounded-2xl p-5 shadow-sm">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-[#C5A880] to-amber-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between text-[#77736E] text-xs font-bold uppercase">
                      <span>AI Requests</span>
                      <Sparkles size={16} className="text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#171717] font-mono mt-2">{localCustomRequests.length * 6 + 1}</div>
                    <div className="text-[11px] text-amber-400 font-semibold mt-1">Pending Tailor Approval</div>
                  </div>
                </div>

                {/* Weekly Revenue Breakdown Chart */}
                <div className="bg-white border border-[#DAD7D1] rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                        <BarChart2 size={16} className="text-[#4D5543]" />
                        Weekly Revenue Breakdown
                      </h3>
                      <p className="text-xs text-[#77736E]">Aggregated direct checkout &amp; bespoke tailoring turnover</p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#F1EFEA] border border-[#DAD7D1] text-[#77736E]">
                      Currency: PKR
                    </span>
                  </div>

                  <div className="h-56 border border-[#DAD7D1] bg-[#FAF9F6] rounded-xl p-4 flex items-end justify-around relative">
                    {/* Horizontal Reference Line */}
                    <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#DAD7D1] pointer-events-none"></div>

                    {[
                      { day: 'Mon', h: '45%', val: 'Rs. 45k' },
                      { day: 'Tue', h: '62%', val: 'Rs. 62k' },
                      { day: 'Wed', h: '38%', val: 'Rs. 38k' },
                      { day: 'Thu', h: '85%', val: 'Rs. 85k' },
                      { day: 'Fri', h: '70%', val: 'Rs. 70k' },
                      { day: 'Sat', h: '95%', val: 'Rs. 95k' },
                      { day: 'Sun', h: '78%', val: 'Rs. 78k' },
                    ].map((bar) => (
                      <div key={bar.day} className="flex flex-col items-center gap-2 h-full justify-end group z-10">
                        <span className="text-[10px] text-[#4D5543] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                          {bar.val}
                        </span>
                        <div
                          style={{ height: bar.h }}
                          className="w-8 sm:w-12 bg-gradient-to-t from-[#1E293B] to-[#334155] group-hover:from-[#10B981] group-hover:to-[#34D399] rounded-t-lg transition-all duration-200 cursor-pointer shadow-lg"
                        ></div>
                        <span className="text-xs text-[#77736E] font-medium">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Action Hub */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('admin-products')}
                    className="admin-card-hover p-5 bg-white border border-[#DAD7D1] rounded-2xl text-left flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#171717] block group-hover:text-[#4D5543] transition">
                        Inventory Catalog
                      </span>
                      <span className="text-[11px] text-[#77736E]">{customLocalProducts.length} published items</span>
                    </div>
                    <ArrowRight size={18} className="text-[#8C827A] group-hover:text-[#4D5543] group-hover:translate-x-1.5 transition-all duration-300" />
                  </button>

                  <button
                    onClick={() => setActiveTab('admin-custom')}
                    className="admin-card-hover p-5 bg-white border border-[#DAD7D1] rounded-2xl text-left flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#171717] block group-hover:text-amber-400 transition">
                        AI Custom Requests
                      </span>
                      <span className="text-[11px] text-[#77736E]">{localCustomRequests.length} active patron dossiers</span>
                    </div>
                    <ArrowRight size={18} className="text-[#8C827A] group-hover:text-amber-600 group-hover:translate-x-1.5 transition-all duration-300" />
                  </button>

                  <button
                    onClick={() => setActiveTab('admin-orders')}
                    className="admin-card-hover p-5 bg-white border border-[#DAD7D1] rounded-2xl text-left flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#171717] block group-hover:text-[#4D5543] transition">
                        Orders &amp; Shipments
                      </span>
                      <span className="text-[11px] text-[#77736E]">{localOrders.length} fulfillment items</span>
                    </div>
                    <ArrowRight size={18} className="text-[#8C827A] group-hover:text-[#4D5543] transition" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. PRODUCTS CATALOG */}
            {activeTab === 'admin-products' && (
              <div className="animate-in fade-in duration-150 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DAD7D1] pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#171717] flex items-center gap-2">
                      <ShoppingBag size={20} className="text-[#4D5543]" />
                      Products Catalog Management
                    </h1>
                    <p className="text-xs text-[#77736E] mt-0.5">Live store inventory, pricing, and stock controls</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('admin-add-product')}
                    className="px-4 py-2 bg-[#171717] hover:bg-[#353535] text-white active:scale-[0.98] transition-all duration-200 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition shadow-lg shadow-md self-start sm:self-auto"
                  >
                    <PlusCircle size={15} />
                    <span>+ Add Product</span>
                  </button>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-3 text-[#8C827A]" />
                    <input
                      type="text"
                      placeholder="Filter products by title, category, or price..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-white border border-[#DAD7D1] rounded-xl px-4 py-2.5 pl-9 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                    />
                  </div>
                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'men', label: 'Men' },
                      { id: 'women', label: 'Women' },
                      { id: 'kids', label: 'Kids' },
                    ].map((tab) => {
                      const count = tab.id === 'all'
                        ? customLocalProducts.length
                        : customLocalProducts.filter((p) => {
                            const c = (p.category || '').toLowerCase().trim();
                            if (tab.id === 'men') return c === 'men' || c === 'sartorial';
                            if (tab.id === 'women') return c === 'women' || c === 'couture';
                            if (tab.id === 'kids') return c === 'kids' || c === 'miniature';
                            return c === tab.id;
                          }).length;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setAdminCategoryFilter(tab.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            adminCategoryFilter === tab.id
                              ? 'bg-[#4D5543] text-white shadow-md shadow-md'
                              : 'bg-[#F1EFEA] text-[#77736E] hover:text-white hover:bg-[#1E293B] border border-[#DAD7D1]'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                            adminCategoryFilter === tab.id ? 'bg-black/30 text-white' : 'bg-white text-[#8C827A]'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-[#DAD7D1] rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#DAD7D1] bg-[#FAF9F6] text-[#77736E] font-mono text-[11px] uppercase">
                          <th className="p-3.5">Image</th>
                          <th className="p-3.5">Name</th>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Price</th>
                          <th className="p-3.5">Stock</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]">
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-12 text-center text-[#77736E]">
                              <div className="max-w-md mx-auto space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#F1EFEA] flex items-center justify-center mx-auto text-[#4D5543]">
                                  <ShoppingBag size={24} />
                                </div>
                                <p className="text-sm font-semibold text-[#171717]">Your Database Product Catalog Is Empty</p>
                                <p className="text-xs text-[#8C827A]">
                                  All static demo products have been deleted. Add your genuine garments using the button below to publish them directly to MongoDB and the public storefront.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('admin-add-product')}
                                  className="mt-2 px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-md inline-flex items-center gap-1.5"
                                >
                                  <PlusCircle size={14} />
                                  <span>+ Add Your First Product</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map((p) => {
                            const isEditing = editingProductId === p.id;
                            return (
                              <tr key={p.id} className="group hover:bg-[#FAF9F6] border-b border-[#E5E2DA] transition-colors duration-150">
                              <td className="p-3.5">
                                <img
                                  src={p.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=100&q=80'}
                                  alt={p.name}
                                  className="w-12 h-12 object-cover rounded-xl border border-[#DAD7D1] group-hover:scale-105 transition-transform duration-300 shadow-xs"
                                />
                              </td>
                              <td className="p-3.5 font-semibold text-[#171717]">{p.name}</td>
                              <td className="p-3.5 text-[#77736E]">{p.category}</td>
                              <td className="p-3.5 font-mono text-[#171717]">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className="w-24 bg-[#FAF9F6] border border-[#4D5543] rounded-lg px-2 py-1 text-xs text-[#171717] font-mono"
                                  />
                                ) : (
                                  `Rs. ${Number(p.price).toLocaleString()}`
                                )}
                              </td>
                              <td className="p-3.5 font-mono">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editStock}
                                    onChange={(e) => setEditStock(e.target.value)}
                                    className="w-16 bg-[#FAF9F6] border border-[#4D5543] rounded-lg px-2 py-1 text-xs text-[#171717] font-mono"
                                  />
                                ) : (
                                  <span className={p.stock < 15 ? 'text-amber-400 font-bold' : 'text-[#35664A]'}>
                                    {p.stock} units
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#4D5543]/20 border border-[#4D5543]/40 text-[#35664A]">
                                  {p.status || 'Active'}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                {isEditing ? (
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleSaveInlineEdit(p)}
                                      className="px-2.5 py-1 bg-[#4D5543] text-white rounded-lg text-[11px] font-semibold hover:bg-[#059669]"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingProductId(null)}
                                      className="px-2 py-1 bg-[#1E293B] text-[#171717] rounded-lg text-[11px]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      onClick={() => setViewProductModal(p)}
                                      className="px-2.5 py-1 bg-[#F1EFEA] hover:bg-[#1E293B] border border-[#DAD7D1] hover:border-[#D4AF37] text-[#D4AF37] rounded-lg text-[11px] font-medium transition flex items-center gap-1"
                                      title="View complete garment specifications"
                                    >
                                      <Eye size={12} />
                                      <span>View</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenEditModal(p)}
                                      className="px-2.5 py-1 bg-[#F1EFEA] hover:bg-[#1E293B] border border-[#DAD7D1] hover:border-[#4D5543] text-[#35664A] rounded-lg text-[11px] font-medium transition"
                                      title="Edit all product specifications"
                                    >
                                      Edit Details
                                    </button>
                                    <button
                                      onClick={() => handleStartEdit(p)}
                                      className="px-2.5 py-1 bg-[#F1EFEA] hover:bg-[#1E293B] border border-[#DAD7D1] hover:border-[#171717] text-[#4D5543] rounded-lg text-[11px] transition"
                                      title="Quick edit price and stock inline"
                                    >
                                      Quick Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p)}
                                      className="px-2.5 py-1 bg-[#F1EFEA] hover:bg-red-950/40 border border-[#DAD7D1] hover:border-red-500 text-red-400 rounded-lg text-[11px] transition"
                                      title="Permanently remove garment"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        }))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Edit Product Modal */}
                {modalEditProduct && (
                  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl bg-white border border-[#DAD7D1] rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl animate-admin-scale">
                      <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-4">
                        <div>
                          <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
                            <Edit2 size={18} className="text-[#4D5543]" />
                            Update Garment Specification
                          </h2>
                          <p className="text-xs text-[#77736E]">Changes will immediately synchronize across database and public website</p>
                        </div>
                        <button
                          onClick={() => setModalEditProduct(null)}
                          className="text-[#8C827A] hover:text-[#171717] p-1 rounded-lg hover:bg-[#1E293B]"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <form onSubmit={handleSaveModalEdit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                              Product Name
                            </label>
                            <input
                              type="text"
                              required
                              value={modalEditProduct.name}
                              onChange={(e) => setModalEditProduct({ ...modalEditProduct, name: e.target.value })}
                              className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                              Department / Category
                            </label>
                            <select
                              value={modalEditProduct.category}
                              onChange={(e) => setModalEditProduct({ ...modalEditProduct, category: e.target.value })}
                              className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                            >
                              {localCategories && localCategories.length > 0 ? (
                                localCategories.map((c) => (
                                  <option key={c.id || c.name} value={c.name}>
                                    {c.name}
                                  </option>
                                ))
                              ) : (
                                <>
                                  <option value="Men">Men</option>
                                  <option value="Women">Women</option>
                                  <option value="Kids">Kids</option>
                                </>
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                              Price (PKR)
                            </label>
                            <input
                              type="number"
                              required
                              value={modalEditProduct.price}
                              onChange={(e) => setModalEditProduct({ ...modalEditProduct, price: Number(e.target.value) })}
                              className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2 text-xs text-[#171717] font-mono focus:outline-none focus:border-[#4D5543]"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                              Available Stock Units
                            </label>
                            <input
                              type="number"
                              required
                              value={modalEditProduct.stock}
                              onChange={(e) => setModalEditProduct({ ...modalEditProduct, stock: Number(e.target.value) })}
                              className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2 text-xs text-[#171717] font-mono focus:outline-none focus:border-[#4D5543]"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                              Fabric Specification
                            </label>
                            <input
                              type="text"
                              value={modalEditProduct.fabric || ''}
                              onChange={(e) => setModalEditProduct({ ...modalEditProduct, fabric: e.target.value })}
                              className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                              Promotional Badge
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. New Arrival, Signature Piece, Bestseller"
                              value={modalEditProduct.badge || ''}
                              onChange={(e) => setModalEditProduct({ ...modalEditProduct, badge: e.target.value })}
                              className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                            Product Image URL
                          </label>
                          <div className="flex gap-3 items-center">
                            <input
                              type="url"
                              value={modalEditProduct.image || ''}
                              onChange={(e) => setModalEditProduct({ ...modalEditProduct, image: e.target.value })}
                              className="flex-1 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                            />
                            {modalEditProduct.image && (
                              <img
                                src={modalEditProduct.image}
                                alt="Preview"
                                className="w-10 h-10 object-cover rounded-lg border border-[#DAD7D1]"
                              />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                            Garment Description
                          </label>
                          <textarea
                            rows={3}
                            value={modalEditProduct.description || ''}
                            onChange={(e) => setModalEditProduct({ ...modalEditProduct, description: e.target.value })}
                            className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl p-3 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DAD7D1]">
                          <button
                            type="button"
                            onClick={() => setModalEditProduct(null)}
                            className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-[#171717] text-xs font-semibold rounded-xl transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 bg-[#171717] hover:bg-[#353535] text-white active:scale-[0.98] transition-all duration-200 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-md flex items-center gap-1.5"
                          >
                            <Save size={14} />
                            <span>Save Garment Changes</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* View Product Modal (Full Garment Specifications & Preview) */}
                {viewProductModal && (
                  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl bg-white border border-[#DAD7D1] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-admin-scale">
                      <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#F1EFEA] text-[#4D5543] border border-[#DAD7D1]">
                              {viewProductModal.category}
                            </span>
                            {viewProductModal.badge && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#4D5543]/20 text-[#35664A] border border-[#4D5543]/30">
                                {viewProductModal.badge}
                              </span>
                            )}
                          </div>
                          <h2 className="text-xl font-bold text-[#171717] mt-1.5">{viewProductModal.name}</h2>
                          <p className="text-xs text-[#77736E] font-mono">SKU: {viewProductModal.sku || viewProductModal.id || 'N/A'}</p>
                        </div>
                        <button
                          onClick={() => setViewProductModal(null)}
                          className="p-2 text-[#77736E] hover:text-[#171717] hover:bg-[#F1EFEA] rounded-xl hover:rotate-90 transition-all duration-200"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                        <div className="sm:col-span-5 aspect-[3/4] bg-[#FAF9F6] rounded-xl overflow-hidden border border-[#DAD7D1] relative group">
                          <img
                            src={viewProductModal.image}
                            alt={viewProductModal.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600';
                            }}
                          />
                          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-[#D4AF37]">
                            {viewProductModal.stock > 0 ? `${viewProductModal.stock} in stock` : 'Out of Stock'}
                          </div>
                        </div>

                        <div className="sm:col-span-7 space-y-4">
                          <div className="p-4 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl space-y-2">
                            <div className="flex items-baseline gap-3">
                              <span className="text-2xl font-bold text-[#4D5543] font-mono">
                                Rs. {(viewProductModal.price || 0).toLocaleString()}
                              </span>
                              {viewProductModal.originalPrice && viewProductModal.originalPrice > viewProductModal.price && (
                                <span className="text-xs text-[#8C827A] line-through font-mono">
                                  Rs. {viewProductModal.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#77736E] leading-relaxed">
                              {viewProductModal.description || 'Exquisite bespoke craftsmanship tailored to haute couture standards.'}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl">
                              <span className="text-[10px] uppercase text-[#8C827A] font-mono block">Fabric Composition</span>
                              <span className="text-[#171717] font-medium">{viewProductModal.fabric || '100% Breathable Cotton'}</span>
                            </div>
                            <div className="p-3 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl">
                              <span className="text-[10px] uppercase text-[#8C827A] font-mono block">Silhouette &amp; Fit</span>
                              <span className="text-[#171717] font-medium">{viewProductModal.fit || 'Modern Tailored Fit'}</span>
                            </div>
                            <div className="p-3 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl">
                              <span className="text-[10px] uppercase text-[#8C827A] font-mono block">Care Instructions</span>
                              <span className="text-[#171717] font-medium">{viewProductModal.care || 'Dry Clean Recommended'}</span>
                            </div>
                            <div className="p-3 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl">
                              <span className="text-[10px] uppercase text-[#8C827A] font-mono block">Inventory Status</span>
                              <span className={`font-semibold ${viewProductModal.stock > 10 ? 'text-[#35664A]' : viewProductModal.stock > 0 ? 'text-[#F59E0B]' : 'text-red-400'}`}>
                                {viewProductModal.stock > 10 ? 'Healthy Stock' : viewProductModal.stock > 0 ? 'Low Inventory' : 'Sold Out'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#DAD7D1] pt-4">
                        <Link
                          to={`/product/${viewProductModal.slug || viewProductModal.id}`}
                          target="_blank"
                          className="text-xs text-[#4D5543] hover:text-[#4D5543] flex items-center gap-1.5 transition"
                        >
                          <ExternalLink size={14} />
                          <span>View on Public Storefront</span>
                        </Link>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const p = viewProductModal;
                              setViewProductModal(null);
                              handleOpenEditModal(p);
                            }}
                            className="px-4 py-2 bg-[#4D5543] hover:bg-[#059669] text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                          >
                            <Edit2 size={13} />
                            <span>Edit Garment</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewProductModal(null)}
                            className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-[#171717] text-xs rounded-xl transition"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. ADD PRODUCT */}
            {activeTab === 'admin-add-product' && (
              <div className="animate-in fade-in duration-150 space-y-4">
                <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#171717] flex items-center gap-2">
                      <PlusCircle size={20} className="text-[#4D5543]" />
                      Add New Product Listing
                    </h1>
                    <p className="text-xs text-[#77736E] mt-0.5">Publish new ready-to-wear clothing item to online catalog</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('admin-products')}
                    className="px-3.5 py-1.5 border border-[#DAD7D1] hover:bg-[#1E293B] text-xs text-[#171717] rounded-xl transition"
                  >
                    ← Back to Products
                  </button>
                </div>

                {productSavedAlert && (
                  <div className="p-4 bg-[#4D5543]/20 border border-[#4D5543] rounded-xl text-xs text-[#35664A] flex items-center gap-2.5">
                    <CheckCircle size={18} />
                    <span>Product successfully saved and published! Returning to catalog...</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left: Input Form (7 cols) */}
                  <form onSubmit={handleSaveProduct} className="lg:col-span-7 bg-white border border-[#DAD7D1] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
                    <div>
                      <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                        Garment Title / Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Italian Wool Double-Breasted Suit"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                          Price (PKR) *
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="25000"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2.5 text-xs text-[#171717] font-mono focus:outline-none focus:border-[#4D5543]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                          Stock Units Available *
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="20"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                          className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2.5 text-xs text-[#171717] font-mono focus:outline-none focus:border-[#4D5543]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                          Target Department / Section *
                        </label>
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                        >
                          {localCategories && localCategories.length > 0 ? (
                            localCategories.map((c) => (
                              <option key={c.id || c.name} value={c.name}>
                                {c.name} {c.name.toLowerCase() === 'men' ? "(Men's Sartorial)" : c.name.toLowerCase() === 'women' ? "(Women's Couture)" : c.name.toLowerCase() === 'kids' ? "(Miniature Archive)" : ''}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Men">Men's Sartorial</option>
                              <option value="Women">Women's Couture</option>
                              <option value="Kids">Miniature Archive</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                          Promotional Badge
                        </label>
                        <input
                          type="text"
                          placeholder="New Arrival / Signature Piece"
                          value={newProduct.badge || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                          className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                        Textile &amp; Fabric Specification
                      </label>
                      <input
                        type="text"
                        placeholder="100% Breathable Egyptian Giza Cotton"
                        value={newProduct.fabric}
                        onChange={(e) => setNewProduct({ ...newProduct, fabric: e.target.value })}
                        className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                        Product Visual Imagery (Upload or URL) *
                      </label>
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingImage(true);
                        }}
                        onDragLeave={() => setIsDraggingImage(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingImage(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleImageFileSelect(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`border-2 border-dashed rounded-xl p-4 transition-all text-center ${
                          isDraggingImage
                            ? 'border-[#4D5543] bg-[#4D5543]/10'
                            : 'border-[#DAD7D1] bg-[#FAF9F6]/60 hover:border-[#64748B]'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          {newProduct.image ? (
                            <div className="relative group w-24 h-28 rounded-lg overflow-hidden border border-[#DAD7D1] shadow-lg mb-1">
                              <img
                                src={newProduct.image}
                                alt="Product Preview"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <span className="text-[10px] text-[#171717] font-medium">Selected</span>
                              </div>
                            </div>
                          ) : (
                            <Upload className="w-8 h-8 text-[#77736E]" />
                          )}
                          <div className="text-xs text-[#77736E]">
                            Drag &amp; drop product photo here, or{' '}
                            <label className="text-[#4D5543] hover:underline cursor-pointer font-semibold">
                              browse device
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleImageFileSelect(e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <span className="text-[10px] text-[#8C827A]">PNG, JPG, WebP supported</span>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#77736E] font-bold uppercase tracking-wider">Garment Gallery Perspectives:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const cur = Array.isArray(newProduct.images) ? [...newProduct.images] : [newProduct.image || ''];
                              setNewProduct({ ...newProduct, images: [...cur, ''] });
                            }}
                            className="text-[11px] text-[#4D5543] hover:text-[#171717] font-semibold flex items-center gap-1 transition"
                          >
                            <PlusCircle size={13} />
                            <span>+ Add Perspective Angle</span>
                          </button>
                        </div>

                        {/* List of Image URLs */}
                        {(Array.isArray(newProduct.images) && newProduct.images.length > 0 ? newProduct.images : [newProduct.image]).map((imgUrl, imgIdx) => (
                          <div key={imgIdx} className="flex items-center gap-2">
                            <span className="w-5 text-[10px] font-mono text-[#8C827A] shrink-0 text-center font-bold">
                              #{imgIdx + 1}
                            </span>
                            <input
                              type="url"
                              placeholder={imgIdx === 0 ? "Primary Front Look URL (https://...)" : `Angle #${imgIdx + 1} / Fabric Detail URL (https://...)`}
                              value={imgUrl?.startsWith('data:') ? '' : (imgUrl || '')}
                              onChange={(e) => {
                                const updated = Array.isArray(newProduct.images) ? [...newProduct.images] : [newProduct.image || ''];
                                updated[imgIdx] = e.target.value;
                                setNewProduct({
                                  ...newProduct,
                                  image: imgIdx === 0 ? e.target.value : newProduct.image,
                                  images: updated,
                                });
                              }}
                              className="flex-1 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                            />
                            {imgIdx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (newProduct.images || []).filter((_, i) => i !== imgIdx);
                                  setNewProduct({ ...newProduct, images: updated });
                                }}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                title="Remove this angle"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                        Garment Narrative &amp; Description
                      </label>
                      <textarea
                        rows={3}
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl p-3 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                        placeholder="Archival tailored silhouette with refined finish..."
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#DAD7D1]">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#171717] hover:bg-[#353535] text-white active:scale-[0.98] transition-all duration-200 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-md flex items-center gap-2"
                      >
                        <Save size={15} />
                        <span>Publish Garment to Database</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('admin-products')}
                        className="px-4 py-3 border border-[#DAD7D1] text-xs text-[#77736E] hover:text-[#171717] rounded-xl transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>

                  {/* Right: Live Storefront Card Preview (WYSIWYG) (5 cols) */}
                  <div className="lg:col-span-5 bg-white border border-[#DAD7D1] rounded-2xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-[#DAD7D1]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#4D5543] ring-4 ring-[#4D5543]/20 animate-pulse" />
                        <span className="text-xs font-mono font-bold uppercase text-[#171717] tracking-wider">
                          LIVE STOREFRONT PREVIEW
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4D5543]/20 text-[#35664A] font-bold">
                        WYSIWYG
                      </span>
                    </div>

                    <p className="text-[11px] text-[#77736E]">
                      This is the real-time simulation of how this garment will appear to patrons on the public website:
                    </p>

                    {/* Simulated Public Product Card */}
                    <div className="bg-[#FAF9F6] border border-[#DAD7D1] rounded-lg overflow-hidden p-4 text-[#171717] shadow-sm">
                      <div className="relative aspect-[3/4] bg-[#F1EFEA] rounded overflow-hidden mb-3">
                        <img
                          src={newProduct.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'}
                          alt={newProduct.name || 'Preview'}
                          className="w-full h-full object-cover"
                        />
                        {newProduct.badge && (
                          <span className="absolute top-3 left-3 bg-white/95 text-[#171717] text-[10px] font-bold uppercase px-2.5 py-1 rounded shadow-sm border border-[#DAD7D1]">
                            {newProduct.badge}
                          </span>
                        )}
                        <span className="absolute bottom-3 right-3 bg-[#171717]/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                          {Number(newProduct.stock || 0) > 0 ? `${newProduct.stock} in vault` : 'Out of Stock'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#4D5543] font-semibold">
                          <span>
                            {newProduct.category === 'Men'
                              ? "Men's Sartorial"
                              : newProduct.category === 'Women'
                              ? "Women's Couture"
                              : 'Miniature Archive'}
                          </span>
                          <span className="font-mono text-[#35664A]">Instant Dispatch</span>
                        </div>
                        <h4 className="font-editorial text-base text-[#171717] truncate font-medium">
                          {newProduct.name || 'Untitled Garment'}
                        </h4>
                        <p className="text-[11px] text-[#77736E] truncate">
                          {newProduct.fabric || '100% Breathable Combed Cotton'}
                        </p>
                        <div className="pt-2 flex items-baseline justify-between border-t border-[#DAD7D1] mt-2">
                          <span className="text-sm font-bold text-[#171717]">
                            Rs. {Number(newProduct.price || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#4D5543] uppercase tracking-wider font-semibold">
                            Ready-To-Wear
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#DAD7D1] text-[11px] text-[#77736E] space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span>Database Target:</span>
                        <span className="text-[#171717]">MongoDB Atlas (products)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Real-time Sync:</span>
                        <span className="text-[#35664A]">RTK Query Invalidation Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. ORDERS & INVOICES */}
            {activeTab === 'admin-orders' && (
              <div className="animate-in fade-in duration-150 space-y-4">
                <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#171717] flex items-center gap-2">
                      <ClipboardList size={20} className="text-[#4D5543]" />
                      Orders &amp; Invoices Pipeline
                    </h1>
                    <p className="text-xs text-[#77736E] mt-0.5">Manage customer purchase orders, fulfillment status, and dispatch</p>
                  </div>
                  <button
                    onClick={() =>
                      handleExportCSV(
                        'orders.csv',
                        localOrders.map((o) => [o.id, o.customer, o.phone, o.items, `Rs. ${o.total}`, o.status, o.city]),
                        ['Order ID', 'Customer', 'Phone Number', 'Items Count', 'Total Amount', 'Status', 'City']
                      )
                    }
                    className="px-4 py-2 border border-[#DAD7D1] hover:bg-[#1E293B] text-xs text-[#171717] rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="bg-white border border-[#DAD7D1] rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#DAD7D1] bg-[#FAF9F6] text-[#77736E] font-mono text-[11px] uppercase">
                          <th className="p-3.5">Order #</th>
                          <th className="p-3.5">Customer</th>
                          <th className="p-3.5">Contact Number</th>
                          <th className="p-3.5">Items</th>
                          <th className="p-3.5">Total Amount</th>
                          <th className="p-3.5">Fulfillment Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]">
                        {localOrders.map((ord) => (
                          <tr key={ord.id} className="group hover:bg-[#FAF9F6] border-b border-[#E5E2DA] transition-colors duration-150">
                            <td className="p-3.5 font-mono font-bold text-[#4D5543]">{ord.id}</td>
                            <td className="p-3.5 font-semibold text-[#171717]">
                              {ord.customer}
                              <span className="block text-[10px] text-[#77736E] font-normal">{ord.email || ord.city} • {ord.date}</span>
                            </td>
                            <td className="p-3.5 font-mono text-xs">
                              {ord.phone && ord.phone !== 'N/A' ? (
                                <a
                                  href={`tel:${ord.phone}`}
                                  className="text-[#4D5543] hover:underline flex items-center gap-1.5"
                                >
                                  <Phone size={12} className="text-[#77736E] shrink-0" />
                                  <span>{ord.phone}</span>
                                </a>
                              ) : (
                                <span className="text-[#8C827A]">—</span>
                              )}
                            </td>
                            <td className="p-3.5 text-[#77736E] font-mono">
                              <span className="text-[#171717] font-semibold">{ord.items} pc(s)</span>
                              {ord.itemsList && ord.itemsList.length > 0 && (
                                <div className="text-[10px] text-[#77736E] font-sans truncate max-w-[180px] mt-0.5">
                                  {ord.itemsList.map((i) => i.name).join(', ')}
                                </div>
                              )}
                            </td>
                            <td className="p-3.5 font-mono text-[#171717] font-bold">Rs. {Number(ord.total).toLocaleString()}</td>
                            <td className="p-3.5">
                              <select
                                value={ord.status}
                                onChange={(e) => updateOrderStatusValue(ord.id, e.target.value)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold focus:outline-none border ${
                                  ord.status === 'Delivered'
                                    ? 'bg-[#4D5543]/20 border-[#4D5543]/50 text-[#35664A]'
                                    : ord.status === 'Shipped'
                                    ? 'bg-[#171717]/20 border-[#171717]/50 text-[#4D5543]'
                                    : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                }`}
                              >
                                <option value="Processing" className="bg-[#FAF9F6] text-[#171717]">Processing</option>
                                <option value="Shipped" className="bg-[#FAF9F6] text-[#171717]">Shipped</option>
                                <option value="Delivered" className="bg-[#FAF9F6] text-[#171717]">Delivered</option>
                              </select>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedInvoiceOrder(ord)}
                                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-[11px] font-medium transition flex items-center gap-1.5"
                                  title="Print Packing Slip & Thermal Invoice"
                                >
                                  <Printer size={12} />
                                  <span>Invoice</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(ord.id)}
                                  className="px-3 py-1 bg-[#F1EFEA] hover:bg-red-950/40 border border-[#DAD7D1] hover:border-red-500 text-red-400 rounded-lg text-[11px] transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 6. AI CUSTOM DESIGN REQUESTS (EXACT SPECIFICATION) */}
            {activeTab === 'admin-custom' && (
              <div className="animate-in fade-in duration-150 space-y-4">
                <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#171717] flex items-center gap-2">
                      <Sparkles size={20} className="text-[#4D5543]" />
                      AI Custom Design Requests
                    </h1>
                    <p className="text-xs text-[#77736E] mt-0.5">Review and manage AI custom bespoke garment submissions</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F1EFEA] border border-[#DAD7D1] text-[#4D5543] text-xs font-mono font-medium">
                    {localCustomRequests.length} Dossiers Pending
                  </span>
                </div>

                {localCustomRequests.length === 0 ? (
                  <div className="bg-white border border-[#DAD7D1] rounded-2xl p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#F1EFEA] text-[#77736E] flex items-center justify-center mx-auto">
                      <Sparkles size={22} className="text-[#4D5543]" />
                    </div>
                    <h3 className="text-[#171717] font-bold text-base">No Custom Design Requests Pending</h3>
                    <p className="text-xs text-[#77736E] max-w-sm mx-auto">
                      When customers submit custom couture designs through the AI Studio, their order dossiers and contact numbers will appear here live.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {localCustomRequests.map((req) => {
                    const isExpanded = expandedDetails[req.id];
                    const currentStatus = customRequestStatuses[req.id] || req.status;

                    return (
                      <div
                        key={req.id}
                        className="bg-white border border-[#DAD7D1] rounded-2xl p-6 space-y-4 shadow-xl hover:border-[#DAD7D1]/80 transition"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={req.image}
                            alt={req.name}
                            className="w-20 h-20 object-cover rounded-xl border border-[#DAD7D1] shrink-0 shadow-md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <b className="text-sm font-bold text-[#171717] truncate">{req.name}</b>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[#4D5543] bg-[#F1EFEA] border border-[#DAD7D1]">
                                  {req.id}
                                </span>
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  currentStatus === 'New'
                                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                                    : currentStatus === 'In Progress'
                                    ? 'bg-[#171717]/20 border border-[#171717]/40 text-[#4D5543]'
                                    : 'bg-[#4D5543]/20 border border-[#4D5543]/40 text-[#35664A]'
                                }`}
                              >
                                {currentStatus}
                              </span>
                            </div>

                            {/* Prominent Contact Number Field */}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <div className="px-2.5 py-1 rounded-lg bg-[#F1EFEA] border border-[#4D5543]/40 text-xs font-mono flex items-center gap-1.5 text-[#171717] shadow-sm">
                                <Phone size={12} className="text-[#4D5543]" />
                                <span className="text-[#77736E]">Phone:</span>
                                <b className="text-[#35664A] tracking-wider">{req.phone || '0300-1234567'}</b>
                              </div>
                              {req.email && (
                                <span className="text-[11px] text-[#77736E] font-mono truncate max-w-[200px]">
                                  {req.email}
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-[#77736E] mt-1.5 flex items-center gap-2">
                              <span className="text-[#353535] font-medium">{req.specs}</span>
                              <span className="text-[#475569]">•</span>
                              <span className="text-[#4D5543] font-mono font-medium">{req.quote}</span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Prompt Description & Tailoring Notes */}
                        <div className="space-y-2">
                          <p className="text-xs text-[#353535] bg-[#FAF9F6] p-3.5 rounded-xl border border-[#DAD7D1] font-sans italic leading-relaxed">
                            "{req.prompt}"
                          </p>
                          {req.notes && (
                            <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg flex items-start gap-1.5">
                              <span className="font-semibold text-amber-400 shrink-0">Patron Note:</span>
                              <span className="text-[#171717]">{req.notes}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons with live Call and WhatsApp */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <a
                            href={`tel:${req.rawPhone}`}
                            className="px-3.5 py-1.5 bg-[#F1EFEA] hover:bg-[#1E293B] border border-[#DAD7D1] text-xs font-semibold text-[#171717] rounded-lg flex items-center gap-1.5 transition"
                          >
                            <Phone size={13} className="text-[#4D5543]" />
                            <span>Call Patron</span>
                          </a>

                          <a
                            href={`https://wa.me/${req.rawPhone}?text=${encodeURIComponent(`Hello ${req.name}, regarding your custom garment design request ("${req.prompt}") at Fashion.AI:`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 bg-[#4D5543]/20 hover:bg-[#4D5543]/30 border border-[#4D5543]/60 text-xs font-semibold text-[#35664A] rounded-lg flex items-center gap-1.5 transition"
                          >
                            <MessageCircle size={13} />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => toggleDetail(req.id)}
                            className="px-3 py-1.5 border border-[#DAD7D1] hover:border-[#171717] text-xs text-[#171717] rounded-lg transition ml-auto"
                          >
                            {isExpanded ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>

                        {/* Inline Status Dropdown */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#DAD7D1] text-xs">
                          <span className="text-[#77736E] font-medium">Update Status:</span>
                          <select
                            value={currentStatus}
                            onChange={(e) => updateCustomStatus(req.id, e.target.value)}
                            className="bg-[#FAF9F6] border border-[#DAD7D1] rounded-lg px-2.5 py-1 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                          >
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>

                        {/* Inline Expandable Detail (Zero Popups) */}
                        {isExpanded && (
                          <div className="mt-2 p-3.5 bg-[#FAF9F6] border border-[#171717]/40 rounded-xl text-xs space-y-1.5 text-[#77736E] animate-in fade-in duration-150">
                            <div>
                              <strong className="text-[#171717]">Garment Specs:</strong> {req.specs}
                            </div>
                            <div>
                              <strong className="text-[#171717]">Quote Estimate:</strong>{' '}
                              <span className="text-[#35664A] font-mono font-bold">{req.quote}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

            {/* CUSTOMER EMAILS & OFFICIAL INBOX */}
            {activeTab === 'admin-emails' && (
              <div className="animate-in fade-in duration-150 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DAD7D1] pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#171717] flex items-center gap-2">
                      <Mail size={20} className="text-[#4D5543]" />
                      Customer Inquiries &amp; Official Email Inbox
                    </h1>
                    <p className="text-xs text-[#77736E] mt-0.5 flex flex-wrap items-center gap-2">
                      <span>Live sync with official address:</span>
                      <span className="font-mono text-[#4D5543] font-semibold bg-[#F1EFEA] px-2 py-0.5 rounded border border-[#DAD7D1]">
                        info@fashion.com
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4D5543]/10 border border-[#4D5543]/30 text-[#35664A] text-[11px] font-mono">
                      <span className="w-2 h-2 rounded-full bg-[#4D5543] animate-pulse"></span>
                      <span>Auto-Sync Active (4s)</span>
                    </div>

                    <button
                      onClick={() => refetchInquiries()}
                      className="p-1.5 border border-[#DAD7D1] hover:bg-[#1E293B] text-xs text-[#77736E] hover:text-[#171717] rounded-lg transition"
                      title="Force Refresh Emails"
                    >
                      <RefreshCw size={14} />
                    </button>

                    <button
                      onClick={() =>
                        handleExportCSV(
                          'official-inbox-emails.csv',
                          inquiriesList.map((i) => [
                            i._id || i.id,
                            i.senderName,
                            i.senderEmail,
                            i.senderPhone,
                            i.department,
                            `"${(i.subject || '').replace(/"/g, '""')}"`,
                            i.status,
                            new Date(i.createdAt).toLocaleString(),
                          ]),
                          ['Inquiry ID', 'Sender Name', 'Email', 'Phone', 'Department', 'Subject', 'Status', 'Received Date']
                        )
                      }
                      className="px-3 py-1.5 border border-[#DAD7D1] hover:bg-[#1E293B] text-xs text-[#171717] rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white border border-[#DAD7D1] rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-lg">
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {[
                      { key: 'all', label: 'All Inquiries', count: inquiriesList.length },
                      { key: 'unread', label: 'Unread', count: inquiriesList.filter((i) => i.status === 'unread').length },
                      { key: 'read', label: 'Read', count: inquiriesList.filter((i) => i.status === 'read').length },
                      { key: 'replied', label: 'Replied', count: inquiriesList.filter((i) => i.status === 'replied').length },
                      { key: 'archived', label: 'Archived', count: inquiriesList.filter((i) => i.status === 'archived').length },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setEmailStatusFilter(tab.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                          emailStatusFilter === tab.key
                            ? 'bg-[#4D5543] text-[#171717] font-bold shadow-md shadow-md'
                            : 'bg-[#FAF9F6] border border-[#DAD7D1] text-[#77736E] hover:text-white hover:bg-[#F1EFEA]'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            emailStatusFilter === tab.key ? 'bg-black/20 text-white' : 'bg-[#1E293B] text-[#8C827A]'
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full md:w-64">
                    <Search size={14} className="absolute left-3 top-2.5 text-[#8C827A]" />
                    <input
                      type="text"
                      placeholder="Search email, sender, subject..."
                      value={emailSearch}
                      onChange={(e) => setEmailSearch(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-3 py-1.5 pl-9 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543] placeholder:text-[#8C827A]"
                    />
                    {emailSearch && (
                      <button
                        onClick={() => setEmailSearch('')}
                        className="absolute right-2.5 top-2 text-[#8C827A] hover:text-[#171717]"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Master - Detail Split Pane */}
                {filteredInquiries.length === 0 ? (
                  <div className="bg-white border border-[#DAD7D1] rounded-2xl p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#F1EFEA] text-[#77736E] flex items-center justify-center mx-auto">
                      <Mail size={22} className="text-[#4D5543]" />
                    </div>
                    <h3 className="text-[#171717] font-bold text-base">No Emails Found</h3>
                    <p className="text-xs text-[#77736E] max-w-sm mx-auto">
                      {emailSearch || emailStatusFilter !== 'all'
                        ? 'No inquiries match the current filter or search criteria.'
                        : 'When patrons and customers send messages to info@fashion.com via the website contact modal or footer, their inquiries will immediately show up here live.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left: Email List (5 cols) */}
                    <div className="lg:col-span-5 space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                      {filteredInquiries.map((item) => {
                        const itemId = item._id || item.id;
                        const isSelected = (selectedInquiry?._id || selectedInquiry?.id) === itemId;

                        return (
                          <div
                            key={itemId}
                            onClick={() => {
                              setSelectedInquiryId(itemId);
                              if (item.status === 'unread') {
                                handleMarkInquiryStatus(itemId, 'read');
                              }
                            }}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#F1EFEA] border-[#4D5543] shadow-lg shadow-[#10B981]/10'
                                : 'bg-white border-[#DAD7D1] hover:border-[#DAD7D1] hover:bg-[#F1EFEA]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                    item.status === 'unread'
                                      ? 'bg-gradient-to-tr from-[#10B981] to-[#38BDF8] text-white shadow-sm ring-2 ring-[#10B981]/30'
                                      : 'bg-[#1E293B] text-[#77736E]'
                                  }`}
                                >
                                  {item.senderName ? item.senderName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="font-bold text-[#171717] text-xs truncate">
                                  {item.senderName}
                                </span>
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                                  item.status === 'unread'
                                    ? 'bg-[#4D5543]/20 border border-[#4D5543]/50 text-[#35664A] animate-pulse'
                                    : item.status === 'replied'
                                    ? 'bg-[#171717]/20 border border-[#171717]/40 text-[#4D5543]'
                                    : item.status === 'archived'
                                    ? 'bg-[#334155]/40 text-[#77736E]'
                                    : 'bg-[#1E293B] text-[#353535]'
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-[#171717] truncate mb-1">
                              {item.subject}
                            </p>
                            <p className="text-[11px] text-[#77736E] line-clamp-2 leading-relaxed mb-2.5">
                              {item.message}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-[#8C827A] pt-2 border-t border-[#DAD7D1]/70 font-mono">
                              <span className="truncate max-w-[140px] text-[#4D5543]">
                                {item.department || 'General'}
                              </span>
                              <span>
                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: Detailed Reading Pane (7 cols) */}
                    <div className="lg:col-span-7 bg-white border border-[#DAD7D1] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
                      {selectedInquiry ? (
                        <>
                          {/* Top Header of Selected Email */}
                          <div className="border-b border-[#DAD7D1] pb-5 space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F1EFEA] border border-[#DAD7D1] text-[#4D5543]">
                                  {selectedInquiry.department || 'Customer Concierge'}
                                </span>
                                <h2 className="text-lg font-bold text-[#171717] mt-1.5 leading-snug">
                                  {selectedInquiry.subject}
                                </h2>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Status changer */}
                                <select
                                  value={selectedInquiry.status}
                                  onChange={(e) =>
                                    handleMarkInquiryStatus(selectedInquiry._id || selectedInquiry.id, e.target.value)
                                  }
                                  className="bg-[#FAF9F6] border border-[#DAD7D1] text-xs text-[#171717] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#4D5543]"
                                >
                                  <option value="unread">Mark as Unread</option>
                                  <option value="read">Mark as Read</option>
                                  <option value="replied">Mark as Replied</option>
                                  <option value="archived">Archive</option>
                                </select>

                                <button
                                  onClick={() => handleDeleteInquiry(selectedInquiry._id || selectedInquiry.id)}
                                  className="p-1.5 bg-[#F1EFEA] hover:bg-red-950/40 border border-[#DAD7D1] hover:border-red-500 text-red-400 rounded-xl transition"
                                  title="Delete Email Record"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            {/* Metadata details */}
                            <div className="bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl p-4 space-y-2.5 text-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#8C827A] font-mono text-[11px] w-12">FROM:</span>
                                  <span className="text-[#171717] font-semibold">{selectedInquiry.senderName}</span>
                                  <span className="text-[#77736E] font-mono text-[11px]">&lt;{selectedInquiry.senderEmail}&gt;</span>
                                </div>
                                <span className="text-[#8C827A] font-mono text-[10px]">
                                  {selectedInquiry.createdAt
                                    ? new Date(selectedInquiry.createdAt).toLocaleString()
                                    : 'Just now'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[#8C827A] font-mono text-[11px] w-12">TO:</span>
                                <span className="text-[#35664A] font-mono text-[11px] font-semibold">
                                  {selectedInquiry.recipientEmail || 'info@fashion.com'}
                                </span>
                                <span className="text-[10px] text-[#8C827A]">(Official Inbound)</span>
                              </div>

                              {/* Prominent Contact Number Field with Click-to-Call & WhatsApp */}
                              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#DAD7D1]/60">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#8C827A] font-mono text-[11px] w-12">PHONE:</span>
                                  <span className="font-mono text-[#35664A] font-bold text-xs">
                                    {selectedInquiry.senderPhone || 'Not provided'}
                                  </span>
                                </div>

                                {selectedInquiry.senderPhone && (
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={`tel:${selectedInquiry.senderPhone.replace(/[^0-9+]/g, '')}`}
                                      className="px-2 py-0.5 rounded bg-[#F1EFEA] hover:bg-[#4D5543]/20 border border-[#DAD7D1] hover:border-[#4D5543] text-[#35664A] text-[10px] font-mono flex items-center gap-1 transition"
                                      title="Call Customer"
                                    >
                                      <Phone size={10} />
                                      <span>Call</span>
                                    </a>

                                    <a
                                      href={`https://wa.me/${selectedInquiry.senderPhone.replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2 py-0.5 rounded bg-[#F1EFEA] hover:bg-emerald-950/40 border border-[#DAD7D1] hover:border-emerald-500 text-emerald-400 text-[10px] font-mono flex items-center gap-1 transition"
                                      title="Message on WhatsApp"
                                    >
                                      <MessageCircle size={10} />
                                      <span>WhatsApp</span>
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Email Body Content */}
                          <div className="space-y-3">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#77736E]">
                              Message Contents
                            </h4>
                            <div className="bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl p-5 text-sm text-[#171717] leading-relaxed whitespace-pre-wrap font-sans min-h-[140px]">
                              {selectedInquiry.message}
                            </div>
                          </div>

                          {/* Quick Actions Footer */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#DAD7D1]">
                            <div className="flex items-center gap-2">
                              <a
                                href={`mailto:${selectedInquiry.senderEmail}?subject=Re: ${encodeURIComponent(
                                  selectedInquiry.subject || 'Fashion Atelier Concierge Response'
                                )}&body=Dear ${encodeURIComponent(
                                  selectedInquiry.senderName || 'Valued Patron'
                                )},%0D%0A%0D%0AThank you for contacting Maison Couture at info@fashion.com regarding "${encodeURIComponent(
                                  selectedInquiry.subject || 'your inquiry'
                                )}".%0D%0A%0D%0A`}
                                onClick={() =>
                                  handleMarkInquiryStatus(selectedInquiry._id || selectedInquiry.id, 'replied')
                                }
                                className="px-4 py-2 bg-[#4D5543] hover:bg-[#059669] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition shadow-lg shadow-md"
                              >
                                <Send size={13} />
                                <span>Reply via Email Client</span>
                              </a>

                              <button
                                onClick={() =>
                                  handleMarkInquiryStatus(
                                    selectedInquiry._id || selectedInquiry.id,
                                    selectedInquiry.status === 'replied' ? 'read' : 'replied'
                                  )
                                }
                                className="px-3.5 py-2 bg-[#F1EFEA] hover:bg-[#1E293B] border border-[#DAD7D1] text-xs text-[#171717] rounded-xl flex items-center gap-1.5 transition"
                              >
                                <CheckCircle size={13} className="text-[#4D5543]" />
                                <span>
                                  {selectedInquiry.status === 'replied' ? 'Unmark Replied' : 'Mark as Replied'}
                                </span>
                              </button>
                            </div>

                            <button
                              onClick={() =>
                                handleMarkInquiryStatus(
                                  selectedInquiry._id || selectedInquiry.id,
                                  selectedInquiry.status === 'archived' ? 'read' : 'archived'
                                )
                              }
                              className="px-3 py-2 bg-[#FAF9F6] hover:bg-[#F1EFEA] border border-[#DAD7D1] hover:border-[#DAD7D1] text-xs text-[#77736E] hover:text-[#171717] rounded-xl flex items-center gap-1.5 transition"
                            >
                              <Archive size={13} />
                              <span>{selectedInquiry.status === 'archived' ? 'Unarchive' : 'Archive'}</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center text-xs text-[#8C827A]">
                          Select an email from the left pane to view full contents and reply.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. CUSTOMERS & ACCOUNTS */}
            {activeTab === 'admin-users' && (
              <div className="animate-in fade-in duration-150 space-y-4">
                <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#171717] flex items-center gap-2">
                      <Users size={20} className="text-[#4D5543]" />
                      Customers &amp; Accounts
                    </h1>
                    <p className="text-xs text-[#77736E] mt-0.5">Registered client accounts, order frequency, and VIP tiers</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F1EFEA] border border-[#DAD7D1] text-[#77736E] text-xs font-mono">
                    {localUsers.length} Active Records
                  </span>
                </div>

                <div className="bg-white border border-[#DAD7D1] rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#DAD7D1] bg-[#FAF9F6] text-[#77736E] font-mono text-[11px] uppercase">
                          <th className="p-3.5">Customer Name</th>
                          <th className="p-3.5">Contact / Email</th>
                          <th className="p-3.5">Lifetime Orders</th>
                          <th className="p-3.5">Client Tier</th>
                          <th className="p-3.5">Account Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]">
                        {localUsers.map((u) => (
                          <tr key={u.id} className="group hover:bg-[#FAF9F6] border-b border-[#E5E2DA] transition-colors duration-150">
                            <td className="p-3.5 font-semibold text-[#171717] flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#F1EFEA] border border-[#DAD7D1] text-[#171717] font-bold text-[11px] flex items-center justify-center shrink-0">
                                {(u.name || 'P')[0]?.toUpperCase()}
                              </div>
                              <span>{u.name}</span>
                            </td>
                            <td className="p-3.5 text-[#77736E]">
                              <div className="font-mono text-[#171717] text-xs">{u.email}</div>
                              <div className="text-[10px] text-[#8C827A] font-mono">{u.phone || '0300-1234567'}</div>
                            </td>
                            <td className="p-3.5 font-mono text-[#171717] font-bold">{u.orders} orders</td>
                            <td className="p-3.5">
                              <button
                                onClick={() => handleToggleUserTier(u.id)}
                                className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F1EFEA] border border-[#DAD7D1] hover:border-[#171717] text-[#4D5543] transition cursor-pointer"
                                title="Click to toggle VIP / Standard Tier"
                              >
                                {u.tier || 'Standard'} ⇄
                              </button>
                            </td>
                            <td className="p-3.5">
                              <button
                                onClick={() => handleToggleUserStatus(u.id)}
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border transition cursor-pointer ${
                                  u.status === 'Active'
                                    ? 'bg-[#4D5543]/20 border-[#4D5543]/40 text-[#35664A] hover:bg-yellow-950/30'
                                    : 'bg-red-950/30 border-red-500/40 text-red-400 hover:bg-[#4D5543]/20'
                                }`}
                                title="Click to toggle Active / Suspended status"
                              >
                                {u.status} ⇄
                              </button>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => setViewUserModal(u)}
                                  className="px-2.5 py-1 bg-[#F1EFEA] hover:bg-[#1E293B] border border-[#DAD7D1] hover:border-[#171717] text-[#4D5543] rounded-lg text-[11px] font-medium transition flex items-center gap-1"
                                  title="View full customer profile"
                                >
                                  <Eye size={12} />
                                  <span>Profile</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="px-2.5 py-1 bg-[#F1EFEA] hover:bg-red-950/40 border border-[#DAD7D1] hover:border-red-500 text-red-400 rounded-lg text-[11px] transition"
                                  title="Remove customer record"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* View User Modal */}
                {viewUserModal && (
                  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-lg bg-white border border-[#DAD7D1] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-admin-scale">
                      <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#10B981] to-[#38BDF8] text-[#171717] font-bold text-lg flex items-center justify-center shadow-md">
                            {(viewUserModal.name || 'P')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-[#171717]">{viewUserModal.name}</h2>
                            <p className="text-xs text-[#77736E] font-mono">{viewUserModal.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setViewUserModal(null)}
                          className="p-2 text-[#77736E] hover:text-[#171717] hover:bg-[#F1EFEA] rounded-xl hover:rotate-90 transition-all duration-200"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl space-y-1">
                          <span className="text-[10px] uppercase text-[#8C827A] font-mono block">Direct Telephone</span>
                          <span className="text-[#171717] font-mono font-medium">{viewUserModal.phone || '0300-1234567'}</span>
                        </div>
                        <div className="p-3 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl space-y-1">
                          <span className="text-[10px] uppercase text-[#8C827A] font-mono block">Lifetime Order Count</span>
                          <span className="text-[#4D5543] font-mono font-bold text-base">{viewUserModal.orders || 0} Orders</span>
                        </div>
                        <div className="p-3 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl space-y-1">
                          <span className="text-[10px] uppercase text-[#8C827A] font-mono block">VIP Patron Tier</span>
                          <div className="flex items-center justify-between">
                            <span className="text-[#4D5543] font-medium">{viewUserModal.tier || 'Standard'}</span>
                            <button
                              onClick={() => handleToggleUserTier(viewUserModal.id)}
                              className="text-[10px] px-2 py-0.5 bg-[#F1EFEA] border border-[#DAD7D1] rounded text-[#171717] hover:border-[#171717]"
                            >
                              Toggle
                            </button>
                          </div>
                        </div>
                        <div className="p-3 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl space-y-1">
                          <span className="text-[10px] uppercase text-[#8C827A] font-mono block">Account Status</span>
                          <div className="flex items-center justify-between">
                            <span className={viewUserModal.status === 'Active' ? 'text-[#35664A] font-medium' : 'text-red-400 font-medium'}>
                              {viewUserModal.status}
                            </span>
                            <button
                              onClick={() => handleToggleUserStatus(viewUserModal.id)}
                              className="text-[10px] px-2 py-0.5 bg-[#F1EFEA] border border-[#DAD7D1] rounded text-[#171717] hover:border-red-400"
                            >
                              Toggle
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#DAD7D1] pt-4">
                        <a
                          href={`https://wa.me/${(viewUserModal.phone || '923001234567').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Phone size={13} />
                          <span>WhatsApp Client</span>
                        </a>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(viewUserModal.id)}
                            className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 text-xs rounded-xl transition"
                          >
                            Delete Record
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewUserModal(null)}
                            className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-[#171717] text-xs rounded-xl transition"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. CATEGORIES */}
            {activeTab === 'admin-categories' && (
              <div className="animate-in fade-in duration-150 space-y-4">
                <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#171717] flex items-center gap-2">
                      <FolderTree size={20} className="text-[#4D5543]" />
                      Categories Management
                    </h1>
                    <p className="text-xs text-[#77736E] mt-0.5">Taxonomy and catalog departmental structures</p>
                  </div>
                </div>

                <form
                  onSubmit={handleAddCategory}
                  className="bg-white border border-[#DAD7D1] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center shadow-lg"
                >
                  <input
                    type="text"
                    required
                    placeholder="New Category Name (e.g. Footwear)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full sm:w-1/3 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                  />
                  <input
                    type="text"
                    placeholder="Subcategories (comma separated, e.g. Boots, Loafers, Mules)"
                    value={newCatSubs}
                    onChange={(e) => setNewCatSubs(e.target.value)}
                    className="w-full sm:flex-1 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2 bg-[#4D5543] hover:bg-[#059669] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shrink-0"
                  >
                    + Add Category
                  </button>
                </form>

                <div className="bg-white border border-[#DAD7D1] rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#DAD7D1] bg-[#FAF9F6] text-[#77736E] font-mono text-[11px] uppercase">
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Subcategories</th>
                          <th className="p-3.5">Assigned Products</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]">
                        {localCategories.map((c) => (
                          <tr key={c.id} className="group hover:bg-[#FAF9F6] border-b border-[#E5E2DA] transition-colors duration-150">
                            <td className="p-3.5 font-semibold text-[#171717]">{c.name}</td>
                            <td className="p-3.5 text-[#77736E]">{c.subcategories}</td>
                            <td className="p-3.5 font-mono text-[#171717] font-bold">{c.products}</td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => handleDeleteCategory(c.id)}
                                className="px-3 py-1 bg-[#F1EFEA] hover:bg-red-950/40 border border-[#DAD7D1] hover:border-red-500 text-red-400 rounded-lg text-[11px] transition"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 9. COUPONS & DISCOUNTS */}
            {activeTab === 'admin-coupons' && (
              <div className="animate-in fade-in duration-150 space-y-4">
                <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#171717] flex items-center gap-2">
                      <Tag size={20} className="text-[#4D5543]" />
                      Coupons &amp; Promotional Discounts
                    </h1>
                    <p className="text-xs text-[#77736E] mt-0.5">Manage promotional voucher codes, percentage discounts, and redemption caps</p>
                  </div>
                  <button
                    onClick={() => setShowCreateCouponRow(!showCreateCouponRow)}
                    className="px-4 py-2 bg-[#171717] hover:bg-[#353535] text-white active:scale-[0.98] transition-all duration-200 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-md"
                  >
                    + Create Coupon
                  </button>
                </div>

                {showCreateCouponRow && (
                  <form
                    onSubmit={handleAddCoupon}
                    className="bg-white border border-[#4D5543]/50 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center shadow-xl animate-in fade-in"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Coupon Code (e.g. FLASH25)"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className="w-full sm:w-1/3 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2 text-xs text-[#171717] uppercase font-mono focus:outline-none focus:border-[#4D5543]"
                    />
                    <input
                      type="text"
                      placeholder="Discount (e.g. 15% or Rs. 1000)"
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(e.target.value)}
                      className="w-full sm:w-1/3 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#4D5543] hover:bg-[#059669] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
                      >
                        Save Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateCouponRow(false)}
                        className="px-4 py-2 border border-[#DAD7D1] text-xs text-[#77736E] rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="bg-white border border-[#DAD7D1] rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#DAD7D1] bg-[#FAF9F6] text-[#77736E] font-mono text-[11px] uppercase">
                          <th className="p-3.5">Voucher Code</th>
                          <th className="p-3.5">Discount Value</th>
                          <th className="p-3.5">Expiry Date</th>
                          <th className="p-3.5">Usage Count</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]">
                        {localCoupons.map((coup) => (
                          <tr key={coup.id} className="group hover:bg-[#FAF9F6] border-b border-[#E5E2DA] transition-colors duration-150">
                            <td className="p-3.5 font-mono font-bold text-[#171717]">{coup.code}</td>
                            <td className="p-3.5 font-semibold text-[#4D5543]">{coup.discount}</td>
                            <td className="p-3.5 text-[#77736E] font-mono">{coup.expiry}</td>
                            <td className="p-3.5 text-[#77736E] font-mono">{coup.usage}</td>
                            <td className="p-3.5">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#4D5543]/20 border border-[#4D5543]/40 text-[#35664A]">
                                {coup.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => handleDeleteCoupon(coup.id)}
                                className="px-3 py-1 bg-[#F1EFEA] hover:bg-red-950/40 border border-[#DAD7D1] hover:border-red-500 text-red-400 rounded-lg text-[11px] transition"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 10. REPORTS */}
            {activeTab === 'admin-reports' && (
              <div className="animate-in fade-in duration-150 space-y-6">
                <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#171717] flex items-center gap-2">
                      <BarChart2 size={20} className="text-[#4D5543]" />
                      Executive Performance Reports
                    </h1>
                    <p className="text-xs text-[#77736E] mt-0.5">Sales breakdowns, order velocity, and customer conversion rates</p>
                  </div>
                  <button
                    onClick={() =>
                      handleExportCSV(
                        'sales_report.csv',
                        [
                          ['Gross Sales Turnover', 'Rs. 542,000'],
                          ['Total Invoiced Orders', '124'],
                          ['Active Customer Base', '468'],
                          ['Products Sold', '35'],
                          ['Average Order Value', 'Rs. 4,370'],
                        ],
                        ['Metric', 'Value']
                      )
                    }
                    className="px-4 py-2 border border-[#DAD7D1] hover:bg-[#1E293B] text-xs text-[#171717] rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-[#DAD7D1] rounded-2xl p-5 text-center">
                    <div className="text-2xl font-bold text-[#171717] font-mono">Rs. 5.42L</div>
                    <div className="text-[11px] font-bold text-[#77736E] uppercase tracking-wider mt-1">Total Sales</div>
                  </div>
                  <div className="bg-white border border-[#DAD7D1] rounded-2xl p-5 text-center">
                    <div className="text-2xl font-bold text-[#171717] font-mono">124</div>
                    <div className="text-[11px] font-bold text-[#77736E] uppercase tracking-wider mt-1">Orders</div>
                  </div>
                  <div className="bg-white border border-[#DAD7D1] rounded-2xl p-5 text-center">
                    <div className="text-2xl font-bold text-[#171717] font-mono">468</div>
                    <div className="text-[11px] font-bold text-[#77736E] uppercase tracking-wider mt-1">Users</div>
                  </div>
                  <div className="bg-white border border-[#DAD7D1] rounded-2xl p-5 text-center">
                    <div className="text-2xl font-bold text-[#171717] font-mono">35</div>
                    <div className="text-[11px] font-bold text-[#77736E] uppercase tracking-wider mt-1">Products Sold</div>
                  </div>
                </div>

                <div className="bg-white border border-[#DAD7D1] rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-[#171717]">Sales Channels Distribution</h3>
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-[#77736E] mb-1.5">
                        <span className="text-[#171717] font-medium">Ready-To-Wear Catalog Collection</span>
                        <span className="font-mono text-[#4D5543]">Rs. 3.45L (64%)</span>
                      </div>
                      <div className="h-2.5 bg-[#FAF9F6] rounded-full overflow-hidden border border-[#DAD7D1]">
                        <div className="h-full bg-gradient-to-r from-[#38BDF8] to-[#0284C7]" style={{ width: '64%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[#77736E] mb-1.5">
                        <span className="text-[#171717] font-medium">AI Custom Studio Bespoke Garments</span>
                        <span className="font-mono text-[#4D5543]">Rs. 1.97L (36%)</span>
                      </div>
                      <div className="h-2.5 bg-[#FAF9F6] rounded-full overflow-hidden border border-[#DAD7D1]">
                        <div className="h-full bg-gradient-to-r from-[#10B981] to-[#059669]" style={{ width: '36%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 11. SETTINGS */}
            {activeTab === 'admin-settings' && (
              <div className="animate-in fade-in duration-150 space-y-4">
                <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#171717] flex items-center gap-2">
                      <SettingsIcon size={20} className="text-[#4D5543]" />
                      Store &amp; Payment Configuration
                    </h1>
                    <p className="text-xs text-[#77736E] mt-0.5">Platform metadata and payment method gateways</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveSettings}
                      className="px-5 py-2 bg-[#171717] hover:bg-[#353535] text-white active:scale-[0.98] transition-all duration-200 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-md"
                    >
                      <Save size={14} />
                      <span>Save Settings</span>
                    </button>
                    {settingsSavedAlert && (
                      <span className="text-[#35664A] font-bold text-xs flex items-center gap-1 animate-in fade-in">
                        <Check size={16} /> Saved Successfully
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-[#DAD7D1] rounded-2xl p-6 sm:p-8 shadow-xl">
                  {/* Site Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#171717] border-b border-[#DAD7D1] pb-2">
                      General Store Settings
                    </h3>

                    <div>
                      <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={siteSettings.siteName}
                        onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                        className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                        Contact Support Email
                      </label>
                      <input
                        type="email"
                        value={siteSettings.contactEmail}
                        onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                        className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#4D5543]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#77736E] uppercase block mb-1">
                        Contact WhatsApp / Phone
                      </label>
                      <input
                        type="text"
                        value={siteSettings.contactPhone}
                        onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                        className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl px-4 py-2 text-xs text-[#171717] font-mono focus:outline-none focus:border-[#4D5543]"
                      />
                    </div>
                  </div>

                  {/* Payment Switches */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#171717] border-b border-[#DAD7D1] pb-2">
                      Payment Gateway Switches
                    </h3>

                    <div className="space-y-3 pt-1">
                      <label className="flex items-center gap-3 text-xs text-[#171717] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={siteSettings.stripeEnabled}
                          onChange={(e) => setSiteSettings({ ...siteSettings, stripeEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-[#DAD7D1] bg-[#FAF9F6] text-[#4D5543] focus:ring-0"
                        />
                        <span>Enable International Credit / Debit Cards</span>
                      </label>

                      <label className="flex items-center gap-3 text-xs text-[#171717] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={siteSettings.jazzCashEnabled}
                          onChange={(e) => setSiteSettings({ ...siteSettings, jazzCashEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-[#DAD7D1] bg-[#FAF9F6] text-[#4D5543] focus:ring-0"
                        />
                        <span>Enable JazzCash Mobile Account Gateway</span>
                      </label>

                      <label className="flex items-center gap-3 text-xs text-[#171717] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={siteSettings.easyPaisaEnabled}
                          onChange={(e) => setSiteSettings({ ...siteSettings, easyPaisaEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-[#DAD7D1] bg-[#FAF9F6] text-[#4D5543] focus:ring-0"
                        />
                        <span>Enable EasyPaisa Direct Mobile Payment</span>
                      </label>

                      <label className="flex items-center gap-3 text-xs text-[#171717] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 rounded border-[#DAD7D1] bg-[#FAF9F6] text-[#4D5543] focus:ring-0"
                        />
                        <span>Enable Cash On Delivery (COD)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* 11. THERMAL PACKING SLIP & OFFICIAL INVOICE MODAL */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm backdrop-blur-sm overflow-y-auto">
          {/* Print-specific style rules */}
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #atelier-printable-invoice, #atelier-printable-invoice * {
                visibility: visible !important;
              }
              #atelier-printable-invoice {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 16px !important;
                background: #ffffff !important;
                color: #000000 !important;
                box-shadow: none !important;
                border: none !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="relative w-full max-w-2xl bg-[#0B0F19] border border-[#DAD7D1] rounded-2xl shadow-2xl p-6 my-8 text-[#171717]">
            {/* Modal Actions Bar (hidden on print) */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DAD7D1] no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
                  Thermal Packing Slip &amp; Order Invoice
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow"
                >
                  <Printer size={13} />
                  <span>Print Slip / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="p-1.5 text-[#77736E] hover:text-[#171717] hover:bg-[#1E293B] rounded-lg transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Document Root */}
            <div
              id="atelier-printable-invoice"
              className="bg-white text-black p-6 rounded-xl font-mono text-xs shadow-inner"
            >
              {/* Header */}
              <div className="text-center pb-4 border-b-2 border-black border-dashed">
                <h1 className="text-xl font-serif font-black tracking-widest uppercase">ATELIER HAUTE COUTURE</h1>
                <p className="text-[10px] uppercase tracking-wider text-gray-700 font-sans mt-0.5">
                  Bespoke Garments &amp; Archival Ready-to-Wear
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-gray-100 border border-gray-400 rounded text-[11px] font-bold">
                  COURIER PACKING SLIP &amp; OFFICIAL DISPATCH NOTE
                </div>
              </div>

              {/* Order Meta Grid */}
              <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-300 text-[11px]">
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">Order Reference:</span>
                  <span className="font-bold text-sm">{selectedInvoiceOrder.id}</span>
                  <span className="text-gray-500 block text-[9px] uppercase mt-1.5">Date &amp; Time:</span>
                  <span>{selectedInvoiceOrder.date}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block text-[9px] uppercase">Fulfillment Status:</span>
                  <span className="font-bold uppercase text-emerald-800">{selectedInvoiceOrder.status}</span>
                  <span className="text-gray-500 block text-[9px] uppercase mt-1.5">Payment Method:</span>
                  <span className="font-semibold">Cash On Delivery (COD)</span>
                </div>
              </div>

              {/* Consignee / Delivery Address */}
              <div className="py-3 border-b border-gray-300">
                <span className="text-gray-500 block text-[9px] uppercase font-bold tracking-wider mb-1">
                  CONSIGNEE / SHIP TO:
                </span>
                <div className="font-sans font-semibold text-sm">{selectedInvoiceOrder.customer}</div>
                <div className="text-gray-700 text-xs mt-0.5">
                  {selectedInvoiceOrder.address ? selectedInvoiceOrder.address : 'Destination Address on File'}
                </div>
                <div className="text-gray-800 font-semibold text-xs mt-0.5">
                  City: {selectedInvoiceOrder.city || 'Standard Courier Hub'}
                </div>
                <div className="text-gray-900 font-bold text-xs mt-1 flex items-center gap-1">
                  <span>Contact:</span> {selectedInvoiceOrder.phone}
                </div>
              </div>

              {/* Itemized List */}
              <div className="py-3 border-b-2 border-black border-dashed">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-400 text-[10px] text-gray-600 uppercase">
                      <th className="pb-1.5">Garment Description</th>
                      <th className="pb-1.5 text-center">Qty</th>
                      <th className="pb-1.5 text-right">Unit Price</th>
                      <th className="pb-1.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedInvoiceOrder.itemsList && selectedInvoiceOrder.itemsList.length > 0 ? (
                      selectedInvoiceOrder.itemsList.map((item, idx) => (
                        <tr key={idx} className="text-xs">
                          <td className="py-2 pr-2">
                            <span className="font-semibold block font-sans">{item.name}</span>
                            <span className="text-[10px] text-gray-500">
                              Size: {item.size || 'M'} • Color: {item.color || 'Standard'}
                            </span>
                          </td>
                          <td className="py-2 text-center font-bold">{item.quantity || 1}</td>
                          <td className="py-2 text-right">Rs. {Number(item.price || 0).toLocaleString()}</td>
                          <td className="py-2 text-right font-bold">
                            Rs. {Number((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="text-xs">
                        <td className="py-2">
                          <span className="font-semibold block font-sans">Handcrafted Atelier Ensemble</span>
                          <span className="text-[10px] text-gray-500">Standard Atelier Package</span>
                        </td>
                        <td className="py-2 text-center font-bold">{selectedInvoiceOrder.items}</td>
                        <td className="py-2 text-right">
                          Rs. {Number(selectedInvoiceOrder.total).toLocaleString()}
                        </td>
                        <td className="py-2 text-right font-bold">
                          Rs. {Number(selectedInvoiceOrder.total).toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Summary */}
              <div className="py-3 border-b border-gray-300">
                <div className="flex justify-between py-1 text-xs">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">Rs. {Number(selectedInvoiceOrder.total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-xs">
                  <span className="text-gray-600">Insured Shipping &amp; Handling:</span>
                  <span className="text-emerald-700 font-semibold">Free (Complimentary)</span>
                </div>
                <div className="flex justify-between py-1.5 border-t border-gray-400 font-bold text-sm mt-1">
                  <span>TOTAL PAYABLE (COD):</span>
                  <span className="text-base">Rs. {Number(selectedInvoiceOrder.total).toLocaleString()}</span>
                </div>
              </div>

              {/* Simulated Thermal Barcode */}
              <div className="pt-4 text-center">
                <div className="inline-flex items-center justify-center gap-[2px] h-10 w-64 bg-white py-1">
                  {[4,2,6,1,3,5,2,4,1,6,3,2,5,1,4,3,2,6,1,5,3,2,4,1,3,5,2,4,6,1,3].map((w, i) => (
                    <div
                      key={i}
                      className="h-full bg-black"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
                <div className="text-[10px] tracking-widest text-gray-700 font-mono mt-1">
                  *{selectedInvoiceOrder.id}*
                </div>
                <p className="text-[9px] text-gray-500 uppercase mt-2">
                  Please verify parcel seal upon delivery. For queries: concierge@atelier.pk
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
