import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, Order, Review, Coupon, CustomConfig, PaymentGateway, PaymentSettings } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  LayoutDashboard, ShoppingCart, Plus, Edit2, Trash2, Settings, Star, MessageSquareCode,
  Sparkles, Check, CheckSquare, RefreshCw, Smartphone, Download, MapPin, Ticket, ShieldAlert,
  ArrowUp, ArrowDown, X, Image, Camera, Upload, CreditCard, Lock, Clock
} from 'lucide-react';

interface AdminDashboardProps {
  menu: MenuItem[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  config: CustomConfig;
  onUpdateMenu: (updatedMenu: MenuItem[]) => void;
  onUpdateConfig: (updatedConfig: CustomConfig) => void;
  onUpdateReviews: (updatedReviews: Review[]) => void;
  onUpdateCoupons: (updatedCoupons: Coupon[]) => void;
  onUpdateOrders: (updatedOrders: Order[]) => void;
}

export default function AdminDashboard({
  menu,
  orders,
  reviews,
  coupons,
  config,
  onUpdateMenu,
  onUpdateConfig,
  onUpdateReviews,
  onUpdateCoupons,
  onUpdateOrders
}: AdminDashboardProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'Stats' | 'Menu' | 'Orders' | 'Config' | 'Coupons' | 'Reviews' | 'Payments'>('Stats');

  // Payment Configuration States
  const [isTestMode, setIsTestMode] = useState(config.paymentSettings?.isTestMode ?? true);
  const [codMinOrderValue, setCodMinOrderValue] = useState(config.paymentSettings?.codMinOrderValue ?? 150);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>(
    config.paymentSettings?.gateways ?? []
  );

  // Sync state if prop changes
  useEffect(() => {
    if (config.paymentSettings) {
      setIsTestMode(config.paymentSettings.isTestMode);
      setCodMinOrderValue(config.paymentSettings.codMinOrderValue);
      setPaymentGateways(config.paymentSettings.gateways);
    }
  }, [config]);

  // Future autopay activation triggers state
  const [dailyTiffinBilling, setDailyTiffinBilling] = useState(true);
  const [weeklySubscriptionBilling, setWeeklySubscriptionBilling] = useState(true);
  const [monthlySubscriptionBilling, setMonthlySubscriptionBilling] = useState(true);
  const [automaticRenewal, setAutomaticRenewal] = useState(true);
  const [recurringPayments, setRecurringPayments] = useState(false);

  // Add custom gateway states
  const [newGatewayName, setNewGatewayName] = useState('');
  const [newGatewayInstructions, setNewGatewayInstructions] = useState('');
  const [newGatewayFee, setNewGatewayFee] = useState<number>(0);
  const [newGatewayFeeType, setNewGatewayFeeType] = useState<'percent' | 'fixed'>('percent');
  const [newGatewayApiKey, setNewGatewayApiKey] = useState('');
  const [newGatewaySecKey, setNewGatewaySecKey] = useState('');
  const [isAddingGateway, setIsAddingGateway] = useState(false);

  const [isPaymentSettingsSaving, setIsPaymentSettingsSaving] = useState(false);
  const [paymentSettingsSaveMsg, setPaymentSettingsSaveMsg] = useState('');

  // Main payment configuration save dispatcher
  const handleSavePaymentSettings = async (
    updatedGateways?: PaymentGateway[],
    updatedTestMode?: boolean,
    updatedCodVal?: number
  ) => {
    setIsPaymentSettingsSaving(true);
    setPaymentSettingsSaveMsg('');

    const targetGateways = updatedGateways ?? paymentGateways;
    const targetTestMode = updatedTestMode ?? isTestMode;
    const targetCod = updatedCodVal ?? codMinOrderValue;

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentSettings: {
            isTestMode: targetTestMode,
            codMinOrderValue: Number(targetCod),
            gateways: targetGateways
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateConfig(data.config);
        setPaymentSettingsSaveMsg("🎉 Payment configurations updated dynamically on backend database!");
        setTimeout(() => setPaymentSettingsSaveMsg(''), 5000);
      } else {
        setPaymentSettingsSaveMsg("❌ Server refused to compile payment config.");
      }
    } catch (err) {
      setPaymentSettingsSaveMsg("❌ Connection failed saving payment settings.");
    } finally {
      setIsPaymentSettingsSaving(false);
    }
  };

