
import React from 'react';

interface BottleIconProps {
  type: 'cup' | 'bottle' | 'glass';
  className?: string;
  isGhost?: boolean;
  hasGlow?: boolean;
}

const BottleIcon: React.FC<BottleIconProps> = ({ type, className = '', isGhost = false, hasGlow = false }) => {
  const glowStyle = hasGlow ? {
    filter: 'drop-shadow(0 0 12px rgba(255, 180, 100, 0.8))',
    color: '#fbbf24'
  } : {};

  const baseClass = isGhost ? 'text-slate-800/40' : 'text-blue-400';

  switch (type) {
    case 'bottle':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`${baseClass} ${className}`} style={glowStyle}>
          <path d="M15 2H9c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm1 6H8c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" />
        </svg>
      );
    case 'cup':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`${baseClass} ${className}`} style={glowStyle}>
          <path d="M20 3H4v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V3zM6 5h12v8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V5z" />
        </svg>
      );
    case 'glass':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`${baseClass} ${className}`} style={glowStyle}>
          <path d="M3 2l2.01 18.23C5.13 21.23 5.97 22 7 22h10c1.03 0 1.87-.77 1.99-1.77L21 2H3z" />
        </svg>
      );
    default:
      return null;
  }
};

export default BottleIcon;
