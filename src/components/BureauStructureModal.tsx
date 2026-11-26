import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Network,
  ArrowLeft,
  ArrowRight,
  Layers,
  ChevronRight,
  Megaphone,
  Compass,
  Clapperboard,
  FolderKanban,
  UserCheck,
  Home,
  Crown,
} from 'lucide-react';
import { AppData, BureauGroupId, GroupWorkItem } from '../types';
import {
  BUREAU_EXECUTIVE_TITLE,
  BUREAU_GROUPS,
  BUREAU_SUBTITLE,
  BUREAU_TITLE,
} from '../data/bureauStructure';
import { playDigitalSound } from '../utils/audioEffects';

interface BureauStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  isAdminLoggedIn?: boolean;
  onOpenAdminGroupWorks?: () => void;
  onGroupWorkSaved?: (savedItem: GroupWorkItem) => void;
}

interface RoyalGroupTheme {
  label: string;
  cardIdleBg: string;
  cardActiveBg: string;
  cardActiveBorder: string;
  panelBg: string;
  panelBorder: string;
  summaryBg: string;
  missionCardBg: string;
  missionCardBorder: string;
  badgeBg: string;
  iconBg: string;
  numberBadgeBg: string;
  headingAccent: string;
  dotColor: string;
  ambientGlow: string;
}

