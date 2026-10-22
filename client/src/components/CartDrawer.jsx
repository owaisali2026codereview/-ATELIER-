import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  closeCart,
  updateQuantity,
  removeFromCart,
  applyPromoCode,
  setAppliedVoucher,
  removePromoCode,
} from '../store/cartSlice';
import { useValidateCouponMutation } from '../store/api/apiSlice';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, Loader2, Check } from 'lucide-react';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isCartOpen, items, freeShippingThreshold, promoDiscount, promoDiscountAmount, appliedPromo } =
    useSelector((state) => state.cart);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [validateCouponMutation, { isLoading: isValidatingCoupon }] = useValidateCouponMutation();

  if (!isCartOpen) return null;

  const rawSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discountAmount = promoDiscountAmount > 0
    ? Math.min(rawSubtotal, promoDiscountAmount)
    : Math.round(rawSubtotal * (promoDiscount || 0));

  const subtotal = Math.max(0, rawSubtotal - discountAmount);
  const isFreeShipping = rawSubtotal >= freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - rawSubtotal);
  const progressPercent = Math.min(
    100,
    Math.round((rawSubtotal / freeShippingThreshold) * 100)
  );

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await validateCouponMutation({ code, subtotal: rawSubtotal }).unwrap();
      if (res.success && res.data) {
        dispatch(setAppliedVoucher(res.data));
        setCouponSuccess(res.data.message || `Promotional code ${code} activated!`);
        setCouponInput('');
      }
    } catch (err) {
      setCouponError(err?.data?.message || 'Invalid or expired promotional voucher.');
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removePromoCode());
    setCouponSuccess('');
    setCouponError('');
  };

  const handleCheckout = () => {
    dispatch(closeCart());
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => dispatch(closeCart())}
        className="absolute inset-0 bg-[#171717]/40 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F6] border-l border-[#DAD7D1] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-[#DAD7D1] bg-[#FAF9F6]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-editorial text-xl uppercase tracking-wider text-[#171717]">
                  Curated Bag
                </span>
                <span className="text-xs text-[#77736E] font-medium">
                  ({items.reduce((s, i) => s + i.quantity, 0)} Items)
                </span>
              </div>
              <button
                type="button"
                onClick={() => dispatch(closeCart())}
                className="p-2 text-[#77736E] hover:text-[#171717] transition-colors"
                aria-label="Close Bag"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Meter */}
            <div className="mt-4 bg-[#F1EFEA] p-3 rounded border border-[#DAD7D1]/60">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-[#171717]">
                  {isFreeShipping ? (
                    <span className="text-[#35664A] font-semibold">
                      ✦ Complimentary Worldwide Delivery Unlocked
                    </span>
                  ) : (
                    <>
                      Add <span className="font-semibold text-[#171717]">Rs. {remainingForFreeShipping.toLocaleString()}</span> for complimentary shipping
                    </>
                  )}
                </span>
                <span className="text-[11px] font-semibold text-[#4D5543]">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-[#DAD7D1] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#4D5543] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F1EFEA] border border-[#DAD7D1] flex items-center justify-center text-[#77736E]">
                  <X size={28} />
                </div>
                <h4 className="font-editorial text-lg text-[#171717]">
                  Your Bag is Currently Empty
                </h4>
                <p className="text-xs text-[#77736E] max-w-xs">
                  Explore our seasonal prêt-à-porter collection or enter the AI Custom Studio to draft your bespoke silhouette.
                </p>
                <button
                  type="button"
                  onClick={() => dispatch(closeCart())}
                  className="mt-4 px-6 py-2.5 bg-[#171717] text-white text-xs uppercase tracking-widest hover:bg-[#4D5543] transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex gap-4 pb-6 border-b border-[#DAD7D1]/50 group"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-26 object-cover rounded bg-[#F1EFEA] border border-[#DAD7D1]/60 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-[#171717] leading-tight line-clamp-2">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              removeFromCart({
                                id: item.id,
                                size: item.size,
                                color: item.color
                              })
                            )
                          }
                          className="text-[#77736E] hover:text-[#B33A32] transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#77736E]">
                        <span>Size: <strong className="text-[#171717]">{item.size}</strong></span>
                        <span>•</span>
                        <span>Hue: <strong className="text-[#171717]">{item.color}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-[#DAD7D1] bg-white rounded">
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                id: item.id,
                                size: item.size,
                                color: item.color,
                                quantity: item.quantity - 1
                              })
                            )
                          }
                          className="p-1 px-2 text-[#77736E] hover:text-[#171717] transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-semibold text-[#171717]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                id: item.id,
                                size: item.size,
                                color: item.color,
                                quantity: item.quantity + 1
                              })
                            )
                          }
                          className="p-1 px-2 text-[#77736E] hover:text-[#171717] transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-[#171717]">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#DAD7D1] bg-[#F1EFEA]/80 space-y-4">
              {/* Promo code form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-3 text-[#77736E]" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Promo Voucher (e.g. SAVE10)"
                    className="w-full bg-white border border-[#DAD7D1] pl-9 pr-3 py-2 text-xs uppercase placeholder:normal-case focus:outline-none focus:border-[#171717] rounded"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isValidatingCoupon || !couponInput.trim()}
                  className="px-4 py-2 bg-[#171717] text-white text-xs uppercase font-medium rounded hover:bg-[#4D5543] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isValidatingCoupon ? <Loader2 size={13} className="animate-spin" /> : 'Apply'}
                </button>
              </form>

              {appliedPromo && (
                <div className="flex items-center justify-between text-xs text-[#35664A] font-medium bg-white p-2.5 rounded border border-[#35664A]/30">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-[#35664A]" />
                    <span>
                      Voucher <strong>{appliedPromo}</strong> applied
                      {promoDiscount > 0 ? ` (${Math.round(promoDiscount * 100)}% off)` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">-Rs. {discountAmount.toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[#77736E] hover:text-[#DC2626] ml-1 p-0.5"
                      title="Remove voucher"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              )}

              {couponSuccess && !appliedPromo && (
                <p className="text-[11px] text-[#35664A] font-medium">
                  {couponSuccess}
                </p>
              )}

              {couponError && (
                <p className="text-[11px] text-[#B33A32]">
                  {couponError}
                </p>
              )}

              {/* Totals Breakdown */}
              <div className="space-y-1.5 text-xs text-[#77736E]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#171717]">
                    Rs. {rawSubtotal.toLocaleString()}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#35664A]">
                    <span>VIP Salon Discount</span>
                    <span>-Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Insured Courier Delivery</span>
                  <span>
                    {isFreeShipping ? (
                      <span className="text-[#35664A] font-semibold uppercase text-[11px]">
                        Free
                      </span>
                    ) : (
                      'Rs. 500'
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#171717] pt-2 border-t border-[#DAD7D1]">
                  <span>Estimated Total</span>
                  <span>
                    Rs. {(subtotal + (isFreeShipping ? 0 : 500)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3.5 bg-[#171717] text-white text-xs uppercase tracking-[0.12em] font-semibold rounded hover:bg-[#4D5543] transition-colors flex items-center justify-center gap-2 shadow-lg group"
              >
                <span>Proceed to Bespoke Checkout</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#77736E] pt-1">
                <ShieldCheck size={14} className="text-[#4D5543]" />
                <span>Complimentary returns within 30 days & insured transit</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
