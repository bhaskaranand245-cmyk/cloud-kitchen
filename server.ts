import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { MenuItem, Order, Review, Coupon, CustomConfig, SubscriptionPlan, PaymentSettings, Enquiry } from './src/types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Express cache-busting middleware for API endpoints
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Initialize file-based database paths
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const TEMP_DB_FILE = path.join(DATA_DIR, 'db.temp.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default payment options
const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  isTestMode: true,
  codMinOrderValue: 150,
  gateways: [
    { id: 'razorpay', name: 'Razorpay', isEnabled: true, apiKey: 'rzp_test_581938501', apiSecret: 'rzp_secret_94719', isCustomInstructionsEnabled: true, instructions: 'Pay securely using Credit/Debit Cards, UPI, or Net Banking with Razorpay commercial gateway.' },
    { id: 'phonepe', name: 'PhonePe', isEnabled: true, apiKey: 'ppe_mid_2810385', apiSecret: 'ppe_secret_75819', isCustomInstructionsEnabled: true, instructions: 'Pay instantly via PhonePe App secure transaction links.' },
    { id: 'paytm', name: 'Paytm', isEnabled: true, apiKey: 'paytm_mid_491823', isCustomInstructionsEnabled: false, instructions: 'Fast checks via Paytm Wallet or associated bank accounts.' },
    { id: 'gpay', name: 'Google Pay (UPI)', isEnabled: true, isCustomInstructionsEnabled: true, instructions: 'No extra gateway fees. Pay instantly from your bank using Google Pay direct link.' },
    { id: 'bhim', name: 'BHIM UPI', isEnabled: false, isCustomInstructionsEnabled: true, instructions: 'National Payments Corporation of India (NPCI) official BHIM wallet interface.' },
    { id: 'cards_credit', name: 'Credit Cards', isEnabled: true, isCustomInstructionsEnabled: true, instructions: 'Visa, MasterCard, Amex, and RuPay credit cards processed securely with tokenization.', extraChargePercentOrFixed: 1.5, extraChargeType: 'percent' },
    { id: 'cards_debit', name: 'Debit Cards', isEnabled: true, isCustomInstructionsEnabled: true, instructions: 'Secure instant debit card checkout using online bank-level OTP prompts.', extraChargePercentOrFixed: 0, extraChargeType: 'percent' },
    { id: 'netbanking', name: 'Net Banking', isEnabled: true, isCustomInstructionsEnabled: true, instructions: 'All major Indian corporate and private retail banks supported.', extraChargePercentOrFixed: 10, extraChargeType: 'fixed' },
    { id: 'cod', name: 'Cash on Delivery', isEnabled: true, isCustomInstructionsEnabled: true, instructions: 'Hand over cash to our delivery executive. Please keep exact change ready.', extraChargePercentOrFixed: 15, extraChargeType: 'fixed' }
  ]
};

// Initial default configuration
const DEFAULT_CONFIG: CustomConfig = {
  brandName: "Bhagwati Cloud Kitchen",
  mobileNumber: "9960877739",
  email: "orders@bhagwaticloudkitchen.com",
  address: "Shop No. 4, Ground Floor, Bhagwati Enclave, Near Market Place, Pune, Maharashtra 411037",
  googleMapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.3891461148114!2d73.8545802!3d18.5126155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c069ebffffff%3A0x6aefbf4df508b049!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1717315180000!5m2!1sen!2sin",
  isUnderServiceAreaOnly: true,
  allowedPincodes: ["411037", "411001", "411002", "411009", "411011", "411030", "411042"],
  gstPercent: 5, // 5% GST for cloud restaurants
  deliveryCharge: 30, // Rs. 30 flat
  loyaltyPointsPer100: 10, // 10 points for every 100 Rs spent
  paymentSettings: DEFAULT_PAYMENT_SETTINGS,
  closingTime: "22:00",
  openingTime: "08:00",
  isCloseCurtainEnabled: true,
  closeCurtainMessage: "Our kitchen is currently resting (Hours: 10:00 PM to 8:00 AM). You can still browse our curated Pune thali menus, tiffin services, or pre-book slots for tomorrow's feast!"
};

