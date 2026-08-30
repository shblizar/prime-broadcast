import React from 'react';
import { motion } from 'motion/react';
import { usePublicData } from '../contexts/PublicDataContext';

export const ClientMarquee: React.FC = () => {
  const { clientLogos } = usePublicData();

  // If no logos exist in database, do not render section
  if (clientLogos.length === 0) {
    return null;
  }

  // Multiply visually for seamless infinite loop marquee
  const displayLogos = [...clientLogos, ...clientLogos, ...clientLogos, ...clientLogos];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="py-14 bg-[#F7F5F1] border-y border-slate-200/60 overflow-hidden"
      id="clients"
    >
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <h3 className="text-sm font-semibold tracking-wide text-[#A40D35]">
          Client & Partner Penyiaran
        </h3>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Continuous Linear Marquee */}
        <div className="animate-marquee flex items-center gap-12 sm:gap-16 py-2 opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300">
          {displayLogos.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center justify-center h-12 w-32 sm:w-40 flex-shrink-0"
            >
              <img
                src={item.logo_path}
                alt={item.client_name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="max-h-9 max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
