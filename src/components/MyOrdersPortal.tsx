import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { 
  ClipboardList, 
  Search, 
  MapPin, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  Phone, 
  ShoppingBag, 
  X, 
  ArrowRight, 
  RefreshCw, 
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MyOrdersPortalProps {
  onSelectOrder: (orderId: string) => void;
  onClose: () => void;
  brandPhone: string;
}

export default function MyOrdersPortal({ onSelectOrder, onClose, brandPhone }: MyOrdersPortalProps) {
  // Tabs for search type
  const [activeTab, setActiveTab] = useState<'history' | 'mobile' | 'id'>('history');

  // Phone search states
  const [searchPhone, setSearchPhone] = useState('');
  const [phoneOrders, setPhoneOrders] = useState<Order[]>([]);
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);
  const [phoneSearched, setPhoneSearched] = useState(false);

  // Direct ID states
  const [searchId, setSearchId] = useState('');
  const [isSearchingId, setIsSearchingId] = useState(false);
  const [idError, setIdError] = useState('');

  // Device history local states
  const [savedOrderIds, setSavedOrderIds] = useState<string[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Load local device history order IDs on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bhagwati_order_ids');
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        // Filter empty elements or duplicates
        const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
        setSavedOrderIds(uniqueIds);
        if (uniqueIds.length > 0) {
          fetchHistoryOrders(uniqueIds);
        }
      }
    } catch (e) {
      console.error('Failed reading device order history:', e);
    }
  }, []);

  // Fetch full details of orders stored in browser local storage
  const fetchHistoryOrders = async (ids: string[]) => {
    setIsHistoryLoading(true);
    const fetched: Order[] = [];
    try {
      // Fetch in parallel for speed
      await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`/api/orders/${id}`);
            if (res.ok) {
              const data = await res.json();
              fetched.push(data);
            }
          } catch (e) {
            console.error(`Error loading order ${id}:`, e);
          }
        })
      );
      // Sort newest first
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHistoryOrders(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handlePhoneSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = searchPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      alert("Please enter a valid phone number.");
      return;
    }

    setIsSearchingPhone(true);
    setPhoneSearched(true);
    try {
      const res = await fetch(`/api/orders/by-mobile/${cleanPhone}`);
      if (res.ok) {
        const data = await res.json();
        // Sort newest first
        data.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPhoneOrders(data);
      } else {
        setPhoneOrders([]);
      }
    } catch (err) {
      console.error("Failed fetching orders by phone:", err);
      alert("Network discrepancy. Attempt again.");
    } finally {
      setIsSearchingPhone(false);
    }
  };

  const handleIdSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = searchId.trim().toUpperCase();
    if (!cleanId) return;

    setIsSearchingId(true);
    setIdError('');
    try {
      const res = await fetch(`/api/orders/${cleanId}`);
      if (res.ok) {
        const matchingOrder = await res.json();
        const canonicalId = matchingOrder.id;

        // Persist in local storage so customer keeps it on history
        try {
          const stored = localStorage.getItem('bhagwati_order_ids');
          const ids = stored ? JSON.parse(stored) : [];
          if (Array.isArray(ids)) {
            if (!ids.includes(canonicalId)) {
              ids.push(canonicalId);
              localStorage.setItem('bhagwati_order_ids', JSON.stringify(ids));
            }
          }
        } catch (storageErr) {
          console.error("Local storage sync error:", storageErr);
        }

        onSelectOrder(canonicalId);
      } else {
        setIdError(`Order ID "${cleanId}" not found in Bhagwati central records. Try again or check spelling.`);
      }
    } catch (err) {
      setIdError("Connection issue checking direct Order ID.");
    } finally {
      setIsSearchingId(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'OutForDelivery':
        return 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse';
      case 'Preparing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Return Page Row */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-neutral-200/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-black text-neutral-900 leading-tight">My Orders & Tracking</h1>
            <p className="text-xs text-neutral-400 font-sans">Review past thalis & track current deliveries in real-time</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="text-xs font-bold text-neutral-500 hover:text-red-950 transition flex items-center gap-1 cursor-pointer bg-neutral-100 hover:bg-neutral-200/80 px-3 py-1.5 rounded-xl border border-neutral-200"
        >
          <X className="w-4 h-4" /> Exit Portal
        </button>
      </div>

      {/* Tabs list styled in high contrast design */}
      <div className="flex bg-neutral-100 p-1 rounded-2xl border mb-8 max-w-lg">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'history' 
              ? 'bg-red-950 text-white shadow' 
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Device History ({savedOrderIds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mobile')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'mobile' 
              ? 'bg-red-950 text-white shadow' 
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Search by Mobile</span>
        </button>

        <button
          onClick={() => setActiveTab('id')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'id' 
              ? 'bg-red-950 text-white shadow' 
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Enter Order ID</span>
        </button>
      </div>

      {/* TABS CONTAINER CONTENT */}
      <div>
        
        {/* TAB 1: DEVICE HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {isHistoryLoading ? (
              <div className="text-center py-24 space-y-3 bg-white border border-neutral-200/60 rounded-3xl">
                <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
                <p className="text-sm text-neutral-500 font-sans font-medium">Synchronizing device historical tokens with Pune log...</p>
              </div>
            ) : historyOrders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-neutral-200/80 space-y-4 max-w-xl mx-auto">
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-600">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-serif font-bold text-neutral-900">No Orders Tracked</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  You haven't placed any orders from this browser session yet, or local storage has been cleared.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => setActiveTab('mobile')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 underline"
                  >
                    Lookup using your Mobile Number <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Your Saved Orders ({historyOrders.length})
                  </span>
                  <button 
                    onClick={() => fetchHistoryOrders(savedOrderIds)}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh Statuses
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {historyOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="bg-white hover:border-orange-200 border border-neutral-200/70 p-6 rounded-2xl shadow-xs transition duration-200 flex flex-col justify-between"
                    >
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-neutral-400 font-semibold block">ORDER REFERENCE</span>
                            <span className="font-extrabold text-neutral-900 text-sm font-mono uppercase bg-neutral-50 px-2 py-0.5 rounded border border-neutral-150">
                              #{order.id}
                            </span>
                          </div>
                          
                          <span className={`text-[10.5px] px-2.5 py-0.5 rounded border font-bold ${getStatusBadgeClass(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>

                        <div className="text-xs text-neutral-500 space-y-1">
                          <p className="font-medium text-neutral-800 line-clamp-1 pb-1">
                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                          </p>
                          <p className="flex items-center gap-1 font-mono text-[10.5px]">
                            <Clock className="w-3.5 h-3.5 text-neutral-300" /> {formatDate(order.createdAt)}
                          </p>
                          <p className="flex items-center gap-1 truncate text-[10.5px]">
                            <MapPin className="w-3.5 h-3.5 text-neutral-300 shrink-0" /> {order.deliveryAddress}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-neutral-100 flex justify-between items-center">
                        <div className="text-left">
                          <span className="text-[9px] text-neutral-400 block font-semibold uppercase">Grand Total</span>
                          <span className="text-sm font-black font-mono text-neutral-900">₹{order.totalAmount}</span>
                        </div>

                        <button
                          onClick={() => onSelectOrder(order.id)}
                          className="px-4 py-2 bg-red-950 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          Track Now <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: POWERFUL MOBILE DIRECT SEARCH */}
        {activeTab === 'mobile' && (
          <div className="space-y-8">
            <div className="bg-white border border-neutral-200/80 p-6 sm:p-8 rounded-3xl max-w-2xl mx-auto text-left relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-orange-50 rounded-full blur-2xl opacity-80 pointer-events-none" />
              
              <form onSubmit={handlePhoneSearch} className="space-y-5 relative">
                <div>
                  <h3 className="text-base font-serif font-black text-neutral-900">Find Orders by Phone Number</h3>
                  <p className="text-xs text-neutral-400 font-sans mt-0.5 leading-relaxed">
                    Retrieve all historical & active orders booked under your mobile number in Pune database.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="Enter 10-Digit Mobile"
                      maxLength={10}
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-12 pr-4 py-3 bg-neutral-50 hover:bg-neutral-50/50 focus:bg-white border border-neutral-200 rounded-xl text-xs font-mono font-bold focus:ring-1 focus:ring-orange-500 focus:outline-none transition leading-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSearchingPhone}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSearchingPhone ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Retrieving List...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" /> Lookup Orders
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Results rendering */}
            {phoneSearched && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 text-left px-1">
                  Database Retrieval Results ({phoneOrders.length} Found)
                </h4>

                {phoneOrders.length === 0 ? (
                  <div className="p-8 bg-neutral-50 border rounded-2xl text-center text-xs text-neutral-500 max-w-xl mx-auto">
                    No orders could be located matching (+91 {searchPhone}). Ensure you typed the registered billing number correctly.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {phoneOrders.map((order) => (
                      <div 
                        key={order.id} 
                        className="bg-white border border-neutral-200 p-6 rounded-2xl flex flex-col justify-between hover:border-orange-200 transition text-left"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] text-neutral-400 block font-semibold uppercase">ORDER ID</span>
                              <span className="font-extrabold font-mono text-neutral-900 text-xs bg-neutral-50 px-2 py-0.5 rounded border">
                                {order.id}
                              </span>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getStatusBadgeClass(order.orderStatus)}`}>
                              {order.orderStatus}
                            </span>
                          </div>

                          <div className="text-xs text-neutral-500 space-y-1 font-sans">
                            <p className="font-bold text-neutral-800 line-clamp-1 pb-1">
                              {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                            </p>
                            <p className="text-[10px] font-mono whitespace-nowrap">
                              ⏱️ Placed: {formatDate(order.createdAt)}
                            </p>
                            <p className="text-[10px] truncate">
                              📍 Dest: {order.deliveryAddress}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-neutral-105 flex justify-between items-center">
                          <div>
                            <span className="text-[9px] text-neutral-400 block font-semibold uppercase">Billing Price</span>
                            <span className="text-sm font-black font-mono text-neutral-900">₹{order.totalAmount}</span>
                          </div>

                          <button
                            onClick={() => {
                              // Persist in local storage so customer keeps it on history
                              try {
                                const stored = localStorage.getItem('bhagwati_order_ids');
                                const ids = stored ? JSON.parse(stored) : [];
                                if (!ids.includes(order.id)) {
                                  ids.push(order.id);
                                  localStorage.setItem('bhagwati_order_ids', JSON.stringify(ids));
                                }
                              } catch (e) {
                                console.error(e);
                              }
                              onSelectOrder(order.id);
                            }}
                            className="px-4 py-2 bg-[#800020] text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition flex items-center gap-1 cursor-pointer"
                          >
                            Track Live 🎯
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ENTER ORDER ID DIRECT */}
        {activeTab === 'id' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white border border-neutral-200 p-6 sm:p-8 rounded-3xl text-left">
              <form onSubmit={handleIdSearch} className="space-y-4">
                <div>
                  <h3 className="text-base font-serif font-black text-neutral-900">Direct Order ID Lookup</h3>
                  <p className="text-xs text-neutral-400 mt-0.5 font-sans leading-relaxed">
                    Track the live prep stages or dispatch logistics of a specific order instantly using its ticket ID.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                    Order Tracking Code / Ticket ID (e.g. BK-1082)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="BKXXXX"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className="flex-1 px-4 py-3 bg-neutral-50 hover:bg-neutral-50/50 focus:bg-white border border-neutral-200 rounded-xl text-xs font-mono font-bold uppercase tracking-widest focus:ring-1 focus:ring-orange-500 focus:outline-none transition leading-none"
                    />

                    <button
                      type="submit"
                      disabled={isSearchingId}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isSearchingId ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Verify & Track</span>
                      )}
                    </button>
                  </div>
                </div>

                {idError && (
                  <p className="text-xs text-red-600 font-sans font-medium flex items-center gap-1.5 bg-red-50 p-3 rounded-xl border border-red-100 animate-pulse">
                    <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0" /> {idError}
                  </p>
                )}
              </form>
            </div>

            {/* Inquire help desk direct card */}
            <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-200/30 text-left flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-neutral-800">Cant locate your tracking credentials?</h4>
                <p className="text-neutral-500 leading-relaxed font-sans">
                  Do not worry! Connect with our cloud kitchen desk operator on WhatsApp and we will lookup your delivery executive's live coordinate logs manually map indicators for you.
                </p>
                <div className="pt-2 flex gap-3 font-bold">
                  <a href={`https://wa.me/91${brandPhone}`} target="_blank" rel="noopener" className="text-emerald-700 hover:underline">
                    Inquire on WhatsApp
                  </a>
                  <a href={`tel:${brandPhone}`} className="text-orange-600 hover:underline">
                    Direct Call Operator
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
