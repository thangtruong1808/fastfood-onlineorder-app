/**
 * Core Domain Types for Southern Cross Burgers (Melbourne, VIC) — Mobile App
 * Copied from web domain model; strictly isolated inside /mobile
 */

export const MENU_CATEGORY_IDS = {
  BURGERS: 'burgers',
  CHICKEN: 'chicken',
  WRAPS: 'wraps',
  SIDES: 'sides',
  DRINKS: 'drinks',
  DESSERTS: 'desserts',
  BREAKFAST: 'breakfast',
  KIDS: 'kids',
  COMBOS: 'combos',
} as const;

export type MenuCategoryId =
  (typeof MENU_CATEGORY_IDS)[keyof typeof MENU_CATEGORY_IDS];

export const DIETARY_TAGS = {
  VEGETARIAN: 'vegetarian',
  VEGAN: 'vegan',
  GLUTEN_FRIENDLY: 'gluten-friendly',
  SPICY: 'spicy',
  CHEF_SPECIAL: 'chef-special',
  HIGH_PROTEIN: 'high-protein',
} as const;

export type DietaryTag = (typeof DIETARY_TAGS)[keyof typeof DIETARY_TAGS];

export interface MenuCategory {
  id: MenuCategoryId;
  name: string;
  shortName: string;
  description: string;
  accentColor: string;
  badgeText?: string;
}

export interface SizeOption {
  id: 'regular' | 'large' | 'king';
  label: string;
  priceDelta: number;
  caloriesDelta: number;
}

export interface AddOnModifier {
  id: string;
  name: string;
  price: number;
  calories: number;
  category: 'extra' | 'sauce' | 'swap';
}

export interface NutritionalInfo {
  calories: number;
  kilojoules: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  sodiumMg: number;
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  categoryId: MenuCategoryId;
  description: string;
  shortDescription: string;
  basePrice: number; // AUD (GST-inclusive)
  originalPrice?: number;
  imageUrl: string;
  fallbackGradient: string;
  dietaryTags: DietaryTag[];
  allergens: string[];
  nutrition: NutritionalInfo;
  rating: number;
  reviewCount: number;
  prepTimeMinutes: number;
  isFeatured?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  allowComboUpgrade?: boolean;
  comboUpgradePrice?: number;
  sizeOptions: SizeOption[];
  availableAddOns: AddOnModifier[];
}

export const FULFILLMENT_MODES = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
} as const;

export type FulfillmentMode =
  (typeof FULFILLMENT_MODES)[keyof typeof FULFILLMENT_MODES];

export interface MelbourneStore {
  id: string;
  name: string;
  suburb: string;
  address: string;
  postcode: string;
  phone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isOpen: boolean;
  openingHours: string;
  pickupEtaMinutes: number;
  deliveryEtaMinutes: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  features: string[];
  busyLevel: 'quiet' | 'moderate' | 'busy';
}

export interface PromoDeal {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_delivery';
  discountValue: number;
  minOrderAmount: number;
  badgeText: string;
  accentGradient: string;
  expiryText: string;
}

export interface CartItemCustomization {
  sizeId: 'regular' | 'large' | 'king';
  sizeLabel: string;
  isCombo: boolean;
  comboDrink?: string;
  comboSide?: string;
  selectedAddOns: AddOnModifier[];
  removedIngredients: string[];
  specialInstructions?: string;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  imageUrl: string;
  categoryId: MenuCategoryId;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  customization: CartItemCustomization;
}

export const ORDER_STATUS = {
  RECEIVED: 'received',
  PREPARING: 'preparing',
  READY_OR_OUT: 'ready_or_out',
  COMPLETED: 'completed',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export interface OrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  estimatedReadyAt: string;
  status: OrderStatus;
  fulfillmentMode: FulfillmentMode;
  storeId: string;
  storeName: string;
  storeSuburb: string;
  deliveryAddress?: string;
  scheduledSlot: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  deliveryFee: number;
  gstIncluded: number;
  total: number;
  paymentMethodLabel: string;
  loyaltyPointsEarned: number;
}

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  GUEST: 'guest',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface SavedAddress {
  id: string;
  label: string;
  street: string;
  suburb: string;
  postcode: string;
  deliveryNotes?: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarInitials: string;
  loyaltyPoints: number;
  loyaltyTier: 'Bronze Star' | 'Silver Cross' | 'Southern Gold';
  memberSince: string;
  savedAddresses: SavedAddress[];
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type SimulatorLatency = 0 | 400 | 1200;

