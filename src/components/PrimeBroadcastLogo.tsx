import React from 'react';
import pbLogo from '../assets/images/prime_broadcast_logo.png';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  showText?: boolean;
}

export const PrimeBroadcastLogo: React.FC<LogoProps> = ({
  className = 'h-9',
  variant = 'dark',
  showText = true,
}) => {
  const isLight = variant === 'light';
  const textColor = isLight ? '#FFFFFF' : '#081A2E';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`} id="prime-broadcast-brand-logo">
      {/* Official Brand Mark Emblem as high-resolution PNG */}
      <img
        src={pbLogo}
        alt="Prime Broadcast Logo Mark"
        referrerPolicy="no-referrer"
        className="h-full aspect-square flex-shrink-0 object-contain rounded-lg"
      />

      {showText && (
        <div className="flex flex-col justify-center">
          <div
            className="font-bold text-lg leading-tight whitespace-nowrap"
            style={{ color: textColor }}
          >
            Prime <span style={{ color: '#A40D35' }}>Broadcast</span>
          </div>
        </div>
      )}
    </div>
  );
};
