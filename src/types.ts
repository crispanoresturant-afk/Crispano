export type CategoryId = string;

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon?: string;
  sortOrder?: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number; // 0 for exclusions, >0 for extra additions
  type: 'exclude' | 'extra';
}

export interface MenuItem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  price: number; // in Sudanese Pounds (ج.س)
  category: string;
  image: string;
  heroImage?: string;
  isPopular?: boolean;
  isOffer?: boolean;
  isAvailable?: boolean; // toggle availability
  discountPrice?: number;
  ingredients?: string[];
  options?: CustomizationOption[];
  prepTimeMinutes?: number;
  badge?: string;
  sortOrder?: number;
}

export interface Offer {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  image: string;
  badge?: string;
  discountPercentage?: number;
  active: boolean;
  linkedDishId?: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: string[]; // option names
  specialInstructions: string;
  itemTotal: number;
}

export type DeliveryMethod = 'delivery' | 'pickup' | 'dinein';

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  tableNumber?: string;
  notes?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customer: CustomerDetails;
  deliveryMethod: DeliveryMethod;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'preparing' | 'on_the_way' | 'delivered';
  createdAt: string;
}

export type ActiveTab = 'home' | 'menu' | 'cart' | 'contact' | 'admin';

