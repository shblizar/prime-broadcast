import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  SiteSettings,
  PortfolioItem,
  ClientLogo,
  Package,
  PackageFeature,
  PackageFeatureInput,
  Upgrade,
  OvertimeSettings,
  Addon,
  Voucher,
  VoucherValidationResult,
  FAQ,
  Order,
  OrderItem,
  OrderStatus,
  OrderSubmissionPayload,
  OrderCreationResponse,
  HeroSlide,
  AboutSettings,
  FounderProfile,
  GalleryAlbum,
  GalleryImage,
} from '../types';
import { extractYouTubeVideoId } from '../utils/youtube';
import { generateLocalInvoiceNumber } from '../utils/invoice';
import { formatOrderWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp';

// Initial Seeds per master prompt instructions
const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'default-settings',
  site_name: 'Prime Broadcast',
  company_description:
    'Prime Broadcast adalah vendor penyedia jasa live streaming broadcast, multi-camera setup, dan dokumentasi video profesional yang berbasis di Jakarta. Prime Broadcast mengombinasikan perangkat kelas penyiaran (broadcast-grade) dengan tim eksekusi berpengalaman untuk menyajikan siaran langsung yang stabil, dinamis, dan berstandar visual tinggi.',
  whatsapp_number: '+62 851-5055-5195',
  instagram_url: 'https://instagram.com/primebroadcast_',
  tiktok_url: 'https://tiktok.com/@primebroadcast_',
  email: 'primebroadcast.id@gmail.com',
  website_url: 'https://www.primebroadcast.net',
};

const DEFAULT_ABOUT_SETTINGS: AboutSettings = {
  id: 'default-about',
  eyebrow: 'Tentang Kami',
  title: 'Tentang Prime Broadcast',
  description:
    'Prime Broadcast adalah vendor penyedia jasa live streaming broadcast, multi-camera setup, dan dokumentasi video profesional yang berbasis di Jakarta.\n\nPrime Broadcast mengombinasikan perangkat kelas penyiaran dengan tim eksekusi berpengalaman untuk menyajikan siaran langsung yang stabil, dinamis, dan berstandar visual tinggi.',
};

const DEFAULT_OVERTIME_SETTINGS: OvertimeSettings = {
  id: 'default-overtime',
  is_active: true,
  rate_percent: 15,
  min_hours: 1,
  max_hours: 8,
  step_hours: 1,
};

// Local storage keys for development fallback
const STORAGE_KEYS = {
  SETTINGS: 'pb_site_settings',
  ABOUT: 'pb_about_settings',
  HERO_SLIDES: 'pb_hero_slides',
  FOUNDERS: 'pb_founders',
  GALLERY_ALBUMS: 'pb_gallery_albums',
  GALLERY_IMAGES: 'pb_gallery_images',
  PORTFOLIO: 'pb_portfolio',
  CLIENT_LOGOS: 'pb_client_logos',
  PACKAGES: 'pb_packages',
  PACKAGE_FEATURES: 'pb_package_features',
  UPGRADES: 'pb_upgrades',
  OVERTIME: 'pb_overtime',
  ADDONS: 'pb_addons',
  VOUCHERS: 'pb_vouchers',
  FAQS: 'pb_faqs',
  ORDERS: 'pb_orders',
  ORDER_ITEMS: 'pb_order_items',
  LOCAL_ADMIN_AUTH: 'pb_admin_auth',
};

function getLocalData<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setLocalData<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Error writing to local storage', err);
  }
}

