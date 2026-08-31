import React, { useEffect, useState } from 'react';
import { GalleryAlbum } from '../../types';
import { Calendar, Images, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { useSectionAnimation } from '../../contexts/SectionAnimationContext';
import { usePublicData } from '../../contexts/PublicDataContext';

export const GalleryShowcase: React.FC = () => {
  const { replayCounts } = useSectionAnimation();
  const { galleryAlbums } = usePublicData();
  const galleryControls = useAnimation();

  // Lightbox viewer state
  const [lightboxAlbum, setLightboxAlbum] = useState<GalleryAlbum | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Handle section replay trigger for 'galeri'
  useEffect(() => {
    if (replayCounts['galeri']) {
      galleryControls.set('hidden');
      const timer = setTimeout(() => {
        galleryControls.start('visible');
      }, 50);
      return () => clearTimeout(timer);
    } else {
      galleryControls.start('visible');
    }
  }, [replayCounts['galeri'], galleryControls]);

  if (galleryAlbums.length === 0) return null;

  const openAlbumModal = (album: GalleryAlbum, initialIdx = 0) => {
    setLightboxAlbum(album);
    setSelectedImageIndex(initialIdx);
  };

  const getAlbumAllPhotos = (album: GalleryAlbum): { url: string; caption?: string | null }[] => {
    if (album.images && album.images.length > 0) {
      return album.images.map((img) => ({
        url: img.image_path,
        caption: img.caption,
      }));
    }
    return [{ url: album.cover_image_path, caption: `${album.title}` }];
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: 'easeOut' } },
  };

  return (
    <section className="py-20 lg:py-28 px-6 lg:px-12 bg-[#F7F5F1] text-[#081A2E]" id="galeri">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-sm font-semibold tracking-wide text-[#A40D35]">Galeri Dokumentasi</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#081A2E] leading-snug">
            Dokumentasi Eksekusi Lapangan
          </h2>
        </div>

        {/* Desktop Expanding Cards (Hover Expands, Click Opens Album) */}
        <div className="hidden lg:flex gap-3.5 h-[460px] w-full items-stretch">
          {galleryAlbums.map((album) => {
            const photoCount = album.images && album.images.length > 0 ? album.images.length : 1;

            return (
              <div
                key={album.id}
                onClick={() => openAlbumModal(album)}
                className="relative rounded-2xl overflow-hidden cursor-pointer shadow-sm flex-1 hover:flex-[3.5] transition-[flex] duration-500 ease-in-out group flex flex-col justify-end"
                id={`gallery-item-${album.id}`}
              >
                {/* Background Image with slight scale on hover */}
                <img
                  src={album.cover_image_path}
                  alt={album.title}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />

                {/* Dark Transparent Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 group-hover:from-black/90 group-hover:via-black/40 transition-all duration-500" />

                {/* Collapsed State Title (Fades out when hovered) */}
                <div className="relative z-10 p-5 h-full flex flex-col justify-between items-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                  {album.year ? (
                    <span className="px-2 py-1 rounded bg-black/60 text-white text-[11px] font-semibold backdrop-blur-md">
                      {album.year}
                    </span>
                  ) : <span />}
                  <div className="rotate-[-90deg] whitespace-nowrap text-white font-bold text-sm tracking-wide transform origin-center max-w-[240px] truncate">
                    {album.title}
                  </div>
                  <span className="text-[11px] text-slate-300 font-medium">{photoCount} Foto</span>
                </div>

                {/* Expanded State Content (Appears immediately on Hover with subtle y shift) */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-8 text-white space-y-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
                  <div className="flex items-center gap-2">
                    {album.year && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#A40D35] text-white text-xs font-semibold">
                        <Calendar className="w-3 h-3" />
                        {album.year}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
                      <Images className="w-3 h-3" />
                      {photoCount} Foto
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold leading-snug">{album.title}</h3>

                  {album.description && (
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                      {album.description}
                    </p>
                  )}

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-300 hover:text-white transition-colors">
                      Lihat Dokumentasi Lengkap →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile / Tablet Stacked Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-6">
          {galleryAlbums.map((album) => {
            const photoCount = album.images && album.images.length > 0 ? album.images.length : 1;
            return (
              <motion.div
                key={album.id}
                onClick={() => openAlbumModal(album)}
                whileTap={{ scale: 0.98 }}
                className="group relative aspect-[16/10] rounded-2xl overflow-hidden shadow-sm cursor-pointer border border-slate-200/80 bg-slate-900"
              >
                <img
                  src={album.cover_image_path}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                <div className="absolute top-3 left-3 flex gap-2">
                  {album.year && (
                    <span className="px-2 py-0.5 rounded bg-[#A40D35] text-white text-[10px] font-semibold">
                      {album.year}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                    {photoCount} Foto
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-base font-bold line-clamp-1">{album.title}</h3>
                  <span className="text-xs text-rose-300 inline-flex items-center gap-1 mt-1 font-semibold">
                    Lihat Dokumentasi →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal with AnimatePresence */}
      <AnimatePresence>
        {lightboxAlbum && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 overflow-hidden"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold">{lightboxAlbum.title}</h3>
                <p className="text-xs text-slate-400">
                  Foto {selectedImageIndex + 1} dari {getAlbumAllPhotos(lightboxAlbum).length}
                </p>
              </div>
              <motion.button
                type="button"
                onClick={() => setLightboxAlbum(null)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Main Photo Display */}
            <div className="relative flex-1 flex items-center justify-center py-4">
              {getAlbumAllPhotos(lightboxAlbum).length > 1 && (
                <motion.button
                  type="button"
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === 0 ? getAlbumAllPhotos(lightboxAlbum).length - 1 : prev - 1
                    )
                  }
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10"
                  aria-label="Foto Sebelumnya"
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImageIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-5xl max-h-[70vh] flex flex-col items-center"
                >
                  <img
                    src={getAlbumAllPhotos(lightboxAlbum)[selectedImageIndex]?.url}
                    alt={getAlbumAllPhotos(lightboxAlbum)[selectedImageIndex]?.caption || lightboxAlbum.title}
                    className="max-h-[65vh] w-auto object-contain rounded-xl shadow-2xl"
                  />
                  {getAlbumAllPhotos(lightboxAlbum)[selectedImageIndex]?.caption && (
                    <p className="mt-3 text-xs sm:text-sm text-slate-300 text-center max-w-lg">
                      {getAlbumAllPhotos(lightboxAlbum)[selectedImageIndex]?.caption}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {getAlbumAllPhotos(lightboxAlbum).length > 1 && (
                <motion.button
                  type="button"
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === getAlbumAllPhotos(lightboxAlbum).length - 1 ? 0 : prev + 1
                    )
                  }
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10"
                  aria-label="Foto Selanjutnya"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              )}
            </div>

            {/* Thumbnails Row */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 border-t border-white/10">
              {getAlbumAllPhotos(lightboxAlbum).map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    idx === selectedImageIndex
                      ? 'border-[#A40D35] scale-105'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
