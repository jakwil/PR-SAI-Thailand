import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HardHat,
  Shield,
  Layers,
  Activity,
  Maximize2,
  Calendar,
  Clock,
  Info,
  Radio,
  Share2,
  Scan,
  Cpu,
  Target,
  Sparkles,
  ArrowRight,
  X,
  Compass,
  MapPin,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { IncidentMilestone } from '../types';
import { playDigitalSound } from '../utils/audioEffects';
import { ShareModal } from './ShareModal';

interface BuildingIncidentSectionProps {
  timeline: IncidentMilestone[];
  onAskAiAboutIncident: () => void;
}

export const BuildingIncidentSection: React.FC<BuildingIncidentSectionProps> = ({
  timeline,
  onAskAiAboutIncident,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [shareMilestone, setShareMilestone] = useState<IncidentMilestone | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fallback safe item
  const currentItem: IncidentMilestone =
    timeline[activeIndex] ||
    timeline[0] || {
      id: 'default-tl',
      date: 'ปัจจุบัน',
      time: 'ล่าสุด',
      phase: 'รายงานสถานการณ์',
      title: 'ข้อมูลกำลังปรับปรุง',
      description: 'กำลังตรวจสอบสถานการณ์',
      status: 'ดำเนินการ',
      imageUrl: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
      technicalDetails: 'ระบบกำลังดึงข้อมูลเซนเซอร์ล่าสุด',
    };

  // Scroll into view when activeIndex changes in horizontal track
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(
        `[data-node-index="${activeIndex}"]`
      ) as HTMLElement | null;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeIndex]);

  const handlePrev = () => {
    playDigitalSound('click');
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : timeline.length - 1));
  };

  const handleNext = () => {
    playDigitalSound('click');
    setActiveIndex((prev) => (prev < timeline.length - 1 ? prev + 1 : 0));
  };

  const handleSelectNode = (idx: number, openModal: boolean = false) => {
    playDigitalSound('radar');
    setActiveIndex(idx);
    if (openModal) {
      setIsCardModalOpen(true);
    }
  };

  // Helper status styling (Royal Navy & Gold Palette)
  const getStatusStyle = (status: string) => {
    if (status.includes('เรียบร้อย') || status.includes('แล้ว')) {
      return {
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-400/40',
        text: 'text-emerald-300',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
        indicator: 'bg-emerald-400',
      };
    }
    if (status.includes('วิเคราะห์') || status.includes('ตรวจสอบ')) {
      return {
        bg: 'bg-amber-500/20',
        border: 'border-amber-400/50',
        text: 'text-amber-300',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]',
        indicator: 'bg-amber-400',
      };
    }
    // In progress / latest (Royal Gold Active Pulse)
    return {
      bg: 'bg-amber-500/25',
      border: 'border-amber-400/60',
      text: 'text-amber-200 font-bold',
      glow: 'shadow-[0_0_18px_rgba(245,158,11,0.6)]',
      indicator: 'bg-amber-400 animate-pulse',
    };
  };

  return (
    <section
      id="incident-timeline"
      className="relative py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 select-none"
    >
      {/* Ambient Royal Gold & Sapphire Background Glow */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl"
        aria-hidden="true"
      >
        <div className="absolute top-10 left-1/4 w-[600px] h-[400px] bg-gradient-to-r from-amber-500/12 via-blue-700/15 to-amber-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[350px] bg-amber-500/10 rounded-full blur-[130px]" />
      </div>

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7 pb-4 border-b border-amber-500/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-medium mb-2.5 backdrop-blur-md">
            <HardHat className="w-3.5 h-3.5 text-amber-400" />
            <span>ศูนย์ข้อมูลสถานการณ์ฉุกเฉินและวิศวกรรมโครงสร้าง สตง.</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>สถานการณ์ปัจจุบัน: เหตุการณ์อาคาร สตง. ทรุดตัว</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
              ROYAL ROADMAP
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            ติดตามข้อเท็จจริง แผนฟื้นฟูเชิงวิศวกรรมร่วมกับวิศวกรรมสถานแห่งประเทศไทย (วสท.)
            แบบ Timeline Roadmap เชื่อมโยงทุกขั้นตอนด้วยเส้นนำสัญญาณและโหนดข้อมูลสมบูรณ์
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={() => {
              playDigitalSound('select');
              onAskAiAboutIncident();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-blue-600/20 hover:from-amber-500/30 hover:to-blue-600/30 text-amber-300 border border-amber-400/50 text-xs font-semibold shadow-lg hover:shadow-amber-500/20 backdrop-blur-md transition-all cursor-pointer active:scale-95"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>สอบถาม AI เกี่ยวกับอาคาร</span>
          </button>
        </div>
      </div>

      {/* Engineering Live HUD Diagnostics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-[#041030]/90 border border-amber-500/30 shadow-inner flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[10px] font-mono text-amber-300/80">ความปลอดภัยบุคลากร</span>
            <span className="text-sm font-bold text-white">100% ปลอดภัยครบทุกคน</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#041030]/90 border border-amber-500/30 shadow-inner flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[10px] font-mono text-amber-300/80">งานตรวจเงินแผ่นดิน</span>
            <span className="text-sm font-bold text-white">100% ดำเนินการต่อเนื่อง</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#041030]/90 border border-amber-500/30 shadow-inner flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[10px] font-mono text-amber-300/80">การขยับตัว 7 วันล่าสุด</span>
            <span className="text-sm font-bold text-emerald-400">0.00 มม. (Zero Movement)</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#041030]/90 border border-amber-500/30 shadow-inner flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[10px] font-mono text-amber-300/80">โครงสร้างโหนด Roadmap</span>
            <span className="text-sm font-bold text-white">
              {timeline.length} โหนดเชื่อมต่อ (สร้างเพิ่มได้)
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN ROADMAP COMPONENT: TIMELINE UI WITH CONNECTING LINES AND NODES
          ========================================================================= */}
      <div className="relative mb-7 rounded-2xl bg-gradient-to-b from-[#0a1e4d]/95 via-[#061539]/95 to-[#030c26]/98 border-2 border-amber-400/50 shadow-[0_16px_50px_rgba(0,0,0,0.7),0_0_35px_rgba(245,158,11,0.22)] p-4 sm:p-6 backdrop-blur-2xl ring-1 ring-white/10 overflow-hidden">
        {/* Holographic Top Royal Gold Laser Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Roadmap Console Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-amber-500/25">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="block text-xs sm:text-sm font-bold text-white tracking-wide">
                  Timeline UI with Connecting Lines & Nodes (Roadmap Component)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono font-bold">
                  {timeline.length} NODES
                </span>
              </div>
              <span className="block text-[11px] text-amber-300/80 font-mono">
                คลิกที่โหนด/กราฟฟิกเพื่อเปิดดูข้อมูลสมบูรณ์เป็นการ์ด (Card Modal) · เพิ่มโหนดได้ไม่จำกัดจาก Admin
              </span>
            </div>
          </div>

          {/* Quick Step Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-amber-500/20 text-slate-200 border border-amber-500/30 hover:border-amber-400 transition-all text-xs cursor-pointer active:scale-95"
              title="ก่อนหน้า"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">ก่อนหน้า</span>
            </button>

            <span className="text-xs font-mono text-amber-300 px-2.5 py-1 rounded bg-[#030d26] border border-amber-500/30 font-bold">
              โหนด 0{activeIndex + 1} / 0{timeline.length}
            </span>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-amber-500/20 text-slate-200 border border-amber-500/30 hover:border-amber-400 transition-all text-xs cursor-pointer active:scale-95"
              title="ถัดไป"
            >
              <span className="hidden sm:inline">ถัดไป</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              onClick={() => {
                playDigitalSound('radar');
                setIsCardModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95 cursor-pointer ml-1"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>เปิดการ์ดข้อมูลเต็มจอ</span>
            </button>
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            DESKTOP & TABLET VIEW: HORIZONTAL CONNECTED ROADMAP (Nodes & Lines)
            ----------------------------------------------------------------------- */}
        <div className="hidden md:block relative pb-4">
          {/* Scrollable Track Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 pt-6 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-950/50"
          >
            <div
              className="relative flex items-stretch gap-6 min-w-max px-6"
              style={{ minHeight: '340px' }}
            >
              {/* THE SVG CONNECTING LINE THAT SPANS ACROSS ALL NODES */}
              <svg
                className="absolute top-[36px] left-8 right-8 h-12 pointer-events-none z-0"
                style={{ width: 'calc(100% - 4rem)' }}
              >
                <defs>
                  <linearGradient id="roadmapLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d97706" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
                    <stop offset="100%" stopColor="#fde047" stopOpacity="0.9" />
                  </linearGradient>
                  <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* Background Track Line */}
                <line
                  x1="20"
                  y1="20"
                  x2="100%"
                  y2="20"
                  stroke="#1c1917"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Glowing Royal Gold Connecting Cable Line */}
                <line
                  x1="20"
                  y1="20"
                  x2="100%"
                  y2="20"
                  stroke="url(#roadmapLineGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#laserGlow)"
                />
                {/* Animated Pulsing Signal Line */}
                <line
                  x1="20"
                  y1="20"
                  x2="100%"
                  y2="20"
                  stroke="#fef08a"
                  strokeWidth="2"
                  strokeDasharray="10 15"
                  className="animate-pulse"
                />
              </svg>

              {/* DYNAMIC NODES MAPPED SEQUENTIALLY FROM ADMIN TIMELINE */}
              {timeline.map((item, idx) => {
                const isActive = idx === activeIndex;
                const statusTheme = getStatusStyle(item.status);
                const stepNum = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;

                return (
                  <div
                    key={item.id}
                    data-node-index={idx}
                    className="relative flex flex-col items-center w-72 lg:w-80 shrink-0 z-10 select-none group"
                  >
                    {/* 1. NODE HUB (CIRCULAR ANCHOR ON THE CONNECTING LINE) */}
                    <button
                      type="button"
                      onClick={() => handleSelectNode(idx, true)}
                      className={`relative z-20 w-14 h-14 rounded-full flex flex-col items-center justify-center font-mono font-bold text-xs transition-all duration-300 cursor-pointer shadow-xl ${
                        isActive
                          ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 ring-4 ring-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.9)] scale-110'
                          : 'bg-[#04112e] text-cyan-300 border-2 border-cyan-400/50 hover:border-cyan-300 hover:scale-105 group-hover:shadow-[0_0_18px_rgba(6,182,212,0.5)]'
                      }`}
                      title={`คลิกเปิดการ์ดข้อมูลโหนด ${stepNum}`}
                    >
                      {/* Pulse Ring when Active */}
                      {isActive && (
                        <span className="absolute -inset-1.5 rounded-full border-2 border-cyan-300 animate-ping opacity-60" />
                      )}
                      <span className="text-[10px] opacity-80">NODE</span>
                      <span className="text-sm font-extrabold">{stepNum}</span>
                    </button>

                    {/* Connector stem line from hub to card */}
                    <div
                      className={`w-0.5 h-6 transition-colors duration-300 ${
                        isActive
                          ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                          : 'bg-cyan-500/30 group-hover:bg-cyan-400/60'
                      }`}
                    />

                    {/* 2. PROMINENT DATE & TIME BADGE (VERY CLEAR) */}
                    <div
                      className={`mb-2 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                        isActive
                          ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.6)] font-bold'
                          : 'bg-[#030e26] text-cyan-300 border-cyan-500/30 group-hover:border-cyan-400/60'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="tracking-tight">{item.date}</span>
                      {item.time && (
                        <>
                          <span className="opacity-40">|</span>
                          <span className="font-mono text-[11px] opacity-90">{item.time}</span>
                        </>
                      )}
                    </div>

                    {/* 3. ROADMAP NODE CARD (GRAPHIC & DETAILS) */}
                    <div
                      onClick={() => handleSelectNode(idx, true)}
                      className={`w-full flex-1 p-4 rounded-2xl text-left transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                        isActive
                          ? 'bg-gradient-to-b from-[#0b245e]/95 via-[#071946]/95 to-[#041030]/98 border-2 border-cyan-400 shadow-[0_12px_35px_rgba(0,0,0,0.6),0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-xl scale-[1.02]'
                          : 'bg-[#061539]/80 hover:bg-[#0a2052]/90 border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_6px_20px_rgba(0,0,0,0.4)]'
                      }`}
                    >
                      {/* Top Badges: Phase & Status */}
                      <div>
                        <div className="flex items-center justify-between gap-1.5 mb-2.5">
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 truncate max-w-[150px]">
                            {item.phase}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 shrink-0 ${statusTheme.bg} ${statusTheme.border} ${statusTheme.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusTheme.indicator}`} />
                            <span>{item.status}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h4
                          className={`text-xs font-bold leading-snug line-clamp-2 mb-2 ${
                            isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                          }`}
                        >
                          {item.title}
                        </h4>

                        {/* Graphic Thumbnail with holographic frame */}
                        <div className="relative h-28 rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 mb-2.5">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                '/src/assets/images/sai_building_inspection_1791689807795.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-slate-300 font-mono">
                            <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                              NODE 0{idx + 1}
                            </span>
                            <span className="text-cyan-300 font-semibold bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                              คลิกเพื่อเปิดการ์ด ↗
                            </span>
                          </div>
                        </div>

                        {/* Short Description */}
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Card Action Footer */}
                      <div className="mt-3 pt-2.5 border-t border-cyan-500/20 flex items-center justify-between text-[11px]">
                        <span className="text-cyan-300 font-medium flex items-center gap-1 group-hover:text-cyan-200">
                          <span>เปิดดูข้อมูลฉบับสมบูรณ์</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {isActive ? '● กำลังเลือก' : 'คลิกเพื่ออ่าน'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            SMARTPHONE & MOBILE VIEW: VERTICAL CONNECTED ROADMAP (Nodes & Lines)
            ----------------------------------------------------------------------- */}
        <div className="md:hidden relative pl-6 pr-2 py-3 space-y-6">
          {/* Vertical Glowing Connecting Line running down the left */}
          <div className="absolute left-[23px] top-6 bottom-6 w-1 bg-gradient-to-b from-blue-600 via-cyan-400 to-blue-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]" />

          {timeline.map((item, idx) => {
            const isActive = idx === activeIndex;
            const statusTheme = getStatusStyle(item.status);
            const stepNum = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;

            return (
              <div key={item.id} className="relative select-none group">
                {/* Node Anchor on the vertical line */}
                <button
                  type="button"
                  onClick={() => handleSelectNode(idx, true)}
                  className={`absolute -left-[27px] top-4 w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all duration-300 cursor-pointer shadow-lg z-10 ${
                    isActive
                      ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 ring-4 ring-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.9)] scale-110'
                      : 'bg-[#04112e] text-cyan-300 border-2 border-cyan-400/50'
                  }`}
                  title={`เปิดการ์ดโหนด ${stepNum}`}
                >
                  {stepNum}
                </button>

                {/* Mobile Roadmap Card */}
                <div
                  onClick={() => handleSelectNode(idx, true)}
                  className={`p-4 rounded-xl text-left transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? 'bg-gradient-to-b from-[#0a235c]/95 via-[#061742]/95 to-[#040e2b]/98 border-2 border-cyan-400 shadow-[0_8px_25px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.4)]'
                      : 'bg-[#061539]/80 border-cyan-500/30'
                  }`}
                >
                  {/* Date and Time Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-200">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{item.date}</span>
                      {item.time && (
                        <span className="text-[10px] font-mono text-cyan-300/80">({item.time})</span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full border ${statusTheme.bg} ${statusTheme.border} ${statusTheme.text}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <span className="inline-block text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/20 mb-1">
                    {item.phase}
                  </span>

                  <h4 className="text-xs font-bold text-white mb-1.5 leading-snug">{item.title}</h4>

                  {/* Thumbnail */}
                  <div className="relative h-28 rounded-lg overflow-hidden border border-cyan-500/30 bg-slate-950 my-2">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          '/src/assets/images/sai_building_inspection_1791689807795.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-1 right-2 text-[10px] text-cyan-300 font-mono bg-black/60 px-1.5 py-0.5 rounded">
                      แตะเพื่อเปิดการ์ด ↗
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-xs text-cyan-300 font-semibold">
                    <span>เปิดอ่านการ์ดข้อมูลสมบูรณ์</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Roadmap Footer Info Bar */}
        <div className="mt-5 pt-3.5 pb-2.5 px-4 rounded-xl bg-[#061438]/90 border border-cyan-500/35 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
            <span className="text-cyan-400 font-semibold">โหนดที่กำลังเลือก:</span>
            <span className="text-white font-medium line-clamp-1">
              [โหนด 0{activeIndex + 1}] {currentItem.date} · {currentItem.title}
            </span>
          </div>

          <button
            onClick={() => {
              playDigitalSound('radar');
              setIsCardModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-medium transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>เปิดการ์ดข้อมูลสมบูรณ์ (Card View)</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          IN-PAGE PINNED ACTIVE CARD: ข้อมูลสมบูรณ์ประจำโหนดที่เลือกอยู่
          ========================================================================= */}
      {currentItem && (
        <div className="relative rounded-2xl bg-gradient-to-b from-[#0b2154]/95 via-[#07173e]/95 to-[#040e28]/98 border-2 border-cyan-400/60 p-4 sm:p-6 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.75),0_0_40px_rgba(6,182,212,0.22)] backdrop-blur-2xl ring-1 ring-white/10">
          {/* Card Top Action Bar */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-cyan-500/25 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-semibold font-mono">
                โหนด 0{activeIndex + 1} · {currentItem.phase}
              </span>
              <span className="text-slate-500 hidden sm:inline">·</span>

              {/* Prominent Date in Detail Bar */}
              <span className="text-xs sm:text-sm text-cyan-200 flex items-center gap-1.5 font-bold bg-[#040e2a] px-3 py-1 rounded-lg border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>วันที่: {currentItem.date}</span>
              </span>

              {currentItem.time && (
                <span className="text-xs text-slate-300 flex items-center gap-1 bg-[#040e2a] px-2.5 py-1 rounded-lg border border-cyan-500/20">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>เวลา {currentItem.time}</span>
                </span>
              )}

              <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-500/20 border-emerald-400/40 text-emerald-300">
                สถานะ: {currentItem.status}
              </span>
            </div>

            {/* Quick Next/Prev and Full Card button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-400/60 transition-colors cursor-pointer active:scale-95"
                title="ย้อนกลับ"
              >
                <ChevronLeft className="w-4 h-4 text-cyan-400" />
              </button>
              <span className="text-xs text-cyan-300 font-mono px-1">
                {activeIndex + 1} / {timeline.length}
              </span>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-400/60 transition-colors cursor-pointer active:scale-95"
                title="ถัดไป"
              >
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </button>

              <button
                onClick={() => {
                  playDigitalSound('radar');
                  setIsCardModalOpen(true);
                }}
                className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 transition-colors cursor-pointer"
                title="ขยายเป็นการ์ด Modal แบบเต็ม"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Grid: Visual Frame + Technical Report */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Visual Frame */}
            <div className="lg:col-span-5 relative group rounded-xl overflow-hidden border-2 border-cyan-500/40 shadow-xl bg-slate-950">
              <img
                src={currentItem.imageUrl}
                alt={currentItem.title}
                className="w-full h-64 sm:h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/src/assets/images/sai_building_inspection_1791689807795.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

              <button
                onClick={() => {
                  playDigitalSound('radar');
                  setShowImageLightbox(true);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/70 hover:bg-cyan-400 text-white hover:text-slate-950 border border-white/20 hover:border-cyan-300 transition-all cursor-pointer shadow-lg active:scale-95"
                title="ขยายภาพบันทึกวิศวกรรม"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-medium backdrop-blur-sm">
                  สถานะ: {currentItem.status}
                </span>
                <span className="text-[11px] text-slate-300 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                  ภาพบันทึกวิศวกรรม สตง.
                </span>
              </div>
            </div>

            {/* Technical Report & Details */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white leading-snug">
                {currentItem.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {currentItem.description}
              </p>

              {/* Technical Engineering Spec Box */}
              <div className="p-3.5 rounded-xl bg-[#030b20]/90 border border-cyan-400/40 space-y-2 shadow-inner backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>ข้อมูลทางวิศวกรรมและการตรวจวัด (Engineering Verification):</span>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed pl-5">
                  {currentItem.technicalDetails}
                </p>
              </div>

              {/* Assurances List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-400/40 backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-emerald-300">
                      ความปลอดภัยบุคลากร 100%
                    </span>
                    <span className="text-[11px] text-slate-300">
                      ปฏิบัติตามแผนอพยพฉุกเฉินระดับ 1 ไม่มีผู้บาดเจ็บ
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-400/40 backdrop-blur-md">
                  <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-cyan-300">
                      Digital Audit ไม่สะดุด
                    </span>
                    <span className="text-[11px] text-slate-300">
                      งานตรวจเงินแผ่นดินทั่วประเทศดำเนินได้ต่อเนื่อง 100%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card Footer with Share & AI trigger */}
          <div className="mt-6 pt-3 border-t border-cyan-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
            <span>สำนักงานการตรวจเงินแผ่นดิน (สตง.) · ศูนย์บัญชาการข้อมูลอาคาร</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  playDigitalSound('select');
                  onAskAiAboutIncident();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-cyan-300 border border-blue-400/40 text-xs font-sans font-medium transition-colors cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>ถาม AI เกี่ยวกับโหนดนี้</span>
              </button>

              <button
                type="button"
                onClick={() => setShareMilestone(currentItem)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-sans font-medium transition-colors cursor-pointer"
                title="แชร์ข้อมูลเหตุการณ์นี้"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>แชร์รายงานการ์ดนี้</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DEDICATED FULL CARD MODAL: เปิดออกมาเป็นการ์ดข้อมูลสมบูรณ์เมื่อคลิกที่กราฟฟิค
          ========================================================================= */}
      {isCardModalOpen && currentItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn"
          onClick={() => {
            playDigitalSound('blip');
            setIsCardModalOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-b from-[#081f54] via-[#05143a] to-[#02091e] border-2 border-cyan-400 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Card Laser Top Strip */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-sky-300 w-full" />

            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cyan-500/30 bg-[#040e2c]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 font-mono font-extrabold flex items-center justify-center text-xs shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                  0{activeIndex + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      การ์ดข้อมูลเหตุการณ์สมบูรณ์ (Roadmap Node Card)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-mono">
                      {currentItem.phase}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-cyan-200 mt-0.5 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>วันที่: {currentItem.date}</span>
                    {currentItem.time && (
                      <>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-300 font-mono">เวลา {currentItem.time}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  playDigitalSound('blip');
                  setIsCardModalOpen(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                title="ปิดการ์ด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-left">
              {/* Image Preview with Lightbox Trigger */}
              <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 h-56 sm:h-72">
                <img
                  src={currentItem.imageUrl}
                  alt={currentItem.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      '/src/assets/images/sai_building_inspection_1791689807795.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <button
                  type="button"
                  onClick={() => setShowImageLightbox(true)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/75 hover:bg-cyan-400 text-white hover:text-slate-950 border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
                  title="ดูภาพขนาดเต็ม"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-medium backdrop-blur-md">
                    สถานะ: {currentItem.status}
                  </span>
                  <span className="text-[11px] text-slate-300 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-md">
                    สตง. บันทึกภาพวิศวกรรม
                  </span>
                </div>
              </div>

              {/* Full Title */}
              <h3 className="text-base sm:text-xl font-bold text-white leading-snug">
                {currentItem.title}
              </h3>

              {/* Detailed Narrative */}
              <div className="p-4 rounded-xl bg-[#040e2b]/80 border border-cyan-500/30">
                <span className="block text-xs font-semibold text-cyan-300 mb-1.5 font-mono">
                  สรุปเหตุการณ์และข้อเท็จจริง:
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {currentItem.description}
                </p>
              </div>

              {/* Engineering Telemetry Specifications */}
              <div className="p-4 rounded-xl bg-[#03091e] border border-cyan-400/40 shadow-inner space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>ข้อมูลทางวิศวกรรมและการตรวจวัด (Engineering Verification):</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed pl-6">
                  {currentItem.technicalDetails}
                </p>
              </div>

              {/* Assurances Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-bold text-emerald-300">
                      ความปลอดภัยบุคลากร 100%
                    </span>
                    <span className="text-[11px] text-slate-300">
                      ปฏิบัติตามแผนอพยพฉุกเฉินระดับ 1 ไม่มีผู้บาดเจ็บ
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-500/15 border border-cyan-400/40">
                  <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-bold text-cyan-300">
                      Digital Audit ไม่สะดุด
                    </span>
                    <span className="text-[11px] text-slate-300">
                      งานตรวจเงินแผ่นดินทั่วประเทศดำเนินได้ต่อเนื่อง 100%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 border-t border-cyan-500/30 bg-[#040e2c] flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Prev / Next within Modal */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-400 text-xs transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-cyan-400" />
                  <span>โหนดก่อนหน้า</span>
                </button>
                <span className="text-xs font-mono text-cyan-300 px-2">
                  {activeIndex + 1} / {timeline.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-400 text-xs transition-colors cursor-pointer"
                >
                  <span>โหนดถัดไป</span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShareMilestone(currentItem)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>แชร์การ์ดนี้</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playDigitalSound('select');
                    setIsCardModalOpen(false);
                    onAskAiAboutIncident();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>สอบถาม AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {showImageLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn"
          onClick={() => {
            playDigitalSound('blip');
            setShowImageLightbox(false);
          }}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentItem.imageUrl}
              alt={currentItem.title}
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl border-2 border-cyan-500/40 shadow-2xl"
            />
            <div className="p-3 text-center text-xs text-slate-300 flex items-center justify-between">
              <span>
                {currentItem.title} · {currentItem.date}
              </span>
              <button
                onClick={() => {
                  playDigitalSound('blip');
                  setShowImageLightbox(false);
                }}
                className="px-3 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs cursor-pointer"
              >
                ปิดภาพ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={!!shareMilestone}
        onClose={() => setShareMilestone(null)}
        item={
          shareMilestone
            ? {
                id: shareMilestone.id,
                title: `${shareMilestone.title} (${shareMilestone.date} เวลา ${shareMilestone.time})`,
                category: `สถานการณ์อาคาร สตง. [${shareMilestone.phase}]`,
                description: `${shareMilestone.description} - ${shareMilestone.technicalDetails}`,
                linkUrl: `${
                  typeof window !== 'undefined' ? window.location.origin : ''
                }#incident-timeline`,
              }
            : null
        }
      />
    </section>
  );
};
