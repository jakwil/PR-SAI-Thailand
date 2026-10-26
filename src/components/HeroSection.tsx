import React from 'react';
import { HeroStory, ViralClip, MarqueeTickerSettings } from '../types';
import { HeroCarousel } from './HeroCarousel';
import { ViralClipsSection } from './ViralClipsSection';
import { MarqueeTicker } from './MarqueeTicker';

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
  return (
    <section id="home" className="relative pt-1 sm:pt-2 pb-2 sm:pb-3 space-y-3 sm:space-y-4 w-full">
      {/* กรอบข้อความประกาศวิ่ง (Ticker) ขยายเต็มกรอบ สามารถแก้ไขใน Admin ได้ พร้อมจุดแผ่คลื่นกระพริบ */}
      <MarqueeTicker settings={marqueeTicker} />

      {/* 1. Hero Carousel (Highlight ภาพข่าวหมุน) - ด้านข้างไม่มีขอบ ขยายเต็มด้านข้าง มีขอบเฉพาะบนล่าง */}
      <div className="w-full">
        <HeroCarousel stories={stories} />
      </div>

      {/* 2. วิดีโอ คลิปไวรัล ต่อจาก Highlight เลย */}
      {clips && clips.length > 0 && (
        <div className="w-full max-w-[1920px] 2xl:max-w-[2400px] 3xl:max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mx-auto">
          <ViralClipsSection clips={clips} onPlayingChange={onPlayingChange} />
        </div>
      )}
    </section>
  );
};


