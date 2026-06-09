import React, { useState } from 'react';
import logoPrime from '../assets/images/logo-prime.png';
import { Video, Menu, X, CalendarRange, Flame } from 'lucide-react';

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
    { id: 'faq', label: 'Tanya Jawab (FAQ)' },
    { id: 'contact', label: 'Call Center' }
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel-heavy border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => onViewChange('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
                src={logoPrime}
                alt="Prime Broadcast"
                className="w-10 h-10 object-contain select-none transition-all duration-700 group-hover:rotate-6 group-hover:scale-105"
            />
        <div>
          <span className="font-display font-bold text-xl tracking-wider bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent group-hover:text-blue-400 transition-colors">
             PRIME BROADCAST
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-pulse"></span>
          <span className="text-[10px] font-mono tracking-widest text-[#9dcdff] font-medium uppercase">
            LIVE STREAMING SOLUTIONS
          </span>
        </div>
      </div>
    </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === item.id
                    ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => onViewChange('pricing')}
              className="ml-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <CalendarRange className="w-4 h-4" />
              <span>Pesan Sekarang</span>
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left block px-4 py-2.5 rounded-lg text-base font-medium transition-all ${
                  currentView === item.id
                    ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 px-4">
              <button
                onClick={() => {
                  onViewChange('pricing');
                  setIsOpen(false);
                }}
                className="w-full justify-center flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-base py-3 rounded-lg shadow-lg active:scale-95 transition-all"
              >
                <CalendarRange className="w-5 h-5" />
                <span>Pesan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
