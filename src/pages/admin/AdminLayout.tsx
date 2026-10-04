import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PrimeBroadcastLogo } from '../../components/PrimeBroadcastLogo';
import {
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  Info,
  Users,
  Camera,
  Layers,
  Sliders,
  Clock,
  PlusCircle,
  Tag,
  Video,
  Image,
  HelpCircle,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Database,
  ChevronRight,
  ChevronLeft,
  Filter,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, category: 'Utama' },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag, category: 'Utama' },
    { label: 'Paket Siaran', path: '/admin/packages', icon: Layers, category: 'Layanan' },
    { label: 'Upgrades', path: '/admin/upgrades', icon: Sliders, category: 'Layanan' },
    { label: 'Overtime', path: '/admin/overtime', icon: Clock, category: 'Layanan' },
    { label: 'Add-ons', path: '/admin/addons', icon: PlusCircle, category: 'Layanan' },
    { label: 'Vouchers', path: '/admin/vouchers', icon: Tag, category: 'Layanan' },
    { label: 'Portofolio', path: '/admin/portfolio', icon: Video, category: 'Media' },
    { label: 'Client Logos', path: '/admin/client-logos', icon: Image, category: 'Media' },
    { label: 'Hero Slides', path: '/admin/hero-slides', icon: Sparkles, category: 'Konten' },
    { label: 'Tentang Kami', path: '/admin/about', icon: Info, category: 'Konten' },
    { label: 'Founders', path: '/admin/founders', icon: Users, category: 'Konten' },
    { label: 'Galeri', path: '/admin/gallery', icon: Camera, category: 'Konten' },
    { label: 'FAQ', path: '/admin/faq', icon: HelpCircle, category: 'Pengaturan' },
    { label: 'Settings', path: '/admin/settings', icon: Settings, category: 'Pengaturan' },
    { label: 'Database SQL', path: '/admin/database', icon: Database, category: 'Pengaturan' },
  ];

  const categories = ['Semua', 'Utama', 'Layanan', 'Media', 'Konten', 'Pengaturan'];

  // Current nav item for breadcrumb
  const currentNavItem = navItems.find((item) => item.path === location.pathname) || {
    label: 'Admin Console',
    category: 'Sistem',
  };

  const filteredNavItems = selectedCategory === 'Semua'
    ? navItems
    : navItems.filter((item) => item.category === selectedCategory);

  // Scroll active item into view when location changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[aria-current="page"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [location.pathname]);

  const scrollNav = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F1] flex flex-col text-[#081A2E] antialiased" id="admin-panel-root">
      {/* 1. TOP PRIMARY HEADER BAR (Navy Brand Bar) */}
      <header className="bg-[#081A2E] text-white border-b border-white/10 sticky top-0 z-50">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Admin Badge */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link to="/admin/dashboard" className="flex items-center gap-3 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#A40D35] rounded-lg">
              <PrimeBroadcastLogo variant="light" className="h-7 sm:h-8" />
            </Link>

            <div className="hidden sm:block h-5 w-px bg-white/20" />

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/90 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                Admin Console
              </span>
              <span className="text-xs text-white/50 font-medium truncate hidden xl:inline">
                Sistem Manajemen Siaran
              </span>
            </div>
          </div>

          {/* Right: Status, View Website, User Profile, Logout & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Supabase Status Pill */}
            <div className="hidden md:inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-medium text-white/80">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="truncate">{isSupabaseConfigured ? 'Supabase Live' : 'Local Storage'}</span>
            </div>

            {/* View Public Website */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white/90 border border-white/10 transition-colors"
              title="Buka Website Publik (Tab Baru)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Lihat Web</span>
            </Link>

            {/* Admin User Chip */}
            <div className="hidden sm:inline-flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/90">
              <div className="w-6 h-6 rounded-md bg-[#A40D35] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="font-medium max-w-[130px] truncate text-white/90">
                {user?.email || 'admin@primebroadcast.net'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-[#A40D35] text-red-200 hover:text-white text-xs font-semibold border border-red-500/25 transition-all cursor-pointer"
              title="Keluar dari akun admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors focus:outline-none"
              aria-label="Menu Navigasi Mobile"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. HORIZONTAL NAVIGATION BAR (NO SIDEBAR - FULL WIDTH) */}
      <nav className="bg-[#0c2238] border-b border-white/10 text-white sticky top-16 z-40 shadow-sm" aria-label="Menu Utama Admin">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          {/* Left Arrow Scroll */}
          <button
            onClick={() => scrollNav('left')}
            className="hidden xl:flex p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors shrink-0"
            aria-label="Scroll Navigasi Kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Horizontally Scrollable Menu Items Track */}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-center gap-1 py-2 overflow-x-auto scrollbar-none scroll-smooth"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
                      isActive
                        ? 'bg-[#A40D35] text-white shadow-sm font-bold'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-white/70'}`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Right Arrow Scroll */}
          <button
            onClick={() => scrollNav('right')}
            className="hidden xl:flex p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors shrink-0"
            aria-label="Scroll Navigasi Kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* 3. BREADCRUMB & CONTEXT UTILITY BAR */}
      <div className="bg-white/90 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5 text-xs text-slate-500">
        <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <Link to="/admin/dashboard" className="text-slate-500 hover:text-[#081A2E] transition-colors">
              Prime Broadcast Admin
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400">{currentNavItem.category || 'Modul'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[#081A2E] font-bold">{currentNavItem.label}</span>
          </div>

          {/* Quick Category Filter for faster jump */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
            <Filter className="w-3 h-3 text-slate-400 mr-0.5" />
            <span className="text-slate-400 font-medium">Filter Kategori:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#081A2E] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. MOBILE DRAWER (Full navigation menu on small screens) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
          <div className="w-80 max-w-[85vw] h-full bg-[#081A2E] text-white p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              {/* Header inside mobile drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <PrimeBroadcastLogo variant="light" className="h-7" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 text-xs">
                <Database
                  className={`w-4 h-4 ${
                    isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                />
                <span className="text-white/80 font-medium">
                  {isSupabaseConfigured ? 'Supabase Live Connected' : 'Local Storage Engine'}
                </span>
              </div>

              {/* Nav Items Categorized */}
              <nav className="space-y-4">
                {categories.filter((c) => c !== 'Semua').map((cat) => {
                  const itemsInCat = navItems.filter((i) => i.category === cat);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-3 py-1">
                        {cat}
                      </div>
                      {itemsInCat.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                                isActive
                                  ? 'bg-[#A40D35] text-white shadow-sm font-bold'
                                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                              }`
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/70'}`} />
                                <span>{item.label}</span>
                              </>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="pt-6 border-t border-white/10 space-y-3 mt-6">
              <div className="text-xs text-white/60 truncate">
                {user?.email || 'admin@primebroadcast.net'}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  target="_blank"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/15 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Lihat Web
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-200 hover:bg-[#A40D35] hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* 5. MAIN CONTENT VIEWPORT (UNDERNEATH TOP NAVIGATION - FULL AVAILABLE WIDTH) */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <Outlet />
      </main>
    </div>
  );
};

