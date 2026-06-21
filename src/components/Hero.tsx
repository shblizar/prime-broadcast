import React, { useState } from 'react';
import { CalendarRange, ArrowRight, ShieldCheck, Radio } from 'lucide-react';
import cameraStreamDeck from '../assets/images/camera_stream_deck.png';

interface HeroProps {
  onViewChange: (view: string) => void;
}

export default function Hero({ onViewChange }: HeroProps) {
  const [selectedQuality, setSelectedQuality] = useState<'1080p' | '720p'>('1080p');

  const qualitySpecs = {
    '720p': {
      bitrate: '2.5 - 4.5 Mbps',
      latency: '2.8 seconds',
      cameras: 'Standard HD Feed',
      internet: 'Standard Core Line',
    },
    '1080p': {
      bitrate: '5.0 - 9.0 Mbps',
      latency: '1.4 seconds (Ultra-Low)',
      cameras: 'Sony NX-100 Premium',
      internet: 'Premium Fiber Link',
    }
  };

  const currentSpec = qualitySpecs[selectedQuality];

  return (
    <div className="relative text-[#091426] overflow-hidden py-12 md:py-20 bg-[#f7f9fb]">
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] hero-glow pointer-events-none rounded-full -translate-y-1/4 translate-x-1/4" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">

          {/* Left: Tagline */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">

            <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-[#006c49]/10 border border-[#006c49]/20 text-[#006c49] text-xs font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006c49] live-pulse inline-block" />
              Multi-Camera Streaming Solutions
            </div>

            <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.10] text-[#091426]">
              Broadcast Your{' '}
              <span className="text-[#006c49]">Vision</span>{' '}
              Without Limits
            </h1>

            <p className="text-gray-500 text-base sm:text-lg max-w-xl leading-relaxed font-sans">
              Premium multi-camera live streaming untuk YouTube, Zoom, Facebook, dan platform kustom. Dikelola oleh kru profesional berpengalaman dan peralatan kelas broadcast.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => onViewChange('pricing')}
                className="flex items-center justify-center gap-2 bg-[#091426] hover:bg-[#006c49] text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm cursor-pointer"
              >
                <CalendarRange className="w-4 h-4 text-[#6cf8bb]" />
                <span>Lihat Paket & Hitung Biaya</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onViewChange('policies')}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#091426] border border-gray-200 hover:border-gray-300 px-7 py-3.5 rounded-xl font-medium transition-all duration-200 cursor-pointer"
              >
                Pelajari Kebijakan
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 pt-2">
              {[
                'Tim setup H-2 jam sebelum siaran',
                'Redundansi koneksi ganda',
                'Output Full HD 1080p'
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#006c49]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Monitor Widget */}
          <div className="lg:col-span-5 w-full flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl shadow-gray-200/60 bg-white">

              {/* Status bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 live-pulse" />
                  <span className="text-[10px] font-mono font-medium text-gray-400 tracking-wider uppercase">
                    LIVE FEED: CONTROL_DECK_MAIN
                  </span>
                </div>
                <span className="text-[9px] font-mono bg-[#006c49]/10 text-[#006c49] px-1.5 py-0.5 rounded font-semibold">
                  CAM: LIVE_MULTI
                </span>
              </div>

              {/* Camera image */}
              <div className="relative aspect-video bg-gray-900 overflow-hidden">
                <img
                  src={cameraStreamDeck}
                  alt="Prime Broadcast Studio Control Deck"
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    selectedQuality === '720p' ? 'blur-[0.6px] brightness-95' : ''
                  }`}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 flex justify-between items-end">
                  <span className="text-[10px] font-mono text-white/80 bg-black/40 px-2 py-0.5 rounded flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 text-red-400 animate-pulse" />
                    STUDIO CONSOLE 01
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-black/50 px-2 py-0.5 rounded text-[#6cf8bb]">
                    {selectedQuality === '1080p' ? '💎 FULL_HD' : '🔹 HD_720P'}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="p-4 bg-white flex flex-col gap-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Simulasi Resolusi Stream:
                </p>

                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                  {(['720p', '1080p'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setSelectedQuality(q)}
                      className={`py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                        selectedQuality === q
                          ? q === '1080p'
                            ? 'bg-[#091426] text-white shadow-sm'
                            : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
                          : 'text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      {q === '720p' ? 'HD 720p' : 'FHD 1080p'}
                    </button>
                  ))}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100 font-mono text-[11px]">
                  {[
                    { label: 'Bitrate', value: currentSpec.bitrate },
                    { label: 'Avg Latency', value: currentSpec.latency },
                    { label: 'Kamera', value: currentSpec.cameras },
                    { label: 'Backup Link', value: currentSpec.internet },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between col-span-1 border-b border-gray-200/60 pb-1 last:border-0">
                      <span className="text-gray-400">{label}:</span>
                      <span className="font-semibold text-[#091426] truncate max-w-[90px] text-right" title={value}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-sans">
              <ShieldCheck className="w-3.5 h-3.5 text-[#006c49]" />
              <span>Semua peralatan disanitasi & diuji H-1 sebelum siaran.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
