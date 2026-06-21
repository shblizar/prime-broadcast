import React from 'react';
import { Mail, Instagram, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import logoPrime from '../assets/images/logo-prime.png';

interface FooterProps {
  onViewChange: (view: string) => void;
}

export default function Footer({ onViewChange }: FooterProps) {

  const socialLinks = [
    { name: 'WhatsApp', href: 'https://wa.me/6285150555195', icon: MessageSquare, value: '+62 851-5055-5195' },
    { name: 'Instagram', href: 'https://instagram.com/primebroadcast_', icon: Instagram, value: '@primebroadcast_' },
    { name: 'TikTok', href: 'https://tiktok.com/@primebroadcast_', icon: Sparkles, value: '@primebroadcast_' },
    { name: 'Email', href: 'mailto:primebroadcast.id@gmail.com', icon: Mail, value: 'primebroadcast.id@gmail.com' },
  ];

  return (
    <footer className="bg-[#091426] text-white pt-16 pb-8 text-left relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-white/10 pb-12 mb-10">

          {/* Brand block */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div
              className="flex items-center gap-3 cursor-pointer group w-fit"
              onClick={() => onViewChange('home')}
            >
              <div className="p-2 bg-[#006c49] rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <img
                  src={logoPrime}
                  alt="Prime Broadcast Logo"
                  className="w-7 h-7 select-none object-contain brightness-[10]"
                />
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-white">
                Prime<span className="text-[#6cf8bb]">Broadcast</span>
              </span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">
              Penyedia layanan multimedia penyiaran dan live streaming profesional. Multi-kamera andal, low-latency, dan redundansi koneksi maksimal untuk kesuksesan event hybrid Anda.
            </p>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6cf8bb] live-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">
                Ready For Live Bookings H-7
              </span>
            </div>
          </div>

          {/* Nav links */}
          <div className="md:col-span-3">
            <h4 className="font-sans font-bold text-xs text-gray-300 uppercase tracking-widest mb-4">
              Navigasi Jasa
            </h4>
            <div className="flex flex-col gap-2.5 text-sm text-gray-400">
              {[
                { id: 'home', label: 'Beranda Utama' },
                { id: 'pricing', label: 'Daftar Paket Siaran' },
                { id: 'policies', label: 'Klausul & Kebijakan' },
                { id: 'faq', label: 'FAQ Persiapan Siaran' },
                { id: 'contact', label: 'Kontak & Alamat Studio' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className="text-left hover:text-white transition-colors cursor-pointer w-fit"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact channels */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <h4 className="font-sans font-bold text-xs text-gray-300 uppercase tracking-widest">
              Hubungi Prime Broadcast
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socialLinks.map((social) => {
                const IconComp = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="p-2 bg-white/10 rounded-lg text-gray-300">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-tight">
                        {social.name}
                      </span>
                      <span className="text-xs text-gray-200 font-medium truncate block">
                        {social.value}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#6cf8bb]" />
            <span>© {new Date().getFullYear()} Prime Broadcast Indonesia. Hak Cipta Dilindungi.</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-gray-300 cursor-help transition-colors">Syarat Ketentuan</span>
            <span className="text-gray-700">•</span>
            <span className="hover:text-gray-300 cursor-help transition-colors">Refund & Reschedule</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
