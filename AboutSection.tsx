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

        {/* Founder Profile Area - Clean Cutout Portraits Without Frame/Card */}
        {founders.length > 0 && (
          <div className="pt-4">
            {founders.length === 1 ? (
              /* Single Founder Layout */
              <div className="max-w-xs mx-auto text-center space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-full h-80 flex items-end justify-center">
                    <img
                      src={founders[0].photo_path}
                      alt={founders[0].name}
                      className="max-h-full max-w-full object-contain object-bottom"
                    />
                  </div>
                  <div className="pt-4 space-y-1">
                    <h3 className="text-lg font-bold text-[#081A2E]">{founders[0].name}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">{founders[0].role}</p>
                    <p className="text-xs text-slate-400">Prime Broadcast</p>
                  </div>
                </motion.div>
              </div>
            ) : founders.length === 2 ? (
              /* Two Founders: 2 Equal Columns with Subtle Vertical Divider */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 max-w-3xl mx-auto md:divide-x md:divide-slate-200">
                {/* Left Founder */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center px-4 sm:px-8"
                >
                  <div className="w-full h-72 sm:h-80 flex items-end justify-center">
                    <img
                      src={founders[0].photo_path}
                      alt={founders[0].name}
                      className="max-h-full max-w-full object-contain object-bottom"
                    />
                  </div>
                  <div className="pt-4 space-y-0.5">
                    <h3 className="text-lg font-bold text-[#081A2E]">{founders[0].name}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">{founders[0].role}</p>
                    <p className="text-xs text-slate-400">Prime Broadcast</p>
                  </div>
                </motion.div>

                {/* Right Founder */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center px-4 sm:px-8"
                >
                  <div className="w-full h-72 sm:h-80 flex items-end justify-center">
                    <img
                      src={founders[1].photo_path}
                      alt={founders[1].name}
                      className="max-h-full max-w-full object-contain object-bottom"
                    />
                  </div>
                  <div className="pt-4 space-y-0.5">
                    <h3 className="text-lg font-bold text-[#081A2E]">{founders[1].name}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">{founders[1].role}</p>
                    <p className="text-xs text-slate-400">Prime Broadcast</p>
                  </div>
                </motion.div>
              </div>
            ) : (
              /* More than 2 Founders: Clean Responsive Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-4xl mx-auto">
                {founders.map((founder, idx) => (
                  <motion.div
                    key={founder.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-full h-72 flex items-end justify-center">
                      <img
                        src={founder.photo_path}
                        alt={founder.name}
                        className="max-h-full max-w-full object-contain object-bottom"
                      />
                    </div>
                    <div className="pt-4 space-y-0.5">
                      <h3 className="text-base font-bold text-[#081A2E]">{founder.name}</h3>
                      <p className="text-xs text-[#64748B] font-medium">{founder.role}</p>
                      <p className="text-xs text-slate-400">Prime Broadcast</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
