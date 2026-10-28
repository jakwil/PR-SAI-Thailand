import React, { useState, useRef } from 'react';
import { Play, Eye, Clock, X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViralClip } from '../types';
import { playDigitalSound } from '../utils/audioEffects';

interface ViralClipsSectionProps {
  clips: ViralClip[];
  onPlayingChange?: (isPlaying: boolean) => void;
}

export const ViralClipsSection: React.FC<ViralClipsSectionProps> = ({ clips, onPlayingChange }) => {
  const [activeClipModal, setActiveClipModal] = useState<ViralClip | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleOpenClip = (clip: ViralClip) => {
    playDigitalSound('select');
    setActiveClipModal(clip);
    onPlayingChange?.(true);
  };

  const handleCloseClip = () => {
    setActiveClipModal(null);
    onPlayingChange?.(false);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    playDigitalSound('click');
    if (!scrollRef.current) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const scrollAmount = isMobile ? 150 : 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Helper to extract YouTube video ID if URL is from YouTube
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
      : null;
  };

  return (
    <div id="viral-clips" className="relative pt-0 pb-1 scroll-mt-20">
      {/* Dedicated Blurred Ambient Glow Behind Viral Clips */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl" aria-hidden="true">
        <div className="absolute top-1/4 right-10 w-[700px] h-[350px] bg-gradient-to-r from-amber-600/12 via-rose-600/10 to-blue-600/12 rounded-full blur-[140px]" />
      </div>

      {/* Horizontal Scroll Track: เลื่อนซ้ายขวาได้สะดวก */}
      <div className="relative group/track">
        {/* Floating Left Carousel Scroll Arrow */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute -left-1.5 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-[#040e2b]/90 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 hover:text-white transition-all active:scale-90 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center justify-center cursor-pointer"
          aria-label="เลื่อนซ้าย"
          title="เลื่อนซ้าย"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        {/* Floating Right Carousel Scroll Arrow */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="absolute -right-1.5 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-[#040e2b]/90 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 hover:text-white transition-all active:scale-90 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center justify-center cursor-pointer"
          aria-label="เลื่อนขวา"
          title="เลื่อนขวา"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        <div
          ref={scrollRef}
          className="flex items-stretch gap-2.5 sm:gap-4 lg:gap-5 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory py-1 px-1 sm:px-2 no-scrollbar [&::-webkit-scrollbar]:hidden touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {clips.map((clip) => (
            <div
              key={clip.id}
              onClick={() => handleOpenClip(clip)}
              className="group cursor-pointer rounded-xl sm:rounded-2xl bg-[#081a44]/90 border border-amber-400/30 hover:border-amber-400/70 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.5)] sm:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.25)] backdrop-blur-xl ring-1 ring-white/5 flex flex-col shrink-0 w-[130px] sm:w-[290px] md:w-[320px] xl:w-[350px] 2xl:w-[380px] snap-start overflow-hidden hover:scale-[1.01] active:scale-[0.98]"
              title={`กดที่ภาพเพื่อชมคลิป: ${clip.title}`}
            >
              {/* ภาพเต็มของคลิป (Full Edge-to-Edge Image with Centered Play Button) */}
              <div className="relative w-full aspect-video overflow-hidden bg-slate-950">
                <img
                  src={clip.thumbnail}
                  alt={clip.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/assets/images/sai_public_campaign_1791689820118.jpg';
                  }}
                />
                
                {/* Central Play Button Overlay - scaled down for smartphone */}
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                  <div className="w-6 h-6 sm:w-12 sm:h-12 rounded-full bg-amber-400 group-hover:bg-yellow-300 text-slate-950 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.6)] sm:shadow-[0_0_20px_rgba(245,158,11,0.6)] group-hover:scale-110 transition-transform">
                    <Play className="w-2.5 h-2.5 sm:w-5 sm:h-5 fill-slate-950 translate-x-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 px-1 sm:px-2 py-0.5 rounded sm:rounded-md bg-black/80 text-[8px] sm:text-[10px] text-white font-mono flex items-center gap-0.5 sm:gap-1 backdrop-blur-sm border border-white/10">
                  <Clock className="w-2 h-2 sm:w-3 sm:h-3 text-amber-400" />
                  <span>{clip.duration}</span>
                </div>

                {/* View count */}
                <div className="absolute top-1 sm:top-2 left-1 sm:left-2 px-1 sm:px-2 py-0.5 rounded sm:rounded-md bg-black/75 text-[8px] sm:text-[10px] text-amber-300 font-mono flex items-center gap-0.5 sm:gap-1 backdrop-blur-sm border border-amber-400/20">
                  <Eye className="w-2 h-2 sm:w-3 sm:h-3 text-amber-400" />
                  <span>{clip.views}</span>
                </div>
              </div>

              {/* ด้านล่างมีแค่ชื่อคลิปแบบตัวหนาเท่านั้น */}
              <div className="p-1.5 sm:p-3 flex-1 flex items-start">
                <h3 className="text-[10px] sm:text-sm md:text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                  {clip.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal Player Preview เมื่อกดที่ภาพ */}
      {activeClipModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={handleCloseClip}
        >
          <div
            className="relative w-full max-w-2xl bg-[#090c16] border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-[#040e28]">
              <span className="text-xs sm:text-sm font-bold text-amber-300 line-clamp-1 pr-2">
                {activeClipModal.title}
              </span>
              <button
                onClick={handleCloseClip}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              {getYouTubeEmbedUrl(activeClipModal.linkUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeClipModal.linkUrl)!}
                  title={activeClipModal.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    src={activeClipModal.thumbnail}
                    alt={activeClipModal.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-85"
                  />
                  <a
                    href={activeClipModal.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 p-6 text-center group cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(245,158,11,0.7)] group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-slate-950 translate-x-0.5" />
                    </div>
                    <span className="mt-2 text-xs sm:text-sm text-amber-300 font-semibold inline-flex items-center gap-1.5 bg-black/70 px-3 py-1.5 rounded-full border border-amber-400/40">
                      <span>เปิดชมวิดีโอบนช่องทางทางการ</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </a>
                </>
              )}
            </div>

            <div className="p-3.5 sm:p-4 flex items-center justify-between bg-slate-950/90 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-mono">
                ความยาว {activeClipModal.duration} · ยอดชม {activeClipModal.views}
              </span>
              <a
                href={activeClipModal.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
              >
                <span>เปิดดูวิดีโอ</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