// Initial default menu
const DEFAULT_MENU: MenuItem[] = [
  // Breakfast
  {
    id: "m1",
    name: "Signature Paneer Paratha",
    description: "Golden whole-wheat flatbread stuffed with spicy scrambled fresh paneer, spiced onion, and coriander. Served with home-churned white butter and spiced mango pickle.",
    price: 110,
    category: "Breakfast",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
    isVeg: true,
    spicyLevel: "Medium",
    rating: 4.8,
    prepTime: "15 mins",
    isPopular: true
  },
  {
    id: "m2",
    name: "Banarasi Kanda Poha",
    description: "Indore-Banaras style fluffy flattened rice tempered with mustard seeds, curry leaves, yellow turmeric, and crunchy peanuts, topped with fresh juicy pomegranate seeds.",
    price: 75,
    category: "Breakfast",
    image: "https://images.unsplash.com/photo-1622322482312-d0ee17d72740?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
    isVeg: true,
    spicyLevel: "Mild",
    rating: 4.6,
    prepTime: "10 mins"
  },
  {
    id: "m3",
    name: "Chowpatty Pav Bhaji",
    description: "Thick, spicy potato-mashing curry slow cooked on huge flat tawa with handground Kolhapuri masalas and loads of butter, served with 2 super soft butter-toasted buns.",
    price: 99,
    category: "Breakfast",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
    isVeg: true,
    spicyLevel: "Hot",
    rating: 4.9,
    prepTime: "12 mins",
    isPopular: true
  },
  // Lunch
  {
    id: "m4",
    name: "Ghar Ki Thali Extraordinaire",
    description: "Wholesome simple lunch containing 3 hand-toasted soft Ghee Rotis, Homestyle Garlic Dal Tadka, Aromatic Paneer Butter Masala, Dry Jeera Aloo Sabzi, Steamed Basmati Rice, Fresh Greens, Papad, and 1 Gulab Jamun.",
    price: 165,
    category: "Lunch",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
    isVeg: true,
    spicyLevel: "Medium",
    rating: 4.9,
    prepTime: "20 mins",
    isPopular: true
  },
  {
    id: "m5",
    name: "Afeem-Spiced Chole Bhature Combo",
    description: "Traditional Delhi-style chickpeas simmered over 8 hours in dark, fragrant black cardamom, bay leaves & tea water infusion. Served with two ultra-fluffy hot fried Bhature and raw spiced pickling onion.",
    price: 130,
    category: "Lunch",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
    isVeg: true,
    spicyLevel: "Hot",
    rating: 4.7,
    prepTime: "15 mins"
  },
  {
    id: "m6",
    name: "Paneer Tikka Masala Rice Bowl",
    description: "Smoky tandoor-cooked paneer cubes folded into a highly rich cashew cream tomato gravy, layered on a bed of fluffy long-grain basmati jeera rice. Perfect single-serve lunch box.",
    price: 180,
    category: "Lunch",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
    isVeg: true,
    spicyLevel: "Medium",
    rating: 4.8,
    prepTime: "15 mins"
  },
  // Dinner
  {
    id: "m7",
    name: "Bhagwati Special Maharaja Thali",
    description: "Premium royal feast featuring Slow-cooked Dal Makhani with white butter, rich Kaju Paneer Butter Masala, Dry Jeera Methi Aloo, fragrant Dum Veg Biryani, 2 crisp Butter Laccha Parathas, chilled Cucumber Boondi Raita, Roasted Papad, Pickled Onions, and 2 Melt-in-mouth hot Gulab Jamuns.",
    price: 230,
    category: "Dinner",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
    isVeg: true,
    spicyLevel: "Medium",
    rating: 5.0,
    prepTime: "25 mins",
    isPopular: true
  },
  {
    id: "m8",
    name: "Twice-Tempered Ghee Dal Khichdi",
    description: "Soul food prepared with yellow moong lentils & premium rice, twice tempered in aromatic cow ghee with crushed dry garlic, cumin seeds, dry red chilies, and fresh green coriander.",
    price: 120,
    category: "Dinner",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
    isVeg: true,
    spicyLevel: "Mild",
    rating: 4.7,
    prepTime: "12 mins"
  },
  // Daily Tiffin
  {
    id: "m9",
    name: "Monthly Regular Tiffin (1 Meal/Day)",
    description: "Homestyle monthly subscription. 30 Days daily delivery of fresh Lunch-box OR Dinner-box containing 4 soft Rotis, Dal, dry Subji, Rice, Salad, Pickle. Zero soda, zero artificial colors, absolute homemade hygiene.",
    price: 3200,
    category: "Daily Tiffin",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
    isVeg: true,
    spicyLevel: "Mild",
    rating: 4.9,
    prepTime: "Scheduled Daily"
  },
  {
    id: "m10",
    name: "Monthly Elite Tiffin (2 Meals/Day)",
    description: "Full nutrition tiffin pack. 30 Days daily delivery of BOTH fresh Lunch and hot Dinner. Balanced protein veggies, homestyle hand-rolled chapatis and light seasonal green subjis. Free delivery.",
    price: 5800,
    category: "Daily Tiffin",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
    isVeg: true,
    spicyLevel: "Mild",
    rating: 4.9,
    prepTime: "Scheduled Daily",
    isPopular: true
  },
  // Special Thali
  {
    id: "m11",
    name: "Kashmiri Shahi Festive Thali",
    description: "Deluxe festival menu: Shahi Paneer Lababdar, Dum Aloo Kashmiri, Slow Melt Dal Fry, Kesar Dry Fruit Rice Pulao, 2 crisp Laccha Paratha, cream loaded Shahi Kheer, dry papad, mango chutney.",
    price: 275,
    category: "Special Thali",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
    isVeg: true,
    spicyLevel: "Medium",
    rating: 4.8,
    prepTime: "25 mins"
  },
  // Snacks
  {
    id: "m12",
    name: "Delhi-Style Samosa Chaat",
    description: "Two crispy golden-fried spiced potato samosas crushed and topped with hot chickpea curry (Ragda), sweet date-tamarind chutney, spicy coriander mint chutney, zero-size sev, and fresh pomegranate.",
    price: 70,
    category: "Snacks",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
    isVeg: true,
    spicyLevel: "Medium",
    rating: 4.7,
    prepTime: "10 mins"
  },
  // Beverages
  {
    id: "m13",
    name: "Royal Golden Kesar Lassi",
    description: "Chilled rich sweet yogurt churned slow with real Kashmiri saffron strands, fragrant green cardamom powder, rose water extract, topped with sliced pistachios and almonds.",
    price: 65,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
    isVeg: true,
    spicyLevel: "Mild",
    rating: 4.8,
    prepTime: "5 mins"
  }
];

