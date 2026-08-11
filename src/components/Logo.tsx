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
      <img src="/favicon.png" alt="Glintspark Logo" style={{ width: size, height: size, objectFit: 'contain' }} className="rounded-full shadow-sm" />
      {showText && (
        <span className={`font-extrabold tracking-tight ${textClass}`} style={{ fontSize: size * 0.7, letterSpacing: '-0.03em' }}>
          Glintspark
        </span>
      )}
    </div>
  );
};
