import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getHeroSlidePublicUrl } from '../../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePublicData } from '../../contexts/PublicDataContext';

interface HeroSliderProps {
  whatsappClean: string;
}

export const HeroSlider: React.FC<HeroSliderProps> = () => {
  const { heroSlides: slides } = usePublicData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const totalSlides = slides.length;

  // Next slide function
  const goToNext = useCallback(() => {
    if (totalSlides <= 1) return;
    setSlideDirection('next');
    setPreviousIndex(currentIndex);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides, currentIndex]);

  // Prev slide function
  const goToPrev = useCallback(() => {
    if (totalSlides <= 1) return;
    setSlideDirection('prev');
    setPreviousIndex(currentIndex);
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides, currentIndex]);

  // Select specific slide
  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex) return;
    setSlideDirection(index > currentIndex ? 'next' : 'prev');
    setPreviousIndex(currentIndex);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Restart 5s autoplay timer
  const restartTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (totalSlides > 1) {
      timerRef.current = setInterval(() => {
        goToNext();
      }, 5000);
    }
  }, [totalSlides, goToNext]);

  // Initialize and maintain 5s autoplay
  useEffect(() => {
    restartTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restartTimer]);

  // Manual actions with timer reset
  const handleManualPrev = () => {
    goToPrev();
    restartTimer();
  };

  const handleManualNext = () => {
    goToNext();
    restartTimer();
  };

  const handleManualDot = (idx: number) => {
    goToSlide(idx);
    restartTimer();
  };

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleManualNext();
      } else {
        handleManualPrev();
      }
    }
    touchStartXRef.current = null;
  };

  const currentSlide = slides[currentIndex];
  const hasSlides = totalSlides > 0;

  const slideVariants = {
    initial: (dir: 'next' | 'prev') => ({
      opacity: 0,
      x: dir === 'next' ? 20 : -20,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: (dir: 'next' | 'prev') => ({
      opacity: 0,
      x: dir === 'next' ? -20 : 20,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-[#081A2E] text-white select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {hasSlides ? (
        <div className="relative w-full flex items-center justify-center">
          {/* Dynamic Invisible Spacer Image — sets container height to match the
              active slide's EXACT natural aspect ratio, on every breakpoint.
              This guarantees the visible image never gets cropped (no need for
              object-cover crop) and never leaves empty background bars (no need
              for object-contain letterboxing) — the box always matches the image. */}
          {currentSlide?.image_path && (
            <img
              src={getHeroSlidePublicUrl(currentSlide.image_path)}
              alt="Spacer"
              className="w-full h-auto block opacity-0 pointer-events-none"
            />
          )}

          {/* Background Images with flawless zero-flash crossfade */}
          <div className="absolute inset-0 z-0">
            {/* Underlay (Static Previous Slide) */}
            {previousIndex !== null && slides[previousIndex]?.image_path && (
              <div className="absolute inset-0">
                <img
                  src={getHeroSlidePublicUrl(slides[previousIndex].image_path)}
                  alt="Prime Broadcast Prev"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            {/* Overlay (Animated Current Slide) */}
            <AnimatePresence initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                {currentSlide?.image_path ? (
                  <img
                    src={getHeroSlidePublicUrl(currentSlide.image_path)}
                    alt="Prime Broadcast"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-full object-cover object-center"
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrow Controls (Visible & Subtle) */}
          {totalSlides > 1 && (
            <>
              <motion.button
                type="button"
                onClick={handleManualPrev}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                aria-label="Slide Sebelumnya"
                id="hero-prev-slide-btn"
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors border border-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>

              <motion.button
                type="button"
                onClick={handleManualNext}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                aria-label="Slide Selanjutnya"
                id="hero-next-slide-btn"
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors border border-white/10"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>

              {/* Dot Indicators */}
              <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleManualDot(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    id={`hero-dot-${idx}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-7 bg-[#A40D35]'
                        : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="relative w-full aspect-video flex items-center justify-center">
          {/* Fallback Clean Hero if no slides uploaded */}
          <img
            src="https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=2070&auto=format&fit=crop"
            alt="Prime Broadcast Fallback"
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}
    </section>
  );
};