// Initial default reviews
const DEFAULT_REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Bhaskar Anand",
    rating: 5,
    comment: "The Maharaja Thali is absolutely delicious! Very hygienic packaging, real homemade taste, and came smoking hot. The Paneer Butter Masala was rich and authentic. Highly recommended for daily tiffins!",
    date: "2026-05-30T10:00:00Z",
    isApproved: true,
    replyText: "Thank you Bhaskar! We use premium ingredients to maintain that home taste. Glad you loved our Maharaja Thali!"
  },
  {
    id: "r2",
    name: "Pooja Deshmukh",
    rating: 5,
    comment: "Excellent monthly tiffin service. They maintain very low oil and spices so that it doesn't feel heavy even after eating daily. Timely delivery is a huge plus. The dal tadka tastes just like mom's cooking.",
    date: "2026-05-28T14:30:00Z",
    isApproved: true,
    replyText: "Thank pooja! Our kitchen is completely focused on health and hygiene for our daily subscription friends."
  },
  {
    id: "r3",
    name: "Ketan Kulkarni",
    rating: 4,
    comment: "Loved their Pav Bhaji and Kesar Lassi. The packaging of the pav bhaji was fully leak-proof. Price is highly affordable for the quality they provide.",
    date: "2026-06-01T12:15:00Z",
    isApproved: true,
    replyText: "Appreciate your kind review Ketan! Keep ordering your favorite meals."
  }
];

const DEFAULT_COUPONS: Coupon[] = [
  {
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 150,
    description: "Get 10% OFF on your first Indian homemade meal order above ₹150!"
  },
  {
    code: "BHAGWATI100",
    discountType: "fixed",
    discountValue: 100,
    minOrderValue: 499,
    description: "Save a flat ₹100 on large premium orders above ₹499."
  },
  {
    code: "TIFFIN250",
    discountType: "fixed",
    discountValue: 250,
    minOrderValue: 2500,
    description: "Save ₹250 on premium Monthly Tiffin subscriptions!"
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: "BK-1082",
    customerName: "Ramesh Sharma",
    customerMobile: "9876543210",
    deliveryAddress: "Flat 202, Sunshine Heights, Near NIBM Road",
    pincode: "411037",
    items: [
      { menuItemId: "m4", name: "Ghar Ki Thali Extraordinaire", price: 165, quantity: 2 },
      { menuItemId: "m13", name: "Royal Golden Kesar Lassi", price: 65, quantity: 2 }
    ],
    couponCode: "WELCOME10",
    discountAmount: 46,
    gstAmount: 20.7,
    deliveryCharge: 30,
    totalAmount: 464.7,
    paymentMethod: "UPI",
    paymentStatus: "Completed",
    orderStatus: "Delivered",
    createdAt: "2026-06-01T08:30:00Z",
    notes: "Please pack properly and send steel spoons."
  }
];

const DEFAULT_ENQUIRIES: Enquiry[] = [
  {
    id: "enq-1",
    name: "Ramesh Patil",
    email: "ramesh.patil@outlook.com",
    subject: "Custom Spice Adjustments for Kids & Seniors",
    message: "Namaste, we want to subscribe to your 6 days monthly lunch tiffins. Do you provide a mild spicy option for kids and seniors? And clean cooking with double filtered sesame/groundnut oil?",
    status: "Pending",
    createdAt: "2026-06-05T09:15:00Z"
  },
  {
    id: "enq-2",
    name: "Priya Joshi",
    email: "priya.joshi@gmail.com",
    subject: "Sunday Tiffin Delivery Rules in Pune",
    message: "Hello team, do you deliver monthly tiffin plans on Sundays? I am living in Kothrud and love your authentic homestyle bhakri and dal!",
    status: "Resolved",
    replyText: "Namaste Priya! Thank you so much for the love. Currently, our core standard monthly subscriptions are operating 6 days a week (Monday to Saturday). However, for Sundays, you can order directly from our custom dynamic menu card here on the website which has all special menu options active! Hope this supports you.",
    createdAt: "2026-06-04T11:40:00Z"
  },
  {
    id: "enq-3",
    name: "Sunil Kadam",
    email: "kadam.sunil@yahoo.com",
    subject: "Mini Catering Service for Pune Housewarming Event",
    message: "Hello Bhagwati Cloud Kitchen, I want to book a dinner catering order for 25 people for our housewarming function near NIBM road on June 15th. Is it possible to get customized dry bhaji and sweet puran poli?",
    status: "Pending",
    createdAt: "2026-06-05T14:22:00Z"
  }
];

