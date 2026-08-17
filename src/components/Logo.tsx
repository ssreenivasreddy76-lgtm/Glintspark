import React from 'react';
import logoImg from '../assets/glintspark-logo.png';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 36, variant = 'dark' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoImg} 
        alt="Glintspark Logo" 
        style={{ height: size * 1.5, objectFit: 'contain' }} 
      />
    </div>
  );
};