// Initial seed helper
function initLocalStore() {
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    setLocalData(STORAGE_KEYS.SETTINGS, DEFAULT_SITE_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.OVERTIME)) {
    setLocalData(STORAGE_KEYS.OVERTIME, DEFAULT_OVERTIME_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PACKAGES)) {
    // Initial 4 package concepts seeded inactive as required
    const initialPackages: Package[] = [
      {
        id: 'pkg-1',
        name: 'Light Package',
        slug: 'light-package',
        description: 'Paket siaran langsung esensial untuk webinar, talkshow, atau liputan mini venue.',
        price: 3500000,
        duration_hours: 6,
        display_order: 1,
        is_active: true,
      },
      {
        id: 'pkg-2',
        name: 'Regular Package',
        slug: 'regular-package',
        description: 'Solusi broadcast standar multi-angle untuk seminar korporat dan gathering.',
        price: 5500000,
        duration_hours: 6,
        display_order: 2,
        is_active: true,
      },
      {
        id: 'pkg-3',
        name: 'Gold Package',
        slug: 'gold-package',
        description: 'Paket penyiaran komprehensif 4 kamera dengan switcher broadcast & graphic overlay.',
        price: 8500000,
        duration_hours: 9,
        display_order: 3,
        is_active: true,
      },
      {
        id: 'pkg-4',
        name: 'Platinum Package',
        slug: 'platinum-package',
        description: 'Produksi penyiaran skala besar multi-platform dengan wireless roaming & full team.',
        price: 13500000,
        duration_hours: 9,
        display_order: 4,
        is_active: true,
      },
    ];
    setLocalData(STORAGE_KEYS.PACKAGES, initialPackages);

    const initialFeatures: PackageFeature[] = [
      { id: 'feat-1', package_id: 'pkg-1', feature_text: '2 Broadcast Camera Sony FX3/FX6', display_order: 1 },
      { id: 'feat-2', package_id: 'pkg-1', feature_text: 'Live Streaming ke 1 Platform', display_order: 2 },
      { id: 'feat-3', package_id: 'pkg-1', feature_text: 'Basic Lower Third & Title Overlay', display_order: 3 },
      { id: 'feat-4', package_id: 'pkg-1', feature_text: 'Audio Mixer Link & Master Recording', display_order: 4 },

      { id: 'feat-5', package_id: 'pkg-2', feature_text: '3 Broadcast Camera Sony Cinema Line', display_order: 1 },
      { id: 'feat-6', package_id: 'pkg-2', feature_text: 'Live Streaming Dual Platform (YouTube / Zoom)', display_order: 2 },
      { id: 'feat-7', package_id: 'pkg-2', feature_text: 'Custom Graphic Overlay & Sponsor Logo', display_order: 3 },
      { id: 'feat-8', package_id: 'pkg-2', feature_text: 'Full HD 1080p 60fps Broadcast', display_order: 4 },
      { id: 'feat-9', package_id: 'pkg-2', feature_text: 'Dedicated Video Switcher Operator', display_order: 5 },

      { id: 'feat-10', package_id: 'pkg-3', feature_text: '4 Broadcast Camera + Switcher ATEM Production Studio', display_order: 1 },
      { id: 'feat-11', package_id: 'pkg-3', feature_text: 'Multi-platform Streaming (YouTube, Zoom, Instagram, TikTok)', display_order: 2 },
      { id: 'feat-12', package_id: 'pkg-3', feature_text: 'Dynamic Graphic Overlay, Running Text & Video Clip Insertion', display_order: 3 },
      { id: 'feat-13', package_id: 'pkg-3', feature_text: 'Direct Audio Processing & Delay Correction', display_order: 4 },
      { id: 'feat-14', package_id: 'pkg-3', feature_text: 'Individual Isolated (ISO) Multi-Cam Recording', display_order: 5 },

      { id: 'feat-15', package_id: 'pkg-4', feature_text: '5+ Broadcast Camera (Termasuk Wireless Roaming Camera)', display_order: 1 },
      { id: 'feat-16', package_id: 'pkg-4', feature_text: 'Multi-Platform 4K Ready Broadcast Routing', display_order: 2 },
      { id: 'feat-17', package_id: 'pkg-4', feature_text: 'Teleprompter / Confidence Monitor Support', display_order: 3 },
      { id: 'feat-18', package_id: 'pkg-4', feature_text: 'Intercom System 8-Channel & Show Director', display_order: 4 },
      { id: 'feat-19', package_id: 'pkg-4', feature_text: 'Same-Day Highlight Clip & Raw Footage Delivery', display_order: 5 },
    ];
    setLocalData(STORAGE_KEYS.PACKAGE_FEATURES, initialFeatures);
  }

  if (!localStorage.getItem(STORAGE_KEYS.UPGRADES)) {
    const initialUpgrades: Upgrade[] = [
      {
        id: 'upg-1',
        name: 'Tambahan Kamera Sony Cinema Line',
        description: 'Unit kamera tambahan lengkap dengan operator profesional dan tripod fluid head.',
        price: 1500000,
        unit_label: '/kamera',
        allow_quantity: true,
        min_quantity: 1,
        max_quantity: 4,
        display_order: 1,
        is_active: true,
      },
      {
        id: 'upg-2',
        name: 'Wireless Roaming Camera System',
        description: 'Transmisi video tanpa kabel ultra-low latency untuk pergerakan leluasa di panggung / penonton.',
        price: 1200000,
        unit_label: '/unit',
        allow_quantity: true,
        min_quantity: 1,
        max_quantity: 2,
        display_order: 2,
        is_active: true,
      },
      {
        id: 'upg-3',
        name: 'Jimmy Jib Crane 6 Meter',
        description: 'Arm jib crane bermotor untuk sudut pandang udara dinamis dan sinematik.',
        price: 3500000,
        unit_label: '/unit',
        allow_quantity: false,
        min_quantity: 1,
        max_quantity: 1,
        display_order: 3,
        is_active: true,
      },
    ];
    setLocalData(STORAGE_KEYS.UPGRADES, initialUpgrades);
  }

  if (!localStorage.getItem(STORAGE_KEYS.ADDONS)) {
    const initialAddons: Addon[] = [
      {
        id: 'addon-1',
        name: 'Dedicated Backup Internet Modem Bonding (5G/4G)',
        description: 'Koneksi internet multi-provider bonding redundancy untuk menjamin siaran tanpa putus.',
        price: 1000000,
        unit_label: '/event',
        allow_quantity: false,
        min_quantity: 1,
        max_quantity: 1,
        display_order: 1,
        is_active: true,
      },
      {
        id: 'addon-2',
        name: 'Laptop Presentation Relay & Clicker Cue',
        description: 'Laptop workstation khusus operator PPT/Keynote dengan seamless switch.',
        price: 500000,
        unit_label: '/unit',
        allow_quantity: true,
        min_quantity: 1,
        max_quantity: 3,
        display_order: 2,
        is_active: true,
      },
      {
        id: 'addon-3',
        name: 'Custom Broadcast Graphic Package',
        description: 'Desain template bumper, opening, lower third animasi, dan closing sesuai brand event.',
        price: 1250000,
        unit_label: '/paket',
        allow_quantity: false,
        min_quantity: 1,
        max_quantity: 1,
        display_order: 3,
        is_active: true,
      },
    ];
    setLocalData(STORAGE_KEYS.ADDONS, initialAddons);
  }

  if (!localStorage.getItem(STORAGE_KEYS.PORTFOLIO)) {
    const initialPortfolio: PortfolioItem[] = [
      {
        id: 'port-1',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtube_video_id: 'dQw4w9WgXcQ',
        display_order: 1,
        is_active: true,
      },
      {
        id: 'port-2',
        youtube_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        youtube_video_id: '9bZkp7q19f0',
        display_order: 2,
        is_active: true,
      },
    ];
    setLocalData(STORAGE_KEYS.PORTFOLIO, initialPortfolio);
  }

  if (!localStorage.getItem(STORAGE_KEYS.CLIENT_LOGOS)) {
    const initialLogos: ClientLogo[] = [
      {
        id: 'logo-1',
        client_name: 'PT Bank Central Asia Tbk',
        logo_path: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg',
        display_order: 1,
        is_active: true,
      },
      {
        id: 'logo-2',
        client_name: 'Telkom Indonesia',
        logo_path: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Telkom_Indonesia_2013.svg',
        display_order: 2,
        is_active: true,
      },
      {
        id: 'logo-3',
        client_name: 'Universitas Indonesia',
        logo_path: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Makara_UI.png',
        display_order: 3,
        is_active: true,
      },
      {
        id: 'logo-4',
        client_name: 'Kementerian BUMN RI',
        logo_path: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Logo_Kementerian_Badan_Usaha_Milik_Negara_Republik_Indonesia.svg',
        display_order: 4,
        is_active: true,
      },
    ];
    setLocalData(STORAGE_KEYS.CLIENT_LOGOS, initialLogos);
  }

  if (!localStorage.getItem(STORAGE_KEYS.FAQS)) {
    const initialFaqs: FAQ[] = [
      {
        id: 'faq-1',
        question: 'Berapa lama waktu persiapan (setup) sebelum acara dimulai?',
        answer:
          'Tim Prime Broadcast akan tiba di lokasi venue sekitar 3 hingga 5 jam sebelum acara (rundown) dimulai. Waktu ini digunakan untuk instalasi kamera, routing kabel fiber/SDI, setting switcher, sound mixer integration, serta trial streaming agar kualitas siaran stabil.',
        display_order: 1,
        is_active: true,
      },
      {
        id: 'faq-2',
        question: 'Apakah Prime Broadcast menyediakan sound system dan layar proyektor?',
        answer:
          'Prime Broadcast fokus pada broadcast penyiaran dan live streaming. Kami tidak menyediakan sound system fisik ruangan ataupun proyektor. Kami akan menerima sinyal audio master dari output mixer sound system venue / vendor audio klien.',
        display_order: 2,
        is_active: true,
      },
      {
        id: 'faq-3',
        question: 'Bagaimana persyaratan koneksi internet di lokasi event?',
        answer:
          'Untuk kelancaran live streaming berstandar Full HD/4K, lokasi acara wajib menyediakan jalur internet kabel LAN RJ45 dengan kecepatan upload dedicated minimal 20–30 Mbps. Kami juga menyediakan opsi add-on modem multi-provider bonding sebagai backup.',
        display_order: 3,
        is_active: true,
      },
      {
        id: 'faq-4',
        question: 'Apakah bisa melayani event di luar kota Jakarta?',
        answer:
          'Ya, Prime Broadcast siap melayani acara di luar Jakarta dan seluruh Indonesia. Seluruh biaya transportasi tim, akomodasi, dan kargo perlengkapan ditanggung oleh pihak klien sesuai kesepakatan di awal.',
        display_order: 4,
        is_active: true,
      },
      {
        id: 'faq-5',
        question: 'Kapan file rekaman (master video & ISO) diserahkan?',
        answer:
          'File rekaman master program siaran Full HD akan langsung diserahkan kepada klien di hari yang sama atau maksimal H+1 via Google Drive / hard disk eksternal klien.',
        display_order: 5,
        is_active: true,
      },
    ];
    setLocalData(STORAGE_KEYS.FAQS, initialFaqs);
  }

  if (!localStorage.getItem(STORAGE_KEYS.VOUCHERS)) {
    const initialVouchers: Voucher[] = [
      {
        id: 'vouc-1',
        name: 'Diskon Spesial Peluncuran',
        code: 'PRIME10',
        discount_type: 'percentage',
        discount_value: 10,
        minimum_transaction: 5000000,
        maximum_discount: 1000000,
        starts_at: new Date(Date.now() - 86400000).toISOString(),
        expires_at: new Date(Date.now() + 86400000 * 90).toISOString(),
        usage_limit: 100,
        usage_count: 3,
        is_active: true,
      },
      {
        id: 'vouc-2',
        name: 'Potongan Langsung Korporat',
        code: 'CORP500',
        discount_type: 'fixed',
        discount_value: 500000,
        minimum_transaction: 8000000,
        maximum_discount: null,
        starts_at: new Date(Date.now() - 86400000).toISOString(),
        expires_at: new Date(Date.now() + 86400000 * 90).toISOString(),
        usage_limit: 50,
        usage_count: 1,
        is_active: true,
      },
    ];
    setLocalData(STORAGE_KEYS.VOUCHERS, initialVouchers);
  }

  if (!localStorage.getItem(STORAGE_KEYS.ABOUT)) {
    setLocalData(STORAGE_KEYS.ABOUT, DEFAULT_ABOUT_SETTINGS);
  }

  if (!localStorage.getItem(STORAGE_KEYS.HERO_SLIDES)) {
    setLocalData(STORAGE_KEYS.HERO_SLIDES, []);
  }

  if (!localStorage.getItem(STORAGE_KEYS.FOUNDERS)) {
    const initialFounders: FounderProfile[] = [
      {
        id: 'founder-1',
        name: 'Rian Pratama',
        role: 'Founder & Technical Director',
        short_bio:
          'Berpengalaman lebih dari 8 tahun dalam penyiaran multi-kamera, live streaming korporat, dan manajemen produksi penyiaran berstandar industri.',
        photo_path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        display_order: 1,
        is_active: true,
      },
    ];
    setLocalData(STORAGE_KEYS.FOUNDERS, initialFounders);
  }

  if (!localStorage.getItem(STORAGE_KEYS.GALLERY_ALBUMS)) {
    const initialAlbums: GalleryAlbum[] = [
      {
        id: 'album-1',
        title: 'Tech Summit & Expo Jakarta',
        cover_image_path: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        year: '2025',
        display_order: 1,
        is_active: true,
      },
      {
        id: 'album-2',
        title: 'Simposium Kedokteran Nasional',
        cover_image_path: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        year: '2025',
        display_order: 2,
        is_active: true,
      },
      {
        id: 'album-3',
        title: 'Konser Musik & Gala Dinner',
        cover_image_path: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        year: '2024',
        display_order: 3,
        is_active: true,
      },
      {
        id: 'album-4',
        title: 'Corporate Awards & Annual Gathering',
        cover_image_path: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        year: '2024',
        display_order: 4,
        is_active: true,
      },
    ];
    setLocalData(STORAGE_KEYS.GALLERY_ALBUMS, initialAlbums);

    const initialImages: GalleryImage[] = [
      {
        id: 'img-1-1',
        album_id: 'album-1',
        image_path: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        caption: 'Setup Kontrol Switcher Utama',
        display_order: 1,
      },
      {
        id: 'img-1-2',
        album_id: 'album-1',
        image_path: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
        caption: 'Kamera Panggung Utama & Jimmy Jib',
        display_order: 2,
      },
      {
        id: 'img-2-1',
        album_id: 'album-2',
        image_path: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        caption: 'Multi-Camera Routing & Presentation Cue',
        display_order: 1,
      },
      {
        id: 'img-3-1',
        album_id: 'album-3',
        image_path: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        caption: 'Live Audio Direct Feed & Stage Coverage',
        display_order: 1,
      },
      {
        id: 'img-4-1',
        album_id: 'album-4',
        image_path: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        caption: 'Auditorium Setup & Wireless Roaming',
        display_order: 1,
      },
    ];
    setLocalData(STORAGE_KEYS.GALLERY_IMAGES, initialImages);
  }
}

// Run local store initialization
initLocalStore();

/* ======================================================================
   LIGHTWEIGHT STALE-WHILE-REVALIDATE CACHING & REQUEST DEDUPLICATION
   ====================================================================== */
const MEMORY_CACHE = new Map<string, { data: any; timestamp: number }>();
const IN_FLIGHT_REQUESTS = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