// Shared in-memory DB cache to prevent file read conflicts and accidental resets
let cachedDB: any = null;

// Write Database safely and atomically using renameSync
function saveDB(data: any) {
  try {
    cachedDB = data; // Always update in-memory cache first
    fs.writeFileSync(TEMP_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(TEMP_DB_FILE, DB_FILE);
  } catch (err) {
    console.error("Fatal error writing database:", err);
    // Fallback if renaming is blocked by OS locking permissions
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error("Fatal failure on absolute direct write fallback:", e);
    }
  }
}

// Load Database safely
function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      if (cachedDB) return cachedDB;
      const data = {
        config: DEFAULT_CONFIG,
        menu: DEFAULT_MENU,
        reviews: DEFAULT_REVIEWS,
        coupons: DEFAULT_COUPONS,
        orders: DEFAULT_ORDERS,
        enquiries: DEFAULT_ENQUIRIES
      };
      saveDB(data);
      return data;
    }

    const content = fs.readFileSync(DB_FILE, 'utf-8');
    if (!content || !content.trim()) {
      if (cachedDB) {
        console.warn("Database file was empty, serving from in-memory cache.");
        return cachedDB;
      }
      throw new Error("Local database file is empty");
    }

    const db = JSON.parse(content);
    if (db && db.config) {
      let changed = false;
      if (!db.config.paymentSettings) {
        db.config.paymentSettings = DEFAULT_PAYMENT_SETTINGS;
        changed = true;
      }
      if (!db.enquiries) {
        db.enquiries = DEFAULT_ENQUIRIES;
        changed = true;
      }
      if (changed) {
        saveDB(db);
      }
      cachedDB = db; // Update cache
      return db;
    }
    
    if (cachedDB) return cachedDB;
    throw new Error("Invalid database schema");
  } catch (error) {
    console.error("Error reading database file:", error);
    
    // Crucial defense: If we have an in-memory cache, NEVER reset the database. Serve the cache!
    if (cachedDB) {
      console.log("Serving cached database instead of resetting to defaults.");
      return cachedDB;
    }
    
    // Fallback as absolute last resort (only on initial server startup if file is corrupted)
    console.log("No database cache found, initializing first-time default records.");
    const data = {
      config: DEFAULT_CONFIG,
      menu: DEFAULT_MENU,
      reviews: DEFAULT_REVIEWS,
      coupons: DEFAULT_COUPONS,
      orders: DEFAULT_ORDERS,
      enquiries: DEFAULT_ENQUIRIES
    };
    saveDB(data);
    return data;
  }
}

// REST API Handlers

// Get all system initial data
app.get('/api/initial-state', (req, res) => {
  const db = loadDB();
  res.json(db);
});

// Update standard settings configurations
app.post('/api/config', (req, res) => {
  const db = loadDB();
  db.config = { ...db.config, ...req.body };
  saveDB(db);
  res.json({ message: "Store settings updated successfully", config: db.config });
});

// Create menu item
app.post('/api/menu', (req, res) => {
  const db = loadDB();
  const newItem: MenuItem = {
    id: 'm' + (db.menu.length + 1) + '-' + Math.floor(Math.random() * 1000),
    ...req.body
  };
  db.menu.push(newItem);
  saveDB(db);
  res.json({ message: "Menu item created successfully", item: newItem, menu: db.menu });
});

// Update menu item
app.put('/api/menu/:id', (req, res) => {
  const db = loadDB();
  const index = db.menu.findIndex((item: MenuItem) => item.id === req.params.id);
  if (index !== -1) {
    db.menu[index] = { ...db.menu[index], ...req.body };
    saveDB(db);
    return res.json({ message: "Menu item updated successfully", item: db.menu[index], menu: db.menu });
  }
  res.status(404).json({ error: "Menu item not found" });
});

// Delete menu item
app.delete('/api/menu/:id', (req, res) => {
  const db = loadDB();
  db.menu = db.menu.filter((item: MenuItem) => item.id !== req.params.id);
  saveDB(db);
  res.json({ message: "Menu item removed successfully", menu: db.menu });
});

// Reorder categories/items
app.post('/api/menu/reorder', (req, res) => {
  const { menu } = req.body;
  if (!Array.isArray(menu)) {
    return res.status(400).json({ error: "Invalid payload: menu must be an array" });
  }
  const db = loadDB();
  db.menu = menu;
  saveDB(db);
  res.json({ message: "Menu hierarchy rearranged successfully", menu: db.menu });
});

