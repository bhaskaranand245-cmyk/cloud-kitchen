import React, { useState } from 'react';
import { 
  Check, 
  ShieldCheck, 
  HeartPulse, 
  Sparkles, 
  RefreshCw, 
  MessageCircle, 
  Calendar, 
  Settings, 
  Clock, 
  User, 
  MapPin, 
  Flame, 
  Search, 
  BookOpen, 
  Smartphone, 
  Plus, 
  Minus, 
  Info, 
  CreditCard 
} from 'lucide-react';
import { MenuItem } from '../types';

interface TiffinPlansProps {
  onAddTiffinSubscription: (planName: string, price: number, durationDays: number) => void;
  brandPhone: string;
}

// Hardcoded simulated initial subscription state for demo dashboard lookup
interface SubscriberData {
  subscriberName: string;
  mobile: string;
  activePlanName: string;
  startDate: string;
  endDate: string;
  daysDelivered: number;
  totalDays: number;
  cashbackBalance: number;
  address: string;
  pincode: string;
  deliverySlot: string;
  gateNotes: string;
  spiceLevelValue: 'Mild' | 'Medium' | 'Hot';
  schedule: { [key: string]: { status: 'active' | 'paused'; dateLabel: string; dryVeg: string; wetGravy: string; spice: 'Mild' | 'Medium' | 'Hot'; slot: string } };
}

const DEFAULT_SIMULATED_SUBSCRIBER: SubscriberData = {
  subscriberName: "Ramesh Sharma",
  mobile: "9960877739",
  activePlanName: "Regular Standard (6 Days/Week - Mon to Sat)",
  startDate: "2026-06-01",
  endDate: "2026-06-30",
  daysDelivered: 12,
  totalDays: 26,
  cashbackBalance: 300,
  address: "Flat 202, Sunshine Heights, Near NIBM Road, Pune",
  pincode: "411037",
  deliverySlot: "Splits [12:15 PM & 7:45 PM]",
  gateNotes: "Leave food pack with society lobby guard if no one answers.",
  spiceLevelValue: "Medium",
  schedule: {
    'Monday (Jun 8)': { status: 'active', dateLabel: 'Jun 8', dryVeg: 'Bhindi Masala', wetGravy: 'Dal Tadka', spice: 'Medium', slot: 'Lunch [12:00 PM - 2:00 PM]' },
    'Tuesday (Jun 9)': { status: 'active', dateLabel: 'Jun 9', dryVeg: 'Aloo Jeera', wetGravy: 'Kadhi Pakora', spice: 'Medium', slot: 'Lunch [12:00 PM - 2:00 PM]' },
    'Wednesday (Jun 10)': { status: 'paused', dateLabel: 'Jun 10', dryVeg: 'Mix Veg Platter', wetGravy: 'Rajma Masala', spice: 'Mild', slot: 'Lunch [12:00 PM - 2:00 PM]' },
    'Thursday (Jun 11)': { status: 'active', dateLabel: 'Jun 11', dryVeg: 'Baingan Bharta', wetGravy: 'Chana Masala', spice: 'Medium', slot: 'Lunch [12:00 PM - 2:00 PM]' },
    'Friday (Jun 12)': { status: 'active', dateLabel: 'Jun 12', dryVeg: 'Gobi Matar', wetGravy: 'Moong Dal', spice: 'Medium', slot: 'Lunch [12:00 PM - 2:00 PM]' },
    'Saturday (Jun 13)': { status: 'active', dateLabel: 'Jun 13', dryVeg: 'Paneer Bhurji', wetGravy: 'Dal Fry Special', spice: 'Hot', slot: 'Lunch [12:00 PM - 2:00 PM]' },
    'Sunday (Jun 14)': { status: 'paused', dateLabel: 'Jun 14', dryVeg: 'Aloo Methi', wetGravy: 'Dal Fry Special', spice: 'Medium', slot: 'Lunch [12:00 PM - 2:00 PM]' }
  }
};

