import React from 'react';
import { Link } from 'react-router-dom';
import { PrimeBroadcastLogo } from './PrimeBroadcastLogo';
import { usePublicData } from '../contexts/PublicDataContext';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';
import { Mail, ExternalLink } from 'lucide-react';
import instagramIcon from '../assets/images/social/Instagram.png';
import tiktokIcon from '../assets/images/social/TikTok.png';
import whatsappIcon from '../assets/images/social/WhatsApp.png';
import webIcon from '../assets/images/social/Web.png';

export const Footer: React.FC = () => {
  const { siteSettings: settings } = usePublicData();

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

  const websiteHref = settings?.website_url
    ? (settings.website_url.startsWith('http') ? settings.website_url : `https://${settings.website_url}`)
    : '/';

  return (
    <footer className="bg-[#F7F5F1] text-[#081A2E] pt-8 pb-24 md:pb-12 px-4 sm:px-6 lg:px-12" id="main-footer-section">
      <div className="max-w-7xl mx-auto">
        {/* White Card Container for All Footer Content */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-[0_10px_35px_rgba(8,26,46,0.05),0_1px_3px_rgba(8,26,46,0.03)] p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand Col */}
            <div className="space-y-4 lg:col-span-2">
              <PrimeBroadcastLogo variant="dark" className="h-10" />
              <p className="text-slate-600 text-sm leading-relaxed max-w-md pt-2">
                {settings?.company_description ||
                  'Prime Broadcast adalah vendor penyedia jasa live streaming broadcast, multi-camera setup, dan dokumentasi video profesional yang berbasis di Jakarta.'}
              </p>
            </div>

            {/* Navigation Col */}
            <div>
              <h4 className="text-sm font-bold text-[#081A2E] mb-4">
                Navigasi
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li>
                  <Link to="/" onClick={(e) => handleFooterLinkClick(e, '/')} className="hover:text-[#A40D35] transition-colors">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link to="/paket" className="hover:text-[#A40D35] transition-colors">
                    Paket & Layanan
                  </Link>
                </li>
                <li>
                  <Link to="/#tentang" onClick={(e) => handleFooterLinkClick(e, '/', '#tentang')} className="hover:text-[#A40D35] transition-colors">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link to="/#galeri" onClick={(e) => handleFooterLinkClick(e, '/', '#galeri')} className="hover:text-[#A40D35] transition-colors">
                    Galeri
                  </Link>
                </li>
                <li>
                  <Link to="/#faq" onClick={(e) => handleFooterLinkClick(e, '/', '#faq')} className="hover:text-[#A40D35] transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/aturan-kebijakan" className="hover:text-[#A40D35] transition-colors">
                    Aturan & Kebijakan
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="text-slate-400 hover:text-slate-600 transition-colors text-xs inline-flex items-center gap-1 mt-2">
                    Portal Administrator <ExternalLink className="h-3 w-3" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Col */}
            <div>
              <h4 className="text-sm font-bold text-[#081A2E] mb-4">
                Hubungi Kami
              </h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <a
                    href={`https://wa.me/${whatsappClean}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 hover:text-[#081A2E] transition-colors"
                  >
                    <img src={whatsappIcon} alt="WhatsApp" className="w-5 h-5 object-contain flex-shrink-0" />
                    <span>{settings?.whatsapp_number || '+62 851-5055-5195'}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${settings?.email || 'primebroadcast.id@gmail.com'}`}
                    className="flex items-center gap-2.5 hover:text-[#081A2E] transition-colors"
                  >
                    <Mail className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <span>{settings?.email || 'primebroadcast.id@gmail.com'}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={instagramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 hover:text-[#081A2E] transition-colors"
                  >
                    <img src={instagramIcon} alt="Instagram" className="w-5 h-5 object-contain flex-shrink-0" />
                    <span>{settings?.instagram_url || '@primebroadcast_'}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={tiktokHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 hover:text-[#081A2E] transition-colors"
                  >
                    <img src={tiktokIcon} alt="TikTok" className="w-5 h-5 object-contain flex-shrink-0" />
                    <span>{settings?.tiktok_url || '@primebroadcast_'}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={websiteHref}
                    target={websiteHref.startsWith('http') ? '_blank' : undefined}
                    rel={websiteHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2.5 hover:text-[#081A2E] transition-colors"
                  >
                    <img src={webIcon} alt="Website" className="w-5 h-5 object-contain flex-shrink-0" />
                    <span>{settings?.website_url || 'primebroadcast.id'}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media & Bottom Copyright Row inside White Card */}
          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-xs font-bold text-[#081A2E] uppercase tracking-wider">
                Social Media:
              </span>
              <div className="flex items-center gap-3">
                {/* Instagram */}
                <a
                  href={instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center p-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <img src={instagramIcon} alt="Instagram" className="w-full h-full object-contain" />
                </a>

                {/* TikTok */}
                <a
                  href={tiktokHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center p-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title="TikTok"
                  aria-label="TikTok"
                >
                  <img src={tiktokIcon} alt="TikTok" className="w-full h-full object-contain" />
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center p-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                >
                  <img src={whatsappIcon} alt="WhatsApp" className="w-full h-full object-contain" />
                </a>

                {/* Web */}
                <a
                  href={websiteHref}
                  target={websiteHref.startsWith('http') ? '_blank' : undefined}
                  rel={websiteHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center p-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title="Website"
                  aria-label="Website"
                >
                  <img src={webIcon} alt="Website" className="w-full h-full object-contain" />
                </a>
              </div>
            </div>

            <div className="text-xs text-slate-400 text-center sm:text-right">
              &copy; {new Date().getFullYear()} Prime Broadcast Jakarta. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
