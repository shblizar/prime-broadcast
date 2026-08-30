import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { useSectionAnimation } from '../../contexts/SectionAnimationContext';
import { usePublicData } from '../../contexts/PublicDataContext';

export const HomeFaqSection: React.FC = () => {
  const { replayCounts } = useSectionAnimation();
  const { faqs } = usePublicData();
  const [openId, setOpenId] = useState<string | null>(null);
  const faqControls = useAnimation();

  useEffect(() => {
    if (faqs.length > 0 && openId === null) {
      setOpenId(faqs[0].id);
    }
  }, [faqs, openId]);

  // Handle section replay trigger for 'faq'
  useEffect(() => {
    if (replayCounts['faq']) {
      faqControls.set('hidden');
      const timer = setTimeout(() => {
        faqControls.start('visible');
      }, 50);
      return () => clearTimeout(timer);
    } else {
      faqControls.start('visible');
    }
  }, [replayCounts['faq'], faqControls]);

  if (faqs.length === 0) return null;

  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const accordionContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <section className="py-20 lg:py-28 px-6 lg:px-12 bg-white text-[#081A2E]" id="faq">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Simple Centered Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <p className="text-sm font-semibold tracking-wide text-[#A40D35]">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#081A2E] leading-snug">
            Pertanyaan yang Sering Diajukan
          </h2>
        </motion.div>

        {/* Clean Accordion List */}
        <motion.div
          variants={accordionContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="divide-y divide-slate-200 border-y border-slate-200"
        >
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="py-5 sm:py-6">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full text-left flex items-center justify-between gap-4 focus:outline-none group cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-base sm:text-lg text-[#081A2E] leading-snug group-hover:text-[#A40D35] transition-colors">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        isOpen ? 'text-[#A40D35]' : 'text-slate-400'
                      }`}
                    />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
