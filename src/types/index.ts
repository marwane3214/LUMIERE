export interface Product {
  id: string;
  name: string;
  name_fr: string;
  name_ar: string;
  description: string;
  description_fr: string;
  description_ar: string;
  price: number;
  image: string;
  images?: string[];
  background_image?: string;
  event_id?: string;
  category: 'rings' | 'necklaces' | 'earrings' | 'bracelets' | 'pack' | 'packs' | 'events';
  featured: boolean;
  in_stock: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  quote_fr: string;
  quote_ar: string;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  name_fr: string;
  name_ar: string;
  description: string;
  description_fr: string;
  description_ar: string;
  image: string;
  slug: string;
}

export type Language = 'en' | 'fr' | 'ar';

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  size?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  items: OrderItem[];
  total_price: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  payment_method: 'cod';
  notes?: string;
  created_at: string;
}
