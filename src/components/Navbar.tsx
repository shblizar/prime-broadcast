import React, { useState } from 'react';
import { Video, Menu, X, CalendarRange, Flame } from 'lucide-react';
import logoPrime from '../assets/images/logo-prime.png';

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
            <div className="p-2.5 bg-slate-950/60 backdrop-blur-sm rounded-2xl border border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)] ring-1 ring-blue-500/20 group-hover:ring-purple-500/40 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
              <img 
                src={logoprime} 
                alt="Prime Broadcast"
                className="w-10 h-10 object-contain"
              />
            </div>
                  {/* Premium red-purple-blue flowing gradient */}
                  <linearGradient id="pb-grad-logo" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f33" /> {/* Red */}
                    <stop offset="45%" stopColor="#c5f" /> {/* Purple */}
                    <stop offset="100%" stopColor="#38f" /> {/* Blue */}
                  </linearGradient>
                  
                  {/* Backdrop glow filter */}
                  <filter id="pb-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Ambient glow underlay */}
                <g opacity="0.32" filter="url(#pb-glow)">
                  <path 
                    d="M 42,32 A 18,18 0 1,1 42,68 A 18,18 0 1,1 42,32" 
                    fill="none" 
                    stroke="url(#pb-grad-logo)" 
                    strokeWidth="13" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M 24,32 L 24,72 A 10,10 0 0,1 14,82" 
                    fill="none" 
                    stroke="url(#pb-grad-logo)" 
                    strokeWidth="13" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M 62,32 A 18,18 0 1,1 62,68 A 18,18 0 1,1 62,32" 
                    fill="none" 
                    stroke="url(#pb-grad-logo)" 
                    strokeWidth="13" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M 44,68 L 44,28 A 10,10 0 0,1 54,18" 
                    fill="none" 
                    stroke="url(#pb-grad-logo)" 
                    strokeWidth="13" 
                    strokeLinecap="round" 
                  />
                </g>

                {/* 1. Base Right Shape 'b' */}
                <path 
                  d="M 62,32 A 18,18 0 1,1 62,68 A 18,18 0 1,1 62,32" 
                  fill="none" 
                  stroke="url(#pb-grad-logo)" 
                  strokeWidth="11.5" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 44,68 L 44,28 A 10,10 0 0,1 54,18" 
                  fill="none" 
                  stroke="url(#pb-grad-logo)" 
                  strokeWidth="11.5" 
                  strokeLinecap="round" 
                />

                {/* 2. Base Left Shape 'p' */}
                <path 
                  d="M 24,32 L 24,72 A 10,10 0 0,1 14,82" 
                  fill="none" 
                  stroke="url(#pb-grad-logo)" 
                  strokeWidth="11.5" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 42,32 A 18,18 0 1,1 42,68 A 18,18 0 1,1 42,32" 
                  fill="none" 
                  stroke="url(#pb-grad-logo)" 
                  strokeWidth="11.5" 
                  strokeLinecap="round" 
                />

                {/* 3. Interlocking Crossings: 'b' stem goes OVER 'p' loop at the top */}
                {/* Clean dark backdrop cutout to prevent overlap bleeding */}
                <path 
                  d="M 44,38 L 44,28 A 10,10 0 0,1 54,18" 
                  fill="none" 
                  stroke="#020617" 
                  strokeWidth="17" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 44,38 L 44,28 A 10,10 0 0,1 54,18" 
                  fill="none" 
                  stroke="url(#pb-grad-logo)" 
                  strokeWidth="11.5" 
                  strokeLinecap="round" 
                />

                {/* 4. Interlocking Crossings: 'p' loop goes OVER 'b' loop at the bottom-right */}
                {/* Clean dark backdrop cutout to prevent overlap bleeding */}
                <path 
                  d="M 42,68 A 18,18 0 0,0 58,54" 
                  fill="none" 
                  stroke="#020617" 
                  strokeWidth="17" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 42,68 A 18,18 0 0,0 58,54" 
                  fill="none" 
                  stroke="url(#pb-grad-logo)" 
                  strokeWidth="11.5" 
                  strokeLinecap="round" 
                />
              </svg>
            </div>
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