// Manage reviews
app.post('/api/reviews', async (req, res) => {
  const db = loadDB();
  const { name, rating, comment } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "Missing reviewer name" });
  }

  let generatedReply = "";
  
  // Instantly generate a response using Gemini for extreme customer satisfaction
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Write a polite, warm, and personalized 1-to-2 sentence owner reply greeting to a customer review for Bhagwati Cloud Kitchen, Pune.
      Customer Name: "${name}"
      Rating Given: ${rating} out of 5 stars
      Customer Review: "${comment || 'Loved the food!'}"
      Signature: Bhagwati Cloud Kitchen Team. Preserve standard warm Indian greeting tone (e.g. Namaste / Thank you). Keep it direct, heartfelt, and human-sounding (avoid buzzwords, be humble). Mention how we appreciate their support for authentic homemade veg and tiffin services.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      if (response && response.text) {
        generatedReply = response.text.trim();
      }
    } catch (error) {
      console.error("Instant Gemini review reply failed:", error);
    }
  }

  // Fallback high-quality replies if Gemini is not configured or fails
  if (!generatedReply) {
    if (rating >= 4) {
      generatedReply = `Namaste ${name}! Thank you so much for the wonderful ${rating}-star review. Our kitchen team is absolutely delighted to hear your kind words about our authentic homemade meals. We look forward to serving you again soon! - Bhagwati Cloud Kitchen Team`;
    } else if (rating === 3) {
      generatedReply = `Namaste ${name}. Thank you for your feedback. We appreciate your review and will double our efforts to improve our service and flavor profile to give you a 5-star experience next time! - Bhagwati Cloud Kitchen Team`;
    } else {
      generatedReply = `Namaste ${name}. We are truly sorry to hear that your experience did not meet expectations. We take hygiene and taste very seriously. Please reach out to our helpline so we can address your concerns immediately. - Bhagwati Cloud Kitchen Team`;
    }
  }

  const newReview: Review = {
    id: 'r' + (db.reviews.length + 1) + '-' + Math.floor(Math.random() * 1000),
    isApproved: true, 
    date: new Date().toISOString(),
    name,
    rating,
    comment,
    replyText: generatedReply
  };

  db.reviews.unshift(newReview);
  saveDB(db);
  res.json({ message: "Review posted successfully", review: newReview, reviews: db.reviews });
});

// Admin reply/approve review
app.put('/api/reviews/:id', (req, res) => {
  const db = loadDB();
  const index = db.reviews.findIndex((rev: Review) => rev.id === req.params.id);
  if (index !== -1) {
    db.reviews[index] = { ...db.reviews[index], ...req.body };
    saveDB(db);
    return res.json({ message: "Review status updated successfully", reviews: db.reviews });
  }
  res.status(404).json({ error: "Review not found" });
});

// Delete reviews
app.delete('/api/reviews/:id', (req, res) => {
  const db = loadDB();
  db.reviews = db.reviews.filter((rev: Review) => rev.id !== req.params.id);
  saveDB(db);
  res.json({ message: "Review deleted successfully", reviews: db.reviews });
});

// Submit a customer enquiry
app.post('/api/enquiries', (req, res) => {
  const db = loadDB();
  const { name, email, subject, message } = req.body;
  if (!name || !subject || !message) {
    return res.status(400).json({ error: "Name, subject and message are required" });
  }

  const newEnquiry: Enquiry = {
    id: 'enq-' + (db.enquiries ? db.enquiries.length + 1 : 1) + '-' + Math.floor(Math.random() * 1000),
    name,
    email: email || '',
    subject,
    message,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  if (!db.enquiries) {
    db.enquiries = [];
  }
  db.enquiries.unshift(newEnquiry);
  saveDB(db);
  res.json({ message: "Thank you! Your enquiry was delivered successfully.", enquiry: newEnquiry, enquiries: db.enquiries });
});

// Update standard enquiry status or response replies
app.put('/api/enquiries/:id', (req, res) => {
  const db = loadDB();
  if (!db.enquiries) db.enquiries = [];
  const index = db.enquiries.findIndex((enq: Enquiry) => enq.id === req.params.id);
  if (index !== -1) {
    db.enquiries[index] = { ...db.enquiries[index], ...req.body };
    saveDB(db);
    return res.json({ message: "Enquiry updated successfully", enquiries: db.enquiries });
  }
  res.status(404).json({ error: "Enquiry not found" });
});

// Delete enquiry
app.delete('/api/enquiries/:id', (req, res) => {
  const db = loadDB();
  if (!db.enquiries) db.enquiries = [];
  db.enquiries = db.enquiries.filter((enq: Enquiry) => enq.id !== req.params.id);
  saveDB(db);
  res.json({ message: "Enquiry record successfully removed", enquiries: db.enquiries });
});

// AI suggested reply for enquiry
app.post('/api/gemini/reply-enquiry', async (req, res) => {
  const { name, message, subject } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: "Missing name or message" });
  }

  let generatedReply = "";
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Write a polite, warm, and highly professional Indian hospitality owner reply greeting to a customer support enquiry for Bhagwati Cloud Kitchen, Pune.
      Customer Name: "${name}"
      Query Subject: "${subject || 'General Enquiry'}"
      Customer Message: "${message}"
      Signature: Manager, Bhagwati Cloud Kitchen. Preserve traditional polite Indian hospitality greeting tone (e.g. Namaste / warm greeting). Provide a direct, helpful, and concise solution-oriented reply in 2-3 sentences.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      if (response && response.text) {
        generatedReply = response.text.trim();
      }
    } catch (error) {
      console.error("Gemini enquiry auto draft failed:", error);
    }
  }

  if (!generatedReply) {
    generatedReply = `Namaste ${name}! Thank you for reaching out to Bhagwati Cloud Kitchen. We have received your query regarding "${subject || 'your enquiry'}" and are looking into it. Our team will contact you directly on phone to assist you further. - Bhagwati Cloud Kitchen Team`;
  }

  res.json({ replyText: generatedReply });
});