export function getPublicCachedData<T>(key: string): T | null {
  const mem = MEMORY_CACHE.get(key);
  if (mem && Date.now() - mem.timestamp < CACHE_TTL_MS) {
    return mem.data as T;
  }
  try {
    const raw = localStorage.getItem(`pb_cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data !== undefined) {
        MEMORY_CACHE.set(key, parsed);
        return parsed.data as T;
      }
    }
  } catch (e) {
    console.warn('Cache read error', e);
  }
  return null;
}

export function setPublicCachedData<T>(key: string, data: T): void {
  const entry = { data, timestamp: Date.now() };
  MEMORY_CACHE.set(key, entry);
  try {
    localStorage.setItem(`pb_cache_${key}`, JSON.stringify(entry));
  } catch (e) {
    console.warn('Cache write error', e);
  }
}

export function invalidatePublicCache(key: string): void {
  MEMORY_CACHE.delete(key);
  try {
    localStorage.removeItem(`pb_cache_${key}`);
  } catch (e) {
    console.warn('Cache invalidate error', e);
  }
}

async function executeSWR<T>(
  key: string,
  networkFetcher: () => Promise<T>,
  localFallbackFetcher: () => T
): Promise<T> {
  const cached = getPublicCachedData<T>(key);

  // Trigger background revalidation if not already in-flight
  if (!IN_FLIGHT_REQUESTS.has(key)) {
    const networkPromise = (async () => {
      try {
        const fresh = await networkFetcher();
        if (fresh !== null && fresh !== undefined) {
          setPublicCachedData(key, fresh);
        }
        return fresh;
      } catch (err) {
        console.warn(`Background revalidate failed for ${key}`, err);
        return cached ?? localFallbackFetcher();
      } finally {
        IN_FLIGHT_REQUESTS.delete(key);
      }
    })();
    IN_FLIGHT_REQUESTS.set(key, networkPromise);
  }

  // If cache hit, return immediately
  if (cached !== null) {
    return cached;
  }

  // If no cache, wait for network request or fallback
  try {
    const fresh = await IN_FLIGHT_REQUESTS.get(key)!;
    if (fresh !== null && fresh !== undefined) return fresh;
  } catch (e) {
    console.warn(`Initial fetch failed for ${key}`, e);
  }

  const fallback = localFallbackFetcher();
  setPublicCachedData(key, fallback);
  return fallback;
}

/* ======================================================================
   SITE SETTINGS
   ====================================================================== */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured) {
    return executeSWR(
      'site_settings',
      async () => {
        const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
        if (!error && data) return data as SiteSettings;
        throw error || new Error('Failed to fetch site settings');
      },
      () => getLocalData<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SITE_SETTINGS)
    );
  }
  return getLocalData<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SITE_SETTINGS);
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  invalidatePublicCache('site_settings');
  if (isSupabaseConfigured) {
    try {
      const current = await getSiteSettings();
      const { data, error } = await supabase
        .from('site_settings')
        .upsert({ ...current, ...settings, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (!error && data) return data as SiteSettings;
    } catch (e) {
      console.warn('Supabase updateSiteSettings error, updating local data', e);
    }
  }
  const current = getLocalData<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SITE_SETTINGS);
  const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

/* ======================================================================
   PORTFOLIO
   ====================================================================== */
export async function getPublicPortfolio(): Promise<PortfolioItem[]> {
  if (isSupabaseConfigured) {
    return executeSWR(
      'public_portfolio',
      async () => {
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (!error && data) return data as PortfolioItem[];
        throw error || new Error('Failed to fetch portfolio');
      },
      () => {
        const items = getLocalData<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, []);
        return items.filter((i) => i.is_active).sort((a, b) => a.display_order - b.display_order);
      }
    );
  }
  const items = getLocalData<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, []);
  return items.filter((i) => i.is_active).sort((a, b) => a.display_order - b.display_order);
}

export async function getAdminPortfolio(): Promise<PortfolioItem[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data) return data as PortfolioItem[];
    } catch (e) {
      console.warn('Supabase getAdminPortfolio error', e);
    }
  }
  const items = getLocalData<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, []);
  return items.sort((a, b) => a.display_order - b.display_order);
}

export async function addPortfolioItem(youtubeUrl: string, displayOrder = 0): Promise<PortfolioItem> {
  invalidatePublicCache('public_portfolio');
  const videoId = extractYouTubeVideoId(youtubeUrl);
  if (!videoId) {
    throw new Error('URL YouTube tidak valid. Mohon masukkan URL YouTube yang benar.');
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('portfolio_items')
      .insert({
        youtube_url: youtubeUrl.trim(),
        youtube_video_id: videoId,
        display_order: displayOrder,
        is_active: true,
      })
      .select()
      .single();
    if (!error && data) return data as PortfolioItem;
    if (error) throw new Error(error.message);
  }

  const items = getLocalData<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, []);
  const newItem: PortfolioItem = {
    id: `port-${Date.now()}`,
    youtube_url: youtubeUrl.trim(),
    youtube_video_id: videoId,
    display_order: displayOrder || items.length + 1,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  items.push(newItem);
  setLocalData(STORAGE_KEYS.PORTFOLIO, items);
  return newItem;
}

export async function updatePortfolioItem(id: string, updates: Partial<PortfolioItem>): Promise<PortfolioItem> {
  invalidatePublicCache('public_portfolio');
  if (updates.youtube_url) {
    const videoId = extractYouTubeVideoId(updates.youtube_url);
    if (!videoId) throw new Error('URL YouTube tidak valid.');
    updates.youtube_video_id = videoId;
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('portfolio_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data as PortfolioItem;
    if (error) throw new Error(error.message);
  }

  const items = getLocalData<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, []);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error('Item portfolio tidak ditemukan.');
  items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.PORTFOLIO, items);
  return items[idx];
}

export async function deletePortfolioItem(id: string): Promise<void> {
  invalidatePublicCache('public_portfolio');
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const items = getLocalData<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, []);
  setLocalData(
    STORAGE_KEYS.PORTFOLIO,
    items.filter((i) => i.id !== id)
  );
}

/* ======================================================================
   CLIENT LOGOS
   ====================================================================== */
export async function getPublicClientLogos(): Promise<ClientLogo[]> {
  if (isSupabaseConfigured) {
    return executeSWR(
      'public_client_logos',
      async () => {
        const { data, error } = await supabase
          .from('client_logos')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (!error && data) return data as ClientLogo[];
        throw error || new Error('Failed to fetch client logos');
      },
      () => {
        const logos = getLocalData<ClientLogo[]>(STORAGE_KEYS.CLIENT_LOGOS, []);
        return logos.filter((l) => l.is_active).sort((a, b) => a.display_order - b.display_order);
      }
    );
  }
  const logos = getLocalData<ClientLogo[]>(STORAGE_KEYS.CLIENT_LOGOS, []);
  return logos.filter((l) => l.is_active).sort((a, b) => a.display_order - b.display_order);
}

export async function getAdminClientLogos(): Promise<ClientLogo[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('client_logos')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data) return data as ClientLogo[];
    } catch (e) {
      console.warn('Supabase getAdminClientLogos error', e);
    }
  }
  const logos = getLocalData<ClientLogo[]>(STORAGE_KEYS.CLIENT_LOGOS, []);
  return logos.sort((a, b) => a.display_order - b.display_order);
}

export async function uploadClientLogoFile(file: File): Promise<string> {
  if (isSupabaseConfigured) {
    const ext = file.name.split('.').pop() || 'png';
    const filePath = `logos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('client-logos').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw new Error(`Upload storage error: ${error.message}`);
    const { data } = supabase.storage.from('client-logos').getPublicUrl(filePath);
    return data.publicUrl;
  }
  // Local base64 fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function addClientLogo(clientName: string, logoPath: string, displayOrder = 0): Promise<ClientLogo> {
  invalidatePublicCache('public_client_logos');
  if (!clientName.trim() || !logoPath.trim()) {
    throw new Error('Nama klien dan logo wajib diisi.');
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('client_logos')
      .insert({
        client_name: clientName.trim(),
        logo_path: logoPath.trim(),
        display_order: displayOrder,
        is_active: true,
      })
      .select()
      .single();
    if (!error && data) return data as ClientLogo;
    if (error) throw new Error(error.message);
  }

  const logos = getLocalData<ClientLogo[]>(STORAGE_KEYS.CLIENT_LOGOS, []);
  const newLogo: ClientLogo = {
    id: `logo-${Date.now()}`,
    client_name: clientName.trim(),
    logo_path: logoPath.trim(),
    display_order: displayOrder || logos.length + 1,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  logos.push(newLogo);
  setLocalData(STORAGE_KEYS.CLIENT_LOGOS, logos);
  return newLogo;
}

export async function updateClientLogo(id: string, updates: Partial<ClientLogo>): Promise<ClientLogo> {
  invalidatePublicCache('public_client_logos');
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('client_logos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data as ClientLogo;
    if (error) throw new Error(error.message);
  }

  const logos = getLocalData<ClientLogo[]>(STORAGE_KEYS.CLIENT_LOGOS, []);
  const idx = logos.findIndex((l) => l.id === id);
  if (idx === -1) throw new Error('Logo tidak ditemukan.');
  logos[idx] = { ...logos[idx], ...updates, updated_at: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.CLIENT_LOGOS, logos);
  return logos[idx];
}

export async function deleteClientLogo(id: string): Promise<void> {
  invalidatePublicCache('public_client_logos');
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('client_logos').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const logos = getLocalData<ClientLogo[]>(STORAGE_KEYS.CLIENT_LOGOS, []);
  setLocalData(
    STORAGE_KEYS.CLIENT_LOGOS,
    logos.filter((l) => l.id !== id)
  );
}

/* ======================================================================
   PACKAGES & FEATURES
   ====================================================================== */
export async function getPublicPackages(): Promise<Package[]> {
  if (isSupabaseConfigured) {
    return executeSWR(
      'public_packages',
      async () => {
        const { data: pkgs, error: pkgErr } = await supabase
          .from('packages')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!pkgErr && pkgs) {
          const { data: feats } = await supabase
            .from('package_features')
            .select('*')
            .order('display_order', { ascending: true });

          const mapped = pkgs.map((pkg: Package) => ({
            ...pkg,
            features: (feats || []).filter((f: PackageFeature) => f.package_id === pkg.id),
          }));
          return mapped;
        }
        throw pkgErr || new Error('Failed to fetch packages');
      },
      () => {
        const pkgs = getLocalData<Package[]>(STORAGE_KEYS.PACKAGES, []);
        const feats = getLocalData<PackageFeature[]>(STORAGE_KEYS.PACKAGE_FEATURES, []);
        return pkgs
          .filter((p) => p.is_active)
          .sort((a, b) => a.display_order - b.display_order)
          .map((p) => ({
            ...p,
            features: feats.filter((f) => f.package_id === p.id).sort((a, b) => a.display_order - b.display_order),
          }));
      }
    );
  }

  const pkgs = getLocalData<Package[]>(STORAGE_KEYS.PACKAGES, []);
  const feats = getLocalData<PackageFeature[]>(STORAGE_KEYS.PACKAGE_FEATURES, []);
  return pkgs
    .filter((p) => p.is_active)
    .sort((a, b) => a.display_order - b.display_order)
    .map((p) => ({
      ...p,
      features: feats.filter((f) => f.package_id === p.id).sort((a, b) => a.display_order - b.display_order),
    }));
}

export async function getAdminPackages(): Promise<Package[]> {
  if (isSupabaseConfigured) {
    try {
      const { data: pkgs, error: pkgErr } = await supabase
        .from('packages')
        .select('*')
        .order('display_order', { ascending: true });

      if (!pkgErr && pkgs) {
        const { data: feats } = await supabase
          .from('package_features')
          .select('*')
          .order('display_order', { ascending: true });

        return pkgs.map((pkg: Package) => ({
          ...pkg,
          features: (feats || []).filter((f: PackageFeature) => f.package_id === pkg.id),
        }));
      }
    } catch (e) {
      console.warn('Supabase getAdminPackages error', e);
    }
  }

  const pkgs = getLocalData<Package[]>(STORAGE_KEYS.PACKAGES, []);
  const feats = getLocalData<PackageFeature[]>(STORAGE_KEYS.PACKAGE_FEATURES, []);
  return pkgs
    .sort((a, b) => a.display_order - b.display_order)
    .map((p) => ({
      ...p,
      features: feats.filter((f) => f.package_id === p.id).sort((a, b) => a.display_order - b.display_order),
    }));
}

export async function createPackage(pkgData: {
  name: string;
  slug?: string;
  description: string;
  price: number;
  duration_hours: number;
  display_order?: number;
  is_active?: boolean;
  features?: (string | PackageFeatureInput)[];
}): Promise<Package> {
  const slug = pkgData.slug || pkgData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const displayOrder = pkgData.display_order ?? 0;

  if (isSupabaseConfigured) {
    const { data: newPkg, error } = await supabase
      .from('packages')
      .insert({
        name: pkgData.name.trim(),
        slug,
        description: pkgData.description.trim(),
        price: pkgData.price,
        duration_hours: pkgData.duration_hours,
        display_order: displayOrder,
        is_active: pkgData.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const featureInserts = (pkgData.features ?? [])
      .map((f, idx) => {
        if (typeof f === 'string') {
          return {
            package_id: newPkg.id,
            feature_text: f.trim(),
            display_order: idx + 1,
          };
        }
        return {
          package_id: newPkg.id,
          feature_text: f.feature_text?.trim() || '',
          display_order: f.display_order ?? idx + 1,
        };
      })
      .filter((f) => f.feature_text.length > 0);

    if (featureInserts.length > 0) {
      const { error: featureError } = await supabase
        .from('package_features')
        .insert(featureInserts);

      if (featureError) {
        throw new Error(featureError.message);
      }
    }

    return newPkg as Package;
  }

  const pkgs = getLocalData<Package[]>(STORAGE_KEYS.PACKAGES, []);
  const pkgId = `pkg-${Date.now()}`;
  const newPkg: Package = {
    id: pkgId,
    name: pkgData.name.trim(),
    slug,
    description: pkgData.description.trim(),
    price: pkgData.price,
    duration_hours: pkgData.duration_hours,
    display_order: displayOrder || pkgs.length + 1,
    is_active: pkgData.is_active ?? true,
    created_at: new Date().toISOString(),
  };
  pkgs.push(newPkg);
  setLocalData(STORAGE_KEYS.PACKAGES, pkgs);

  if (pkgData.features && pkgData.features.length > 0) {
    const feats = getLocalData<PackageFeature[]>(STORAGE_KEYS.PACKAGE_FEATURES, []);
    pkgData.features.forEach((f, idx) => {
      const text = typeof f === 'string' ? f.trim() : (f.feature_text || '').trim();
      if (!text) return;
      const order = typeof f === 'string' ? idx + 1 : (f.display_order ?? idx + 1);
      feats.push({
        id: `feat-${Date.now()}-${idx}`,
        package_id: pkgId,
        feature_text: text,
        display_order: order,
        created_at: new Date().toISOString(),
      });
    });
    setLocalData(STORAGE_KEYS.PACKAGE_FEATURES, feats);
  }

  return newPkg;
}

export async function updatePackage(
  id: string,
  pkgData: Omit<Partial<Package>, 'features'> & { features?: (string | PackageFeatureInput)[] }
): Promise<Package> {
  const { features, ...directUpdates } = pkgData;

  if (isSupabaseConfigured) {
    const { data: updated, error } = await supabase
      .from('packages')
      .update({ ...directUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (features !== undefined) {
      // replace features
      const { error: deleteError } = await supabase
        .from('package_features')
        .delete()
        .eq('package_id', id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      const featureInserts = (features || [])
        .map((f, idx) => {
          if (typeof f === 'string') {
            return {
              package_id: id,
              feature_text: f.trim(),
              display_order: idx + 1,
            };
          }
          return {
            package_id: id,
            feature_text: f.feature_text?.trim() || '',
            display_order: f.display_order ?? idx + 1,
          };
        })
        .filter((f) => f.feature_text.length > 0);

      if (featureInserts.length > 0) {
        const { error: insertError } = await supabase
          .from('package_features')
          .insert(featureInserts);

        if (insertError) {
          throw new Error(insertError.message);
        }
      }
    }

    return updated as Package;
  }

  const pkgs = getLocalData<Package[]>(STORAGE_KEYS.PACKAGES, []);
  const idx = pkgs.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Package tidak ditemukan.');
  pkgs[idx] = { ...pkgs[idx], ...directUpdates, updated_at: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.PACKAGES, pkgs);

  if (features !== undefined) {
    let feats = getLocalData<PackageFeature[]>(STORAGE_KEYS.PACKAGE_FEATURES, []);
    feats = feats.filter((f) => f.package_id !== id);
    (features || []).forEach((f, fIdx) => {
      const text = typeof f === 'string' ? f.trim() : (f.feature_text || '').trim();
      if (!text) return;
      const order = typeof f === 'string' ? fIdx + 1 : (f.display_order ?? fIdx + 1);
      feats.push({
        id: `feat-${Date.now()}-${fIdx}`,
        package_id: id,
        feature_text: text,
        display_order: order,
        created_at: new Date().toISOString(),
      });
    });
    setLocalData(STORAGE_KEYS.PACKAGE_FEATURES, feats);
  }

  return pkgs[idx];
}

export async function deletePackage(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const pkgs = getLocalData<Package[]>(STORAGE_KEYS.PACKAGES, []);
  setLocalData(
    STORAGE_KEYS.PACKAGES,
    pkgs.filter((p) => p.id !== id)
  );

  const feats = getLocalData<PackageFeature[]>(STORAGE_KEYS.PACKAGE_FEATURES, []);
  setLocalData(
    STORAGE_KEYS.PACKAGE_FEATURES,
    feats.filter((f) => f.package_id !== id)
  );
}

/* ======================================================================
   UPGRADES
   ====================================================================== */
export async function getPublicUpgrades(): Promise<Upgrade[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('upgrades')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (!error && data) return data as Upgrade[];
    } catch (e) {
      console.warn('Supabase getPublicUpgrades error', e);
    }
  }
  const items = getLocalData<Upgrade[]>(STORAGE_KEYS.UPGRADES, []);
  return items.filter((u) => u.is_active).sort((a, b) => a.display_order - b.display_order);
}

export async function getAdminUpgrades(): Promise<Upgrade[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('upgrades')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data) return data as Upgrade[];
    } catch (e) {
      console.warn('Supabase getAdminUpgrades error', e);
    }
  }
  const items = getLocalData<Upgrade[]>(STORAGE_KEYS.UPGRADES, []);
  return items.sort((a, b) => a.display_order - b.display_order);
}

export async function createUpgrade(data: Omit<Upgrade, 'id' | 'created_at' | 'updated_at'>): Promise<Upgrade> {
  if (isSupabaseConfigured) {
    const { data: created, error } = await supabase.from('upgrades').insert(data).select().single();
    if (error) throw new Error(error.message);
    return created as Upgrade;
  }
  const list = getLocalData<Upgrade[]>(STORAGE_KEYS.UPGRADES, []);
  const newItem: Upgrade = {
    ...data,
    id: `upg-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  list.push(newItem);
  setLocalData(STORAGE_KEYS.UPGRADES, list);
  return newItem;
}

export async function updateUpgrade(id: string, updates: Partial<Upgrade>): Promise<Upgrade> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('upgrades')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Upgrade;
  }
  const list = getLocalData<Upgrade[]>(STORAGE_KEYS.UPGRADES, []);
  const idx = list.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('Upgrade tidak ditemukan.');
  list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.UPGRADES, list);
  return list[idx];
}

export async function deleteUpgrade(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('upgrades').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const list = getLocalData<Upgrade[]>(STORAGE_KEYS.UPGRADES, []);
  setLocalData(
    STORAGE_KEYS.UPGRADES,
    list.filter((u) => u.id !== id)
  );
}

/* ======================================================================
   OVERTIME SETTINGS
   ====================================================================== */
export async function getOvertimeSettings(): Promise<OvertimeSettings> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('overtime_settings').select('*').limit(1).single();
      if (!error && data) return data as OvertimeSettings;
    } catch (e) {
      console.warn('Supabase getOvertimeSettings error', e);
    }
  }
  return getLocalData<OvertimeSettings>(STORAGE_KEYS.OVERTIME, DEFAULT_OVERTIME_SETTINGS);
}

export async function updateOvertimeSettings(updates: Partial<OvertimeSettings>): Promise<OvertimeSettings> {
  if (isSupabaseConfigured) {
    const current = await getOvertimeSettings();
    const { data, error } = await supabase
      .from('overtime_settings')
      .upsert({ ...current, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as OvertimeSettings;
  }
  const current = getLocalData<OvertimeSettings>(STORAGE_KEYS.OVERTIME, DEFAULT_OVERTIME_SETTINGS);
  const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.OVERTIME, updated);
  return updated;
}

/* ======================================================================
   ADD-ONS
   ====================================================================== */
export async function getPublicAddons(): Promise<Addon[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('addons')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (!error && data) return data as Addon[];
    } catch (e) {
      console.warn('Supabase getPublicAddons error', e);
    }
  }
  const items = getLocalData<Addon[]>(STORAGE_KEYS.ADDONS, []);
  return items.filter((a) => a.is_active).sort((a, b) => a.display_order - b.display_order);
}

export async function getAdminAddons(): Promise<Addon[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('addons')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data) return data as Addon[];
    } catch (e) {
      console.warn('Supabase getAdminAddons error', e);
    }
  }
  const items = getLocalData<Addon[]>(STORAGE_KEYS.ADDONS, []);
  return items.sort((a, b) => a.display_order - b.display_order);
}

export async function createAddon(data: Omit<Addon, 'id' | 'created_at' | 'updated_at'>): Promise<Addon> {
  if (isSupabaseConfigured) {
    const { data: created, error } = await supabase.from('addons').insert(data).select().single();
    if (error) throw new Error(error.message);
    return created as Addon;
  }
  const list = getLocalData<Addon[]>(STORAGE_KEYS.ADDONS, []);
  const newItem: Addon = {
    ...data,
    id: `addon-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  list.push(newItem);
  setLocalData(STORAGE_KEYS.ADDONS, list);
  return newItem;
}

export async function updateAddon(id: string, updates: Partial<Addon>): Promise<Addon> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('addons')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Addon;
  }
  const list = getLocalData<Addon[]>(STORAGE_KEYS.ADDONS, []);
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Addon tidak ditemukan.');
  list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.ADDONS, list);
  return list[idx];
}

