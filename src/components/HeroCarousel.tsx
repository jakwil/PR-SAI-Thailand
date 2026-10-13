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
      {/* Outer Holographic Container with Royal Gold Laser Border & Frosted Blur */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a1e4d]/95 via-[#061539]/95 to-[#030d26]/98 border border-amber-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_30px_rgba(245,158,11,0.2)] backdrop-blur-2xl ring-1 ring-white/10">
        {/* Holographic Top Royal Gold Laser Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Tech Viewport Corner Brackets in Gold */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400/80 pointer-events-none z-20" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400/80 pointer-events-none z-20" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400/80 pointer-events-none z-20" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400/80 pointer-events-none z-20" />

        {/* Main Carousel Display (Grid 12-cols) - ปรับเพิ่มความยาวลงมา 40% เฉพาะมุมมอง Desktop และ Tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:h-[365px] xl:h-[390px] items-stretch">
          {/* Left Column: Image with Holographic Overlay - เพิ่มความยาวลงมา 40% บน Desktop และ Tablet (sm:h-[260px] md:h-[300px] lg:h-full), Smartphone h-[210px] */}
          <div className="lg:col-span-7 relative h-[210px] sm:h-[260px] md:h-[300px] lg:h-full overflow-hidden group">
            {/* คลิกที่รูปข่าวนั้นเพื่ออ่านรายละเอียดข่าวแทนปุ่มอ่านข่าวตามคำขอ */}
            <a
              href={current.linkUrl}
              target={current.linkUrl.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="block w-full h-full cursor-pointer relative"
              title={`คลิกรูปภาพเพื่ออ่านรายละเอียด: ${current.title}`}
            >
              <img
                key={current.id}
                src={current.imageUrl}
                alt={current.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover object-center ${
                  !isPaused
                    ? 'animate-cinematic-zoom'
                    : 'scale-105 transition-transform duration-700'
                } group-hover:brightness-105`}
                style={{
                  animationPlayState: isPaused ? 'paused' : 'running',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/src/assets/images/sai_digital_network_1791693065277.jpg';
                }}
              />

              {/* Royal Navy & Warm Gold Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#030d26] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#030d26] pointer-events-none" />
              <div className="absolute inset-0 bg-amber-950/15 mix-blend-color-dodge pointer-events-none" />

              {/* Hover Cue: คลิกรูปภาพเพื่ออ่านรายละเอียด */}
              <div className="absolute inset-0 bg-amber-400/0 group-hover:bg-amber-400/10 transition-colors pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 border border-amber-400/70 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all">
                  <span>คลิกเพื่ออ่านรายละเอียด</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                </span>
              </div>
            </a>

            {/* Icon สำหรับกด ซ้าย-ขวา ด้านซ้ายและด้านขวาของภาพ hero */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/65 hover:bg-amber-500/40 border border-amber-400/60 text-amber-300 hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg shadow-black/60 transition-transform active:scale-90"
              aria-label="ข่าวก่อนหน้า"
              title="ก่อนหน้า"
            >
              <ChevronLeft className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/65 hover:bg-amber-500/40 border border-amber-400/60 text-amber-300 hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg shadow-black/60 transition-transform active:scale-90"
              aria-label="ข่าวถัดไป"
              title="ถัดไป"
            >
              <ChevronRight className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>

            {/* Badge Overlay (Top Left) */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
              <span className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-[10px] font-bold tracking-wide shadow-md shadow-amber-500/30 flex items-center gap-1 font-mono">
                <Radio className="w-2.5 h-2.5 animate-pulse text-slate-950" />
                <span>{current.badge || 'ข่าวเด่น สตง.'}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#020b1e]/90 border border-amber-400/40 text-amber-300 text-[10px] font-medium hidden xs:inline">
                {current.category}
              </span>
            </div>

            {/* Share Button Floating on Top-Right of Image (ตัดปุ่มอ่านข่าวออกตามคำขอ) */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShareStory(current);
                }}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl bg-[#040e2b]/85 hover:bg-amber-500/25 text-amber-300 hover:text-white border border-amber-400/40 text-[10px] sm:text-[11px] font-semibold transition-all active:scale-95 whitespace-nowrap shadow-md backdrop-blur-md"
                title="แชร์ข่าวนี้ไปยัง LINE / Facebook / X"
              >
                <Share2 className="w-3 h-3 text-amber-400" />
                <span>แชร์</span>
              </button>
            </div>

            {/* Date Tag - ซ่อนบน Smartphone เพื่อความสะอาดตา */}
            <div className="hidden sm:flex absolute bottom-2 left-2.5 text-[10px] text-amber-200 items-center gap-1 bg-black/75 px-2 py-0.5 rounded border border-amber-500/30 backdrop-blur-sm z-10">
              <Calendar className="w-2.5 h-2.5 text-amber-400" />
              <span>{current.date}</span>
            </div>
          </div>

          {/* Right Column: News Content - มีแค่หัวข้อข่าว ข้อความตัวหนา ข้อความตัวเล็กตัดออก */}
          <div className="lg:col-span-5 p-4 sm:p-5 lg:p-7 flex flex-col justify-center text-left space-y-2 relative z-10 h-full overflow-hidden">
            {/* Prev / Next buttons integrated into header on Desktop (ตัดป้าย ROYAL FEATURED และตัวเลขลำดับข่าวออก) */}
            <div className="hidden sm:flex items-center justify-end mb-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  className="p-1 sm:p-1.5 rounded-lg bg-slate-900/80 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="ข่าวก่อนหน้า"
                  title="ก่อนหน้า"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 sm:p-1.5 rounded-lg bg-slate-900/80 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="ข่าวถัดไป"
                  title="ถัดไป"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Headline - มีแค่หัวข้อข่าว ข้อความตัวหนา (คลิกเปิดอ่านรายละเอียดได้เช่นกัน) */}
            <a
              href={current.linkUrl}
              target={current.linkUrl.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="block group/title focus:outline-none"
              title={`คลิกเพื่ออ่านรายละเอียด: ${current.title}`}
            >
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white leading-snug group-hover/title:text-amber-300 transition-colors line-clamp-3">
                {current.title}
              </h2>
            </a>
          </div>
        </div>

        {/* Bottom Continuous Laser Progress Rail & Step Selectors (ตัดตัวเลขบอกลำดับข่าวออก) */}
        <div className="bg-[#03091e]/95 border-t border-amber-500/20 px-3 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-1">
          {/* Progress Bar */}
          <div className="w-full sm:w-1/3 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step indicators without numbers (ตัวเลขบอกลำดับข่าวตัดออก) */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
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
                  className={`h-1.5 rounded-full transition-all shrink-0 ${
                    isActive
                      ? 'w-7 bg-gradient-to-r from-amber-400 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                      : 'w-2 bg-slate-700/80 hover:bg-amber-400/60'
                  }`}
                  aria-label={`ไปยังข่าวถัดไป`}
                  title={s.title}
                />
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