const ROYAL_GROUP_THEMES: Record<'amber' | 'cyan' | 'emerald' | 'indigo', RoyalGroupTheme> = {
  amber: {
    label: 'Warm Champagne Gold',
    cardIdleBg:
      'bg-gradient-to-br from-[#fffdf7] via-[#fdf5df] to-[#f8e9c1] border-[#d4af37]/50 hover:border-[#b8860b] hover:shadow-[0_10px_28px_rgba(184,134,11,0.16)]',
    cardActiveBg:
      'bg-gradient-to-br from-[#fff9eb] via-[#faecc4] to-[#f3dc98]',
    cardActiveBorder:
      'border-2 border-[#b8860b] ring-2 ring-[#d4af37]/45 shadow-[0_16px_36px_rgba(184,134,11,0.22)]',
    panelBg:
      'bg-gradient-to-br from-[#fffdf7] via-[#fcf3db] to-[#f6e6bb]',
    panelBorder:
      'border-2 border-[#d4af37]/75 shadow-[0_20px_50px_rgba(161,118,22,0.16)]',
    summaryBg: 'bg-white/85 border-[#d4af37]/45',
    missionCardBg: 'bg-white/92 hover:bg-white',
    missionCardBorder: 'border-[#d4af37]/45 hover:border-[#b8860b]',
    badgeBg: 'bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-white border-[#a17408]',
    iconBg: 'bg-gradient-to-br from-[#fef3c7] to-[#fde68a] text-[#8a5d00] border-[#d4af37]/65',
    numberBadgeBg: 'bg-gradient-to-br from-[#c99b26] to-[#9a6f07] text-white border-[#e5c158]',
    headingAccent: 'text-[#855800]',
    dotColor: 'bg-[#b8860b]',
    ambientGlow:
      'radial-gradient(820px 520px at 18% 12%, rgba(212, 175, 55, 0.16), transparent 70%), radial-gradient(760px 500px at 88% 85%, rgba(245, 196, 81, 0.14), transparent 70%)',
  },
  cyan: {
    label: 'Royal Porcelain Sapphire',
    cardIdleBg:
      'bg-gradient-to-br from-[#f8fbff] via-[#eaf3fe] to-[#d9e9fc] border-[#d4af37]/50 hover:border-[#1d4ed8]/70 hover:shadow-[0_10px_28px_rgba(29,78,216,0.14)]',
    cardActiveBg:
      'bg-gradient-to-br from-[#f2f8ff] via-[#dfeeff] to-[#cbe2fd]',
    cardActiveBorder:
      'border-2 border-[#b8860b] ring-2 ring-[#2563eb]/35 shadow-[0_16px_36px_rgba(29,78,216,0.18)]',
    panelBg:
      'bg-gradient-to-br from-[#f7fbff] via-[#e7f1fe] to-[#d5e7fc]',
    panelBorder:
      'border-2 border-[#d4af37]/75 shadow-[0_20px_50px_rgba(30,64,175,0.14)]',
    summaryBg: 'bg-white/88 border-[#d4af37]/45',
    missionCardBg: 'bg-white/94 hover:bg-white',
    missionCardBorder: 'border-[#d4af37]/45 hover:border-[#1d4ed8]/60',
    badgeBg: 'bg-gradient-to-r from-[#1e40af] to-[#2563eb] text-white border-[#1d4ed8]',
    iconBg: 'bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] text-[#1e3a8a] border-[#d4af37]/65',
    numberBadgeBg: 'bg-gradient-to-br from-[#1d4ed8] to-[#1e3a8a] text-white border-[#93c5fd]',
    headingAccent: 'text-[#1e3a8a]',
    dotColor: 'bg-[#1d4ed8]',
    ambientGlow:
      'radial-gradient(820px 520px at 18% 12%, rgba(59, 130, 246, 0.12), transparent 70%), radial-gradient(760px 500px at 88% 85%, rgba(212, 175, 55, 0.14), transparent 70%)',
  },
  emerald: {
    label: 'Royal Celadon Jade',
    cardIdleBg:
      'bg-gradient-to-br from-[#f6fdf9] via-[#e4f8ee] to-[#cff0e0] border-[#d4af37]/50 hover:border-[#047857]/70 hover:shadow-[0_10px_28px_rgba(4,120,87,0.14)]',
    cardActiveBg:
      'bg-gradient-to-br from-[#effcf5] via-[#daf5e7] to-[#c2ecd7]',
    cardActiveBorder:
      'border-2 border-[#b8860b] ring-2 ring-[#059669]/35 shadow-[0_16px_36px_rgba(4,120,87,0.18)]',
    panelBg:
      'bg-gradient-to-br from-[#f5fcf8] via-[#e1f7ec] to-[#cbeedf]',
    panelBorder:
      'border-2 border-[#d4af37]/75 shadow-[0_20px_50px_rgba(6,95,70,0.14)]',
    summaryBg: 'bg-white/88 border-[#d4af37]/45',
    missionCardBg: 'bg-white/94 hover:bg-white',
    missionCardBorder: 'border-[#d4af37]/45 hover:border-[#047857]/60',
    badgeBg: 'bg-gradient-to-r from-[#065f46] to-[#059669] text-white border-[#047857]',
    iconBg: 'bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] text-[#064e3b] border-[#d4af37]/65',
    numberBadgeBg: 'bg-gradient-to-br from-[#059669] to-[#065f46] text-white border-[#6ee7b7]',
    headingAccent: 'text-[#065f46]',
    dotColor: 'bg-[#059669]',
    ambientGlow:
      'radial-gradient(820px 520px at 18% 12%, rgba(16, 185, 129, 0.12), transparent 70%), radial-gradient(760px 500px at 88% 85%, rgba(212, 175, 55, 0.14), transparent 70%)',
  },
  indigo: {
    label: 'Royal Pearl Amethyst',
    cardIdleBg:
      'bg-gradient-to-br from-[#faf8ff] via-[#efeaff] to-[#e1d7fd] border-[#d4af37]/50 hover:border-[#5b21b6]/70 hover:shadow-[0_10px_28px_rgba(91,33,182,0.14)]',
    cardActiveBg:
      'bg-gradient-to-br from-[#f6f2ff] via-[#e9e0fe] to-[#d9cbfb]',
    cardActiveBorder:
      'border-2 border-[#b8860b] ring-2 ring-[#7c3aed]/35 shadow-[0_16px_36px_rgba(91,33,182,0.18)]',
    panelBg:
      'bg-gradient-to-br from-[#f9f7ff] via-[#ede6fe] to-[#ded4fc]',
    panelBorder:
      'border-2 border-[#d4af37]/75 shadow-[0_20px_50px_rgba(76,29,149,0.14)]',
    summaryBg: 'bg-white/88 border-[#d4af37]/45',
    missionCardBg: 'bg-white/94 hover:bg-white',
    missionCardBorder: 'border-[#d4af37]/45 hover:border-[#5b21b6]/60',
    badgeBg: 'bg-gradient-to-r from-[#4c1d95] to-[#6d28d9] text-white border-[#5b21b6]',
    iconBg: 'bg-gradient-to-br from-[#ede9fe] to-[#ddd6fe] text-[#4c1d95] border-[#d4af37]/65',
    numberBadgeBg: 'bg-gradient-to-br from-[#6d28d9] to-[#4c1d95] text-white border-[#c4b5fd]',
    headingAccent: 'text-[#4c1d95]',
    dotColor: 'bg-[#6d28d9]',
    ambientGlow:
      'radial-gradient(820px 520px at 18% 12%, rgba(124, 58, 237, 0.11), transparent 70%), radial-gradient(760px 500px at 88% 85%, rgba(212, 175, 55, 0.14), transparent 70%)',
  },
};

