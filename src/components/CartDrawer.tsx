import React, { useState } from 'react';
import { MenuItem, Coupon, CustomConfig, Order } from '../types';
import { ShoppingBag, X, Plus, Minus, Trash2, Ticket, Check, CreditCard, ShieldCheck, MessageCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkIsKitchenClosed, formatTime12h } from '../utils/time';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: { [id: string]: number };
  menu: MenuItem[];
  config: CustomConfig;
  coupons: Coupon[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (orderId: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  menu,
  config,
  coupons,
  onIncrement,
  onDecrement,
  onRemove,
  onClearCart,
  onOrderPlaced
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  const [loyaltyPoints, setLoyaltyPoints] = useState(() => {
    const saved = localStorage.getItem('bhagwati_loyalty_points');
    return saved ? parseInt(saved, 10) : 150;
  });
  const [useLoyalty, setUseLoyalty] = useState(false);

  // Dynamic Payment Method State Initialization
  const activeGateways = config.paymentSettings?.gateways?.filter(g => g.isEnabled) || [
    { id: 'razorpay', name: 'Razorpay', isEnabled: true },
    { id: 'phonepe', name: 'PhonePe', isEnabled: true },
    { id: 'paytm', name: 'Paytm', isEnabled: true },
    { id: 'gpay', name: 'Google Pay (UPI)', isEnabled: true },
    { id: 'cod', name: 'Cash on Delivery', isEnabled: true }
  ];
  const initialPaymentMethod = activeGateways[0]?.id || 'gpay';
  const [paymentMethod, setPaymentMethod] = useState<string>(initialPaymentMethod);

  const [deliverySlot, setDeliverySlot] = useState('Lunch (12:00 PM - 2:30 PM)');
  const [notes, setNotes] = useState('');
  const [isWhatsAppShareEnabled, setIsWhatsAppShareEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isCurfewActive = (config?.isCloseCurtainEnabled ?? true) && checkIsKitchenClosed(config?.openingTime, config?.closingTime);

  // Re-aggregate selections
  const selectedItems = Object.keys(cartItems).map((id) => {
    const item = menu.find((m) => m.id === id);
    return item ? { item, quantity: cartItems[id] } : null;
  }).filter(Boolean) as { item: MenuItem; quantity: number }[];

  const subtotal = selectedItems.reduce((acc, current) => {
    return acc + (current.item.price * current.quantity);
  }, 0);

  // Apply Coupon discount
  const getDiscount = () => {
    if (!activeCoupon) return 0;
    if (subtotal < activeCoupon.minOrderValue) {
      return 0; // Does not qualify
    }
    if (activeCoupon.discountType === 'percentage') {
      return Math.round((subtotal * activeCoupon.discountValue) / 100);
    }
    return activeCoupon.discountValue;
  };

  const discountAmount = getDiscount();
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const gstAmount = parseFloat(((taxableAmount * config.gstPercent) / 100).toFixed(2));
  const deliveryCharge = subtotal > 0 ? config.deliveryCharge : 0;

  // Compute dynamic extra charge or discount for chosen gateway
  const paymentGateway = config.paymentSettings?.gateways?.find(g => g.id === paymentMethod);
  const paymentAdjustment = (() => {
    if (!paymentGateway || !paymentGateway.extraChargePercentOrFixed) return 0;
    if (paymentGateway.extraChargeType === 'fixed') {
      return paymentGateway.extraChargePercentOrFixed;
    } else {
      return parseFloat(((taxableAmount * paymentGateway.extraChargePercentOrFixed) / 100).toFixed(2));
    }
  })();

  const baseCalculatedTotal = taxableAmount + gstAmount + deliveryCharge + paymentAdjustment;
  const loyaltyDeduction = useLoyalty ? Math.min(loyaltyPoints, baseCalculatedTotal) : 0;
  const totalAmount = parseFloat((baseCalculatedTotal - loyaltyDeduction).toFixed(2));

  const handleApplyCoupon = () => {
    setErrorMsg('');
    const matched = coupons.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (matched) {
      if (subtotal >= matched.minOrderValue) {
        setActiveCoupon(matched);
      } else {
        setErrorMsg(`Coupon requires minimum order value of ₹${matched.minOrderValue}. Buy a bit more delicious food first!`);
      }
    } else {
      setErrorMsg('Invalid Coupon code code. Ensure there are no typos.');
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponCode('');
    setErrorMsg('');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedItems.length === 0) {
      setErrorMsg('Your basket is empty. Please select delicious meals from the listing.');
      return;
    }

    if (!pincode || pincode.length !== 6) {
      setErrorMsg('Please supply a valid 6-digit Pune pincode.');
      return;
    }

    if (config.isUnderServiceAreaOnly && !config.allowedPincodes.includes(pincode)) {
      setErrorMsg(`We do not service pincode ${pincode} currently. Supported pincodes include: ${config.allowedPincodes.slice(0, 5).join(', ')} etc.`);
      return;
    }

    // Cash on Delivery Minimum Order Safeguards
    if (paymentMethod === 'cod') {
      const minCod = config.paymentSettings?.codMinOrderValue || 0;
      if (subtotal < minCod) {
        setErrorMsg(`Cash on Delivery (COD) requires a minimum food subtotal of ₹${minCod}. Please select an online gateway option or add more Indian delicacies to your cart!`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerMobile,
          deliveryAddress,
          pincode,
          couponCode: activeCoupon?.code || undefined,
          paymentMethod,
          notes,
          deliverySlot,
          items: selectedItems.map((cart) => ({
            menuItemId: cart.item.id,
            name: cart.item.name,
            price: cart.item.price,
            quantity: cart.quantity
          }))
        })
      });

      const data = await res.json();
      if (res.ok) {
        const finalPointsRemaining = loyaltyPoints - loyaltyDeduction;
        const pointsEarnedNow = Math.floor((subtotal / 100) * config.loyaltyPointsPer100);
        const nextPointsBalance = finalPointsRemaining + pointsEarnedNow;
        localStorage.setItem('bhagwati_loyalty_points', nextPointsBalance.toString());
        setLoyaltyPoints(nextPointsBalance);
        setUseLoyalty(false);

        // Save order ID to local history
        try {
          const stored = localStorage.getItem('bhagwati_order_ids');
          const ids = stored ? JSON.parse(stored) : [];
          if (Array.isArray(ids)) {
            if (!ids.includes(data.orderId)) {
              ids.push(data.orderId);
            }
            localStorage.setItem('bhagwati_order_ids', JSON.stringify(ids));
          } else {
            localStorage.setItem('bhagwati_order_ids', JSON.stringify([data.orderId]));
          }
        } catch (e) {
          console.error("Local storage sync error:", e);
        }

        onClearCart();
        onOrderPlaced(data.orderId);
        onClose();

        if (isWhatsAppShareEnabled) {
          const subtotalText = selectedItems.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
          const lineDetails = selectedItems.map(c => `• ${c.quantity}x ${c.item.name} (₹${c.item.price * c.quantity})`).join('\n');
          const finalDiscount = activeCoupon ? (activeCoupon.discountType === 'percentage' ? Math.round((subtotalText * activeCoupon.discountValue) / 100) : activeCoupon.discountValue) : 0;
          const taxable = Math.max(0, subtotalText - finalDiscount);
          const finalGst = parseFloat(((taxable * config.gstPercent) / 100).toFixed(2));
          const finalDelivery = subtotalText > 0 ? config.deliveryCharge : 0;
          const finalTotal = parseFloat((taxable + finalGst + finalDelivery + paymentAdjustment - loyaltyDeduction).toFixed(2));

          const text = `*New Order from Bhagwati Cloud Kitchen!* 🍛\n` +
            `---------------------------------------\n` +
            `*Order ID:* ${data.orderId}\n` +
            `*Customer Name:* ${customerName}\n` +
            `*Mobile:* +91 ${customerMobile}\n` +
            `*Delivery Address:* ${deliveryAddress}\n` +
            `*Pincode:* ${pincode}\n` +
            `*Preferred Time Slot:* ${deliverySlot}\n\n` +
            `*🛒 Items Shortlist:*\n${lineDetails}\n\n` +
            `*💰 Bill Details:*\n` +
            `• Subtotal: ₹${subtotalText}\n` +
            `${finalDiscount > 0 ? `• Coupon Discount: -₹${finalDiscount}\n` : ''}` +
            `• GST (${config.gstPercent}%): ₹${finalGst}\n` +
            `• Packaging & Delivery: ₹${finalDelivery}\n` +
            `${loyaltyDeduction > 0 ? `• Loyalty Wallet Savings: -₹${loyaltyDeduction}\n` : ''}` +
            `• Gateway Adjustment: ₹${paymentAdjustment}\n` +
            `---------------------------------------\n` +
            `*Grand Total Bill:* ₹${finalTotal}\n` +
            `*Payment Method:* ${paymentMethod}\n` +
            `${notes ? `*Kitchen Notes:* ${notes}\n` : ''}` +
            `*Loyalty Points Earned:* +${pointsEarnedNow} pts\n` +
            `---------------------------------------\n` +
            `Please confirm my order and share food preparation timings. Thank you! 🍽️`;

          const url = `https://wa.me/91${config.mobileNumber}?text=${encodeURIComponent(text)}`;
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      } else {
        setErrorMsg(data.error || 'Server rejected checkout transaction. Verify your input parameters.');
      }
    } catch (err) {
      setErrorMsg('Network issues. Ensure server is running correctly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Absolute overlay background */}
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Slideout wrapper */}
      <div className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden z-10 border-l border-neutral-200">
        
        {/* Header container */}
        <div className="p-6 border-b border-neutral-200 flex justify-between items-center bg-neutral-50 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-red-950" />
            <h2 className="text-lg font-serif font-extrabold text-neutral-900">Your Basket Details</h2>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
              {selectedItems.reduce((sum, c) => sum + c.quantity, 0)} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-200/50 hover:bg-neutral-200 transition cursor-pointer"
          >
            <X className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        {/* Scrollable Center elements */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-neutral-200">
          
          {/* Basket products listing */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Selected Culinary Items</h3>
            {selectedItems.length === 0 ? (
              <div className="text-center py-8 space-y-3 bg-neutral-100/50 rounded-2xl border border-dashed border-neutral-300">
                <p className="text-sm text-neutral-500 font-sans">No hot dishes added to your cart yet.</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-950 hover:bg-orange-600 rounded-lg cursor-pointer"
                >
                  Browse Delicious Foods
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 border border-neutral-200/60 rounded-2xl p-4 bg-white shadow-xs">
                {selectedItems.map(({ item, quantity }) => (
                  <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0 justify-between items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">{item.name}</h4>
                      <span className="text-xs text-neutral-500 font-bold">₹{item.price.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50 shrink-0">
                      <button
                        type="button"
                        onClick={() => onDecrement(item.id)}
                        className="p-1 hover:bg-neutral-100 text-neutral-600 rounded-l-lg cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-neutral-800">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => onIncrement(item.id)}
                        className="p-1 hover:bg-neutral-100 text-neutral-600 rounded-r-lg cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coupon inputs */}
          {selectedItems.length > 0 && (
            <div className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/60 shadow-xs">
              <h3 className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                <Ticket className="w-4 h-4 text-orange-600" /> Apply Promotional Voucher
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="EX: WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={!!activeCoupon}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white"
                />
                
                {activeCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-3.5 py-1.5 bg-red-100 text-red-700 font-bold text-xs rounded-xl hover:bg-red-200 cursor-pointer transition"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3.5 py-1.5 bg-red-950 text-white font-bold text-xs rounded-xl hover:bg-red-900 cursor-pointer transition"
                  >
                    Apply Coupon
                  </button>
                )}
              </div>

              {/* Show available coupons */}
              {!activeCoupon && coupons.length > 0 && (
                <div className="pt-2 border-t border-neutral-200/60">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold mb-1">Available Vouchers:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {coupons.map((cp) => (
                      <button
                        key={cp.code}
                        type="button"
                        onClick={() => {
                          setCouponCode(cp.code);
                          setErrorMsg('');
                        }}
                        className="text-[10px] font-bold bg-white border border-neutral-200 hover:border-orange-500 text-neutral-600 px-2 py-1 rounded-md"
                      >
                        {cp.code} (Get ₹{cp.discountValue}{cp.discountType === 'percentage' ? '%' : ''} off)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeCoupon && (
                <p className="text-xs text-green-700 font-semibold bg-green-50 p-2 rounded-lg flex items-center gap-1">
                  <Check className="w-4 h-4" /> Couponapplied! Saved ₹{discountAmount} on your meal list.
                </p>
              )}
            </div>
          )}

          {/* Guest Checkout details form */}
          {selectedItems.length > 0 && (
            <div className="space-y-4">
              {/* Bhagwati Loyal Club Card */}
              <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-2xl text-left shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-600 inline-block animate-ping" />
                    <span className="text-[11px] font-extrabold uppercase text-orange-950 tracking-wider font-sans">Bhagwati Loyalty Wallet</span>
                  </div>
                  <span className="text-xs bg-[#800020] text-amber-300 font-mono font-bold px-2.5 py-0.5 rounded-xl border border-amber-400/20">
                    {loyaltyPoints} points
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 font-sans">
                  Earn points on every thali & tiffin order! Every point saves you ₹1 dynamically at checkout.
                </p>
                {loyaltyPoints > 0 ? (
                  <button
                    type="button"
                    onClick={() => setUseLoyalty(!useLoyalty)}
                    className={`w-full py-2 px-3 rounded-xl border font-bold text-xs flex justify-between items-center transition cursor-pointer ${
                      useLoyalty 
                        ? 'bg-orange-600 font-extrabold text-white border-orange-500' 
                        : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-300'
                    }`}
                  >
                    <span>{useLoyalty ? '🟢 Loyalty points applied!' : '🎁 Apply wallet balance'}</span>
                    <span>{useLoyalty ? `-₹${loyaltyDeduction}` : `Save ₹${Math.min(loyaltyPoints, Math.floor(baseCalculatedTotal))}`}</span>
                  </button>
                ) : (
                  <p className="text-[10px] text-neutral-400 font-mono">Collect points upon first purchase to activate your wallet balance!</p>
                )}
              </div>

              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Delivery Coordinates</h3>
              <form onSubmit={handleCheckout} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Receiver name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Indian Mobile Number</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      placeholder="10-digit smartphone"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Drop-off Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="Apt, Block, landmark area"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Pincode e.g. 411037"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-600" />
                    <label className="text-[11px] font-bold text-neutral-600 block">Preferred Delivery Time Slot</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Breakfast (8:00 AM - 10:30 AM)',
                      'Lunch (12:00 PM - 2:30 PM)',
                      'TeaSnacks (4:30 PM - 6:30 PM)',
                      'Dinner (7:30 PM - 10:30 PM)'
                    ].map((slot) => {
                      const isSelected = deliverySlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setDeliverySlot(slot)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'border-orange-600 bg-orange-55/30 ring-1 ring-orange-600 text-orange-950 font-semibold'
                              : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          <span className="text-[9px] uppercase font-black tracking-wider block opacity-75">
                            {slot.split(' ')[0]}
                          </span>
                          <span className="text-[11px] font-medium leading-normal mt-0.5">
                            {slot.slice(slot.indexOf('('))}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-600 block mb-1">Cooking Notes / Kitchen Instructions</label>
                  <input
                    type="text"
                    placeholder="E.g., Make spicy paneer paratha mild, or don't ring doorbell..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white"
                  />
                </div>

                {/* WhatsApp Order Copy Checkbox Option */}
                <div className="flex items-center gap-2 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                  <input
                    type="checkbox"
                    id="checkbox-whatsapp"
                    checked={isWhatsAppShareEnabled}
                    onChange={(e) => setIsWhatsAppShareEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="checkbox-whatsapp" className="text-xs font-bold text-slate-800 leading-none select-none cursor-pointer flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span>Send order details to WhatsApp 🟢</span>
                  </label>
                </div>

                {/* Gateway visual selectors */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-bold text-neutral-600 block">Gateways & Secure Payment Method</label>
                    {config.paymentSettings?.isTestMode && (
                      <span className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 text-[8px] font-black uppercase rounded-md tracking-wider">
                        Test Mode Active
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {activeGateways.map((g) => {
                      const isSelected = paymentMethod === g.id;
                      const isCodDisabled = g.id === 'cod' && subtotal < (config.paymentSettings?.codMinOrderValue || 0);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          disabled={isCodDisabled}
                          onClick={() => setPaymentMethod(g.id)}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition relative group ${
                            isCodDisabled ? 'opacity-30 cursor-not-allowed bg-neutral-100 border-neutral-200' :
                            isSelected ? 'border-orange-500 bg-orange-50/20 text-neutral-900' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-[10px] sm:text-[11px]">{g.name}</span>
                            {isSelected ? (
                              <span className="w-2.5 h-2.5 rounded-full bg-orange-600 shrink-0" />
                            ) : (
                              <span className="w-2.5 h-2.5 rounded-full border border-neutral-300 shrink-0" />
                            )}
                          </div>
                          {g.extraChargePercentOrFixed !== undefined && g.extraChargePercentOrFixed !== 0 && (
                            <span className={`text-[8px] font-black uppercase tracking-wider mt-1 block px-1 py-0.5 rounded w-fit leading-none ${
                              g.extraChargePercentOrFixed < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-800'
                            }`}>
                              {g.extraChargePercentOrFixed < 0 ? 'Discount' : 'Fee'}: {g.extraChargePercentOrFixed < 0 ? '' : '+'}{g.extraChargeType === 'fixed' ? '₹' : ''}{Math.abs(g.extraChargePercentOrFixed)}{g.extraChargeType === 'percent' ? '%' : ''}
                            </span>
                          )}
                          {isCodDisabled && (
                            <span className="text-[8px] font-semibold text-red-600 mt-1 block leading-normal">
                              Min. ₹{config.paymentSettings?.codMinOrderValue} order
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Display selected gateway custom instructions */}
                  {paymentGateway?.instructions && (
                    <div className="mt-2.5 p-3 rounded-xl bg-orange-50/5 border border-orange-200/40 text-[10px] text-neutral-600 font-sans leading-relaxed">
                      <span className="font-bold text-orange-850 block text-[10px] mb-0.5 uppercase tracking-wider">Gateway Instructions:</span>
                      {paymentGateway.instructions}
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <p className="p-3 text-[11px] font-bold text-red-800 bg-red-100 rounded-xl leading-relaxed">{errorMsg}</p>
                )}

                {/* Submit Container details */}
                {selectedItems.length > 0 && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="hidden" // Handled by outer drawer button
                    id="submit-hidden-btn"
                  />
                )}
              </form>
            </div>
          )}

        </div>

        {/* Pricing calculations footer segment */}
        {selectedItems.length > 0 && (
          <div className="p-6 bg-neutral-50 border-t border-neutral-200 shrink-0 space-y-4">
            
            <div className="text-xs space-y-2 font-sans">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal (items value)</span>
                <span className="font-bold">₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount Applied</span>
                  <span className="font-bold">-₹{discountAmount}</span>
                </div>
              )}
              {loyaltyDeduction > 0 && (
                <div className="flex justify-between text-orange-700">
                  <span>Loyalty wallet deduction</span>
                  <span className="font-bold">-₹{loyaltyDeduction}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500">
                <span>GST FSSAI Standard ({config.gstPercent}%)</span>
                <span className="font-bold">+₹{gstAmount}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Sealed Insulation Shipping</span>
                <span className="font-bold">₹{deliveryCharge}</span>
              </div>
              {paymentAdjustment !== 0 && (
                <div className={`flex justify-between font-bold ${paymentAdjustment < 0 ? 'text-emerald-700' : 'text-neutral-500'}`}>
                  <span>{paymentGateway?.name} Adjustment</span>
                  <span>{paymentAdjustment < 0 ? `-₹${Math.abs(paymentAdjustment)}` : `+₹${paymentAdjustment}`}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-neutral-900 border-t border-dashed border-neutral-300 pt-2 font-extrabold text-base">
                <span className="font-serif">Grand Total Bill</span>
                <span className="text-xl text-orange-600">₹{totalAmount}</span>
              </div>
            </div>

            {isCurfewActive && (
              <div className="p-3.5 bg-red-950/90 border border-orange-500/20 text-orange-200 rounded-xl text-[10px] sm:text-[11px] leading-relaxed font-sans text-left space-y-1">
                <div className="font-serif font-black text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  🌙 Priority Kitchen Pre-Order Active
                </div>
                <div>
                  Our live culinary ovens are resting right now (until {formatTime12h(config.openingTime ?? "08:00")}). You are placing a high-priority morning reservation. Our tiffin chef will approve first thing at sunrise!
                </div>
              </div>
            )}

            {/* Check out buttons */}
            <button
              onClick={() => {
                const formBtn = document.getElementById('submit-hidden-btn');
                if (formBtn) formBtn.click();
              }}
              disabled={isSubmitting}
              className={`w-full inline-flex items-center justify-center py-4 px-6 rounded-2xl font-bold text-white shadow-lg transition cursor-pointer disabled:opacity-50 text-xs sm:text-sm ${
                isCurfewActive 
                  ? 'bg-red-950 hover:bg-red-900 shadow-red-950/20 border border-red-800' 
                  : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'
              }`}
            >
              {isSubmitting 
                ? 'Verifying Secure SSL Gateways...' 
                : isCurfewActive 
                  ? `📅 Confirm Next-Day Priority Pre-Order (₹${totalAmount})` 
                  : `Authorize & Dispatch Order (₹${totalAmount})`
              }
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
