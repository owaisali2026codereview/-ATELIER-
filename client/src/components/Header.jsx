import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleCart } from '../store/cartSlice';
import { useGetMeQuery, useLogoutMutation, useGetWishlistQuery, useGetSettingsQuery } from '../store/api/apiSlice';
import { ShoppingBag, Search, Heart, User, Menu, X, Sparkles, LogOut, Package, Ruler, ChevronDown, Shield, Mail } from 'lucide-react';

export default function Header({ onOpenSearch, onOpenSizeGuide, onOpenAuth, onOpenContact }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [localWishCount, setLocalWishCount] = useState(0);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useSelector((state) => state.cart);

  const token = typeof window !== 'undefined' ? localStorage.getItem('atelier_token') : null;
  const { data: userData } = useGetMeQuery(undefined, { skip: !token });
  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !token });
  const { data: settingsData } = useGetSettingsQuery();
  const [logoutMutation] = useLogoutMutation();

  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('atelier_site_settings');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return { siteName: 'ATELIER' };
  });

  useEffect(() => {
    if (settingsData?.data) {
      setSiteSettings({
        siteName: settingsData.data.siteName || 'ATELIER',
        contactEmail: settingsData.data.contactEmail,
        contactPhone: settingsData.data.contactPhone,
      });
    }
  }, [settingsData]);

  useEffect(() => {
    let bc = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('atelier_live_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'SETTINGS_UPDATED' && event.data?.settings) {
            setSiteSettings(event.data.settings);
          }
        };
      }
    } catch (e) {}

    const handleSettingsChange = (e) => {
      if (e.detail) setSiteSettings(e.detail);
    };
    window.addEventListener('atelier_settings_change', handleSettingsChange);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('atelier_settings_change', handleSettingsChange);
    };
  }, []);

  const currentUser = userData?.data || null;
  const totalCartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const updateLocalCount = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
        setLocalWishCount(Array.isArray(stored) ? stored.length : 0);
      } catch (e) {
        setLocalWishCount(0);
      }
    };
    updateLocalCount();
    window.addEventListener('storage', updateLocalCount);
    const timer = setInterval(updateLocalCount, 2000);
    return () => {
      window.removeEventListener('storage', updateLocalCount);
      clearInterval(timer);
    };
  }, []);

  const totalWishlistCount = token
    ? (wishlistData?.data?.length ?? (currentUser?.wishlist?.length || 0))
    : localWishCount;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('atelier_token');
    localStorage.removeItem('fashion_patron_session');
    setUserDropdownOpen(false);
    navigate('/');
    window.location.reload();
  };

  const navLinks = [
    { name: 'Men', path: '/collection?cat=men' },
    { name: 'Women', path: '/collection?cat=women' },
    { name: 'Kids', path: '/collection?cat=kids' },
    { name: 'AI Custom Design', path: '/custom-studio', highlight: true },
    { name: 'New Arrivals', path: '/collection' },
    { name: 'The Journal', path: '/journal' },
  ];

  const isActive = (path) => {
    if (path.includes('?')) {
      const [pathname, search] = path.split('?');
      return location.pathname === pathname && location.search === `?${search}`;
    }
    return location.pathname === path;
  };

  const handleCustomStudioClick = () => {
    // Seamless navigation for all patrons and visitors
    setMobileMenuOpen(false);
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#DAD7D1] transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#F1EFEA] text-[#171717] py-1.5 px-4 text-center text-[11px] font-medium tracking-[0.12em] uppercase border-b border-[#DAD7D1]/50">
        Complimentary worldwide courier delivery on orders over Rs. 10,000
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#171717] hover:text-[#4D5543] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className="flex items-center gap-3 group">
            <span className="w-8 h-8 rounded-full border border-[#171717] flex items-center justify-center font-editorial font-bold text-sm tracking-widest text-[#171717] group-hover:bg-[#171717] group-hover:text-white transition-all">
              {siteSettings.siteName ? siteSettings.siteName.charAt(0).toUpperCase() : 'A'}
            </span>
            <div className="flex flex-col">
              <span className="font-editorial text-2xl tracking-[0.18em] uppercase text-[#171717] font-semibold leading-none">
                {siteSettings.siteName || 'ATELIER'}
              </span>
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#77736E] font-medium mt-1">
                Haute Couture &amp; AI Studio
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={(e) => handleCustomStudioClick(e, link.path)}
                className={`text-[13px] uppercase tracking-[0.1em] transition-all relative py-1 flex items-center gap-1.5 ${
                  link.highlight
                    ? 'text-[#4D5543] font-semibold hover:text-[#171717]'
                    : active
                    ? 'text-[#171717] font-semibold'
                    : 'text-[#4B5563] hover:text-[#171717]'
                }`}
              >
                {link.highlight && <Sparkles size={13} className="text-[#4D5543] animate-pulse" />}
                {link.name}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#171717] animate-in" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Email Concierge Trigger */}
          {onOpenContact && (
            <button
              type="button"
              onClick={onOpenContact}
              className="p-2 text-[#353535] hover:text-[#171717] transition-colors relative flex items-center gap-1.5"
              aria-label="Email Us (info@fashion.com)"
              title="Email Concierge (info@fashion.com)"
            >
              <Mail size={19} />
              <span className="hidden xl:inline text-[11px] font-medium text-[#57534E] hover:text-[#171717]">
                Email Us
              </span>
            </button>
          )}

          {/* Search Trigger */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="p-2 text-[#353535] hover:text-[#171717] transition-colors relative"
            aria-label="Search Collection"
          >
            <Search size={20} />
          </button>

          {/* Wishlist Link */}
          <Link
            to="/account?tab=wishlist"
            className="p-2 text-[#353535] hover:text-[#171717] transition-colors relative"
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {totalWishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#171717] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-75">
                {totalWishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={() => dispatch(toggleCart())}
            className="p-2 text-[#353535] hover:text-[#171717] transition-colors relative"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag size={20} />
            {totalCartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#4D5543] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-glow">
                {totalCartCount}
              </span>
            )}
          </button>

          <div className="h-4 w-[1px] bg-[#DAD7D1] hidden sm:block" />

          {/* Account Profile / Authentication */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 text-[#171717] hover:opacity-80 transition-opacity"
                aria-label="Client Account Menu"
              >
                <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center font-editorial text-xs font-semibold shadow-sm">
                  {currentUser.firstName ? currentUser.firstName.charAt(0) : 'P'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-[11px] font-semibold tracking-wider text-[#171717] leading-tight">
                    {currentUser.firstName}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-[#4D5543] font-medium leading-none">
                    {currentUser.vipTier || 'Patron'}
                  </span>
                </div>
                <ChevronDown size={12} className="text-[#77736E] hidden md:block" />
              </button>

              {/* Patron Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#DAD7D1] rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-[#DAD7D1]/60">
                    <p className="text-xs font-bold text-[#171717]">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="text-[10px] text-[#77736E] truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#DDE6CE] text-[#4D5543] rounded text-[9px] font-bold uppercase tracking-wider">
                      {currentUser.vipTier || 'Maison Patron'}
                    </span>
                  </div>

                  <div className="py-1 text-xs">
                    <Link
                      to="/account?tab=orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#4B5563] hover:text-[#171717] hover:bg-[#FAF9F6] transition-colors"
                    >
                      <Package size={14} /> My Orders
                    </Link>
                    <Link
                      to="/account?tab=quotations"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#4B5563] hover:text-[#171717] hover:bg-[#FAF9F6] transition-colors"
                    >
                      <Sparkles size={14} className="text-[#4D5543]" /> AI Studio Dossiers
                    </Link>
                    <Link
                      to="/account?tab=measurements"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#4B5563] hover:text-[#171717] hover:bg-[#FAF9F6] transition-colors"
                    >
                      <Ruler size={14} /> Bespoke Calibrations
                    </Link>
                    <Link
                      to="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#4B5563] hover:text-[#171717] hover:bg-[#FAF9F6] transition-colors"
                    >
                      <User size={14} /> Account Overview
                    </Link>

                    {(currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'tailor_admin') && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[#0284C7] font-semibold hover:bg-sky-50 transition-colors border-t border-[#DAD7D1]/40"
                      >
                        <Shield size={14} /> Admin Command Center
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-[#DAD7D1]/60 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={14} /> Sign Out of Maison
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#171717] rounded-full text-[11px] font-semibold uppercase tracking-wider text-[#171717] hover:bg-[#171717] hover:text-white transition-all shadow-xs"
              aria-label="Sign In or Register"
            >
              <User size={13} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>


      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF9F6] border-b border-[#DAD7D1] px-6 py-6 space-y-4 animate-in slide-in-from-top">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={(e) => {
                  if (handleCustomStudioClick(e, link.path)) return;
                  setMobileMenuOpen(false);
                }}
                className="text-sm uppercase tracking-widest py-2 text-[#171717] border-b border-[#DAD7D1]/40 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {link.highlight && <Sparkles size={14} className="text-[#4D5543]" />}
                  {link.name}
                </span>
                <span className="text-xs text-[#77736E]">→</span>
              </Link>
            ))}
            <Link
              to="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-widest py-2 text-[#171717] border-b border-[#DAD7D1]/40 flex items-center justify-between"
            >
              Client Concierge & Orders
              <span className="text-xs text-[#77736E]">→</span>
            </Link>

            {onOpenContact && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenContact();
                }}
                className="w-full text-left text-sm uppercase tracking-widest py-2 text-[#171717] flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Mail size={14} className="text-[#4D5543]" />
                  <span>Email Official Concierge</span>
                </span>
                <span className="text-xs text-[#77736E]">→</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
