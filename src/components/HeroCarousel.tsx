import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles, Calendar, Radio, Share2 } from 'lucide-react';
import { HeroStory } from '../types';
import { ShareModal } from './ShareModal';
import { playDigitalSound } from '../utils/audioEffects';

interface HeroCarouselProps {
  stories: HeroStory[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ stories }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shareStory, setShareStory] = useState<HeroStory | null>(null);

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Auto-play interval duration in ms
  const INTERVAL_MS = 5500;
  const validStories = stories.slice(0, 10); // Maximum 10 stories as specified

  useEffect(() => {
    if (validStories.length <= 1) return;

    setProgress(0);
    const stepInterval = 50; // update progress every 50ms
    const stepIncrement = (stepInterval / INTERVAL_MS) * 100;

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev >= 100) {
            setCurrentIndex((curr) => (curr + 1) % validStories.length);
            return 0;
          }
          return prev + stepIncrement;
        });
      }
    }, stepInterval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, validStories.length]);

  if (!validStories || validStories.length === 0) return null;

  const current = validStories[currentIndex] || validStories[0];

  const handlePrev = () => {
    playDigitalSound('click');
    setProgress(0);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : validStories.length - 1));
  };

  const handleNext = () => {
    playDigitalSound('click');
    setProgress(0);
    setCurrentIndex((prev) => (prev < validStories.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <div
      className="relative w-full max-w-7xl mx-auto select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Outer Holographic Container with Laser Border & Frosted Blur */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#081b45]/90 via-[#061436]/90 to-[#040e28]/95 border border-cyan-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(6,182,212,0.2)] backdrop-blur-2xl ring-1 ring-white/10">
        {/* Holographic Top Laser Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Tech Viewport Corner Brackets */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none z-20" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none z-20" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none z-20" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none z-20" />

        {/* Main Carousel Display (Grid 12-cols) - Desktop height increased by 40% as requested, mobile/tablet unchanged */}
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:h-[260px] xl:h-[275px] items-stretch">
          {/* Left Column: Image with Holographic Overlay and Cinematic Zoom */}
          <div className="lg:col-span-7 relative h-[160px] sm:h-[180px] lg:h-full overflow-hidden group">
            <img
              key={current.id}
              src={current.imageUrl}
              alt={current.title}
              className={`w-full h-full object-cover object-center ${
                !isPaused
                  ? 'animate-cinematic-zoom'
                  : 'scale-105 transition-transform duration-700'
              }`}
              style={{
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  '/src/assets/images/sai_digital_network_1791693065277.jpg';
              }}
            />

            {/* Cyan/Blue Digital Scanline Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#040e28] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#040e28] pointer-events-none" />
            <div className="absolute inset-0 bg-cyan-950/20 mix-blend-color-dodge pointer-events-none" />

            {/* Badge Overlay (Top Left) */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
              <span className="px-2 py-0.5 rounded bg-cyan-400 text-slate-950 text-[10px] font-bold tracking-wide shadow-md shadow-cyan-500/30 flex items-center gap-1 font-mono">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                <span>{current.badge || 'ข่าวเด่น สตง.'}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#020b1e]/85 border border-cyan-400/40 text-cyan-300 text-[10px] font-medium hidden xs:inline">
                {current.category}
              </span>
            </div>

            {/* Read News & Share Buttons Floating on Top-Right of Image as requested */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
              <a
                href={current.linkUrl}
                target={current.linkUrl.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-bold text-[10px] sm:text-[11px] shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all active:scale-95 whitespace-nowrap backdrop-blur-md"
              >
                <span>อ่านข่าว</span>
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              </a>

              <button
                type="button"
                onClick={() => setShareStory(current)}
                className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-xl bg-[#040e2b]/85 hover:bg-cyan-500/25 text-cyan-300 hover:text-white border border-cyan-400/40 text-[10px] sm:text-[11px] font-semibold transition-all active:scale-95 whitespace-nowrap shadow-md backdrop-blur-md"
                title="แชร์ข่าวนี้ไปยัง LINE / Facebook / X"
              >
                <Share2 className="w-3 h-3 text-cyan-400" />
                <span>แชร์</span>
              </button>
            </div>

            {/* Date Tag */}
            <div className="absolute bottom-2 left-2.5 text-[10px] text-slate-300 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm z-10">
              <Calendar className="w-2.5 h-2.5 text-cyan-400" />
              <span>{current.date}</span>
            </div>
          </div>

          {/* Right Column: News Content */}
          <div className="lg:col-span-5 p-3 sm:p-3.5 lg:p-5 flex flex-col justify-center text-left space-y-1.5 lg:space-y-2 relative z-10 h-full overflow-hidden">
            {/* Story Counter & Prev/Next Arrows in Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/30 text-blue-300">
                  FEATURED STORY
                </span>
                <span className="text-slate-500 text-[10px]">·</span>
                <span className="text-[10px] sm:text-xs font-mono text-cyan-400">
                  {String(currentIndex + 1).padStart(2, '0')} / {String(validStories.length).padStart(2, '0')}
                </span>
              </div>

              {/* Prev / Next buttons integrated into header */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  className="p-1 sm:p-1.5 rounded-lg bg-slate-900/80 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="ข่าวก่อนหน้า"
                  title="ก่อนหน้า"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 sm:p-1.5 rounded-lg bg-slate-900/80 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="ข่าวถัดไป"
                  title="ถัดไป"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white leading-snug group-hover:text-cyan-200 transition-colors line-clamp-2 lg:line-clamp-3">
              {current.title}
            </h2>

            {/* Subtitle / Description */}
            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-300 mt-0.5 leading-relaxed line-clamp-2 lg:line-clamp-3">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Bottom Continuous Laser Progress Rail & Step Selectors (Up to 10 stories) */}
        <div className="bg-[#03091e]/90 border-t border-cyan-500/20 px-3 py-1 sm:py-1.5 flex flex-col sm:flex-row items-center justify-between gap-1">
          {/* Progress Bar */}
          <div className="w-full sm:w-1/4 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Numbered Jump Tabs (01 - 10) */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 max-w-full">
            {validStories.map((s, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    playDigitalSound('click');
                    setProgress(0);
                    setCurrentIndex(idx);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold transition-all shrink-0 ${
                    isActive
                      ? 'bg-cyan-400 text-slate-950 ring-1 ring-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                      : 'bg-slate-900/80 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                  title={s.title}
                >
                  {String(idx + 1).padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={!!shareStory}
        onClose={() => setShareStory(null)}
        item={shareStory}
      />
    </div>
  );
};
