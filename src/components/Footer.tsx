import React from 'react';
import { 
  Mail, 
  Instagram, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles,
} from 'lucide-react';
import logoPrime from '../assets/images/logo-prime.png';

interface FooterProps {
  onViewChange: (view: string) => void;
  onNavigateAnchor?: (view: string, anchor?: string) => void;
}

export default function Footer({ onViewChange, onNavigateAnchor }: FooterProps) {
  
  const socialLinks = [
    { name: 'WhatsApp', href: 'https://wa.me/6285150555195', icon: MessageSquare, value: '+62 851-5055-5195', color: 'hover:text-zinc-300' },
    { name: 'Instagram', href: 'https://instagram.com/primebroadcast_', icon: Instagram, value: '@primebroadcast_', color: 'hover:text-zinc-300' },
    { name: 'Tiktok', href: 'https://tiktok.com/@primebroadcast_', icon: Sparkles, value: '@primebroadcast_', color: 'hover:text-zinc-300' },
    { name: 'Email Address', href: 'mailto:primebroadcast.id@gmail.com', icon: Mail, value: 'primebroadcast.id@gmail.com', color: 'hover:text-zinc-300' },
  ];

  // Navigate to the Policies view, then scroll to a specific anchor inside it
  // (e.g. the refund clause). Falls back to a plain view switch if the
  // anchor-aware handler wasn't passed down from App.
  const goToPolicyAnchor = (anchor?: string) => {
    if (onNavigateAnchor) {
      onNavigateAnchor('policies', anchor);
    } else {
      onViewChange('policies');
    }
  };

  return (
    <footer className="bg-black border-t border-zinc-900 text-white pt-24 pb-12 text-left relative z-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-zinc-900 pb-16 mb-12">
          
          {/* Brand block */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <div
              className="cursor-pointer group w-fit"
              onClick={() => onViewChange('home')}
            >
              <img
                src={logoPrime}
                alt="Prime Broadcast"
                className="h-9 w-auto object-contain transition-opacity duration-300 group-hover:opacity-70 select-none"
                draggable={false}
              />
            </div>
            
            <p className="text-zinc-550 text-xs leading-relaxed max-w-sm">
              Penyedia layanan multimedia penyiaran dan live streaming profesional premium. Menghadirkan teknologi multi-kamera andal, low-latency, dan redundansi koneksi maksimal untuk kesuksesan event hybrid Anda.
            </p>
 
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse"></span>
              <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
                Ready For Live Bookings H-7
              </span>
            </div>
          </div>

          {/* Quick link columns */}
          <div className="md:col-span-3">
            <h4 className="font-display font-medium text-[10px] text-zinc-405 uppercase tracking-widest mb-6">
              Navigasi Jasa
            </h4>
            <div className="flex flex-col gap-3 text-xs text-zinc-500">
              <button onClick={() => onViewChange('home')} className="text-left hover:text-zinc-300 transition-colors cursor-pointer">
                Beranda Utama
              </button>
              <button onClick={() => onViewChange('pricing')} className="text-left hover:text-zinc-300 transition-colors cursor-pointer">
                Daftar Paket Siaran
              </button>
              <button onClick={() => onViewChange('policies')} className="text-left hover:text-zinc-300 transition-colors cursor-pointer">
                Klausul Transport &amp; Sound
              </button>
              <button onClick={() => onViewChange('faq')} className="text-left hover:text-zinc-300 transition-colors cursor-pointer">
                FAQ Persiapan Siaran
              </button>
              <button onClick={() => onViewChange('contact')} className="text-left hover:text-zinc-300 transition-colors cursor-pointer">
                Kontak &amp; Alamat Studio
              </button>
            </div>
          </div>

          {/* Direct channels */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <h4 className="font-display font-medium text-[10px] text-zinc-405 uppercase tracking-widest mb-6">
              Hubungi Kami
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
                    className={`flex items-center gap-3 p-3 rounded-lg bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 transition-all ${social.color}`}
                  >
                    <div className="text-zinc-500">
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-600 block uppercase font-mono tracking-wider mb-0.5">
                        {social.name}
                      </span>
                      <span className="text-xs text-zinc-400 truncate block max-w-[120px] font-mono">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 pt-2">
          <div className="flex items-center gap-2 font-normal">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-550" />
            <span>© {new Date().getFullYear()} Prime Broadcast Indonesia. Hak Cipta Dilindungi Undang-Undang.</span>
          </div>
          <div className="flex gap-4 text-[11px] text-zinc-600 font-mono">
            <button
              onClick={() => goToPolicyAnchor()}
              className="hover:text-zinc-400 cursor-pointer transition-colors bg-transparent border-none p-0"
            >
              Syarat Ketentuan Jasa
            </button>
            <span>/</span>
            <button
              onClick={() => goToPolicyAnchor('refund')}
              className="hover:text-slate-400 cursor-pointer transition-colors bg-transparent border-none p-0"
            >
              Refund &amp; Reschedule Policy
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