export async function deleteAddon(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('addons').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const list = getLocalData<Addon[]>(STORAGE_KEYS.ADDONS, []);
  setLocalData(
    STORAGE_KEYS.ADDONS,
    list.filter((a) => a.id !== id)
  );
}

/* ======================================================================
   VOUCHERS & RPC VALIDATION
   ====================================================================== */
export async function validateVoucher(code: string, subtotal: number): Promise<VoucherValidationResult> {
  if (!code || !code.trim()) {
    return { valid: false, message: 'Silakan masukkan kode voucher.' };
  }

  const cleanCode = code.trim().toUpperCase();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('validate_voucher', {
        p_code: cleanCode,
        p_subtotal: subtotal,
      });

      if (!error && data) {
        return data as VoucherValidationResult;
      }
    } catch (e) {
      console.warn('Supabase validate_voucher RPC error', e);
    }
  }

  // Local calculation fallback
  const vouchers = getLocalData<Voucher[]>(STORAGE_KEYS.VOUCHERS, []);
  const voucher = vouchers.find((v) => v.code.toUpperCase() === cleanCode);

  if (!voucher) {
    return { valid: false, message: 'Kode voucher tidak ditemukan.' };
  }

  if (!voucher.is_active) {
    return { valid: false, message: 'Voucher tidak aktif.' };
  }

  const now = new Date();
  if (voucher.starts_at && new Date(voucher.starts_at) > now) {
    return { valid: false, message: 'Voucher belum dapat digunakan.' };
  }

  if (voucher.expires_at && new Date(voucher.expires_at) < now) {
    return { valid: false, message: 'Voucher sudah berakhir.' };
  }

  if (subtotal < voucher.minimum_transaction) {
    return {
      valid: false,
      message: `Minimum transaksi belum terpenuhi (min: Rp${voucher.minimum_transaction.toLocaleString('id-ID')}).`,
    };
  }

  if (voucher.usage_limit !== null && voucher.usage_count >= voucher.usage_limit) {
    return { valid: false, message: 'Voucher telah mencapai batas penggunaan.' };
  }

  let discountAmount = 0;
  if (voucher.discount_type === 'percentage') {
    discountAmount = Math.round((subtotal * voucher.discount_value) / 100);
    if (voucher.maximum_discount !== null && discountAmount > voucher.maximum_discount) {
      discountAmount = voucher.maximum_discount;
    }
  } else {
    discountAmount = voucher.discount_value;
  }

  return {
    valid: true,
    message: `Voucher berhasil diterapkan (${voucher.name})`,
    voucher: {
      id: voucher.id,
      code: voucher.code,
      name: voucher.name,
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      discount_amount: discountAmount,
    },
  };
}