  // Stats Analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // Menu Modifiers Edit state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(150);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCat, setNewItemCat] = useState<MenuItem['category']>('Lunch');
  const [newItemImg, setNewItemImg] = useState('');
  const [newItemIsVeg, setNewItemIsVeg] = useState(true);
  const [newItemSpicy, setNewItemSpicy] = useState<MenuItem['spicyLevel']>('Medium');
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);

  // File upload trigger refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewItemImg(reader.result);
          setIsImagePickerOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Gemini load statuses
  const [isAIGeneratingDesc, setIsAIGeneratingDesc] = useState(false);
  const [aiPromptMsg, setAiPromptMsg] = useState('');

  // Config Update triggers
  const [configBrand, setConfigBrand] = useState(config.brandName);
  const [configPhone, setConfigPhone] = useState(config.mobileNumber);
  const [configEmail, setConfigEmail] = useState(config.email);
  const [configAddress, setConfigAddress] = useState(config.address);
  const [configPincodes, setConfigPincodes] = useState(config.allowedPincodes.join(', '));
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [configSaveMsg, setConfigSaveMsg] = useState('');

  // Coupon creator
  const [newCpCode, setNewCpCode] = useState('');
  const [newCpValue, setNewCpValue] = useState(15);
  const [newCpType, setNewCpType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCpMin, setNewCpMin] = useState(250);
  const [newCpDesc, setNewCpDesc] = useState('');
  const [cpError, setCpError] = useState('');

  // Review Replies drafting
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [reviewReplyDraft, setReviewReplyDraft] = useState('');
  const [isAIDraftingReply, setIsAIDraftingReply] = useState(false);

  // Load analytics
  const fetchAnalytics = async () => {
    setIsStatsLoading(true);
    try {
      const res = await fetch('/api/sales');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [orders, menu]);

  // Handle menu deletions
  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        onUpdateMenu(data.menu);
      }
    } catch (err) {
      alert("Error removing item.");
    }
  };

  // Drag-and-drop simulated button category reorderer
  const handleShiftItemIndex = async (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= menu.length) return;
    
    const reordered = [...menu];
    const temp = reordered[idx];
    reordered[idx] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    try {
      const res = await fetch('/api/menu/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu: reordered })
      });
      if (res.ok) {
        onUpdateMenu(reordered);
      }
    } catch (err) {
      console.error("Shift error:", err);
    }
  };

  // Gemini description builder
  const handleAIGenerateFoodDesc = async () => {
    if (!newItemName.trim()) {
      setAiPromptMsg("Please enter a food name first above so Gemini knows what to write about!");
      return;
    }
    setIsAIGeneratingDesc(true);
    setAiPromptMsg('');
    try {
      const res = await fetch('/api/gemini/suggest-desc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItemName,
          category: newItemCat,
          spicyLevel: newItemSpicy,
          isVeg: newItemIsVeg
        })
      });
      const data = await res.json();
      setNewItemDesc(data.text);
      setAiPromptMsg("AI description generated! Check input field below.");
    } catch (err) {
      setAiPromptMsg("Ai generator offline. Utilizing manual description.");
    } finally {
      setIsAIGeneratingDesc(false);
    }
  };

  // Menu submissions
  const handleMenuFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const payload = {
      name: newItemName.trim(),
      price: Number(newItemPrice),
      description: newItemDesc.trim() || `${newItemName} cooked fresh in Pune.`,
      category: newItemCat,
      image: newItemImg.trim() || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop',
      isAvailable: true,
      isVeg: newItemIsVeg,
      spicyLevel: newItemSpicy,
      rating: 4.8
    };

    try {
      let res;
      if (editingItem) {
        res = await fetch(`/api/menu/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const data = await res.json();
        onUpdateMenu(data.menu);
        // Clear fields
        setIsAddingNew(false);
        setEditingItem(null);
        setNewItemName('');
        setNewItemPrice(150);
        setNewItemDesc('');
        setNewItemImg('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Modify Config fields
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfigSaving(true);
    setConfigSaveMsg('');

    const parsedPincodes = configPincodes.split(',').map(p => p.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: configBrand,
          mobileNumber: configPhone,
          email: configEmail,
          address: configAddress,
          allowedPincodes: parsedPincodes
        })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateConfig(data.config);
        setConfigSaveMsg("Business settings configuration updated successfully on server.");
      }
    } catch (err) {
      setConfigSaveMsg("Connection issue with settings payload.");
    } finally {
      setIsConfigSaving(false);
    }
  };

  // Toggle order tracking status
  const handleToggleOrderStatus = async (orderId: string, status: Order['orderStatus']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Coupon manager callbacks
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCpError('');
    if (!newCpCode.trim() || !newCpDesc.trim()) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCpCode.toUpperCase().trim(),
          discountType: newCpType,
          discountValue: Number(newCpValue),
          minOrderValue: Number(newCpMin),
          description: newCpDesc.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        onUpdateCoupons(data.coupons);
        setNewCpCode('');
        setNewCpDesc('');
      } else {
        const errData = await res.json();
        setCpError(errData.error || 'Failed adding voucher.');
      }
    } catch (err) {
      setCpError("Server error.");
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      const res = await fetch(`/api/coupons/${code}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        onUpdateCoupons(data.coupons);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Gemini automated feedback response generator
  const handleDraftReviewReply = async (rev: Review) => {
    setActiveReviewId(rev.id);
    setReviewReplyDraft('');
    setIsAIDraftingReply(true);

    try {
      const res = await fetch('/api/gemini/reply-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: rev.name,
          rating: rev.rating,
          reviewComment: rev.comment
        })
      });
      const data = await res.json();
      setReviewReplyDraft(data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAIDraftingReply(false);
    }
  };

  const handlePublishReply = async (revId: string) => {
    try {
      const res = await fetch(`/api/reviews/${revId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText: reviewReplyDraft })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateReviews(data.reviews);
        setActiveReviewId(null);
        setReviewReplyDraft('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // physical Excel printable spreadsheet table exporter helper
  const handleExportCSV = () => {
    if (!analytics) return;
    
    // Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric,Value,Explanation\n";
    csvContent += `Total Revenue,₹${analytics.totalRevenue},Completed orders net income\n`;
    csvContent += `Completed Orders count,${analytics.totalCompletedOrders},Count of finalized accounts\n`;
    csvContent += `Pending Orders count,${analytics.totalPendingOrders},Active preparations\n`;
    csvContent += `Voucher Discounts Total,₹${analytics.totalDiscount},Subsidies applied\n\n`;

    csvContent += "Category Sales breakdown,Net Revenue\n";
    analytics.categoryData.forEach((row: any) => {
      csvContent += `${row.name},₹${row.value}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bhagwati_kitchen_sales_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recharts color palettes
  const COLORS = ['#EA580C', '#800020', '#D4AF37', '#059669', '#2563EB', '#D97706', '#DB2777'];

  return (
    <div className="min-h-[85vh] bg-neutral-100/60 rounded-3xl border border-neutral-200 overflow-hidden flex flex-col lg:flex-row">
      
      {/* Sidebar Rail Menu */}
      <div className="w-full lg:w-64 bg-red-950 text-white flex flex-col justify-between shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-1.5 pb-6 border-b border-white/10">
            <span className="w-3.5 h-3.5 bg-orange-500 rounded-full animate-pulse" />
            <span className="font-serif font-extrabold text-base tracking-wide">Owner Dashboard</span>
          </div>

          <nav className="space-y-1 mt-6">
            <button
              onClick={() => setActiveTab('Stats')}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'Stats' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" /> Executive Analytics
            </button>

            <button
              onClick={() => setActiveTab('Menu')}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'Menu' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <Plus className="w-4 h-4 text-amber-400" /> Manage Culinary Menu
            </button>

            <button
              onClick={() => setActiveTab('Orders')}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'Orders' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-amber-400" /> Incoming orders ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('Coupons')}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'Coupons' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <Ticket className="w-4 h-4 text-amber-400" /> Coupons & Discounts ({coupons.length})
            </button>

            <button
              onClick={() => setActiveTab('Reviews')}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'Reviews' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <Star className="w-4 h-4 text-amber-400" /> Reviews Approver ({reviews.length})
            </button>

            <button
              onClick={() => setActiveTab('Payments')}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'Payments' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-400" /> Payment Settings
            </button>

            <button
              onClick={() => setActiveTab('Config')}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'Config' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4 text-amber-400" /> Core Shop Settings
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-white/5 bg-black/10 text-[10px] text-neutral-400 font-sans tracking-wide">
          Logged in: Admin operator <br />
          {new Date().toLocaleDateString('en-IN')}
        </div>
      </div>

      {/* Main Panel Content Scroll frame */}
      <div className="flex-1 overflow-y-auto p-8 bg-neutral-50 max-h-[85vh]">
        
        {/* STATS ANALYTICS TAB */}
        {activeTab === 'Stats' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-serif font-extrabold text-neutral-900">Executive Sales Metrics</h2>
                <p className="text-xs text-neutral-500 font-sans">Corporate metrics computed automatically over real time database updates.</p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-xs font-extrabold border rounded-xl hover:bg-neutral-50 transition shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4 text-orange-600" /> Export to Excel (CSV)
                </button>
              </div>
            </div>

            {/* Quick Metrics grid cards */}
            {analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs relative overflow-hidden">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Consolidated Sales</span>
                  <span className="text-2xl font-extrabold text-red-950 font-serif mt-1 block">₹{analytics.totalRevenue.toLocaleString('en-IN')}</span>
                  <div className="absolute right-4 bottom-4 text-orange-200/50 font-serif text-5xl">₹</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Total Finalized Tickets</span>
                  <span className="text-2xl font-extrabold text-neutral-900 mt-1 block">{analytics.totalCompletedOrders} completed</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Active Preparations</span>
                  <span className="text-2xl font-extrabold text-amber-600 mt-1 block animate-pulse">{analytics.totalPendingOrders} pending</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Vouchers Claimed Value</span>
                  <span className="text-2xl font-extrabold text-[#059669] mt-1 block">₹{analytics.totalDiscount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-orange-600 mx-auto" />
                <p className="text-xs text-neutral-400 mt-2 font-sans">Calculating trends...</p>
              </div>
            )}

            {/* Charts block */}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Sale trends weekly line */}
                <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-neutral-900 border-b pb-3">7-Day Kitchen Order trends</h3>
                  <div className="w-full h-64 text-xs font-semibold">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.dailyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="sales" name="Revenue (₹)" stroke="#800020" strokeWidth={3} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category volume yields */}
                <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-neutral-900 border-b pb-3">Yield Share by Categories</h3>
                  <div className="w-full h-64 text-xs font-semibold">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.categoryData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Seller items */}
                <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-4 col-span-full">
                  <h3 className="text-sm font-bold text-neutral-900 border-b pb-3">Fastest-Moving Top 5 Culinary Recipes</h3>
                  <div className="w-full h-64 text-xs font-semibold">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.itemData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="qty" name="Quantum Quantity Purchased" fill="#EA580C" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="revenue" name="Net Yield Yielded (₹)" fill="#D4AF37" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* MANAGE CULINARY MENU (Add/Edit) */}
        {activeTab === 'Menu' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="text-2xl font-serif font-extrabold text-neutral-900">Manage Culinary Menu</h2>
                <p className="text-xs text-neutral-500 font-sans">Add, override listing details, adjust packaging labels and pricing tags here.</p>
              </div>

              {!isAddingNew && !editingItem && (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700 transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Culinary Recipe
                </button>
              )}
            </div>

            {/* Menu Form (Add/Modify items) with integrated AI Copywriter */}
            {(isAddingNew || editingItem) && (
              <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-serif font-bold text-neutral-900 text-lg">
                    {editingItem ? `Modify Recipe parameters: ${editingItem.name}` : 'Introduce New Delectable Recipe'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsAddingNew(false);
                      setEditingItem(null);
                    }}
                    className="text-xs text-neutral-400 hover:text-neutral-600 font-bold"
                  >
                    Cancel Action
                  </button>
                </div>

                <form onSubmit={handleMenuFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="text-xs font-bold text-neutral-600 block mb-1">Dish Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kashmiri Chole Kulche"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-600 block mb-1">Price (INR ₹)</label>
                      <input
                        type="number"
                        required
                        min={10}
                        max={10000}
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-600 block mb-1">Category Bracket</label>
                      <select
                        value={newItemCat}
                        onChange={(e) => setNewItemCat(e.target.value as MenuItem['category'])}
                        className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600"
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Daily Tiffin">Daily Tiffin</option>
                        <option value="Special Thali">Special Thali</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Beverages">Beverages</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
                    {/* Live interactive image custom changer with presets */}
                    <div className="sm:col-span-2 space-y-2">
                      <span className="text-xs font-bold text-neutral-600 block mb-1">Culinary Representation Image</span>
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200 relative">
                        {/* Instant live preview container thumbnail - Click to toggle custom picker overlay */}
                        <div 
                          id="image-representation-change-trigger"
                          onClick={() => setIsImagePickerOpen(!isImagePickerOpen)}
                          className="relative w-20 h-20 rounded-xl border-2 border-dashed border-neutral-300 hover:border-orange-500 bg-white overflow-hidden shrink-0 flex flex-col items-center justify-center shadow-xs group cursor-pointer transition-all duration-200 select-none"
                          title="Click to toggle visual image change options"
                        >
                          {newItemImg.trim() ? (
                            <>
                              <img
                                key={newItemImg}
                                src={newItemImg.trim()}
                                alt="Food Represent"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).onerror = null;
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white p-1 text-center">
                                <Camera className="w-4 h-4 text-orange-400 mb-0.5" />
                                <span className="text-[8px] font-extrabold uppercase tracking-wider leading-none">Change</span>
                              </div>
                            </>
                          ) : (
                            <div className="p-1.5 text-center space-y-1">
                              <Camera className="w-4 h-4 text-neutral-400 mx-auto" />
                              <span className="text-[9px] text-neutral-500 font-bold leading-normal block">Tap to Select</span>
                            </div>
                          )}
                        </div>

                        {/* Dropdown Popup selection panel */}
                        {isImagePickerOpen && (
                          <div className="absolute left-4 top-28 bg-white border border-neutral-200 shadow-2xl rounded-3xl p-4 z-50 w-72 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                            <div className="flex justify-between items-center border-b pb-1.5">
                              <span className="text-[11px] font-serif font-black text-neutral-800 flex items-center gap-1">
                                <Image className="w-3.5 h-3.5 text-orange-600" /> Change Image Option
                              </span>
                              <button 
                                type="button" 
                                onClick={() => setIsImagePickerOpen(false)}
                                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="space-y-2.5 text-left">
                              {/* Option A: Paste exact link directly */}
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-neutral-500 block">Direct URL Address</span>
                                <input 
                                  type="text" 
                                  placeholder="Paste any food image link..." 
                                  value={newItemImg}
                                  onChange={(e) => setNewItemImg(e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 font-semibold bg-white"
                                />
                              </div>

                              {/* Option B: Real Local Device File Selection */}
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-neutral-500 block">Personal device folder</span>
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleDeviceImageUpload}
                                  accept="image/*"
                                  className="hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="w-full p-2 border border-[#800020]/30 hover:border-[#800020] rounded-xl text-center text-xs font-bold bg-[#800020]/5 text-[#800020] hover:bg-[#800020]/10 transition flex items-center justify-center gap-1.5 cursor-pointer py-2"
                                  title="Upload from Device"
                                >
                                  <Upload className="w-3.5 h-3.5 shrink-0" />
                                  <span>Upload from Device 📁</span>
                                </button>
                              </div>

                              {/* Option C: Direct Quick Presets select container */}
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-neutral-500 block">Select Culinary Preset</span>
                                <div className="grid grid-cols-2 gap-1 max-h-[120px] overflow-y-auto pr-0.5">
                                  {[
                                    { name: 'Special Thali 🍛', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop' },
                                    { name: 'Chole Bhature 🥖', url: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop' },
                                    { name: 'Biryani Platter 🍚', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop' },
                                    { name: 'Pure Veg Curry 🍲', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop' },
                                    { name: 'Warm Roti Basket 🫓', url: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=600&auto=format&fit=crop' },
                                    { name: 'Samosa & Snacks 🥟', url: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop' },
                                    { name: 'Mango Lassi Drink 🥛', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop' },
                                    { name: 'Fresh Salad 🥗', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop' }
                                  ].map((preset) => (
                                    <button
                                      key={preset.name}
                                      type="button"
                                      onClick={() => {
                                        setNewItemImg(preset.url);
                                        setIsImagePickerOpen(false);
                                      }}
                                      className="flex items-center gap-1.5 p-1 border rounded-lg text-[9px] font-bold shrink-0 transition text-left cursor-pointer bg-neutral-50 hover:bg-neutral-100"
                                    >
                                      <img src={preset.url} alt="" className="w-3.5 h-3.5 rounded object-cover" />
                                      <span className="truncate">{preset.name}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <button 
                              type="button"
                              onClick={() => setIsImagePickerOpen(false)}
                              className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[9px] rounded-xl tracking-wider uppercase transition cursor-pointer"
                            >
                              Apply Image
                            </button>
                          </div>
                        )}

                        {/* Paste Custom or Pick Quick presets */}
                        <div className="flex-1 w-full space-y-2">
                          <div className="flex gap-2">
                            <input
                              id="custom-image-url-input"
                              type="text"
                              placeholder="Paste any custom direct web/Unsplash food image URL here..."
                              value={newItemImg}
                              onChange={(e) => setNewItemImg(e.target.value)}
                              className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 font-semibold bg-white"
                            />
                            {newItemImg && (
                              <button
                                type="button"
                                onClick={() => setNewItemImg('')}
                                className="px-3 py-1.5 text-xs border rounded-xl bg-white hover:bg-neutral-100 text-neutral-500 font-bold shrink-0 cursor-pointer transition"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="text-[10.5px] text-neutral-500 font-bold tracking-tight">Or tap to choose from handpicked traditional premium visuals:</div>

                          {/* Preset horizontal picker */}
                          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full scrollbar-thin scrollbar-thumb-neutral-200">
                            {[
                              { name: 'Special Thali 🍛', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop' },
                              { name: 'Chole Bhature 🥖', url: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop' },
                              { name: 'Biryani Platter 🍚', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop' },
                              { name: 'Pure Veg Curry 🍲', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop' },
                              { name: 'Warm Roti Basket 🫓', url: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=600&auto=format&fit=crop' },
                              { name: 'Samosa & Snacks 🥟', url: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop' },
                              { name: 'Mango Lassi Drink 🥛', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop' },
                              { name: 'Fresh Green Salad 🥗', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop' }
                            ].map((preset) => {
                              const isActive = newItemImg === preset.url;
                              return (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => setNewItemImg(preset.url)}
                                  className={`flex items-center gap-1.5 p-1 px-2.5 rounded-xl border text-[10px] font-bold shrink-0 transition cursor-pointer ${
                                    isActive 
                                      ? 'bg-orange-600 border-orange-600 text-white shadow-md font-extrabold scale-95' 
                                      : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
                                  }`}
                                >
                                  <img
                                    src={preset.url}
                                    alt={preset.name}
                                    referrerPolicy="no-referrer"
                                    className="w-4 h-4 rounded-md object-cover shrink-0"
                                  />
                                  <span className="whitespace-nowrap">{preset.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Veg and spice category parameters */}
                    <div className="space-y-3 bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200 h-full flex flex-col justify-center">
                      <div>
                        <span className="text-xs font-bold text-neutral-600 block mb-1.5">Dietary Standard</span>
                        <label className="text-xs font-bold text-emerald-800 flex items-center gap-2 cursor-pointer bg-white p-2 border rounded-xl hover:bg-neutral-50 select-none">
                          <input
                            type="checkbox"
                            checked={newItemIsVeg}
                            onChange={() => setNewItemIsVeg(!newItemIsVeg)}
                            className="w-4 h-4 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-500 cursor-pointer"
                          />
                          <span>100% Pure Vegetarian</span>
                        </label>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-neutral-600 block mb-1">Spicy Tolerance Pack</span>
                        <select
                          value={newItemSpicy}
                          onChange={(e) => setNewItemSpicy(e.target.value as MenuItem['spicyLevel'])}
                          className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white cursor-pointer font-semibold text-neutral-700"
                        >
                          <option value="Mild">Mild Spices 🌶️</option>
                          <option value="Medium">Medium Standard 🌶️🌶️</option>
                          <option value="Hot">Kolhapuri Hot 🌶️🌶️🌶️</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Gemini integration and Description block */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-neutral-600 block mb-1">Dish Description</label>
                      <textarea
                        rows={3.5}
                        placeholder="Give a delectable explanation of fresh ingredients used, preparation guidelines, and serving accompaniments..."
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                        className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 font-sans"
                      />
                    </div>

                    <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-200">
                      <p className="text-[10px] uppercase tracking-widest font-extrabold text-orange-850 flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" /> Generative AI Copilot
                      </p>
                      <p className="text-[10.5px] text-neutral-500 mb-2 leading-tight">Gemini can analyze the name & category to draft flavor descriptions automatically.</p>
                      <button
                        type="button"
                        onClick={handleAIGenerateFoodDesc}
                        disabled={isAIGeneratingDesc}
                        className="w-full py-2 px-3 bg-red-950 font-bold text-[11px] text-white rounded-xl hover:bg-orange-600 transition disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                      >
                        {isAIGeneratingDesc ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Drafting descriptions...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Draft with Google Gemini</span>
                          </>
                        )}
                      </button>
                      {aiPromptMsg && <p className="text-[10px] text-orange-700 font-bold mt-1.5 leading-tight">{aiPromptMsg}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700 transition cursor-pointer shadow-xs"
                    >
                      {editingItem ? 'Publish Updates' : 'Add Dish to Menu'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNew(false);
                        setEditingItem(null);
                      }}
                      className="px-5 py-2.5 bg-neutral-100 text-neutral-600 font-bold text-xs border rounded-xl hover:bg-neutral-200 transition cursor-pointer"
                    >
                      Abandon changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Simulated drag/drop item rows listing */}
            <div className="bg-white rounded-3xl border border-neutral-200/60 shadow-xs overflow-hidden">
              <div className="p-4 bg-neutral-50 text-xs font-bold text-neutral-600 uppercase border-b tracking-wider">
                Current Kitchen Offerings Category Listings ({menu.length} Items)
              </div>

              <div id="admin-menu-list-container" className="divide-y divide-neutral-100 max-h-[110vh] overflow-y-auto">
                {menu.map((item, index) => (
                  <div key={item.id} className="flex gap-4 p-4 hover:bg-neutral-50 transition justify-between items-center text-xs">
                    
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-xl shrink-0 border"
                    />

                    {/* Meta info details */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-neutral-900 text-sm">{item.name}</span>
                        <span className="bg-neutral-100 px-2 py-0.5 rounded-md text-[10px] text-neutral-500 font-sans font-bold uppercase">
                          {item.category}
                        </span>
                        {item.isVeg && (
                          <span className="w-2.5 h-2.5 rounded-full bg-green-700 inline-block border border-white" title="Veg Verified" />
                        )}
                      </div>
                      <p className="text-neutral-500 truncate mt-0.5 font-sans leading-none">{item.description}</p>
                    </div>

                    {/* Numeric Value details */}
                    <div className="shrink-0 text-right pr-4 font-mono font-bold text-[#800020]">
                      ₹{item.price}
                    </div>

                    {/* Up/Down index order controls */}
                    <div className="flex gap-1 shrink-0 bg-neutral-100 p-1.5 rounded-xl border">
                      <button
                        title="Move Up"
                        disabled={index === 0}
                        onClick={() => handleShiftItemIndex(index, 'up')}
                        className="p-1 hover:bg-white text-neutral-600 disabled:opacity-20 rounded-lg cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Move Down"
                        disabled={index === menu.length - 1}
                        onClick={() => handleShiftItemIndex(index, 'down')}
                        className="p-1 hover:bg-white text-neutral-600 disabled:opacity-20 rounded-lg cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Editing adjustments operations */}
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setNewItemName(item.name);
                          setNewItemPrice(item.price);
                          setNewItemDesc(item.description);
                          setNewItemCat(item.category);
                          setNewItemImg(item.image);
                          setNewItemIsVeg(item.isVeg);
                          setNewItemSpicy(item.spicyLevel || 'Medium');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="p-2 bg-neutral-100 hover:bg-orange-50 text-neutral-600 hover:text-orange-700 rounded-xl transition cursor-pointer"
                        title="Edit params"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 bg-neutral-100 hover:bg-red-50 text-neutral-400 hover:text-red-700 rounded-xl transition cursor-pointer"
                        title="Remove dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INCOMING ORDERS MANAGEMENT */}
        {activeTab === 'Orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-extrabold text-neutral-900">Incoming & Active Orders</h2>
              <p className="text-xs text-neutral-500 font-sans">Toggle live tracing statuses and delivery times. Order tracking pages will synchronize dynamically.</p>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-200/60 overflow-hidden shadow-xs">
              <div className="p-4 bg-neutral-50 text-xs font-bold text-neutral-600 uppercase border-b tracking-wider flex justify-between items-center">
                <span>Active Tracing Queue ({orders.length} tickets)</span>
                <span className="text-[10px] lowercase text-neutral-400 font-normal">automatically synchronized</span>
              </div>

              <div className="divide-y divide-neutral-100">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-6 hover:bg-neutral-50 transition space-y-4">
                    
                    {/* Customer overview details */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm">
                          Order Ticket: <span className="font-mono text-red-950">TRK-{ord.id}</span>
                        </h4>
                        <span className="text-xs text-neutral-500">
                          Buyer: <strong>{ord.customerName}</strong> ({ord.customerMobile}) • {new Date(ord.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Status selectors */}
                      <div className="flex gap-1.5 flex-wrap">
                        {['Placed', 'Preparing', 'OutForDelivery', 'Delivered', 'Cancelled'].map((st: any) => (
                          <button
                            key={st}
                            onClick={() => handleToggleOrderStatus(ord.id, st)}
                            className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg border transition cursor-pointer ${
                              ord.orderStatus === st
                                ? 'bg-red-950 text-white border-red-950 shadow-xs'
                                : 'bg-white text-neutral-600 hover:bg-neutral-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-50/70 border rounded-2xl flex flex-col sm:flex-row justify-between text-xs gap-4 font-sans">
                      <div className="space-y-1">
                        <p className="font-bold text-neutral-700">Delivery Address:</p>
                        <p className="text-neutral-600">{ord.deliveryAddress} ({ord.pincode})</p>
                        {ord.notes && (
                          <p className="italic text-orange-700 font-semibold mt-1">Cooking directions: &ldquo;{ord.notes}&rdquo;</p>
                        )}
                        {ord.deliverySlot && (
                          <p className="text-neutral-800 mt-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-orange-600 inline" />
                            <strong>Slot Preference:</strong> 
                            <span className="bg-orange-100 text-orange-950 border border-orange-200 text-[10px] px-2 py-0.5 rounded-md font-bold">
                              {ord.deliverySlot}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-neutral-700">Financial Summary:</p>
                        <p className="text-neutral-600">Items subtotal: ₹{ord.totalAmount - ord.deliveryCharge} ({ord.paymentMethod})</p>
                        <p className="font-extrabold text-red-950">Total charged: ₹{ord.totalAmount}</p>
                      </div>
                    </div>

                    {/* Specific ordered item subsets */}
                    <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-sans">
                      {ord.items.map((item, index) => (
                        <span key={index} className="px-2.5 py-1.5 bg-neutral-100 text-neutral-700 font-bold rounded-lg border border-neutral-200">
                          {item.name} x {item.quantity}
                        </span>
                      ))}
                    </div>

                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="text-center py-16 text-neutral-400 font-medium">No order tickets currently queued.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CORE DISCOUNTS & COUPON MANAGER */}
        {activeTab === 'Coupons' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Insert coupon form */}
              <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-neutral-900 border-b pb-3 flex items-center gap-1">
                  <Ticket className="w-5 h-5 text-orange-600" /> Create Coupon Voucher
                </h3>

                <form onSubmit={handleAddCoupon} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="text-xs font-bold text-neutral-600 block mb-1">Coupon Code (Alphanumeric uppercase)</label>
                    <input
                      type="text"
                      required
                      placeholder="EX: Monsoon20"
                      value={newCpCode}
                      onChange={(e) => setNewCpCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-600 uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-neutral-600 block mb-1">Discount Value</label>
                      <input
                        type="number"
                        required
                        value={newCpValue}
                        onChange={(e) => setNewCpValue(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-600 block mb-1">Discount Type</label>
                      <select
                        value={newCpType}
                        onChange={(e) => setNewCpType(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded-xl bg-white"
                      >
                        <option value="percentage">Percentage OFF (%)</option>
                        <option value="fixed">Fixed Cash OFF (₹)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-600 block mb-1">Minimum Order Requirement (₹)</label>
                    <input
                      type="number"
                      required
                      value={newCpMin}
                      onChange={(e) => setNewCpMin(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-600 block mb-1">Human Description</label>
                    <input
                      type="text"
                      required
                      placeholder="EX: Get ₹150 OFF on orders above ₹499"
                      value={newCpDesc}
                      onChange={(e) => setNewCpDesc(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  {cpError && <p className="text-red-700 font-bold bg-red-100 p-2 rounded-lg">{cpError}</p>}

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-white bg-red-950 hover:bg-orange-600 transition cursor-pointer"
                  >
                    Generate Discount Code
                  </button>
                </form>
              </div>

              {/* Coupon tables list */}
              <div className="bg-white border rounded-3xl p-6 shadow-xs col-span-2 space-y-4">
                <h3 className="font-serif font-bold text-neutral-900 border-b pb-3">Active Promotional Vouchers</h3>
                
                <div className="divide-y divide-neutral-100">
                  {coupons.map((cp) => (
                    <div key={cp.code} className="flex py-3 justify-between items-center text-xs">
                      <div>
                        <span className="font-extrabold text-sm px-2.5 py-1 rounded-md bg-neutral-100 border text-neutral-800 font-mono">
                          {cp.code}
                        </span>
                        <p className="text-neutral-500 font-sans mt-2">{cp.description}</p>
                        <span className="text-[10px] text-neutral-400 block mt-1">Requires ₹{cp.minOrderValue} min purchase values</span>
                      </div>

                      <button
                        onClick={() => handleDeleteCoupon(cp.code)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg shrink-0 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* REVIEWS APPROVER TAB & AI REPLY DRAFTER */}
        {activeTab === 'Reviews' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-extrabold text-neutral-900">Manage Customer Feedback</h2>
              <p className="text-xs text-neutral-500 font-sans">Approve, deny, or compose warm professional responses to customer testimonials instantly using Google Gemini.</p>
            </div>

            <div className="divide-y divide-neutral-200 border rounded-3xl bg-white shadow-xs overflow-hidden">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">{rev.name}</h4>
                      <div className="flex gap-0.5 text-amber-500 mt-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-sans font-medium">
                      Date: {new Date(rev.date).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed font-sans italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* AI drafting tool */}
                  <div className="bg-neutral-50 p-4 rounded-2xl border flex flex-col md:flex-row gap-4 justify-between items-stretch">
                    <div className="flex-1 space-y-2">
                      <p className="text-[10px] uppercase font-extrabold text-neutral-400 tracking-wider flex items-center gap-1.5">
                        <MessageSquareCode className="w-4 h-4 text-orange-600" /> Executive AI Respondent
                      </p>
                      
                      {activeReviewId === rev.id ? (
                        <div className="space-y-3">
                          <textarea
                            rows={3}
                            value={reviewReplyDraft}
                            onChange={(e) => setReviewReplyDraft(e.target.value)}
                            className="w-full p-2.5 text-xs bg-white border rounded-xl focus:ring-1 focus:ring-orange-600 focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePublishReply(rev.id)}
                              className="px-4 py-1.5 bg-red-950 font-bold text-[10px] text-white rounded-lg hover:bg-orange-600 transition"
                            >
                              Publish Response Reply
                            </button>
                            <button
                              onClick={() => {
                                setActiveReviewId(null);
                                setReviewReplyDraft('');
                              }}
                              className="px-4 py-1.5 bg-neutral-200 font-bold text-[10px] text-neutral-700 rounded-lg"
                            >
                              Discard Reply
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-500 leading-relaxed">
                          {rev.replyText ? `Replied: "${rev.replyText}"` : 'No response draft composed yet. Press compose parameters to use Google Gemini AI.'}
                        </p>
                      )}
                    </div>

                    {activeReviewId !== rev.id && (
                      <button
                        type="button"
                        onClick={() => handleDraftReviewReply(rev)}
                        disabled={isAIDraftingReply}
                        className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-extrabold text-[11px] rounded-xl cursor-pointer shadow-xs shrink-0 self-center"
                      >
                        {isAIDraftingReply ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Framing reply...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300" /> Compose AI Reply
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAYMENT DYNAMIC MANAGEMENT WORKSPACE */}
        {activeTab === 'Payments' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header section card */}
            <div className="bg-red-950 text-white p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div>
                <span className="bg-amber-400 text-red-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">Secure Payments Hub</span>
                <h2 className="text-3xl font-serif font-black mt-2 leading-tight">Future-Proof Payment Management</h2>
                <p className="text-xs text-neutral-300 font-sans mt-1 max-w-lg leading-relaxed">
                  Toggle, add, or configure checkout gateways, change credentials, switch live/test modes, set COD thresholds, and monitor electronic records.
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl shrink-0 self-start md:self-auto">
                <span className="text-xs font-bold font-sans">Gateway Mode:</span>
                <button
                  onClick={() => {
                    const nextMode = !isTestMode;
                    setIsTestMode(nextMode);
                    handleSavePaymentSettings(undefined, nextMode);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold font-mono text-xs shadow-sm cursor-pointer transition ${
                    isTestMode 
                      ? 'bg-amber-400 text-slate-900 border border-amber-300' 
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isTestMode ? "⚠️ TEST MODE (SANDBOX)" : "🚀 LIVE PRODUCTION"}
                </button>
              </div>
            </div>

            {/* Error or Success notification flash banners */}
            {paymentSettingsSaveMsg && (
              <div className={`p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm flex items-center gap-2 ${
                paymentSettingsSaveMsg.includes('❌') 
                  ? 'bg-red-100 border border-red-200 text-red-800' 
                  : 'bg-emerald-100 border border-emerald-350 text-emerald-850 animate-pulse'
              }`}>
                <span>{paymentSettingsSaveMsg}</span>
              </div>
            )}

            {/* Quick Summary Widgets Group */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border rounded-2xl p-5 shadow-xs">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Revenue Flow</p>
                <p className="text-2xl font-serif font-black text-neutral-900 mt-1">₹{analytics?.totalRevenue ?? orders.filter(o => o.paymentStatus === 'Completed').reduce((sum, o) => sum + o.totalAmount, 0)}</p>
                <span className="text-[10px] font-medium text-emerald-600 block mt-1">● Settled securely</span>
              </div>
              <div className="bg-white border rounded-2xl p-5 shadow-xs">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Recurring Auto-Pay Revenue</p>
                <p className="text-2xl font-serif font-black text-[#800020] mt-1">₹{analytics?.subscriptionRevenue ?? 0}</p>
                <span className="text-[10px] font-medium text-amber-600 block mt-1">● Tiffin subscription pools</span>
              </div>
              <div className="bg-white border rounded-2xl p-5 shadow-xs">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Completed Gateway Sales</p>
                <p className="text-2xl font-serif font-black text-emerald-700 mt-1">{analytics?.successfulPaymentsCount ?? orders.filter(o => o.paymentStatus === 'Completed').length} orders</p>
                <span className="text-[10px] font-medium text-neutral-500 block mt-1">{analytics?.failedPaymentsCount ?? orders.filter(o => o.paymentStatus === 'Failed').length} failures tracked</span>
              </div>
              <div className="bg-white border rounded-2xl p-5 shadow-xs">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">GST Audit Pool (5%)</p>
                <p className="text-2xl font-serif font-black text-orange-600 mt-1">₹{analytics?.totalGstCollected ?? 0}</p>
                <span className="text-[10px] font-medium text-neutral-500 block mt-1">Standard state tax levy</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Gateways listing configuration */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Active Payment Gateways segment */}
                <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="text-base font-serif font-black text-neutral-900">Supported Checkout Gateways</h3>
                      <p className="text-[10px] text-neutral-500 font-sans">List of active customer choosing systems and their settings API keys.</p>
                    </div>
                    {/* Add custom gateway activator */}
                    <button
                      onClick={() => setIsAddingGateway(!isAddingGateway)}
                      className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-[11px] cursor-pointer transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Gateway
                    </button>
                  </div>

                  {/* Add dynamic gateway form slider */}
                  {isAddingGateway && (
                    <div className="p-4 bg-orange-50/20 border border-orange-200/50 rounded-2xl space-y-4 text-xs font-sans">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-orange-800">Configure Future API Expansion Gateway</span>
                        <button onClick={() => setIsAddingGateway(false)} className="text-neutral-400 hover:text-neutral-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="font-bold text-neutral-600 block mb-1">Gateway Provider Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Stripe, PayPal, PayU"
                            value={newGatewayName}
                            onChange={e => setNewGatewayName(e.target.value)}
                            className="w-full border p-2.5 rounded-xl outline-hidden focus:border-orange-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-neutral-600 block mb-1">API Key / Merchant Token</label>
                          <input
                            type="text"
                            placeholder="e.g. pk_test_xxxx"
                            value={newGatewayApiKey}
                            onChange={e => setNewGatewayApiKey(e.target.value)}
                            className="w-full border p-2.5 rounded-xl outline-hidden focus:border-orange-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-neutral-600 block mb-1">API Secret / Auth Token</label>
                          <input
                            type="password"
                            placeholder="e.g. sk_test_xxxx"
                            value={newGatewaySecKey}
                            onChange={e => setNewGatewaySecKey(e.target.value)}
                            className="w-full border p-2.5 rounded-xl outline-hidden focus:border-orange-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-neutral-600 block mb-1">Surcharge adjustment (Extra Fee/Discount)</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="e.g. 2.5 or -10"
                              value={newGatewayFee}
                              onChange={e => setNewGatewayFee(Number(e.target.value))}
                              className="w-24 border p-2.5 rounded-xl outline-hidden focus:border-orange-500 text-xs"
                            />
                            <select
                              value={newGatewayFeeType}
                              onChange={e => setNewGatewayFeeType(e.target.value as 'percent' | 'fixed')}
                              className="border p-2.5 rounded-xl outline-hidden focus:border-orange-500 text-xs flex-1"
                            >
                              <option value="percent">Percentage Fee (%)</option>
                              <option value="fixed">Fixed Charge (₹)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="font-bold text-neutral-600 block mb-1">Custom Checkout Display Instructions</label>
                        <textarea
                          rows={2}
                          placeholder="Displayed to the customer upon checkout selection..."
                          value={newGatewayInstructions}
                          onChange={e => setNewGatewayInstructions(e.target.value)}
                          className="w-full border p-2.5 rounded-xl outline-hidden focus:border-orange-500 text-xs"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (!newGatewayName.trim()) {
                            alert("Please supply a valid gateway provider name.");
                            return;
                          }
                          const newId = newGatewayName.toLowerCase().replace(/[^a-z0-9]/g, '_');
                          const dupe = paymentGateways.some(g => g.id === newId);
                          if (dupe) {
                            alert("A payment method with this name already exists.");
                            return;
                          }
                          const added: PaymentGateway = {
                            id: newId,
                            name: newGatewayName.trim(),
                            isEnabled: true,
                            apiKey: newGatewayApiKey.trim() || undefined,
                            apiSecret: newGatewaySecKey.trim() || undefined,
                            isCustomInstructionsEnabled: true,
                            instructions: newGatewayInstructions.trim() || undefined,
                            extraChargePercentOrFixed: newGatewayFee || undefined,
                            extraChargeType: newGatewayFee ? newGatewayFeeType : undefined,
                            isCustom: true
                          };
                          const updated = [...paymentGateways, added];
                          setPaymentGateways(updated);
                          handleSavePaymentSettings(updated);
                          // Clear states
                          setNewGatewayName('');
                          setNewGatewayApiKey('');
                          setNewGatewaySecKey('');
                          setNewGatewayInstructions('');
                          setNewGatewayFee(0);
                          setIsAddingGateway(false);
                        }}
                        className="py-2.5 px-6 rounded-xl bg-green-700 text-white font-bold hover:bg-green-805 transition cursor-pointer"
                      >
                        🚀 Deploy Custom Gateway
                      </button>
                    </div>
                  )}

                  {/* Gateways listing loop and edit dashboard */}
                  <div className="space-y-4">
                    {paymentGateways.map((gate, i) => {
                      return (
                        <div key={gate.id} className="border border-neutral-100 rounded-2xl p-5 hover:bg-neutral-50/50 transition">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${gate.isEnabled ? 'bg-emerald-600 animate-pulse' : 'bg-neutral-300'}`} />
                                <h4 className="text-sm font-black text-neutral-800">{gate.name}</h4>
                                {gate.isCustom && (
                                  <span className="px-1 py-0.2 bg-purple-100 border border-purple-200 text-purple-800 text-[8px] font-black uppercase rounded">
                                    Custom Appended
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">ID: {gate.id}</p>
                            </div>

                            {/* One Click Toggles & Removers */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  // toggle isEnabled
                                  const updated = paymentGateways.map((g, idx) => 
                                    idx === i ? { ...g, isEnabled: !g.isEnabled } : g
                                  );
                                  setPaymentGateways(updated);
                                  handleSavePaymentSettings(updated);
                                }}
                                className={`px-3 py-1.5 rounded-xl font-bold font-sans text-[10px] uppercase cursor-pointer transition ${
                                  gate.isEnabled 
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
                                    : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                                }`}
                              >
                                {gate.isEnabled ? "🟢 Enabled" : "🔴 Disabled"}
                              </button>

                              {gate.isCustom && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Remove custom gateway ${gate.name} permanently?`)) {
                                      const updated = paymentGateways.filter(g => g.id !== gate.id);
                                      setPaymentGateways(updated);
                                      handleSavePaymentSettings(updated);
                                    }
                                  }}
                                  className="p-1.5 text-neutral-400 hover:text-red-700 rounded-lg hover:bg-red-50 cursor-pointer transition"
                                  title="Remove Gateway"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Gateway settings fields inside drawer */}
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
                            {/* Key credentials */}
                            <div className="space-y-2 text-xs">
                              <div>
                                <label className="text-[10px] font-bold text-neutral-500 block">Gateway Client Key / MID</label>
                                <input
                                  type="text"
                                  value={gate.apiKey ?? ''}
                                  placeholder="N/A (Uses secure system defaults)"
                                  onChange={e => {
                                    const val = e.target.value;
                                    const updated = paymentGateways.map((g, idx) => 
                                      idx === i ? { ...g, apiKey: val || undefined } : g
                                    );
                                    setPaymentGateways(updated);
                                  }}
                                  className="w-full border p-2 rounded-xl text-[11px] outline-hidden focus:border-orange-500 mt-1 font-mono"
                                />
                              </div>
                              {gate.id !== 'cod' && (
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-500 block">Client Secret / Salt Key</label>
                                  <input
                                    type="password"
                                    value={gate.apiSecret ?? ''}
                                    placeholder="••••••••••••••"
                                    onChange={e => {
                                      const val = e.target.value;
                                      const updated = paymentGateways.map((g, idx) => 
                                        idx === i ? { ...g, apiSecret: val || undefined } : g
                                      );
                                      setPaymentGateways(updated);
                                    }}
                                    className="w-full border p-2 rounded-xl text-[11px] outline-hidden focus:border-orange-500 mt-1 font-mono"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Adjustment fees / discount rates */}
                            <div className="space-y-2 text-xs">
                              <label className="text-[10px] font-bold text-neutral-500 block mb-1">Extra Fee (+) or Discount (-)</label>
                              <div className="flex gap-1.5">
                                <input
                                  type="number"
                                  value={gate.extraChargePercentOrFixed ?? 0}
                                  placeholder="0.00"
                                  onChange={e => {
                                    const val = Number(e.target.value);
                                    const updated = paymentGateways.map((g, idx) => 
                                      idx === i ? { ...g, extraChargePercentOrFixed: val } : g
                                    );
                                    setPaymentGateways(updated);
                                  }}
                                  className="w-20 border p-2 rounded-xl text-[11px] outline-hidden focus:border-orange-500 font-bold"
                                />
                                <select
                                  value={gate.extraChargeType ?? 'percent'}
                                  onChange={e => {
                                    const val = e.target.value as 'percent' | 'fixed';
                                    const updated = paymentGateways.map((g, idx) => 
                                      idx === i ? { ...g, extraChargeType: val } : g
                                    );
                                    setPaymentGateways(updated);
                                  }}
                                  className="border p-1.5 rounded-xl text-[11px] outline-hidden focus:border-orange-500 flex-1"
                                >
                                  <option value="percent">% of Subtotal</option>
                                  <option value="fixed">Flat Cost (₹)</option>
                                </select>
                              </div>
                              <span className="text-[9px] text-neutral-400 block leading-tight">
                                {gate.extraChargePercentOrFixed && gate.extraChargePercentOrFixed < 0 
                                  ? `Provides ₹${Math.abs(gate.extraChargePercentOrFixed)}${gate.extraChargeType === 'percent' ? '%' : ''} checkout discount.` 
                                  : gate.extraChargePercentOrFixed && gate.extraChargePercentOrFixed > 0 
                                    ? `Charges ₹${gate.extraChargePercentOrFixed}${gate.extraChargeType === 'percent' ? '%' : ''} handling fee.` 
                                    : "No surcharge or discounts applied."}
                              </span>
                            </div>

                            {/* Step custom checkout instructions */}
                            <div className="space-y-1.5 text-xs">
                              <label className="text-[10px] font-bold text-neutral-500 block">Checkout Display Instructions</label>
                              <textarea
                                rows={3}
                                value={gate.instructions ?? ''}
                                placeholder="Custom client instructions standard text..."
                                onChange={e => {
                                  const val = e.target.value;
                                  const updated = paymentGateways.map((g, idx) => 
                                    idx === i ? { ...g, instructions: val || undefined } : g
                                  );
                                  setPaymentGateways(updated);
                                }}
                                className="w-full border p-2 rounded-xl text-[11px] outline-hidden focus:border-orange-500 leading-normal font-sans"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* General save indicator */}
                  <div className="mt-5 border-t pt-5 flex justify-end">
                    <button
                      onClick={() => handleSavePaymentSettings()}
                      disabled={isPaymentSettingsSaving}
                      className="px-6 py-3 bg-red-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-2xl cursor-pointer transition shadow-md inline-flex items-center gap-2"
                    >
                      {isPaymentSettingsSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      💾 Save Dynamic Payment configurations
                    </button>
                  </div>
                </div>

                {/* Future recurring billing plans & Subscription auto-pay Controls */}
                <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-base font-serif font-black text-neutral-900">Subscription & Auto-Billing (Sandbox Status)</h3>
                    <p className="text-[10px] text-neutral-500 font-sans">Set eligibility flags for Auto-Bill recurring cycles of culinary plans.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="flex items-center justify-between p-3.5 border rounded-2xl bg-neutral-50">
                      <div>
                        <span className="font-bold text-neutral-700 block">Daily Tiffin Auto-Billing</span>
                        <span className="text-[9px] text-neutral-400">Triggers auto bill cycles daily</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={dailyTiffinBilling}
                        onChange={e => setDailyTiffinBilling(e.target.checked)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3.5 border rounded-2xl bg-neutral-50">
                      <div>
                        <span className="font-bold text-neutral-700 block">Weekly Subscription Cycles</span>
                        <span className="text-[9px] text-neutral-400">Standard 7 day invoice routing</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={weeklySubscriptionBilling}
                        onChange={e => setWeeklySubscriptionBilling(e.target.checked)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3.5 border rounded-2xl bg-neutral-50">
                      <div>
                        <span className="font-bold text-neutral-700 block">Monthly Auto-Invoicing</span>
                        <span className="text-[9px] text-neutral-400">Dispatches monthly elite statements</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={monthlySubscriptionBilling}
                        onChange={e => setMonthlySubscriptionBilling(e.target.checked)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3.5 border rounded-2xl bg-neutral-50">
                      <div>
                        <span className="font-bold text-neutral-700 block">Automatic Recurring Renewals</span>
                        <span className="text-[9px] text-neutral-400">Card tokenized recurring hits</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={automaticRenewal}
                        onChange={e => setAutomaticRenewal(e.target.checked)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-2xl text-[10px] leading-relaxed flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-700" />
                    <span><strong>Pre-Flight Certified</strong>: Ready for Stripe AutoPay recurring billing modules. Toggles represent future launch states.</span>
                  </div>
                </div>

              </div>

              {/* Right Col: COD Safeguards and PCI Compliance Reports */}
              <div className="space-y-6">

                {/* Cash on Delivery threshold setup */}
                <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-serif font-black text-neutral-900 border-b pb-2 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-orange-600" /> COD Availability Control
                  </h3>
                  <div className="space-y-3 text-xs font-sans">
                    <div>
                      <label className="font-bold text-neutral-600 block mb-1">Set COD Minimum Order Value</label>
                      <input
                        type="number"
                        min={0}
                        value={codMinOrderValue}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setCodMinOrderValue(val);
                          handleSavePaymentSettings(undefined, undefined, val);
                        }}
                        className="w-full border p-2.5 rounded-xl outline-hidden focus:border-orange-500 text-xs font-bold text-slate-800"
                      />
                      <span className="text-[9px] text-neutral-400 block mt-1 leading-relaxed">
                        Customers with basket subtotal less than ₹{codMinOrderValue} will be forced to choose an electronic method during dispatch.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown Pie or Progress report */}
                <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-serif font-black text-neutral-900 border-b pb-2">
                    📊 Method Sales Breakdown
                  </h3>
                  <div className="space-y-3 font-sans">
                    {analytics?.methodBreakdown && analytics.methodBreakdown.length > 0 ? (
                      analytics.methodBreakdown.map((pmData: any, i: number) => {
                        return (
                          <div key={i} className="text-xs space-y-1">
                            <div className="flex justify-between font-bold text-neutral-705 text-neutral-700">
                              <span>{pmData.method}</span>
                              <span>₹{pmData.amount}</span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-orange-600 rounded-full" 
                                style={{ width: `${Math.min(100, Math.round((pmData.amount / (analytics.totalRevenue || 1)) * 100))}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-[10px] text-neutral-400 text-center py-4 bg-neutral-50 rounded-xl">
                        No settled orders in record to compute gateways breakdown.
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Framework Statement Badges */}
                <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-4 text-xs font-sans">
                  <h3 className="text-sm font-serif font-black text-neutral-900 border-b pb-2 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-600" /> Platform Security & Audit
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1 text-emerald-800">
                      <span className="font-bold block text-[10px] uppercase tracking-wider">🔒 PCI-DSS Compliant</span>
                      <p className="text-[9px] leading-normal font-sans">
                        Structured sandbox utilizing strict tokenized client-side parameter checks. Real keys are kept server-side inside secure environments.
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 space-y-1 text-blue-800">
                      <span className="font-bold block text-[10px] uppercase tracking-wider">🛡️ 256-Bit SSL Encrypted</span>
                      <p className="text-[9px] leading-normal font-sans">
                        All dynamic credential payloads and state updates are encrypted in-transit over transport-layer security protocols.
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 space-y-1 text-amber-800">
                      <span className="font-bold block text-[10px] uppercase tracking-wider">📝 Logs and Audits</span>
                      <p className="text-[9px] leading-normal font-sans">
                        All configuration, state modification, and toggles are audited and saved to persistent memory.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Refund Audits Ledger */}
                <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-4 text-xs font-sans">
                  <h3 className="text-sm font-serif font-black text-neutral-900 border-b pb-2">
                    🔄 Refund Audits Ledger
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {analytics?.refundHistory && analytics.refundHistory.length > 0 ? (
                      analytics.refundHistory.map((ref: any, idx: number) => (
                        <div key={idx} className="p-2.5 border rounded-xl bg-red-50/10 border-red-100 space-y-1.5 leading-none">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-neutral-800">ID: {ref.orderId}</span>
                            <span className="px-1.5 py-0.5 bg-red-100 border border-red-200 text-red-800 text-[8px] font-black uppercase rounded">
                              Refunded
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] text-neutral-600 font-bold">
                            <span>{ref.customerName}</span>
                            <span>₹{ref.amount}</span>
                          </div>
                          <span className="text-[9px] text-neutral-400 block">{new Date(ref.date).toLocaleDateString()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-neutral-400 text-center py-4 bg-neutral-50 rounded-xl">
                        No orders have been cancelled or refunded yet.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* CORE SHOP OWNER SETTINGS */}
        {activeTab === 'Config' && (
          <div className="space-y-6">
            <div className="bg-white border rounded-3xl p-8 shadow-xs">
              <h2 className="text-xl font-serif font-bold text-neutral-900 border-b pb-4 flex items-center gap-1.5">
                <Smartphone className="w-5 h-5 text-orange-600" /> Update Business Coordinates & Delivery Settings
              </h2>

              <form onSubmit={handleSaveConfig} className="space-y-6 text-xs font-sans mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Restaurant Brand Name</label>
                    <input
                      type="text"
                      required
                      value={configBrand}
                      onChange={(e) => setConfigBrand(e.target.value)}
                      className="w-full px-3.5 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Direct Helpline Number (Indian Format)</label>
                    <input
                      type="text"
                      required
                      value={configPhone}
                      onChange={(e) => setConfigPhone(e.target.value)}
                      className="w-full px-3.5 py-2 border rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Email Coordinates Address</label>
                    <input
                      type="email"
                      required
                      value={configEmail}
                      onChange={(e) => setConfigEmail(e.target.value)}
                      className="w-full px-3.5 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Allowed Pune Service Area Pincodes (Comma-separated)</label>
                    <input
                      type="text"
                      required
                      value={configPincodes}
                      onChange={(e) => setConfigPincodes(e.target.value)}
                      className="w-full px-3.5 py-2 border rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">Physical Kitchen Hub Address</label>
                  <textarea
                    rows={3}
                    required
                    value={configAddress}
                    onChange={(e) => setConfigAddress(e.target.value)}
                    className="w-full px-3.5 py-2 border rounded-xl resize-none"
                  />
                </div>

                {configSaveMsg && (
                  <p className="p-3 bg-green-50 border border-green-100 text-green-700 font-bold rounded-lg">{configSaveMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={isConfigSaving}
                  className="px-6 py-3 bg-red-950 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  {isConfigSaving ? 'Saving Configurations...' : 'Register Changes'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
