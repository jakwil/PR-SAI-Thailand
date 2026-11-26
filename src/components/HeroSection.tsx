import React from 'react';
import { HeroStory, ViralClip, MarqueeTickerSettings } from '../types';
import { HeroCarousel } from './HeroCarousel';
import { ViralClipsSection } from './ViralClipsSection';
import { MarqueeTicker } from './MarqueeTicker';
import { useSiteTheme } from '../contexts/ThemeContext';

interface HeroSectionProps {
  stories: HeroStory[];
  clips?: ViralClip[];
  marqueeTicker?: MarqueeTickerSettings;
  onPlayingChange?: (isPlaying: boolean) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  stories,
  clips,
  marqueeTicker,
  onPlayingChange,
}) => {
  const { isClean } = useSiteTheme();

  return (
    <section
      id="home"
      className={`relative pt-1 sm:pt-2 pb-6 sm:pb-8 space-y-3 sm:space-y-4 w-full transition-colors duration-300 ${
        isClean
          ? 'bg-gradient-to-b from-[#fffdf9] via-[#fcf8ee] to-[#f8f1df] border-b border-[#d4af37]/35'
          : 'bg-gradient-to-b from-[#030a1d]/80 via-[#040f2b]/65 to-[#020819]/80'
      }`}
    >
      {/* Section 1 Subtle Ambient Highlight */}
      <div
        className="absolute inset-0 pointer-events-none -z-0"
        aria-hidden="true"
        style={{
          backgroundImage: isClean
            ? 'radial-gradient(680px 320px at 22% 12%, rgba(212, 175, 55, 0.08), transparent 72%), radial-gradient(620px 340px at 84% 78%, rgba(255, 255, 255, 0.85), transparent 72%)'
            : 'radial-gradient(680px 340px at 22% 14%, rgba(245, 158, 11, 0.08), transparent 72%), radial-gradient(600px 320px at 82% 80%, rgba(37, 99, 235, 0.10), transparent 72%)',
        }}
      />

      {/* กรอบข้อความประกาศวิ่ง (Ticker) ขยายเต็มกรอบ สามารถแก้ไขใน Admin ได้ พร้อมจุดแผ่คลื่นกระพริบ */}
      <div className="relative z-10">
        <MarqueeTicker settings={marqueeTicker} />
      </div>

      {/* 1. Hero Carousel (Highlight ภาพข่าวหมุน) - ด้านข้างไม่มีขอบ ขยายเต็มด้านข้าง มีขอบเฉพาะบนล่าง */}
      <div className="relative z-10 w-full">
        <HeroCarousel stories={stories} />
      </div>

      {/* 2. วิดีโอ คลิปไวรัล ต่อจาก Highlight เลย */}
      {clips && clips.length > 0 && (
        <div className="relative z-10 w-full max-w-[1920px] 2xl:max-w-[2400px] 3xl:max-w-none px-2.5 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mx-auto">
          <ViralClipsSection clips={clips} onPlayingChange={onPlayingChange} />
        </div>
      )}
    </section>
  );
};


