import React from 'react';
import { useSiteTheme } from '../contexts/ThemeContext';

/**
 * RoyalBackground / CleanDaylightBackground Component
 * รองรับทั้งโทน Royal Navy Dark และโทน Clean Light (สว่าง สะอาดตา)
 */
export const ThreeCanvas: React.FC = () => {
  const { isClean } = useSiteTheme();

  if (isClean) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transform-gpu"
        style={{ contain: 'strict' }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#ffffff] via-[#f8fafc] to-[#f1f5f9]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              'radial-gradient(700px 480px at 20% 8%, rgba(14, 165, 233, 0.06), transparent 72%)',
              'radial-gradient(620px 440px at 85% 28%, rgba(245, 158, 11, 0.05), transparent 72%)',
              'radial-gradient(650px 480px at 50% 85%, rgba(59, 130, 246, 0.05), transparent 72%)',
            ].join(', '),
          }}
        />
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern id="clean-grid-lattice" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#0f172a" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#clean-grid-lattice)" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transform-gpu"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* 1. Deep Imperial Royal Navy Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020717] via-[#041033] to-[#010512]" />

      {/* 2. Soft Royal Gold & Sapphire Ambient Glows (Zero-Cost Radial Gradients instead of GPU Blurs) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(650px 500px at 35% 5%, rgba(245, 158, 11, 0.11), transparent 72%)',
            'radial-gradient(620px 480px at 85% 32%, rgba(37, 99, 235, 0.16), transparent 72%)',
            'radial-gradient(580px 460px at 8% 58%, rgba(217, 119, 6, 0.09), transparent 72%)',
            'radial-gradient(660px 500px at 78% 76%, rgba(67, 56, 202, 0.14), transparent 72%)',
            'radial-gradient(620px 480px at 45% 96%, rgba(245, 158, 11, 0.09), transparent 72%)',
          ].join(', '),
        }}
      />

      {/* 3. Subtle Royal Gold Diamond Lattice / Guilloché Pattern (Pure SVG, Ultra-Lightweight) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.045] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="royal-gold-lattice"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {/* Diamond Outer Frame */}
            <path
              d="M30 0 L60 30 L30 60 L0 30 Z"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="0.8"
            />
            {/* Inner Concentric Diamond */}
            <path
              d="M30 10 L50 30 L30 50 L10 30 Z"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="0.5"
            />
            {/* Royal Fleur/Star Center Point */}
            <circle cx="30" cy="30" r="1.5" fill="#FDE68A" />
            <circle cx="0" cy="30" r="1" fill="#D4AF37" />
            <circle cx="60" cy="30" r="1" fill="#D4AF37" />
            <circle cx="30" cy="0" r="1" fill="#D4AF37" />
            <circle cx="30" cy="60" r="1" fill="#D4AF37" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#royal-gold-lattice)" />
      </svg>

      {/* 4. Fine Royal Gold Starlight Pin-Lights (Static & Elegant) */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 20px 30px, #fef08a, transparent), radial-gradient(1px 1px at 75px 120px, #f59e0b, transparent), radial-gradient(1px 1px at 150px 70px, #d4af37, transparent), radial-gradient(1.5px 1.5px at 220px 190px, #fef3c7, transparent)',
          backgroundSize: '280px 280px',
        }}
      />

      {/* 5. Imperial Vignette Border Darkness */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(1, 4, 15, 0.75) 100%)',
        }}
      />
    </div>
  );
};