export async function getAdminVouchers(): Promise<Voucher[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Voucher[];
    } catch (e) {
      console.warn('Supabase getAdminVouchers error', e);
    }
  }
  return getLocalData<Voucher[]>(STORAGE_KEYS.VOUCHERS, []);
}

export async function createVoucher(data: Omit<Voucher, 'id' | 'usage_count' | 'created_at' | 'updated_at'>): Promise<Voucher> {
  const payload = {
    ...data,
    code: data.code.trim().toUpperCase(),
    usage_count: 0,
  };

  if (isSupabaseConfigured) {
    const { data: created, error } = await supabase.from('vouchers').insert(payload).select().single();
    if (error) throw new Error(error.message);
    return created as Voucher;
  }

  const list = getLocalData<Voucher[]>(STORAGE_KEYS.VOUCHERS, []);
  const newItem: Voucher = {
    ...payload,
    id: `vouc-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  list.push(newItem);
  setLocalData(STORAGE_KEYS.VOUCHERS, list);
  return newItem;
}

export async function updateVoucher(id: string, updates: Partial<Voucher>): Promise<Voucher> {
  if (updates.code) {
    updates.code = updates.code.trim().toUpperCase();
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('vouchers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Voucher;
  }

  const list = getLocalData<Voucher[]>(STORAGE_KEYS.VOUCHERS, []);
  const idx = list.findIndex((v) => v.id === id);
  if (idx === -1) throw new Error('Voucher tidak ditemukan.');
  list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.VOUCHERS, list);
  return list[idx];
}

export async function deleteVoucher(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('vouchers').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const list = getLocalData<Voucher[]>(STORAGE_KEYS.VOUCHERS, []);
  setLocalData(
    STORAGE_KEYS.VOUCHERS,
    list.filter((v) => v.id !== id)
  );
}

/* ======================================================================
   FAQS
   ====================================================================== */
export async function getPublicFaqs(): Promise<FAQ[]> {
  if (isSupabaseConfigured) {
    return executeSWR(
      'public_faqs',
      async () => {
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (!error && data) return data as FAQ[];
        throw error || new Error('Failed to fetch FAQs');
      },
      () => {
        const faqs = getLocalData<FAQ[]>(STORAGE_KEYS.FAQS, []);
        return faqs.filter((f) => f.is_active).sort((a, b) => a.display_order - b.display_order);
      }
    );
  }
  const faqs = getLocalData<FAQ[]>(STORAGE_KEYS.FAQS, []);
  return faqs.filter((f) => f.is_active).sort((a, b) => a.display_order - b.display_order);
}

export async function getAdminFaqs(): Promise<FAQ[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('faqs').select('*').order('display_order', { ascending: true });
      if (!error && data) return data as FAQ[];
    } catch (e) {
      console.warn('Supabase getAdminFaqs error', e);
    }
  }
  const faqs = getLocalData<FAQ[]>(STORAGE_KEYS.FAQS, []);
  return faqs.sort((a, b) => a.display_order - b.display_order);
}

export async function createFaq(data: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>): Promise<FAQ> {
  invalidatePublicCache('public_faqs');
  if (isSupabaseConfigured) {
    const { data: created, error } = await supabase.from('faqs').insert(data).select().single();
    if (error) throw new Error(error.message);
    return created as FAQ;
  }
  const list = getLocalData<FAQ[]>(STORAGE_KEYS.FAQS, []);
  const newItem: FAQ = {
    ...data,
    id: `faq-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  list.push(newItem);
  setLocalData(STORAGE_KEYS.FAQS, list);
  return newItem;
}

export async function updateFaq(id: string, updates: Partial<FAQ>): Promise<FAQ> {
  invalidatePublicCache('public_faqs');
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('faqs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as FAQ;
  }
  const list = getLocalData<FAQ[]>(STORAGE_KEYS.FAQS, []);
  const idx = list.findIndex((f) => f.id === id);
  if (idx === -1) throw new Error('FAQ tidak ditemukan.');
  list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.FAQS, list);
  return list[idx];
}

export async function deleteFaq(id: string): Promise<void> {
  invalidatePublicCache('public_faqs');
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const list = getLocalData<FAQ[]>(STORAGE_KEYS.FAQS, []);
  setLocalData(
    STORAGE_KEYS.FAQS,
    list.filter((f) => f.id !== id)
  );
}

/* ======================================================================
   ORDERS & CHECKOUT
   ====================================================================== */
