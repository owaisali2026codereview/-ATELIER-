import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  Printer,
  ShoppingBag,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useGetOrderByNumberQuery } from '../store/api/apiSlice';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const stateData = location.state || null;

  // Direct access guard: If no order session exists, display graceful 'No Active Order Found' screen
  if (!stateData || !stateData.orderId) {
    return (
      <div className="w-full bg-[#FAF9F6] min-h-[80vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white border border-[#DAD7D1] rounded-2xl p-8 sm:p-10 text-center shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-[#F1EFEA] border border-[#DAD7D1] text-[#77736E] flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag size={28} />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#77736E] block">
              Session Verification
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl text-[#171717]">
              No Active Order Found
            </h1>
            <p className="text-xs text-[#77736E] leading-relaxed max-w-sm mx-auto">
              You have navigated to the acquisition confirmation portal without completing a checkout session.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-[#171717] hover:bg-[#4D5543] text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>Return to Home</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/collection"
              className="px-5 py-3 bg-white border border-[#DAD7D1] hover:bg-[#F1EFEA] text-[#171717] text-xs uppercase tracking-wider font-semibold rounded-xl transition flex items-center justify-center"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pure dynamic data strictly from the actual placed order
  const rawOrderId = stateData.orderId;
  const rawFormData = stateData.formData || {};
  const rawItems = stateData.items || [];
  const rawTotal = stateData.total || (rawItems.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0));
  const rawStatus = stateData.status || 'Processing';

  // Live query sync if backend order exists
  const { data: liveOrderQuery } = useGetOrderByNumberQuery(rawOrderId, {
    skip: !rawOrderId,
    pollingInterval: 8000,
  });

  const liveOrder = liveOrderQuery?.data || stateData.order || null;

  // Resolved live attributes purely from real order data
  const orderNumber = liveOrder?.orderNumber || rawOrderId;
  const fulfillmentStatus = liveOrder?.fulfillmentStatus || rawStatus;
  const totalAmount = liveOrder?.totalAmount ?? rawTotal;
  const shippingAddress = liveOrder?.shippingAddress || rawFormData;
  const orderItems = (liveOrder?.items && liveOrder.items.length > 0) ? liveOrder.items : rawItems;

  const customerName = `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || 'Valued Patron';
  const customerEmail = shippingAddress.email || '';
  const customerPhone = shippingAddress.phone || '';
  const customerLocation = [shippingAddress.address, shippingAddress.city, shippingAddress.country].filter(Boolean).join(', ');

  const totalPieces = orderItems.reduce((sum, it) => sum + (it.quantity || 1), 0);

  const steps = [
    { title: 'Confirmed', desc: 'Order logged & reserved in vault', done: true },
    { title: 'Atelier Tailoring', desc: 'Single-needle finishing & hand-pressing', active: true },
    { title: 'Courier Dispatch', desc: 'Insured transit protocol', done: false },
    { title: 'Delivered', desc: 'White-glove doorstep delivery', done: false },
  ];

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-6 sm:py-12 md:py-16 font-sans">
      <div className="max-w-[980px] mx-auto px-3 sm:px-6">
        <div className="bg-white border border-[#DAD7D1] rounded-2xl p-4 sm:p-8 md:p-12 shadow-xl space-y-8 sm:space-y-10">

          {/* 1. Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#DDE6CE] text-[#4D5543] flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-75 duration-300">
              <CheckCircle2 size={36} />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#4D5543] block">
              Acquisition Confirmed
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl text-[#171717] tracking-tight">
              Thank You For Your Patronage
            </h1>
            <p className="text-xs text-[#77736E] max-w-lg mx-auto leading-relaxed">
              Your luxury commission has been logged into our atelier schedule under reference{' '}
              <strong className="text-[#171717] font-mono font-bold">{orderNumber}</strong>.
              Formal receipt and dispatch updates have been transmitted to{' '}
              <span className="text-[#171717] font-medium">{customerEmail}</span>.
            </p>
          </div>

          {/* 2. Visual Fulfillment Journey Protocol */}
          <div className="border-t border-b border-[#DAD7D1] py-8">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#171717] mb-6 text-center">
              Fulfillment Journey Protocol
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {steps.map((st, i) => (
                <div key={st.title} className="flex flex-col items-center text-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all ${
                      st.done
                        ? 'bg-[#171717] text-white'
                        : st.active
                        ? 'bg-[#4D5543] text-white ring-4 ring-[#DDE6CE]'
                        : 'bg-[#F1EFEA] text-[#77736E] border border-[#DAD7D1]'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs font-semibold text-[#171717]">{st.title}</span>
                  <span className="text-[10px] text-[#77736E] mt-0.5 max-w-[130px] leading-tight">
                    {st.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>


          {/* 4. COMMISSIONED PRODUCT DETAILS SECTION */}
          {orderItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#171717] flex items-center gap-2">
                <ShoppingBag size={15} className="text-[#4D5543]" />
                Commissioned Garments &amp; Product Details
              </h3>

              <div className="border border-[#DAD7D1] rounded-xl overflow-hidden divide-y divide-[#DAD7D1] bg-white">
                {orderItems.map((item, idx) => {
                  const qty = item.quantity || 1;
                  const itemPrice = item.price || 0;
                  const itemTotal = itemPrice * qty;

                  return (
                    <div
                      key={item.id || item._id || idx}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#FAF9F6]/50 transition"
                    >
                      <div className="flex items-center gap-4">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-20 object-cover rounded-lg border border-[#DAD7D1] bg-[#FAF9F6] shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-20 rounded-lg bg-[#FAF9F6] border border-[#DAD7D1] flex items-center justify-center shrink-0 text-[#77736E]">
                            <ShoppingBag size={20} />
                          </div>
                        )}
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm text-[#171717]">{item.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#77736E]">
                            {item.size && (
                              <span className="px-2 py-0.5 bg-[#FAF9F6] border border-[#DAD7D1] rounded text-[11px] font-mono">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="px-2 py-0.5 bg-[#FAF9F6] border border-[#DAD7D1] rounded text-[11px] font-mono">
                                Hue: {item.color}
                              </span>
                            )}
                            <span className="text-[#171717] font-mono font-medium">
                              Qty: {qty}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:self-center w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                        <span className="text-[10px] text-[#77736E] uppercase font-semibold">Subtotal</span>
                        <div className="text-sm font-mono font-bold text-[#171717]">
                          Rs. {Number(itemTotal).toLocaleString()}
                        </div>
                        {qty > 1 && (
                          <span className="text-[10px] text-[#9CA3AF] font-mono">
                            (Rs. {Number(itemPrice).toLocaleString()} each)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Customer Dossier & Delivery Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAF9F6] p-6 rounded-xl border border-[#DAD7D1] text-xs">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#77736E] font-bold block flex items-center gap-1.5">
                <User size={12} />
                Patron &amp; Delivery Destination
              </span>
              <p className="font-bold text-sm text-[#171717]">{customerName}</p>
              <p className="text-[#4B5563] flex items-center gap-1.5 mt-1">
                <MapPin size={13} className="text-[#77736E] shrink-0" />
                <span>{customerLocation}</span>
              </p>
              <p className="text-[#4B5563] flex items-center gap-1.5">
                <Mail size={13} className="text-[#77736E] shrink-0" />
                <span className="font-mono">{customerEmail}</span>
              </p>
              {customerPhone && (
                <p className="text-[#4B5563] flex items-center gap-1.5">
                  <Phone size={13} className="text-[#77736E] shrink-0" />
                  <span className="font-mono">{customerPhone}</span>
                </p>
              )}
            </div>

            <div className="space-y-2 md:border-l md:border-[#DAD7D1] md:pl-6">
              <span className="text-[10px] uppercase tracking-wider text-[#77736E] font-bold block flex items-center gap-1.5">
                <Truck size={12} />
                Estimated Salon Arrival &amp; Logistics
              </span>
              <p className="font-bold text-sm text-[#171717]">3 – 5 Business Days</p>
              <p className="text-[#4B5563]">Dispatched via Insured White-Glove Courier Service</p>
              <div className="pt-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#DDE6CE] text-[#35664A] rounded-lg font-semibold text-[11px]">
                  <ShieldCheck size={14} />
                  Atelier Artisan Authentication Protected
                </span>
              </div>
            </div>
          </div>

          {/* 6. Navigation Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-[#DAD7D1]">
            <Link
              to="/collection"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#171717] hover:bg-[#4D5543] text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition text-center shadow-md"
            >
              Continue Exploring Catalog
            </Link>
            <Link
              to="/account?tab=orders"
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#DAD7D1] text-[#171717] text-xs uppercase tracking-wider font-semibold rounded-xl hover:bg-[#F1EFEA] transition text-center"
            >
              Track in Account Portal
            </Link>
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="w-full sm:w-auto px-5 py-3.5 bg-[#FAF9F6] border border-[#DAD7D1] text-[#4B5563] hover:text-[#171717] text-xs uppercase tracking-wider font-semibold rounded-xl hover:bg-[#F1EFEA] transition flex items-center justify-center gap-1.5"
            >
              <Printer size={14} />
              <span>Print Invoice</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

