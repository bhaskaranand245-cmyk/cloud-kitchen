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
  email?: string;
  rating: number;
  title?: string;
  comment: string;
  date: string;
  isApproved: boolean;
  replyText?: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Flagged';
  isVerified?: boolean;
  helpfulCount?: number;
  reported?: boolean;
  reportReason?: string;
  moderationNotes?: string;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  category: 'Suggestion' | 'Complaint' | 'Feature Request' | 'General Feedback';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  message: string;
  createdAt: string;
  isAddressed?: boolean;
  notes?: string;
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
  loyaltyPointsPer105?: number; // legacy fallback if any
  loyaltyPointsPer100: number; // loyalty program
  paymentSettings?: PaymentSettings;
  closingTime?: string; // 24-hour format, e.g., "22:00"
  openingTime?: string; // 24-hour format, e.g., "08:00"
  isCloseCurtainEnabled?: boolean; // overall toggle for active curtains
  closeCurtainMessage?: string; // elegant notification text shown inside the curtain
  updatedAt?: number; // timestamp for conflict resolution
  menuUpdatedAt?: number; // timestamp for menu conflict resolution
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

export interface EnquiryThreadMessage {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  message: string;
  createdAt: string;
  attachmentUrl?: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  category?: 'General Inquiry' | 'Technical Support' | 'Billing & Payments' | 'Orders & Delivery' | 'Returns & Refunds' | 'Account Issues' | 'Feedback & Suggestions';
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Waiting for Customer' | 'Resolved' | 'Closed' | 'Pending';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedAgent?: string;
  attachments?: string[];
  thread?: EnquiryThreadMessage[];
  replyText?: string;
  createdAt: string;
  updatedAt?: string;
}
