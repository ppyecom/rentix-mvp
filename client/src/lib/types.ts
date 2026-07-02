export interface User {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  city?: string;
  verified?: boolean;
  rating?: number;
  reviews_count?: number;
  bio?: string;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Equipment {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  category: string;
  price_per_day: number;
  city: string;
  image: string;
  gallery: string[];
  specs: Spec[];
  status: 'disponible' | 'alquilado';
  rating: number;
  reviews_count: number;
  shield: boolean;
  owner_name?: string;
  owner_avatar?: string;
  owner_rating?: number;
  owner_verified?: number | boolean;
  owner_reviews?: number;
}

export interface Review {
  id: number;
  author_name: string;
  author_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Booking {
  id: number;
  equipment_id: number;
  start_date: string;
  end_date: string;
  days: number;
  subtotal: number;
  service_fee: number;
  total: number;
  status: string;
  equipment_title?: string;
  equipment_image?: string;
  equipment_city?: string;
}

export interface Thread {
  other: User;
  last_message: string;
  last_at: string;
  unread: number;
}

export interface Message {
  id: number;
  from_id: number;
  to_id: number;
  body: string;
  created_at: string;
}
