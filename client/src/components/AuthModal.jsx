import React, { useState, useEffect } from 'react';
import { useLoginMutation, useRegisterMutation } from '../store/api/apiSlice';
import { X, Lock, Mail, User, Phone, Sparkles, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, defaultMode = 'login', onSuccess }) {
  const [mode, setMode] = useState(defaultMode); // 'login' or 'register'

  useEffect(() => {
    setMode(defaultMode);
    setErrorMessage('');
    setSuccessMessage('');
  }, [defaultMode, isOpen]);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();

  if (!isOpen) return null;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Please provide both your registered email and password.');
        return;
      }

      try {
        const res = await loginMutation({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }).unwrap();

        const user = res?.data || res?.user || res;
        if (res.token) {
          localStorage.setItem('atelier_token', res.token);
        }
        localStorage.setItem('fashion_patron_session', JSON.stringify(user));
        try {
          const bc = new BroadcastChannel('atelier_live_sync');
          bc.postMessage({ type: 'PATRON_LOGIN', user });
          bc.close();
        } catch (e) {}

        setSuccessMessage(`Welcome back, ${user.firstName || 'Honored Patron'}. Authenticated successfully.`);
        setTimeout(() => {
          if (onSuccess) onSuccess(user);
          onClose();
        }, 800);
      } catch (err) {
        setErrorMessage(
          err?.data?.message || err?.error || 'Authentication failed. Please verify credentials or register.'
        );
      }
    } else {
      // Register Mode
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('All core fields (First Name, Last Name, Email, Password) are required.');
        return;
      }

      if (password.length < 6) {
        setErrorMessage('For client security, password must contain at least 6 characters.');
        return;
      }

      const cleanPhone = phone ? phone.replace(/[\s-]/g, '').trim() : '';
      if (!cleanPhone) {
        setErrorMessage('Phone number is required. Please provide your 11-digit Pakistani mobile number.');
        return;
      }

      if (!/^\d+$/.test(cleanPhone)) {
        setErrorMessage('Phone number must contain numbers only.');
        return;
      }

      if (cleanPhone.startsWith('03')) {
        if (cleanPhone.length !== 11) {
          setErrorMessage(`Pakistani mobile number must be exactly 11 digits (e.g., 03000000000). Currently ${cleanPhone.length} of 11.`);
          return;
        }
      } else if (cleanPhone.length < 8 || cleanPhone.length > 11) {
        setErrorMessage(`Please enter a valid telephone number (8 to 11 digits). Currently ${cleanPhone.length} digits.`);
        return;
      }

      try {
        const res = await registerMutation({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          phone: cleanPhone,
        }).unwrap();

        const user = res?.data || res?.user || res;
        if (res.token) {
          localStorage.setItem('atelier_token', res.token);
        }
        localStorage.setItem('fashion_patron_session', JSON.stringify(user));

        try {
          const existing = JSON.parse(localStorage.getItem('atelier_registered_patrons') || '[]');
          if (!existing.some((p) => p.email === user.email)) {
            existing.unshift({
              id: user._id || user.id || `usr-${Date.now()}`,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Store Patron',
              email: user.email,
              phone: user.phone || cleanPhone || '0300-0000000',
              orders: 0,
              status: 'Active',
              tier: 'Standard',
            });
            localStorage.setItem('atelier_registered_patrons', JSON.stringify(existing));
          }
          const bc = new BroadcastChannel('atelier_live_sync');
          bc.postMessage({ type: 'PATRON_REGISTERED', user });
          bc.close();
        } catch (e) {}

        setSuccessMessage('Your Maison Patron account has been calibrated. Welcome to Atelier.');
        setTimeout(() => {
          if (onSuccess) onSuccess(user);
          onClose();
        }, 800);
      } catch (err) {
        setErrorMessage(
          err?.data?.message || err?.error || 'Account creation encountered an issue. Email may already be in use.'
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#77736E] hover:text-[#171717] p-1.5 rounded-full hover:bg-[#F1EFEA] transition-colors"
          aria-label="Close Authentication Modal"
        >
          <X size={20} />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#171717] mb-3 bg-white shadow-sm font-editorial text-lg font-bold text-[#171717]">
            A
          </div>
          <h2 className="font-editorial text-2xl uppercase tracking-widest text-[#171717]">
            Maison Atelier
          </h2>
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#77736E] font-medium mt-1">
            Client Authentication & Bespoke Vault
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-[#DAD7D1] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-[1px] ${
              mode === 'login'
                ? 'border-[#171717] text-[#171717]'
                : 'border-transparent text-[#77736E] hover:text-[#171717]'
            }`}
          >
            Patron Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-[1px] ${
              mode === 'register'
                ? 'border-[#171717] text-[#171717]'
                : 'border-transparent text-[#77736E] hover:text-[#171717]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-700 flex items-center gap-2">
            <Check size={15} className="shrink-0 text-green-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4B5563] mb-1">
                  First Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-3 text-[#9CA3AF]" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Julian"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#DAD7D1] rounded text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4B5563] mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Vane"
                  className="w-full px-3 py-2 bg-white border border-[#DAD7D1] rounded text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4B5563] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-3 text-[#9CA3AF]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@atelier.com"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#DAD7D1] rounded text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>
          </div>

          <div>
            <div className="mb-1">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4B5563]">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-3 text-[#9CA3AF]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 bg-white border border-[#DAD7D1] rounded text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#9CA3AF] hover:text-[#171717]"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4B5563] mb-1">
                Phone Number * <span className="text-amber-800 font-medium">(Pakistani Mobile: 03XX-XXXXXXX)</span>
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-3 text-[#9CA3AF]" />
                <input
                  type="tel"
                  required
                  value={phone}
                  maxLength={11}
                  onChange={(e) => {
                    const numbersOnly = e.target.value.replace(/\D/g, '');
                    if (numbersOnly.length <= 11) {
                      setPhone(numbersOnly);
                    }
                  }}
                  placeholder="03001234567"
                  className={`w-full pl-9 pr-3 py-2 bg-white border rounded text-sm text-[#171717] focus:outline-none transition-colors ${
                    phone && (!phone.startsWith('03') || phone.length !== 11)
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[#DAD7D1] focus:border-[#171717]'
                  }`}
                />
              </div>
              {phone && !phone.startsWith('03') && (
                <p className="text-[10px] text-red-600 mt-1 font-medium">
                  Mobile number must start with 03 (e.g. 03001234567).
                </p>
              )}
              {phone && phone.startsWith('03') && phone.length < 11 && (
                <p className="text-[10px] text-amber-700 mt-1 font-medium">
                  {11 - phone.length} more digit(s) needed. Exactly 11 digits required.
                </p>
              )}
              {phone && phone.startsWith('03') && phone.length === 11 && (
                <p className="text-[10px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
                  <Check size={12} /> Valid 11-digit Pakistani mobile number.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn || isRegistering}
            className="w-full mt-2 py-3 bg-[#171717] hover:bg-black text-white text-xs font-semibold uppercase tracking-[0.15em] rounded transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoggingIn || isRegistering ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Calibrating Patron Session...</span>
              </span>
            ) : mode === 'login' ? (
              'Sign In to Maison'
            ) : (
              'Create Patron Account'
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-[#DAD7D1] text-center text-[11px] text-[#77736E]">
          {mode === 'login' ? (
            <p>
              New to Atelier Haute Couture?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
                className="text-[#171717] font-semibold underline underline-offset-2 ml-1"
              >
                Register as a Patron
              </button>
            </p>
          ) : (
            <p>
              Already possess credentials?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
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