// Manage coupons
app.post('/api/coupons', (req, res) => {
  const db = loadDB();
  const { code } = req.body;
  const exists = db.coupons.some((cp: Coupon) => cp.code.toUpperCase() === code.toUpperCase());
  if (exists) {
    return res.status(400).json({ error: "Coupon already exists" });
  }
  const newCoupon: Coupon = { ...req.body, code: code.toUpperCase() };
  db.coupons.push(newCoupon);
  saveDB(db);
  res.json({ message: "Coupon created successfully", coupons: db.coupons });
});

app.delete('/api/coupons/:code', (req, res) => {
  const db = loadDB();
  db.coupons = db.coupons.filter((cp: Coupon) => cp.code !== req.params.code);
  saveDB(db);
  res.json({ message: "Coupon removed successfully", coupons: db.coupons });
});

// Manage orders (Checkout)
app.post('/api/orders', (req, res) => {
  const db = loadDB();
  const { items, customerName, customerMobile, deliveryAddress, pincode, couponCode, paymentMethod, notes, deliverySlot } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Your basket is empty." });
  }

  // Validate pincode if service area checking is active
  if (db.config.isUnderServiceAreaOnly && !db.config.allowedPincodes.includes(pincode)) {
    return res.status(400).json({ error: `Currently we do not deliver to pincode ${pincode}. Available service areas include: ${db.config.allowedPincodes.join(', ')}` });
  }

  // Calculate items subtotal
  let subtotal = 0;
  const verifiedItems = items.map((item: any) => {
    const menuItem = db.menu.find((m: MenuItem) => m.id === item.menuItemId);
    const price = menuItem ? menuItem.price : item.price;
    subtotal += price * item.quantity;
    return {
      menuItemId: item.menuItemId,
      name: item.name || (menuItem ? menuItem.name : "Authentic Meal"),
      price: price,
      quantity: item.quantity
    };
  });

  // Calculate discounts
  let discountAmount = 0;
  if (couponCode) {
    const coupon = db.coupons.find((cp: Coupon) => cp.code.toUpperCase() === couponCode.toUpperCase());
    if (coupon) {
      if (subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }
  }

  // GST & Delivery calculations
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = parseFloat(((taxableAmount * db.config.gstPercent) / 100).toFixed(2));
  const deliveryCharge = db.config.deliveryCharge;
  const totalAmount = parseFloat((taxableAmount + gstAmount + deliveryCharge).toFixed(2));

  // Generate unique order track number
  const orderId = "BK-" + Math.floor(1000 + Math.random() * 9000);

  const newOrder: Order = {
    id: orderId,
    customerName,
    customerMobile,
    deliveryAddress,
    pincode,
    items: verifiedItems,
    couponCode: couponCode || undefined,
    discountAmount,
    gstAmount,
    deliveryCharge,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed', // Simulator
    orderStatus: 'Placed',
    createdAt: new Date().toISOString(),
    notes,
    estimatedDeliveryTime: "35 - 45 mins",
    deliverySlot: deliverySlot || undefined
  };

  db.orders.unshift(newOrder);
  saveDB(db);

  res.json({
    message: "Order placed successfully!",
    orderId: newOrder.id,
    order: newOrder
  });
});

// Update order details (live status tracking as admin)
app.put('/api/orders/:id', (req, res) => {
  const db = loadDB();
  const inputId = req.params.id.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const index = db.orders.findIndex((ord: Order) => {
    if (!ord || !ord.id) return false;
    const dbId = ord.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return dbId === inputId || dbId.endsWith(inputId) || inputId.endsWith(dbId);
  });
  if (index !== -1) {
    db.orders[index] = { ...db.orders[index], ...req.body };
    saveDB(db);
    return res.json({ message: "Order tracking status updated", order: db.orders[index], orders: db.orders });
  }
  res.status(404).json({ error: "Order not found" });
});

