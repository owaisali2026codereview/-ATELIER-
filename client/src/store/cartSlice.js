import { createSlice } from '@reduxjs/toolkit';

const loadCartFromStorage = () => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('atelier_cart_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (e) {}
  return [];
};

const saveCartToStorage = (items) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('atelier_cart_items', JSON.stringify(items));
      window.dispatchEvent(new Event('atelier_cart_updated'));
    }
  } catch (e) {}
};

const initialState = {
  isCartOpen: false,
  items: loadCartFromStorage(),
  freeShippingThreshold: 10000,
  promoDiscount: 0,
  promoDiscountAmount: 0,
  promoDiscountType: null,
  promoDiscountValue: 0,
  appliedPromo: null,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    addToCart: (state, action) => {
      const { id, size, color, name, price, image, badge } = action.payload;
      const existingItem = state.items.find(
        (item) => item.id === id && item.size === size && item.color === color
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          id,
          name,
          size: size || 'M',
          color: color || 'Standard',
          price: Number(price) || 0,
          quantity: 1,
          image: image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
          badge: badge || 'Curated',
        });
      }
      saveCartToStorage(state.items);
      state.isCartOpen = true;
    },
    removeFromCart: (state, action) => {
      const { id, size, color } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.id === id && item.size === size && item.color === color)
      );
      saveCartToStorage(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, size, color, quantity } = action.payload;
      const item = state.items.find(
        (i) => i.id === id && i.size === size && i.color === color
      );
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(
            (i) => !(i.id === id && i.size === size && i.color === color)
          );
        } else {
          item.quantity = quantity;
        }
      }
      saveCartToStorage(state.items);
    },
    applyPromoCode: (state, action) => {
      if (typeof action.payload === 'object' && action.payload !== null) {
        state.appliedPromo = action.payload.code;
        state.promoDiscount = action.payload.discountType === 'percentage' ? (action.payload.discountValue / 100) : 0;
        state.promoDiscountAmount = action.payload.discountAmount || 0;
        state.promoDiscountType = action.payload.discountType || 'percentage';
        return;
      }
      const code = (action.payload || '').trim().toUpperCase();
      if (code === 'ATELIER10' || code === 'SAVE10') {
        state.appliedPromo = code;
        state.promoDiscount = 0.1; // 10% off
        state.promoDiscountAmount = 0;
      } else if (code === 'MAISONVIP' || code === 'ATELIER15') {
        state.appliedPromo = code;
        state.promoDiscount = 0.15; // 15% off
        state.promoDiscountAmount = 0;
      } else if (code === 'WELCOME500') {
        state.appliedPromo = code;
        state.promoDiscount = 0;
        state.promoDiscountAmount = 500;
      } else {
        state.appliedPromo = null;
        state.promoDiscount = 0;
        state.promoDiscountAmount = 0;
      }
    },
    setAppliedVoucher: (state, action) => {
      const { code, discountType, discountValue, discountAmount } = action.payload;
      state.appliedPromo = code;
      state.promoDiscountType = discountType;
      state.promoDiscountValue = discountValue;
      state.promoDiscountAmount = discountAmount || 0;
      if (discountType === 'percentage') {
        state.promoDiscount = (discountValue || 0) / 100;
      } else {
        state.promoDiscount = 0;
      }
    },
    removePromoCode: (state) => {
      state.appliedPromo = null;
      state.promoDiscount = 0;
      state.promoDiscountType = null;
      state.promoDiscountValue = 0;
      state.promoDiscountAmount = 0;
    },
    clearCart: (state) => {
      state.items = [];
      state.appliedPromo = null;
      state.promoDiscount = 0;
      state.promoDiscountAmount = 0;
      saveCartToStorage([]);
    }
  }
});

export const {
  openCart,
  closeCart,
  toggleCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  applyPromoCode,
  setAppliedVoucher,
  removePromoCode,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
