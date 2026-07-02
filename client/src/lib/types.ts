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
  yape_number?: string;
  yape_name?: string;
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
  owner_yape_number?: string;
  owner_yape_name?: string;
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
  payment_status?: 'pendiente_pago' | 'pago_reportado' | 'confirmado';
  yape_operation?: string;
  equipment_title?: string;
  equipment_image?: string;
  equipment_city?: string;
  owner_id?: number;
  owner_name?: string;
  owner_yape_number?: string;
  owner_yape_name?: string;
  renter_id?: number;
  renter_name?: string;
  renter_avatar?: string;
}

export interface Report {
  id: number;
  booking_id: number;
  reporter_role: 'arrendador' | 'arrendatario';
  reason: string;
  description: string;
  status: 'abierto' | 'en_revision' | 'resuelto';
  created_at: string;
  equipment_title?: string;
  reporter_name?: string;
  against_name?: string;
  direction?: 'enviado' | 'recibido';
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
