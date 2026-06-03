import { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Check, AlertTriangle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { CustomConfig } from '../types';

interface HeroProps {
  config: CustomConfig;
  onNavigateToMenu: () => void;
  onNavigateToTiffin: () => void;
}

export default function Hero({ config, onNavigateToMenu, onNavigateToTiffin }: HeroProps) {
  const [pincodeInput, setPincodeInput] = useState('');
  const [checkStatus, setCheckStatus] = useState<'idle' | 'available' | 'unavailable'>('idle');

  const checkDeliveryArea = () => {
    if (!pincodeInput.trim()) return;
    if (config.allowedPincodes.includes(pincodeInput.trim())) {
      setCheckStatus('available');
    } else {
      setCheckStatus('unavailable');
    }
  };

  return (
    <div id="hero-section" className="relative min-h-[90vh] bg-neutral-50 flex items-center pt-20 overflow-hidden">
      {/* Decorative Traditional Indian Arch Grid / Saffron and Gold Background Gradients */}
      <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-gradient-to-l from-orange-100/40 via-amber-50/20 to-transparent pointer-events-none" />
      <div className="absolute top-10 left-10 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-100/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-24 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text and CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Tag / Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
              100% Pure Veg & Hygienic Home Food
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight leading-none">
              <span className="text-red-950 font-serif">Bhagwati</span> <br />
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                Cloud Kitchen
              </span>
            </h1>

            <p className="text-lg text-neutral-600 max-w-xl font-sans font-medium lead-relaxed">
              "Fresh Homemade Food Delivered to Your Doorstep." Experience delicious traditional recipes cooked with organic ingredients and ultimate hygiene.
            </p>

            {/* Visual Indicators */}
            <div className="grid grid-cols-3 gap-4 border-y border-neutral-200/60 py-4 max-w-xl text-neutral-700 font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Zero Soda / Preservatives</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Daily Fresh Deliveries</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm">FSSAI Certified Cooking</span>
              </div>
            </div>

            {/* Call to Action Row */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                id="btn-hero-order-now"
                onClick={onNavigateToMenu}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold shadow-lg shadow-orange-600/30 bg-orange-600 hover:bg-orange-700 transition duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Order Now
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-hero-view-tiffin"
                onClick={onNavigateToTiffin}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold border-2 border-red-950/20 text-red-950 bg-white hover:bg-neutral-50 transition duration-300 cursor-pointer"
              >
                View Tiffin Plans
              </button>

              <a
                id="btn-hero-call-now"
                href={`tel:${config.mobileNumber}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100/70 transition duration-300"
              >
                <Phone className="w-4 h-4 text-orange-600" />
                <span>+91 {config.mobileNumber}</span>
              </a>
            </div>

            {/* Pincode Availability Checker */}
            <div id="pincode-checker" className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200/60 max-w-lg mt-6">
              <h3 className="text-sm font-bold text-neutral-800 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-600" /> Check Instant Delivery Area Pincode
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode (e.g. 411037)"
                  value={pincodeInput}
                  onChange={(e) => {
                    setPincodeInput(e.target.value.replace(/\D/g, ''));
                    setCheckStatus('idle');
                  }}
                  className="flex-1 px-4 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 transition"
                />
                <button
                  id="btn-check-availability"
                  onClick={checkDeliveryArea}
                  className="px-5 py-2 text-sm font-bold text-white bg-red-950 hover:bg-red-900 rounded-xl transition cursor-pointer"
                >
                  Verify Area
                </button>
              </div>

              {/* Status Message */}
              {checkStatus === 'available' && (
                <p className="text-xs text-green-700 font-semibold mt-2.5 flex items-center gap-1 bg-green-50 p-2 rounded-lg">
                  <Check className="w-4 h-4" /> We deliver to your area! Hot meals will reach within 40 minutes.
                </p>
              )}
              {checkStatus === 'unavailable' && (
                <p className="text-xs text-red-700 font-semibold mt-2.5 flex items-center gap-1 bg-red-50 p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Currently we don't service this pincode. Standard service pincodes include: {config.allowedPincodes.slice(0, 4).join(', ')} etc.
                </p>
              )}
            </div>
          </motion.div>

          {/* Image Block Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative flex justify-center"
          >
            {/* Elegant Background Gold Frame */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-3xl transform rotate-3 scale-95 blur-xs opacity-80" />
            
            <div className="relative bg-white p-3 rounded-3xl shadow-2xl overflow-hidden aspect-square max-w-[450px] w-full border border-neutral-200">
              <img
                src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=700&auto=format&fit=crop"
                alt="Bhagwati Indian Gourmet Meal Traditional Thali"
                loading="eager"
                className="w-full h-full object-cover rounded-2xl"
              />
              {/* Overlaid Float Cards */}
              <div className="absolute bottom-6 left-6 right-6 bg-red-950/95 backdrop-blur-md p-4 rounded-2xl text-white border border-white/10 shadow-lg">
                <p className="text-xs text-orange-400 uppercase tracking-widest font-bold">Featured Recipe</p>
                <h4 className="text-lg font-serif font-bold mt-0.5">Bhagwati Special Maharaja Thali</h4>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                  <span className="text-xs text-neutral-300">Contains 11 Authentic Dishes</span>
                  <span className="text-sm font-bold text-amber-400">Just ₹230</span>
                </div>
              </div>

              {/* Floating review count bubble */}
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1 shadow-md">
                <span className="text-amber-500">★</span> 4.9 Rating (420+ Orders)
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
