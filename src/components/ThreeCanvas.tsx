import React from 'react';

/**
 * RoyalBackground Component (Theme หรู Royal สีน้ำเงิน-ทอง)
 * แทนที่พื้นหลัง 3D เดิมด้วยพื้นหลังเรียบหรู สง่างาม ไร้ 3D (Non-3D Luxury Royal Navy & Gold)
 * ผสานลวดลายเรขาคณิต Royal Guilloché ลายทองบางเบา และแสงเรืองรองนุ่มนวลแบบราชการชั้นสูง
 */
export const ThreeCanvas: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Deep Imperial Royal Navy Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020717] via-[#041033] to-[#010512]" />

      {/* 2. Soft Royal Gold & Sapphire Ambient Glow Orbs (Soft, Calm, Non-Distracting) */}
      <div className="absolute top-[-10%] left-[20%] w-[700px] h-[550px] bg-amber-500/10 rounded-full blur-[160px]" />
      <div className="absolute top-[25%] right-[-5%] w-[650px] h-[500px] bg-blue-600/15 rounded-full blur-[170px]" />
      <div className="absolute top-[50%] left-[-10%] w-[600px] h-[500px] bg-amber-600/8 rounded-full blur-[160px]" />
      <div className="absolute top-[70%] right-[15%] w-[700px] h-[550px] bg-indigo-700/12 rounded-full blur-[170px]" />
      <div className="absolute bottom-[-10%] left-[30%] w-[650px] h-[500px] bg-amber-500/8 rounded-full blur-[160px]" />

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
