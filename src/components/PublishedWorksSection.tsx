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
  Search,
  LayoutGrid,
  BarChart3,
  Camera,
  FileText,
  ArrowRight
} from 'lucide-react';
import { PublishedWork } from '../types';
import { ShareModal } from './ShareModal';
import { playDigitalSound } from '../utils/audioEffects';
import { recordShareEvent } from '../utils/analytics';
import { useSiteTheme } from '../contexts/ThemeContext';

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

type MediaGroupKey = 'video' | 'short' | 'infographic' | 'photo' | 'report';

interface MediaGroupConfig {
  key: MediaGroupKey;
  label: string;
  shortLabel: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  darkBadge: string;
  cleanBadge: string;
  darkTabActive: string;
  cleanTabActive: string;
  accentDot: string;
  ringHover: string;
}

const MEDIA_GROUP_CONFIGS: MediaGroupConfig[] = [
  {
    key: 'video',
    label: 'วิดีโอ & สารคดี',
    shortLabel: 'วิดีโอ & สารคดี',
    description: 'คลิปข่าว รายการพิเศษ และสารคดีความละเอียดสูง',
    Icon: Film,
    darkBadge: 'bg-sky-500/90 text-white border-sky-300/50',
    cleanBadge: 'bg-sky-600 text-white border-sky-500',
    darkTabActive: 'bg-sky-500/25 border-sky-400 text-sky-200 shadow-[0_0_16px_rgba(56,189,248,0.3)]',
    cleanTabActive: 'bg-sky-600 border-sky-600 text-white shadow-md',
    accentDot: 'bg-sky-400',
    ringHover: 'hover:border-sky-400 hover:ring-sky-400/75',
  },
  {
    key: 'short',
    label: 'คลิปสั้นแนวตั้ง (Reels / Shorts)',
    shortLabel: 'คลิปสั้น 9:16',
    description: 'คลิปสั้นกระชับ 1 นาที ดูง่ายผ่านสมาร์ทโฟน',
    Icon: Smartphone,
    darkBadge: 'bg-rose-500/90 text-white border-rose-300/50',
    cleanBadge: 'bg-rose-600 text-white border-rose-500',
    darkTabActive: 'bg-rose-500/25 border-rose-400 text-rose-200 shadow-[0_0_16px_rgba(244,63,94,0.3)]',
    cleanTabActive: 'bg-rose-600 border-rose-600 text-white shadow-md',
    accentDot: 'bg-rose-400',
    ringHover: 'hover:border-rose-400 hover:ring-rose-400/75',
  },
  {
    key: 'infographic',
    label: 'อินโฟกราฟิก (Infographic)',
    shortLabel: 'อินโฟกราฟิก',
    description: 'แผนภาพสรุปข้อมูลสถิติและสาระสำคัญเข้าใจง่าย',
    Icon: BarChart3,
    darkBadge: 'bg-emerald-500/90 text-white border-emerald-300/50',
    cleanBadge: 'bg-emerald-600 text-white border-emerald-500',
    darkTabActive: 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.3)]',
    cleanTabActive: 'bg-emerald-600 border-emerald-600 text-white shadow-md',
    accentDot: 'bg-emerald-400',
    ringHover: 'hover:border-emerald-400 hover:ring-emerald-400/75',
  },
  {
    key: 'photo',
    label: 'ข่าวภาพนิ่ง (Photo News)',
    shortLabel: 'ข่าวภาพนิ่ง',
    description: 'ภาพชุดกิจกรรม ภารกิจผู้ตรวจการ และเหตุการณ์สำคัญ',
    Icon: Camera,
    darkBadge: 'bg-amber-500 text-slate-950 border-amber-300/70',
    cleanBadge: 'bg-amber-500 text-slate-950 border-amber-400',
    darkTabActive: 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.3)]',
    cleanTabActive: 'bg-amber-500 border-amber-500 text-slate-950 shadow-md',
    accentDot: 'bg-amber-400',
    ringHover: 'hover:border-amber-400 hover:ring-amber-400/75',
  },
  {
    key: 'report',
    label: 'รายงาน & เอกสาร',
    shortLabel: 'รายงาน & เอกสาร',
    description: 'เอกสารเผยแพร่ คู่มือ และรายงานผลการตรวจสอบ',
    Icon: FileText,
    darkBadge: 'bg-indigo-500/90 text-white border-indigo-300/50',
    cleanBadge: 'bg-indigo-600 text-white border-indigo-500',
    darkTabActive: 'bg-indigo-500/25 border-indigo-400 text-indigo-200 shadow-[0_0_16px_rgba(99,102,241,0.3)]',
    cleanTabActive: 'bg-indigo-600 border-indigo-600 text-white shadow-md',
    accentDot: 'bg-indigo-400',
    ringHover: 'hover:border-indigo-400 hover:ring-indigo-400/75',
  },
];

