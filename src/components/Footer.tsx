import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimeBroadcastLogo } from './PrimeBroadcastLogo';
import { SiteSettings } from '../types';
import { getSiteSettings } from '../services/api';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';
import { Mail, MessageSquare, Instagram, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(console.error);
  }, []);

  const handleFooterLinkClick = (e: React.MouseEvent, path: string, hash?: string) => {
    if (window.location.pathname === '/') {
      if (path === '/' && !hash) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
      } else if (hash) {
        e.preventDefault();
        const targetId = hash.substring(1);
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', hash);
        }
      }
    }
  };

  const whatsappClean = settings?.whatsapp_number
    ? normalizeWhatsAppNumber(settings.whatsapp_number)
    : '6285150555195';

  const instagramHref = settings?.instagram_url?.startsWith('http')
    ? settings.instagram_url
    : `https://instagram.com/${settings?.instagram_url?.replace('@', '') || 'primebroadcast_'}`;

  const tiktokHref = settings?.tiktok_url?.startsWith('http')
    ? settings.tiktok_url
    : `https://tiktok.com/@${settings?.tiktok_url?.replace('@', '') || 'primebroadcast_'}`;

  return (
    <footer className="bg-[#081A2E] text-white border-t border-slate-900" id="main-footer-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 lg:col-span-2">
            <PrimeBroadcastLogo variant="light" className="h-10" />
            <p className="text-slate-400 text-sm leading-relaxed max-w-md pt-2">
              {settings?.company_description ||
                'Prime Broadcast adalah vendor penyedia jasa live streaming broadcast, multi-camera setup, dan dokumentasi video profesional yang berbasis di Jakarta.'}
            </p>
          </div>

          {/* Navigation Col */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 mb-4">
              Navigasi
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/" onClick={(e) => handleFooterLinkClick(e, '/')} className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/paket" className="hover:text-white transition-colors">
                  Paket & Layanan
                </Link>
              </li>
              <li>
                <Link to="/#tentang" onClick={(e) => handleFooterLinkClick(e, '/', '#tentang')} className="hover:text-white transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/#galeri" onClick={(e) => handleFooterLinkClick(e, '/', '#galeri')} className="hover:text-white transition-colors">
                  Galeri
                </Link>
              </li>
              <li>
                <Link to="/#faq" onClick={(e) => handleFooterLinkClick(e, '/', '#faq')} className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/aturan-kebijakan" className="hover:text-white transition-colors">
                  Aturan & Kebijakan
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-slate-500 hover:text-slate-300 transition-colors text-xs inline-flex items-center gap-1 mt-2">
                  Portal Administrator <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 mb-4">
              Hubungi Kami
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <a
                  href={`https://wa.me/${whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>{settings?.whatsapp_number || '+62 851-5055-5195'}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings?.email || 'primebroadcast.id@gmail.com'}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span>{settings?.email || 'primebroadcast.id@gmail.com'}</span>
                </a>
              </li>
              <li>
                <a
                  href={instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Instagram className="h-4 w-4 text-pink-400 flex-shrink-0" />
                  <span>{settings?.instagram_url || '@primebroadcast_'}</span>
                </a>
              </li>
              <li>
                <a
                  href={tiktokHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <span className="font-bold text-xs bg-slate-800 px-1 py-0.5 rounded text-white">TT</span>
                  <span>{settings?.tiktok_url || '@primebroadcast_'}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sleek Minimalist Bottom Bar */}
      <div className="border-t border-slate-800/80 py-6 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Prime Broadcast Jakarta. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
