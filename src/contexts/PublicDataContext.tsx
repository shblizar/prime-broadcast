import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SiteSettings,
  HeroSlide,
  PortfolioItem,
  ClientLogo,
  AboutSettings,
  FounderProfile,
  GalleryAlbum,
  FAQ,
  Package,
  Upgrade,
  Addon,
  OvertimeSettings,
} from '../types';
import {
  getSiteSettings,
  getPublicHeroSlides,
  getPublicPortfolio,
  getPublicClientLogos,
  getAboutSettings,
  getPublicFounders,
  getPublicGalleryAlbums,
  getPublicFaqs,
  getPublicPackages,
  getPublicUpgrades,
  getPublicAddons,
  getOvertimeSettings,
  getHeroSlidePublicUrl,
} from '../services/api';
import { PrimeBroadcastLogo } from '../components/PrimeBroadcastLogo';
import { Loader2 } from 'lucide-react';

interface PublicDataContextType {
  siteSettings: SiteSettings | null;
  heroSlides: HeroSlide[];
  portfolio: PortfolioItem[];
  clientLogos: ClientLogo[];
  aboutSettings: AboutSettings | null;
  founders: FounderProfile[];
  galleryAlbums: GalleryAlbum[];
  faqs: FAQ[];
  packages: Package[];
  upgrades: Upgrade[];
  addons: Addon[];
  overtimeSettings: OvertimeSettings | null;
  loading: boolean;
  error: string | null;
  refetchAll: () => Promise<void>;
}

const PublicDataContext = createContext<PublicDataContextType | undefined>(undefined);

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (!url) {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = () => {
      if ('decode' in img) {
        img.decode()
          .then(() => resolve())
          .catch(() => resolve());
      } else {
        resolve();
      }
    };
    img.onerror = () => resolve();
    img.src = url;
  });
}

async function fetchWithFallback<T>(promise: Promise<T>, fallback: T, name: string): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    console.warn(`[PublicData] Error loading ${name}, using safe default.`, err);
    return fallback;
  }
}

export const PublicDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([]);
  const [aboutSettings, setAboutSettings] = useState<AboutSettings | null>(null);
  const [founders, setFounders] = useState<FounderProfile[]>([]);
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [overtimeSettings, setOvertimeSettings] = useState<OvertimeSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    // We do not set loading to true if we already have data to prevent jarring screen flashes during background refetch
    try {
      const [
        settingsData,
        heroData,
        portfolioData,
        logosData,
        aboutData,
        foundersData,
        galleryData,
        faqsData,
        packagesData,
        upgradesData,
        addonsData,
        overtimeData,
      ] = await Promise.all([
        fetchWithFallback(getSiteSettings(), null, 'siteSettings'),
        fetchWithFallback(getPublicHeroSlides(), [], 'heroSlides'),
        fetchWithFallback(getPublicPortfolio(), [], 'portfolio'),
        fetchWithFallback(getPublicClientLogos(), [], 'clientLogos'),
        fetchWithFallback(getAboutSettings(), null, 'aboutSettings'),
        fetchWithFallback(getPublicFounders(), [], 'founders'),
        fetchWithFallback(getPublicGalleryAlbums(), [], 'galleryAlbums'),
        fetchWithFallback(getPublicFaqs(), [], 'faqs'),
        fetchWithFallback(getPublicPackages(), [], 'packages'),
        fetchWithFallback(getPublicUpgrades(), [], 'upgrades'),
        fetchWithFallback(getPublicAddons(), [], 'addons'),
        fetchWithFallback(getOvertimeSettings(), null, 'overtimeSettings'),
      ]);

      setSiteSettings(settingsData);
      setHeroSlides(heroData);
      setPortfolio(portfolioData);
      setClientLogos(logosData);
      setAboutSettings(aboutData);
      setFounders(foundersData);
      setGalleryAlbums(galleryData);
      setFaqs(faqsData);
      setPackages(packagesData);
      setUpgrades(upgradesData);
      setAddons(addonsData);
      setOvertimeSettings(overtimeData);

      // Preload critical public images before removing loader
      const urls: string[] = [];
      
      (heroData || []).forEach((slide) => {
        if (slide.image_path) {
          urls.push(getHeroSlidePublicUrl(slide.image_path));
        }
      });

      (foundersData || []).forEach((founder) => {
        if (founder.photo_path) {
          urls.push(founder.photo_path);
        }
      });

      (galleryData || []).forEach((album) => {
        if (album.cover_image_path) {
          urls.push(album.cover_image_path);
        }
        if (album.images) {
          album.images.forEach((img) => {
            if (img.image_path) {
              urls.push(img.image_path);
            }
          });
        }
      });

      (logosData || []).forEach((logo) => {
        if (logo.logo_path) {
          urls.push(logo.logo_path);
        }
      });

      const uniqueUrls = Array.from(new Set(urls)).filter(Boolean);
      
      // Load & decode all of them in parallel, with a maximum timeout of 3.5s
      const preloadPromise = Promise.all(uniqueUrls.map((u) => preloadImage(u)));
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3500));
      
      await Promise.race([preloadPromise, timeoutPromise]);

      setError(null);
    } catch (err: any) {
      console.error('[PublicData] Fatal error in bootstrapper:', err);
      setError(err.message || 'Gagal memuat data utama website.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // If loading, show the custom white background loading screen
  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-[#081A2E] select-none"
        id="initial-loading-screen"
      >
        <div className="flex flex-col items-center max-w-sm w-full space-y-8">
          {/* Prime Broadcast Logo */}
          <PrimeBroadcastLogo className="h-16 text-[#081A2E]" />

          {/* Minimal rotating loader */}
          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-[#A40D35]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <PublicDataContext.Provider
      value={{
        siteSettings,
        heroSlides,
        portfolio,
        clientLogos,
        aboutSettings,
        founders,
        galleryAlbums,
        faqs,
        packages,
        upgrades,
        addons,
        overtimeSettings,
        loading,
        error,
        refetchAll: loadAllData,
      }}
    >
      {children}
    </PublicDataContext.Provider>
  );
};

export const usePublicData = () => {
  const context = useContext(PublicDataContext);
  if (context === undefined) {
    throw new Error('usePublicData must be used within a PublicDataProvider');
  }
  return context;
};
