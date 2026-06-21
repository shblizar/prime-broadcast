import React, { useState } from 'react';
import { Menu, X, CalendarRange } from 'lucide-react';
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
    <nav className="sticky top-0 z-50 bg-[#f7f9fb]/90 backdrop-blur-md border-b border-gray-200/60 text-[#091426]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo Brand */}
          <div
            onClick={() => onViewChange('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2 bg-[#006c49] rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
              <img
                src={logoPrime}
                alt="Prime Broadcast Logo"
                className="w-7 h-7 select-none object-contain brightness-[10]"
              />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-[#091426] block leading-none">
                Prime<span className="text-[#006c49]">Broadcast</span>
              </span>
              <span className="text-[9px] font-sans font-semibold tracking-widest text-gray-400 uppercase block mt-0.5">
                Live Streaming Solutions
              </span>
            </div>
          </div>

          {/* Desktop Navigation — pill container style */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-full border border-gray-200/60">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#091426] font-semibold shadow-sm'
                      : 'text-gray-500 hover:text-[#091426] hover:bg-white/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onViewChange('pricing')}
              className="hidden lg:flex items-center gap-2 bg-[#091426] hover:bg-[#006c49] text-white text-xs font-semibold tracking-wider uppercase px-5 py-3 rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <CalendarRange className="w-4 h-4 text-[#6cf8bb]" />
              <span>Pesan Sekarang</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-[#091426] hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-5 flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  currentView === item.id
                    ? 'bg-[#006c49]/10 text-[#006c49] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#091426]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-3 border-t border-gray-100 mt-1">
              <button
                onClick={() => {
                  onViewChange('pricing');
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#091426] text-white font-semibold text-sm py-3.5 rounded-xl cursor-pointer"
              >
                <CalendarRange className="w-4 h-4 text-[#6cf8bb]" />
                <span>Pesan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
