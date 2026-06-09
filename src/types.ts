export interface FeatureItem {
  name: string;
  included: boolean;
  notes?: string;
}

export interface StreamPackage {
  id: string;
  name: string;
  description: string;
  rates: {
    [hours: number]: number; // Price in IDR for specific duration
  };
  features: FeatureItem[];
  camerasCount: number;
  crewCount: number;
  highlighted?: boolean;
  badge?: string;
}

export interface AddOnOption {
  id: string;
  name: string;
  price: number;
  unit: string;
  description: string;
  category: 'equipment' | 'service' | 'upgrade';
  maxQty: number;
}

export interface BookingFormDetails {
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventNotes: string;
}

export interface SelectedAddOn {
  id: string;
  quantity: number;
}

export interface ClientReview {
  id: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  comment: string;
  avatarUrl: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Voucher {
  code: string;
  discount: number;
}

declare module '*.png' {
  const value: string;
  export default value;
}

