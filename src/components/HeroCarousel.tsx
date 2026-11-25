import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Radio, Share2, Bell } from 'lucide-react';
import { HeroStory, NewsSubscriber } from '../types';
import { ShareModal } from './ShareModal';
import { SubscribeNewsModal } from './SubscribeNewsModal';
import { saveNewsSubscriber } from '../firebase';
import { playDigitalSound } from '../utils/audioEffects';
import { useSiteTheme } from '../contexts/ThemeContext';

interface HeroCarouselProps {
  stories: HeroStory[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ stories }) => {
  const { isClean } = useSiteTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const [shareStory, setShareStory] = useState<HeroStory | null>(null);
  const [subscribeStory, setSubscribeStory] = useState<HeroStory | null>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);

  const handleSubscribeSubmit = async (sub: Omit<NewsSubscriber, 'id' | 'subscribedAt'>) => {
    try {
      const newSub: NewsSubscriber = {
        ...sub,
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        subscribedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveNewsSubscriber(newSub);
      await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub),
      }).catch(() => null);
    } catch (err) {
      console.warn('Subscription save notice:', err);
    }
  };

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Auto-play interval duration in ms (10 วินาทีตามที่ผู้ใช้กำหนด)
  const INTERVAL_MS = 10000;
  const validStories = stories.slice(0, 10); // Maximum 10 stories as specified

  useEffect(() => {
    const el = heroContainerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (validStories.length <= 1 || isPaused || !isInViewport) return;

    const timer = setInterval(() => {
      setCurrentIndex((curr) => (curr + 1) % validStories.length);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused, isInViewport, validStories.length, currentIndex]);

  if (!validStories || validStories.length === 0) return null;

  const current = validStories[currentIndex] || validStories[0];

  const handlePrev = () => {
    playDigitalSound('click');
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : validStories.length - 1));
  };

  const handleNext = () => {
    playDigitalSound('click');
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
      ref={heroContainerRef}
      className="relative w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Outer Container */}
      <div
        className={`relative rounded-none overflow-hidden border-y border-x-0 transition-colors ${
          isClean
            ? 'bg-white border-slate-200 shadow-[0_8px_28px_rgba(15,23,42,0.08)]'
            : 'bg-gradient-to-b from-[#0a1e4d]/98 via-[#061539]/98 to-[#030d26] border-amber-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_30px_rgba(245,158,11,0.2)]'
        }`}
      >
        {/* Top Accent Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] ${
            isClean
              ? 'bg-gradient-to-r from-sky-500/60 via-amber-500/60 to-sky-500/60'
              : 'bg-gradient-to-r from-transparent via-amber-400 to-transparent'
          }`}
        />

        {/* Main Carousel Display (Grid 12-cols) - ขยายภาพไปทางขวา 40% (lg:col-span-9) ข้อความชิดด้านบน - สูงขึ้น 15% */}
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:h-[426px] xl:h-[455px] 2xl:h-[490px] items-stretch">
          {/* Left Column: Image Slides with Dissolve Transition & 5% Slow Zoom (Ken Burns Effect) - สูงขึ้น 15% */}
          <div className="lg:col-span-9 relative h-[242px] sm:h-[300px] md:h-[415px] lg:h-full overflow-hidden group">
            {/* Dissolve Cross-Fade Layers for All Stories */}
            {validStories.map((story, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={`hero-slide-${story.id}`}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isActive
                      ? 'opacity-100 z-10 pointer-events-auto'
                      : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <a
                    href={story.linkUrl}
                    target={story.linkUrl.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="block w-full h-full cursor-pointer relative overflow-hidden"
                    title={`คลิกรูปภาพเพื่ออ่านรายละเอียด: ${story.title}`}
                  >
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      referrerPolicy="no-referrer"
                      loading={idx === currentIndex || idx === (currentIndex + 1) % validStories.length ? 'eager' : 'lazy'}
                      decoding="async"
                      className={`w-full h-full object-cover object-center transform-gpu ${
                        isActive ? 'animate-hero-zoom-5pct' : 'scale-100'
                      }`}
                      style={{
                        animationPlayState: isPaused || !isInViewport ? 'paused' : 'running',
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/assets/images/sai_digital_network_1791693065277.jpg';
                      }}
                    />

                    {/* Image Scrim */}
                    <div
                      className={`absolute inset-0 pointer-events-none ${
                        isClean
                          ? 'bg-gradient-to-t from-slate-900/35 via-transparent to-transparent lg:bg-none'
                          : 'bg-gradient-to-t from-[#030d26] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#030d26]/85'
                      }`}
                    />
                    {!isClean && (
                      <div className="absolute inset-0 bg-amber-950/15 mix-blend-color-dodge pointer-events-none" />
                    )}
                  </a>
                </div>
              );
            })}

            {/* Icon สำหรับกด ซ้าย-ขวา ด้านซ้ายและด้านขวาของภาพ hero */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/65 hover:bg-amber-500/40 border border-amber-400/60 text-amber-300 hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg shadow-black/60 transition-transform active:scale-90 cursor-pointer"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/65 hover:bg-amber-500/40 border border-amber-400/60 text-amber-300 hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg shadow-black/60 transition-transform active:scale-90 cursor-pointer"
              aria-label="ข่าวถัดไป"
              title="ถัดไป"
            >
              <ChevronRight className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>

            {/* Badge Overlay (Top Left) */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-30 pointer-events-none">
              <span className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-[10px] font-bold tracking-wide shadow-md shadow-amber-500/30 flex items-center gap-1 font-mono">
                <Radio className="w-2.5 h-2.5 animate-pulse text-slate-950" />
                <span>{current.badge || 'ข่าวเด่น สตง.'}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#020b1e]/90 border border-amber-400/40 text-amber-300 text-[10px] font-medium hidden xs:inline">
                {current.category}
              </span>
            </div>

            {/* Action Buttons Floating on Top-Right of Image */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-30">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playDigitalSound('select');
                  setSubscribeStory(current);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 hover:text-white border border-amber-400/70 text-[10px] sm:text-[11px] font-bold transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-black/60 backdrop-blur-md cursor-pointer group/sub"
                title="ติดตามข่าวสารเรื่องนี้ทางอีเมล"
              >
                <Bell className="w-3 h-3 text-amber-300 group-hover/sub:animate-bounce" />
                <span>ติดตามข่าว</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShareStory(current);
                }}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl bg-[#040e2b]/85 hover:bg-amber-500/25 text-amber-300 hover:text-white border border-amber-400/40 text-[10px] sm:text-[11px] font-semibold transition-all active:scale-95 whitespace-nowrap shadow-md backdrop-blur-md cursor-pointer"
                title="แชร์ข่าวนี้ไปยัง LINE / Facebook / X"
              >
                <Share2 className="w-3 h-3 text-amber-400" />
                <span>แชร์</span>
              </button>
            </div>

            {/* Date Tag - ซ่อนบน Smartphone เพื่อความสะอาดตา */}
            <div className="hidden sm:flex absolute bottom-2 left-2.5 text-[10px] text-amber-200 items-center gap-1 bg-black/75 px-2 py-0.5 rounded border border-amber-500/30 backdrop-blur-sm z-30 pointer-events-none">
              <Calendar className="w-2.5 h-2.5 text-amber-400" />
              <span>{current.date}</span>
            </div>
          </div>

          {/* Right Column: News Content */}
          <div
            className={`lg:col-span-3 p-4 sm:p-5 md:max-lg:p-4 lg:p-6 flex flex-col justify-between text-left space-y-3 relative z-10 h-full overflow-hidden ${
              isClean
                ? 'bg-white border-t lg:border-t-0 lg:border-l border-slate-200'
                : 'lg:bg-gradient-to-b lg:from-[#081942] lg:via-[#061333] lg:to-[#030b21] lg:border-l lg:border-amber-400/25'
            }`}
          >
            {!isClean && (
              <div className="hidden lg:block absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.14)_0%,transparent_70%)] pointer-events-none" />
            )}

            <div className="relative z-10 w-full">
              {validStories.map((story, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <div
                    key={`headline-${story.id}`}
                    className={`transition-opacity duration-1000 ease-in-out ${
                      isActive
                        ? 'opacity-100 relative'
                        : 'opacity-0 absolute inset-0 pointer-events-none'
                    }`}
                  >
                    <a
                      href={story.linkUrl}
                      target={story.linkUrl.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="block group/title focus:outline-none"
                      title={`คลิกเพื่ออ่านรายละเอียด: ${story.title}`}
                    >
                      <h2
                        className={`text-base sm:text-lg lg:text-xl font-extrabold leading-snug transition-colors line-clamp-3 md:max-lg:line-clamp-3 lg:line-clamp-5 ${
                          isClean
                            ? 'text-slate-900 group-hover/title:text-sky-700'
                            : 'text-white group-hover/title:text-amber-300'
                        }`}
                      >
                        {story.title}
                      </h2>
                    </a>
                  </div>
                );
              })}
            </div>

            {/* Follow News Action Button in Content Box */}
            <div
              className={`relative z-10 pt-2.5 border-t flex items-center justify-between gap-2 ${
                isClean ? 'border-slate-200' : 'border-amber-400/25'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  playDigitalSound('select');
                  setSubscribeStory(current);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-sm cursor-pointer ${
                  isClean
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/15 hover:from-amber-500/30 hover:to-yellow-500/25 border-amber-400/50 text-amber-300 hover:text-white'
                }`}
                title="กรอกอีเมลเพื่อติดตามข่าวสารเรื่องนี้"
              >
                <Bell className={`w-3.5 h-3.5 animate-pulse ${isClean ? 'text-amber-600' : 'text-amber-400'}`} />
                <span>ติดตามข่าวเรื่องนี้</span>
              </button>

              <span className={`text-xs font-mono hidden sm:inline font-medium ${isClean ? 'text-slate-600' : 'text-slate-300'}`}>
                {current.category}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Step Selectors */}
        <div
          className={`px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center sm:justify-end border-t ${
            isClean ? 'bg-slate-50 border-slate-200' : 'bg-[#03091e]/95 border-amber-500/20'
          }`}
        >
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
            {validStories.map((s, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    playDigitalSound('click');
                    setCurrentIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? isClean
                        ? 'w-7 bg-sky-600 shadow-sm'
                        : 'w-7 bg-gradient-to-r from-amber-400 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                      : isClean
                      ? 'w-2 bg-slate-300 hover:bg-sky-400'
                      : 'w-2 bg-slate-700/80 hover:bg-amber-400/60'
                  }`}
                  aria-label={`ไปยังข่าวที่ ${idx + 1}`}
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

      {/* Subscribe News Modal Dialog */}
      <SubscribeNewsModal
        isOpen={!!subscribeStory}
        onClose={() => setSubscribeStory(null)}
        story={subscribeStory}
        onSubscribe={handleSubscribeSubmit}
      />
    </div>
  );
};
