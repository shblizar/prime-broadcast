import React from 'react';
import logoPrime from '../assets/images/logo-prime.png';
import { 
  Video, 
  Mail, 
  Youtube, 
  Instagram, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface FooterProps {
  onViewChange: (view: string) => void;
}

export default function Footer({ onViewChange }: FooterProps) {
  
  const socialLinks = [
    { name: 'WhatsApp', href: 'https://wa.me/6285150555195', icon: MessageSquare, value: '+62 851-5055-5195', color: 'hover:text-green-400' },
    { name: 'Instagram', href: 'https://instagram.com/primebroadcast_', icon: Instagram, value: '@primebroadcast_', color: 'hover:text-[#dbb8ff]' },
    { name: 'Tiktok', href: 'https://tiktok.com/@primebroadcast_', icon: Sparkles, value: '@primebroadcast_', color: 'hover:text-[#aec6ff]' },
    { name: 'Email Address', href: 'mailto:primebroadcast.id@gmail.com', icon: Mail, value: 'primebroadcast.id@gmail.com', color: 'hover:text-blue-400' },
  ];

  return (
    <footer className="bg-slate-950 border-t border-white/10 text-white pt-16 pb-8 text-left relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-white/5 pb-12 mb-10">
          
          {/* Brand block */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onViewChange('home')}>
              <div className="p-2 bg-slate-950/65 backdrop-blur-sm rounded-2xl border border-white/10 shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.2)] ring-1 ring-blue-500/20 group-hover:ring-purple-500/40 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                <img
                    src={logoPrime}
                    alt="Prime Broadcast"
                    className="w-8 h-8 object-contain"
                  />
              </div>
              <span className="font-display font-bold text-lg tracking-wider text-white group-hover:text-blue-400 transition-colors">
                PRIME BROADCAST
              </span>
            </div>
            
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Penyedia layanan multimedia penyiaran dan live streaming profesional premium. Menghadirkan teknologi multi-kamera andal, low-latency, dan redundansi koneksi maksimal untuk kesuksesan event hybrid Anda.
            </p>

            <div className="flex gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 live-pulse"></span>
              <span className="text-[10px] font-mono tracking-widest text-[#9dcdff] font-semibold uppercase">
                Ready For Live Bookings H-7
              </span>
            </div>
          </div>

          {/* Quick link columns */}
          <div className="md:col-span-3">
            <h4 className="font-display font-bold text-sm text-slate-100 uppercase tracking-widest mb-4">
              Navigasi Jasa
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400">
              <button onClick={() => onViewChange('home')} className="text-left hover:text-white transition-colors cursor-pointer">
                Beranda Utama
              </button>
              <button onClick={() => onViewChange('pricing')} className="text-left hover:text-white transition-colors cursor-pointer">
                Daftar Paket Siaran
              </button>
              <button onClick={() => onViewChange('policies')} className="text-left hover:text-white transition-colors cursor-pointer">
                Klausul Transport & Sound
              </button>
              <button onClick={() => onViewChange('faq')} className="text-left hover:text-white transition-colors cursor-pointer">
                FAQ Persiapan Siaran
              </button>
              <button onClick={() => onViewChange('contact')} className="text-left hover:text-white transition-colors cursor-pointer">
                Kontak & Alamat Studio
              </button>
            </div>
          </div>

          {/* Direct channels */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <h4 className="font-display font-bold text-sm text-slate-100 uppercase tracking-widest mb-2">
              Hubungi Prime Broadcast
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {socialLinks.map((social) => {
                const IconComp = social.icon;

                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04] scroll-smooth ${social.color}`}
                  >
                    <div className="p-2 bg-slate-900 border border-white/10 rounded-lg text-slate-300">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-tight">
                        {social.name}
                      </span>
                      <span className="text-xs text-slate-200 font-semibold truncate block max-w-[150px]">
                        {social.value}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer legal disclaimer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>© {new Date().getFullYear()} Prime Broadcast Indonesia. Hak Cipta Dilindungi Undang-Undang.</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-help">Syarat Ketentuan Jasa</span>
            <span className="text-slate-700 font-bold">•</span>
            <span className="hover:text-slate-400 cursor-help">Refund & Reschedule Policy</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
