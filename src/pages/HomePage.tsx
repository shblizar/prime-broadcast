import React, { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { HeroSlider } from '../components/home/HeroSlider';
import { ClientMarquee } from '../components/ClientMarquee';
import { AboutSection } from '../components/home/AboutSection';
import { GalleryShowcase } from '../components/home/GalleryShowcase';
import { HomeFaqSection } from '../components/home/HomeFaqSection';
import { getYouTubeEmbedUrl } from '../utils/youtube';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';
import { motion, useAnimation } from 'motion/react';
import { useSectionAnimation } from '../contexts/SectionAnimationContext';
import { usePublicData } from '../contexts/PublicDataContext';

export const HomePage: React.FC = () => {
  const { replayCounts } = useSectionAnimation();
  const { portfolio, siteSettings } = usePublicData();
  const portfolioControls = useAnimation();

  // Handle section replay trigger for 'portfolio'
  useEffect(() => {
    if (replayCounts['portfolio']) {
      portfolioControls.set('hidden');
      const timer = setTimeout(() => {
        portfolioControls.start('visible');
      }, 50);
      return () => clearTimeout(timer);
    } else {
      portfolioControls.start('visible');
    }
  }, [replayCounts['portfolio'], portfolioControls]);

  const whatsappClean = siteSettings?.whatsapp_number
    ? normalizeWhatsAppNumber(siteSettings.whatsapp_number)
    : '6285150555195';

  const gridContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 26, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#081A2E]" id="homepage-root">
      {/* 1. Navbar */}
      <Navbar />

      {/* 2. Hero Photo Slider */}
      <HeroSlider whatsappClean={whatsappClean} />

      {/* 3. Portfolio */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-white text-[#081A2E]" id="portfolio">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto space-y-3"
          >
            <p className="text-sm font-semibold tracking-wide text-[#A40D35]">Portofolio</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#081A2E] leading-snug">
              Hasil Produksi Penyiaran Terkini
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Tonton rekaman live streaming dan multi-camera broadcast resmi yang telah kami eksekusi.
            </p>
          </motion.div>

          {/* Videos Grid */}
          {portfolio.length === 0 ? (
            <div className="text-center py-16 text-sm text-slate-400">
              Belum ada video portofolio yang dipublikasikan.
            </div>
          ) : (
            <motion.div
              variants={gridContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {portfolio.map((item) => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  whileHover={{ y: -4, scale: 1.015 }}
                  transition={{ duration: 0.2 }}
                  className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <iframe
                    src={getYouTubeEmbedUrl(item.youtube_video_id)}
                    title={`Portfolio Video Prime Broadcast ${item.youtube_video_id}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 4. Client & Partner Penyiaran */}
      <ClientMarquee />

      {/* 5. Tentang Kami (Narrative + Clean Cutout Founders) */}
      <AboutSection />

      {/* 6. Gallery Accordion / Expanding Gallery */}
      <GalleryShowcase />

      {/* 7. FAQ */}
      <HomeFaqSection />

      {/* 8. Footer */}
      <Footer />
    </div>
  );
};
