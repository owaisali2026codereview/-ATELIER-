import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import {
  useGetMeQuery,
  useGetMyOrdersQuery,
  useGetMyDossiersQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useAddDossierMessageMutation,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useGetWishlistQuery,
  useToggleWishlistMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from '../store/api/apiSlice';
import {
  Package,
  Sparkles,
  Heart,
  Ruler,
  Clock,
  CheckCircle2,
  ArrowRight,
  User,
  ShoppingBag,
  Bell,
  MessageSquare,
  Send,
  Check,
  Truck,
  ExternalLink,
  LogOut,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Trash2,
} from 'lucide-react';

export default function AccountPage({ onOpenAuth }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [clientMessageInput, setClientMessageInput] = useState({});

  // Synchronize activeTab whenever the URL query parameter ?tab= changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const studio = useSelector((state) => state.studio);

  // Authentication Queries & Mutations
  const token = typeof window !== 'undefined' ? localStorage.getItem('atelier_token') : null;
  const { data: userData, refetch: refetchUser, isLoading: isUserLoading } = useGetMeQuery(undefined, { skip: !token });
  const userFullName = userData?.data?.firstName
    ? `${userData.data.firstName} ${userData.data.lastName || ''}`
    : 'Honored Patron';
  const userEmail = userData?.data?.email || '';
  const userTier = userData?.data?.vipTier || 'Gold Needle';

  const { data: ordersResponse } = useGetMyOrdersQuery(undefined, { skip: !token });
  const { data: dossiersResponse } = useGetMyDossiersQuery(undefined, { skip: !token });
  const { data: notificationsResponse } = useGetNotificationsQuery(undefined, { pollingInterval: 15000, skip: !token });
  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !token });

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [toggleWishlistMutation] = useToggleWishlistMutation();
  const [forgotPasswordMutation, { isLoading: isSendingReset }] = useForgotPasswordMutation();
  const [resetPasswordMutation, { isLoading: isResettingPassword }] = useResetPasswordMutation();

  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [addDossierMessage, { isLoading: isSendingMessage }] = useAddDossierMessageMutation();

  // Reset Token from URL parameters
  const resetTokenParam = searchParams.get('resetToken') || '';
  const resetEmailParam = searchParams.get('email') || '';

  // Local Auth Form State (for unauthenticated visitors)
  const [authMode, setAuthMode] = useState(resetTokenParam ? 'reset' : 'login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [authEmail, setAuthEmail] = useState(resetEmailParam || '');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authShowPassword, setAuthShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [directResetUrl, setDirectResetUrl] = useState('');

  // Local Wishlist State (synced with localStorage)
  const [localWishlist, setLocalWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
        setLocalWishlist(stored);
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const realWishlist = useMemo(() => {
    const merged = [];
    const seen = new Set();

    // 1. Database items if logged in
    if (token && Array.isArray(wishlistData?.data)) {
      wishlistData.data.forEach((p) => {
        if (!p) return;
        const pid = (p._id || p.id || p.slug || '').toString();
        if (pid && !seen.has(pid)) {
          seen.add(pid);
          merged.push(p);
        }
      });
    }

    // 2. Local storage items (preserves guest items and merges seamlessly)
    if (Array.isArray(localWishlist)) {
      localWishlist.forEach((lp) => {
        if (!lp) return;
        const lpid = (lp._id || lp.id || lp.slug || '').toString();
        if (lpid && !seen.has(lpid)) {
          seen.add(lpid);
          merged.push(lp);
        }
      });
    }

    return merged;
  }, [token, wishlistData, localWishlist]);

  // Measurements Editing State
  const [measurements, setMeasurements] = useState({
    bustChest: 40,
    naturalWaist: 33,
    hips: 39,
    shoulderWidth: 18.5,
    height: '6 ft 1 in',
    unit: 'in',
  });
  const [measurementsSaved, setMeasurementsSaved] = useState(false);

  // Sync measurements from user data when loaded
  useEffect(() => {
    if (userData?.data?.measurementsProfile) {
      setMeasurements({
        bustChest: userData.data.measurementsProfile.bustChest || 40,
        naturalWaist: userData.data.measurementsProfile.naturalWaist || 33,
        hips: userData.data.measurementsProfile.hips || 39,
        shoulderWidth: userData.data.measurementsProfile.shoulderWidth || 18.5,
        height: userData.data.measurementsProfile.height || '6 ft 1 in',
        unit: userData.data.measurementsProfile.unit || 'in',
      });
    }
  }, [userData]);

  const realOrders = useMemo(() => {
    let list = ordersResponse?.data && Array.isArray(ordersResponse.data) ? [...ordersResponse.data] : [];
    try {
      const stored = localStorage.getItem('atelier_user_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((localOrder) => {
            const num = localOrder.orderNumber || localOrder.id;
            const orderEmail = localOrder.email || localOrder.shippingAddress?.email;
            const matchesUser = !userEmail || !orderEmail || orderEmail.toLowerCase() === userEmail.toLowerCase();
            if (matchesUser && !list.some((o) => (o.orderNumber || o._id || o.id) === num)) {
              list.push(localOrder);
            }
          });
        }
      }
    } catch (e) {}
    return list;
  }, [ordersResponse, userEmail]);

  const realDossiers = dossiersResponse?.data || [];
  const notifications = notificationsResponse?.data || [];
  const unreadCount = notificationsResponse?.unreadCount || 0;

  const activeOrdersCount = realOrders.length || 0;
  const activeDossiersCount = realDossiers.length || (studio.quotationCode ? 1 : 0);

  const isLoggedIn = Boolean(token && (userData?.data || !userData?.error));

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (authMode === 'login') {
      if (!authEmail.trim() || !authPassword.trim()) {
        setAuthError('Please enter both your patron email and password.');
        return;
      }

      try {
        const res = await loginMutation({
          email: authEmail.trim().toLowerCase(),
          password: authPassword.trim(),
        }).unwrap();

        const user = res?.data || res?.user || res;
        if (res.token) {
          localStorage.setItem('atelier_token', res.token);
        }
        localStorage.setItem('fashion_patron_session', JSON.stringify(user));
        setAuthSuccess(`Welcome back, ${user.firstName || 'Honored Patron'}. Calibrating session...`);
        refetchUser();
      } catch (err) {
        setAuthError(err?.data?.message || err?.error || 'Authentication rejected. Verify credentials or register.');
      }
    } else if (authMode === 'register') {
      if (!authFirstName.trim() || !authLastName.trim() || !authEmail.trim() || !authPassword.trim()) {
        setAuthError('All standard profile fields (Name, Email, Password) are mandatory.');
        return;
      }

      if (authPassword.length < 6) {
        setAuthError('Password must contain at least 6 characters.');
        return;
      }

      const cleanPhone = authPhone ? authPhone.replace(/[\s-]/g, '').trim() : '';
      if (!cleanPhone) {
        setAuthError('Phone number is required. Please provide your 11-digit Pakistani mobile number.');
        return;
      }

      if (!/^\d+$/.test(cleanPhone)) {
        setAuthError('Phone number must contain numbers only.');
        return;
      }

      if (!cleanPhone.startsWith('03')) {
        setAuthError('Pakistani mobile number must start with 03 (e.g., 03001234567).');
        return;
      }

      if (cleanPhone.length !== 11) {
        setAuthError(`Pakistani mobile number must be exactly 11 digits (e.g., 03001234567). Currently ${cleanPhone.length} of 11.`);
        return;
      }

      try {
        const res = await registerMutation({
          firstName: authFirstName.trim(),
          lastName: authLastName.trim(),
          email: authEmail.trim().toLowerCase(),
          password: authPassword.trim(),
          phone: cleanPhone,
        }).unwrap();

        const user = res?.data || res?.user || res;
        if (res.token) {
          localStorage.setItem('atelier_token', res.token);
        }
        localStorage.setItem('fashion_patron_session', JSON.stringify(user));
        setAuthSuccess('Your patron profile has been created. Welcome to Atelier.');
        refetchUser();
      } catch (err) {
        setAuthError(err?.data?.message || err?.error || 'Account registration failed. Email may already be registered.');
      }
    } else if (authMode === 'forgot') {
      if (!authEmail.trim()) {
        setAuthError('Please enter your account email address.');
        return;
      }

      try {
        const res = await forgotPasswordMutation(authEmail.trim().toLowerCase()).unwrap();
        setAuthSuccess(res.message || 'Password reset instructions have been generated.');
        if (res.data?.resetUrl) {
          setDirectResetUrl(res.data.resetUrl);
        }
      } catch (err) {
        setAuthError(err?.data?.message || err?.error || 'Unable to generate reset link. Please check your email.');
      }
    } else if (authMode === 'reset') {
      if (!authPassword) {
        setAuthError('Please enter a new password.');
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError('Passwords do not match. Please verify your entries.');
        return;
      }
      if (authPassword.length < 6) {
        setAuthError('Password must contain at least 6 characters.');
        return;
      }

      try {
        const res = await resetPasswordMutation({
          token: resetTokenParam || searchParams.get('resetToken'),
          password: authPassword,
        }).unwrap();

        const user = res?.data || res?.user || res;
        if (res.token) {
          localStorage.setItem('atelier_token', res.token);
        }
        localStorage.setItem('fashion_patron_session', JSON.stringify(user));
        setAuthSuccess('Password has been successfully updated. Welcome back!');
        refetchUser();
      } catch (err) {
        setAuthError(err?.data?.message || err?.error || 'Password reset failed. Token may have expired.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('atelier_token');
    localStorage.removeItem('fashion_patron_session');
    window.location.reload();
  };

  const handleSaveMeasurements = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        measurementsProfile: measurements,
      }).unwrap();
      setMeasurementsSaved(true);
      setTimeout(() => setMeasurementsSaved(false), 4000);
    } catch (err) {
      console.error('Failed to update calibrations:', err);
    }
  };

  const handleSendDossierMessage = async (refCode) => {
    const text = clientMessageInput[refCode];
    if (!text || !text.trim()) return;

    try {
      await addDossierMessage({ refCode, message: text.trim() }).unwrap();
      setClientMessageInput((prev) => ({ ...prev, [refCode]: '' }));
    } catch (err) {
      console.error('Failed to append message:', err);
    }
  };

  const handleRemoveFromWishlist = async (prod) => {
    const rawId = prod._id || prod.id || prod.slug;
    try {
      const stored = JSON.parse(localStorage.getItem('atelier_wishlist') || '[]');
      const updated = stored.filter((item) => (item._id || item.id || item.slug || item).toString() !== rawId.toString());
      localStorage.setItem('atelier_wishlist', JSON.stringify(updated));
      setLocalWishlist(updated);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      // ignore
    }

    if (token && (prod._id || prod.id)) {
      try {
        await toggleWishlistMutation(prod._id || prod.id).unwrap();
      } catch (e) {
        // ignore
      }
    }
  };

  const handleAddWishlistItemToCart = (prod) => {
    const image = (Array.isArray(prod.images) && prod.images[0]) || prod.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80';
    const size = (Array.isArray(prod.sizes) && prod.sizes[0]) || 'M';
    const color = (Array.isArray(prod.colors) && prod.colors[0]?.name) || 'Classic';

    dispatch(
      addToCart({
        id: prod._id || prod.id || prod.slug,
        name: prod.name,
        price: prod.price,
        size: typeof size === 'string' ? size : size.size || 'M',
        color,
        image,
        badge: prod.badge,
      })
    );
  };

  const handleMoveWishlistToCart = () => {
    realWishlist.forEach((prod) => {
      handleAddWishlistItemToCart(prod);
    });
  };

  const handleAcceptCustomQuote = (dossier) => {
    const quotePrice = Number(dossier.officialQuoteAmount) || 25000;
    const silhouetteName = dossier.parameters?.category || dossier.parameters?.silhouette || 'Couture Garment';
    const fabricName = dossier.parameters?.fabric?.name || dossier.fabricChoice || 'Bespoke Archival Fabric';
    const image = dossier.aiConcepts?.[0]?.imageUrl || dossier.generatedVisualUrl || dossier.sketchUrl || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80';

    dispatch(
      addToCart({
        id: `BESPOKE-${dossier.referenceCode}`,
        name: `Bespoke Tailoring: ${silhouetteName} (${dossier.referenceCode})`,
        price: quotePrice,
        size: 'Custom 3D Fit',
        color: fabricName,
        image,
        badge: 'Custom Commission',
      })
    );
  };

  // ================= RENDER UNAUTHENTICATED STATE =================
  if (!isLoggedIn && activeTab !== 'wishlist') {
    return (
      <div className="w-full bg-[#FAF9F6] min-h-screen py-12 px-6">
        <div className="max-w-md mx-auto bg-white border border-[#DAD7D1] rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-[#171717] mb-3 bg-[#FAF9F6] shadow-sm font-editorial text-2xl font-bold text-[#171717]">
              A
            </div>
            <h1 className="font-editorial text-2xl uppercase tracking-widest text-[#171717]">
              Patron Concierge
            </h1>
            <p className="text-xs text-[#77736E] mt-1">
              Sign in to review sartorial orders, calibrate bespoke 3D measurements, and track AI dossiers.
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-b border-[#DAD7D1] mb-6">
            {authMode === 'reset' ? (
              <div className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#171717] border-b-2 border-[#171717] text-center">
                Reset Password
              </div>
            ) : authMode === 'forgot' ? (
              <div className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#171717] border-b-2 border-[#171717] text-center">
                Recover Credentials
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-[1px] ${
                    authMode === 'login'
                      ? 'border-[#171717] text-[#171717]'
                      : 'border-transparent text-[#77736E] hover:text-[#171717]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-[1px] ${
                    authMode === 'register'
                      ? 'border-[#171717] text-[#171717]'
                      : 'border-transparent text-[#77736E] hover:text-[#171717]'
                  }`}
                >
                  Create Account
                </button>
              </>
            )}
          </div>

          {/* Error & Success Feedback */}
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-700 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Check size={15} className="shrink-0 text-green-600" />
                <span className="font-semibold">{authSuccess}</span>
              </div>
              {directResetUrl && (
                <a
                  href={directResetUrl}
                  className="mt-1 text-xs text-[#171717] underline font-bold"
                >
                  Click here to proceed directly to Password Reset →
                </a>
              )}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4B5563] mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authFirstName}
                    onChange={(e) => setAuthFirstName(e.target.value)}
                    placeholder="Julian"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#DAD7D1] rounded text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4B5563] mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authLastName}
                    onChange={(e) => setAuthLastName(e.target.value)}
                    placeholder="Vane"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#DAD7D1] rounded text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>
              </div>
            )}

            {(authMode === 'login' || authMode === 'register' || authMode === 'forgot') && (
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4B5563] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-3 text-[#9CA3AF]" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="client@atelier.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF9F6] border border-[#DAD7D1] rounded text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>
              </div>
            )}

            {(authMode === 'login' || authMode === 'register' || authMode === 'reset') && (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4B5563]">
                    {authMode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="text-[11px] text-[#4D5543] hover:text-[#171717] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 text-[#9CA3AF]" />
                  <input
                    type={authShowPassword ? 'text' : 'password'}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 bg-[#FAF9F6] border border-[#DAD7D1] rounded text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                  <button
                    type="button"
                    onClick={() => setAuthShowPassword(!authShowPassword)}
                    className="absolute right-3 top-3 text-[#9CA3AF] hover:text-[#171717]"
                    aria-label="Toggle password visibility"
                  >
                    {authShowPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {authMode === 'reset' && (
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4B5563] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 text-[#9CA3AF]" />
                  <input
                    type="password"
                    required
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF9F6] border border-[#DAD7D1] rounded text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>
              </div>
            )}

            {authMode === 'register' && (
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4B5563] mb-1">
                  Phone Number * <span className="text-amber-800 font-medium">(Pakistani Mobile: 03XX-XXXXXXX)</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-3 text-[#9CA3AF]" />
                  <input
                    type="tel"
                    required
                    value={authPhone}
                    maxLength={11}
                    onChange={(e) => {
                      const numbersOnly = e.target.value.replace(/\D/g, '');
                      if (numbersOnly.length <= 11) {
                        setAuthPhone(numbersOnly);
                      }
                    }}
                    placeholder="03001234567"
                    className={`w-full pl-9 pr-3 py-2 bg-[#FAF9F6] border rounded text-sm text-[#171717] focus:outline-none transition-colors ${
                      authPhone && (!authPhone.startsWith('03') || authPhone.length !== 11)
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#DAD7D1] focus:border-[#171717]'
                    }`}
                  />
                </div>
                {authPhone && !authPhone.startsWith('03') && (
                  <p className="text-[10px] text-red-600 mt-1 font-medium">
                    Mobile number must start with 03 (e.g. 03001234567).
                  </p>
                )}
                {authPhone && authPhone.startsWith('03') && authPhone.length < 11 && (
                  <p className="text-[10px] text-amber-700 mt-1 font-medium">
                    {11 - authPhone.length} more digit(s) needed. Exactly 11 digits required.
                  </p>
                )}
                {authPhone && authPhone.startsWith('03') && authPhone.length === 11 && (
                  <p className="text-[10px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
                    <Check size={12} /> Valid 11-digit Pakistani mobile number.
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || isRegistering || isSendingReset || isResettingPassword}
              className="w-full py-3 bg-[#171717] hover:bg-black text-white text-xs font-semibold uppercase tracking-[0.15em] rounded transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoggingIn || isRegistering || isSendingReset || isResettingPassword ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Processing Request...</span>
                </span>
              ) : authMode === 'login' ? (
                'Sign In to Maison'
              ) : authMode === 'register' ? (
                'Register Patron Account'
              ) : authMode === 'forgot' ? (
                'Send Reset Instructions'
              ) : (
                'Update Password & Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#DAD7D1] text-center text-[11px] text-[#77736E]">
            {authMode === 'login' ? (
              <p>
                First time at Maison Atelier?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="text-[#171717] font-semibold underline underline-offset-2 ml-1"
                >
                  Register Account
                </button>
              </p>
            ) : authMode === 'forgot' ? (
              <p>
                Remembered your credentials?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="text-[#171717] font-semibold underline underline-offset-2 ml-1"
                >
                  Sign In
                </button>
              </p>
            ) : authMode === 'reset' ? (
              <p>
                Want to sign in instead?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="text-[#171717] font-semibold underline underline-offset-2 ml-1"
                >
                  Back to Sign In
                </button>
              </p>
            ) : (
              <p>
                Already have patron credentials?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="text-[#171717] font-semibold underline underline-offset-2 ml-1"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER AUTHENTICATED DASHBOARD =================
  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Profile Banner / Guest Wishlist Header */}
        {!isLoggedIn ? (
          <div className="bg-white border border-[#DAD7D1] rounded-lg p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-[#171717] text-white flex items-center justify-center font-editorial text-2xl font-bold shadow-sm">
                <Heart size={26} className="text-[#C5A880]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-editorial text-2xl sm:text-3xl text-[#171717]">
                    Curated Wishlist
                  </h1>
                  <span className="px-2 py-0.5 bg-[#F1EFEA] text-[#171717] border border-[#DAD7D1] rounded text-[10px] font-bold uppercase tracking-wider">
                    Guest Mode
                  </span>
                </div>
                <p className="text-xs text-[#77736E] mt-0.5">
                  Saved pieces in this browser. Sign in anytime to permanently synchronize your archive across all devices.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onOpenAuth) onOpenAuth('login', '/account?tab=wishlist');
                  else setAuthMode('login');
                }}
                className="px-5 py-2.5 bg-[#171717] hover:bg-[#353535] text-white rounded text-xs font-semibold uppercase tracking-wider transition shadow-sm"
              >
                Sign In to Sync
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#DAD7D1] rounded-lg p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-[#171717] text-white flex items-center justify-center font-editorial text-2xl font-bold shadow-sm">
                {userFullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-editorial text-2xl sm:text-3xl text-[#171717]">
                    {userFullName}
                  </h1>
                  <span className="px-2 py-0.5 bg-[#DDE6CE] text-[#4D5543] rounded text-[10px] font-bold uppercase tracking-wider">
                    {userTier}
                  </span>
                </div>
                <p className="text-xs text-[#77736E] mt-0.5">
                  {userEmail} • Bespoke Sartorial Profile Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="bg-[#FAF9F6] border border-[#DAD7D1] px-4 py-2.5 rounded text-center">
                <span className="text-[10px] uppercase text-[#77736E] block font-semibold">Active Orders</span>
                <strong className="text-sm text-[#171717]">{activeOrdersCount} Total</strong>
              </div>
              <div className="bg-[#FAF9F6] border border-[#DAD7D1] px-4 py-2.5 rounded text-center">
                <span className="text-[10px] uppercase text-[#77736E] block font-semibold">AI Quotations</span>
                <strong className="text-sm text-[#4D5543]">{activeDossiersCount} Active</strong>
              </div>
              {unreadCount > 0 && (
                <div
                  onClick={() => handleTabChange('notifications')}
                  className="bg-[#4D5543] text-white px-3 py-2.5 rounded text-center cursor-pointer hover:bg-[#171717] transition-colors"
                >
                  <span className="text-[9px] uppercase tracking-wider block font-bold">Advisories</span>
                  <span className="text-xs font-bold flex items-center justify-center gap-1">
                    <Bell size={11} /> {unreadCount} New
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="p-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1.5 font-semibold text-xs"
                title="Sign Out of Maison"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-[#DAD7D1] mb-8 overflow-x-auto gap-8 text-xs font-semibold uppercase tracking-wider">
          {[
            { id: 'orders', label: `Ready-to-Wear Orders (${activeOrdersCount})`, icon: Package, protected: true },
            { id: 'quotations', label: `AI Custom Studio Dossiers (${activeDossiersCount})`, icon: Sparkles, protected: true },
            {
              id: 'notifications',
              label: `Advisories & Alerts ${unreadCount > 0 ? `(${unreadCount})` : ''}`,
              icon: Bell,
              protected: true,
            },
            { id: 'wishlist', label: `Curated Wishlist (${realWishlist.length})`, icon: Heart, protected: false },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (!isLoggedIn && tab.protected) {
                    if (onOpenAuth) onOpenAuth('login', `/account?tab=${tab.id}`);
                    else handleTabChange(tab.id);
                  } else {
                    handleTabChange(tab.id);
                  }
                }}
                className={`flex items-center gap-2 pb-4 transition-all border-b-2 -mb-[1px] whitespace-nowrap ${
                  active
                    ? 'border-[#171717] text-[#171717]'
                    : 'border-transparent text-[#77736E] hover:text-[#171717]'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {realOrders.length > 0 ? (
              realOrders.map((order) => {
                const statusLabels = {
                  placed: 'Order Placed & Queued',
                  garment_inspection: 'Quality Inspection',
                  pressing: 'Finishing & Pressing',
                  dispatched: 'Dispatched for Delivery',
                  delivered: 'Delivered',
                };
                const statusColors = {
                  placed: 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30',
                  garment_inspection: 'bg-[#4D5543]/10 text-[#4D5543] border-[#4D5543]/30',
                  pressing: 'bg-[#1E3A8A]/10 text-[#1E3A8A] border-[#1E3A8A]/30',
                  dispatched: 'bg-[#047857]/10 text-[#047857] border-[#047857]/30',
                  delivered: 'bg-[#171717]/10 text-[#171717] border-[#171717]/30',
                };

                return (
                  <div key={order._id || order.orderNumber} className="bg-white border border-[#DAD7D1] rounded-lg p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#DAD7D1] gap-2 text-xs">
                      <div>
                        <span className="text-[#77736E]">Order Ref: </span>
                        <strong className="text-[#171717] font-mono">{order.orderNumber}</strong>
                        <span className="ml-3 text-[#77736E]">
                          • Placed on {new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${statusColors[order.fulfillmentStatus] || 'bg-[#FAF9F6] text-[#171717]'}`}>
                          {statusLabels[order.fulfillmentStatus] || order.fulfillmentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="py-4 space-y-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=300&q=80'}
                            alt={item.name}
                            className="w-16 h-20 object-cover rounded bg-[#F1EFEA] border border-[#DAD7D1]"
                          />
                          <div className="flex-1 text-xs">
                            <h4 className="font-semibold text-[#171717]">{item.name}</h4>
                            <p className="text-[#77736E] mt-0.5">
                              Size: {item.size || 'Standard'} • Color: {item.color || 'Archival'} • Qty: {item.quantity || 1}
                            </p>
                            <p className="font-semibold text-[#171717] mt-1">Rs. {Number(item.price).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#DAD7D1] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[#77736E]">Total Amount: </span>
                        <strong className="text-[#171717] font-semibold text-sm">Rs. {Number(order.totalAmount).toLocaleString()}</strong>
                        {order.trackingCode && (
                          <span className="ml-4 font-mono text-[11px] text-[#4D5543] bg-[#F1EFEA] px-2 py-0.5 rounded">
                            Tracking: {order.trackingCode}
                          </span>
                        )}
                      </div>
                      <Link
                        to="/order-confirmation"
                        className="text-xs uppercase tracking-wider font-semibold text-[#4D5543] hover:text-[#171717] flex items-center gap-1"
                      >
                        <span>Track Full Protocol</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white border border-[#DAD7D1] rounded-lg p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#DAD7D1] gap-2 text-xs">
                  <div>
                    <span className="text-[#77736E]">Order Ref: </span>
                    <strong className="text-[#171717]">ATL-ORD-948201</strong>
                    <span className="ml-3 text-[#77736E]">• Demo Archival Order</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4D5543] animate-pulse" />
                    <span className="font-semibold text-[#4D5543]">In Atelier: Hand-Finishing</span>
                  </div>
                </div>

                <div className="py-4 space-y-4">
                  <div className="flex gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=300&q=80"
                      alt="Oxford"
                      className="w-16 h-20 object-cover rounded bg-[#F1EFEA] border border-[#DAD7D1]"
                    />
                    <div className="flex-1 text-xs">
                      <h4 className="font-semibold text-[#171717]">Archival Crisp Cotton Oxford Shirt</h4>
                      <p className="text-[#77736E] mt-0.5">Size: 40 (M) • Hue: Pure White • Qty: 1</p>
                      <p className="font-semibold text-[#171717] mt-2">Rs. 6,500</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#DAD7D1] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-[#77736E]">Estimated White-Glove Delivery: In 3 business days</span>
                  <Link
                    to="/order-confirmation"
                    className="text-xs uppercase tracking-wider font-semibold text-[#4D5543] hover:text-[#171717] flex items-center gap-1"
                  >
                    <span>Track Full Protocol</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: AI Custom Studio Dossiers */}
        {activeTab === 'quotations' && (
          <div className="space-y-6">
            {realDossiers.length > 0 ? (
              realDossiers.map((dossier) => {
                const selectedConcept = dossier.aiConcepts?.find((c) => c.id === dossier.selectedConceptId) || dossier.aiConcepts?.[0] || {
                  title: dossier.parameters?.category || 'Custom Bespoke Silhouette',
                  description: dossier.parameters?.prompt || 'Tailored to patron specifications.',
                  imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80',
                };

                const tailorStatusConfig = {
                  feasibility_review: { label: 'Tailor Feasibility Review (Pending)', color: 'text-[#D97706]', dot: 'bg-[#D97706]' },
                  quote_ready: { label: 'Quotation Ready & Approved', color: 'text-[#047857]', dot: 'bg-[#047857]' },
                  tailoring_in_progress: { label: 'In Artisan Atelier: Cutting & Hand-Stitching', color: 'text-[#1E3A8A]', dot: 'bg-[#1E3A8A]' },
                  dispatched: { label: 'Dispatched for White-Glove Fitting', color: 'text-[#4D5543]', dot: 'bg-[#4D5543]' },
                  delivered: { label: 'Delivered & Calibrated', color: 'text-[#171717]', dot: 'bg-[#171717]' },
                };
                const statusMeta = tailorStatusConfig[dossier.tailorStatus] || tailorStatusConfig.feasibility_review;

                return (
                  <div key={dossier._id || dossier.referenceCode} className="bg-white border border-[#DAD7D1] rounded-lg p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#DAD7D1] gap-2 text-xs">
                      <div>
                        <span className="text-[#77736E]">Bespoke Dossier: </span>
                        <strong className="text-[#171717] font-mono">{dossier.referenceCode}</strong>
                        <span className="ml-3 text-[#77736E]">
                          • Submitted on {new Date(dossier.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusMeta.dot} animate-pulse`} />
                        <span className={`font-semibold ${statusMeta.color}`}>{statusMeta.label}</span>
                      </div>
                    </div>

                    <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      <div className="md:col-span-4 aspect-[4/3] rounded overflow-hidden bg-[#171717] border border-[#DAD7D1]">
                        <img
                          src={selectedConcept.imageUrl || selectedConcept.image || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80'}
                          alt={selectedConcept.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="md:col-span-8 space-y-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4D5543]">
                            Silhouette: {dossier.parameters?.silhouette || dossier.parameters?.category}
                          </span>
                          <h3 className="font-editorial text-xl text-[#171717] mt-1">
                            {selectedConcept.title}
                          </h3>
                          <p className="text-[#77736E] mt-1">
                            {selectedConcept.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="bg-[#FAF9F6] p-2.5 rounded border border-[#DAD7D1]">
                            <span className="text-[10px] text-[#77736E] uppercase block">Selected Textile</span>
                            <strong className="text-[#171717]">{dossier.parameters?.fabric?.name || dossier.parameters?.fabric || 'Mulberry Silk'}</strong>
                          </div>
                          <div className="bg-[#FAF9F6] p-2.5 rounded border border-[#DAD7D1]">
                            <span className="text-[10px] text-[#77736E] uppercase block">Master Tailor Quote</span>
                            <strong className="text-[#35664A] text-sm">
                              {dossier.officialQuoteAmount ? `Rs. ${dossier.officialQuoteAmount.toLocaleString()}` : 'Awaiting Final Yardage Calculation'}
                            </strong>
                          </div>
                        </div>

                        {dossier.tailorNotes && (
                          <div className="bg-[#F1EFEA]/60 border border-[#DAD7D1] rounded p-3 text-xs">
                            <span className="text-[10px] uppercase font-bold text-[#4D5543] block">Master Tailor Advisory:</span>
                            <p className="text-[#171717] italic mt-0.5">{dossier.tailorNotes}</p>
                          </div>
                        )}

                        {/* Interactive Dossier Consultation Log */}
                        <div className="border border-[#DAD7D1] rounded p-3 bg-[#FAF9F6] space-y-2.5 mt-2">
                          <div className="flex items-center justify-between border-b border-[#DAD7D1]/60 pb-1.5">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-[#171717] flex items-center gap-1.5">
                              <MessageSquare size={12} className="text-[#4D5543]" />
                              <span>Live Tailor Consultation Log</span>
                            </span>
                            <span className="text-[10px] text-[#77736E]">
                              {dossier.consultationLog?.length || 0} note(s)
                            </span>
                          </div>

                          {dossier.consultationLog && dossier.consultationLog.length > 0 && (
                            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                              {dossier.consultationLog.map((log, lIdx) => (
                                <div
                                  key={lIdx}
                                  className={`p-2 rounded text-[11px] ${
                                    log.sender === 'client'
                                      ? 'bg-white border border-[#DAD7D1] text-[#171717]'
                                      : 'bg-[#171717] text-white'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-[9px] uppercase tracking-wider mb-0.5 opacity-70">
                                    <span>{log.sender === 'client' ? 'You (Patron)' : 'Master Tailor'}</span>
                                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p>{log.message}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              value={clientMessageInput[dossier.referenceCode] || ''}
                              onChange={(e) => setClientMessageInput({ ...clientMessageInput, [dossier.referenceCode]: e.target.value })}
                              placeholder="Message the tailor regarding embroidery density, fitting date..."
                              className="flex-1 bg-white border border-[#DAD7D1] rounded px-3 py-1.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSendDossierMessage(dossier.referenceCode)}
                              disabled={isSendingMessage || !clientMessageInput[dossier.referenceCode]?.trim()}
                              className="px-3 py-1.5 bg-[#171717] text-white text-xs font-semibold rounded hover:bg-[#4D5543] disabled:opacity-50 transition-colors flex items-center gap-1"
                            >
                              <Send size={11} />
                              <span>Send</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#DAD7D1] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <span className="text-[#77736E]">
                        Target Budget: {dossier.parameters?.budgetTier || 'Couture Bespoke'}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {dossier.officialQuoteAmount ? (
                          <button
                            type="button"
                            onClick={() => handleAcceptCustomQuote(dossier)}
                            className="px-4 py-2 bg-[#35664A] hover:bg-[#2A523B] text-white text-xs uppercase font-semibold rounded transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <ShoppingBag size={13} />
                            <span>Accept Quote &amp; Commission (Rs. {Number(dossier.officialQuoteAmount).toLocaleString()})</span>
                          </button>
                        ) : null}
                        <Link
                          to="/custom-studio"
                          className="px-4 py-2 bg-[#171717] text-white text-xs uppercase font-semibold rounded hover:bg-[#4D5543] transition-colors"
                        >
                          Adjust Parameters in Studio
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white border border-[#DAD7D1] rounded-lg p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#DAD7D1] gap-2 text-xs">
                  <div>
                    <span className="text-[#77736E]">Bespoke Dossier: </span>
                    <strong className="text-[#171717]">{studio.trackingCode || 'AI-DSN-8472'}</strong>
                    <span className="ml-3 text-[#77736E]">• Commissioned Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                    <span className="font-semibold text-[#D97706]">Senior Tailor Feasibility Review (Pending 24h)</span>
                  </div>
                </div>

                <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 aspect-[4/3] rounded overflow-hidden bg-[#171717] border border-[#DAD7D1]">
                    <img
                      src={studio.generatedConcepts[studio.selectedConceptIndex].image}
                      alt="Custom Render"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:col-span-8 space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4D5543]">
                        Rendered Silhouette: {studio.category}
                      </span>
                      <h3 className="font-editorial text-xl text-[#171717] mt-1">
                        {studio.generatedConcepts[studio.selectedConceptIndex].title}
                      </h3>
                      <p className="text-[#77736E] mt-1">
                        {studio.generatedConcepts[studio.selectedConceptIndex].description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-[#FAF9F6] p-2.5 rounded border border-[#DAD7D1]">
                        <span className="text-[10px] text-[#77736E] uppercase block">Selected Textile</span>
                        <strong className="text-[#171717]">{studio.fabric}</strong>
                      </div>
                      <div className="bg-[#FAF9F6] p-2.5 rounded border border-[#DAD7D1]">
                        <span className="text-[10px] text-[#77736E] uppercase block">Tailor Feasibility</span>
                        <strong className="text-[#35664A]">{studio.generatedConcepts[studio.selectedConceptIndex].tailorFeasibility}</strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#77736E] pt-1">
                      Directives: {studio.selectedChips.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#DAD7D1] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-[#77736E]">Estimated Bespoke Quotation: {studio.generatedConcepts[studio.selectedConceptIndex].estimatedPrice}</span>
                  <Link
                    to="/custom-studio"
                    className="px-4 py-2 bg-[#171717] text-white text-xs uppercase font-semibold rounded hover:bg-[#4D5543] transition-colors"
                  >
                    Adjust Parameters in Studio
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Advisories & Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#DAD7D1]">
              <div>
                <h3 className="font-editorial text-xl text-[#171717]">Maison Advisories &amp; Order Alerts</h3>
                <p className="text-xs text-[#77736E]">Real-time operational updates on commissions, fittings, and white-glove dispatches.</p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  className="px-3 py-1.5 text-xs text-[#4D5543] font-semibold border border-[#DAD7D1] rounded hover:bg-[#F1EFEA] transition-colors"
                >
                  Mark All as Read
                </button>
              )}
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-4 rounded-lg border transition-all ${
                      notif.isRead
                        ? 'bg-white border-[#DAD7D1] text-[#77736E]'
                        : 'bg-[#FAF9F6] border-[#4D5543] text-[#171717] shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full mt-0.5 ${notif.isRead ? 'bg-[#F1EFEA] text-[#77736E]' : 'bg-[#4D5543] text-white'}`}>
                          <Bell size={14} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs text-[#171717]">{notif.title}</h4>
                            {!notif.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#4D5543]" />
                            )}
                          </div>
                          <p className="text-xs text-[#171717] mt-1 leading-relaxed">{notif.message}</p>
                          <span className="text-[10px] text-[#77736E] mt-1.5 block">
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={() => markNotificationRead(notif._id)}
                          className="text-[11px] text-[#4D5543] hover:underline font-semibold whitespace-nowrap"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#DAD7D1] rounded-lg p-10 text-center space-y-2">
                <Bell size={32} className="mx-auto text-[#DAD7D1]" />
                <h4 className="font-semibold text-sm text-[#171717]">Archive Current</h4>
                <p className="text-xs text-[#77736E]">No pending unread advisories. All commissions are advancing on schedule.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-[#77736E]">
                {realWishlist.length} {realWishlist.length === 1 ? 'Saved Piece' : 'Saved Pieces'} in Private Wishlist
              </span>
              {realWishlist.length > 0 && (
                <button
                  type="button"
                  onClick={handleMoveWishlistToCart}
                  className="px-4 py-2 bg-[#171717] text-white text-xs uppercase font-semibold rounded hover:bg-[#4D5543] flex items-center justify-center gap-2 transition-colors self-start sm:self-auto"
                >
                  <ShoppingBag size={14} />
                  <span>Move All to Curated Bag</span>
                </button>
              )}
            </div>

            {realWishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {realWishlist.map((prod) => {
                  const itemId = prod._id || prod.id || prod.slug;
                  const itemImg = (Array.isArray(prod.images) && prod.images[0]) || prod.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80';
                  const itemPrice = typeof prod.price === 'number' ? prod.price : Number(prod.price) || 0;

                  return (
                    <div key={itemId} className="bg-white border border-[#DAD7D1] rounded p-4 flex gap-4 relative group">
                      <img
                        src={itemImg}
                        alt={prod.name || 'Wishlist item'}
                        className="w-20 h-28 object-cover rounded bg-[#F1EFEA] flex-shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between text-xs min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-semibold text-[#171717] line-clamp-1 truncate">{prod.name}</h4>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromWishlist(prod)}
                              className="text-[#9CA3AF] hover:text-[#DC2626] p-0.5 transition-colors"
                              title="Remove from wishlist"
                              aria-label="Remove item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <p className="text-[11px] text-[#77736E] mt-0.5 truncate">{prod.fabric || prod.category || 'Atelier Exclusive'}</p>
                          <p className="font-semibold text-[#171717] mt-2">Rs. {itemPrice.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[#F1EFEA]">
                          <button
                            type="button"
                            onClick={() => handleAddWishlistItemToCart(prod)}
                            className="text-xs text-[#171717] font-semibold hover:text-[#4D5543] flex items-center gap-1"
                          >
                            <ShoppingBag size={12} />
                            <span>Add to Bag</span>
                          </button>
                          <span className="text-[#DAD7D1]">|</span>
                          <Link
                            to={`/product/${itemId}`}
                            className="text-xs text-[#4D5543] font-semibold underline hover:text-[#171717]"
                          >
                            Inspect →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-[#DAD7D1] rounded-lg p-12 text-center space-y-3">
                <Heart size={36} className="mx-auto text-[#DAD7D1]" />
                <h4 className="font-editorial text-lg text-[#171717]">Your Private Wishlist is Empty</h4>
                <p className="text-xs text-[#77736E] max-w-sm mx-auto">
                  Explore our Haute Couture collections and tap the heart icon on any piece to save it to your private atelier archive.
                </p>
                <div className="pt-2">
                  <Link
                    to="/collection"
                    className="inline-block px-5 py-2.5 bg-[#171717] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#4D5543] transition-colors"
                  >
                    Explore Collections
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
