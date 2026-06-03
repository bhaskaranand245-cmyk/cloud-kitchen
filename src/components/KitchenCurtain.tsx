import React, { useState, useEffect } from 'react';
import { CustomConfig } from '../types';
import { 
  checkIsKitchenClosed, 
  getRemainingHoursAndMinutes, 
  formatTime12h 
} from '../utils/time';
import { 
  Moon, 
  Sun, 
  Clock, 
  ExternalLink, 
  ChevronRight, 
  Coffee, 
  UtensilsCrossed, 
  X,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KitchenCurtainProps {
  config: CustomConfig;
  onOpenOrdersHistory: () => void;
}

export default function KitchenCurtain({ config, onOpenOrdersHistory }: KitchenCurtainProps) {
  const isEnabled = config.isCloseCurtainEnabled ?? true;
  const opTime = config.openingTime ?? "08:00";
  const clTime = config.closingTime ?? "22:00";
  const customMessage = config.closeCurtainMessage || "Our kitchen is resting. Browse our menu to plan your next order!";

  // Check state
  const [isCurrentlyClosed, setIsCurrentlyClosed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Check state every 10 seconds
  useEffect(() => {
    if (!isEnabled) {
      setIsCurrentlyClosed(false);
      return;
    }

    const checkState = () => {
      const closed = checkIsKitchenClosed(opTime, clTime);
      setIsCurrentlyClosed(closed);
      if (closed) {
        setTimeLeft(getRemainingHoursAndMinutes(opTime));
      }
    };

    checkState();
    const interval = setInterval(checkState, 15000);
    return () => clearInterval(interval);
  }, [isEnabled, opTime, clTime]);

  if (!isCurrentlyClosed) return null;

  // Let the user browse but keep a subtle reminder
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 left-4 z-50">
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-red-950 text-white border border-amber-300 px-4 py-3 rounded-full shadow-2xl hover:bg-orange-600 transition cursor-pointer select-none text-[11px] font-bold"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <Moon className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span>Kitchen Resting • Pre-orders Active 🌙</span>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="w-full max-w-xl bg-[#1c0f0f] border border-red-900 rounded-3xl overflow-hidden p-6 sm:p-8 text-left shadow-2xl relative"
      >
        {/* Intricate top-right close handle */}
        <button
          onClick={() => setIsMinimized(true)}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-neutral-900/50 hover:bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white transition cursor-pointer"
          title="Browse Menu"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient background accent decoration */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-52 h-52 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-44 h-44 bg-red-800/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand details header */}
        <div className="flex items-center gap-2 text-left pb-4 border-b border-red-900/40">
          <div className="w-7 h-7 rounded-lg bg-orange-600 text-white font-serif font-black flex items-center justify-center border border-amber-300 text-xs">
            भ
          </div>
          <span className="font-serif font-extrabold text-[11px] leading-none text-orange-200 uppercase tracking-wider">
            {config.brandName || "Bhagwati Thali"}
          </span>
        </div>

        {/* Celestial main announcement card */}
        <div className="space-y-6 pt-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950 border border-orange-500/30 text-orange-400 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase">
              <Moon className="w-3.5 h-3.5 animate-pulse" /> Kitchen Curfew ACTIVE
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-black text-neutral-100 leading-tight">
              Our Cooking Ovens are Resting...
            </h1>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed font-sans bg-neutral-900/40 p-4 rounded-xl border border-red-950">
            {customMessage}
          </p>

          {/* Time display indicator widgets */}
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 bg-neutral-900/50 border border-neutral-800/60 rounded-2xl">
              <span className="text-[9px] text-neutral-400 uppercase tracking-widest block font-medium">Curfew Period</span>
              <span className="text-xs font-mono font-bold text-neutral-200">
                {formatTime12h(clTime)} to {formatTime12h(opTime)}
              </span>
            </div>

            <div className="p-4 bg-neutral-900/50 border border-neutral-800/60 rounded-2xl flex flex-col justify-between">
              <span className="text-[9px] text-neutral-400 uppercase tracking-widest block font-medium">Reopens In</span>
              <span className="text-xs font-mono font-bold text-orange-400 animate-pulse flex items-center gap-1 leading-none">
                <Clock className="w-3 h-3 text-orange-500" /> {timeLeft || 'Reopening shortly'}
              </span>
            </div>
          </div>

          {/* Action Row options */}
          <div className="flex flex-col gap-2.5 pt-4">
            <button
              onClick={() => setIsMinimized(true)}
              className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-neutral-950 font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 select-none"
            >
              <UtensilsCrossed className="w-4 h-4 text-neutral-950" />
              <span>Explore Thali Menus & Plans anyway</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={`https://wa.me/91${config.mobileNumber}?text=Hello%20Bhagwati%20Kitchen!%20Looking%20to%20pre-book%20a%20delicious%2520thali%2520or%2520tiffin%2520subscription%2520for%2520tomorrow.`}
                target="_blank"
                rel="noopener"
                className="py-3.5 px-3 bg-neutral-900 border border-neutral-800 text-emerald-400 hover:text-white transition rounded-xl text-center text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>Pre-book on WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setIsMinimized(true);
                  onOpenOrdersHistory();
                }}
                className="py-3.5 px-2 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition rounded-xl text-center text-xs font-bold cursor-pointer"
              >
                📋 Track Pending Delivery
              </button>
            </div>
          </div>
        </div>

        {/* Footer trademark lines */}
        <p className="text-[8.5px] text-neutral-500 text-center mt-6 font-sans">
          FSSAI Lic. № 21524190800000 • Pure Veg Homestyle Cloud Kitchens Pune
        </p>
      </motion.div>
    </div>
  );
}
