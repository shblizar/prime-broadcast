import React from 'react';

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
      {/* Official Brand Mark Emblem */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full aspect-square flex-shrink-0"
        aria-label="Prime Broadcast Logo Mark"
      >
        <defs>
          <linearGradient id="pb-brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A40D35" />
            <stop offset="100%" stopColor="#081A2E" />
          </linearGradient>
        </defs>
        
        {/* Outer Hexagonal Aperture Frame */}
        <path
          d="M24 3L42 13.5V34.5L24 45L6 34.5V13.5L24 3Z"
          fill={isLight ? '#081A2E' : '#081A2E'}
          stroke={isLight ? '#E2E8F0' : '#081A2E'}
          strokeWidth="2"
        />

        {/* Central Broadcast Prism / Camera Signal Icon */}
        <path
          d="M17 16L31 24L17 32V16Z"
          fill="#A40D35"
        />
        
        <circle cx="34" cy="18" r="2.5" fill="#FFFFFF" />
        <line x1="12" y1="24" x2="14" y2="24" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>

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
