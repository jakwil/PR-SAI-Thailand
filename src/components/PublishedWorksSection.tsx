import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  Smartphone,
  Tv,
  Film,
  Maximize2,
  Calendar,
  Eye,
  Clock,
  Building2,
  Info,
  Search
} from 'lucide-react';
import { PublishedWork } from '../types';
import { ShareModal } from './ShareModal';
import { playDigitalSound } from '../utils/audioEffects';
import { recordShareEvent } from '../utils/analytics';

interface PublishedWorksSectionProps {
  works: PublishedWork[];
}

interface ResolutionConfig {
  label: string;
  badge: string;
  containerClass: string;
  aspectRatio: string;
  badgeColor: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const RESOLUTION_STYLES: Record<string, ResolutionConfig> = {
  '9:16': {
    label: '9:16 Vertical Reel',
    badge: '📱 9:16 Reel',
    containerClass: 'w-[88px] sm:w-[170px] h-[153px] sm:h-[300px]',
    aspectRatio: '9/16',
    badgeColor: 'bg-rose-500/95 text-white',
    Icon: Smartphone,
  },
  '16:9': {
    label: '16:9 Widescreen HD',
    badge: '🎬 16:9 HD',
    containerClass: 'w-[180px] sm:w-[350px] h-[111px] sm:h-[205px]',
    aspectRatio: '16/9',
    badgeColor: 'bg-blue-600/95 text-white',
    Icon: Tv,
  },
  '21:9': {
    label: '21:9 Ultrawide Cinema',
    badge: '🎥 21:9 Cinema',
    containerClass: 'w-[216px] sm:w-[420px] h-[111px] sm:h-[205px]',
    aspectRatio: '21/9',
    badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    Icon: Film,
  },
  '1:1': {
    label: '1:1 Square Feed',
    badge: '📊 1:1 Square',
    containerClass: 'w-[111px] sm:w-[205px] h-[111px] sm:h-[205px]',
    aspectRatio: '1/1',
    badgeColor: 'bg-emerald-600/95 text-white',
    Icon: Tv,
  },
  '4:3': {
    label: '4:3 Classic Studio',
    badge: '📷 4:3 Studio',
    containerClass: 'w-[148px] sm:w-[275px] h-[111px] sm:h-[205px]',
    aspectRatio: '4/3',
    badgeColor: 'bg-purple-600/95 text-white',
    Icon: Tv,
  },
};

export const PublishedWorksSection: React.FC<PublishedWorksSectionProps> = ({ works }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalWork, setActiveModalWork] = useState<PublishedWork | null>(null);
  const [shareItem, setShareItem] = useState<PublishedWork | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [modalVideoPlaying, setModalVideoPlaying] = useState<boolean>(true);
  const [modalMuted, setModalMuted] = useState<boolean>(false);

  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  const filteredWorks = works.filter((work) => {
    // Quick & comprehensive search query filter across title, description, category, badge, creator, tags, and resolution
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = work.title?.toLowerCase().includes(q);
      const descMatch = work.description?.toLowerCase().includes(q);
      const catMatch = work.category?.toLowerCase().includes(q);
      const badgeMatch = work.badge?.toLowerCase().includes(q);
      const creatorMatch = work.creator?.toLowerCase().includes(q);
      const resMatch = work.resolution?.toLowerCase().includes(q);
      return titleMatch || descMatch || catMatch || badgeMatch || creatorMatch || resMatch;
    }

    return true;
  });

  // Split filtered works into 2 distinct high-tech video wall rows:
  // Row 1: 8 cards (Wide & diverse resolution mix: 16:9, 21:9, 1:1, 4:3)
  // Row 2: 12 cards (Vertical high-tech video wall: 9:16 reels, shorts, and portrait feeds)
  const verticalItems = filteredWorks.filter(
    (w) => w.resolution === '9:16' || w.badge?.includes('9:16') || w.badge?.includes('Reel') || w.badge?.includes('Short')
  );
  const wideItems = filteredWorks.filter(
    (w) => w.resolution !== '9:16' && !w.badge?.includes('9:16') && !w.badge?.includes('Reel') && !w.badge?.includes('Short')
  );

  let displayRow1: PublishedWork[];
  let displayRow2: PublishedWork[];

  if (verticalItems.length >= 2 && wideItems.length >= 2) {
    displayRow1 = wideItems.slice(0, 8);
    displayRow2 = verticalItems.slice(0, 12);
  } else {
    displayRow1 = filteredWorks.filter((_, idx) => idx % 2 === 0).slice(0, 8);
    displayRow2 = filteredWorks.filter((_, idx) => idx % 2 !== 0).slice(0, 12);
    if (displayRow2.length === 0 && displayRow1.length > 0) {
      displayRow2 = displayRow1.slice(0, 12);
    }
  }

  // Manual scroll handlers for each row
  const handleScrollRow = (rowRef: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    playDigitalSound('click');
    const scrollAmount = 380;
    if (rowRef.current) {
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleOpenCard = (work: PublishedWork) => {
    playDigitalSound('select');
    setActiveModalWork(work);
    setModalVideoPlaying(true);
    setCopiedLink(false);
  };

  const handleCloseModal = () => {
    playDigitalSound('tab');
    setActiveModalWork(null);
  };

  // Helper to extract YouTube video ID if URL is from YouTube
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`
      : null;
  };

  const getResolutionConfig = (work: PublishedWork): ResolutionConfig => {
    const resKey = work.resolution || (work.mediaType === 'video' ? '16:9' : '4:3');
    return RESOLUTION_STYLES[resKey] || RESOLUTION_STYLES['16:9'];
  };

  const handleShareDirect = (platform: 'line' | 'facebook' | 'twitter' | 'copy_link') => {
    if (!activeModalWork) return;
    playDigitalSound('click');

    const shareUrl = activeModalWork.linkUrl.startsWith('http')
      ? activeModalWork.linkUrl
      : `${window.location.origin}/#work-${activeModalWork.id}`;
    const shareTitle = `${activeModalWork.title} - สตง. สำนักงานการตรวจเงินแผ่นดิน`;

    recordShareEvent(activeModalWork.id, activeModalWork.title, platform, activeModalWork.category, shareUrl);

    if (platform === 'copy_link') {
      navigator.clipboard.writeText(`${shareTitle}\n${shareUrl}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      return;
    }

    let url = '';
    if (platform === 'line') {
      url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  return (
    <section
      id="published-works"
      className="relative pt-10 sm:pt-14 pb-14 sm:pb-20 mt-8 sm:mt-14 mb-10 sm:mb-16 w-full bg-gradient-to-b from-[#061433] via-[#040e26] to-[#020718] border-y border-cyan-500/25 shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden text-slate-100 scroll-mt-24"
    >
      {/* Refined Luxury Luminous Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 via-amber-400/70 to-transparent shadow-[0_0_15px_rgba(56,189,248,0.4)] z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none" />

      {/* SUBTLE DIGITAL MEDIA ARCHIVE BACKGROUND (Harmonious with the rest of the site, subtle distinction) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        {/* Subtle Fine Micro-Grid */}
        <div className="absolute inset-0 bg-digital-grid opacity-15" />

        {/* Elegant Minimalist Media Geometric Lattice */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="refinedMediaPattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.4" />
              <circle cx="60" cy="0" r="1" fill="#38bdf8" fillOpacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#refinedMediaPattern)" />
        </svg>

        {/* Soft Ambient Glows: Midnight Cyan, Royal Sapphire & Warm Amber */}
        <div className="absolute -top-16 left-1/4 w-[600px] h-[350px] bg-cyan-600/12 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-1/4 w-[650px] h-[360px] bg-blue-700/14 rounded-full blur-[160px]" />
        <div className="absolute -bottom-16 left-1/3 w-[550px] h-[320px] bg-indigo-700/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[260px] bg-amber-500/8 rounded-full blur-[140px]" />
      </div>

      {/* Header & Comprehensive Search Container */}
      <div className="relative w-full max-w-[1920px] 2xl:max-w-[2400px] 3xl:max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mx-auto mb-4 sm:mb-6">
        {/* Top Header & Search Bar Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-5 pb-3 border-b border-cyan-500/25">
          <div className="w-full sm:w-auto overflow-hidden">
            <h2
              className="text-[14px] min-[360px]:text-[15px] min-[400px]:text-base min-[480px]:text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight whitespace-nowrap truncate drop-shadow-sm"
              title="คลังสื่อดิจิทัล สำนักประชาสัมพันธ์และสื่อสารองค์กร"
            >
              คลังสื่อดิจิทัล สำนักประชาสัมพันธ์และสื่อสารองค์กร
            </h2>
          </div>

          {/* COMPREHENSIVE SEARCH BAR (เน้นการ Search ที่สมบูรณ์เป็นหลัก) */}
          <div className="w-full sm:w-auto flex items-center">
            <div className="relative w-full sm:w-[320px] lg:w-[380px]">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาคลิป สารคดี อินโฟกราฟิก หรือหัวข้อข่าว..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#061430]/90 border border-cyan-500/35 focus:border-cyan-300 focus:outline-none text-xs sm:text-sm text-white placeholder-slate-400 shadow-inner transition-all focus:ring-4 focus:ring-cyan-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="ล้างข้อความค้นหา"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unified 2-Row Hi-Tech Video Wall (พื้นหลังสีเดียวกับส่วนนี้ ไม่แยกสี) */}
      <div className="relative w-full select-none p-1 sm:p-1.5 space-y-1 sm:space-y-1.5">
        {/* ROW 1: Multi-Resolution Array (Wide & Diverse Resolutions) */}
        <div className="relative group/row1">
          {/* Floating Left Arrow for Row 1 */}
          <button
            type="button"
            onClick={() => handleScrollRow(row1Ref, 'left')}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-[#05112c]/95 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-400/40 shadow-xl backdrop-blur-md transition-all active:scale-90 cursor-pointer opacity-80 sm:opacity-0 group-hover/row1:opacity-100"
            title="เลื่อนซ้ายแถวที่ 1"
            aria-label="เลื่อนซ้ายแถวที่ 1"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Floating Right Arrow for Row 1 */}
          <button
            type="button"
            onClick={() => handleScrollRow(row1Ref, 'right')}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-[#05112c]/95 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-400/40 shadow-xl backdrop-blur-md transition-all active:scale-90 cursor-pointer opacity-80 sm:opacity-0 group-hover/row1:opacity-100"
            title="เลื่อนขวาแถวที่ 1"
            aria-label="เลื่อนขวาแถวที่ 1"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Scroll Track Row 1 */}
          <div
            ref={row1Ref}
            className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scroll-smooth snap-x px-1 py-0.5 no-scrollbar cursor-grab active:cursor-grabbing touch-pan-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayRow1.length > 0 ? (
              displayRow1.map((work) => {
                const resConfig = getResolutionConfig(work);
                return (
                  <div
                    key={`r1-${work.id}`}
                    onClick={() => handleOpenCard(work)}
                    className={`group relative shrink-0 snap-start rounded-lg sm:rounded-xl overflow-hidden cursor-pointer bg-slate-950 border border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500 hover:ring-2 hover:ring-blue-400/80 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:z-10 ${resConfig.containerClass}`}
                    title={`คลิกเปิดวิดีโอทันที: ${work.title}`}
                  >
                    {/* Clip Image / Video Preview with 10s auto-movement */}
                    <div className="relative w-full h-full overflow-hidden bg-slate-950">
                      <img
                        src={work.imageUrl}
                        alt={work.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover animate-clip-10s"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/src/assets/images/sai_audit_hero_1791689796943.jpg';
                        }}
                      />

                      {/* Subtle Resolution Tag at top right */}
                      <span className={`absolute top-1 sm:top-2 right-1 sm:right-2 z-10 px-1 sm:px-1.5 py-0.5 rounded text-[7.5px] sm:text-[9px] font-bold shadow-sm ${resConfig.badgeColor}`}>
                        {resConfig.badge}
                      </span>

                      {/* Card Text: ONLY Clip Title at the bottom */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-transparent pt-4 sm:pt-8 pb-1.5 sm:pb-2.5 px-1.5 sm:px-2.5 pointer-events-none">
                        <h3 className="text-[10px] sm:text-[13px] font-bold text-white drop-shadow line-clamp-2 leading-tight sm:leading-snug group-hover:text-amber-300 transition-colors">
                          {work.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center text-slate-400 text-sm w-full">
                ไม่พบสื่อที่ตรงกับคำค้นหา
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: Vertical Wall Array (แถวล่างชิดแถวบนให้ดูเป็นแผงเดียวต่อเนื่อง) */}
        {displayRow2.length > 0 && (
          <div className="relative group/row2">
            {/* Floating Left Arrow for Row 2 */}
            <button
              type="button"
              onClick={() => handleScrollRow(row2Ref, 'left')}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-[#05112c]/95 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-400/40 shadow-xl backdrop-blur-md transition-all active:scale-90 cursor-pointer opacity-80 sm:opacity-0 group-hover/row2:opacity-100"
              title="เลื่อนซ้ายแถวที่ 2"
              aria-label="เลื่อนซ้ายแถวที่ 2"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Floating Right Arrow for Row 2 */}
            <button
              type="button"
              onClick={() => handleScrollRow(row2Ref, 'right')}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-[#05112c]/95 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-400/40 shadow-xl backdrop-blur-md transition-all active:scale-90 cursor-pointer opacity-80 sm:opacity-0 group-hover/row2:opacity-100"
              title="เลื่อนขวาแถวที่ 2"
              aria-label="เลื่อนขวาแถวที่ 2"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Scroll Track Row 2: Placed right against Row 1 with gap-1 sm:gap-1.5 */}
            <div
              ref={row2Ref}
              className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scroll-smooth snap-x px-1 py-0.5 no-scrollbar cursor-grab active:cursor-grabbing touch-pan-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayRow2.map((work) => {
                return (
                  <div
                    key={`r2-${work.id}`}
                    onClick={() => handleOpenCard(work)}
                    className="group relative shrink-0 snap-start rounded-md sm:rounded-xl overflow-hidden cursor-pointer bg-slate-950 border border-slate-800 shadow-sm hover:shadow-xl hover:border-rose-500 hover:ring-2 hover:ring-rose-400/80 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:z-10 w-[88px] sm:w-[170px] h-[153px] sm:h-[300px]"
                    title={`คลิกเปิดวิดีโอทันที: ${work.title}`}
                  >
                    <div className="relative w-full h-full overflow-hidden bg-slate-950">
                      <img
                        src={work.imageUrl}
                        alt={work.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover animate-clip-10s"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/src/assets/images/sai_video_broadcast_1791791820641.jpg';
                        }}
                      />

                      {/* Resolution Tag at top right */}
                      <span className="absolute top-1 sm:top-2 right-1 sm:right-2 z-10 px-1 sm:px-1.5 py-0.5 rounded text-[7.5px] sm:text-[9px] font-bold shadow-sm bg-rose-500/95 text-white">
                        {work.badge || '📱 9:16 Reel'}
                      </span>

                      {/* Card Text: ONLY Clip Title at the bottom */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-transparent pt-4 sm:pt-8 pb-1.5 sm:pb-2.5 px-1.5 sm:px-2.5 pointer-events-none">
                        <h3 className="text-[10px] sm:text-[13px] font-bold text-white drop-shadow line-clamp-2 leading-tight sm:leading-snug group-hover:text-rose-300 transition-colors">
                          {work.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
        {/* Empty state when search yields no result */}
        {filteredWorks.length === 0 && (
          <div className="p-8 text-center max-w-md mx-auto space-y-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">ไม่พบสื่อที่ตรงกับคำค้นหา "{searchQuery}"</h4>
            <p className="text-xs text-slate-500">
              ลองค้นหาด้วยคำอื่น เช่น วิดีโอ, สารคดี, อินโฟกราฟิก หรือกดปุ่มด้านล่างเพื่อแสดงทั้งหมด
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
              }}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              ล้างการค้นหาและแสดงทั้งหมด
            </button>
          </div>
        )}

      {/* FLOATING VIDEO & FULL INFORMATION MODAL (แชร์ได้ ข้อมูลครบถ้วน แบบลอยขึ้นมา) */}
      {activeModalWork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-[#080d1d] border border-amber-400/40 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="px-4 py-3 bg-[#050916] border-b border-amber-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getResolutionConfig(activeModalWork).badgeColor}`}>
                  {getResolutionConfig(activeModalWork).badge}
                </span>
                <span className="text-xs font-medium text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-400/30">
                  {activeModalWork.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 hidden sm:inline">กด ESC หรือคลิกเพื่อปิด</span>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Player / Media Display Stage */}
            <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
              {getYouTubeEmbedUrl(activeModalWork.linkUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeModalWork.linkUrl) || ''}
                  title={activeModalWork.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                /* Interactive Video / High-Res Media Player */
                <div className="relative w-full h-full flex items-center justify-center group/player">
                  <img
                    src={activeModalWork.imageUrl}
                    alt={activeModalWork.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

                  {/* Play / Pause Interactive Center Overlay */}
                  <button
                    type="button"
                    onClick={() => setModalVideoPlaying(!modalVideoPlaying)}
                    className="w-16 h-16 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.7)] hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                    title={modalVideoPlaying ? 'หยุดเล่นชั่วคราว' : 'เล่นวิดีโอ'}
                  >
                    {modalVideoPlaying ? (
                      <Pause className="w-7 h-7 fill-slate-950" />
                    ) : (
                      <Play className="w-7 h-7 fill-slate-950 translate-x-0.5" />
                    )}
                  </button>

                  {/* Player Controls Bar */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200 z-10">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] bg-black/60 px-2 py-0.5 rounded border border-white/10">
                        {activeModalWork.duration || '02:30'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalMuted(!modalMuted)}
                        className="p-1 rounded bg-black/50 hover:bg-black/80 text-white cursor-pointer"
                        title={modalMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
                      >
                        {modalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>

                    <a
                      href={activeModalWork.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors shadow-sm cursor-pointer"
                    >
                      <span>เปิดเต็มจอ / ต้นฉบับ</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Comprehensive Information Details (ข้อมูลที่ครบถ้วน) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white leading-snug">
                  {activeModalWork.title}
                </h3>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-300 mt-2.5 pb-3 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>เผยแพร่: {activeModalWork.publishDate}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ยอดรับชม {activeModalWork.views} ครั้ง</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeModalWork.creator || 'สำนักประชาสัมพันธ์และสื่อสารองค์กร สตง.'}</span>
                  </span>
                </div>
              </div>

              {/* Full Description / Fact Sheet */}
              <div className="bg-[#050e26]/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>สาระสำคัญและรายละเอียดของสื่อประชาสัมพันธ์</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {activeModalWork.description}
                </p>
              </div>

              {/* Share & Actions Toolbar (แชร์ได้) */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300 mr-1 flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    แชร์:
                  </span>

                  {/* LINE Share */}
                  <button
                    type="button"
                    onClick={() => handleShareDirect('line')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00B900]/20 hover:bg-[#00B900]/30 text-[#00E500] border border-[#00B900]/40 text-xs font-semibold transition-colors cursor-pointer"
                    title="แชร์ไปยัง LINE"
                  >
                    <span>LINE</span>
                  </button>

                  {/* Facebook Share */}
                  <button
                    type="button"
                    onClick={() => handleShareDirect('facebook')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#4599FF] border border-[#1877F2]/40 text-xs font-semibold transition-colors cursor-pointer"
                    title="แชร์ไปยัง Facebook"
                  >
                    <span>Facebook</span>
                  </button>

                  {/* X (Twitter) Share */}
                  <button
                    type="button"
                    onClick={() => handleShareDirect('twitter')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    title="แชร์ไปยัง X (Twitter)"
                  >
                    <span>X</span>
                  </button>

                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={() => handleShareDirect('copy_link')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-semibold transition-colors cursor-pointer"
                    title="คัดลอกลิงก์"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">คัดลอกแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        <span>คัดลอกลิงก์</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShareItem(activeModalWork)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>แชร์เพิ่มเติม</span>
                  </button>

                  <a
                    href={activeModalWork.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <span>เปิดชมสื่อต้นฉบับ</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Universal ShareModal for extended sharing */}
      <ShareModal
        isOpen={!!shareItem}
        onClose={() => setShareItem(null)}
        item={shareItem}
      />
    </section>
  );
};
