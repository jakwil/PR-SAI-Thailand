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
    <section id="home" className="relative pt-1 pb-2 sm:pt-2 sm:pb-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4">
      {/* 1. Hero Carousel (Highlight ภาพข่าวหมุน) */}
      <div className="w-full">
        <HeroCarousel stories={stories} />
      </div>

      {/* 2. วิดีโอ คลิปไวรัล ต่อจาก Highlight เลย */}
      {clips && clips.length > 0 && (
        <div className="w-full">
          <ViralClipsSection clips={clips} onPlayingChange={onPlayingChange} />
        </div>
      )}
    </section>
  );
};

