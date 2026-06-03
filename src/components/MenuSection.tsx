import { useState } from 'react';
import { MenuItem } from '../types';
import { Search, ShoppingBag, Flame, Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuSectionProps {
  menu: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  cartCount: Record<string, number>;
}

const CATEGORIES = [
  'All',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Daily Tiffin',
  'Special Thali',
  'Snacks',
  'Beverages'
];

export default function MenuSection({ menu, onAddToCart, cartCount }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVeg, setOnlyVeg] = useState(false);

  // Filter logic
  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = !onlyVeg || item.isVeg;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  return (
    <section id="menu-section" className="py-20 bg-neutral-50 border-t border-neutral-200/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">Cuisine & Flavour</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 leading-tight">
            Explore Bhagwati's Traditional Indian Menu
          </h2>
          <p className="text-sm text-neutral-500 font-sans">
            Freshly prepared, hygiene sealed kitchen orders. Delivered instantly inside Pune with pure-veg values.
          </p>
        </div>

        {/* Search, Filter & Dietary toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-neutral-200/50 shadow-xs mb-8">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search dishes (e.g. Paratha, Thali, Lassi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyVeg}
                onChange={() => setOnlyVeg(!onlyVeg)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              <span className="ml-2.5 text-xs font-bold text-neutral-700 flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-green-700 rounded-full inline-block border border-white" />
                Pure Veg Only ({menu.filter(m => m.isVeg).length})
              </span>
            </label>
          </div>
        </div>

        {/* Categories Tab selector */}
        <div className="flex overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-200 gap-2 mb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`tab-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 text-xs font-bold whitespace-nowrap rounded-xl transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-red-950 text-white shadow-md shadow-red-950/20'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food Menu Grid Layout */}
        <div id="food-menu-items-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredMenu.map((item) => {
              const qtyInCart = cartCount[item.id] || 0;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  key={item.id}
                  className="group bg-white rounded-2xl border border-neutral-200/60 overflow-hidden shadow-xs hover:shadow-lg hover:border-orange-200 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Food Relative Image Block */}
                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Popular Badge */}
                      {item.isPopular && (
                        <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[10px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3 h-3" /> Popular Choice
                        </span>
                      )}

                      {/* Pure Veg Green Circle Sign */}
                      <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md p-1.5 rounded-lg border border-neutral-200 shrink-0">
                        <span className="w-3 h-3 rounded-md bg-green-700 block border-2 border-white shadow-xs" title="100% Guaranteed Veg" />
                      </span>

                      {/* Spicy indicator */}
                      {item.spicyLevel && item.spicyLevel !== 'Mild' && (
                        <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-neutral-200 text-[10px] font-bold text-red-700 flex items-center gap-0.5">
                          <Flame className="w-3.5 h-3.5 text-orange-600" /> {item.spicyLevel} Spice
                        </span>
                      )}
                    </div>

                    {/* Meta Description Box */}
                    <div className="p-5 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-base font-bold text-neutral-900 group-hover:text-red-950 transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold leading-none shrink-0 bg-amber-50 px-2 py-1 rounded-md">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span>{item.rating || 4.7}</span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-500 font-sans line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-medium">
                        <span>Veg Standard</span>
                        <span>•</span>
                        <span>{item.prepTime || '15 mins'} prep</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing row with Checkout action */}
                  <div className="px-5 pb-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase font-bold tracking-wider">Price</span>
                      <span className="text-lg font-extrabold text-neutral-900">
                        ₹{item.price.toLocaleString('en-IN')}
                        {item.category === 'Daily Tiffin' && <span className="text-xs text-neutral-500 font-medium font-sans"> / month</span>}
                      </span>
                    </div>

                    {item.isAvailable ? (
                      <button
                        id={`btn-add-to-basket-${item.id}`}
                        onClick={() => onAddToCart(item)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-red-950 hover:bg-orange-600 text-white rounded-xl transition duration-300 group-hover:shadow-md cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                        {qtyInCart > 0 ? `In Basket (${qtyInCart})` : 'Add to Basket'}
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-3 py-1.5 rounded-lg">
                        Un-available
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Fallback empty view */}
          {filteredMenu.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-300">
              <p className="text-sm text-neutral-400 font-medium font-serif">No delectable dishes found matching description.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setOnlyVeg(false);
                  setSelectedCategory('All');
                }}
                className="mt-3 px-4 py-2 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