// Get individual order for live tracking check
app.get('/api/orders/:id', (req, res) => {
  const db = loadDB();
  const inputId = req.params.id.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const order = db.orders.find((ord: Order) => {
    if (!ord || !ord.id) return false;
    const dbId = ord.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return dbId === inputId || dbId.endsWith(inputId) || inputId.endsWith(dbId);
  });
  if (order) {
    return res.json(order);
  }
  res.status(404).json({ error: "Order not found with tracking ID: " + req.params.id });
});

// Get all orders by customer mobile number
app.get('/api/orders/by-mobile/:mobile', (req, res) => {
  const db = loadDB();
  const mobileInput = req.params.mobile.replace(/\D/g, '');
  if (!mobileInput) {
    return res.json([]);
  }
  const orders = db.orders.filter((ord: Order) => {
    if (!ord) return false;
    const dbMobileRaw = ord.customerMobile !== undefined && ord.customerMobile !== null ? String(ord.customerMobile) : '';
    const cleanDbMobile = dbMobileRaw.replace(/\D/g, '');
    // Match either exact or ending suffix match for 10 digits or vice versa or inclusion
    return cleanDbMobile === mobileInput || 
           (cleanDbMobile.length >= 10 && mobileInput.length >= 10 && 
            (cleanDbMobile.slice(-10) === mobileInput.slice(-10))) ||
           (cleanDbMobile && mobileInput.includes(cleanDbMobile)) || 
           (mobileInput && cleanDbMobile.includes(mobileInput));
  });
  res.json(orders);
});

// Sales analytics dynamic aggregator for Recharts (Dashboard reports)
app.get('/api/sales', (req, res) => {
  const db = loadDB();
  // We can calculate high quality statistics from current order list!
  const orders: Order[] = db.orders;
  
  // Total Sales
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'Completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalDiscount = orders.reduce((sum, o) => sum + o.discountAmount, 0);

  // Group by category sales
  const salesByCategory: Record<string, number> = {};
  const popularItemSales: Record<string, { name: string, qty: number, revenue: number }> = {};

  orders.forEach(order => {
    order.items.forEach(item => {
      // Find food element category
      const food = db.menu.find((m: MenuItem) => m.id === item.menuItemId);
      const cat = food ? food.category : 'Lunch';
      salesByCategory[cat] = (salesByCategory[cat] || 0) + (item.price * item.quantity);

      if (!popularItemSales[item.menuItemId]) {
        popularItemSales[item.menuItemId] = { name: item.name, qty: 0, revenue: 0 };
      }
      popularItemSales[item.menuItemId].qty += item.quantity;
      popularItemSales[item.menuItemId].revenue += item.price * item.quantity;
    });
  });

  const categoryData = Object.keys(salesByCategory).map(key => ({
    name: key,
    value: Math.round(salesByCategory[key])
  }));

  const itemData = Object.values(popularItemSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Generate 7-day trend data dynamically based on the current system date or simulated trend
  const dailyTrends = [
    { day: "May 27", sales: 2400, orders: 12 },
    { day: "May 28", sales: 3100, orders: 15 },
    { day: "May 29", sales: 2800, orders: 13 },
    { day: "May 30", sales: 4200, orders: 20 },
    { day: "May 31", sales: 3800, orders: 18 },
    { day: "Jun 01", sales: 5100, orders: 25 },
    { day: "Jun 02 (Today)", sales: totalRevenue > 0 ? Math.round(totalRevenue) : 1200, orders: orders.length }
  ];

  // Dynamic Payment Method Breakdown
  const breakdown: Record<string, number> = {};
  orders.forEach(o => {
    if (o.paymentStatus === 'Completed') {
      const pm = o.paymentMethod || 'Other';
      breakdown[pm] = (breakdown[pm] || 0) + o.totalAmount;
    }
  });
  const methodBreakdown = Object.keys(breakdown).map(key => ({
    method: key,
    amount: Math.round(breakdown[key])
  }));

  // Successful and failed counts
  const successfulPaymentsCount = orders.filter(o => o.paymentStatus === 'Completed').length;
  const failedPaymentsCount = orders.filter(o => o.paymentStatus === 'Failed').length;

  // GST Collected
  const totalGstCollected = orders
    .filter(o => o.paymentStatus === 'Completed')
    .reduce((sum, o) => sum + (o.gstAmount || 0), 0);

  // refund history simulation from Cancelled orders
  const refundHistory = orders
    .filter(o => o.orderStatus === 'Cancelled')
    .map(o => ({
      orderId: o.id,
      amount: o.totalAmount,
      customerName: o.customerName,
      date: o.createdAt,
      status: 'Processed'
    }));

  // subscription revenue calculations
  const subscriptionRevenue = orders
    .filter(o => o.paymentStatus === 'Completed')
    .reduce((sum, o) => {
      const tiffinSum = o.items
        .filter(item => item.name.toLowerCase().includes('tiffin') || item.name.toLowerCase().includes('subscription') || item.name.toLowerCase().includes('monthly'))
        .reduce((s, item) => s + (item.price * item.quantity), 0);
      return sum + tiffinSum;
    }, 0);

  res.json({
    totalCompletedOrders: orders.filter(o => o.paymentStatus === 'Completed').length,
    totalPendingOrders: orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length,
    totalRevenue: Math.round(totalRevenue),
    totalDiscount: Math.round(totalDiscount),
    categoryData,
    itemData,
    dailyTrends,
    methodBreakdown,
    successfulPaymentsCount,
    failedPaymentsCount,
    totalGstCollected: Math.round(totalGstCollected),
    refundHistory,
    subscriptionRevenue: Math.round(subscriptionRevenue)
  });
});

// Gemini AI Helper Integrations

// Lazy initialize Gemini clients so missing API keys do not crash server boot
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// 1. Gemini AI: Describe food dish suggest endpoint
app.post('/api/gemini/suggest-desc', async (req, res) => {
  const { name, category, spicyLevel, isVeg } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Missing dish name parameter." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      text: `Fresh and hot ${name}. Exquisitely prepared using organic spices and locally sourced ingredients in our 100% hygienic Bhagwati kitchen.`
    });
  }

  try {
    const prompt = `Write a mouth-watering, premium 2-sentence description for an Indian restaurant menu item.
    Dish Name: "${name}"
    Category: "${category || 'Indian Meal'}"
    Spicy Level: "${spicyLevel || 'Medium'}"
    Food Type: "${isVeg ? 'Vegetarian' : 'Pure Veg'}"
    No emojis. Make it appealing and focus on high-quality home taste.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text || "Tasty homemade Indian specialty.";
    res.json({ text: text.trim() });
  } catch (error: any) {
    console.error("Gemini suggestion failed:", error);
    res.json({
      text: `Savory and authentic ${name}, slow-cooked with fresh hand-rolled spices. A premium home-style ${category || 'Indian Classic'} masterpiece.`
    });
  }
});

// 2. Gemini AI: Suggest premium response reply to client review
app.post('/api/gemini/reply-review', async (req, res) => {
  const { reviewerName, rating, reviewComment } = req.body;
  if (!reviewerName) {
    return res.status(400).json({ error: "Missing reviewer name parameter." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      text: `Dear ${reviewerName}, thank you so much for your ${rating}-star feedback! We strive to make every pure-veg home-cooked meal delightful and hygienic. Happy Tiffin eating!`
    });
  }

  try {
    const prompt = `Write a polite, warm, and professional 2-sentence owner reply greeting to a restaurant customer review.
    Customer Name: "${reviewerName}"
    Rating Given: ${rating} out of 5 stars
    Customer Review: "${reviewComment || 'Loved the food!'}"
    Signature: Bhagwati Cloud Kitchen Hospitality Team. Preserve standard warm Indian greeting tone (e.g. Namaste / Thank you). Keep it direct and human-sounding (no robotic AI templates).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text || "Thank you for sharing your experience. We love serving you!";
    res.json({ text: text.trim() });
  } catch (error) {
    console.error("Gemini review reply failed:", error);
    res.json({
      text: `Namaste ${reviewerName}, thank you for your kind rating! Our team is absolutely delighted to offer you hygienic, high-quality cloud meals. We look forward to cooking for you again!`
    });
  }
});