export async function createOrder(payload: OrderSubmissionPayload): Promise<OrderCreationResponse> {
  // Always recalculate pricing server-side / source-of-truth
  const packages = await getPublicPackages();
  const selectedPkg = packages.find((p) => p.id === payload.package_id);
  if (!selectedPkg || !selectedPkg.is_active) {
    throw new Error('Paket yang dipilih tidak valid atau sedang tidak aktif.');
  }

  const upgrades = await getPublicUpgrades();
  const addons = await getPublicAddons();
  const overtimeSettings = await getOvertimeSettings();
  const siteSettings = await getSiteSettings();

  // Validate upgrades
  const orderItemsToInsert: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[] = [];
  let upgradesSubtotal = 0;

  for (const item of payload.selected_upgrades) {
    if (item.quantity > 0) {
      const upg = upgrades.find((u) => u.id === item.id);
      if (!upg || !upg.is_active) {
        throw new Error(`Upgrade pilihan tidak valid atau tidak aktif.`);
      }
      const qty = upg.allow_quantity
        ? Math.min(Math.max(item.quantity, upg.min_quantity), upg.max_quantity)
        : 1;
      const lineTotal = upg.price * qty;
      upgradesSubtotal += lineTotal;

      orderItemsToInsert.push({
        item_type: 'upgrade',
        reference_id: upg.id,
        item_name: upg.name,
        unit_price: upg.price,
        quantity: qty,
        unit_label: upg.unit_label,
        line_total: lineTotal,
      });
    }
  }

  // Validate overtime
  let overtimeTotal = 0;
  if (overtimeSettings.is_active && payload.overtime_hours > 0) {
    const validHours = Math.min(
      Math.max(payload.overtime_hours, overtimeSettings.min_hours),
      overtimeSettings.max_hours
    );
    const overtimePerHour = Math.round(selectedPkg.price * (overtimeSettings.rate_percent / 100));
    overtimeTotal = overtimePerHour * validHours;

    orderItemsToInsert.push({
      item_type: 'overtime',
      reference_id: null,
      item_name: `Overtime (${overtimeSettings.rate_percent}%/jam)`,
      unit_price: overtimePerHour,
      quantity: validHours,
      unit_label: '/jam',
      line_total: overtimeTotal,
    });
  }

  // Validate addons
  let addonsSubtotal = 0;
  for (const item of payload.selected_addons) {
    if (item.quantity > 0) {
      const addon = addons.find((a) => a.id === item.id);
      if (!addon || !addon.is_active) {
        throw new Error(`Add-on pilihan tidak valid atau tidak aktif.`);
      }
      const qty = addon.allow_quantity
        ? Math.min(Math.max(item.quantity, addon.min_quantity), addon.max_quantity)
        : 1;
      const lineTotal = addon.price * qty;
      addonsSubtotal += lineTotal;

      orderItemsToInsert.push({
        item_type: 'addon',
        reference_id: addon.id,
        item_name: addon.name,
        unit_price: addon.price,
        quantity: qty,
        unit_label: addon.unit_label,
        line_total: lineTotal,
      });
    }
  }

  const subtotal = selectedPkg.price + upgradesSubtotal + overtimeTotal + addonsSubtotal;

  // Validate voucher
  let discountAmount = 0;
  let voucherId: string | null = null;
  let voucherCodeSnapshot: string | null = null;

  if (payload.voucher_code && payload.voucher_code.trim()) {
    const voucherResult = await validateVoucher(payload.voucher_code, subtotal);
    if (voucherResult.valid && voucherResult.voucher) {
      discountAmount = voucherResult.voucher.discount_amount;
      voucherId = voucherResult.voucher.id;
      voucherCodeSnapshot = voucherResult.voucher.code;
    }
  }

  const estimatedTotal = Math.max(0, subtotal - discountAmount);

  // If Supabase is configured, call the transactional database RPC
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('create_order', {
        p_order_data: {
          customer_name: payload.customer_name.trim(),
          organization_name: payload.organization_name.trim(),
          whatsapp: payload.whatsapp.trim(),
          email: payload.email.trim(),
          event_date: payload.event_date,
          event_start_time: payload.event_start_time,
          venue_address: payload.venue_address.trim(),
          additional_notes: payload.additional_notes?.trim() || null,
          package_id: selectedPkg.id,
          voucher_id: voucherId,
          voucher_code: voucherCodeSnapshot,
        },
        p_items: orderItemsToInsert,
      });

      if (!error && data) {
        const fullOrder = data as Order;
        const msg = formatOrderWhatsAppMessage(fullOrder);
        const waUrl = buildWhatsAppUrl(siteSettings.whatsapp_number, msg);
        return {
          success: true,
          order: fullOrder,
          whatsapp_url: waUrl,
        };
      }
    } catch (e) {
      console.warn('Supabase create_order RPC error', e);
    }
  }

  // Local fallback storage transaction
  const existingOrders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, []);
  const invoiceNumber = generateLocalInvoiceNumber(existingOrders.length + 1);
  const orderId = `ord-${Date.now()}`;

  const createdOrder: Order = {
    id: orderId,
    invoice_number: invoiceNumber,
    customer_name: payload.customer_name.trim(),
    organization_name: payload.organization_name.trim(),
    whatsapp: payload.whatsapp.trim(),
    email: payload.email.trim(),
    event_date: payload.event_date,
    event_start_time: payload.event_start_time,
    venue_address: payload.venue_address.trim(),
    additional_notes: payload.additional_notes?.trim() || null,
    package_id: selectedPkg.id,
    package_name_snapshot: selectedPkg.name,
    package_price_snapshot: selectedPkg.price,
    package_duration_snapshot: selectedPkg.duration_hours,
    subtotal,
    discount_amount: discountAmount,
    estimated_total: estimatedTotal,
    voucher_id: voucherId,
    voucher_code_snapshot: voucherCodeSnapshot,
    status: OrderStatus.SUBMITTED,
    created_at: new Date().toISOString(),
    items: orderItemsToInsert.map((item, idx) => ({
      ...item,
      id: `item-${Date.now()}-${idx}`,
      order_id: orderId,
      created_at: new Date().toISOString(),
    })),
  };

  existingOrders.unshift(createdOrder);
  setLocalData(STORAGE_KEYS.ORDERS, existingOrders);

  // If voucher used, increment usage count
  if (voucherId) {
    const vouchers = getLocalData<Voucher[]>(STORAGE_KEYS.VOUCHERS, []);
    const vIdx = vouchers.findIndex((v) => v.id === voucherId);
    if (vIdx !== -1) {
      vouchers[vIdx].usage_count = (vouchers[vIdx].usage_count || 0) + 1;
      setLocalData(STORAGE_KEYS.VOUCHERS, vouchers);
    }
  }

  const whatsappMessage = formatOrderWhatsAppMessage(createdOrder);
  const whatsappUrl = buildWhatsAppUrl(siteSettings.whatsapp_number, whatsappMessage);

  return {
    success: true,
    order: createdOrder,
    whatsapp_url: whatsappUrl,
  };
}

export async function getAdminOrders(): Promise<Order[]> {
  if (isSupabaseConfigured) {
    try {
      const { data: orders, error: oErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!oErr && orders) {
        const { data: items } = await supabase.from('order_items').select('*');
        return orders.map((o: Order) => ({
          ...o,
          items: (items || []).filter((i: OrderItem) => i.order_id === o.id),
        }));
      }
    } catch (e) {
      console.warn('Supabase getAdminOrders error', e);
    }
  }

  return getLocalData<Order[]>(STORAGE_KEYS.ORDERS, []);
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (isSupabaseConfigured) {
    try {
      const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (!error && order) {
        const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
        return {
          ...order,
          items: items || [],
        };
      }
    } catch (e) {
      console.warn('Supabase getOrderById error', e);
    }
  }

  const orders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, []);
  return orders.find((o) => o.id === id) || null;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Order;
  }

  const orders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, []);
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) throw new Error('Order tidak ditemukan.');
  orders[idx] = { ...orders[idx], status, updated_at: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.ORDERS, orders);
  return orders[idx];
}

/* ======================================================================
   HERO SLIDES STORAGE ARCHITECTURE
   ====================================================================== */

/**
 * Extracts the relative Storage object path (e.g. "slides/uuid-filename.jpg")
 * from any string (including full legacy public URLs).
 */
export function extractStoragePath(imagePath: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('data:')) return imagePath;

  let clean = imagePath;
  if (clean.includes('/hero-slides/')) {
    clean = clean.split('/hero-slides/')[1] || clean;
  }
  return clean.replace(/^\/+/, '');
}

/**
 * Generates the public URL ONLY at render time using Supabase Storage getPublicUrl.
 * Does NOT construct URLs manually.
 */
export function getHeroSlidePublicUrl(imagePath: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('data:')) return imagePath;

  const storagePath = extractStoragePath(imagePath);

  if (isSupabaseConfigured && storagePath) {
    const { data } = supabase.storage.from('hero-slides').getPublicUrl(storagePath);
    return data.publicUrl;
  }

  return imagePath;
}

// Export alias for backward compatibility
export const resolveHeroSlideUrl = getHeroSlidePublicUrl;

/**
 * Ensures existing legacy records storing full URLs are cleaned up and returned
 * with relative Storage object paths ("slides/...").
 */
async function cleanAndMigrateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
  if (!slides || slides.length === 0) return slides;

  const cleaned = await Promise.all(
    slides.map(async (slide) => {
      const rawPath = slide.image_path || '';
      const isFullUrl = rawPath.startsWith('http://') || rawPath.startsWith('https://');

      if (isFullUrl && isSupabaseConfigured) {
        const relativePath = extractStoragePath(rawPath);
        if (relativePath && relativePath !== rawPath) {
          try {
            await supabase
              .from('hero_slides')
              .update({ image_path: relativePath, updated_at: new Date().toISOString() })
              .eq('id', slide.id);
          } catch (e) {
            console.warn('Hero slide migration warning:', e);
          }
          return { ...slide, image_path: relativePath };
        }
      }

      return { ...slide, image_path: extractStoragePath(rawPath) };
    })
  );

  return cleaned;
}

export async function getPublicHeroSlides(): Promise<HeroSlide[]> {
  if (isSupabaseConfigured) {
    return executeSWR(
      'public_hero_slides',
      async () => {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (!error && data) {
          return await cleanAndMigrateHeroSlides(data as HeroSlide[]);
        }
        throw error || new Error('Failed to fetch hero slides');
      },
      () => {
        const items = getLocalData<HeroSlide[]>(STORAGE_KEYS.HERO_SLIDES, []);
        return items
          .filter((s) => s.is_active)
          .sort((a, b) => a.display_order - b.display_order)
          .map((s) => ({ ...s, image_path: extractStoragePath(s.image_path) }));
      }
    );
  }
  const items = getLocalData<HeroSlide[]>(STORAGE_KEYS.HERO_SLIDES, []);
  return items
    .filter((s) => s.is_active)
    .sort((a, b) => a.display_order - b.display_order)
    .map((s) => ({ ...s, image_path: extractStoragePath(s.image_path) }));
}

