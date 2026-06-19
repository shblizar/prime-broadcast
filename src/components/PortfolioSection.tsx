import React, { useEffect, useState, useCallback } from 'react';
import { Play, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoMeta {
  id: string;
  tag: string;
  badge: string;
  title: string;
}

// ─── Data — ganti tag/badge sesuai nama event aslinya ────────────────────────

const PORTFOLIO_VIDEOS: VideoMeta[] = [
  { id: 'h15GQFMJoGo', tag: 'Live Event',     badge: 'Highlight', title: '' },
  { id: 'Kw2_yT-Q2Fc', tag: 'Corporate',      badge: 'Live',      title: '' },
  { id: 'PIq8kU6GTnc', tag: 'Sport',          badge: 'Featured',  title: '' },
  { id: 'pA2S-iY5QXI', tag: 'Entertainment',  badge: 'Live',      title: '' },
  { id: 'i4kgj9pk49U', tag: 'Seminar',        badge: 'Highlight', title: '' },
  { id: 'wPomr-s8xW8', tag: 'Live Streaming', badge: 'Premium',   title: '' },
  { id: '78yBayHJBQQ', tag: 'Live Event',     badge: 'Terbaru',   title: '' },
];

// ─── YouTube oEmbed title fetcher ─────────────────────────────────────────────

async function fetchYouTubeTitle(id: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
    );
    if (!res.ok) return 'Live Streaming Event';
    const data = await res.json();
    return data.title ?? 'Live Streaming Event';
  } catch {
    return 'Live Streaming Event';
  }
}

// ─── Video card ───────────────────────────────────────────────────────────────

interface VideoCardProps {
  video: VideoMeta;
  isHero?: boolean;
  onPlay: (id: string) => void;
}

function VideoCard({ video, isHero = false, onPlay }: VideoCardProps) {
  return (
    <button
      onClick={() => onPlay(video.id)}
      className="group relative w-full h-full overflow-hidden rounded-2xl bg-slate-900 block text-left cursor-pointer border-0 p-0"
      aria-label={`Putar video: ${video.title || 'Live streaming event'}`}
    >
      {/* Thumbnail */}
      <img
        src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
        alt={video.title || 'Prime Broadcast – live streaming event'}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Dark scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

      {/* Hover play overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </div>
      </div>

      {/* Category tag — top left */}
      <span className="absolute top-2.5 left-2.5 text-[10px] font-mono font-semibold tracking-wider uppercase text-white/90 bg-white/10 border border-white/20 px-2 py-0.5 rounded">
        {video.tag}
      </span>

      {/* Status badge — top right */}
      <span className="absolute top-2.5 right-2.5 text-[10px] font-mono font-semibold text-white bg-red-800/80 px-2 py-0.5 rounded">
        {video.badge}
      </span>

      {/* Title — bottom left, play icon bottom right */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 flex items-end justify-between gap-2 pointer-events-none">
        <p className={`text-white font-semibold leading-snug line-clamp-2 flex-1 ${
          isHero ? 'text-sm sm:text-base' : 'text-[10px] sm:text-[11px]'
        }`}>
          {video.title || <span className="opacity-40 italic">Memuat...</span>}
        </p>
        <div className="shrink-0 w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
          <Play className="w-2.5 h-2.5 text-white fill-white ml-px" />
        </div>
      </div>
    </button>
  );
}

// ─── Lightbox modal ───────────────────────────────────────────────────────────

function VideoModal({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ aspectRatio: '16/9' }}
        onClick={e => e.stopPropagation()}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="Prime Broadcast video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 flex items-center justify-center text-white transition-colors"
          aria-label="Tutup video"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function PortfolioSection() {
  const [videos, setVideos] = useState<VideoMeta[]>(PORTFOLIO_VIDEOS);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handlePlay = useCallback((id: string) => setActiveId(id), []);
  const handleClose = useCallback(() => setActiveId(null), []);

  // Fetch real titles from YouTube oEmbed
  useEffect(() => {
    PORTFOLIO_VIDEOS.forEach(async (v, i) => {
      const title = await fetchYouTubeTitle(v.id);
      setVideos(prev => {
        const next = [...prev];
        next[i] = { ...next[i], title };
        return next;
      });
    });
  }, []);

  const [card0, card1, hero, ...bottomCards] = videos;

  return (
    <>
      {/* Lightbox */}
      {activeId && <VideoModal videoId={activeId} onClose={handleClose} />}

      <section className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 px-3 py-1.5 rounded-full inline-block">
              Portofolio Siaran
            </span>
            <h2 className="text-3xl font-display font-extrabold tracking-tight mt-4">
              Acara yang Sudah Kami Tangani
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-3">
              Dari event korporat, seminar, hingga pertandingan olahraga — kami hadir dan memastikan siaran berjalan mulus.
            </p>
          </div>

          {/* Top row: 2 stacked left + 1 hero right */}
          <div className="grid grid-cols-3 gap-3 h-[360px]">

            {/* Left: 2 stacked cards */}
            <div className="col-span-1 grid grid-rows-2 gap-3 h-[360px]">
              <div className="h-full">
                <VideoCard video={card0} onPlay={handlePlay} />
              </div>
              <div className="h-full">
                <VideoCard video={card1} onPlay={handlePlay} />
              </div>
            </div>

            {/* Right: hero card */}
            <div className="col-span-2 h-[360px]">
              <VideoCard video={hero} isHero onPlay={handlePlay} />
            </div>

          </div>

          {/* Bottom row: 4 equal cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {bottomCards.map(v => (
              <div key={v.id} className="h-[155px]">
                <VideoCard video={v} onPlay={handlePlay} />
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
