import { useState, useEffect } from 'react';
import { MenuItem, Order, Review, Coupon, CustomConfig, Enquiry } from './types';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import MenuSection from './components/MenuSection';
import WhyChooseUs from './components/WhyChooseUs';
import ReviewsSection from './components/ReviewsSection';
import ContactSection from './components/ContactSection';
import TiffinPlans from './components/TiffinPlans';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import OrderTrack from './components/OrderTrack';
import MyOrdersPortal from './components/MyOrdersPortal';
import CartDrawer from './components/CartDrawer';
import KitchenCurtain from './components/KitchenCurtain';
import HelpdeskWidget from './components/HelpdeskWidget';
import { getStructuredSchema, updatePageSEO } from './utils/seo';
import { ShoppingBag, Phone, ShieldCheck, Utensils, Star, ExternalLink, Globe, ClipboardList } from 'lucide-react';

export default function App() {
  // Database States loaded from Express Server
  const [config, setConfig] = useState<CustomConfig | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  // Client Application State
  const [cartItems, setCartItems] = useState<{ [id: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeView, setActiveView] = useState<'Store' | 'Admin' | 'MyOrders'>('Store');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [appIsLoading, setAppIsLoading] = useState(true);
  const [seoAnalyticsExpanded, setSeoAnalyticsExpanded] = useState(false);

  // Load initial systems state from full stack REST server
  const loadInitialData = async () => {
    try {
      const res = await fetch('/api/initial-state');
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setMenu(data.menu);
        setReviews(data.reviews);
        setCoupons(data.coupons);
        setOrders(data.orders);
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error("Failed connecting to Bhagwati database:", err);
    } finally {
      setAppIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Sync title and SEO protocols on load
  useEffect(() => {
    if (!config) return;
    updatePageSEO(
      `${config.brandName} | Authentic Indian Cloud Kitchen & Tiffin Services Pune`,
      "Premium, FSSAI certified, 100% pure-veg home-style Indian meals delivered straight in airtight hot packs. Ideal for students, professionals & families. Book daily subscriptions!"
    );

    // Inject structured local schema scripts dynamically
    const schemas = getStructuredSchema(config, menu);
    const existingScript1 = document.getElementById('seo-schema-restaurant');
    if (existingScript1) existingScript1.remove();

    const script1 = document.createElement('script');
    script1.id = 'seo-schema-restaurant';
    script1.type = 'application/ld+json';
    script1.innerHTML = schemas.restaurantSchema;
    document.head.appendChild(script1);

    const existingScript2 = document.getElementById('seo-schema-business');
    if (existingScript2) existingScript2.remove();

    const script2 = document.createElement('script');
    script2.id = 'seo-schema-business';
    script2.type = 'application/ld+json';
    script2.innerHTML = schemas.localBusinessSchema;
    document.head.appendChild(script2);

  }, [config, menu]);

  // Shopping cart modifiers
  const handleAddToCart = (item: MenuItem) => {
    setCartItems((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
    setIsCartOpen(true);
  };

  const handleIncrement = (id: string) => {
    setCartItems((prev) => ({
      ...prev,
      [id]: prev[id] + 1
    }));
  };

  const handleDecrement = (id: string) => {
    setCartItems((prev) => {
      const copy = { ...prev };
      if (copy[id] <= 1) {
        delete copy[id];
      } else {
        copy[id] -= 1;
      }
      return copy;
    });
  };

  const handleRemove = (id: string) => {
    setCartItems((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleAddTiffinSubscriptionToCart = (subscriptionName: string, price: number, durationDays: number) => {
    // Generate dummy menu item represent subscription nicely in shopping cart
    const subscriptionItem: MenuItem = {
      id: `subscription-${Date.now()}`,
      name: subscriptionName,
      description: `30-Day dietary subscription. Pausible anytime.`,
      price: price,
      category: 'Daily Tiffin',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop',
      isAvailable: true,
      isVeg: true
    };

    // Temporarily insert subscription dummy into local menu index so cart can display descriptions easily
    setMenu(prev => [subscriptionItem, ...prev]);
    
    // Add item directly to shopping cart
    setCartItems((prev) => ({
      ...prev,
      [subscriptionItem.id]: 1
    }));
    setIsCartOpen(true);
  };

  const handleReviewSubmission = async (name: string, rating: number, comment: string) => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rating, comment })
    });
    if (res.ok) {
      const data = await res.json();
      setReviews(data.reviews);
    } else {
      throw new Error();
    }
  };

  // Nav scroll helper
  const scrollToAnchor = (elementId: string) => {
    setActiveView('Store');
    setTrackingOrderId(null);
    setTimeout(() => {
      const elem = document.getElementById(elementId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  if (appIsLoading || !config) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50 flex-col gap-4 text-center">
        <Utensils className="w-12 h-12 text-orange-600 animate-bounce" />
        <h2 className="text-xl font-serif font-extrabold text-[#800020]">Bhagwati Cloud Kitchen</h2>
        <p className="text-xs text-neutral-400 font-sans tracking-wide">Cooking fresh home-cooked meals & scheduling tiffins...</p>
      </div>
    );
  }

  const itemsInCartCount = (Object.values(cartItems) as number[]).reduce((sum: number, current: number) => sum + current, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans text-neutral-800 bg-neutral-50/40 relative antialiased leading-relaxed">
      
      {/* Traditional Indian Saffron/Deep Maroon Double top-border Line Decoration */}
      <div className="h-1.5 bg-orange-600 w-full shrink-0" />
      <div className="h-1 bg-amber-400 w-full shrink-0" />

      {/* Header element */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/50 shadow-xs px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
          
          {/* Logo Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveView('Store');
                setTrackingOrderId(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 select-none text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#800020] text-amber-400 text-base font-serif font-black flex items-center justify-center border-2 border-amber-400 shadow-sm shadow-[#800020]/20">
                भ
              </div>
              <div>
                <span className="block font-serif font-black tracking-tight text-red-950 text-base leading-none">Bhagwati</span>
                <span className="block text-[10px] text-orange-600 font-extrabold uppercase mt-0.5 tracking-wider font-sans">Cloud Kitchen</span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Link anchors */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-neutral-600">
            <button onClick={() => scrollToAnchor('hero-section')} className="hover:text-red-950 transition cursor-pointer">Main Home</button>
            <button onClick={() => scrollToAnchor('menu-section')} className="hover:text-red-950 transition cursor-pointer">Cuisine Menu</button>
            <button onClick={() => scrollToAnchor('about-section')} className="hover:text-red-950 transition cursor-pointer">About Kitchen</button>
            <button onClick={() => scrollToAnchor('tiffin-section')} className="hover:text-red-950 transition cursor-pointer">Monthly Tiffins</button>
            <button onClick={() => scrollToAnchor('reviews-section')} className="hover:text-red-950 transition cursor-pointer">Reviews</button>
            <button onClick={() => scrollToAnchor('contact-section')} className="hover:text-red-950 transition cursor-pointer">Our Coordinates</button>
          </nav>

          {/* Core interaction icons */}
          <div className="flex items-center gap-4 shrink-0">
            
            {/* Operator Voice Direct phone trigger */}
            <a 
              href={`tel:${config.mobileNumber}`} 
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-extrabold text-neutral-700 transition"
              id="header-phone-box"
            >
              <Phone className="w-3.5 h-3.5 text-orange-600" />
              <span>+91 {config.mobileNumber}</span>
            </a>

            {/* My Orders & Tracking Trigger */}
            {activeView !== 'Admin' && (
              <button
                id="header-my-orders-btn"
                onClick={() => {
                  setTrackingOrderId(null);
                  setActiveView(activeView === 'MyOrders' ? 'Store' : 'MyOrders');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer select-none leading-none ${
                  activeView === 'MyOrders'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/15'
                    : 'bg-orange-50 hover:bg-orange-100/80 text-orange-950 border border-orange-200'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5 text-orange-600 transition" />
                <span className="hidden sm:inline">Track Orders 📋</span>
                <span className="inline sm:hidden">Track</span>
              </button>
            )}

            {/* View Tab Toggle */}
            <button
              id="header-btn-toggle-view"
              onClick={() => {
                setTrackingOrderId(null);
                setActiveView(activeView === 'Store' ? 'Admin' : 'Store');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeView === 'Admin'
                  ? 'bg-neutral-200 text-[#800020] border-2 border-[#800020]/20'
                  : 'bg-red-950 text-white hover:bg-orange-600 shadow-md shadow-red-950/10'
              }`}
            >
              {activeView === 'Admin' ? '← Main Public Site' : 'Owner Admin Portal 🔐'}
            </button>

            {/* Shopping Basket Trigger */}
            {activeView === 'Store' && (
              <button
                id="header-basket-btn"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl transition cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                {itemsInCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                    {itemsInCartCount}
                  </span>
                )}
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Main Viewport Content block */}
      <main className="flex-1">
        {trackingOrderId ? (
          <OrderTrack 
            orderId={trackingOrderId} 
            onBack={() => setTrackingOrderId(null)} 
            brandPhone={config.mobileNumber} 
          />
        ) : activeView === 'Admin' ? (
          !isAdminLoggedIn ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <AdminLogin
                onLoginSuccess={() => setIsAdminLoggedIn(true)}
                onCancel={() => setActiveView('Store')}
                brandName={config.brandName}
              />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="mb-6 bg-red-950 text-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-sans gap-3">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Developer Sandbox Environment Active. Pure database persistence is enabled via files.
                </span>
                <div className="flex gap-4 font-bold">
                  <button 
                    onClick={() => setIsAdminLoggedIn(false)} 
                    className="underline hover:text-white cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Log Out 🔓</span>
                  </button>
                  <button onClick={() => setActiveView('Store')} className="underline hover:text-white cursor-pointer">
                    Return to Shop View Model
                  </button>
                </div>
              </div>
              
              <AdminDashboard
                menu={menu}
                orders={orders}
                reviews={reviews}
                coupons={coupons}
                config={config}
                enquiries={enquiries}
                onUpdateMenu={setMenu}
                onUpdateConfig={setConfig}
                onUpdateReviews={setReviews}
                onUpdateCoupons={setCoupons}
                onUpdateOrders={setOrders}
                onUpdateEnquiries={setEnquiries}
              />
            </div>
          )
        ) : activeView === 'MyOrders' ? (
          <MyOrdersPortal 
            onSelectOrder={(orderId) => {
              setTrackingOrderId(orderId);
              setActiveView('Store');
            }}
            onClose={() => setActiveView('Store')}
            brandPhone={config.mobileNumber}
          />
        ) : (
          <div>
            {/* USER SITE SECTIONS */}
            <Hero 
              config={config} 
              onNavigateToMenu={() => scrollToAnchor('menu-section')} 
              onNavigateToTiffin={() => scrollToAnchor('tiffin-section')} 
            />
            
            <TiffinPlans 
              onAddTiffinSubscription={handleAddTiffinSubscriptionToCart} 
              brandPhone={config.mobileNumber}
            />
            
            <MenuSection 
              menu={menu} 
              onAddToCart={handleAddToCart} 
              cartCount={cartItems} 
            />

            <AboutUs />
            
            <WhyChooseUs />
            
            <ReviewsSection 
              reviews={reviews} 
              onSubmitReview={handleReviewSubmission} 
            />
            
            <ContactSection config={config} />
          </div>
        )}
      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-neutral-900 text-white pt-16 pb-8 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Column 1: Brand details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-lg bg-orange-600 text-white font-serif font-black flex items-center justify-center border border-amber-300">
                  भ
                </div>
                <span className="font-serif font-extrabold text-sm leading-none text-neutral-100 uppercase tracking-tight">Bhagwati Cloud Kitchen</span>
              </div>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Pioneering delicious homestyle Indian vegetarian meal deliverable systems in Pune, FSSAI certified workspace parameters.
              </p>
              <p className="text-xs text-orange-400 font-mono font-semibold">
                Helpline: +91 {config.mobileNumber}
              </p>
            </div>

            {/* Column 2: Quick navigation anchors */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-200">Delectable Categories</h4>
              <ul className="text-xs text-neutral-400 space-y-2 font-sans">
                <li><button onClick={() => scrollToAnchor('menu-section')} className="hover:text-orange-400 transition cursor-pointer">Fresh Breakfast</button></li>
                <li><button onClick={() => scrollToAnchor('menu-section')} className="hover:text-orange-400 transition cursor-pointer">Homestyle Lunch Thalis</button></li>
                <li><button onClick={() => scrollToAnchor('menu-section')} className="hover:text-orange-400 transition cursor-pointer">Standard Dinner Feasts</button></li>
                <li><button onClick={() => scrollToAnchor('tiffin-section')} className="hover:text-orange-400 transition cursor-pointer">Monthly Pausable Tiffins</button></li>
              </ul>
            </div>

            {/* Column 3: Legal policy definitions */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-200">Tiffin Policies</h4>
              <ul className="text-xs text-neutral-400 space-y-2 font-sans">
                <li><span className="hover:text-orange-400 cursor-help" title="If you pause within 12h, we refund or shift tiffin quotas indefinitely">Pausable quota Refund Policy</span></li>
                <li><span className="hover:text-orange-400 cursor-help" title="SSL encrypted 100% security checkout verified">Secure payments terms</span></li>
                <li><span className="hover:text-orange-400 cursor-help" title="Your address coordinates and phone numbers are encrypted">Client GDPR Privacy guidelines</span></li>
                <li><span className="hover:text-orange-400 cursor-help" title="FSSAI standard certified packaging">Sanitization & Safety certifications</span></li>
              </ul>
            </div>

            {/* Column 4: Local SEO keyword analyzer */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-200">Local SEO optimization</h4>
              <p className="text-[10px] text-neutral-400 leading-relaxed font-sans">
                This platform is dynamically equipped with structured metatags to target query tags:
              </p>
              <div className="flex flex-wrap gap-1">
                {["Cloud Kitchen Near Me", "Best Tiffin Service", "Veg Tiffin", "Pune Home Food", "Daily Meal Service", "Bhagwati Cloud Kitchen"].map((key) => (
                  <span key={key} className="text-[9px] bg-neutral-800 text-neutral-400 border border-neutral-700/60 px-2 py-0.5 rounded font-mono">
                    {key}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Technical Dynamic SEO Inspections console for owners */}
          <div className="border-t border-neutral-800 pt-8 text-neutral-500 text-xs">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <p className="text-[11px] font-sans">© 2026 Bhagwati Cloud Kitchen. All rights reserved. Crafted for extreme customer trust & conversion.</p>
              </div>

              {/* Dynamic robots / sitemap diagnostic link triggers */}
              <div className="flex gap-4 text-[10px] uppercase font-mono font-bold">
                <a href="/sitemap.xml" target="_blank" className="hover:text-amber-400 transition inline-flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-orange-600" /> Page index Sitemap.xml <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <a href="/robots.txt" target="_blank" className="hover:text-amber-400 transition inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-600" /> Robot Rules <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* Cart Drawer sliding element */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        menu={menu}
        config={config}
        coupons={coupons}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onRemove={handleRemove}
        onClearCart={() => setCartItems({})}
        onOrderPlaced={(orderId) => setTrackingOrderId(orderId)}
      />

      <KitchenCurtain 
        config={config} 
        onOpenOrdersHistory={() => setActiveView('MyOrders')} 
      />

      <HelpdeskWidget />

    </div>
  );
}