export async function getAdminHeroSlides(): Promise<HeroSlide[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data) {
        return await cleanAndMigrateHeroSlides(data as HeroSlide[]);
      }
    } catch (e) {
      console.warn('Supabase getAdminHeroSlides error', e);
    }
  }
  const items = getLocalData<HeroSlide[]>(STORAGE_KEYS.HERO_SLIDES, []);
  return items
    .sort((a, b) => a.display_order - b.display_order)
    .map((s) => ({ ...s, image_path: extractStoragePath(s.image_path) }));
}

export async function uploadHeroSlideFile(file: File): Promise<string> {
  if (isSupabaseConfigured) {
    // 1. Verify hero-slides bucket is public
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const heroBucket = buckets?.find((b) => b.name === 'hero-slides');
      if (!heroBucket) {
        await supabase.storage.createBucket('hero-slides', { public: true });
      } else if (!heroBucket.public) {
        await supabase.storage.updateBucket('hero-slides', { public: true });
      }
    } catch (e) {
      console.warn('Bucket verification warning:', e);
    }

    // 2. Generate unique Storage object path
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `slides/${crypto.randomUUID()}-${cleanFileName}`;

    // 3. Upload file to Storage
    const { data: uploadData, error } = await supabase.storage
      .from('hero-slides')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw new Error(`Gagal mengunggah file ke Storage: ${error.message}`);
    }

    if (!uploadData || !uploadData.path) {
      throw new Error('Supabase Storage error: upload did not return object path');
    }

    // 4. Return ONLY the real Storage object path (e.g. "slides/6d0f85f1-banner.jpg")
    return uploadData.path;
  }

  // Fallback if local storage only
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function addHeroSlide(slide: {
  image_path: string;
  display_order?: number;
  is_active?: boolean;
}): Promise<HeroSlide> {
  invalidatePublicCache('public_hero_slides');
  if (!slide.image_path) throw new Error('Gambar hero slide wajib dipilih.');

  const cleanPath = extractStoragePath(slide.image_path);

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('hero_slides')
      .insert({
        image_path: cleanPath,
        display_order: slide.display_order ?? 0,
        is_active: slide.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert hero_slides error:', error);
      throw new Error(`Gagal menyimpan data slide ke database: ${error.message}`);
    }

    return data as HeroSlide;
  }

  const items = getLocalData<HeroSlide[]>(STORAGE_KEYS.HERO_SLIDES, []);
  const newSlide: HeroSlide = {
    id: `slide-${Date.now()}`,
    image_path: cleanPath,
    display_order: slide.display_order ?? items.length + 1,
    is_active: slide.is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  items.push(newSlide);
  setLocalData(STORAGE_KEYS.HERO_SLIDES, items);
  return newSlide;
}

export async function updateHeroSlide(id: string, updates: Partial<HeroSlide>): Promise<HeroSlide> {
  invalidatePublicCache('public_hero_slides');
  const cleanUpdates = { ...updates };
  if (cleanUpdates.image_path) {
    cleanUpdates.image_path = extractStoragePath(cleanUpdates.image_path);
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('hero_slides')
      .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database update hero_slides error:', error);
      throw new Error(`Gagal memperbarui slide di database: ${error.message}`);
    }

    return data as HeroSlide;
  }

  const items = getLocalData<HeroSlide[]>(STORAGE_KEYS.HERO_SLIDES, []);
  const idx = items.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error('Hero slide tidak ditemukan.');
  items[idx] = { ...items[idx], ...cleanUpdates, updated_at: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.HERO_SLIDES, items);
  return items[idx];
}

export async function deleteHeroSlide(id: string, imagePath?: string): Promise<void> {
  invalidatePublicCache('public_hero_slides');
  if (isSupabaseConfigured) {
    let targetPath = imagePath;
    if (!targetPath) {
      const { data: slide } = await supabase
        .from('hero_slides')
        .select('image_path')
        .eq('id', id)
        .maybeSingle();
      if (slide) {
        targetPath = slide.image_path;
      }
    }

    // 1. Remove Storage object FIRST using relative path
    if (targetPath && !targetPath.startsWith('data:')) {
      const relativePath = extractStoragePath(targetPath);
      if (relativePath) {
        const { error: storageError } = await supabase.storage
          .from('hero-slides')
          .remove([relativePath]);

        if (storageError) {
          console.error('Storage remove error:', storageError);
          throw new Error(`Gagal menghapus file dari Storage: ${storageError.message}`);
        }
      }
    }

    // 2. AFTER Storage delete succeeds, delete database row by slide.id
    const { error: dbError } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Database delete error:', dbError);
      throw new Error(`Gagal menghapus slide dari database: ${dbError.message}`);
    }

    return;
  }

  const items = getLocalData<HeroSlide[]>(STORAGE_KEYS.HERO_SLIDES, []);
  setLocalData(
    STORAGE_KEYS.HERO_SLIDES,
    items.filter((s) => s.id !== id)
  );
}

/* ======================================================================
   ABOUT SETTINGS
   ====================================================================== */
export async function getAboutSettings(): Promise<AboutSettings> {
  if (isSupabaseConfigured) {
    return executeSWR(
      'about_settings',
      async () => {
        const { data, error } = await supabase.from('about_settings').select('*').limit(1).single();
        if (!error && data) return data as AboutSettings;
        throw error || new Error('Failed to fetch about settings');
      },
      () => getLocalData<AboutSettings>(STORAGE_KEYS.ABOUT, DEFAULT_ABOUT_SETTINGS)
    );
  }
  return getLocalData<AboutSettings>(STORAGE_KEYS.ABOUT, DEFAULT_ABOUT_SETTINGS);
}

export async function updateAboutSettings(settings: Partial<AboutSettings>): Promise<AboutSettings> {
  invalidatePublicCache('about_settings');
  if (isSupabaseConfigured) {
    try {
      const current = await getAboutSettings();
      const { data, error } = await supabase
        .from('about_settings')
        .upsert({ ...current, ...settings, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (!error && data) return data as AboutSettings;
    } catch (e) {
      console.warn('Supabase updateAboutSettings error', e);
    }
  }
  const current = getLocalData<AboutSettings>(STORAGE_KEYS.ABOUT, DEFAULT_ABOUT_SETTINGS);
  const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.ABOUT, updated);
  return updated;
}

/* ======================================================================
   FOUNDER PROFILES
   ====================================================================== */
export async function getPublicFounders(): Promise<FounderProfile[]> {
  if (isSupabaseConfigured) {
    return executeSWR(
      'founder_profiles',
      async () => {
        const { data, error } = await supabase
          .from('founder_profiles')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (!error && data) return data as FounderProfile[];
        throw error || new Error('Failed to fetch founder profiles');
      },
      () => {
        const items = getLocalData<FounderProfile[]>(STORAGE_KEYS.FOUNDERS, []);
        return items.filter((f) => f.is_active).sort((a, b) => a.display_order - b.display_order);
      }
    );
  }
  const items = getLocalData<FounderProfile[]>(STORAGE_KEYS.FOUNDERS, []);
  return items.filter((f) => f.is_active).sort((a, b) => a.display_order - b.display_order);
}

export async function getAdminFounders(): Promise<FounderProfile[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('founder_profiles')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data) return data as FounderProfile[];
    } catch (e) {
      console.warn('Supabase getAdminFounders error', e);
    }
  }
  const items = getLocalData<FounderProfile[]>(STORAGE_KEYS.FOUNDERS, []);
  return items.sort((a, b) => a.display_order - b.display_order);
}

