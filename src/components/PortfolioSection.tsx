import React, { useEffect, useState, useCallback } from 'react';
import { Play, X, ExternalLink } from 'lucide-react';

interface VideoMeta {
  id: string;
  tag: string;
  badge: string;
  title: string;
}

const PORTFOLIO_VIDEOS: VideoMeta[] = [
  { id: 'h15GQFMJoGo', tag: 'Live Event',     badge: 'Highlight', title: '' },
  { id: 'Kw2_yT-Q2Fc', tag: 'Corporate',      badge: 'Live',      title: '' },
  { id: 'PIq8kU6GTnc', tag: 'Sport',          badge: 'Featured',  title: '' },
  { id: 'pA2S-iY5QXI', tag: 'Entertainment',  badge: 'Live',      title: '' },
  { id: 'i4kgj9pk49U', tag: 'Seminar',        badge: 'Highlight', title: '' },
  { id: 'wPomr-s8xW8', tag: 'Live Streaming', badge: 'Premium',   title: '' },
  { id: '78yBayHJBQQ', tag: 'Live Event',     badge: 'Terbaru',   title: '' },
];

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

// Check if a video allows embedding via oEmbed — if oEmbed returns html with embed, it's embeddable
async function checkEmbeddable(id: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
    );
    if (!res.ok) return false;
    const data = await res.json();
    // If html field contains iframe with embed URL, it's embeddable
    return typeof data.html === 'string' && data.html.includes('embed');
  } catch {
    return false;
  }
}

// ─── Video card ───────────────────────────────────────────────────────────────

interface VideoCardProps {
  video: VideoMeta;
  isHero?: boolean;
  onPlay: (id: string, title: string) => void;
}

function VideoCard({ video, isHero = false, onPlay }: VideoCardProps) {
  return (
    <button
      onClick={() => onPlay(video.id, video.title)}
      className="group relative w-full h-full overflow-hidden rounded-2xl bg-slate-900 block text-left cursor-pointer border-0 p-0"
      aria-label={`Putar video: ${video.title || 'Live streaming event'}`}
    >
      <img
        src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
        alt={video.title || 'Prime Broadcast – live streaming event'}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

      {/* Hover play overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </div>
      </div>

      <span className="absolute top-2.5 left-2.5 text-[10px] font-mono font-semibold tracking-wider uppercase text-white/90 bg-white/10 border border-white/20 px-2 py-0.5 rounded">
        {video.tag}
      </span>
      <span className="absolute top-2.5 right-2.5 text-[10px] font-mono font-semibold text-white bg-red-800/80 px-2 py-0.5 rounded">
        {video.badge}
      </span>

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

interface VideoModalProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

function VideoModal({ videoId, title, onClose }: VideoModalProps) {
  const [embeddable, setEmbeddable] = useState<'checking' | 'yes' | 'no'>('checking');
  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;

  useEffect(() => {
    checkEmbeddable(videoId).then(ok => setEmbeddable(ok ? 'yes' : 'no'));
  }, [videoId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-slate-900 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <p className="text-sm font-semibold text-slate-100 truncate pr-4">{title || 'Live Streaming Event'}</p>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={ytUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              Buka di YouTube
            </a>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Tutup"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Video area */}
        <div style={{ aspectRatio: '16/9' }} className="relative bg-black">

          {/* Still checking */}
          {embeddable === 'checking' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Embeddable — show iframe */}
          {embeddable === 'yes' && (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          )}

          {/* Not embeddable — show fallback */}
          {embeddable === 'no' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="thumbnail"
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <p className="text-slate-300 text-sm">
                  Pemilik video menonaktifkan pemutaran di luar YouTube.
                </p>
                <a
                  href={ytUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  <Play className="w-4 h-4 fill-white" />
                  Tonton di YouTube
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function PortfolioSection() {
  const [videos, setVideos] = useState<VideoMeta[]>(PORTFOLIO_VIDEOS);
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string } | null>(null);

  const handlePlay = useCallback((id: string, title: string) => setActiveVideo({ id, title }), []);
  const handleClose = useCallback(() => setActiveVideo(null), []);

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
      {activeVideo && (
        <VideoModal videoId={activeVideo.id} title={activeVideo.title} onClose={handleClose} />
      )}

      <section className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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

          {/* Top row */}
          <div className="grid grid-cols-3 gap-3 h-[360px]">
            <div className="col-span-1 grid grid-rows-2 gap-3 h-[360px]">
              <div className="h-full"><VideoCard video={card0} onPlay={handlePlay} /></div>
              <div className="h-full"><VideoCard video={card1} onPlay={handlePlay} /></div>
            </div>
            <div className="col-span-2 h-[360px]">
              <VideoCard video={hero} isHero onPlay={handlePlay} />
            </div>
          </div>

          {/* Bottom row */}
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
