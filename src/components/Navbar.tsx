import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PrimeBroadcastLogo } from './PrimeBroadcastLogo';
import { Menu, X, Home, Info, Image, HelpCircle, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSectionAnimation } from '../contexts/SectionAnimationContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { triggerReplay } = useSectionAnimation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isScrollingManualRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navLinks = [
    { label: 'Beranda', path: '/', hash: '' },
    { label: 'Our Equipment', path: '/our-products', hash: '' },
    { label: 'Paket', path: '/paket', hash: '' },
    { label: 'Tentang Kami', path: '/', hash: '#tentang' },
    { label: 'Galeri', path: '/', hash: '#galeri' },
    { label: 'Aturan & Kebijakan', path: '/aturan-kebijakan', hash: '' },
    { label: 'FAQ', path: '/', hash: '#faq' },
  ];

  // Handle hash scrolling on navigation/load
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.substring(1);
      const el = document.getElementById(targetId);
      if (el) {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        isScrollingManualRef.current = true;
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingManualRef.current = false;
        }, 1200);

        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
          triggerReplay(targetId);
        }, 100);
      }
    }
  }, [location]);

  const [activeHash, setActiveHash] = useState(location.hash);

  // Sync with router location hash
  useEffect(() => {
    setActiveHash(location.hash);
  }, [location.hash]);

  // Scroll Spy using IntersectionObserver to update active tab on scroll
  useEffect(() => {
    if (location.pathname !== '/') return;

    const sections = ['hero', 'portfolio', 'tentang', 'galeri', 'faq'];
    
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingManualRef.current) return;
      // Filter entries that are intersecting
      const visibleEntries = entries.filter((e) => e.isIntersecting);
      if (visibleEntries.length > 0) {
        // Sort visible sections by top coordinate to find the most prominent one
        const topSection = visibleEntries.reduce((prev, curr) => {
          return Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top) ? curr : prev;
        });
        
        const id = topSection.target.id;
        const hash = (id === 'hero' || id === 'portfolio') ? '' : `#${id}`;
        setActiveHash(hash);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-15% 0px -45% 0px',
      threshold: [0, 0.1, 0.2],
    });

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [location.pathname]);

  const handleNavClick = (e: React.MouseEvent, item: { label: string; path: string; hash: string }) => {
    setMobileMenuOpen(false);

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    isScrollingManualRef.current = true;
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingManualRef.current = false;
    }, 1200);

    if (item.label === 'Beranda' && location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
      setActiveHash('');
      triggerReplay('hero');
      return;
    }

    if (item.hash) {
      if (location.pathname === '/') {
        e.preventDefault();
        const targetId = item.hash.substring(1);
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        window.history.pushState(null, '', item.hash);
        setActiveHash(item.hash);
        triggerReplay(targetId);
      }
    }
  };

  const isActive = (item: { label: string; path: string; hash: string }) => {
    if (location.pathname === '/paket') {
      return item.path === '/paket';
    }
    if (location.pathname !== '/') {
      return false;
    }
    if (item.path !== '/') return false;

    if (item.hash) {
      return activeHash === item.hash;
    } else {
      return activeHash === '' || activeHash === '#hero' || activeHash === '#';
    }
  };

  return (
    <>
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 bg-white border-b border-slate-200/80"
      id="main-navigation-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center" id="navbar-brand-link">
            <PrimeBroadcastLogo className="h-10" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium" aria-label="Navigasi Utama">
            {navLinks.map((item) => {
              const active = isActive(item);
              const targetUrl = item.hash ? `/${item.hash}` : item.path;
              return (
                <Link
                  key={item.label}
                  to={targetUrl}
                  onClick={(e) => handleNavClick(e, item)}
                  id={`nav-link-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  className={`relative py-1 transition-colors duration-150 ${
                    active ? 'text-[#081A2E] font-bold' : 'text-slate-600 hover:text-[#081A2E]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A40D35] rounded-full"
                      transition={{ duration: 0.25 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right CTA */}
          <div className="hidden md:flex items-center">
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
              <Link
                to="/paket"
                id="navbar-cta-button"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#A40D35] hover:bg-[#820a2a] active:bg-[#700924] transition-colors focus:outline-none focus:ring-2 focus:ring-[#A40D35] focus:ring-offset-2 shadow-sm hover:shadow"
              >
                Pesan Sekarang
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <motion.button
              type="button"
              id="mobile-menu-toggle-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-md text-[#081A2E] hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#081A2E]"
              aria-expanded={mobileMenuOpen}
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-5 space-y-2 overflow-hidden"
            id="mobile-menu-drawer"
          >
            {navLinks.map((item) => {
              const active = isActive(item);
              const targetUrl = item.hash ? `/${item.hash}` : item.path;
              return (
                <Link
                  key={item.label}
                  to={targetUrl}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    active ? 'bg-slate-50 text-[#081A2E] font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-[#081A2E]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2">
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  to="/paket"
                  onClick={() => setMobileMenuOpen(false)}
                  id="mobile-navbar-cta-button"
                  className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-base font-bold text-white bg-[#A40D35] hover:bg-[#820a2a] active:bg-[#700924] transition-colors"
                >
                  Pesan Sekarang
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>

    {/* Mobile Fixed Bottom Navigation (Mobile Only, 5 Items) */}
    <nav
      aria-label="Navigasi Bawah Mobile"
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(8,26,46,0.08)] px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Beranda */}
        <Link
          to="/"
          onClick={(e) => handleNavClick(e, { label: 'Beranda', path: '/', hash: '' })}
          id="mobile-nav-beranda"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            location.pathname === '/' && (!activeHash || activeHash === '#hero' || activeHash === '#')
              ? 'text-[#A40D35] font-bold'
              : 'text-slate-500 hover:text-[#081A2E]'
          }`}
          aria-label="Beranda"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">Beranda</span>
        </Link>

        {/* 2. Tentang */}
        <Link
          to="/#tentang"
          onClick={(e) => handleNavClick(e, { label: 'Tentang Kami', path: '/', hash: '#tentang' })}
          id="mobile-nav-tentang"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            location.pathname === '/' && activeHash === '#tentang'
              ? 'text-[#A40D35] font-bold'
              : 'text-slate-500 hover:text-[#081A2E]'
          }`}
          aria-label="Tentang Kami"
        >
          <Info className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">Tentang</span>
        </Link>

        {/* 3. ORDER (Item Tengah, Ellipse/Oval, Prime Gradient, Tanpa Teks) */}
        <Link
          to="/paket"
          id="mobile-nav-order"
          className="flex flex-col items-center justify-center flex-1 py-0.5"
          aria-label="Order Paket Siaran"
        >
          <div
            className={`w-14 h-9 rounded-full flex items-center justify-center bg-gradient-to-r from-[#A40D35] via-[#850B2B] to-[#081A2E] text-white shadow-md shadow-[#A40D35]/30 border border-white/20 transition-transform active:scale-95 ${
              location.pathname === '/paket' || location.pathname === '/checkout'
                ? 'ring-2 ring-[#A40D35] ring-offset-2 scale-105'
                : 'hover:scale-105'
            }`}
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
          </div>
        </Link>

        {/* 4. Galeri */}
        <Link
          to="/#galeri"
          onClick={(e) => handleNavClick(e, { label: 'Galeri', path: '/', hash: '#galeri' })}
          id="mobile-nav-galeri"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            location.pathname === '/' && activeHash === '#galeri'
              ? 'text-[#A40D35] font-bold'
              : 'text-slate-500 hover:text-[#081A2E]'
          }`}
          aria-label="Galeri"
        >
          <Image className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">Galeri</span>
        </Link>

        {/* 5. FAQ */}
        <Link
          to="/#faq"
          onClick={(e) => handleNavClick(e, { label: 'FAQ', path: '/', hash: '#faq' })}
          id="mobile-nav-faq"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            location.pathname === '/' && activeHash === '#faq'
              ? 'text-[#A40D35] font-bold'
              : 'text-slate-500 hover:text-[#081A2E]'
          }`}
          aria-label="FAQ"
        >
          <HelpCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">FAQ</span>
        </Link>
      </div>
    </nav>
    </>
  );
};