export async function uploadFounderPhotoFile(file: File): Promise<string> {
  if (isSupabaseConfigured) {
    const ext = file.name.split('.').pop() || 'png';
    const filePath = `founders/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('founder-photos').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw new Error(`Upload storage founder-photos error: ${error.message}`);
    const { data } = supabase.storage.from('founder-photos').getPublicUrl(filePath);
    return data.publicUrl;
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function addFounder(founder: {
  name: string;
  role: string;
  short_bio?: string | null;
  photo_path: string;
  display_order?: number;
  is_active?: boolean;
}): Promise<FounderProfile> {
  invalidatePublicCache('founder_profiles');
  if (!founder.name?.trim() || !founder.role?.trim() || !founder.photo_path) {
    throw new Error('Nama, role/jabatan, dan foto founder wajib diisi.');
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('founder_profiles')
      .insert({
        name: founder.name.trim(),
        role: founder.role.trim(),
        short_bio: founder.short_bio?.trim() || null,
        photo_path: founder.photo_path,
        display_order: founder.display_order ?? 0,
        is_active: founder.is_active ?? true,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as FounderProfile;
  }

  const items = getLocalData<FounderProfile[]>(STORAGE_KEYS.FOUNDERS, []);
  const newFounder: FounderProfile = {
    id: `founder-${Date.now()}`,
    name: founder.name.trim(),
    role: founder.role.trim(),
    short_bio: founder.short_bio?.trim() || null,
    photo_path: founder.photo_path,
    display_order: founder.display_order ?? items.length + 1,
    is_active: founder.is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  items.push(newFounder);
  setLocalData(STORAGE_KEYS.FOUNDERS, items);
  return newFounder;
}

export async function updateFounder(id: string, updates: Partial<FounderProfile>): Promise<FounderProfile> {
  invalidatePublicCache('founder_profiles');
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('founder_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as FounderProfile;
  }

  const items = getLocalData<FounderProfile[]>(STORAGE_KEYS.FOUNDERS, []);
  const idx = items.findIndex((f) => f.id === id);
  if (idx === -1) throw new Error('Founder tidak ditemukan.');
  items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.FOUNDERS, items);
  return items[idx];
}

export async function deleteFounder(id: string): Promise<void> {
  invalidatePublicCache('founder_profiles');
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('founder_profiles').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const items = getLocalData<FounderProfile[]>(STORAGE_KEYS.FOUNDERS, []);
  setLocalData(
    STORAGE_KEYS.FOUNDERS,
    items.filter((f) => f.id !== id)
  );
}

/* ======================================================================
   GALLERY (ALBUMS & IMAGES)
   ====================================================================== */
export async function getPublicGalleryAlbums(): Promise<GalleryAlbum[]> {
  if (isSupabaseConfigured) {
    return executeSWR(
      'public_gallery_albums',
      async () => {
        const { data: albums, error } = await supabase
          .from('gallery_albums')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (!error && albums) {
          // Fetch child images
          const albumIds = albums.map((a: any) => a.id);
          const { data: images } = await supabase
            .from('gallery_images')
            .select('*')
            .in('album_id', albumIds)
            .order('display_order', { ascending: true });

          const mapped = albums.map((album: any) => ({
            ...album,
            images: (images || []).filter((img: any) => img.album_id === album.id),
          }));
          return mapped as GalleryAlbum[];
        }
        throw error || new Error('Failed to fetch gallery albums');
      },
      () => {
        const albums = getLocalData<GalleryAlbum[]>(STORAGE_KEYS.GALLERY_ALBUMS, []);
        const images = getLocalData<GalleryImage[]>(STORAGE_KEYS.GALLERY_IMAGES, []);
        return albums
          .filter((a) => a.is_active)
          .sort((a, b) => a.display_order - b.display_order)
          .map((album) => ({
            ...album,
            images: images.filter((img) => img.album_id === album.id).sort((a, b) => a.display_order - b.display_order),
          }));
      }
    );
  }

  const albums = getLocalData<GalleryAlbum[]>(STORAGE_KEYS.GALLERY_ALBUMS, []);
  const images = getLocalData<GalleryImage[]>(STORAGE_KEYS.GALLERY_IMAGES, []);
  return albums
    .filter((a) => a.is_active)
    .sort((a, b) => a.display_order - b.display_order)
    .map((album) => ({
      ...album,
      images: images.filter((img) => img.album_id === album.id).sort((a, b) => a.display_order - b.display_order),
    }));
}

export async function getAdminGalleryAlbums(): Promise<GalleryAlbum[]> {
  if (isSupabaseConfigured) {
    try {
      const { data: albums, error } = await supabase
        .from('gallery_albums')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && albums) {
        const albumIds = albums.map((a: any) => a.id);
        const { data: images } = await supabase
          .from('gallery_images')
          .select('*')
          .in('album_id', albumIds)
          .order('display_order', { ascending: true });

        return albums.map((album: any) => ({
          ...album,
          images: (images || []).filter((img: any) => img.album_id === album.id),
        })) as GalleryAlbum[];
      }
    } catch (e) {
      console.warn('Supabase getAdminGalleryAlbums error', e);
    }
  }

  const albums = getLocalData<GalleryAlbum[]>(STORAGE_KEYS.GALLERY_ALBUMS, []);
  const images = getLocalData<GalleryImage[]>(STORAGE_KEYS.GALLERY_IMAGES, []);
  return albums
    .sort((a, b) => a.display_order - b.display_order)
    .map((album) => ({
      ...album,
      images: images.filter((img) => img.album_id === album.id).sort((a, b) => a.display_order - b.display_order),
    }));
}

export async function uploadGalleryFile(file: File): Promise<string> {
  if (isSupabaseConfigured) {
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `gallery/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('gallery').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw new Error(`Upload storage gallery error: ${error.message}`);
    const { data } = supabase.storage.from('gallery').getPublicUrl(filePath);
    return data.publicUrl;
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function addGalleryAlbum(album: {
  title: string;
  cover_image_path: string;
  year?: string | null;
  display_order?: number;
  is_active?: boolean;
}): Promise<GalleryAlbum> {
  invalidatePublicCache('public_gallery_albums');
  if (!album.title?.trim() || !album.cover_image_path) {
    throw new Error('Judul album dan cover foto wajib diisi.');
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('gallery_albums')
      .insert({
        title: album.title.trim(),
        cover_image_path: album.cover_image_path,
        year: album.year?.trim() || null,
        display_order: album.display_order ?? 0,
        is_active: album.is_active ?? true,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { ...data, images: [] } as GalleryAlbum;
  }

  const albums = getLocalData<GalleryAlbum[]>(STORAGE_KEYS.GALLERY_ALBUMS, []);
  const newAlbum: GalleryAlbum = {
    id: `album-${Date.now()}`,
    title: album.title.trim(),
    cover_image_path: album.cover_image_path,
    year: album.year?.trim() || null,
    display_order: album.display_order ?? albums.length + 1,
    is_active: album.is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [],
  };
  albums.push(newAlbum);
  setLocalData(STORAGE_KEYS.GALLERY_ALBUMS, albums);
  return newAlbum;
}

export async function updateGalleryAlbum(id: string, updates: Partial<GalleryAlbum>): Promise<GalleryAlbum> {
  invalidatePublicCache('public_gallery_albums');
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('gallery_albums')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as GalleryAlbum;
  }

  const albums = getLocalData<GalleryAlbum[]>(STORAGE_KEYS.GALLERY_ALBUMS, []);
  const idx = albums.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Album tidak ditemukan.');
  albums[idx] = { ...albums[idx], ...updates, updated_at: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.GALLERY_ALBUMS, albums);
  return albums[idx];
}

export async function deleteGalleryAlbum(id: string): Promise<void> {
  invalidatePublicCache('public_gallery_albums');
  if (isSupabaseConfigured) {
    // Delete child images first to prevent FK constraint issues
    await supabase.from('gallery_images').delete().eq('album_id', id);
    const { error } = await supabase.from('gallery_albums').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const albums = getLocalData<GalleryAlbum[]>(STORAGE_KEYS.GALLERY_ALBUMS, []);
  setLocalData(
    STORAGE_KEYS.GALLERY_ALBUMS,
    albums.filter((a) => a.id !== id)
  );
  // Also clean up images
  const images = getLocalData<GalleryImage[]>(STORAGE_KEYS.GALLERY_IMAGES, []);
  setLocalData(
    STORAGE_KEYS.GALLERY_IMAGES,
    images.filter((img) => img.album_id !== id)
  );
}

export async function getGalleryImages(albumId: string): Promise<GalleryImage[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('album_id', albumId)
        .order('display_order', { ascending: true });
      if (!error && data) return data as GalleryImage[];
    } catch (e) {
      console.warn('Supabase getGalleryImages error', e);
    }
  }
  const images = getLocalData<GalleryImage[]>(STORAGE_KEYS.GALLERY_IMAGES, []);
  return images.filter((img) => img.album_id === albumId).sort((a, b) => a.display_order - b.display_order);
}

export async function addGalleryImage(img: {
  album_id: string;
  image_path: string;
  caption?: string | null;
  display_order?: number;
}): Promise<GalleryImage> {
  invalidatePublicCache('public_gallery_albums');
  if (!img.album_id || !img.image_path) {
    throw new Error('Album ID dan gambar wajib diisi.');
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('gallery_images')
      .insert({
        album_id: img.album_id,
        image_path: img.image_path,
        caption: img.caption?.trim() || null,
        display_order: img.display_order ?? 0,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as GalleryImage;
  }

  const images = getLocalData<GalleryImage[]>(STORAGE_KEYS.GALLERY_IMAGES, []);
  const newImg: GalleryImage = {
    id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    album_id: img.album_id,
    image_path: img.image_path,
    caption: img.caption?.trim() || null,
    display_order: img.display_order ?? images.length + 1,
    created_at: new Date().toISOString(),
  };
  images.push(newImg);
  setLocalData(STORAGE_KEYS.GALLERY_IMAGES, images);
  return newImg;
}

export async function deleteGalleryImage(id: string): Promise<void> {
  invalidatePublicCache('public_gallery_albums');
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('gallery_images').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const images = getLocalData<GalleryImage[]>(STORAGE_KEYS.GALLERY_IMAGES, []);
  setLocalData(
    STORAGE_KEYS.GALLERY_IMAGES,
    images.filter((img) => img.id !== id)
  );
}

export async function updateGalleryImage(id: string, updates: Partial<GalleryImage>): Promise<GalleryImage> {
  invalidatePublicCache('public_gallery_albums');
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('gallery_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as GalleryImage;
  }
  const images = getLocalData<GalleryImage[]>(STORAGE_KEYS.GALLERY_IMAGES, []);
  const idx = images.findIndex((img) => img.id === id);
  if (idx === -1) throw new Error('Foto tidak ditemukan.');
  images[idx] = { ...images[idx], ...updates };
  setLocalData(STORAGE_KEYS.GALLERY_IMAGES, images);
  return images[idx];
}

/* ======================================================================
   ALIAS EXPORTS FOR CONSISTENCY
   ====================================================================== */
export const getAllOrders = getAdminOrders;
export const getAllPackages = getAdminPackages;
export const getAllUpgrades = getAdminUpgrades;
export const getAllAddons = getAdminAddons;
export const getAllVouchers = getAdminVouchers;
export const getPublicVouchers = getAdminVouchers;
export const getAllPortfolio = getAdminPortfolio;
export const createPortfolio = (data: { youtube_video_id: string; display_order?: number; is_active?: boolean }) =>
  addPortfolioItem(`https://www.youtube.com/watch?v=${data.youtube_video_id}`, data.display_order);
export const updatePortfolio = (id: string, data: Partial<PortfolioItem>) => updatePortfolioItem(id, data);
export const deletePortfolio = deletePortfolioItem;
export const getAllClientLogos = getAdminClientLogos;
export const createClientLogo = (data: { client_name: string; logo_path: string; display_order?: number; is_active?: boolean }) =>
  addClientLogo(data.client_name, data.logo_path, data.display_order);
export const getAllFaqs = getAdminFaqs;


