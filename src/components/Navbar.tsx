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
            <img
              src="/assets/images/logo-prime.png"
              alt="Prime Broadcast"
              className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
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
