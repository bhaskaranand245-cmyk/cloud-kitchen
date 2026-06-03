import { useState, useEffect } from 'react';
import { Order } from '../types';
import { Clock, Truck, ChefHat, CheckCircle2, ShieldAlert, ArrowLeft, RefreshCw, Phone, MessageCircle, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface OrderTrackProps {
  orderId: string;
  onBack: () => void;
  brandPhone: string;
}

export default function OrderTrack({ orderId, onBack, brandPhone }: OrderTrackProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrderStatus = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setErrorMsg(`Failed to locate order tracks for code: ${orderId}. Ensure the code is correct.`);
      }
    } catch (err) {
      setErrorMsg("Connection issue fetching live tracing.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStatus();
    // Auto refresh order status every 15 seconds to simulate live kitchen tracking
    const interval = setInterval(fetchOrderStatus, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  const stages = [
    { key: 'Placed', label: 'Order Registered', desc: 'Received by Bhagwati Kitchen operators', icon: CheckCircle2, color: 'text-blue-500 bg-blue-50' },
    { key: 'Preparing', label: 'Baking & Simmering', desc: 'Pure-veg fresh ingredients cooking', icon: ChefHat, color: 'text-amber-500 bg-amber-50' },
    { key: 'OutForDelivery', label: 'Dispatched Out', desc: 'Rider is carrying hot packets towards your sector', icon: Truck, color: 'text-orange-500 bg-orange-50' },
    { key: 'Delivered', label: 'Safely Delivered', desc: 'Handed over with zero contact hygiene rules', icon: CheckCircle2, color: 'text-green-500 bg-green-50' }
  ];

  // Helper index to highlight trace circles
  const getCurrentStageIndex = () => {
    if (!order) return 0;
    const current = order.orderStatus;
    if (current === 'Cancelled') return -1;
    return stages.findIndex(s => s.key === current);
  };

  const currentIdx = getCurrentStageIndex();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      
      {/* Top action row */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-red-950 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Go back to Main Site
        </button>

        <button
          onClick={fetchOrderStatus}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-neutral-200 hover:bg-neutral-50 rounded-xl transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-orange-600" /> Auto-Refreshing Live Status
        </button>
      </div>

      {isLoading && !order ? (
        <div className="text-center py-24 space-y-3 bg-white border rounded-3xl">
          <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
          <p className="text-sm text-neutral-500 font-sans font-medium">Looking up matching kitchen tracing signals...</p>
        </div>
      ) : errorMsg ? (
        <div className="text-center py-16 px-6 bg-red-50 border border-red-200 rounded-3xl space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
          <h3 className="text-lg font-serif font-bold text-neutral-900">Live Tracing Alert</h3>
          <p className="text-xs text-neutral-600 max-w-sm mx-auto">{errorMsg}</p>
          <button
            onClick={fetchOrderStatus}
            className="px-5 py-2 font-bold text-xs bg-red-950 text-white rounded-xl hover:bg-red-900 transition"
          >
            Refetch Tracing ID
          </button>
        </div>
      ) : order ? (
        <div className="space-y-8">
          
          {/* Main Status Header Card */}
          <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-xs space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-neutral-400">
              TRK-{order.id}
            </div>

            <div className="space-y-1">
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Order Tracing Ticket</span>
              <h2 className="text-2xl font-serif font-extrabold text-neutral-900 flex items-center gap-2">
                Order #{order.id} <span className={`text-xs ml-2 px-3 py-1 rounded-full font-sans font-bold ${
                  order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                  'bg-orange-100 text-orange-700 animate-pulse'
                }`}>
                  {order.orderStatus}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-100 pt-4 text-sm font-sans">
              <div>
                <span className="text-xs text-neutral-400 block font-semibold">Estimated Reach duration:</span>
                <span className="font-extrabold text-neutral-900 flex items-center gap-1.5 mt-1">
                  <Clock className="w-4 h-4 text-orange-600" /> {order.orderStatus === 'Delivered' ? 'Delivered successfully' : order.estimatedDeliveryTime || '35 mins'}
                </span>
              </div>
              <div>
                <span className="text-xs text-neutral-400 block font-semibold">Delivery Coordinates:</span>
                <span className="font-medium text-neutral-700 block mt-1 truncate">
                  {order.deliveryAddress} ({order.pincode})
                </span>
                {order.deliverySlot && (
                  <span className="text-xs text-neutral-400 block font-semibold mt-3">
                    Preferred Time Slot:
                    <span className="font-extrabold text-[#800020] block mt-0.5">
                      {order.deliverySlot}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Process Visualizer */}
          {order.orderStatus !== 'Cancelled' ? (
            <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-xs space-y-8">
              <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wider border-b border-neutral-50 pb-3">Preparation & Travel Status Timeline</h3>
              
              <div className="space-y-8 relative before:absolute before:top-2 before:bottom-2 before:left-[19px] before:w-1 before:bg-neutral-100">
                {stages.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isCompleted = currentIdx >= idx;
                  const isActive = currentIdx === idx;

                  return (
                    <div key={idx} className="flex gap-4 relative">
                      {/* Node Bullet Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border z-10 transition-colors duration-300 ${
                        isCompleted 
                          ? 'bg-red-950 border-red-950 text-white' 
                          : 'bg-neutral-50 border-neutral-200 text-neutral-300'
                      } ${isActive ? 'ring-4 ring-orange-100 scale-105' : ''}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Info description segment */}
                      <div className="flex-1 py-1">
                        <h4 className={`text-sm font-bold ${isCompleted ? 'text-neutral-900' : 'text-neutral-400'}`}>
                          {stage.label}
                        </h4>
                        <p className={`text-xs mt-0.5 ${isActive ? 'text-neutral-600 font-medium' : 'text-neutral-400'}`}>
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center space-y-2">
              <h4 className="font-bold text-red-800 font-serif">Order Status: Cancelled</h4>
              <p className="text-xs text-red-600">The kitchen team has marked this order ticket as cancelled. Please telephone operators if this was unexpected.</p>
            </div>
          )}

          {/* Order Details list */}
          <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-xs space-y-4">
            <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider border-b border-neutral-100/60 pb-3">Consolidated Diet Contents</h3>
            
            <div className="divide-y divide-neutral-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2.5 text-xs text-neutral-600">
                  <span>{item.name} <span className="font-bold text-neutral-900">x {item.quantity}</span></span>
                  <span className="font-semibold text-neutral-900">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-100 pt-3 flex justify-between items-baseline text-xs">
              <span className="text-neutral-400">Total Charged Bill:</span>
              <span className="text-base font-extrabold text-red-950">₹{order.totalAmount} ({order.paymentMethod})</span>
            </div>
          </div>

          {/* Prompt contact row */}
          <div className="text-center sm:text-left flex flex-col sm:flex-row justify-between items-center bg-orange-50/50 p-5 rounded-2xl border border-orange-200/30 gap-4">
            <div>
              <h4 className="text-xs font-bold text-neutral-800">Need Immediate Delivery Changes?</h4>
              <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Call kitchen dispatch agents. Keep your track tag TRK-{order.id} ready.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 justify-end">
              <a
                href={`https://wa.me/91${brandPhone}?text=${encodeURIComponent(`Namaste Bhagwati Cloud Kitchen, I am inquiring regarding my Order ID: ${order.id}. Could you please let me know when it will arrive? Thank you!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-emerald-600 border border-emerald-500 hover:bg-emerald-700 text-white shadow-xs rounded-xl transition"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white text-white" /> Chat on WhatsApp
              </a>

              <a
                href={`tel:${brandPhone}`}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-50 shadow-xs rounded-xl transition"
              >
                <Phone className="w-3.5 h-3.5 text-orange-600" /> Dial Dispatch Agent
              </a>
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
}
