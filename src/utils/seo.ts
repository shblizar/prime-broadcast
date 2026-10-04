export interface PageSEO {
  title: string;
  description: string;
  canonical: string;
}

export const BASE_CANONICAL_DOMAIN = 'https://www.primebroadcast.net';

export const SEO_PAGES: Record<string, PageSEO> = {
  '/': {
    title: 'Jasa Live Streaming Jakarta | Prime Broadcast',
    description:
      'Vendor jasa live streaming dan multi-camera event Jakarta untuk acara olahraga, wisuda, talkshow, esports, dan konser dengan tim operator berpengalaman.',
    canonical: `${BASE_CANONICAL_DOMAIN}/`,
  },
  '/paket': {
    title: 'Paket Jasa Live Streaming & Multi-Camera Jakarta | Prime Broadcast',
    description:
      'Pilihan paket jasa live streaming dan siaran multi-kamera Jakarta. Rincian kamera broadcast, durasi siaran, upgrade teknis, dan dokumentasi event.',
    canonical: `${BASE_CANONICAL_DOMAIN}/paket`,
  },
  '/our-products': {
    title: 'Peralatan Broadcast & Kamera Live Streaming | Prime Broadcast Jakarta',
    description:
      'Spesifikasi kamera broadcast, switcher, audio, dan lighting Prime Broadcast Jakarta. Seluruh alat disediakan lengkap bersama tim operator produksi.',
    canonical: `${BASE_CANONICAL_DOMAIN}/our-products`,
  },
  '/aturan-kebijakan': {
    title: 'Aturan & Kebijakan Layanan Siaran | Prime Broadcast Jakarta',
    description:
      'Ketentuan layanan siaran live streaming, sistem penjadwalan, wilayah operasional Jabodetabek, overtime, dan prosedur teknis Prime Broadcast.',
    canonical: `${BASE_CANONICAL_DOMAIN}/aturan-kebijakan`,
  },
};

export const DEFAULT_SEO: PageSEO = {
  title: 'Prime Broadcast | Live Streaming & Multi-Camera Broadcast Jakarta',
  description:
    'Prime Broadcast menyediakan jasa live streaming profesional, multi-camera broadcast, dan dokumentasi video untuk berbagai kebutuhan event di Jakarta dan sekitarnya.',
  canonical: `${BASE_CANONICAL_DOMAIN}/`,
};

/**
 * Applies title, meta description, canonical, and OpenGraph/Twitter tags to the document.
 * Queries existing tags first to guarantee no duplicate tags are created.
 */
export function applyPageSEO(pathname: string) {
  // Normalize path without trailing slash (except root)
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const seo = SEO_PAGES[normalizedPath] || {
    ...DEFAULT_SEO,
    canonical: `${BASE_CANONICAL_DOMAIN}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`,
  };

  // 1. Update document title
  document.title = seo.title;

  // Helper to update or create a meta tag safely
  const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
    let el = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attributeName, attributeValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 2. Standard Meta Description
  setMetaTag('name', 'description', seo.description);

  // 3. Single Canonical Link (Strictly 1 element, prevents duplicate or conflicting tags)
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', seo.canonical);

  // 4. OpenGraph Tags
  setMetaTag('property', 'og:title', seo.title);
  setMetaTag('property', 'og:description', seo.description);
  setMetaTag('property', 'og:url', seo.canonical);
  setMetaTag('property', 'og:type', 'website');

  // 5. Twitter Card Tags
  setMetaTag('name', 'twitter:title', seo.title);
  setMetaTag('name', 'twitter:description', seo.description);
  setMetaTag('name', 'twitter:card', 'summary_large_image');
}
