import React, { useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { useSectionAnimation } from '../../contexts/SectionAnimationContext';
import { usePublicData } from '../../contexts/PublicDataContext';

export const AboutSection: React.FC = () => {
  const { replayCounts } = useSectionAnimation();
  const { aboutSettings, founders } = usePublicData();
  const sectionControls = useAnimation();

  // Handle section replay trigger for 'tentang'
  useEffect(() => {
    if (replayCounts['tentang']) {
      sectionControls.set('hidden');
      const timer = setTimeout(() => {
        sectionControls.start('visible');
      }, 50);
      return () => clearTimeout(timer);
    } else {
      sectionControls.start('visible');
    }
  }, [replayCounts['tentang'], sectionControls]);

  const defaultDescription =
    'Prime Broadcast adalah vendor penyedia jasa live streaming broadcast, multi-camera setup, dan dokumentasi video profesional yang berbasis di Jakarta. Prime Broadcast mengombinasikan perangkat kelas penyiaran dengan tim eksekusi berpengalaman untuk menyajikan siaran langsung yang stabil, dinamis, dan berstandar visual tinggi.';

  const leftVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const rightVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <section className="py-20 lg:py-28 px-6 lg:px-12 bg-white text-[#081A2E]" id="tentang">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <p className="text-sm font-semibold tracking-wide text-[#A40D35]">
            {aboutSettings?.eyebrow || 'Tentang Kami'}
          </p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#081A2E] leading-tight">
            {aboutSettings?.title || 'Prime Broadcast'}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-2">
            {aboutSettings?.description || defaultDescription}
          </p>
        </motion.div>

        {/* Founder Profile Area - Premium Editorial Showcase with Alternating Side-by-Side Profile Presentation */}
        {founders.length > 0 && (
          <div className="space-y-16 sm:space-y-24 lg:space-y-40 pt-4 sm:pt-8">
            {founders.map((founder, idx) => {
              const isEven = idx % 2 === 0;

              // Dynamic color split: color the first word in #A40D35, and the rest in #081A2E
              const nameWords = founder.name.trim().split(/\s+/);
              const firstWord = nameWords[0] || '';
              const remainingName = nameWords.slice(1).join(' ');

              return (
                <div
                  key={founder.id}
                  className={`flex items-center justify-between gap-4 sm:gap-10 lg:gap-20 max-w-5xl mx-auto ${
                    isEven ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Portrait Column - Prominently Displayed Large Cutout */}
                  <div className="w-[45%] lg:w-1/2 flex items-end justify-center">
                    <motion.div
                      initial={{ opacity: 0, y: 25, x: isEven ? -15 : 15 }}
                      whileInView={{ opacity: 1, y: 0, x: 0 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="relative w-full h-[220px] sm:h-[350px] lg:h-[550px] xl:h-[600px] flex items-end justify-center overflow-visible"
                    >
                      <img
                        src={founder.photo_path}
                        alt={founder.name}
                        className="max-h-full max-w-full object-contain object-bottom select-none transform scale-[1.35] sm:scale-[1.45] lg:scale-[1.55] origin-bottom transition-transform duration-500 ease-out hover:scale-[1.4] sm:hover:scale-[1.5] lg:hover:scale-[1.6]"
                        style={{
                          filter: 'drop-shadow(0 20px 40px rgba(8, 26, 46, 0.08))',
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Profile Details Column - Clean Editorial Typography & Dynamic Bio Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20, x: isEven ? 15 : -15 }}
                    whileInView={{ opacity: 1, y: 0, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className={`w-[55%] lg:w-1/2 space-y-2 sm:space-y-4 lg:space-y-6 flex flex-col justify-center items-start text-left pr-2 sm:pr-0`}
                  >
                    <div className="space-y-1 sm:space-y-2 lg:space-y-3">
                      <h3 className="text-2xl sm:text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
                        <span className="text-[#A40D35]">{firstWord}</span>
                        {remainingName && <span className="text-[#081A2E]"> {remainingName}</span>}
                      </h3>
                      <p className="text-sm sm:text-xl lg:text-2xl font-bold text-[#A40D35] tracking-wide">
                        {founder.role}
                      </p>
                    </div>

                    {founder.short_bio ? (
                      <p className="text-slate-600 text-xs sm:text-sm lg:text-lg leading-snug sm:leading-relaxed max-w-lg line-clamp-3 sm:line-clamp-4 lg:line-clamp-5">
                        {founder.short_bio}
                      </p>
                    ) : (
                      <p className="text-slate-400 text-xs sm:text-sm italic">
                        Anggota tim profesional Prime Broadcast.
                      </p>
                    )}

                    <div className="pt-2 sm:pt-4 border-t border-slate-100 w-full max-w-[100px] sm:max-w-[200px] lg:max-w-xs text-left">
                      <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 font-bold tracking-widest uppercase">
                        Prime Broadcast
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
