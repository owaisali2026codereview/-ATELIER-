import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import store from './store/store';
import { apiSlice } from './store/api/apiSlice';

import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import SearchModal from './components/SearchModal';
import SizeGuideModal from './components/SizeGuideModal';
import AuthModal from './components/AuthModal';
import ContactModal from './components/ContactModal';

import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AICustomStudioPage from './pages/AICustomStudioPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AccountPage from './pages/AccountPage';
import JournalPage from './pages/JournalPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function AppContent({
  searchOpen,
  setSearchOpen,
  sizeGuideOpen,
  setSizeGuideOpen,
  contactOpen,
  setContactOpen,
}) {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Cross-tab real-time live sync: immediately updates website storefront when admin adds/edits/deletes products
  useEffect(() => {
    let bc = null;
    const triggerCatalogInvalidation = () => {
      dispatch(
        apiSlice.util.invalidateTags([
          'Product',
          { type: 'Product', id: 'LIST' },
          { type: 'Product', id: 'SUMMARY' },
          'Category',
          'AdminMetrics',
        ])
      );
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('atelier_catalog_change'));
      }
    };

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('atelier_live_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'CATALOG_UPDATED') {
            triggerCatalogInvalidation();
          }
        };
      }
    } catch (e) {
      // ignore
    }

    const handleStorage = (e) => {
      if (e.key === 'atelier_product_catalog_sync' || e.key === 'atelier_deleted_product_ids' || e.key === 'atelier_local_products') {
        triggerCatalogInvalidation();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [dispatch]);

  // Flexible Auth Modal Config (supports 'login' or 'register' modes with automatic redirect)
  const [authModalConfig, setAuthModalConfig] = useState({
    isOpen: false,
    mode: 'login',
    redirectAfter: null,
  });

  const handleOpenAuth = (mode = 'login', redirectAfter = null) => {
    setAuthModalConfig({
      isOpen: true,
      mode: mode === 'register' ? 'register' : 'login',
      redirectAfter: redirectAfter || null,
    });
  };

  const handleCloseAuth = () => {
    setAuthModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // Check if an authorized admin session is active
  const adminSession = (() => {
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
  })();

  if (isAdminRoute) {
    return (
      <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#07090E] text-[#E6EDF3] font-sans antialiased">
        <main className="w-full min-h-screen">
          <Routes>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen flex flex-col bg-[#FAF9F6] text-[#171717] font-sans antialiased selection:bg-[#F1EFEA]">
      {/* Admin Mode Floating Switcher (Only visible to authenticated administrators) */}
      {adminSession && (
        <div className="bg-[#090D14] text-white py-1.5 px-4 sm:px-8 text-xs flex items-center justify-between border-b border-[#1E293B] sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="font-mono text-[11px] text-[#CBD5E1]">
              Admin Preview Mode Active: <strong className="text-white">{adminSession.email}</strong> ({adminSession.role})
            </span>
          </div>
          <a
            href="/admin"
            className="text-[#38BDF8] hover:text-white flex items-center gap-1 font-semibold text-[11px] transition"
          >
            <span>Return to Admin Command Center →</span>
          </a>
        </div>
      )}

      {/* Global Storefront Header */}
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* Main Route Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collection" element={<ProductListingPage />} />
          <Route
            path="/product/:id"
            element={<ProductDetailPage onOpenSizeGuide={() => setSizeGuideOpen(true)} />}
          />
          <Route
            path="/custom-studio"
            element={<AICustomStudioPage onOpenAuth={handleOpenAuth} />}
          />
          <Route
            path="/studio"
            element={<AICustomStudioPage onOpenAuth={handleOpenAuth} />}
          />
          <Route
            path="/custom-design"
            element={<AICustomStudioPage onOpenAuth={handleOpenAuth} />}
          />
          <Route path="/checkout" element={<CheckoutPage onOpenAuth={handleOpenAuth} />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/account" element={<AccountPage onOpenAuth={handleOpenAuth} />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Routes>
      </main>

      {/* Global Storefront Footer */}
      <Footer
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* Slide-over Bag Drawer */}
      <CartDrawer />

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Global Size Guide Modal */}
      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

      {/* Global Official Email / Contact Modal */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />

      {/* Global Patron Authentication Modal */}
      <AuthModal
        isOpen={authModalConfig.isOpen}
        onClose={handleCloseAuth}
        defaultMode={authModalConfig.mode}
        onSuccess={() => {
          if (authModalConfig.redirectAfter) {
            navigate(authModalConfig.redirectAfter);
          }
        }}
      />
    </div>
  );
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          sizeGuideOpen={sizeGuideOpen}
          setSizeGuideOpen={setSizeGuideOpen}
          contactOpen={contactOpen}
          setContactOpen={setContactOpen}
        />
      </BrowserRouter>
    </Provider>
  );
}