const classifyWorkMediaGroup = (work: PublishedWork): MediaGroupKey => {
  const cat = (work.category || '').toLowerCase();
  const badge = (work.badge || '').toLowerCase();
  if (work.mediaType === 'report' || cat.includes('รายงาน') || cat.includes('เอกสาร')) {
    return 'report';
  }
  if (work.mediaType === 'infographic' || cat.includes('อินโฟกราฟิก') || badge.includes('infographic')) {
    return 'infographic';
  }
  if (work.mediaType === 'photo' || cat.includes('ภาพนิ่ง')) {
    return 'photo';
  }
  if (
    work.resolution === '9:16' ||
    badge.includes('9:16') ||
    badge.includes('reel') ||
    badge.includes('short')
  ) {
    return 'short';
  }
  return 'video';
};

export const PublishedWorksSection: React.FC<PublishedWorksSectionProps> = ({ works }) => {
  const { isClean } = useSiteTheme();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'all' | MediaGroupKey>('all');
  const [activeModalWork, setActiveModalWork] = useState<PublishedWork | null>(null);
  const [shareItem, setShareItem] = useState<PublishedWork | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [modalVideoPlaying, setModalVideoPlaying] = useState<boolean>(true);
  const [modalMuted, setModalMuted] = useState<boolean>(false);

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const searchedWorks = works.filter((work) => {
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

  const groupedWorks: Record<MediaGroupKey, PublishedWork[]> = {
    video: [],
    short: [],
    infographic: [],
    photo: [],
    report: [],
  };

  searchedWorks.forEach((work) => {
    groupedWorks[classifyWorkMediaGroup(work)].push(work);
  });

  const filteredWorks =
    selectedType === 'all' ? searchedWorks : groupedWorks[selectedType] || [];

  const handleScrollShelf = (key: string, direction: 'left' | 'right') => {
    playDigitalSound('click');
    const el = rowRefs.current[key];
    if (el) {
      el.scrollBy({
        left: direction === 'left' ? -380 : 380,
        behavior: 'smooth',
      });
    }
  };

  const handleOpenCard = (work: PublishedWork) => {
    playDigitalSound('click');
    let targetUrl = work.linkUrl?.trim() || '';
    if (targetUrl && targetUrl !== '#' && !targetUrl.startsWith('#')) {
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = `https://${targetUrl}`;
      }
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (targetUrl.startsWith('#')) {
      const el = document.querySelector(targetUrl);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
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
      className={`relative pt-12 sm:pt-16 pb-14 sm:pb-20 w-full border-y-2 overflow-hidden scroll-mt-24 transition-colors duration-300 ${
        isClean
          ? 'bg-gradient-to-b from-[#faf4e4] via-[#fdf9ec] to-[#f3e7c8] border-[#d4af37]/60 shadow-[0_14px_44px_rgba(161,118,22,0.09)] text-slate-900'
          : 'bg-gradient-to-b from-[#061433] via-[#040e26] to-[#020718] border-cyan-500/25 shadow-[0_20px_70px_rgba(0,0,0,0.85)] text-slate-100'
      }`}
    >
      {/* Top Accent Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2.5px] z-10 ${
          isClean
            ? 'bg-gradient-to-r from-[#a67c00] via-[#f1d57e] to-[#a67c00]'
            : 'bg-gradient-to-r from-transparent via-cyan-400/80 via-amber-400/70 to-transparent shadow-[0_0_15px_rgba(56,189,248,0.4)]'
        }`}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 h-[1.5px] pointer-events-none ${
          isClean
            ? 'bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent'
            : 'bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent'
        }`}
      />

      {/* SUBTLE DIGITAL MEDIA ARCHIVE BACKGROUND */}
      {isClean ? (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(720px 420px at 18% 22%, rgba(212, 175, 55, 0.11), transparent 72%), radial-gradient(660px 380px at 84% 72%, rgba(255, 255, 255, 0.85), transparent 72%)',
            }}
          />
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.22]"
            preserveAspectRatio="none"
            viewBox="0 0 1440 700"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M-40 190 C 280 260, 620 120, 980 210 C 1220 270, 1380 180, 1500 220" stroke="#d4bd83" strokeWidth="1.6" strokeOpacity="0.6" />
            <path d="M-40 530 C 310 470, 680 590, 1080 500 C 1280 455, 1400 530, 1500 490" stroke="#dcc998" strokeWidth="1.4" strokeOpacity="0.55" />
          </svg>
        </div>
      ) : (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
          <div className="absolute inset-0 bg-digital-grid opacity-15" />

          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="refinedMediaPattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.4" />
                <circle cx="60" cy="0" r="1" fill="#38bdf8" fillOpacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#refinedMediaPattern)" />
          </svg>

          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(600px 350px at 32% 8%, rgba(8, 145, 178, 0.12), transparent 72%), radial-gradient(650px 360px at 72% 52%, rgba(29, 78, 216, 0.14), transparent 74%), radial-gradient(550px 320px at 36% 92%, rgba(67, 56, 202, 0.10), transparent 72%), radial-gradient(400px 260px at 90% 35%, rgba(245, 158, 11, 0.08), transparent 70%)',
            }}
          />
        </div>
      )}

      {/* Header & Comprehensive Search Container */}
      <div className="relative w-full max-w-[1920px] 2xl:max-w-[2400px] 3xl:max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mx-auto mb-4 sm:mb-6">
        {/* Top Header & Search Bar Row */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-5 pb-3 border-b ${
            isClean ? 'border-[#d4af37]/45' : 'border-cyan-500/25'
          }`}
        >
          <div className="w-full sm:w-auto overflow-hidden">
            <h2
              className={`text-base min-[360px]:text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight whitespace-nowrap truncate drop-shadow-sm ${
                isClean ? 'text-slate-900' : 'text-white'
              }`}
              title="คลังสื่อดิจิทัล สำนักประชาสัมพันธ์และสื่อสารองค์กร"
            >
              คลังสื่อดิจิทัล สำนักประชาสัมพันธ์และสื่อสารองค์กร
            </h2>
          </div>

          {/* COMPREHENSIVE SEARCH BAR */}
          <div className="w-full sm:w-auto flex items-center">
            <div className="relative w-full sm:w-[320px] lg:w-[380px]">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className={`w-4 h-4 ${isClean ? 'text-[#8a5d00]' : 'text-cyan-400'}`} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาคลิป สารคดี อินโฟกราฟิก หรือหัวข้อข่าว..."
                className={`w-full pl-10 pr-9 py-2.5 rounded-xl border focus:outline-none text-sm shadow-inner transition-all focus:ring-4 ${
                  isClean
                    ? 'bg-[#fffdf9] border-[#d4af37]/60 focus:border-[#b8860b] text-slate-900 placeholder-slate-500 focus:ring-[#d4af37]/20'
                    : 'bg-[#061430]/90 border-cyan-500/35 focus:border-cyan-300 text-white placeholder-slate-400 focus:ring-cyan-500/20'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors cursor-pointer ${
                    isClean ? 'text-[#8a5d00] hover:text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="ล้างข้อความค้นหา"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MEDIA TYPE FILTER BAR (แยกประเภทสื่อชัดเจน) */}
        <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => {
              playDigitalSound('tab');
              setSelectedType('all');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              selectedType === 'all'
                ? isClean
                  ? 'bg-gradient-to-r from-[#d4af37] via-[#e7c55c] to-[#c5961b] border-[#b8860b] text-slate-950 shadow-md'
                  : 'bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.35)]'
                : isClean
                  ? 'bg-[#fffdf9] border-[#d4af37]/55 text-slate-800 hover:bg-[#fcf6e5] hover:border-[#b8860b]'
                  : 'bg-[#071535]/90 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400/50'
            }`}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            <span>ทั้งหมดแยกตามประเภท</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono font-extrabold ${
                selectedType === 'all'
                  ? isClean
                    ? 'bg-slate-950/15 text-slate-950'
                    : 'bg-slate-950/20 text-slate-950'
                  : isClean
                    ? 'bg-[#f6ebd0] text-[#7a5000]'
                    : 'bg-slate-800 text-slate-300'
              }`}
            >
              {searchedWorks.length}
            </span>
          </button>

          {MEDIA_GROUP_CONFIGS.map((group) => {
            const count = groupedWorks[group.key].length;
            if (group.key === 'report' && count === 0) return null;
            const IconComp = group.Icon;
            const isActive = selectedType === group.key;

            return (
              <button
                key={group.key}
                type="button"
                onClick={() => {
                  playDigitalSound('tab');
                  setSelectedType(group.key);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? isClean
                      ? group.cleanTabActive
                      : group.darkTabActive
                    : isClean
                      ? 'bg-[#fffdf9] border-[#d4af37]/55 text-slate-800 hover:bg-[#fcf6e5] hover:border-[#b8860b]'
                      : 'bg-[#071535]/90 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400/50'
                }`}
              >
                <IconComp className="w-4 h-4 shrink-0" />
                <span>{group.shortLabel}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono font-extrabold ${
                    isActive
                      ? 'bg-white/20 text-current'
                      : isClean
                        ? 'bg-[#f6ebd0] text-[#7a5000]'
                        : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MEDIA ARCHIVE SHELVES BY TYPE */}
      <div className="relative w-full max-w-[1920px] 2xl:max-w-[2400px] 3xl:max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mx-auto space-y-6 sm:space-y-8 select-none">
        {selectedType === 'all' ? (
          <>
            {MEDIA_GROUP_CONFIGS.map((group) => {
              const items = groupedWorks[group.key];
              if (items.length === 0) return null;
              const IconComp = group.Icon;
              const isVerticalShelf = group.key === 'short';

              return (
                <div
                  key={`shelf-${group.key}`}
                  className={`rounded-2xl border p-3 sm:p-4 transition-colors ${
                    isClean
                      ? 'bg-gradient-to-br from-white via-[#fdfaf2] to-[#f7efdb] border-[#d4af37]/55 shadow-[0_8px_26px_rgba(161,118,22,0.08)]'
                      : 'bg-[#051230]/85 border-cyan-500/20 shadow-lg'
                  }`}
                >
                  {/* Shelf Category Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isClean ? group.cleanBadge : group.darkBadge
                        }`}
                      >
                        <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-sm sm:text-lg font-extrabold tracking-tight ${
                              isClean ? 'text-slate-900' : 'text-white'
                            }`}
                          >
                            {group.label}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
                              isClean
                                ? 'bg-[#fff6d6] text-[#7a5000] border-[#d4af37]/70'
                                : 'bg-white/10 text-cyan-200 border-white/15'
                            }`}
                          >
                            {items.length} รายการ
                          </span>
                        </div>
                        <p className={`text-xs font-medium ${isClean ? 'text-slate-700' : 'text-slate-400'}`}>
                          {group.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playDigitalSound('tab');
                        setSelectedType(group.key);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                        isClean
                          ? 'bg-[#fffdf8] hover:bg-[#fff6d6] border-[#d4af37]/65 text-[#7a5000]'
                          : 'bg-[#081942] hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-300 hover:text-white'
                      }`}
                    >
                      <span>ดูเฉพาะหมวดนี้</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Shelf Scroll Track */}
                  <div className="relative group/shelf">
                    <button
                      type="button"
                      onClick={() => handleScrollShelf(group.key, 'left')}
                      className={`absolute left-1.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border shadow-lg backdrop-blur-md transition-all active:scale-90 cursor-pointer opacity-85 sm:opacity-0 group-hover/shelf:opacity-100 ${
                        isClean
                          ? 'bg-[#fffdf8]/95 hover:bg-[#d4af37] text-[#8a5d00] hover:text-slate-950 border-[#d4af37]/75'
                          : 'bg-[#05112c]/95 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border-cyan-400/40'
                      }`}
                      title={`เลื่อนซ้าย ${group.label}`}
                      aria-label={`เลื่อนซ้าย ${group.label}`}
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleScrollShelf(group.key, 'right')}
                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border shadow-lg backdrop-blur-md transition-all active:scale-90 cursor-pointer opacity-85 sm:opacity-0 group-hover/shelf:opacity-100 ${
                        isClean
                          ? 'bg-[#fffdf8]/95 hover:bg-[#d4af37] text-[#8a5d00] hover:text-slate-950 border-[#d4af37]/75'
                          : 'bg-[#05112c]/95 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border-cyan-400/40'
                      }`}
                      title={`เลื่อนขวา ${group.label}`}
                      aria-label={`เลื่อนขวา ${group.label}`}
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <div
                      ref={(el) => {
                        rowRefs.current[group.key] = el;
                      }}
                      className="flex items-stretch gap-2.5 sm:gap-3.5 overflow-x-auto overflow-y-hidden overscroll-y-auto scroll-smooth snap-x py-1 no-scrollbar cursor-grab active:cursor-grabbing touch-auto"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {items.map((work) => {
                        const resConfig = getResolutionConfig(work);
                        const cardSizeClass = isVerticalShelf
                          ? 'w-[128px] sm:w-[175px] h-[225px] sm:h-[305px]'
                          : group.key === 'infographic' || group.key === 'photo'
                            ? 'w-[220px] sm:w-[290px] h-[155px] sm:h-[205px]'
                            : resConfig.containerClass;

                        return (
                          <div
                            key={`${group.key}-${work.id}`}
                            onClick={() => handleOpenCard(work)}
                            className={`group relative shrink-0 snap-start rounded-xl overflow-hidden cursor-pointer bg-slate-950 border shadow-sm hover:shadow-xl hover:ring-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:z-10 ${
                              isClean ? 'border-[#d4af37]/60' : 'border-slate-800'
                            } ${group.ringHover} ${cardSizeClass}`}
                            title={`คลิกเปิดดู: ${work.title}`}
                          >
                            <div className="relative w-full h-full overflow-hidden bg-slate-950 transform-gpu">
                              <img
                                src={work.imageUrl}
                                alt={work.title}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 transform-gpu"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = '/assets/images/sai_audit_hero_1791689796943.jpg';
                                }}
                              />

                              {/* Top-Left Media Type Tag */}
                              <span
                                className={`absolute top-1.5 left-1.5 z-20 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold border shadow-sm ${
                                  isClean ? group.cleanBadge : group.darkBadge
                                }`}
                              >
                                <IconComp className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate max-w-[95px]">{group.shortLabel}</span>
                              </span>

                              {/* Top-Right Resolution Tag */}
                              <span
                                className={`hidden sm:inline-block absolute top-1.5 right-1.5 z-20 px-1.5 py-0.5 rounded text-[9px] font-bold shadow-sm ${resConfig.badgeColor}`}
                              >
                                {resConfig.badge}
                              </span>

                              {/* Card Title Bottom Overlay */}
                              <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent pt-6 pb-2 px-2 sm:px-2.5 pointer-events-none transform-gpu">
                                <div className="flex items-end justify-between gap-1.5">
                                  <h4 className="text-xs sm:text-sm font-bold text-white drop-shadow line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors flex-1">
                                    {work.title}
                                  </h4>
                                  <div className="shrink-0 p-1 rounded-md bg-white/15 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink className="w-3 h-3" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          (() => {
            const activeGroup =
              MEDIA_GROUP_CONFIGS.find((g) => g.key === selectedType) || MEDIA_GROUP_CONFIGS[0];
            const ActiveIcon = activeGroup.Icon;
            const isVerticalGrid = activeGroup.key === 'short';

            return (
              <div
                className={`rounded-2xl border p-4 sm:p-5 transition-colors ${
                  isClean
                    ? 'bg-gradient-to-br from-white via-[#fdfaf2] to-[#f7efdb] border-[#d4af37]/60 shadow-[0_8px_28px_rgba(161,118,22,0.09)]'
                    : 'bg-[#051230]/85 border-cyan-500/25 shadow-lg'
                }`}
              >
                <div className={`flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b ${isClean ? 'border-[#d4af37]/40' : 'border-slate-500/20'}`}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        isClean ? activeGroup.cleanBadge : activeGroup.darkBadge
                      }`}
                    >
                      <ActiveIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-base sm:text-xl font-extrabold ${isClean ? 'text-slate-900' : 'text-white'}`}>
                        {activeGroup.label} ({filteredWorks.length} รายการ)
                      </h3>
                      <p className={`text-xs sm:text-sm ${isClean ? 'text-slate-700' : 'text-slate-300'}`}>
                        {activeGroup.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playDigitalSound('tab');
                      setSelectedType('all');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                      isClean
                        ? 'bg-[#fffdf8] hover:bg-[#fff6d6] border-[#d4af37]/70 text-[#7a5000]'
                        : 'bg-[#081942] hover:bg-cyan-500/20 border-cyan-500/35 text-cyan-200'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>ดูแยกทุกประเภท</span>
                  </button>
                </div>

                {filteredWorks.length > 0 && (
                  <div
                    className={`grid gap-3 sm:gap-4 ${
                      isVerticalGrid
                        ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    }`}
                  >
                    {filteredWorks.map((work) => {
                      const resConfig = getResolutionConfig(work);
                      return (
                        <div
                          key={`filtered-${work.id}`}
                          onClick={() => handleOpenCard(work)}
                          className={`group relative rounded-xl overflow-hidden cursor-pointer bg-slate-950 border shadow-sm hover:shadow-xl hover:ring-2 transition-all duration-200 hover:scale-[1.01] ${
                            isClean ? 'border-[#d4af37]/60' : 'border-slate-800'
                          } ${activeGroup.ringHover} ${isVerticalGrid ? 'aspect-[9/16]' : 'aspect-video'}`}
                          title={`คลิกเปิดดู: ${work.title}`}
                        >
                          <img
                            src={work.imageUrl}
                            alt={work.title}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 transform-gpu"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '/assets/images/sai_audit_hero_1791689796943.jpg';
                            }}
                          />
                          <span
                            className={`absolute top-2 left-2 z-20 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border shadow-sm ${
                              isClean ? activeGroup.cleanBadge : activeGroup.darkBadge
                            }`}
                          >
                            <ActiveIcon className="w-3 h-3 shrink-0" />
                            <span>{activeGroup.shortLabel}</span>
                          </span>
                          <span
                            className={`absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm ${resConfig.badgeColor}`}
                          >
                            {resConfig.badge}
                          </span>
                          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent pt-8 pb-2.5 px-3 pointer-events-none">
                            <div className="flex items-end justify-between gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-white drop-shadow line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors flex-1">
                                {work.title}
                              </h4>
                              <ExternalLink className="w-3.5 h-3.5 text-cyan-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()
        )}

        {/* Empty state when search or filter yields no result */}
        {filteredWorks.length === 0 && (
          <div
            className={`p-8 text-center max-w-md mx-auto space-y-3 rounded-2xl border shadow-sm ${
              isClean
                ? 'bg-gradient-to-br from-white via-[#fcf9f2] to-[#f7efdb] border-[#d4af37]/60'
                : 'bg-[#071535] border-cyan-500/30'
            }`}
          >
            <Search className={`w-8 h-8 mx-auto ${isClean ? 'text-[#8a5d00]' : 'text-slate-400'}`} />
            <h4 className={`text-base font-bold ${isClean ? 'text-slate-900' : 'text-white'}`}>
              ไม่พบสื่อที่ตรงกับคำค้นหา
            </h4>
            <p className={`text-sm ${isClean ? 'text-slate-700' : 'text-slate-300'}`}>
              ลองค้นหาด้วยคำอื่น หรือแสดงสื่อทุกประเภทในคลังสื่อดิจิทัล
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all cursor-pointer ${
                isClean
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#c5961b] hover:brightness-105 text-slate-950 border border-[#b8860b]'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              แสดงสื่อทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* FLOATING VIDEO & FULL INFORMATION MODAL (แชร์ได้ ข้อมูลครบถ้วน แบบลอยขึ้นมา) */}
      {activeModalWork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div
            className={`relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border-2 shadow-2xl overflow-hidden ${
              isClean
                ? 'bg-[#fffdf8] border-[#d4af37]/75 text-slate-900'
                : 'bg-[#080d1d] border-amber-400/40 ring-1 ring-white/10'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div
              className={`px-4 py-3 border-b flex items-center justify-between gap-3 ${
                isClean ? 'bg-[#fcf7ea] border-[#d4af37]/45' : 'bg-[#050916] border-amber-500/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getResolutionConfig(activeModalWork).badgeColor}`}>
                  {getResolutionConfig(activeModalWork).badge}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                    isClean
                      ? 'text-[#7a5000] bg-[#fff6d6] border-[#d4af37]/70'
                      : 'text-amber-300 bg-amber-500/10 border-amber-400/30'
                  }`}
                >
                  {activeModalWork.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs hidden sm:inline ${isClean ? 'text-slate-600' : 'text-slate-400'}`}>
                  กด ESC หรือคลิกเพื่อปิด
                </span>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isClean
                      ? 'text-[#8a5d00] hover:text-slate-950 hover:bg-[#f4dc94]/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
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

            {/* Comprehensive Information Details */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div>
                <h3 className={`text-lg sm:text-xl font-extrabold leading-snug ${isClean ? 'text-slate-900' : 'text-white'}`}>
                  {activeModalWork.title}
                </h3>

                {/* Metadata Row */}
                <div
                  className={`flex flex-wrap items-center gap-3 sm:gap-4 text-xs mt-2.5 pb-3 border-b ${
                    isClean ? 'text-slate-700 border-[#d4af37]/35' : 'text-slate-300 border-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar className={`w-3.5 h-3.5 ${isClean ? 'text-[#8a5d00]' : 'text-amber-400'}`} />
                    <span>เผยแพร่: {activeModalWork.publishDate}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className={`w-3.5 h-3.5 ${isClean ? 'text-[#8a5d00]' : 'text-cyan-400'}`} />
                    <span>ยอดรับชม {activeModalWork.views} ครั้ง</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className={`w-3.5 h-3.5 ${isClean ? 'text-emerald-700' : 'text-emerald-400'}`} />
                    <span>{activeModalWork.creator || 'สำนักประชาสัมพันธ์และสื่อสารองค์กร สตง.'}</span>
                  </span>
                </div>
              </div>

              {/* Full Description / Fact Sheet */}
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isClean ? 'bg-[#fcf8ee] border-[#d4af37]/45' : 'bg-[#050e26]/80 border-slate-800'
                }`}
              >
                <div className={`flex items-center gap-1.5 text-sm font-bold ${isClean ? 'text-[#7a5000]' : 'text-amber-300'}`}>
                  <Info className={`w-4 h-4 ${isClean ? 'text-[#8a5d00]' : 'text-amber-400'}`} />
                  <span>สาระสำคัญและรายละเอียดของสื่อประชาสัมพันธ์</span>
                </div>
                <p className={`text-sm leading-relaxed ${isClean ? 'text-slate-800' : 'text-slate-200'}`}>
                  {activeModalWork.description}
                </p>
              </div>

              {/* Share & Actions Toolbar */}
              <div className={`pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t ${isClean ? 'border-[#d4af37]/35' : 'border-slate-800'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-semibold mr-1 flex items-center gap-1 ${isClean ? 'text-[#7a5000]' : 'text-slate-300'}`}>
                    <Share2 className={`w-3.5 h-3.5 ${isClean ? 'text-[#8a5d00]' : 'text-amber-400'}`} />
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
