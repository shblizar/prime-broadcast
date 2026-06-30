import React, { useState } from 'react';
import ThreeCameraHero from './ThreeCameraHero';
import { ArrowRight, Play } from 'lucide-react';

import logoCentennialZ from '../assets/images/CentennialZ.png';
import logoGTV from '../assets/images/GTV.png';
import logoMNC from '../assets/images/MNC.png';
import logoMatahatiTV from '../assets/images/Matahati TV.png';
import logoMikta from '../assets/images/Mikta.png';
import logoNabawiTV from '../assets/images/Nabawi TV.png';
import logoRCTIPlus from '../assets/images/RCTI PLUS.png';
import logoTVNU from '../assets/images/TVNU.png';

interface HeroProps {
  onViewChange: (view: string) => void;
}

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  embedUrl: string;
  youtubeId: string;
  description: string;
  tag: string;
}

interface PartnerItem {
  id: string;
  name: string;
  industry: string;
  logo: string;
}

export default function Hero({ onViewChange }: HeroProps) {
  // Track which video showcases are playing inline
  const [playingVideos, setPlayingVideos] = useState<Record<string, boolean>>({});

  // 8 High-end premium YouTube portfolios
  const PORTFOLIOS: PortfolioItem[] = [
    {
      id: 'port1',
      title: 'Premium Multi-Camera Corporate Event',
      category: 'Corporate Summit',
      embedUrl: 'https://www.youtube.com/embed/h15GQFMJoGo',
      youtubeId: 'h15GQFMJoGo',
      description: 'Penyiaran langsung rapat pimpinan nasional dengan jaminan redundansi internet ganda dan visual full HD tajam.',
      tag: 'Live Broadcast'
    },
    {
      id: 'port2',
      title: 'Indonesian Esports Tournament Championship',
      category: 'Esports Event',
      embedUrl: 'https://www.youtube.com/embed/PIq8kU6GTnc',
      youtubeId: 'PIq8kU6GTnc',
      description: 'Produksi siaran esports dengan transisi cepat, dynamic lower thirds, dan real-time score overlay integration.',
      tag: 'Ultra-Low Latency'
    },
    {
      id: 'port3',
      title: 'International Cultural Dance Festival',
      category: 'Festival & Concert',
      embedUrl: 'https://www.youtube.com/embed/Kw2_yT-Q2Fc',
      youtubeId: 'Kw2_yT-Q2Fc',
      description: 'Perekaman panggung festival budaya berseri dengan dynamic live grading serta reproduksi suara panggung alami.',
      tag: 'Cine-Stream'
    },
    {
      id: 'port4',
      title: 'Digital Tech Conference & Keynote Showcase',
      category: 'Conference Live',
      embedUrl: 'https://www.youtube.com/embed/pA2S-iY5QXI',
      youtubeId: 'pA2S-iY5QXI',
      description: 'Keynote panel tingkat global dengan input presentasi terintegrasi halus serta framing hybrid narasumber jarak jauh.',
      tag: 'Hybrid Broadcast'
    },
    {
      id: 'port5',
      title: 'Symphony Concert Live Performance',
      category: 'Music Live Event',
      embedUrl: 'https://www.youtube.com/embed/i4kgj9pk49U',
      youtubeId: 'i4kgj9pk49U',
      description: 'Mixer audio panggung konser langsung disadap murni dengan penguncian noise isolasi untuk kualitas suara konser maksimal.',
      tag: 'Studio Mastering Audio'
    },
    {
      id: 'port6',
      title: 'Interactive National Talkshow Multi-View',
      category: 'Intellectual Talkshow',
      embedUrl: 'https://www.youtube.com/embed/wPomr-s8xW8',
      youtubeId: 'wPomr-s8xW8',
      description: 'Pengendalian beralih cam-to-cam otomatis pada diskusi panelis dengan fader transisi halus tanpa flicker.',
      tag: 'Smooth Mix'
    },
    {
      id: 'port7',
      title: 'Government Anniversary Celebration',
      category: 'Protocol Event',
      embedUrl: 'https://www.youtube.com/embed/78yBayHJBQQ',
      youtubeId: '78yBayHJBQQ',
      description: 'Dokumentasi penyiaran kenegaraan resmi dengan kepatuhan tinggi terhadap arahan protokoler dan ketepatan detik siaran.',
      tag: 'Zero-Fail Protocol'
    },
    {
      id: 'port8',
      title: 'High-End Exclusive Product Launching',
      category: 'Brand Activation',
      embedUrl: 'https://www.youtube.com/embed/2ayRaQP7MYo',
      youtubeId: '2ayRaQP7MYo',
      description: 'Visualisasi megah peluncuran produk premium untuk memicu impresi tinggi ribuan pemirsa daring di Indonesia.',
      tag: 'Premium Grade'
    }
  ];

  // 8 Partner logos (real client/channel logos from src/assets/images)
  const PARTNERS: PartnerItem[] = [
    { id: 'p1', name: 'Centennial Z', industry: 'Stasiun Televisi', logo: logoCentennialZ },
    { id: 'p2', name: 'GTV', industry: 'Stasiun Televisi', logo: logoGTV },
    { id: 'p3', name: 'MNC', industry: 'Stasiun Televisi', logo: logoMNC },
    { id: 'p4', name: 'Matahati TV', industry: 'Stasiun Televisi', logo: logoMatahatiTV },
    { id: 'p5', name: 'Mikta', industry: 'Media & Penyiaran', logo: logoMikta },
    { id: 'p6', name: 'Nabawi TV', industry: 'Stasiun Televisi', logo: logoNabawiTV },
    { id: 'p7', name: 'RCTI Plus', industry: 'Stasiun Televisi', logo: logoRCTIPlus },
    { id: 'p8', name: 'TVNU', industry: 'Stasiun Televisi', logo: logoTVNU },
  ];

  return (
    <div className="bg-black text-white relative select-none font-sans overflow-hidden">

      {/* SECTION 1: HERO SECTION - APPLE STYLE */}
      <section className="relative min-h-[105vh] flex flex-col justify-between pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-black">

        {/* Soft elegant top ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-gradient-to-b from-zinc-800/20 via-transparent to-transparent pointer-events-none rounded-full blur-[120px] opacity-20" />

        <div className="max-w-5xl mx-auto w-full text-center flex-grow flex flex-col justify-center items-center gap-6 relative z-10 pt-6">

          {/* Majestic Bold Central Headline */}
          <h1 className="font-sans font-light text-4xl sm:text-6xl lg:text-7xl tracking-tighter leading-[1.05] text-white max-w-4xl">
            Sinyal Tanpa Jeda.<br />
            <span className="font-semibold bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Visual Tanpa Batas.
            </span>
          </h1>

          <p className="text-zinc-400 text-xs sm:text-sm max-w-lg leading-relaxed font-sans font-light">
            Solusi penyiaran langsung kelas korporat tercanggih di Indonesia. Menghilangkan segala batasan operasional penyiaran dengan jaminan redundansi internet ganda dan perangkat tercanggih.
          </p>

          {/* New 3D Intercom/Camera Interactive Canvas */}
          <div className="w-full max-w-2xl py-2 relative">
            <ThreeCameraHero />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center w-full sm:w-auto">
            <button
              onClick={() => onViewChange('pricing')}
              className="flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 font-medium px-8 py-3.5 rounded-lg transition-all text-xs tracking-wider uppercase cursor-pointer shadow-lg shadow-white/5 hover:scale-[1.01] active:scale-95 duration-200"
            >
              <span>Konfigurasi Jasa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onViewChange('policies')}
              className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 px-8 py-3.5 rounded-lg font-medium transition-all text-xs tracking-wider uppercase cursor-pointer hover:border-zinc-700 hover:scale-[1.01] active:scale-95 duration-200"
            >
              <span>Regulasi Kerja</span>
            </button>
          </div>
        </div>

        {/* Arrow pointer down */}
        <div className="w-full flex justify-center pt-8 animate-bounce opacity-40">
          <div className="text-[10px] tracking-widest text-zinc-500 uppercase font-mono">
            Scroll Ke Bawah Untuk Portfolio
          </div>
        </div>

      </section>

      {/* SECTION 2: PREMIUM PORTFOLIO SHOWROOM (With High-Quality Thumbnails) */}
      <section className="py-24 border-t border-zinc-900 bg-zinc-950 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">

          <div className="text-center md:text-left mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-sans font-light text-white tracking-tight">
                Premium Portfolio Showroom
              </h2>
              <p className="text-zinc-400 text-xs mt-2 max-w-xl leading-relaxed font-light">
                Simak karya dokumentasi penyiaran berkualitas tinggi kami di berbagai event bergengsi secara langsung. Visual jernih, transisi halus, dan tangkapan audio sempurna.
              </p>
            </div>

            <div className="flex items-center justify-center md:justify-end gap-3 font-mono text-[9px] text-zinc-500 border border-zinc-900 px-4 py-2 rounded-lg bg-black/40">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>8 PREMIUM EVENT CASE STUDIES</span>
            </div>
          </div>

          {/* YouTube Video Grid - Medvi-Style Elegant Frames */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {PORTFOLIOS.map((port) => (
              <div
                key={port.id}
                className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-900 hover:border-zinc-700 transition-all duration-300 group shadow-2xl hover:scale-[1.01] cursor-pointer"
              >
                {playingVideos[port.id] ? (
                  <iframe
                    src={`${port.embedUrl}?autoplay=1`}
                    title={port.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-inner"
                  />
                ) : (
                  <div
                    onClick={() => setPlayingVideos(prev => ({ ...prev, [port.id]: true }))}
                    className="absolute inset-0 w-full h-full relative flex items-center justify-center overflow-hidden"
                  >
                    {/* Premium Preloaded YouTube Official Thumbnail */}
                    <img
                      src={`https://img.youtube.com/vi/${port.youtubeId}/hqdefault.jpg`}
                      alt={port.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] brightness-[0.75] group-hover:brightness-[0.9]"
                    />

                    {/* Dark elegant vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />

                    {/* Minimalist modern play indicator */}
                    <div className="relative z-10 w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:border-white text-white group-hover:text-black shadow-2xl">
                      <Play className="w-5 h-5 fill-current translate-x-0.5 transition-colors duration-300" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 3: TRUSTED PARTNERS & CLIENTS LOGO SECTION */}
      <section className="py-24 border-t border-zinc-900 bg-black px-4 sm:px-6 lg:px-8 relative overflow-hidden">

        {/* Subtle grid pattern in behind */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">

          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-sans font-light text-white tracking-tight">
              Mitra Terpercaya &amp; Klien Kami
            </h2>
            <p className="text-zinc-450 text-xs mt-2 max-w-lg mx-auto leading-relaxed font-light">
              Telah dipercaya oleh berbagai lembaga, korporasi berskala nasional, hingga instansi pendidikan tinggi untuk mengawal jalannya transmisi digital terbaik.
            </p>
          </div>

          {/* Grid of Real Partner Logos with Grayscale-to-Color Hover effect */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PARTNERS.map((partner) => (
              <div
                key={partner.id}
                className="group bg-zinc-950/40 border border-zinc-900/80 hover:border-zinc-800 hover:bg-zinc-950 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer h-36 relative overflow-hidden"
              >
                {/* Subtle hover background highlight aura */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Partner Logo - Grayscale by default, full color on hover */}
                <div className="w-14 h-14 rounded-xl bg-zinc-900/50 border border-zinc-850/60 flex items-center justify-center transition-all duration-300 mb-3 overflow-hidden">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="w-10 h-10 object-contain grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Brand Label */}
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-100 transition-colors duration-350">
                  {partner.name}
                </span>

                {/* Industry Label */}
                <span className="text-[9px] font-mono tracking-wider text-zinc-600 group-hover:text-zinc-500 transition-colors duration-300 mt-1">
                  {partner.industry}
                </span>
              </div>
            ))}
          </div>

          {/* Integration Note below the logo board */}
          <div className="mt-12 text-center">
            <p className="text-[10px] font-mono text-zinc-650 uppercase tracking-widest">
              • Seluruh logo di atas merupakan klien yang pernah bekerja sama dengan kami •
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
