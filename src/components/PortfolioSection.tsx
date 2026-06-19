import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoMeta {
  id: string;
  tag: string;
  badge: string;
  title: string;
}

// ─── Video data — ganti tag/badge sesuai nama event aslinya ──────────────────

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

// ─── Single card component ────────────────────────────────────────────────────

function VideoCard({ video, isHero = false }: { video: VideoMeta; isHero?: boolean }) {
  const thumbUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
  const ytUrl    = `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <a
      href={ytUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative w-full h-full overflow-hidden rounded-2xl bg-slate-900 block"
    >
      {/* Thumbnail */}
      <img
        src={thumbUrl}
        alt={video.title || 'Prime Broadcast – live streaming event'}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Dark scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

      {/* Category tag — top left */}
      <span className="absolute top-2.5 left-2.5 text-[10px] font-mono font-semibold tracking-wider uppercase text-white/90 bg-white/10 border border-white/20 px-2 py-0.5 rounded">
        {video.tag}
      </span>

      {/* Status badge — top right */}
      <span className="absolute top-2.5 right-2.5 text-[10px] font-mono font-semibold text-white bg-red-800/80 px-2 py-0.5 rounded">
        {video.badge}
      </span>

      {/* Title + play button — bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 flex items-end justify-between gap-2">
        <p
          className={`text-white font-semibold leading-snug line-clamp-2 flex-1 ${
            isHero ? 'text-sm sm:text-base' : 'text-[10px] sm:text-[11px]'
          }`}
        >
          {video.title
            ? video.title
            : <span className="opacity-40 italic text-[10px]">Memuat...</span>
          }
        </p>
        <div className="shrink-0 w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
          <Play className="w-3 h-3 text-white fill-white ml-0.5" />
        </div>
      </div>
    </a>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function PortfolioSection() {
  const [videos, setVideos] = useState<VideoMeta[]>(PORTFOLIO_VIDEOS);

  // Fetch real titles from YouTube oEmbed, update one by one as they resolve
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

  // Destructure layout slots
  const [card0, card1, hero, ...bottomCards] = videos;

  return (
    <section className="py-16 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
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

        {/* ── Top row: 2 stacked small cards + 1 large hero card ── */}
        <div className="grid grid-cols-3 gap-3" style={{ height: '360px' }}>

          {/* Left column: 2 stacked cards */}
          <div className="col-span-1 grid grid-rows-2 gap-3">
            <VideoCard video={card0} />
            <VideoCard video={card1} />
          </div>

          {/* Right column: hero card */}
          <div className="col-span-2">
            <VideoCard video={hero} isHero />
          </div>

        </div>

        {/* ── Bottom row: 4 cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3" style={{ height: '155px' }}>
          {bottomCards.map(v => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>

      </div>
    </section>
  );
}
