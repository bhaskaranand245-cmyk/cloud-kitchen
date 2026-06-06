export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Daily Tiffin' | 'Special Thali' | 'Snacks' | 'Beverages';
  image: string;
  isAvailable: boolean;
  isVeg: boolean;
  spicyLevel?: 'Mild' | 'Medium' | 'Hot';
  rating?: number;
  prepTime?: string;
  isPopular?: boolean;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  description: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  isApproved: boolean;
  replyText?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  description: string;
  mealsIncluded: ('Breakfast' | 'Lunch' | 'Dinner')[];
  features: string[];
}

export interface CustomConfig {
  brandName: string;
  mobileNumber: string;
  email: string;
  address: string;
  googleMapEmbedUrl: string;
  isUnderServiceAreaOnly: boolean;
  allowedPincodes: string[];
  gstPercent: number;
  deliveryCharge: number;
  loyaltyPointsPer100: number; // loyalty program
  paymentSettings?: PaymentSettings;
  closingTime?: string; // 24-hour format, e.g., "22:00"
  openingTime?: string; // 24-hour format, e.g., "08:00"
  isCloseCurtainEnabled?: boolean; // overall toggle for active curtains
  closeCurtainMessage?: string; // elegant notification text shown inside the curtain
}

export interface PaymentGateway {
  id: string; // unique ID
  name: string;
  isEnabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  isCustomInstructionsEnabled?: boolean;
  instructions?: string;
  extraChargePercentOrFixed?: number; // negative value is discount
  extraChargeType?: 'percent' | 'fixed';
  isCustom?: boolean; // created dynamically by admin
}

export interface PaymentSettings {
  isTestMode: boolean; // toggle live vs test
  codMinOrderValue: number; // minimum order for cash-on-delivery
  gateways: PaymentGateway[];
}

export interface Order {
  id: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  deliveryAddress: string;
  pincode: string;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  couponCode?: string;
  discountAmount: number;
  gstAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  orderStatus: 'Placed' | 'Preparing' | 'OutForDelivery' | 'Delivered' | 'Cancelled';
  createdAt: string;
  notes?: string;
  estimatedDeliveryTime?: string;
  deliverySlot?: string;
}

export interface UserAuthStore {
  isAuthenticated: boolean;
  userType: 'Admin' | 'Customer';
  mobileNumber?: string;
  name?: string;
  loyaltyPoints: number;
}

export interface Enquiry {
  id: string;
  name: string;
  email?: string;
  subject: string;
  message: string;
  status: 'Pending' | 'Resolved';
  replyText?: string;
  createdAt: string;
}