// TECHNICAL SEO: XML Dynamic Sitemap
app.get('/sitemap.xml', (req, res) => {
  const db = loadDB();
  const currentUrl = process.env.APP_URL || `https://${req.get('host')}`;
  
  res.header('Content-Type', 'application/xml');
  
  // Format menu item URL schemas cleanly to maximize Search Engine crawler indexation
  const menuUrls = db.menu.map((item: MenuItem) => {
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `
  <url>
    <loc>${currentUrl}/menu/${item.id}/${slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.80</priority>
  </url>`;
  }).join('');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${currentUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.00</priority>
  </url>
  <url>
    <loc>${currentUrl}/tiffin-service</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>${currentUrl}/reviews</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.70</priority>
  </url>
  <url>
    <loc>${currentUrl}/checkout</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.30</priority>
  </url>
  <url>
    <loc>${currentUrl}/admin</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.20</priority>
  </url>${menuUrls}
</urlset>`;

  res.send(sitemapXml);
});

// TECHNICAL SEO: Robots.txt
app.get('/robots.txt', (req, res) => {
  const currentUrl = process.env.APP_URL || `https://${req.get('host')}`;
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Allow: /tiffin-service
Allow: /reviews
Disallow: /admin
Disallow: /checkout/success
Disallow: /api/

Sitemap: ${currentUrl}/sitemap.xml`);
});


// Vite Middlewares setup for server environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(` Bhagwati Cloud Kitchen Express server running on:`);
    console.log(` URL: http://0.0.0.0:${PORT}`);
    console.log(` Local Sitemap: http://localhost:${PORT}/sitemap.xml`);
    console.log(` Local Robots.txt: http://localhost:${PORT}/robots.txt`);
    console.log(`======================================================\n`);
  });
}

startServer();
