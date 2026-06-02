import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 36, showText = true, variant = 'dark' }) => {
  const textColor = variant === 'light' ? '#ffffff' : '#0f172a';
  const textClass = variant === 'light' ? 'text-white' : 'text-slate-900';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* G + Spark Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main star gradient: orange-pink-purple */}
          <linearGradient id="sparkGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          {/* Small top star gradient: blue-purple */}
          <linearGradient id="smallSparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>

        {/* G arc - dark navy, stroked path */}
        <path
          d="M83 50
             C83 68.2 68.2 83 50 83
             C31.8 83 17 68.2 17 50
             C17 31.8 31.8 17 50 17
             C61.5 17 71.5 22.5 77.5 31"
          stroke={textColor}
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        {/* G horizontal bar */}
        <path
          d="M54 50 H83"
          stroke={textColor}
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />

        {/* Main 4-pointed spark star inside the G opening */}
        <path
          d="M38 50 C38 50 44 46 47 38 C50 46 56 50 56 50 C56 50 50 54 47 62 C44 54 38 50 38 50 Z"
          fill="url(#sparkGrad)"
        />

        {/* Small accent 4-pointed star above */}
        <path
          d="M50 29 C50 29 52 27 53 25 C54 27 56 29 56 29 C56 29 54 31 53 33 C52 31 50 29 50 29 Z"
          fill="url(#smallSparkGrad)"
        />
      </svg>

      {/* Wordmark */}
      {showText && (
        <span
          className={`font-black tracking-tight select-none`}
          style={{
            fontSize: size * 0.65,
            color: textColor,
            letterSpacing: '-0.02em',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          Glintspark
        </span>
      )}
    </div>
  );
};
