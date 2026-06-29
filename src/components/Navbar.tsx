import React, { useState } from 'react';
import { Menu, X, CalendarRange } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Navbar({ currentView, onViewChange }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Beranda' },
    { id: 'pricing', label: 'Paket & Konfigurator' },
    { id: 'policies', label: 'Aturan & Kebijakan' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Hubungi Kami' }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <div 
            onClick={() => onViewChange('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-1.5 bg-zinc-900/80 rounded-xl border border-zinc-800 transition-all duration-300 flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 100 100" 
                className="w-7 h-7 select-none transition-transform duration-700 group-hover:rotate-3"
              >
                <defs>
                  {/* Premium subtle gradient based on original brand identity */}
                  <linearGradient id="pb-grad-logo" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" /> {/* Red */}
                    <stop offset="50%" stopColor="#a855f7" /> {/* Violet */}
                    <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
                  </linearGradient>
                </defs>

                {/* 1. Base Right Shape 'b' */}
                <path 
                  d="M 62,32 A 18,18 0 1,1 62,68 A 18,18 0 1,1 62,32" 
                  fill="none" 
                  stroke="url(#pb-grad-logo)" 
                  strokeWidth="11" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 44,68 L 44,28 A 10,10 0 0,1 54,18" 
                  fill="none" 
                  stroke="url(#pb-grad-logo)" 
                  strokeWidth="11" 
                  strokeLinecap="round" 
                />

                {/* 2. Base Left Shape 'p' */}
                <path 
                  d="M 24,32 L 24,72 A 10,10 0 0,1 14,82" 
                  fill="none" 
                  stroke="url(#pb-grad-logo)" 
                  strokeWidth="11" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 42,32 A 18,18 0 1,1 42,68 A 18,18 0 1,1 42,32" 
                  fill="none" 
                  stroke="url(#pb-grad-logo)" 
                  strokeWidth="11" 
                  strokeLinecap="round" 
                />

                {/* 3. Interlocking overlay cutouts */}
                <path 
                  d="M 44,38 L 44,28 A 10,10 0 0,1 54,18" 
                  fill="none" 
                  stroke="#18181b" 
                  strokeWidth="16" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 44,38 L 44,28 A 10,10 0 0,1 54,18" 
                  fill="none" 
                  stroke="url(#pb-grad-logo)" 
                  strokeWidth="11" 
                  strokeLinecap="round" 
                />

                <path 
                  d="M 42,68 A 18,18 0 0,0 58,54" 
                  fill="none" 
                  stroke="#18181b" 
                  strokeWidth="16" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 42,68 A 18,18 0 0,0 58,54" 
                  fill="none" 
                  stroke="url(#pb-grad-logo)" 
                  strokeWidth="11" 
                  strokeLinecap="round" 
                />
              </svg>
            </div>
            <div>
              <span className="font-display font-medium text-base tracking-widest text-[#f4f4f5] font-bold group-hover:text-zinc-300 transition-colors uppercase">
                PRIME BROADCAST
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-zinc-500"></span>
                <span className="text-[9px] font-sans tracking-[0.2em] text-zinc-500 font-medium uppercase font-mono">
                  Live Production
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`text-[13px] font-medium tracking-wide transition-all relative py-1.5 ${
                    currentView === item.id
                      ? 'text-zinc-100 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {item.label}
                  {currentView === item.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-zinc-100 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => onViewChange('pricing')}
              className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-white/5 font-display shadow-sm active:scale-95"
            >
              Hubungi Pemesanan
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-900 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 pt-2 pb-5 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  currentView === item.id
                    ? 'bg-zinc-900 text-zinc-100 font-semibold border-l-2 border-white'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-3 px-4">
              <button
                onClick={() => {
                  onViewChange('pricing');
                  setIsOpen(false);
                }}
                className="w-full justify-center flex items-center gap-2 bg-zinc-150 hover:bg-zinc-200 text-zinc-950 font-semibold text-sm py-3 rounded-lg shadow-lg active:scale-95 transition-all"
              >
                <CalendarRange className="w-4 h-4" />
                <span>Pesan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
