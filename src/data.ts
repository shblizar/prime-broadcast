import { StreamPackage, AddOnOption, FAQItem, ClientReview } from './types';

export const PACKAGES: StreamPackage[] = [
  {
    id: 'lite',
    name: 'Lite Package',
    description: 'Pilihan ekonomis terbaik untuk webinars, rapat online standar, dan acara virtual sederhana.',
    rates: {
      4: 6600000,
      6: 7200000
    },
    camerasCount: 3,
    crewCount: 1,
    badge: 'starter choice',
    features: [
      { name: 'Kamera: Sony NX-100 (3 Unit)', included: true },
      { name: 'Video Mixer: Tidak Termasuk', included: false },
      { name: 'Capture Card: Termasuk (✓)', included: true },
      { name: 'Lighting: Tidak Termasuk', included: false },
      { name: 'Laptop Client: Acer Nitro V15', included: true },
      { name: 'Wireless Transmission: Tidak Termasuk', included: false },
      { name: 'Output: Siaran ke 1 Platform + File Rekaman Master', included: true }
    ]
  },
  {
    id: 'regular',
    name: 'Regular Package',
    description: 'Pilihan standar ideal untuk seminar hybrid korporasi, peluncuran produk kreasi, dan siaran langsung.',
    rates: {
      4: 7500000,
      6: 8100000
    },
    camerasCount: 4,
    crewCount: 2,
    highlighted: true,
    badge: 'Starter Choice',
    features: [
      { name: 'Kamera: Sony NX-100 (4 Unit)', included: true },
      { name: 'Video Mixer: Termasuk (✓)', included: true },
      { name: 'Capture Card: Termasuk (✓)', included: true },
      { name: 'Lighting: Tidak Termasuk', included: false },
      { name: 'Laptop Client: Acer Nitro V15', included: true },
      { name: 'Wireless Transmission: Tidak Termasuk', included: false },
      { name: 'Output: Siaran ke 1 Platform + File Rekaman Master', included: true }
    ]
  },
  {
    id: 'gold',
    name: 'Gold Package',
    description: 'Paket premium terpopuler untuk talkshow nasional, perakitan hybrid kompleks, dan event besar dengan glow visual khusus.',
    rates: {
      4: 8700000,
      6: 9300000
    },
    camerasCount: 5,
    crewCount: 3,
    badge: 'Best Choice',
    features: [
      { name: 'Kamera: Sony NX-100 (5 Unit)', included: true },
      { name: 'Video Mixer: Termasuk (✓)', included: true },
      { name: 'Capture Card: Termasuk (✓)', included: true },
      { name: 'Lighting: Tidak Termasuk', included: false },
      { name: 'Laptop Client: Rog Zephyrus G16', included: true },
      { name: 'Wireless Transmission: Termasuk (1 Unit)', included: true },
      { name: 'Output: Siaran ke 2 Platform + File Rekaman Master', included: true }
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum Package',
    description: 'Solusi broadcasting tertinggi dengan kemampuan setup multi-transmisi nirkabel redundan.',
    rates: {
      4: 10100000,
      6: 10700000
    },
    camerasCount: 5,
    crewCount: 4,
    badge: 'Supreme Event Solutions',
    features: [
      { name: 'Kamera: Sony NX-100 (5 Unit)', included: true },
      { name: 'Video Mixer: Termasuk (✓)', included: true },
      { name: 'Capture Card: Termasuk (✓)', included: true },
      { name: 'Lighting: 2 Unit Godox SL60W (Softbox/LED Light)', included: true },
      { name: 'Laptop Client: Rog Zephyrus G16', included: true },
      { name: 'Wireless Transmission: Termasuk (2 Unit)', included: true },
      { name: 'Output: Siaran ke 2 Platform + File Rekaman Master', included: true }
    ]
  }
];

export const ADD_ONS: AddOnOption[] = [
  {
    id: 'internet',
    name: 'Internet',
    price: 300000,
    unit: 'Unit',
    description: 'Koneksi internet dedicated stabil untuk menjamin kelancaran live streaming.',
    category: 'equipment',
    maxQty: 3
  },
  {
    id: 'proyektor',
    name: 'Proyektor',
    price: 300000,
    unit: 'Unit',
    description: 'Proyektor multimedia tambahan untuk memproyeksikan video feed di venue.',
    category: 'equipment',
    maxQty: 3
  },
  {
    id: 'kabel_hdmi',
    name: 'Kabel HDMI tambahan',
    price: 100000,
    unit: 'Unit',
    description: 'Sinyal feed tambahan menggunakan kabel HDMI berkualitas tinggi.',
    category: 'equipment',
    maxQty: 10
  },
  {
    id: 'transport_akomodasi',
    name: 'Transportasi dan Akomodasi',
    price: 0,
    unit: 'Ditanggung Klien',
    description: 'Akomodasi, kebutuhan konsumsi, dan biaya transportasi tim ditanggung oleh pihak Klien.',
    category: 'service',
    maxQty: 1
  },
  {
    id: 'desain_grafis',
    name: 'Design Grafis Custom (Logo, Lower third, Dsb)',
    price: 550000,
    unit: 'Paket',
    description: 'Desain kustom meliputi logo eksklusif, lower third, frame layout siaran, dsb.',
    category: 'upgrade',
    maxQty: 1
  },
  {
    id: 'motion_graphics',
    name: 'Motion Graphics Custom',
    price: 1200000,
    unit: 'Paket',
    description: 'Animasi kustom profesional seperti opening intro, bumper transisi, dan outro stream.',
    category: 'upgrade',
    maxQty: 1
  }
];

export const REVIEWS: ClientReview[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    role: 'Event Director',
    company: 'Pertamina Corp Hybrid Summit',
    rating: 5,
    comment: 'Sangat profesional! Prime Broadcast menangani live streaming hybrid 3-hari kami dengan lancar tanpa ada glitch. Output camera sangat tajam dan audio super bersih langsung dari mixer utama.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    name: 'Clarissa Amanda',
    role: 'Marketing Lead',
    company: 'Aura Premium Cosmetics Launch',
    rating: 5,
    comment: 'We used the Regular Package for our live launch. The integration of custom lower-thirds and real-time product overlays was exquisite. Highly recommended for any brand launch!',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    name: 'Hendrik Wijaya',
    role: 'Lead Pastor',
    company: 'Gereja Bethel Indonesia (GBI Stream)',
    rating: 5,
    comment: 'Sudah berlangganan dengan Prime Broadcast selama 6 bulan terakhir untuk ibadah mingguan dan acara besar. Respon tim cepat, datang tepat waktu h-2 jam sebelum livestream dimulai.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Bagaimana dengan transportasi dan akomodasi tim?',
    answer: 'Transportasi & Akomodasi ditanggung sepenuhnya oleh klien diluar biaya paket dasar. Biaya transport akan disesuaikan dengan jarak lokasi event dari studio kami.',
    category: 'Kebijakan'
  },
  {
    id: 'faq-2',
    question: 'Apakah paket broadcasting sudah termasuk sound system & LCD Display?',
    answer: 'Sound & Display TIDAK disediakan oleh kami. Kami hanya menyediakan audio link converter untuk dikoneksikan dengan outputs sound mixer yang disediakan pihak venue atau vendor sound system event Anda.',
    category: 'Teknis'
  },
  {
    id: 'faq-3',
    question: 'Bagaimana jika acara mengalami penambahan durasi (Overtime)?',
    answer: 'Dalam hal terjadi penambahan durasi di luar masa kontrak (misalkan 4 jam dasar), maka akan dikenakan Biaya Overtime sebesar 15% dari harga paket kontrak (per jam). Silakan hitung perkiraan overtime di estimasi kalkulator kami.',
    category: 'Kebijakan'
  },
  {
    id: 'faq-4',
    question: 'Apakah Prime Broadcast menyediakan koneksi internet untuk streaming?',
    answer: 'Secara default, tim kami membutuhkan koneksi internet (LAN/Wifi) berkecepatan minimal 20-30 Mbps upload stabil di lokasi. Kami juga menyediakan opsi tambahan berbayar "Portable Internet Bonding Failover" jika jaringan di lokasi minim atau tidak memadai.',
    category: 'Teknis'
  },
  {
    id: 'faq-5',
    question: 'Berapa hari sebelum acara pemesanan harus dilakukan?',
    answer: 'Kami merekomendasikan pemesanan dilakukan minimal H-14 hingga H-7 sebelum hari H untuk memberikan waktu tim menyiapkan setup overlays grafis kustom, rundown teknis, dan menguji kompatibilitas video link.',
    category: 'Reservasi'
  },
  {
    id: 'faq-6',
    question: 'Bagaimana format file rekaman video akhir yang kami dapatkan?',
    answer: 'Anda akan mendapatkan rekaman video final berformat MP4 (H.264) Full HD 1080p. File rekaman diproses di lokasi dan dapat ditransfer langsung via Harddisk eksternal atau diupload ke Google Drive dalam waktu 1-2 hari kerja.',
    category: 'Output'
  }
];
