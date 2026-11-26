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
        {/* 1. Warm Pearl White Marble Base */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#faf7f0',
            backgroundImage: [
              'radial-gradient(900px 620px at 78% 12%, rgba(255, 255, 255, 0.96), transparent 72%)',
              'radial-gradient(780px 560px at 14% 24%, rgba(212, 175, 55, 0.08), transparent 72%)',
              'radial-gradient(840px 580px at 82% 72%, rgba(240, 230, 206, 0.55), transparent 74%)',
              'radial-gradient(720px 520px at 20% 88%, rgba(212, 175, 55, 0.07), transparent 72%)',
              'linear-gradient(125deg, rgba(255,255,255,0.78) 0%, rgba(244,239,229,0.52) 38%, rgba(255,255,255,0.88) 68%, rgba(238,231,216,0.58) 100%)',
            ].join(', '),
          }}
        />

        {/* 2. Subtle Translucent Marble Veining SVG Overlay */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.26] pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-60 210 C 210 160, 380 310, 680 230 C 960 155, 1180 280, 1510 190"
            stroke="#d6c59c"
            strokeWidth="1.8"
            strokeOpacity="0.7"
          />
          <path
            d="M-40 540 C 260 610, 520 430, 860 520 C 1120 590, 1290 470, 1500 550"
            stroke="#d8ccb2"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          <path
            d="M220 -20 C 310 240, 440 420, 380 920"
            stroke="#e2d6bc"
            strokeWidth="1.4"
            strokeOpacity="0.55"
          />
          <path
            d="M1140 -20 C 1030 280, 1210 560, 1080 920"
            stroke="#d4c295"
            strokeWidth="1.5"
            strokeOpacity="0.55"
          />
        </svg>

        {/* 3. Ultra-faint Royal Gold Diamond Lattice */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern id="pearl-gold-lattice" width="72" height="72" patternUnits="userSpaceOnUse">
              <path d="M36 0 L72 36 L36 72 L0 36 Z" fill="none" stroke="#b8860b" strokeWidth="0.7" />
              <circle cx="36" cy="36" r="1.2" fill="#b8860b" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pearl-gold-lattice)" />
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

