import React from 'react';
import { HeroStory, ViralClip } from '../types';
import { HeroCarousel } from './HeroCarousel';
import { ViralClipsSection } from './ViralClipsSection';

interface HeroSectionProps {
  stories: HeroStory[];
  clips?: ViralClip[];
  onPlayingChange?: (isPlaying: boolean) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  stories,
  clips,
  onPlayingChange,
}) => {
  return (
    <section id="home" className="relative pt-1 sm:pt-2 pb-2 sm:pb-3 space-y-3 sm:space-y-4 w-full">
      {/* ป้ายศูนย์กลางประชาสัมพันธ์และสื่อสารองค์กร สตง. · SAI THAILAND พร้อมไฟกระพริบด้านหน้า (อยู่ด้านล่างบาร์บน / ด้านบนของ hero) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-start">
        <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#081738]/95 border border-amber-400/80 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_15px_rgba(245,158,11,0.25)] backdrop-blur-md">
          {/* ไฟกระพริบด้านหน้า (นุ่มนวล ไม่กระพริบกระตุกหน้าจอ) */}
          <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/50 opacity-40 [animation-duration:2.5s]"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.95)]"></span>
          </span>
          <span className="font-semibold text-amber-300 tracking-wide text-xs sm:text-[13px]">
            ศูนย์กลางประชาสัมพันธ์และสื่อสารองค์กร สตง.
          </span>
        </div>
      </div>

      {/* 1. Hero Carousel (Highlight ภาพข่าวหมุน) - ด้านข้างไม่มีขอบ ขยายเต็มด้านข้าง มีขอบเฉพาะบนล่าง */}
      <div className="w-full">
        <HeroCarousel stories={stories} />
      </div>

      {/* 2. วิดีโอ คลิปไวรัล ต่อจาก Highlight เลย */}
      {clips && clips.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <ViralClipsSection clips={clips} onPlayingChange={onPlayingChange} />
        </div>
      )}
    </section>
  );
};


