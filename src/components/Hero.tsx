import React, { useState } from 'react';
import cameraImage from '../assets/images/camera_operator_1780743339808.png';

export default function Hero() {
  return (
    <div>
      <img
        src={cameraImage}
        alt="Prime Broadcast Studio Control Deck"
      />
    </div>
  );
}

import { Sparkles, CalendarRange, ArrowRight, Video, ShieldCheck, Activity, Layers, Cpu, Radio } from 'lucide-react';

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
      statusColor: 'text-amber-400 animate-pulse'
    },
    '1080p': {
      bitrate: '5.0 - 9.0 Mbps',
      latency: '1.4 seconds (Ultra-Low)',
      cameras: 'Sony NX-100 Premium',
      internet: 'Premium Fiber Link',
      statusColor: 'text-[#38bdf8] font-bold shadow-glow'
    }
  };

  const currentSpec = qualitySpecs[selectedQuality];

  return (
    <div className="relative text-white overflow-hidden py-10 md:py-16">
      {/* Background glow graphics */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[80%] h-[350px] hero-glow pointer-events-none rounded-full blur-[80px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Tagline and core texts */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Multi-Camera Streaming Solutions</span>
            </div>
            
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.10] text-white">
              Broadcast Your <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-500 bg-clip-text text-transparent">
                Vision Without Limits
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Premium multi-camera live streaming and virtual broadcasting engineered for flawless digital distribution on YouTube, Zoom, Facebook, and custom online screens. Dikelola oleh kru profesional berpengalaman dan peralatan kelas broadcast.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => onViewChange('pricing')}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-blue-600/10 hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <CalendarRange className="w-5 h-5" />
                <span>Lihat Paket & Hitung Biaya</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onViewChange('policies')}
                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/10 px-8 py-4 rounded-xl font-semibold transition-all hover:border-white/20 active:scale-95"
              >
                <span>Pelajari Kebijakan Transparansi</span>
              </button>
            </div>
          </div>

          {/* Interactive Live Monitor with Studio Cover Asset Image */}
          <div className="lg:col-span-5 w-full flex flex-col gap-4">
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10 border border-white/10 bg-slate-950">
              
              {/* Header simulator status */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#12141c] border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 live-pulse"></span>
                  <span className="text-[11px] font-mono font-medium text-slate-400 tracking-wider">LIVE FEED: CONTROL_DECK_MAIN</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-600/20 text-[#aec6ff]">
                    CAM: LIVE_MULTI
                  </span>
                </div>
              </div>

              {/* The Live image hotlinked as requested */}
              <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
                <img 
                  src="/src/assets/images/camera_operator_1780743339808.png" 
                  alt="Prime Broadcast Studio Control Deck" 
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${
                    selectedQuality === '720p' 
                      ? 'blur-[0.6px] contrast-95 brightness-[0.98]' 
                      : 'blur-none contrast-100 brightness-100 saturate-100'
                  }`}
                />
                
                {/* Overlay simulator graphics */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex justify-between items-end">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono tracking-widest text-white font-semibold flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                      <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                      STUDIO CONSOLE 01
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 font-mono text-[10px]">
                    <span className="bg-black/60 px-2 py-0.5 rounded text-slate-300">
                      AUDIO: DIRECT IO
                    </span>
                    <span className={`bg-black/70 px-2 py-0.5 rounded inline-flex items-center gap-1 font-bold ${currentSpec.statusColor}`}>
                      {selectedQuality === '1080p' ? '💎 FULL_HD' : '🔹 HD_720P'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Screen Spec controls (The quality switcher) */}
              <div className="p-4 bg-[#12141c] flex flex-col gap-3.5">
                <div className="flex text-xs text-slate-400 font-bold uppercase tracking-wide">
                  Pilih Simulasi Resolusi Stream:
                </div>
                
                {/* Selector pill buttons */}
                <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setSelectedQuality('720p')}
                    className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                      selectedQuality === '720p'
                        ? 'bg-[#1e2333] text-amber-300 border border-amber-500/20 shadow'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    HD 720p
                  </button>
                  <button
                    onClick={() => setSelectedQuality('1080p')}
                    className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                      selectedQuality === '1080p'
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    FHD 1080p
                  </button>
                </div>

                {/* Simulated Performance Metrics list */}
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 bg-slate-950 p-3 rounded-lg border border-white/5 font-mono text-[11px] text-slate-300">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <span className="text-slate-500">Bitrate:</span>
                    <span className="font-semibold text-white">{currentSpec.bitrate}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <span className="text-slate-500">Avg Latency:</span>
                    <span className="font-semibold text-white">{currentSpec.latency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Kamera:</span>
                    <span className="font-semibold text-white">{currentSpec.cameras}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Backup Link:</span>
                    <span className="font-semibold text-white truncate max-w-[100px]" title={currentSpec.internet}>
                      {currentSpec.internet}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 text-[11px] font-mono text-slate-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Semua peralatan disanitasi & diuji H-1 sebelum siaran.</span>
            </div>
          </div>

        </div>



      </div>
    </div>
  );
}
