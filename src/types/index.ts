export interface SiteSettings {
  id: string;
  site_name?: string;
  company_description: string;
  whatsapp_number: string;
  instagram_url: string;
  tiktok_url: string;
  email: string;
  website_url?: string;
  updated_at?: string;
}

export interface PortfolioItem {
  id: string;
  youtube_url?: string;
  youtube_video_id: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClientLogo {
  id: string;
  client_name: string;
  logo_path: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PackageFeature {
  id?: string;
  package_id?: string;
  feature_text: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export type PackageFeatureInput = {
  id?: string;
  feature_text: string;
  display_order?: number;
};

export interface Package {
  id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  duration_hours: number;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  features?: PackageFeature[];
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  price: number;
  unit_label: string;
  allow_quantity: boolean;
  min_quantity: number;
  max_quantity: number;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OvertimeSettings {
  id?: string;
  is_active: boolean;
  rate_percent: number;
  min_hours: number;
  max_hours: number;
  step_hours: number;
  updated_at?: string;
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  unit_label: string;
  allow_quantity: boolean;
  min_quantity: number;
  max_quantity: number;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type VoucherDiscountType = 'fixed' | 'percentage';

export interface Voucher {
  id: string;
  code: string;
  name?: string;
  discount_type?: VoucherDiscountType;
  discount_value?: number;
  min_purchase_amount?: number;
  minimum_transaction?: number;
  maximum_discount?: number | null;
  starts_at?: string;
  expires_at?: string;
  usage_limit?: number | null;
  usage_count: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VoucherValidationResult {
  valid: boolean;
  message: string;
  voucher?: {
    id: string;
    code: string;
    name?: string;
    calculated_discount: number;
    discount_type?: VoucherDiscountType;
    discount_value?: number;
  };
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type FAQ = FaqItem;

export enum OrderStatus {
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: string;
  reference_id?: string | null;
  name?: string;
  item_name?: string;
  unit_price: number;
  quantity: number;
  unit_label?: string;
  line_total: number;
  created_at?: string;
}

export interface Order {
  id: string;
  invoice_number: string;
  customer_name: string;
  organization_name: string;
  whatsapp: string;
  email: string;
  event_date: string;
  event_start_time: string;
  venue_address: string;
  additional_notes?: string | null;
  package_id: string;
  package_name?: string;
  package_name_snapshot?: string;
  package_price?: number;
  package_price_snapshot?: number;
  package_duration_hours?: number;
  package_duration_snapshot?: number;
  overtime_hours?: number;
  overtime_rate_percent?: number;
  overtime_total?: number;
  subtotal: number;
  voucher_id?: string | null;
  voucher_code?: string | null;
  voucher_code_snapshot?: string | null;
  discount_amount: number;
  estimated_total: number;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface OrderSubmissionPayload {
  customer_name: string;
  organization_name: string;
  whatsapp: string;
  email: string;
  event_date: string;
  event_start_time: string;
  venue_address: string;
  additional_notes?: string;
  package_id: string;
  selected_upgrades: { id: string; quantity: number }[];
  overtime_hours: number;
  selected_addons: { id: string; quantity: number }[];
  voucher_code?: string;
}

export interface OrderCreationResponse {
  success: boolean;
  message?: string;
  order?: Order;
  whatsapp_url?: string;
}

export interface HeroSlide {
  id: string;
  image_path: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AboutSettings {
  id: string;
  eyebrow?: string | null;
  title: string;
  description: string;
  updated_at?: string;
}

export interface FounderProfile {
  id: string;
  name: string;
  role: string;
  short_bio?: string | null;
  photo_path: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  cover_image_path: string;
  year?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  images?: GalleryImage[];
}

export interface GalleryImage {
  id: string;
  album_id: string;
  image_path: string;
  caption?: string | null;
  display_order: number;
  created_at?: string;
}

