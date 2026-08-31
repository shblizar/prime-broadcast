import React, { useState } from 'react';
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
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, category: 'Utama' },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag, category: 'Utama' },
    { label: 'Hero Slides', path: '/admin/hero-slides', icon: Sparkles, category: 'Konten' },
    { label: 'Tentang Kami', path: '/admin/about', icon: Info, category: 'Konten' },
    { label: 'Founders', path: '/admin/founders', icon: Users, category: 'Konten' },
    { label: 'Galeri', path: '/admin/gallery', icon: Camera, category: 'Konten' },
    { label: 'Paket Siaran', path: '/admin/packages', icon: Layers, category: 'Layanan' },
    { label: 'Upgrades', path: '/admin/upgrades', icon: Sliders, category: 'Layanan' },
    { label: 'Overtime', path: '/admin/overtime', icon: Clock, category: 'Layanan' },
    { label: 'Add-ons', path: '/admin/addons', icon: PlusCircle, category: 'Layanan' },
    { label: 'Vouchers', path: '/admin/vouchers', icon: Tag, category: 'Layanan' },
    { label: 'Portofolio', path: '/admin/portfolio', icon: Video, category: 'Media' },
    { label: 'Client Logos', path: '/admin/client-logos', icon: Image, category: 'Media' },
    { label: 'FAQ', path: '/admin/faq', icon: HelpCircle, category: 'Pengaturan' },
    { label: 'Settings', path: '/admin/settings', icon: Settings, category: 'Pengaturan' },
    { label: 'Database SQL', path: '/admin/database', icon: Database, category: 'Pengaturan' },
  ];

  // Derive current page title for breadcrumb
  const currentNavItem = navItems.find((item) => item.path === location.pathname) || {
    label: 'Admin Control Center',
  };

  return (
    <div className="min-h-screen bg-[#F7F5F1] flex flex-col md:flex-row text-[#081A2E]" id="admin-panel-root">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-gradient-to-r from-[#081A2E] via-[#180C1B] to-[#2B0818] text-white p-4 flex items-center justify-between border-b border-white/10 sticky top-0 z-50">
        <PrimeBroadcastLogo variant="light" className="h-8" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Toggle Sidebar"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Floating Gradient Sidebar Wrapper */}
      <div className="hidden md:flex flex-col p-3 lg:p-4 z-40 sticky top-0 h-screen">
        <aside
          className="w-20 h-full rounded-3xl bg-gradient-to-b from-[#081A2E] via-[#1B0B1E] to-[#2C081A] text-white shadow-xl shadow-black/20 flex flex-col justify-between border border-white/10 overflow-hidden relative"
          aria-label="Admin Sidebar"
        >
          {/* Top Brand Logo - Symbol Only, No Text */}
          <div className="pt-6 pb-4 flex flex-col items-center justify-center border-b border-white/10">
            <Link
              to="/admin/dashboard"
              className="p-1 rounded-2xl hover:bg-white/10 transition-colors flex items-center justify-center group"
              title="Dashboard Utama"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:scale-105 group-hover:bg-white/15 transition-all shadow-inner">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                >
                  <path
                    d="M24 4L40 13.5V34.5L24 44L8 34.5V13.5L24 4Z"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <path d="M18 17L30 24L18 31V17Z" fill="#A40D35" />
                  <circle cx="33" cy="18" r="2.5" fill="#FFFFFF" />
                </svg>
              </div>
            </Link>
          </div>

          {/* Navigation Items (Icon-Only, Generous Spacing, Floating White Active Pill, Hover Tooltip) */}
          <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2.5 scrollbar-none flex flex-col items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={({ isActive }) =>
                    `relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 group ${
                      isActive
                        ? 'bg-white text-[#A40D35] shadow-lg shadow-black/25 scale-100 z-10'
                        : 'text-white/70 hover:text-white hover:bg-white/10 hover:scale-105'
                    }`
                  }
                  title={item.label}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isActive ? 'text-[#A40D35] scale-110' : 'text-white/80 group-hover:text-white'
                        }`}
                      />

                      {/* Floating Tooltip on Hover */}
                      {hoveredItem === item.label && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#081A2E] text-white text-xs font-semibold rounded-xl shadow-2xl border border-white/15 whitespace-nowrap z-50 pointer-events-none hidden md:flex items-center gap-1.5">
                          <span>{item.label}</span>
                          <span className="text-[10px] text-white/50 font-normal">({item.category})</span>
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Bottom Actions: View Site & Logout */}
          <div className="p-3 border-t border-white/10 flex flex-col items-center gap-2.5 bg-black/20">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredItem('Buka Website Publik')}
              onMouseLeave={() => setHoveredItem(null)}
              className="relative w-11 h-11 rounded-2xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-all group"
              title="Buka Website Publik"
            >
              <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform text-white/80 group-hover:text-white" />
              {hoveredItem === 'Buka Website Publik' && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#081A2E] text-white text-xs font-semibold rounded-xl shadow-2xl border border-white/15 whitespace-nowrap z-50 pointer-events-none hidden md:block">
                  Buka Website Publik
                </div>
              )}
            </Link>

            <button
              onClick={handleLogout}
              onMouseEnter={() => setHoveredItem('Keluar / Logout')}
              onMouseLeave={() => setHoveredItem(null)}
              className="relative w-11 h-11 rounded-2xl bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-white flex items-center justify-center transition-all group"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              {hoveredItem === 'Keluar / Logout' && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#081A2E] text-rose-300 text-xs font-semibold rounded-xl shadow-2xl border border-rose-500/30 whitespace-nowrap z-50 pointer-events-none hidden md:block">
                  Keluar / Logout
                </div>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile Drawer (When Open) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
          <div className="w-72 max-w-[80vw] h-full bg-gradient-to-b from-[#081A2E] via-[#1B0B1E] to-[#2C081A] text-white p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <PrimeBroadcastLogo variant="light" className="h-8" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl bg-white/10 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2 text-xs">
                <Database
                  className={`w-4 h-4 ${
                    isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                />
                <span className="text-white/80 font-medium">
                  {isSupabaseConfigured ? 'Supabase Live Connected' : 'Local Storage Engine'}
                </span>
              </div>

              {/* Nav Items */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-white text-[#A40D35] shadow-lg font-bold'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#A40D35]' : 'text-white/70'}`} />
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="text-xs text-white/60 truncate">
                {user?.email || 'admin@primebroadcast.net'}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  target="_blank"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Lihat Web
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-xl bg-red-500/20 text-red-200 hover:bg-red-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Utility Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-6 lg:px-10 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Breadcrumb & Section Title */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link to="/admin/dashboard" className="hover:text-[#081A2E] font-medium">
                Admin
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#081A2E] font-bold">{currentNavItem.label}</span>
            </div>

            {/* Right Status Badges & Quick Actions */}
            <div className="flex items-center gap-3">
              {/* Database status pill */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
                <Database
                  className={`w-3.5 h-3.5 ${
                    isSupabaseConfigured ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                />
                <span>{isSupabaseConfigured ? 'Supabase Live' : 'Local Storage Engine'}</span>
              </div>

              {/* View Public Website */}
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#081A2E] hover:border-slate-300 shadow-sm transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lihat Web</span>
              </Link>

              {/* User Profile Pill */}
              <div className="inline-flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700">
                <div className="w-6 h-6 rounded-full bg-[#081A2E] text-white flex items-center justify-center text-[10px] font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="font-semibold hidden md:inline max-w-[150px] truncate">
                  {user?.email || 'admin@primebroadcast.net'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
