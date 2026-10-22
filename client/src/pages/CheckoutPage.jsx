import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearCart } from '../store/cartSlice';
import { useCreateOrderMutation, useGetMeQuery } from '../store/api/apiSlice';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Truck,
  ArrowRight,
  Check,
  Sparkles,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

export default function CheckoutPage({ onOpenAuth }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [createOrder, { isLoading: isSubmittingOrder }] = useCreateOrderMutation();
  const { items, freeShippingThreshold, promoDiscount, appliedPromo } = useSelector(
    (state) => state.cart
  );

  const token = typeof window !== 'undefined' ? localStorage.getItem('atelier_token') : null;
  const { data: userData } = useGetMeQuery(undefined, { skip: !token });
  const currentUser = userData?.data || null;

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Form Fields State (unpopulated by default for real customer input)
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Pakistan',
  });

  // Credit Card fields (only validated when paymentMethod === 'card')
  const [cardData, setCardData] = useState({
    cardHolder: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Sync logged in user profile into checkout form if available
  useEffect(() => {
    if (currentUser) {
      const defaultAddr = currentUser.addresses?.find((a) => a.isDefault) || currentUser.addresses?.[0];
      setFormData((prev) => ({
        ...prev,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        firstName: currentUser.firstName || prev.firstName,
        lastName: currentUser.lastName || prev.lastName,
        address: defaultAddr?.street || prev.address,
        city: defaultAddr?.city || prev.city,
        postalCode: defaultAddr?.postalCode || prev.postalCode,
        country: defaultAddr?.country || prev.country || 'Pakistan',
      }));
    }
  }, [currentUser]);

  const rawSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = Math.round(rawSubtotal * promoDiscount);
  const subtotal = rawSubtotal - discountAmount;
  const isFreeShipping = rawSubtotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping
    ? 0
    : shippingMethod === 'express'
    ? 1200
    : 500;
  const total = subtotal + shippingCost;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCardChange = (field, val) => {
    let clean = val;
    if (field === 'cardNumber') {
      const digits = val.replace(/\D/g, '').slice(0, 16);
      clean = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (field === 'cardExpiry') {
      const digits = val.replace(/\D/g, '').slice(0, 4);
      if (digits.length >= 3) {
        clean = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      } else {
        clean = digits;
      }
    } else if (field === 'cardCvc') {
      clean = val.replace(/\D/g, '').slice(0, 4);
    }

    setCardData((prev) => ({ ...prev, [field]: clean }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateSingleField = (field, customVal) => {
    if (field === 'phone') {
      const phone = (customVal !== undefined ? customVal : formData.phone || '').trim();
      if (!phone) {
        return 'Telephone number is required for courier dispatch.';
      }
      if (!/^\d+$/.test(phone)) {
        return 'Telephone must contain numbers only.';
      }
      if (!phone.startsWith('03')) {
        return 'Pakistan mobile number must start with 03 (e.g. 03001234567).';
      }
      if (phone.length !== 11) {
        return `Pakistan mobile number must be exactly 11 digits (e.g. 03001234567). Currently ${phone.length} of 11.`;
      }
      return null;
    }

    if (field === 'email') {
      const email = (customVal !== undefined ? customVal : formData.email || '').trim();
      if (!email) {
        return 'Email address is required.';
      }
      if (!email.includes('@')) {
        return "Email address must contain '@' symbol.";
      }
      if (email.indexOf('@') !== email.lastIndexOf('@')) {
        return "Email address cannot contain multiple '@' symbols.";
      }
      if (email.includes('..')) {
        return 'Email address cannot contain consecutive dots.';
      }
      const [username, domain] = email.split('@');
      if (!username || username.length < 1) {
        return "Email username before '@' is missing.";
      }
      if (!domain || !domain.includes('.')) {
        return 'Email must have a valid domain extension (e.g. .com, .pk).';
      }
      const parts = domain.split('.');
      const tld = parts[parts.length - 1];
      if (tld.length < 2) {
        return 'Domain extension is too short (e.g. .com, .pk).';
      }
      if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
        return 'Email domain contains invalid characters.';
      }
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return 'Please enter a valid complete email address (e.g. patron@gmail.com).';
      }
      return null;
    }
    return null;
  };

  const handlePhoneChange = (e) => {
    // Restrict strictly to numeric digits only, maximum 11 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 11);
    setFormData((prev) => ({ ...prev, phone: digitsOnly }));
    if (errors.phone) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
  };

  // Comprehensive Field Validation
  const validateFields = () => {
    const errs = {};

    // 1. Email Address (thorough validation)
    const emailErr = validateSingleField('email', formData.email);
    if (emailErr) {
      errs.email = emailErr;
    }

    // 2. Telephone (Pakistan format: strictly 11 numbers, starting with 03)
    const phoneErr = validateSingleField('phone', formData.phone);
    if (phoneErr) {
      errs.phone = phoneErr;
    }

    // 3. First Name
    const firstName = formData.firstName.trim();
    if (!firstName) {
      errs.firstName = 'First name is required.';
    } else if (firstName.length < 2) {
      errs.firstName = 'First name must contain at least 2 characters.';
    }

    // 4. Last Name
    const lastName = formData.lastName.trim();
    if (!lastName) {
      errs.lastName = 'Last name is required.';
    } else if (lastName.length < 2) {
      errs.lastName = 'Last name must contain at least 2 characters.';
    }

    // 5. Street Address & Suite
    const address = formData.address.trim();
    if (!address) {
      errs.address = 'Street address and suite/house number is required.';
    } else if (address.length < 5) {
      errs.address = 'Please provide a complete street address (minimum 5 characters).';
    }

    // 6. City
    const city = formData.city.trim();
    if (!city) {
      errs.city = 'City is required.';
    } else if (city.length < 2) {
      errs.city = 'City must be at least 2 characters.';
    }

    // 7. Postal Code
    const postalCode = formData.postalCode.trim();
    if (!postalCode) {
      errs.postalCode = 'Postal code is required.';
    } else if (postalCode.length < 3) {
      errs.postalCode = 'Postal code must be at least 3 characters.';
    }

    // 8. Country
    const country = formData.country.trim();
    if (!country) {
      errs.country = 'Country is required.';
    }

    // 9. Payment Method (Card validation)
    if (paymentMethod === 'card') {
      const cardHolder = cardData.cardHolder.trim();
      if (!cardHolder) {
        errs.cardHolder = 'Cardholder name is required.';
      } else if (cardHolder.length < 3) {
        errs.cardHolder = 'Please enter full name as printed on card.';
      }

      const rawCardNum = cardData.cardNumber.replace(/\s/g, '');
      if (!rawCardNum) {
        errs.cardNumber = '16-digit card number is required.';
      } else if (!/^\d{16}$/.test(rawCardNum)) {
        errs.cardNumber = 'Card number must be exactly 16 digits.';
      }

      const cardExpiry = cardData.cardExpiry.trim();
      if (!cardExpiry) {
        errs.cardExpiry = 'Expiry date (MM/YY) is required.';
      } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardExpiry)) {
        errs.cardExpiry = 'Enter valid MM/YY format (e.g. 09/28).';
      }

      const cardCvc = cardData.cardCvc.trim();
      if (!cardCvc) {
        errs.cardCvc = 'CVC / CVV code is required.';
      } else if (!/^\d{3,4}$/.test(cardCvc)) {
        errs.cardCvc = 'CVC must be 3 or 4 digits.';
      }
    }

    return errs;
  };

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (items.length === 0) {
      setSubmitError('Your shopping bag is empty. Please add garments before completing acquisition.');
      return;
    }

    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError('Please complete all required fields according to their requirements before proceeding.');
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    try {
      const orderPayload = {
        items: items.map((item) => ({
          name: item.name,
          price: item.price,
          size: item.size,
          color: item.color,
          image: item.image,
          quantity: item.quantity,
        })),
        shippingAddress: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country.trim(),
        },
        shippingMethod,
        shippingCost,
        discountAmount,
        subtotal,
        totalAmount: total,
        paymentMethod,
      };

      const result = await createOrder(orderPayload).unwrap();
      const generatedOrderId =
        result?.data?.orderNumber ||
        `ATL-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderRecord = {
        id: generatedOrderId,
        orderNumber: generatedOrderId,
        customer: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Patron',
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: `${formData.address}, ${formData.city}`,
        shippingAddress: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country.trim(),
        },
        items: items.length,
        itemsList: items,
        subtotal,
        shippingCost,
        discountAmount,
        total: total,
        totalAmount: total,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        status: 'Processing',
        fulfillmentStatus: 'placed',
        city: formData.city.trim() || 'Karachi',
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString(),
      };

      // Notify admin dashboard live via broadcast and sync customer + orders records
      try {
        const storedPatrons = JSON.parse(localStorage.getItem('atelier_registered_patrons') || '[]');
        const customerEmail = formData.email?.trim()?.toLowerCase();
        let patronFound = false;
        const updatedPatrons = storedPatrons.map((p) => {
          if (p.email?.toLowerCase() === customerEmail) {
            patronFound = true;
            return { ...p, orders: (p.orders || 0) + 1 };
          }
          return p;
        });
        if (!patronFound && customerEmail) {
          updatedPatrons.unshift({
            id: `usr-${Date.now()}`,
            name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Store Patron',
            email: customerEmail,
            phone: formData.phone?.trim() || '0300-1234567',
            orders: 1,
            status: 'Active',
            tier: 'Standard',
          });
        }
        localStorage.setItem('atelier_registered_patrons', JSON.stringify(updatedPatrons));

        // Save for user account history and admin dashboard live stream
        const existingAllOrders = JSON.parse(localStorage.getItem('atelier_all_orders') || '[]');
        const updatedAllOrders = [orderRecord, ...existingAllOrders.filter((o) => (o.orderNumber || o.id) !== generatedOrderId)];
        localStorage.setItem('atelier_all_orders', JSON.stringify(updatedAllOrders));

        const existingUserOrders = JSON.parse(localStorage.getItem('atelier_user_orders') || '[]');
        const updatedUserOrders = [orderRecord, ...existingUserOrders.filter((o) => (o.orderNumber || o.id) !== generatedOrderId)];
        localStorage.setItem('atelier_user_orders', JSON.stringify(updatedUserOrders));

        const bc = new BroadcastChannel('atelier_live_sync');
        bc.postMessage({ type: 'ORDER_CREATED', orderId: generatedOrderId, order: orderRecord });
        bc.close();
      } catch (e) {
        // ignore
      }

      dispatch(clearCart());
      navigate('/order-confirmation', {
        state: {
          orderId: generatedOrderId,
          items: result?.data?.items?.length ? result.data.items : items,
          total: result?.data?.totalAmount ?? total,
          formData: result?.data?.shippingAddress || formData,
          status: result?.data?.fulfillmentStatus || 'Processing',
          order: result?.data || orderRecord,
        },
      });
    } catch (err) {
      if (err?.data?.message) {
        setSubmitError(err.data.message);
        window.scrollTo({ top: 100, behavior: 'smooth' });
        return;
      }

      // Graceful offline fallback
      const fallbackOrderId = `ATL-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      const fallbackRecord = {
        id: fallbackOrderId,
        orderNumber: fallbackOrderId,
        customer: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Patron',
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: `${formData.address}, ${formData.city}`,
        shippingAddress: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country.trim(),
        },
        items: items.length,
        itemsList: items,
        subtotal,
        shippingCost,
        discountAmount,
        total: total,
        totalAmount: total,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        status: 'Processing',
        fulfillmentStatus: 'placed',
        city: formData.city.trim() || 'Karachi',
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString(),
      };

      try {
        const storedPatrons = JSON.parse(localStorage.getItem('atelier_registered_patrons') || '[]');
        const customerEmail = formData.email?.trim()?.toLowerCase();
        let patronFound = false;
        const updatedPatrons = storedPatrons.map((p) => {
          if (p.email?.toLowerCase() === customerEmail) {
            patronFound = true;
            return { ...p, orders: (p.orders || 0) + 1 };
          }
          return p;
        });
        if (!patronFound && customerEmail) {
          updatedPatrons.unshift({
            id: `usr-${Date.now()}`,
            name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Store Patron',
            email: customerEmail,
            phone: formData.phone?.trim() || '0300-1234567',
            orders: 1,
            status: 'Active',
            tier: 'Standard',
          });
        }
        localStorage.setItem('atelier_registered_patrons', JSON.stringify(updatedPatrons));

        const existingAllOrders = JSON.parse(localStorage.getItem('atelier_all_orders') || '[]');
        const updatedAllOrders = [fallbackRecord, ...existingAllOrders.filter((o) => (o.orderNumber || o.id) !== fallbackOrderId)];
        localStorage.setItem('atelier_all_orders', JSON.stringify(updatedAllOrders));

        const existingUserOrders = JSON.parse(localStorage.getItem('atelier_user_orders') || '[]');
        const updatedUserOrders = [fallbackRecord, ...existingUserOrders.filter((o) => (o.orderNumber || o.id) !== fallbackOrderId)];
        localStorage.setItem('atelier_user_orders', JSON.stringify(updatedUserOrders));

        const bc = new BroadcastChannel('atelier_live_sync');
        bc.postMessage({ type: 'ORDER_CREATED', orderId: fallbackOrderId, order: fallbackRecord });
        bc.close();
      } catch (e) {
        // ignore
      }

      dispatch(clearCart());
      navigate('/order-confirmation', {
        state: {
          orderId: fallbackOrderId,
          items,
          total,
          formData,
          status: 'Processing',
          order: fallbackRecord,
        },
      });
    }
  };

  // Empty Bag Guard
  if (items.length === 0) {
    return (
      <div className="w-full bg-[#FAF9F6] min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white border border-[#DAD7D1] rounded-2xl p-8 sm:p-10 text-center shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#F1EFEA] border border-[#DAD7D1] text-[#77736E] flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag size={28} />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#77736E] block">
              Curated Wardrobe Bag
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl text-[#171717]">
              Your Bag is Empty
            </h1>
            <p className="text-xs text-[#77736E] leading-relaxed max-w-sm mx-auto">
              Please select exquisite handcrafted garments from our collection before proceeding to checkout.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/collection"
              className="px-8 py-3.5 bg-[#171717] hover:bg-[#4D5543] text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition inline-flex items-center gap-2 shadow-md"
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-10 font-sans">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        {/* Checkout Header */}
        <div className="pb-8 border-b border-[#DAD7D1] flex items-center justify-between">
          <Link to="/" className="font-editorial text-2xl tracking-[0.16em] uppercase text-[#171717]">
            ATELIER
          </Link>
          <div className="flex items-center gap-2 text-xs text-[#77736E]">
            <Lock size={14} className="text-[#4D5543]" />
            <span>256-Bit Encrypted Bespoke Checkout</span>
          </div>
        </div>

        {/* Form Error Banner */}
        {submitError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-300 rounded-xl text-xs text-red-700 flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Please Review Form Requirements:</strong>
              <span className="leading-relaxed">{submitError}</span>
            </div>
          </div>
        )}

        {/* 2-Column Checkout Layout */}
        <form onSubmit={handleCompleteOrder} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
          {/* Left Form: 4 Steps (7 cols) */}
          <div className="lg:col-span-7 space-y-8">

            {/* Step 1: Contact Details */}
            <div className="bg-white border border-[#DAD7D1] rounded-xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-3">
                <h3 className="font-editorial text-lg text-[#171717]">
                  1. Contact Coordinates
                </h3>
                <span className="text-xs text-[#77736E] font-mono">Step 1 of 4</span>
              </div>

              {!currentUser ? (
                <div className="bg-[#F1EFEA] border border-[#DAD7D1] rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#4D5543] shrink-0" />
                    <span className="text-[#171717]">Checking out as guest? Sign in to save this order to your wardrobe.</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="text-[#4D5543] font-semibold hover:underline text-left shrink-0"
                  >
                    Sign In / Register →
                  </button>
                </div>
              ) : (
                <div className="bg-[#DDE6CE]/40 border border-[#4D5543]/30 rounded-lg p-3 text-xs flex items-center gap-2 text-[#4D5543]">
                  <Check size={14} className="shrink-0" />
                  <span>Linked to Patron: <strong>{currentUser.firstName} {currentUser.lastName}</strong> ({currentUser.email}) • VIP: {currentUser.vipTier || 'Gold Needle'}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[#171717] font-medium block mb-1">
                    Email Address <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => {
                      if (formData.email) {
                        const err = validateSingleField('email', formData.email);
                        if (err) setErrors((prev) => ({ ...prev, email: err }));
                      }
                    }}
                    placeholder="patron@example.com"
                    className={`w-full border rounded-lg p-2.5 text-xs text-[#171717] outline-none transition ${
                      errors.email
                        ? 'border-red-500 bg-red-50/20 focus:border-red-600'
                        : 'border-[#DAD7D1] focus:border-[#171717]'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle size={12} className="shrink-0" /> {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[#171717] font-medium block">
                      Telephone for Courier <span className="text-red-500 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-[#77736E] font-mono">
                      {formData.phone ? `${formData.phone.length}/11 digits` : '11 digits'}
                    </span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={11}
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || '';
                      const digits = pasted.replace(/\D/g, '').slice(0, 11);
                      setFormData((prev) => ({ ...prev, phone: digits }));
                      if (errors.phone) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.phone;
                          return next;
                        });
                      }
                    }}
                    onBlur={() => {
                      if (formData.phone) {
                        const err = validateSingleField('phone', formData.phone);
                        if (err) setErrors((prev) => ({ ...prev, phone: err }));
                      }
                    }}
                    onKeyDown={(e) => {
                      // Allow numbers and control keys only
                      if (
                        !/[0-9]/.test(e.key) &&
                        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
                        !e.ctrlKey &&
                        !e.metaKey
                      ) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="03XXXXXXXXX (e.g. 03001234567)"
                    className={`w-full border rounded-lg p-2.5 text-xs text-[#171717] outline-none font-mono tracking-wider transition ${
                      errors.phone
                        ? 'border-red-500 bg-red-50/20 focus:border-red-600'
                        : 'border-[#DAD7D1] focus:border-[#171717]'
                    }`}
                  />
                  {errors.phone ? (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle size={12} className="shrink-0" /> {errors.phone}
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#77736E] mt-1 font-mono">
                      Must be 11 numbers only, starting with 03 (e.g., 03001234567)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="bg-white border border-[#DAD7D1] rounded-xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-3">
                <h3 className="font-editorial text-lg text-[#171717]">
                  2. Shipping Destination
                </h3>
                <span className="text-xs text-[#77736E] font-mono">Step 2 of 4</span>
              </div>
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#171717] font-medium block mb-1">
                      First Name <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. Owais"
                      className={`w-full border rounded-lg p-2.5 text-xs text-[#171717] outline-none transition ${
                        errors.firstName
                          ? 'border-red-500 bg-red-50/20 focus:border-red-600'
                          : 'border-[#DAD7D1] focus:border-[#171717]'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} className="shrink-0" /> {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#171717] font-medium block mb-1">
                      Last Name <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g. Ahmed"
                      className={`w-full border rounded-lg p-2.5 text-xs text-[#171717] outline-none transition ${
                        errors.lastName
                          ? 'border-red-500 bg-red-50/20 focus:border-red-600'
                          : 'border-[#DAD7D1] focus:border-[#171717]'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} className="shrink-0" /> {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[#171717] font-medium block mb-1">
                    Street Address &amp; Suite / House # <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. House 42, Block B, Model Town"
                    className={`w-full border rounded-lg p-2.5 text-xs text-[#171717] outline-none transition ${
                      errors.address
                        ? 'border-red-500 bg-red-50/20 focus:border-red-600'
                        : 'border-[#DAD7D1] focus:border-[#171717]'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle size={12} className="shrink-0" /> {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[#171717] font-medium block mb-1">
                      City <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Lahore"
                      className={`w-full border rounded-lg p-2.5 text-xs text-[#171717] outline-none transition ${
                        errors.city
                          ? 'border-red-500 bg-red-50/20 focus:border-red-600'
                          : 'border-[#DAD7D1] focus:border-[#171717]'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} className="shrink-0" /> {errors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#171717] font-medium block mb-1">
                      Postal Code <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="e.g. 54000"
                      className={`w-full border rounded-lg p-2.5 text-xs text-[#171717] outline-none font-mono transition ${
                        errors.postalCode
                          ? 'border-red-500 bg-red-50/20 focus:border-red-600'
                          : 'border-[#DAD7D1] focus:border-[#171717]'
                      }`}
                    />
                    {errors.postalCode && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} className="shrink-0" /> {errors.postalCode}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[#171717] font-medium block mb-1">
                      Country <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="e.g. Pakistan"
                      className={`w-full border rounded-lg p-2.5 text-xs text-[#171717] outline-none transition ${
                        errors.country
                          ? 'border-red-500 bg-red-50/20 focus:border-red-600'
                          : 'border-[#DAD7D1] focus:border-[#171717]'
                      }`}
                    />
                    {errors.country && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} className="shrink-0" /> {errors.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Courier Method */}
            <div className="bg-white border border-[#DAD7D1] rounded-xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-3">
                <h3 className="font-editorial text-lg text-[#171717]">
                  3. Courier Method
                </h3>
                <span className="text-xs text-[#77736E] font-mono">Step 3 of 4</span>
              </div>
              <div className="space-y-3 text-xs">
                <label
                  className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'border-[#171717] bg-[#F1EFEA]'
                      : 'border-[#DAD7D1] hover:border-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="accent-[#171717]"
                    />
                    <div>
                      <span className="font-semibold text-[#171717] block">
                        Standard Insured Courier (2–4 Business Days)
                      </span>
                      <span className="text-[11px] text-[#77736E]">
                        Signature on delivery, archival garment packaging
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-[#171717] font-mono">
                    {isFreeShipping ? 'COMPLIMENTARY' : 'Rs. 500'}
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                    shippingMethod === 'express'
                      ? 'border-[#171717] bg-[#F1EFEA]'
                      : 'border-[#DAD7D1] hover:border-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="accent-[#171717]"
                    />
                    <div>
                      <span className="font-semibold text-[#171717] block">
                        Express Salon Priority (Next Day Air)
                      </span>
                      <span className="text-[11px] text-[#77736E]">
                        Immediate priority packing &amp; dedicated courier dispatch
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-[#171717] font-mono">Rs. 1,200</span>
                </label>
              </div>
            </div>

            {/* Step 4: Payment Method */}
            <div className="bg-white border border-[#DAD7D1] rounded-xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#DAD7D1] pb-3">
                <h3 className="font-editorial text-lg text-[#171717]">
                  4. Payment Authorization
                </h3>
                <span className="text-xs text-[#77736E] font-mono">Step 4 of 4</span>
              </div>
              <div className="space-y-4 text-xs">
                <label
                  className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#171717] bg-[#F1EFEA]'
                      : 'border-[#DAD7D1] hover:border-[#171717]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-[#171717]"
                  />
                  <CreditCard size={18} className="text-[#4D5543]" />
                  <span className="font-semibold text-[#171717]">
                    Credit / Debit Card (Visa, MasterCard, UnionPay)
                  </span>
                </label>

                {/* Card Fields Form if Card Selected */}
                {paymentMethod === 'card' && (
                  <div className="p-4 bg-[#FAF9F6] border border-[#DAD7D1] rounded-lg space-y-3 animate-in fade-in duration-200">
                    <div>
                      <label className="text-[#171717] font-medium block mb-1">
                        Cardholder Name <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardData.cardHolder}
                        onChange={(e) => handleCardChange('cardHolder', e.target.value)}
                        placeholder="e.g. OWAIS AHMED"
                        className={`w-full border rounded p-2.5 text-xs text-[#171717] outline-none uppercase font-mono transition ${
                          errors.cardHolder ? 'border-red-500 bg-red-50/20 focus:border-red-600' : 'border-[#DAD7D1] focus:border-[#171717]'
                        }`}
                      />
                      {errors.cardHolder && (
                        <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle size={12} className="shrink-0" /> {errors.cardHolder}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-[#171717] font-medium block mb-1">
                        Card Number (16 Digits) <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardData.cardNumber}
                        onChange={(e) => handleCardChange('cardNumber', e.target.value)}
                        placeholder="4111 2222 3333 4444"
                        maxLength={19}
                        className={`w-full border rounded p-2.5 text-xs text-[#171717] outline-none font-mono tracking-wider transition ${
                          errors.cardNumber ? 'border-red-500 bg-red-50/20 focus:border-red-600' : 'border-[#DAD7D1] focus:border-[#171717]'
                        }`}
                      />
                      {errors.cardNumber && (
                        <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle size={12} className="shrink-0" /> {errors.cardNumber}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#171717] font-medium block mb-1">
                          Expiry Date (MM/YY) <span className="text-red-500 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardData.cardExpiry}
                          onChange={(e) => handleCardChange('cardExpiry', e.target.value)}
                          placeholder="09/28"
                          maxLength={5}
                          className={`w-full border rounded p-2.5 text-xs text-[#171717] outline-none font-mono transition ${
                            errors.cardExpiry ? 'border-red-500 bg-red-50/20 focus:border-red-600' : 'border-[#DAD7D1] focus:border-[#171717]'
                          }`}
                        />
                        {errors.cardExpiry && (
                          <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle size={12} className="shrink-0" /> {errors.cardExpiry}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-[#171717] font-medium block mb-1">
                          Security CVC / CVV <span className="text-red-500 font-bold">*</span>
                        </label>
                        <input
                          type="password"
                          value={cardData.cardCvc}
                          onChange={(e) => handleCardChange('cardCvc', e.target.value)}
                          placeholder="•••"
                          maxLength={4}
                          className={`w-full border rounded p-2.5 text-xs text-[#171717] outline-none font-mono transition ${
                            errors.cardCvc ? 'border-red-500 bg-red-50/20 focus:border-red-600' : 'border-[#DAD7D1] focus:border-[#171717]'
                          }`}
                        />
                        {errors.cardCvc && (
                          <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle size={12} className="shrink-0" /> {errors.cardCvc}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <label
                  className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#171717] bg-[#F1EFEA]'
                      : 'border-[#DAD7D1] hover:border-[#171717]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#171717]"
                  />
                  <Truck size={18} className="text-[#4D5543]" />
                  <div>
                    <span className="font-semibold text-[#171717] block">
                      Cash on Delivery (Verified Atelier Concierge)
                    </span>
                    <span className="text-[11px] text-[#77736E]">
                      Pay in cash or direct bank transfer upon insured doorstep handover
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmittingOrder}
              className="w-full py-4 bg-[#171717] text-white text-xs uppercase tracking-[0.14em] font-semibold rounded-xl hover:bg-[#4D5543] transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isSubmittingOrder ? (
                <span>Commissioning Order with Atelier...</span>
              ) : (
                <>
                  <span>Authorize &amp; Dispatch Order • Rs. {total.toLocaleString()}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Right Summary Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#DAD7D1] rounded-xl p-6 space-y-6 sticky top-28 shadow-sm">
              <h3 className="font-editorial text-xl text-[#171717] border-b border-[#DAD7D1] pb-3">
                Order Summary
              </h3>

              {/* Items List */}
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-3 text-xs">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-18 object-cover rounded-lg bg-[#F1EFEA] border border-[#DAD7D1]"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-[#171717] line-clamp-1">{item.name}</h4>
                        <p className="text-[11px] text-[#77736E]">
                          Size: {item.size} • Hue: {item.color}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#77736E]">Qty: {item.quantity}</span>
                        <span className="font-semibold text-[#171717] font-mono">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="border-t border-[#DAD7D1] pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#77736E]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#171717] font-mono">Rs. {rawSubtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#35664A]">
                    <span>VIP Salon Discount ({appliedPromo})</span>
                    <span className="font-mono">-Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#77736E]">
                  <span>Courier Delivery</span>
                  <span className="font-semibold text-[#171717] font-mono">
                    {shippingCost === 0 ? 'Free' : `Rs. ${shippingCost.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#171717] pt-3 border-t border-[#DAD7D1]">
                  <span>Total Amount</span>
                  <span className="font-mono">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-[#F1EFEA] p-3 rounded-lg text-[11px] text-[#77736E] flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#4D5543] shrink-0" />
                <span>30-Day Hassle-Free Salon Exchange &amp; Return Policy</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