export default function TiffinPlans({ onAddTiffinSubscription, brandPhone }: TiffinPlansProps) {
  // Navigation Tabs for Tiffin section
  const [activeTab, setActiveTab] = useState<'configurator' | 'manager' | 'how-it-works'>('configurator');

  // Plan Configurator States
  const [daysPerWeek, setDaysPerWeek] = useState<'5' | '6' | '7'>('6'); // 5 Days, 6 Days, 7 Days Tiffin Frequency
  const [mealsPerDay, setMealsPerDay] = useState<1 | 2>(1); // 1 meal (Lunch OR Dinner) vs 2 meals (Lunch AND Dinner)
  const [mealType, setMealType] = useState<'Homestyle' | 'Fitness' | 'Festive'>('Homestyle'); // Homestyle Classic vs Healthy Gym vs Festive Kashmiri
  const [customRotis, setCustomRotis] = useState(4); // default 4 chapatis flat rate
  const [customSweet, setCustomSweet] = useState(true);
  const [customRaita, setCustomRaita] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Weekly Menu custom preferences preview (rendered dynamically for configurator preview)
  const [previewDay, setPreviewDay] = useState('Monday');
  const [configuratorSchedule, setConfiguratorSchedule] = useState<{ [key: string]: { status: 'active' | 'paused'; dryVeg: string; wetGravy: string; spice: 'Mild' | 'Medium' | 'Hot' } }>({
    'Monday': { status: 'active', dryVeg: 'Bhindi Masala', wetGravy: 'Kadhi Pakora', spice: 'Medium' },
    'Tuesday': { status: 'active', dryVeg: 'Aloo Jeera', wetGravy: 'Garlic Dal Tadka', spice: 'Medium' },
    'Wednesday': { status: 'active', dryVeg: 'Mix Veg Platter', wetGravy: 'Rajma Masala', spice: 'Mild' },
    'Thursday': { status: 'active', dryVeg: 'Baingan Bharta', wetGravy: 'Chole Masala', spice: 'Medium' },
    'Friday': { status: 'active', dryVeg: 'Gobi Moong Matar', wetGravy: 'Toor Dal Fry', spice: 'Medium' },
    'Saturday': { status: 'active', dryVeg: 'Paneer Butter Masala', wetGravy: 'Masoor Dal', spice: 'Hot' },
    'Sunday': { status: 'paused', dryVeg: 'Jeera Aloo Methi', wetGravy: 'Special Dal Makhani', spice: 'Medium' }
  });

  const availableDryVeg = ['Bhindi Masala', 'Aloo Jeera', 'Mix Veg Platter', 'Baingan Bharta', 'Paneer Butter Masala', 'Gobi Moong Matar', 'Baingan Masala', 'Aloo Gobi'];
  const availableWetGravy = ['Kadhi Pakora', 'Garlic Dal Tadka', 'Rajma Masala', 'Chole Masala', 'Toor Dal Fry', 'Masoor Dal', 'Special Dal Makhani', 'Panchmel Dal'];

  const handleUpdateConfiguratorDaySelection = (day: string, key: 'dryVeg' | 'wetGravy' | 'spice', value: string) => {
    setConfiguratorSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [key]: value }
    }));
  };

  const handleUpdateConfiguratorDayStatus = (day: string, status: 'active' | 'paused') => {
    setConfiguratorSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], status }
    }));
  };

  // Pricing calculations
  // Base rates for different frequencies and meals count
  const calculateBaseAndTotal = () => {
    let base = 0;
    if (daysPerWeek === '5') {
       base = mealsPerDay === 1 ? 2200 : 4100;
    } else if (daysPerWeek === '6') {
       base = mealsPerDay === 1 ? 2600 : 4900;
    } else {
       base = mealsPerDay === 1 ? 3100 : 5800;
    }

    // Meal type premiums
    let typePremium = 0;
    if (mealType === 'Fitness') typePremium = 350; // Keto/low-cal organic premium grains
    if (mealType === 'Festive') typePremium = 500; // Rich saffron spices and ghee preparation

    // Extra rotis cost over the default 4 (₹150 additional per extra roti monthly)
    const extraRotisCharge = customRotis > 4 ? (customRotis - 4) * 150 : 0;

    // Daily add-ons
    const sweetCharge = customSweet ? 250 : 0;
    const raitaCharge = customRaita ? 150 : 0;

    const total = base + typePremium + extraRotisCharge + sweetCharge + raitaCharge;
    return { base, typePremium, extraRotisCharge, sweetCharge, raitaCharge, total };
  };

  const pricing = calculateBaseAndTotal();

  const handleSubscribeClick = () => {
    setIsSubmitting(true);
    setSuccessMessage('');
    setTimeout(() => {
      setIsSubmitting(false);
      const planNameDetail = `Monthly Tiffin - ${daysPerWeek} Days/Wk (${mealsPerDay === 1 ? '1 Meal' : '2 Meals'}/Day) - ${mealType} Type [${customRotis} Rotis]`;
      onAddTiffinSubscription(
        planNameDetail,
        pricing.total,
        30
      );
      setSuccessMessage(`Custom Plan successfully integrated! Please complete checkout in your cart.`);
    }, 800);
  };


  // Customer Dashboard Subscription Management Simulator States
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'loaded' | 'error'>('idle');
  const [simulatedSubscriber, setSimulatedSubscriber] = useState<SubscriberData | null>(null);
  const [managementLog, setManagementLog] = useState<string>('');
  const [showPreferenceSuccess, setShowPreferenceSuccess] = useState(false);

  // Management interactive actions handler
  const handleToggleSimulatedDay = (dayKey: string) => {
    if (!simulatedSubscriber) return;
    
    const day = simulatedSubscriber.schedule[dayKey];
    const newStatus = day.status === 'active' ? 'paused' : 'active';
    const costAdjustment = 100; // ₹100 credit added or subtracted 

    const updatedSchedule = {
      ...simulatedSubscriber.schedule,
      [dayKey]: { ...day, status: newStatus }
    };

    const newCashback = newStatus === 'paused' 
      ? simulatedSubscriber.cashbackBalance + costAdjustment 
      : Math.max(0, simulatedSubscriber.cashbackBalance - costAdjustment);

    setSimulatedSubscriber(prev => prev ? {
      ...prev,
      cashbackBalance: newCashback,
      schedule: updatedSchedule
    } : null);

    setManagementLog(`Date ${dayKey} status changed to ${newStatus.toUpperCase()}. Wallet balance altered.`);
  };

  const handleUpdateSimulatedDaySetting = (dayKey: string, key: 'dryVeg' | 'wetGravy' | 'spice' | 'slot', value: string) => {
    if (!simulatedSubscriber) return;

    const day = simulatedSubscriber.schedule[dayKey];
    const updatedSchedule = {
      ...simulatedSubscriber.schedule,
      [dayKey]: { ...day, [key]: value }
    };

    setSimulatedSubscriber(prev => prev ? {
      ...prev,
      schedule: updatedSchedule
    } : null);

    setManagementLog(`Simulated delivery preferences for "${dayKey}" set to: ${key === 'dryVeg' || key === 'wetGravy' ? value : value}`);
  };

  const handleSaveSimulatedPreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreferenceSuccess(true);
    setTimeout(() => {
      setShowPreferenceSuccess(false);
    }, 3500);
  };

  const triggerSearchLookup = () => {
    if (!mobileSearchQuery.trim()) {
      alert("Please enter a registered mobile number to retrieve tiffin records.");
      return;
    }
    setSearchStatus('searching');
    setTimeout(() => {
      // Simulate real-time retrieval matching or fetching
      setSimulatedSubscriber({
        ...DEFAULT_SIMULATED_SUBSCRIBER,
        mobile: mobileSearchQuery
      });
      setSearchStatus('loaded');
      setManagementLog("Successfully linked active subscription profile from Pune logistics database!");
    }, 900);
  };

  const loadDemoSubscriberImmediately = () => {
    setSearchStatus('searching');
    setTimeout(() => {
      setSimulatedSubscriber(DEFAULT_SIMULATED_SUBSCRIBER);
      setSearchStatus('loaded');
      setManagementLog("Viewing active live demo subscription. Play with pause toggles & options!");
    }, 455);
  };

  return (
    <section id="tiffin-section" className="py-20 bg-neutral-900 border-t border-neutral-800 text-white relative overflow-hidden">
      
      {/* Absolute Ambient Background Layers */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-extrabold text-orange-400 uppercase tracking-widest bg-orange-950 px-3.5 py-1.5 rounded-full border border-orange-900/40">
            FSSAI Sanitized Monthly Tiffin Plans
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-black leading-tight tracking-tight text-neutral-100">
            Pausable Monthly Tiffin Services in Pune
          </h2>
          <p className="text-sm text-neutral-400 font-sans max-w-2xl mx-auto leading-relaxed">
            100% pure vegetarian home-cooked meals delivered in clinical airtight hot-packs. Perfect for corporate employees, students, and selective families seeking authentic taste with easy daily modifications.
          </p>

          {/* Premium Tab Selection Controls with distinct visual pairing */}
          <div className="pt-6 flex justify-center">
            <div className="bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-1 w-full max-w-2xl">
              
              <button
                id="tab-configurator"
                onClick={() => setActiveTab('configurator')}
                className={`py-3 px-4 rounded-xl text-xs font-extrabold tracking-wide uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'configurator'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>1. Customize Plan</span>
              </button>

              <button
                id="tab-manager"
                onClick={() => setActiveTab('manager')}
                className={`py-3 px-4 rounded-xl text-xs font-extrabold tracking-wide uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'manager'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>2. Manage Active Plan</span>
              </button>

              <button
                id="tab-how-it-works"
                onClick={() => setActiveTab('how-it-works')}
                className={`py-3 px-4 rounded-xl text-xs font-extrabold tracking-wide uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'how-it-works'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>3. Process Lifecycle</span>
              </button>

            </div>
          </div>
        </div>

        {/* ----------------- TAB 1: CONFIGURATOR AND PRICING TIERS ----------------- */}
        {activeTab === 'configurator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Customizer Configurations Segment */}
            <div className="lg:col-span-7 bg-black/40 border border-neutral-800/80 p-6 sm:p-8 rounded-3xl space-y-7">
              <h3 className="text-xl font-serif font-bold text-orange-400 flex items-center gap-2 border-b border-neutral-800 pb-3">
                <HeartPulse className="w-5 h-5 text-red-500 animate-pulse" /> Custom Diet Tiffin Configurator
              </h3>

              <div className="space-y-6">
                
                {/* Step 1: Plan Frequency (Meals per week) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                      Step 1: Frequency (Weekly Schedule)
                    </label>
                    <span className="text-[10.5px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 font-bold">
                      {daysPerWeek === '5' ? 'Working Days (Mon - Fri)' : daysPerWeek === '6' ? 'Six Days (Mon - Sat)' : 'Complete Care (Mon - Sun)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: '5', label: '5 Days / Wk', desc: 'Mon to Fri' },
                      { key: '6', label: '6 Days / Wk', desc: 'Mon to Sat' },
                      { key: '7', label: '7 Days / Wk', desc: 'Mon to Sun' }
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setDaysPerWeek(opt.key as any)}
                        className={`p-3 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between h-20 ${
                          daysPerWeek === opt.key
                            ? 'border-orange-500 bg-orange-600/10 text-white'
                            : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <span className="block font-bold text-xs sm:text-sm">{opt.label}</span>
                        <span className="block text-[10px] text-neutral-400 mt-1">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Meals per Day (Lunch and/or Dinner) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                      Step 2: Meal Volume Selection
                    </label>
                    <span className="text-[10.5px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-md border border-orange-500/20 font-bold">
                      {mealsPerDay === 1 ? 'Single Daily Delivery' : 'Double Daily Deliveries'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMealsPerDay(1)}
                      className={`p-4 rounded-xl border-2 text-left transition cursor-pointer ${
                        mealsPerDay === 1
                          ? 'border-orange-500 bg-orange-600/10 text-white'
                          : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span className="block font-bold text-xs sm:text-sm">Single Meal Plan (1 Meal)</span>
                      <span className="block text-[10px] text-neutral-500 mt-1">Configure either Lunch OR Dinner hourly routing</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMealsPerDay(2)}
                      className={`p-4 rounded-xl border-2 text-left transition cursor-pointer ${
                        mealsPerDay === 2
                          ? 'border-orange-500 bg-orange-600/10 text-white'
                          : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span className="block font-bold text-xs sm:text-sm">Double Meal Plan (2 Meals)</span>
                      <span className="block text-[10px] text-neutral-500 mt-1">Both Lunch and Dinner hot packs direct drop-off</span>
                    </button>
                  </div>
                </div>

                {/* Step 3: Meal Dietary & Taste Profile */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                    Step 3: Meal Taste & Health Profile
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'Homestyle', label: 'Homestyle Classic', priceText: 'Included', desc: 'Light seasonings, low oil, comforting' },
                      { key: 'Fitness', label: 'Healthy/Gym Keto', priceText: '+₹350/mo', desc: 'Brown/Oat grains, raw salad, high-protein paneer' },
                      { key: 'Festive', label: 'Royal Kashmiri Special', priceText: '+₹500/mo', desc: 'Rich cashew gravies, saffron pullo, parathas' }
                    ].map((type) => (
                      <button
                        key={type.key}
                        type="button"
                        onClick={() => setMealType(type.key as any)}
                        className={`p-3 sm:p-4 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between h-28 ${
                          mealType === type.key
                            ? 'border-orange-500 bg-orange-600/10 text-white'
                            : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <span className="block font-extrabold text-xs">{type.label}</span>
                          <span className="block text-[9px] text-neutral-400 line-clamp-2 leading-relaxed mt-1">{type.desc}</span>
                        </div>
                        <span className="block font-mono font-bold text-orange-400 text-[11px] mt-2">{type.priceText}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 4: Adjustable Portions (Ghee Rotis) */}
                <div className="space-y-3 border-t border-neutral-800 pt-5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                      Step 4: Custom Chapati Count (Per Meal)
                    </label>
                    <span className="text-xs font-mono font-bold text-neutral-300">{customRotis} Handmade Phulkas/Rotis</span>
                  </div>
                  <div className="flex gap-2.5">
                    {[2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCustomRotis(num)}
                        className={`flex-1 py-2 font-bold text-xs rounded-lg transition border cursor-pointer ${
                          customRotis === num
                            ? 'bg-orange-600 border-orange-500 text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                        }`}
                      >
                        {num} Rotis
                      </button>
                    ))}
                  </div>
                  {customRotis > 4 ? (
                    <p className="text-[10px] text-neutral-400">
                      * Standard plan includes 4 Rotis. Extra rotis are charged at flat ₹150 monthly per additional roti.
                    </p>
                  ) : (
                    <p className="text-[10px] text-neutral-500 font-sans">
                      * Soft whole wheat hand-rolled visual chapatis layered with pure cow ghee.
                    </p>
                  )}
                </div>

                {/* Step 5: Healthy Supplements / Addons */}
                <div className="space-y-3 border-t border-neutral-800 pt-5">
                  <label className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                    Step 5: Daily Nutritional Add-ons
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCustomSweet(!customSweet)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between text-xs transition cursor-pointer ${
                        customSweet 
                          ? 'border-orange-500/80 bg-orange-600/5 text-neutral-200' 
                          : 'border-neutral-800 text-neutral-500 bg-neutral-950/20'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-bold">
                        {customSweet ? '✅' : '⬜'} Daily Homestyle Sweet / Gulab Jamun
                      </span>
                      <span className="font-mono font-bold text-orange-400">+₹250</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomRaita(!customRaita)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between text-xs transition cursor-pointer ${
                        customRaita 
                          ? 'border-orange-500/80 bg-orange-600/5 text-neutral-200' 
                          : 'border-neutral-800 text-neutral-500 bg-neutral-950/20'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-bold">
                        {customRaita ? '✅' : '⬜'} Daily Spiced Raita / Curd
                      </span>
                      <span className="font-mono font-bold text-orange-400">+₹150</span>
                    </button>
                  </div>
                </div>

                {/* Step 6: Configurator Day Planner Presets Preview */}
                <div className="border-t border-neutral-800 pt-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <label className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                      Dynamic Custom Day Planner & Preview
                    </label>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {Object.keys(configuratorSchedule).map((day) => {
                      const isSelected = previewDay === day;
                      const isPaused = configuratorSchedule[day].status === 'paused';
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setPreviewDay(day)}
                          className={`p-2 rounded-xl text-[10px] font-bold text-center transition cursor-pointer border flex flex-col justify-between h-14 ${
                            isSelected
                              ? 'border-orange-500 bg-orange-600/20 text-white'
                              : isPaused
                                ? 'border-red-950 bg-red-950/15 text-neutral-500'
                                : 'border-neutral-800 bg-neutral-950/30 text-neutral-400'
                          }`}
                        >
                          <span className="block truncate text-[8px] uppercase">{day.substring(0,3)}</span>
                          <span className={`w-1.5 h-1.5 rounded-full mx-auto ${isPaused ? 'bg-red-500' : 'bg-green-500'}`} />
                        </button>
                      );
                    })}
                  </div>

                  {previewDay && (
                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-left text-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                        <span className="font-extrabold text-neutral-200 uppercase">{previewDay} Meal Outline</span>
                        <button 
                          onClick={() => handleUpdateConfiguratorDayStatus(previewDay, configuratorSchedule[previewDay].status === 'active' ? 'paused' : 'active')}
                          className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded cursor-pointer ${
                            configuratorSchedule[previewDay].status === 'active' 
                              ? 'bg-emerald-950 text-emerald-400' 
                              : 'bg-red-950 text-red-400'
                          }`}
                        >
                          {configuratorSchedule[previewDay].status === 'active' ? 'Active scheduled' : 'Hold / Travel Paused'}
                        </button>
                      </div>

                      {configuratorSchedule[previewDay].status === 'active' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] text-neutral-500 font-bold block">DRY VEGETABLE SELECTION</span>
                            <select 
                              value={configuratorSchedule[previewDay].dryVeg} 
                              onChange={(e) => handleUpdateConfiguratorDaySelection(previewDay, 'dryVeg', e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-800 text-xs p-1.5 rounded text-neutral-300 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                            >
                              {availableDryVeg.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-neutral-500 font-bold block">DAL / CHANA GRAVY</span>
                            <select 
                              value={configuratorSchedule[previewDay].wetGravy} 
                              onChange={(e) => handleUpdateConfiguratorDaySelection(previewDay, 'wetGravy', e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-800 text-xs p-1.5 rounded text-neutral-300 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                            >
                              {availableWetGravy.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-neutral-500 font-bold block">SPICE THRESHOLD</span>
                            <div className="grid grid-cols-3 gap-1">
                              {['Mild', 'Medium', 'Hot'].map(spice => (
                                <button
                                  key={spice}
                                  type="button"
                                  onClick={() => handleUpdateConfiguratorDaySelection(previewDay, 'spice', spice)}
                                  className={`p-1.5 text-[9px] font-bold rounded uppercase cursor-pointer border ${
                                    configuratorSchedule[previewDay].spice === spice 
                                      ? 'bg-orange-600 text-white border-orange-500' 
                                      : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                                  }`}
                                >
                                  {spice}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-red-950/20 border border-red-900/30 rounded text-red-400 text-[11px]">
                          ⏸️ <strong>Holiday/Pause applied for {previewDay}:</strong> Bhagwati system auto-credits your digital wallet with ₹100 refund points! The billing date extends forward automatically, keeping your money fully safe.
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Configurator Pricing Summary Sidebar Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700/60 p-6 sm:p-8 rounded-3xl text-left space-y-5 shadow-xl">
                <div>
                  <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-widest bg-orange-950/80 px-2.5 py-1 rounded-md border border-orange-900">
                    Pricing Summary
                  </span>
                  <h4 className="text-2xl font-serif font-black text-neutral-100 mt-2">Calculated Tariff</h4>
                </div>

                <div className="text-xs divide-y divide-neutral-700/50 py-1 font-sans text-neutral-300 space-y-2.5">
                  <div className="flex justify-between pt-2">
                    <span>
                      Monthly plan frequency ({daysPerWeek} Days/Week)
                    </span>
                    <span className="font-extrabold text-neutral-100">
                      ₹{pricing.base.toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between pt-2.5">
                    <span>
                      Meal deliverable ratio ({mealsPerDay === 1 ? '1 Meal Daily' : '2 Meals Daily'})
                    </span>
                    <span className="text-neutral-400 font-medium">Included</span>
                  </div>

                  <div className="flex justify-between pt-2.5">
                    <span>
                      Diet profile premium ({mealType === 'Homestyle' ? 'Homestyle' : mealType === 'Fitness' ? 'Keto Fitness' : 'Kashmiri Special'})
                    </span>
                    <span className="font-extrabold text-neutral-100">
                      {pricing.typePremium > 0 ? `+₹${pricing.typePremium}` : 'Standard'}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2.5">
                    <span>
                      Roti count customization ({customRotis} rotis per tray)
                    </span>
                    <span className="font-extrabold text-neutral-100">
                      {pricing.extraRotisCharge > 0 ? `+₹${pricing.extraRotisCharge}` : 'Standard (4 Rotis)'}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2.5">
                    <span>Sweets Supplement (Daily ratio)</span>
                    <span className="font-extrabold text-neutral-100">
                      {pricing.sweetCharge > 0 ? `+₹${pricing.sweetCharge}` : 'Excluded'}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2.5">
                    <span>Fresh Salted Raita (Daily ratio)</span>
                    <span className="font-extrabold text-neutral-100">
                      {pricing.raitaCharge > 0 ? `+₹${pricing.raitaCharge}` : 'Excluded'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-neutral-700 pt-4 flex justify-between items-baseline">
                  <span className="text-neutral-300 text-sm font-semibold">Bhagwati Quoted Cost:</span>
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-extrabold text-orange-500 font-serif">
                      ₹{pricing.total.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] text-neutral-400 font-mono">For 30 Days Cycle</span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                  * All daily tariffs include premium hermetic packaging taxes, custom eco-boxes, and FSSAI health clearance routes in Pune. Easily pausable at any time with rollforward policies.
                </p>

                {successMessage && (
                  <p className="text-xs text-emerald-400 font-bold bg-emerald-950 p-3 rounded-xl border border-emerald-900 flex items-center gap-1.5 animate-pulse">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" /> {successMessage}
                  </p>
                )}

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    id="btn-subscribe-and-add-cart"
                    type="button"
                    onClick={handleSubscribeClick}
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4.5 h-4.5 animate-spin" /> Tailoring Basket...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4.5 h-4.5 text-amber-300" /> Confirm & Place in Cart
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const textMessage = `*CRITICAL: Custom Bhagwati Tiffin Plan Request!*\n` +
                        `----------------------------------------------\n` +
                        `- Weekly frequency: ${daysPerWeek} Days per week\n` +
                        `- Daily Meal cycle: ${mealsPerDay === 1 ? '1 Meal Daily (Lunch/Dinner)' : '2 Meals Daily (Lunch & Dinner)'}\n` +
                        `- Taste Preference Profile: ${mealType} Prep Style\n` +
                        `- Hand-rolled Ghee Rotis per meal: ${customRotis} Rotis\n` +
                        `- Sweets included: ${customSweet ? '✅ Yes' : '❌ No'}\n` +
                        `- Curd/Raita included: ${customRaita ? '✅ Yes' : '❌ No'}\n` +
                        `----------------------------------------------\n` +
                        `- Quoted Monthly Cost: ₹${pricing.total.toLocaleString('en-IN')}\n` +
                        `Please help me activate this subscription and register my home delivery slot in Pune. Thank you!`;

                      const linkToOpen = `https://wa.me/91${brandPhone}?text=${encodeURIComponent(textMessage)}`;
                      window.open(linkToOpen, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition transform hover:-translate-y-0.5 cursor-pointer text-sm font-sans"
                  >
                    <MessageCircle className="w-4.5 h-4.5 fill-white" />
                    <span>Inquire & Register on WhatsApp</span>
                  </button>
                </div>

              </div>

              {/* Security Badge Info */}
              <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 flex items-start gap-3.5">
                <ShieldCheck className="w-8 h-8 text-orange-400 shrink-0" />
                <div className="text-xs space-y-1">
                  <header className="font-bold text-neutral-200">Our Bhagwati Quality Assurance</header>
                  <p className="text-neutral-500 font-sans leading-relaxed">
                    Zero soda, zero industrial palm fats, and completely purified RO-filtered water used in kitchen cookings. Fully certified under standard central FSSAI health directives so you enjoy long-term home health.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ----------------- TAB 2: ACTIVE SUBSCRIPTION MANAGEMENT PORTAL ----------------- */}
        {activeTab === 'manager' && (
          <div className="bg-black/40 border border-neutral-800 p-6 sm:p-10 rounded-3xl space-y-8 text-left">
            <div>
              <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-widest bg-orange-950/80 px-2.5 py-1 rounded-md border border-orange-900">
                Customer Direct Portal
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-neutral-100 mt-2">
                Manage Active Deliveries & Pauses
              </h3>
              <p className="text-xs text-neutral-400 font-sans max-w-xl leading-relaxed mt-1">
                Enter your registered Indian phone number below to fetch your current calendar schedule, pause upcoming dates, change spice tolerances, or switch address routing coordinates.
              </p>
            </div>

            {/* Simulated Search Form block */}
            <div className="bg-neutral-950/80 border border-neutral-800 p-5 rounded-2xl max-w-2xl">
              <label className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5">
                Enter Registered Mobile Number
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-bold">+91</span>
                  <input
                    type="tel"
                    placeholder="9960877739"
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-xs font-mono focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <button
                  id="btn-search-subscription"
                  onClick={triggerSearchLookup}
                  disabled={searchStatus === 'searching'}
                  className="bg-orange-600 hover:bg-orange-700 text-xs font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
                >
                  <Search className="w-4 h-4" />
                  <span>{searchStatus === 'searching' ? 'Retrieving Records...' : 'Access Portal'}</span>
                </button>
                <button
                  onClick={loadDemoSubscriberImmediately}
                  className="border border-neutral-700 hover:bg-neutral-800 text-xs text-neutral-300 font-bold px-4 py-3 rounded-xl transition cursor-pointer"
                >
                  Load Live Demo Preview (Ramesh)
                </button>
              </div>
            </div>

            {/* Spinner loader state */}
            {searchStatus === 'searching' && (
              <div className="py-12 flex flex-col items-center gap-3 text-center">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                <span className="text-xs text-neutral-400 font-sans">Connecting with Bhagwati Pune Dispatch Database...</span>
              </div>
            )}

            {/* Portal Error notification */}
            {searchStatus === 'error' && (
              <div className="p-4 bg-red-950/25 border border-red-900/40 rounded-xl text-xs text-red-400 text-left">
                No active monthly subscription was tracked matching your input. Please verify or connect with our customer helpdesk line (+91 9960877739).
              </div>
            )}

            {/* Portal Record Actually Loaded Dashboard view */}
            {searchStatus === 'loaded' && simulatedSubscriber && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Visual Status card of subscription */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Stats Box 1: Profile metadata */}
                  <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800/80 space-y-2 text-left relative overflow-hidden">
                    <div className="absolute right-2.5 top-2.5 bg-emerald-950/80 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-900 px-2 py-0.5 rounded">
                      ● ACTIVE RUNNING
                    </div>
                    <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider">Subscriber</span>
                    <h5 className="text-lg font-serif font-black text-neutral-100 flex items-center gap-1.5">
                      <User className="w-4.5 h-4.5 text-orange-500 shrink-0" /> {simulatedSubscriber.subscriberName}
                    </h5>
                    <p className="text-xs text-neutral-400 font-mono">+91 {simulatedSubscriber.mobile}</p>
                    <p className="text-[10px] text-neutral-500 italic mt-3 block">{simulatedSubscriber.activePlanName}</p>
                  </div>

                  {/* Stats Box 2: Quota linear indicator */}
                  <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800/80 space-y-3.5 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider">Service Quota</span>
                      <span className="text-xs font-mono font-bold text-orange-400">
                        {simulatedSubscriber.daysDelivered} / {simulatedSubscriber.totalDays} Days
                      </span>
                    </div>
                    
                    {/* Linear slider meter mockup */}
                    <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-orange-500 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${(simulatedSubscriber.daysDelivered / simulatedSubscriber.totalDays) * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-neutral-500">
                      <span>Started: {simulatedSubscriber.startDate}</span>
                      <span>Expires: {simulatedSubscriber.endDate}</span>
                    </div>
                  </div>

                  {/* Stats Box 3: Wallet rollback credit pool */}
                  <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800/80 space-y-1.5 text-left">
                    <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider">Cashback Wallet Pool</span>
                    <span className="text-3xl font-extrabold text-emerald-400 block font-mono">
                      ₹{simulatedSubscriber.cashbackBalance}
                    </span>
                    <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
                      * Refund points accumulated from meals paused by you. Points are automatically deducted to reduce your upcoming cycle renewal bill!
                    </p>
                  </div>

                </div>

                {/* Logistics alerts logger */}
                {managementLog && (
                  <div className="bg-neutral-900/50 p-3 rounded-xl border border-neutral-800/80 text-[10.5px] font-mono text-amber-400 flex items-center gap-2">
                    <span className="bg-amber-950 text-amber-400 px-1 rounded text-[8px] font-bold">LOG</span>
                    <span>{managementLog}</span>
                  </div>
                )}

                {/* Calendar Delivery Matrix */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-serif font-black text-neutral-100 flex items-center gap-1.5">
                      <Calendar className="w-5 h-5 text-orange-500" /> Interactive Daily Route Calendar (Next 7 Slots)
                    </h4>
                    <p className="text-[11px] text-neutral-500 font-sans">
                      Tap any day's toggle button to pause/scheduled the delivery. Customize the dry-vegetable options, gravy types, or local hourly delivery slot for each date.
                    </p>
                  </div>

                  {/* Matrix day cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
                    {Object.keys(simulatedSubscriber.schedule).map((dayKey) => {
                      const dayVal = simulatedSubscriber.schedule[dayKey];
                      const isPaused = dayVal.status === 'paused';
                      return (
                        <div 
                          key={dayKey}
                          className={`bg-neutral-900 p-3 rounded-2xl border transition text-left flex flex-col justify-between min-h-[190px] ${
                            isPaused 
                              ? 'border-red-950 bg-red-950/5 opacity-80' 
                              : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900'
                          }`}
                        >
                          {/* Calendar date label */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <span className="text-[9.5px] font-extrabold text-neutral-400 uppercase truncate">
                                {dayKey.split(' ')[0]}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-neutral-300">
                                {dayVal.dateLabel}
                              </span>
                            </div>

                            {/* Pause/Scheduled controller toggle */}
                            <button
                              onClick={() => handleToggleSimulatedDay(dayKey)}
                              className={`w-full py-1 text-center font-bold text-[9px] rounded uppercase mt-1 tracking-wide cursor-pointer transition ${
                                isPaused
                                  ? 'bg-red-950/80 text-red-400 border border-red-900/30'
                                  : 'bg-emerald-950 text-emerald-400 border border-emerald-900/30 hover:bg-emerald-900'
                              }`}
                            >
                              {isPaused ? '⏸️ Paused (Hold)' : '🟢 Scheduled'}
                            </button>
                          </div>

                          {!isPaused ? (
                            <div className="space-y-2.5 mt-2 text-[10px]">
                              {/* Dry Veggie preference */}
                              <div className="space-y-0.5">
                                <label className="text-[8px] font-bold text-neutral-500 uppercase block">Vegetable Preference</label>
                                <select 
                                  value={dayVal.dryVeg} 
                                  onChange={(e) => handleUpdateSimulatedDaySetting(dayKey, 'dryVeg', e.target.value)}
                                  className="w-full bg-neutral-950 border border-neutral-800 p-1 text-[10px] rounded text-neutral-300 focus:outline-none"
                                >
                                  {availableDryVeg.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                              </div>

                              {/* Wet Gravy preference */}
                              <div className="space-y-0.5">
                                <label className="text-[8px] font-bold text-neutral-500 uppercase block">Dal / Curry</label>
                                <select 
                                  value={dayVal.wetGravy} 
                                  onChange={(e) => handleUpdateSimulatedDaySetting(dayKey, 'wetGravy', e.target.value)}
                                  className="w-full bg-neutral-950 border border-neutral-800 p-1 text-[10px] rounded text-neutral-300 focus:outline-none"
                                >
                                  {availableWetGravy.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                              </div>

                              {/* Spice Preference */}
                              <div className="space-y-0.5">
                                <label className="text-[8px] font-bold text-neutral-500 uppercase block">Spice Profile</label>
                                <div className="grid grid-cols-3 gap-0.5">
                                  {['Mild', 'Medium', 'Hot'].map(spiceOption => (
                                    <button
                                      key={spiceOption}
                                      onClick={() => handleUpdateSimulatedDaySetting(dayKey, 'spice', spiceOption)}
                                      className={`py-0.5 text-[8px] font-bold rounded uppercase cursor-pointer ${
                                        dayVal.spice === spiceOption 
                                          ? 'bg-orange-600 text-white' 
                                          : 'bg-neutral-950 text-neutral-500 hover:text-neutral-300'
                                      }`}
                                    >
                                      {spiceOption}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 border border-red-950 rounded bg-red-950/10 text-[9px] text-red-400 italic leading-relaxed mt-2.5">
                              ⏸️ This meal is explicitly paused. Rollforward savings of ₹100 have been logged instantly in your wallet balance logic above.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-Form: Logistics Configurations Preferences */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 border-t border-neutral-800">
                  
                  {/* General settings form */}
                  <form onSubmit={handleSaveSimulatedPreferences} className="lg:col-span-8 space-y-4">
                    <h4 className="text-md font-serif font-black text-neutral-200 flex items-center gap-1.5">
                      <Settings className="w-4.5 h-4.5 text-orange-500" /> General Route Logistics & Dispatch Instructions
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                          Delivery Hour Splits
                        </label>
                        <select 
                          value={simulatedSubscriber.deliverySlot} 
                          onChange={(e) => setSimulatedSubscriber(prev => prev ? { ...prev, deliverySlot: e.target.value } : null)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="Splits [12:15 PM & 7:45 PM]">Both Splits [12:15 PM & 7:45 PM]</option>
                          <option value="Lunch Only [12:15 PM - 1:45 PM]">Lunch Only [12:15 PM - 1:45 PM]</option>
                          <option value="Dinner Only [7:45 PM - 9:15 PM]">Dinner Only [7:45 PM - 9:15 PM]</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                          Contact Spice Preference Standard
                        </label>
                        <select 
                          value={simulatedSubscriber.spiceLevelValue} 
                          onChange={(e) => setSimulatedSubscriber(prev => prev ? { ...prev, spiceLevelValue: e.target.value as any } : null)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="Mild">Mild (Low spices, child friendly)</option>
                          <option value="Medium">Medium (Balanced standard restaurant flavor)</option>
                          <option value="Hot">Hot (Kolhapuri red spice accent)</option>
                        </select>
                      </div>

                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                        Gate Keeper / Delivery Drop Notes
                      </label>
                      <input 
                        type="text"
                        value={simulatedSubscriber.gateNotes} 
                        onChange={(e) => setSimulatedSubscriber(prev => prev ? { ...prev, gateNotes: e.target.value } : null)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        placeholder="E.g. Call before coming, or leave at visual security kiosk desk"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                        Pune Delivery Address Details
                      </label>
                      <textarea 
                        value={simulatedSubscriber.address} 
                        onChange={(e) => setSimulatedSubscriber(prev => prev ? { ...prev, address: e.target.value } : null)}
                        rows={2}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {showPreferenceSuccess && (
                      <p className="p-3 bg-emerald-950 text-emerald-400 border border-emerald-900 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-pulse">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" /> Saved! Delivery dispatch system instantly refreshed with your updated route details.
                      </p>
                    )}

                    <div>
                      <button
                        type="submit"
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl text-xs tracking-wider uppercase transition cursor-pointer"
                      >
                        Save Live Dispatch Preferences
                      </button>
                    </div>

                  </form>

                  {/* Sidebar stats panel */}
                  <div className="lg:col-span-4 bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4 self-start text-xs text-neutral-400">
                    <header className="font-bold text-neutral-200 uppercase tracking-wider">
                      Need Immediate Assistance?
                    </header>
                    <p className="font-sans leading-relaxed">
                      If you need to change your address to a different sector in Pune temporarily, pause subscription for more than 15 consecutive days, or request zero-spice preparation, connect with our routing dispatcher directly.
                    </p>
                    <div className="pt-2">
                      <a 
                        href={`https://wa.me/91${brandPhone}?text=Namaste%20Bhagwati%20Support!%20I%20need%20assistance%20modifying%20my%20running%20monthly%20tiffin%20subscription.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 border border-orange-500/30 text-orange-400 hover:bg-orange-950 text-center rounded-xl font-bold tracking-wide transition block cursor-pointer text-[11px]"
                      >
                        ☎️ Speak to Route Dispatcher
                      </a>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {searchStatus === 'idle' && (
              <div className="p-10 border border-dashed border-neutral-800 rounded-2xl text-center space-y-4 max-w-2xl">
                <Smartphone className="w-12 h-12 text-neutral-600 mx-auto" />
                <h4 className="text-md font-bold text-neutral-300">Ready to adjust your upcoming plans?</h4>
                <p className="text-xs text-neutral-500 font-sans max-w-md mx-auto">
                  Type in your mobile number or click the **"Load Live Demo Preview"** button to interact with standard operational controls!
                </p>
              </div>
            )}

          </div>
        )}

        {/* ----------------- TAB 3: PROCESS LIFECYCLE GUIDE ----------------- */}
        {activeTab === 'how-it-works' && (
          <div className="bg-black/40 border border-neutral-800 p-6 sm:p-10 rounded-3xl space-y-10 text-left">
            <div>
              <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-widest bg-orange-950/80 px-2.5 py-1 rounded-md border border-orange-900">
                Transparent Policies
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-neutral-100 mt-2">
                The Bhagwati Subscription Lifecycle
              </h3>
              <p className="text-xs text-neutral-400 font-sans max-w-xl leading-relaxed mt-1">
                We believe in complete transparency and customer sovereignty. Our robust software integrations ensure you never lose a rupee for undelivered slots.
              </p>
            </div>

            {/* Lifecycle Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 text-left space-y-3 relative">
                <span className="text-4xl font-serif font-black text-orange-500/20 absolute right-4 top-4">01</span>
                <span className="bg-orange-950 text-orange-400 border border-orange-900 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">Configure</span>
                <h4 className="font-extrabold text-neutral-200 text-sm mt-3">Tailor Plan Tariff</h4>
                <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                  Tailor your plan's frequency (5, 6, or 7 days per week), choose meal volumes (Single thali vs Double saver lunch & dinner), and custom grains/supplement layers.
                </p>
              </div>

              <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 text-left space-y-3 relative">
                <span className="text-4xl font-serif font-black text-orange-500/20 absolute right-4 top-4">02</span>
                <span className="bg-orange-950 text-orange-400 border border-orange-900 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">Set Slots</span>
                <h4 className="font-extrabold text-neutral-200 text-sm mt-3">Log Delivery Hours</h4>
                <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                  Decide your lunch routing (delivered between 11:30 AM - 1:30 PM) and dinner routing (delivered between 7:00 PM - 9:00 PM) to align with work models.
                </p>
              </div>

              <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 text-left space-y-3 relative">
                <span className="text-4xl font-serif font-black text-orange-500/20 absolute right-4 top-4">03</span>
                <span className="bg-orange-950 text-orange-400 border border-orange-900 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">Register</span>
                <h4 className="font-extrabold text-neutral-200 text-sm mt-3">UPI / Cash Setup</h4>
                <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                  Checkout securely online to activate the 30-day loop or click "Book via WhatsApp" to communicate custom directions. Your first airtight tray reaches you within 24 hours.
                </p>
              </div>

              <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 text-left space-y-3 relative">
                <span className="text-4xl font-serif font-black text-orange-500/20 absolute right-4 top-4">04</span>
                <span className="bg-orange-950 text-orange-400 border border-orange-900 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">Full Control</span>
                <h4 className="font-extrabold text-neutral-200 text-sm mt-3">Pausability Toggles</h4>
                <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                  Traveling out of Pune? Or heading out for dinner? Access your calendar portal here before 10 PM. Paused meals carry-forward as ₹100 rollover credits automatically.
                </p>
              </div>

            </div>

            {/* In depth Policy guidelines segment card */}
            <div className="bg-neutral-900 text-xs p-6 rounded-2xl border border-neutral-800 space-y-6">
              <header className="font-serif font-bold text-neutral-100 text-md flex items-center gap-1.5 border-b border-neutral-800 pb-3">
                <Info className="w-5 h-5 text-orange-400" /> Tiffin Lifecycle Policies, Delays & Cancellation
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-neutral-400 leading-relaxed font-sans">
                
                <div className="space-y-4">
                  <div>
                    <strong className="text-neutral-200 block text-[13px] mb-1">📅 Pause/Resume Policy:</strong>
                    <p>
                      Pausing any scheduled upcoming meal must be completed by <strong>10:00 PM the previous night</strong> for Lunch, and <strong>10:00 AM same-day</strong> for Dinner. This ensures our farmers do not generate vegetable wastage, helping us keep Bhagwati tiffin prices highly defensive.
                    </p>
                  </div>
                  <div>
                    <strong className="text-neutral-200 block text-[13px] mb-1">🚚 Pune Delivery Zone Coverage:</strong>
                    <p>
                      We deliver standard hot packages across major residential and IT hub codes including Koregaon Park, Kalyani Nagar, Viman Nagar, NIBM Road, Undri, Hadapsar, and Camp areas. For remote tech parks, specialized corporate split routes apply.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <strong className="text-neutral-200 block text-[13px] mb-1">⚖️ Wallet Carryforwards:</strong>
                    <p>
                      When you toggle a day into "Paused", our digital billing stack immediately marks ₹100 as "unutilized balance," crediting your integrated wallet. At cyclic renewal every 30 days, your upcoming subscription fee is reduced by your total accumulated points!
                    </p>
                  </div>
                  <div>
                    <strong className="text-neutral-200 block text-[13px] mb-1">🧼 Sanitization & Food Warmth:</strong>
                    <p>
                      All standard dishes are packed right off the cooking flame inside 100% organic, BPA-free, split microwave-safe trays heat-sealed with pristine food film. Heavy insulated route-bags guarantee delivery above 65°C, ensuring high-hygiene Indian meals.
                    </p>
                  </div>
                </div>

              </div>

              <div className="pt-3 border-t border-neutral-800 text-center">
                <span className="text-neutral-500 font-mono text-[11px]">
                  * Bhagwati Cloud Kitchen is registered with FSSAI. Registration number: 21524185010374
                </span>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