function renderGroupIcon(groupId: BureauGroupId, className = 'w-5 h-5') {
  switch (groupId) {
    case 'group-media-relations':
      return <Megaphone className={className} />;
    case 'group-corp-strategy':
      return <Compass className={className} />;
    case 'group-media-production':
      return <Clapperboard className={className} />;
    case 'group-general-admin':
      return <FolderKanban className={className} />;
  }
}

export const BureauStructureModal: React.FC<BureauStructureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<BureauGroupId>('group-media-relations');
  const detailPanelRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Lock body scroll & support Escape key
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeIndex = Math.max(
    0,
    BUREAU_GROUPS.findIndex((g) => g.id === selectedGroupId)
  );
  const activeGroup = BUREAU_GROUPS[activeIndex] || BUREAU_GROUPS[0];
  const activeTheme = ROYAL_GROUP_THEMES[activeGroup.accentColor];
  const prevGroup =
    BUREAU_GROUPS[(activeIndex - 1 + BUREAU_GROUPS.length) % BUREAU_GROUPS.length];
  const nextGroup = BUREAU_GROUPS[(activeIndex + 1) % BUREAU_GROUPS.length];

  const handleSelectGroup = (groupId: BureauGroupId) => {
    playDigitalSound('select');
    setSelectedGroupId(groupId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && detailPanelRef.current) {
      setTimeout(() => {
        detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex flex-col bg-[#faf7f0] text-slate-900 animate-fadeIn overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="โครงสร้างและภารกิจสำนักประชาสัมพันธ์และสื่อสารองค์กร"
    >
      {/* Pearl White Marble Texture Backdrop (ขาวมุก หินอ่อน เรียบหรู Royal) */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundColor: '#faf7f0',
          backgroundImage: [
            activeTheme.ambientGlow,
            'radial-gradient(900px 620px at 78% 18%, rgba(255, 255, 255, 0.92), transparent 70%)',
            'radial-gradient(750px 520px at 14% 78%, rgba(240, 232, 214, 0.55), transparent 72%)',
            'linear-gradient(125deg, rgba(255,255,255,0.7) 0%, rgba(244,239,229,0.5) 36%, rgba(255,255,255,0.85) 68%, rgba(238,231,216,0.55) 100%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      {/* Subtle Translucent Marble Veining SVG Overlay */}
      <svg
        className="pointer-events-none fixed inset-0 w-full h-full z-0 opacity-[0.22]"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M-60 210 C 210 160, 380 310, 680 230 C 960 155, 1180 280, 1510 190"
          stroke="#d6c59c"
          strokeWidth="1.8"
          strokeOpacity="0.65"
        />
        <path
          d="M-40 540 C 260 610, 520 430, 860 520 C 1120 590, 1290 470, 1500 550"
          stroke="#d8ccb2"
          strokeWidth="1.5"
          strokeOpacity="0.55"
        />
        <path
          d="M220 -20 C 310 240, 440 420, 380 920"
          stroke="#e2d6bc"
          strokeWidth="1.4"
          strokeOpacity="0.5"
        />
        <path
          d="M1140 -20 C 1030 280, 1210 560, 1080 920"
          stroke="#d4c295"
          strokeWidth="1.5"
          strokeOpacity="0.5"
        />
      </svg>

      {/* Top Royal Gold Accent Hairline */}
      <div className="relative z-30 h-1 w-full bg-gradient-to-r from-[#a67c00] via-[#f1d57e] to-[#a67c00] shrink-0" />

      {/* Top Sticky Royal Pearl Header Bar */}
      <header className="relative z-20 shrink-0 bg-white/92 backdrop-blur-xl border-b-2 border-[#d4af37]/50 shadow-[0_6px_28px_rgba(161,118,22,0.10)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#fff6d6] to-[#f4dc94] border-2 border-[#d4af37]/75 flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(184,134,11,0.18)]">
              <Network className="w-5 h-5 text-[#8a5d00]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-extrabold text-slate-900 truncate tracking-tight">
                โครงสร้างและภารกิจภายใน{BUREAU_TITLE}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#8a5d00] truncate">
                {BUREAU_SUBTITLE} · 4 กลุ่มงานหลัก
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                playDigitalSound('select');
                onClose();
                if (typeof window !== 'undefined') {
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 80);
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e7c55c] to-[#c5961b] hover:from-[#e0be53] hover:to-[#d4af37] text-slate-950 border border-[#b8860b] text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-sm"
              title="กลับสู่หน้าหลัก (Home)"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playDigitalSound('blip');
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-amber-50 border border-[#d4af37]/60 text-slate-800 hover:text-slate-950 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm"
              title="ปิดหน้าต่างเต็มจอ (Esc)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">ปิดหน้าต่าง</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Scrollable Full-Screen Canvas */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9 space-y-8">
          {/* Interactive Org Chart Tree Header */}
          <section aria-label="แผนผังโครงสร้างสำนักประชาสัมพันธ์และสื่อสารองค์กร">
            {/* Root Bureau & Executive Position Node */}
            <div className="flex flex-col items-center">
              <div className="relative px-7 py-5 rounded-2xl bg-gradient-to-br from-white via-[#fcf7ea] to-[#f7ebd0] border-2 border-[#d4af37] shadow-[0_14px_38px_rgba(161,118,22,0.14)] text-center max-w-2xl w-full sm:w-auto space-y-2 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#b8860b] via-[#f1d57e] to-[#b8860b]" />
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-white text-xs sm:text-sm font-bold shadow-sm">
                  <Crown className="w-3.5 h-3.5" />
                  <span>{BUREAU_EXECUTIVE_TITLE}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {BUREAU_TITLE}
                </h3>
                <p className="text-sm sm:text-base font-medium text-slate-700">
                  เลือกกลุ่มงานด้านล่างเพื่อดูบทบาทและภารกิจสำคัญของแต่ละกลุ่มงาน
                </p>
              </div>

              {/* Royal Gold Org Chart Branch Connector Lines (Desktop) */}
              <div className="hidden lg:flex flex-col items-center w-full max-w-5xl" aria-hidden="true">
                <div className="w-[2.5px] h-6 bg-gradient-to-b from-[#b8860b] to-[#d4af37]" />
                <div className="w-[76%] h-[2.5px] bg-gradient-to-r from-[#d4af37]/75 via-[#b8860b] to-[#d4af37]/75" />
                <div className="w-full grid grid-cols-4 px-8">
                  <div className="flex justify-center"><div className="w-[2.5px] h-5 bg-[#d4af37]" /></div>
                  <div className="flex justify-center"><div className="w-[2.5px] h-5 bg-[#d4af37]" /></div>
                  <div className="flex justify-center"><div className="w-[2.5px] h-5 bg-[#d4af37]" /></div>
                  <div className="flex justify-center"><div className="w-[2.5px] h-5 bg-[#d4af37]" /></div>
                </div>
              </div>
              <div className="lg:hidden h-5" />
            </div>

            {/* 4 Bureau Group Selector Cards (Distinct Color Surface per Group + Royal Gold Trim) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {BUREAU_GROUPS.map((group) => {
                const isSelected = group.id === selectedGroupId;
                const theme = ROYAL_GROUP_THEMES[group.accentColor];

                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => handleSelectGroup(group.id)}
                    className={`group text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden ${
                      isSelected
                        ? `${theme.cardActiveBg} ${theme.cardActiveBorder} -translate-y-1`
                        : `${theme.cardIdleBg}`
                    }`}
                  >
                    {/* Royal Gold Top Accent Bar on Active Card */}
                    {isSelected && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#b8860b] via-[#f1d57e] to-[#b8860b]" />
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm ${theme.badgeBg}`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>กลุ่มงานที่ {group.order}</span>
                        </span>
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${theme.iconBg}`}>
                          {renderGroupIcon(group.id, 'w-5 h-5')}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                          {group.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-700 font-medium line-clamp-3 mt-1.5 leading-relaxed">
                          {group.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#d4af37]/35 text-xs sm:text-sm">
                      <span className="font-bold text-slate-800">
                        ภารกิจ {group.missions.length} ด้าน
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 font-extrabold transition-transform ${
                          isSelected
                            ? `${theme.headingAccent} translate-x-0.5`
                            : 'text-slate-700 group-hover:text-slate-950'
                        }`}
                      >
                        <span>{isSelected ? 'กำลังแสดง' : 'ดูภารกิจ'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Active Group Missions Showcase (Missions Only — Distinct Colored Surface + Royal Gold Trim) */}
          <section
            ref={detailPanelRef}
            className="pb-8"
            aria-label={`ภารกิจของ ${activeGroup.name}`}
          >
            <div
              className={`relative rounded-3xl p-6 sm:p-8 lg:p-10 space-y-6 transition-all duration-300 overflow-hidden ${activeTheme.panelBg} ${activeTheme.panelBorder}`}
            >
              {/* Royal Gold Top Crown Strip */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#a67c00] via-[#f1d57e] to-[#a67c00]" />

              {/* Group Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#d4af37]/40">
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div
                    className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-md ${activeTheme.iconBg}`}
                  >
                    {renderGroupIcon(activeGroup.id, 'w-7 h-7')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs sm:text-sm font-extrabold border shadow-sm ${activeTheme.badgeBg}`}
                      >
                        กลุ่มงานที่ {activeGroup.order}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-600">
                        {activeGroup.englishName}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug">
                      {activeGroup.name}
                    </h3>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/85 border border-[#d4af37]/60 text-sm sm:text-base font-extrabold text-slate-900 shadow-sm shrink-0 self-start sm:self-auto">
                  <Layers className={`w-4 h-4 ${activeTheme.headingAccent}`} />
                  <span>ภารกิจหลัก {activeGroup.missions.length} ด้าน</span>
                </div>
              </div>

              {/* Group Overview Summary */}
              <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm ${activeTheme.summaryBg}`}>
                <p className="text-sm sm:text-base lg:text-lg text-slate-800 font-medium leading-relaxed">
                  {activeGroup.summary}
                </p>
              </div>

              {/* Missions Grid (Large, High-Contrast Readable Typography) */}
              <div className="space-y-4">
                <div className={`flex items-center gap-2.5 text-base sm:text-lg font-extrabold ${activeTheme.headingAccent}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${activeTheme.dotColor}`} />
                  <span>บทบาทและภารกิจของ{activeGroup.name}</span>
                </div>

                <ol className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeGroup.missions.map((mission, idx) => {
                    const missionNumber = idx + 1;

                    return (
                      <li
                        key={idx}
                        className={`flex items-start gap-4 p-5 rounded-2xl border transition-all shadow-sm ${activeTheme.missionCardBg} ${activeTheme.missionCardBorder}`}
                      >
                        <span
                          className={`w-9 h-9 rounded-xl border text-base font-extrabold flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${activeTheme.numberBadgeBg}`}
                        >
                          {missionNumber}
                        </span>
                        <p className="text-base sm:text-[17px] text-slate-900 font-semibold leading-relaxed">
                          {mission}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Bottom Quick Navigation Between the 4 Groups */}
              <div className="pt-5 border-t border-[#d4af37]/40 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectGroup(prevGroup.id)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white border border-[#d4af37]/60 text-slate-900 text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#8a5d00]" />
                  <span>กลุ่มก่อนหน้า: {prevGroup.shortName}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectGroup(nextGroup.id)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e7c55c] to-[#c5961b] hover:from-[#e0be53] hover:to-[#d4af37] text-slate-950 border border-[#b8860b] text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer ml-auto"
                >
                  <span>กลุ่มถัดไป: {nextGroup.shortName}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
