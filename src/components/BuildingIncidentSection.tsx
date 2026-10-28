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
  ExternalLink,
  Lightbulb,
  Building2,
  Handshake,
  Users,
  Video,
  Image as ImageIcon,
  Play,
  FileText,
  AlertCircle
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
      date: 'ปัจจุบัน (ตุลาคม 2569)',
      time: 'ล่าสุด',
      phase: 'รายงานสถานการณ์ฉุกเฉิน',
      title: 'ข้อมูลกำลังปรับปรุงตามรอบรายงาน วสท.',
      description: 'วิศวกรผู้เชี่ยวชาญเข้าตรวจสอบพื้นที่ต่อเนื่อง',
      status: 'ดำเนินการ',
      imageUrl: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
      technicalDetails: 'ระบบเซนเซอร์วัดการขยับตัว 0.00 มม.',
      colorAccent: 'orange',
    };

  // Scroll into view when activeIndex changes
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

  const handleSelectNode = (idx: number, openModal: boolean = true) => {
    playDigitalSound('radar');
    setActiveIndex(idx);
    if (openModal) {
      setIsCardModalOpen(true);
    }
  };

  // Color Palette mapping for the 3D connected milestone blocks (Matching Visme attached mockup)
  const getBlockColorTheme = (colorAccent?: string, index: number = 0) => {
    const defaultCycle = ['orange', 'amber', 'teal', 'cyan', 'emerald', 'rose', 'purple'];
    const chosen = colorAccent || defaultCycle[index % defaultCycle.length];

    switch (chosen) {
      case 'orange':
        return {
          bg: 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600',
          text: 'text-orange-300',
          border: 'border-orange-400/60',
          glow: 'shadow-[0_0_20px_rgba(249,115,22,0.6)]',
          badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          lineColor: '#f97316',
          dotBg: 'bg-orange-500',
        };
      case 'amber':
        return {
          bg: 'bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600',
          text: 'text-amber-300',
          border: 'border-amber-400/60',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.6)]',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          lineColor: '#d97706',
          dotBg: 'bg-amber-500',
        };
      case 'teal':
        return {
          bg: 'bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-600',
          text: 'text-teal-300',
          border: 'border-teal-400/60',
          glow: 'shadow-[0_0_20px_rgba(20,184,166,0.6)]',
          badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          lineColor: '#14b8a6',
          dotBg: 'bg-teal-400',
        };
      case 'cyan':
        return {
          bg: 'bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-500',
          text: 'text-cyan-300',
          border: 'border-cyan-400/60',
          glow: 'shadow-[0_0_20px_rgba(6,182,212,0.6)]',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          lineColor: '#06b6d4',
          dotBg: 'bg-cyan-400',
        };
      case 'emerald':
        return {
          bg: 'bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-700',
          text: 'text-emerald-300',
          border: 'border-emerald-400/60',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.6)]',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          lineColor: '#10b981',
          dotBg: 'bg-emerald-400',
        };
      case 'rose':
        return {
          bg: 'bg-gradient-to-r from-rose-500 via-red-600 to-rose-600',
          text: 'text-rose-300',
          border: 'border-rose-400/60',
          glow: 'shadow-[0_0_20px_rgba(244,63,94,0.6)]',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          lineColor: '#f43f5e',
          dotBg: 'bg-rose-400',
        };
      case 'purple':
        return {
          bg: 'bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600',
          text: 'text-purple-300',
          border: 'border-purple-400/60',
          glow: 'shadow-[0_0_20px_rgba(168,85,247,0.6)]',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          lineColor: '#a855f7',
          dotBg: 'bg-purple-400',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600',
          text: 'text-orange-300',
          border: 'border-orange-400/60',
          glow: 'shadow-[0_0_20px_rgba(249,115,22,0.6)]',
          badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          lineColor: '#f97316',
          dotBg: 'bg-orange-500',
        };
    }
  };

  // Status Badge Styling (High Visibility Emergency Palette)
  const getStatusStyle = (status: string) => {
    if (status.includes('เรียบร้อย') || status.includes('แล้ว') || status.includes('ปลอดภัย')) {
      return {
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-400/50',
        text: 'text-emerald-300',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.5)]',
        indicator: 'bg-emerald-400',
      };
    }
    if (status.includes('วิเคราะห์') || status.includes('ตรวจสอบ') || status.includes('ดำเนินการ')) {
      return {
        bg: 'bg-amber-500/25',
        border: 'border-amber-400/60',
        text: 'text-amber-300',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]',
        indicator: 'bg-amber-400',
      };
    }
    // High Alert / Active Emergency
    return {
      bg: 'bg-rose-500/25',
      border: 'border-rose-400/60',
      text: 'text-rose-300 font-bold',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.6)]',
      indicator: 'bg-rose-400 animate-pulse',
    };
  };

  // Render appropriate Icon for milestone
  const renderMilestoneIcon = (iconName?: string, className: string = 'w-4 h-4') => {
    switch (iconName) {
      case 'lightbulb':
        return <Lightbulb className={className} />;
      case 'building':
        return <Building2 className={className} />;
      case 'handshake':
        return <Handshake className={className} />;
      case 'target':
        return <Target className={className} />;
      case 'users':
        return <Users className={className} />;
      case 'shield':
        return <Shield className={className} />;
      case 'alert':
        return <AlertTriangle className={className} />;
      default:
        return <Activity className={className} />;
    }
  };

  // Extract Milestone Year or Short Label for Block
  const getBlockYearLabel = (item: IncidentMilestone, idx: number) => {
    if (item.shortTitle && /^\d{4}/.test(item.shortTitle)) {
      return item.shortTitle.split(' ')[0];
    }
    const yearMatch = item.date.match(/25\d{2}|20\d{2}/);
    if (yearMatch) {
      return yearMatch[0];
    }
    return `PHASE 0${idx + 1}`;
  };

  return (
    <section
      id="incident-timeline"
      className="relative pt-8 sm:pt-12 pb-8 sm:pb-14 mb-6 sm:mb-10 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 w-full max-w-[1920px] 2xl:max-w-[2400px] 3xl:max-w-none mx-auto scroll-mt-20 select-none"
    >
      {/* =========================================================================
          THEME: TACTICAL EMERGENCY COMMAND & CRISIS INTELLIGENCE CENTER (EOC)
          Distinct High-Contrast Tactical Theme (Obsidian + Emergency Crimson & Amber)
          ========================================================================= */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl"
        aria-hidden="true"
      >
        {/* Tactical Emergency Glows: Crimson Alert & High-Visibility Amber */}
        <div className="absolute top-10 left-10 w-[600px] h-[450px] bg-gradient-to-r from-rose-600/18 via-orange-600/14 to-amber-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-[550px] h-[400px] bg-gradient-to-r from-amber-500/12 via-rose-600/10 to-blue-600/10 rounded-full blur-[150px]" />
        {/* Tactical grid background overlay */}
        <div className="absolute inset-0 bg-digital-grid opacity-35" />
      </div>

      {/* SECTION HEADER: TACTICAL CRISIS CENTER BADGE (No divider, compact spacing to dashboard) */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4 relative">
        <div>
          {/* Tactical Crisis Center Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#160b13]/90 border border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.35)] text-rose-200 text-xs sm:text-sm font-bold backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)]" />
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="tracking-wide">
              ศูนย์ข้อมูลสถานการณ์ เหตุการณ์อาคาร สตง. ทรุดตัวจากแผ่นดินไหว
            </span>
          </div>
        </div>
      </div>

      {/* Engineering Live HUD Diagnostics Strip (ตัวเลขใหญ่ ชัดเจน มีข้อความบอกด้านล่าง) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-5 sm:mb-6">
        {/* Card 1: ความปลอดภัยบุคลากร */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#0b1222]/90 border border-emerald-500/40 shadow-md hover:border-emerald-400/60 transition-all flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono text-emerald-300/80 font-medium">ความปลอดภัย</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-400 font-mono tracking-tight">
              100%
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5 leading-snug">
              บุคลากรปลอดภัยครบทุกคน
            </p>
          </div>
        </div>

        {/* Card 2: อัตราการขยับตัว 7 วัน */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#0b1222]/90 border border-cyan-500/40 shadow-md hover:border-cyan-400/60 transition-all flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono text-cyan-300/80 font-medium">การขยับตัว (7 วัน)</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-cyan-300 font-mono tracking-tight flex items-baseline gap-1">
              <span>0.00</span>
              <span className="text-xs sm:text-sm font-semibold text-cyan-400 font-sans">มม.</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5 leading-snug">
              โครงสร้างนิ่ง ไม่พบการขยับตัว
            </p>
          </div>
        </div>

        {/* Card 3: ภารกิจ Digital Audit (BCP) */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#0b1222]/90 border border-amber-500/40 shadow-md hover:border-amber-400/60 transition-all flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono text-amber-300/80 font-medium">ระบบงาน BCP</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-300 font-mono tracking-tight">
              100%
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5 leading-snug">
              ตรวจเงินแผ่นดินดำเนินการต่อเนื่อง
            </p>
          </div>
        </div>

        {/* Card 4: Roadmap Milestones */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#0b1222]/90 border border-rose-500/40 shadow-md hover:border-rose-400/60 transition-all flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono text-rose-300/80 font-medium">ไทม์ไลน์</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-rose-300 font-mono tracking-tight flex items-baseline gap-1">
              <span>{timeline.length}</span>
              <span className="text-xs sm:text-sm font-semibold text-rose-400 font-sans">ช่วง</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5 leading-snug">
              เหตุการณ์สำคัญติดตามต่อเนื่อง
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN 3D INTERACTIVE CONNECTED TIMELINE (Matching Visme Layout)
          ฉากหลัง: เมือง เงาตึก (City Skyline & Building Silhouettes) โทนสว่างกว่าเดิม 30%
          Horizontal Ribbon of Connected Chevron Milestone Blocks + Alternating Branches
          ========================================================================= */}
      <div className="relative mb-0 rounded-3xl bg-gradient-to-b from-[#1b253c]/95 via-[#233352]/95 to-[#162238]/98 border-2 border-rose-500/45 shadow-[0_20px_70px_rgba(15,23,42,0.65),0_0_45px_rgba(244,63,94,0.22)] p-4 sm:p-6 lg:p-7 backdrop-blur-2xl ring-1 ring-white/10 overflow-hidden">
        {/* Holographic Top Laser Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 z-10" />

        {/* =========================================================================
            ฉากเมือง เงาตึก โทนสว่างกว่าเดิม 30% (CITY SKYLINE & BUILDING SILHOUETTES)
            ========================================================================= */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0" aria-hidden="true">
          {/* 30% Brighter Horizon Dawn/Dusk Atmospheric Light Wash */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-400/20 via-sky-500/15 to-transparent" />
          
          {/* Subtle Ambient City Glow */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#1b253d]/80 via-[#233454]/40 to-transparent" />

          {/* Architectural City Skyline Vector SVG (Multi-layer Building Silhouettes & Windows) */}
          <svg
            className="absolute bottom-0 left-0 right-0 w-full h-[280px] sm:h-[340px] opacity-85"
            preserveAspectRatio="none"
            viewBox="0 0 1440 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Sky Twilight Gradient */}
              <linearGradient id="citySkylineFarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b4f7a" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#223254" stopOpacity="0.4" />
              </linearGradient>

              {/* Midground Building Silhouette Gradient (Brightened 30%) */}
              <linearGradient id="citySkylineMidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2c3c61" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#18243d" stopOpacity="0.85" />
              </linearGradient>

              {/* Foreground Building Silhouette Gradient */}
              <linearGradient id="citySkylineNearGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e2b47" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#111a2d" stopOpacity="0.98" />
              </linearGradient>

              {/* Horizon Warm Light Bar */}
              <linearGradient id="horizonLightBar" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>

              {/* Window Glow Pattern */}
              <pattern id="cityWindows" width="16" height="18" patternUnits="userSpaceOnUse">
                <rect x="2" y="2" width="4" height="5" rx="0.5" fill="#fde68a" fillOpacity="0.45" />
                <rect x="9" y="2" width="4" height="5" rx="0.5" fill="#bae6fd" fillOpacity="0.35" />
                <rect x="2" y="10" width="4" height="5" rx="0.5" fill="#bae6fd" fillOpacity="0.3" />
                <rect x="9" y="10" width="4" height="5" rx="0.5" fill="#fde68a" fillOpacity="0.4" />
              </pattern>
            </defs>

            {/* Ambient Base Horizon Glow */}
            <rect y="180" width="1440" height="160" fill="url(#horizonLightBar)" />

            {/* LAYER 1: Distant City Towers & Antennas (Far Skyline - 30% Lighter Silhouette) */}
            <g fill="url(#citySkylineFarGrad)">
              {/* Spire 1 */}
              <rect x="40" y="70" width="2" height="70" fill="#f43f5e" fillOpacity="0.6" />
              <circle cx="41" cy="70" r="2.5" fill="#f43f5e" className="animate-ping" />
              <polygon points="25,140 40,80 42,80 57,140" />
              <rect x="20" y="140" width="42" height="200" />

              <rect x="80" y="110" width="35" height="230" />
              <polygon points="80,110 97,85 115,110" />

              <rect x="150" y="90" width="55" height="250" />
              <rect x="175" y="45" width="2" height="45" fill="#f59e0b" fillOpacity="0.7" />
              <circle cx="176" cy="45" r="2" fill="#f59e0b" />

              <rect x="230" y="130" width="40" height="210" />
              <rect x="290" y="100" width="60" height="240" />
              <polygon points="290,100 320,65 350,100" />

              {/* Center City Highrises */}
              <rect x="420" y="80" width="70" height="260" />
              <rect x="454" y="30" width="2" height="50" fill="#f43f5e" fillOpacity="0.7" />
              <circle cx="455" cy="30" r="2.5" fill="#f43f5e" />

              <rect x="520" y="110" width="50" height="230" />
              <rect x="600" y="75" width="80" height="265" />
              <polygon points="600,75 640,40 680,75" />

              <rect x="710" y="125" width="45" height="215" />
              <rect x="780" y="95" width="65" height="245" />

              {/* Eastern Metropolis Towers */}
              <rect x="870" y="60" width="75" height="280" />
              <rect x="906" y="20" width="2.5" height="40" fill="#f43f5e" fillOpacity="0.7" />
              <circle cx="907" cy="20" r="2.5" fill="#f43f5e" />

              <rect x="970" y="115" width="55" height="225" />
              <rect x="1050" y="85" width="70" height="255" />
              <polygon points="1050,85 1085,55 1120,85" />

              <rect x="1150" y="120" width="45" height="220" />
              <rect x="1220" y="90" width="60" height="250" />
              <rect x="1310" y="70" width="70" height="270" />
              <rect x="1344" y="35" width="2" height="35" fill="#f43f5e" fillOpacity="0.7" />
              <circle cx="1345" cy="35" r="2" fill="#f43f5e" />
            </g>

            {/* LAYER 2: Midground Building Silhouettes with Office Window Grids */}
            <g fill="url(#citySkylineMidGrad)">
              <rect x="0" y="170" width="65" height="170" />
              <rect x="50" y="150" width="45" height="190" />
              <polygon points="50,150 72,130 95,150" />

              <rect x="110" y="130" width="65" height="210" />
              {/* Window grid for building 110 */}
              <rect x="115" y="145" width="55" height="90" fill="url(#cityWindows)" />

              <rect x="190" y="160" width="55" height="180" />
              <rect x="260" y="140" width="75" height="200" />
              <rect x="270" y="155" width="55" height="85" fill="url(#cityWindows)" />

              <rect x="350" y="120" width="60" height="220" />
              <polygon points="350,120 380,95 410,120" />

              {/* Major Corporate Towers */}
              <rect x="430" y="135" width="80" height="205" />
              <rect x="440" y="150" width="60" height="90" fill="url(#cityWindows)" />

              <rect x="530" y="150" width="65" height="190" />
              <rect x="615" y="110" width="85" height="230" />
              <polygon points="615,110 657,80 700,110" />
              <rect x="630" y="125" width="55" height="110" fill="url(#cityWindows)" />

              <rect x="720" y="145" width="55" height="195" />
              <rect x="795" y="130" width="70" height="210" />
              <rect x="805" y="145" width="50" height="95" fill="url(#cityWindows)" />

              <rect x="885" y="115" width="80" height="225" />
              <polygon points="885,115 925,85 965,115" />
              <rect x="898" y="130" width="55" height="110" fill="url(#cityWindows)" />

              <rect x="985" y="150" width="60" height="190" />
              <rect x="1065" y="135" width="75" height="205" />
              <rect x="1075" y="150" width="55" height="90" fill="url(#cityWindows)" />

              <rect x="1160" y="160" width="55" height="180" />
              <rect x="1235" y="125" width="80" height="215" />
              <polygon points="1235,125 1275,95 1315,125" />
              <rect x="1250" y="140" width="50" height="100" fill="url(#cityWindows)" />

              <rect x="1335" y="155" width="65" height="185" />
              <rect x="1390" y="140" width="50" height="200" />
            </g>

            {/* LAYER 3: Foreground Architectural Building Silhouettes & Structural Framework */}
            <g fill="url(#citySkylineNearGrad)">
              <rect x="15" y="210" width="55" height="130" />
              <rect x="80" y="195" width="70" height="145" />
              <rect x="165" y="180" width="85" height="160" />
              <polygon points="165,180 207,160 250,180" />

              <rect x="270" y="200" width="70" height="140" />
              <rect x="360" y="175" width="90" height="165" />
              <rect x="375" y="190" width="60" height="80" fill="url(#cityWindows)" fillOpacity="0.4" />

              <rect x="470" y="195" width="65" height="145" />
              <rect x="555" y="180" width="85" height="160" />
              <polygon points="555,180 597,155 640,180" />

              <rect x="660" y="205" width="75" height="135" />
              <rect x="755" y="185" width="85" height="155" />
              <rect x="770" y="200" width="55" height="75" fill="url(#cityWindows)" fillOpacity="0.4" />

              <rect x="860" y="195" width="70" height="145" />
              <rect x="950" y="175" width="90" height="165" />
              <polygon points="950,175 995,150 1040,175" />

              <rect x="1060" y="200" width="75" height="140" />
              <rect x="1155" y="185" width="85" height="155" />
              <rect x="1170" y="200" width="55" height="75" fill="url(#cityWindows)" fillOpacity="0.4" />

              <rect x="1260" y="210" width="70" height="130" />
              <rect x="1350" y="190" width="90" height="150" />
            </g>

            {/* Architectural Grid / Structural Alignment Lines (Engineering Building Accents) */}
            <path
              d="M0 240 L1440 240 M0 290 L1440 290"
              stroke="#64748b"
              strokeWidth="0.8"
              strokeDasharray="4 8"
              strokeOpacity="0.25"
            />
          </svg>

          {/* Bottom Ground Blend (Ensures crisp contrast for timeline chevrons) */}
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#162238] via-[#1a263e]/75 to-transparent" />
        </div>

        {/* Console Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-rose-500/25">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/40 shadow-[0_0_12px_rgba(244,63,94,0.35)]">
              <Compass className="w-4 h-4 text-rose-400 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="block text-sm sm:text-base font-bold text-white tracking-wide">
                  Timeline เหตุการณ์
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 font-mono font-bold">
                  {timeline.length} MILESTONES
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            HORIZONTAL 3D INTERACTIVE TIMELINE RIBBON (Desktop & Tablet View)
            ----------------------------------------------------------------------- */}
        <div className="hidden sm:block relative pb-2 pt-2">
          {/* Scrollable Track Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 pt-4 scrollbar-thin scrollbar-thumb-rose-500/30 scrollbar-track-slate-950/50"
          >
            <div
              className="relative flex items-center justify-start min-w-max px-8 py-10 perspective-1200 preserve-3d"
              style={{ minHeight: '390px' }}
            >
              {/* START TAG at the far left */}
              <div className="flex items-center shrink-0 mr-2 z-10">
                <div className="px-3 py-1.5 rounded-l-xl bg-[#090e1f] border-y border-l border-slate-600/60 text-slate-300 font-mono text-[11px] font-bold tracking-widest shadow-md">
                  START
                </div>
                <div className="w-5 h-[2px] bg-gradient-to-r from-slate-600 to-orange-500" />
              </div>

              {/* CONNECTED MILESTONES CHAIN (Matching Visme Layout) */}
              <div className="flex items-center shrink-0">
                {timeline.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  const theme = getBlockColorTheme(item.colorAccent, idx);
                  const yearLabel = getBlockYearLabel(item, idx);
                  const isTopBranch = idx % 2 !== 0; // Alternating Top/Bottom branch like Visme
                  const isFirst = idx === 0;
                  const isLast = idx === timeline.length - 1;

                  // Chevron class: first item has rounded-l-xl, middle has chevron left & right, last has chevron left and rounded-r-xl
                  let chevronClass = 'timeline-chevron-middle';
                  if (timeline.length === 1) {
                    chevronClass = 'timeline-chevron-single rounded-xl';
                  } else if (isFirst) {
                    chevronClass = 'timeline-chevron-first rounded-l-xl';
                  } else if (isLast) {
                    chevronClass = 'timeline-chevron-last rounded-r-xl';
                  }

                  return (
                    <div
                      key={item.id}
                      data-node-index={idx}
                      className="relative flex flex-col items-center justify-center shrink-0 z-10 select-none group"
                      style={{ width: '180px' }}
                    >
                      {/* =========================================================
                          TOP BRANCH (If isTopBranch === true)
                          Vertical Leader Line pointing UP + Icon + Date + Concise Text
                          ========================================================= */}
                      {isTopBranch ? (
                        <div
                          onClick={() => handleSelectNode(idx, true)}
                          className={`absolute bottom-[calc(50%+28px)] flex flex-col items-center text-center cursor-pointer transition-all duration-300 group-hover:-translate-y-2.5 ${
                            isActive ? 'scale-105' : 'opacity-85 hover:opacity-100'
                          }`}
                          style={{ width: '160px' }}
                          title={`คลิกเปิดการ์ด: ${item.title}`}
                        >
                          {/* Circular Icon Hub */}
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 mb-2 border-2 shadow-lg ${
                              isActive
                                ? `${theme.bg} text-slate-950 border-white ring-4 ring-white/30 scale-110 ${theme.glow}`
                                : 'bg-[#0a1024] text-white border-slate-600/80 group-hover:border-white group-hover:scale-105'
                            }`}
                          >
                            {renderMilestoneIcon(item.icon, 'w-5 h-5')}
                          </div>

                          {/* Concise Month/Date Tag */}
                          <span className={`text-[11px] font-bold tracking-tight mb-0.5 ${theme.text}`}>
                            {item.date}
                          </span>

                          {/* Concise Title (1-2 lines) */}
                          <h4
                            className={`text-xs font-bold leading-tight line-clamp-2 px-1 ${
                              isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                            }`}
                          >
                            {item.title}
                          </h4>

                          {/* Concise short description */}
                          <p className="text-[10px] text-slate-300 line-clamp-2 mt-1 leading-snug px-1">
                            {item.description}
                          </p>

                          {/* Click Hint */}
                          <span className="text-[9px] font-mono text-slate-400 group-hover:text-amber-300 mt-1 flex items-center gap-0.5">
                            แตะเปิดการ์ด ↗
                          </span>

                          {/* Vertical Connector Line from block to top content */}
                          <div
                            className="w-[2px] h-7 transition-colors duration-300 mt-2"
                            style={{
                              backgroundColor: isActive ? theme.lineColor : 'rgba(148, 163, 184, 0.4)',
                              boxShadow: isActive ? `0 0 10px ${theme.lineColor}` : 'none',
                            }}
                          />
                        </div>
                      ) : null}

                      {/* =========================================================
                          CENTER CONNECTED 3D CHEVRON BLOCK
                          (The interlocking ribbon milestone piece)
                          ========================================================= */}
                      <button
                        type="button"
                        onClick={() => handleSelectNode(idx, true)}
                        className={`relative w-full h-14 ${chevronClass} ${theme.bg} flex items-center justify-center px-4 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 group-hover:brightness-110 ${
                          isActive
                            ? `ring-2 ring-white/80 scale-105 z-30 ${theme.glow}`
                            : 'opacity-95 hover:opacity-100 z-10'
                        }`}
                        style={{
                          transform: isActive ? 'translateZ(25px) scale(1.05)' : 'translateZ(0px)',
                          boxShadow: isActive
                            ? `0 12px 25px -4px ${theme.lineColor}88, inset 0 2px 0 rgba(255,255,255,0.6)`
                            : '0 6px 15px -3px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.4)',
                        }}
                        title={`คลิกเปิดการ์ดข้อมูล ${yearLabel}: ${item.title}`}
                      >
                        {/* Embossed Year / Milestone Text */}
                        <span className="text-sm sm:text-base font-extrabold text-white tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-mono">
                          {yearLabel}
                        </span>

                        {/* Top Gloss Edge Highlight */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/40 pointer-events-none" />

                        {/* Active Selection Beacon Dot */}
                        {isActive && (
                          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff]" />
                        )}
                      </button>

                      {/* =========================================================
                          BOTTOM BRANCH (If isTopBranch === false)
                          Vertical Leader Line pointing DOWN + Icon + Date + Concise Text
                          ========================================================= */}
                      {!isTopBranch ? (
                        <div
                          onClick={() => handleSelectNode(idx, true)}
                          className={`absolute top-[calc(50%+28px)] flex flex-col items-center text-center cursor-pointer transition-all duration-300 group-hover:translate-y-2.5 ${
                            isActive ? 'scale-105' : 'opacity-85 hover:opacity-100'
                          }`}
                          style={{ width: '160px' }}
                          title={`คลิกเปิดการ์ด: ${item.title}`}
                        >
                          {/* Vertical Connector Line from block to bottom content */}
                          <div
                            className="w-[2px] h-7 transition-colors duration-300 mb-2"
                            style={{
                              backgroundColor: isActive ? theme.lineColor : 'rgba(148, 163, 184, 0.4)',
                              boxShadow: isActive ? `0 0 10px ${theme.lineColor}` : 'none',
                            }}
                          />

                          {/* Circular Icon Hub */}
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 mb-2 border-2 shadow-lg ${
                              isActive
                                ? `${theme.bg} text-slate-950 border-white ring-4 ring-white/30 scale-110 ${theme.glow}`
                                : 'bg-[#0a1024] text-white border-slate-600/80 group-hover:border-white group-hover:scale-105'
                            }`}
                          >
                            {renderMilestoneIcon(item.icon, 'w-5 h-5')}
                          </div>

                          {/* Concise Month/Date Tag */}
                          <span className={`text-[11px] font-bold tracking-tight mb-0.5 ${theme.text}`}>
                            {item.date}
                          </span>

                          {/* Concise Title (1-2 lines) */}
                          <h4
                            className={`text-xs font-bold leading-tight line-clamp-2 px-1 ${
                              isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                            }`}
                          >
                            {item.title}
                          </h4>

                          {/* Concise short description */}
                          <p className="text-[10px] text-slate-300 line-clamp-2 mt-1 leading-snug px-1">
                            {item.description}
                          </p>

                          {/* Click Hint */}
                          <span className="text-[9px] font-mono text-slate-400 group-hover:text-amber-300 mt-1 flex items-center gap-0.5">
                            แตะเปิดการ์ด ↗
                          </span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* FINISH / ONGOING TAG at the far right */}
              <div className="flex items-center shrink-0 ml-2 z-10">
                <div className="w-5 h-[2px] bg-gradient-to-r from-emerald-500 to-slate-600" />
                <div className="px-3 py-1.5 rounded-r-xl bg-[#090e1f] border-y border-r border-slate-600/60 text-emerald-400 font-mono text-[11px] font-bold tracking-widest shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>ONGOING</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            VERTICAL CONNECTED TIMELINE (Smartphone View เฉพาะมุมมองสมาร์ทโฟน)
            ----------------------------------------------------------------------- */}
        <div className="block sm:hidden relative pb-1 pt-1">
          <div className="relative pl-1 pr-1">
            {/* Glowing Vertical Continuous Ribbon Laser Line */}
            <div className="absolute left-[24px] top-4 bottom-4 w-[2.5px] bg-gradient-to-b from-orange-500 via-rose-500 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.7)]" />

            {/* START TAG at top */}
            <div className="flex items-center gap-2 mb-4 pl-1 relative z-10">
              <div className="px-2.5 py-1 rounded-lg bg-[#090e1f] border border-orange-500/60 text-orange-300 font-mono text-[10px] font-bold tracking-widest shadow-md">
                START
              </div>
              <div className="text-[10px] font-mono text-slate-400">จุดเริ่มต้นเหตุการณ์</div>
            </div>

            {/* VERTICAL MILESTONES STACK */}
            <div className="space-y-3.5 relative z-10">
              {timeline.map((item, idx) => {
                const isActive = idx === activeIndex;
                const theme = getBlockColorTheme(item.colorAccent, idx);
                const yearLabel = getBlockYearLabel(item, idx);

                return (
                  <div
                    key={`mobile-milestone-${item.id}`}
                    onClick={() => handleSelectNode(idx, true)}
                    className={`relative pl-11 pr-1 transition-all duration-300 cursor-pointer active:scale-[0.98] ${
                      isActive ? 'scale-[1.01]' : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    {/* Node Circular Connector Dot on the vertical line */}
                    <div
                      className={`absolute left-[13px] top-3.5 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-20 ${
                        isActive
                          ? `${theme.bg} text-slate-950 border-white ring-4 ring-rose-500/50 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.8)]`
                          : 'bg-[#0a1024] text-white border-slate-600 hover:border-white shadow-md'
                      }`}
                    >
                      {renderMilestoneIcon(item.icon, 'w-3.5 h-3.5')}
                    </div>

                    {/* Milestone Card Container */}
                    <div
                      className={`p-3.5 rounded-2xl border transition-all duration-300 shadow-md ${
                        isActive
                          ? `bg-gradient-to-br from-[#1a233d]/95 via-[#202c4b]/95 to-[#151f36]/98 border-rose-400/80 shadow-[0_8px_25px_rgba(0,0,0,0.6),0_0_20px_rgba(244,63,94,0.3)] ring-1 ring-white/20`
                          : `bg-[#0f172a]/90 hover:bg-[#152038]/95 border-slate-700/60 hover:border-slate-500`
                      }`}
                    >
                      {/* Top Bar: Year/Milestone Chevron Badge + Date + Status */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap mb-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold font-mono tracking-wider text-white shadow-sm ${theme.bg}`}
                          >
                            {yearLabel}
                          </span>
                          <span className={`text-[11px] font-bold ${theme.text}`}>
                            {item.date}
                          </span>
                        </div>

                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${getStatusStyle(item.status).bg} ${getStatusStyle(item.status).border} ${getStatusStyle(item.status).text}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 mb-1 group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </h4>

                      {/* Concise Description */}
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Tap Action Row */}
                      <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px]">
                        <span className="text-rose-300 font-medium flex items-center gap-1">
                          <Maximize2 className="w-3 h-3 text-rose-400" />
                          <span>แตะเพื่อเปิดการ์ดรายงานฉบับเต็ม</span>
                        </span>
                        <span className="text-slate-400 font-mono">ช่วง {idx + 1}/{timeline.length} ↗</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ONGOING / FINISH TAG at bottom */}
            <div className="flex items-center gap-2 mt-4 pl-1 relative z-10">
              <div className="px-2.5 py-1 rounded-lg bg-[#090e1f] border border-emerald-500/60 text-emerald-400 font-mono text-[10px] font-bold tracking-widest shadow-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ONGOING</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">สถานะปัจจุบัน ติดตามต่อเนื่อง</div>
            </div>
          </div>
        </div>


      </div>



      {/* =========================================================================
          FULL MODAL: CARD VIEW MODAL DIALOG (Card รายละเอียดครบถ้วน พร้อมภาพ/คลิป/แชร์)
          ========================================================================= */}
      {isCardModalOpen && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#0e1429] via-[#090e20] to-[#050814] border-2 border-rose-500/60 p-5 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(244,63,94,0.3)] text-left ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-rose-500/30">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-rose-500/25 to-orange-500/25 text-rose-300 border border-rose-400/40 text-xs font-bold font-mono">
                  ช่วง {getBlockYearLabel(currentItem, activeIndex)} · {currentItem.phase}
                </span>

                <span className="text-xs text-rose-200 flex items-center gap-1 bg-[#050816] px-2.5 py-1 rounded-lg border border-rose-500/30">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  <span>{currentItem.date}</span>
                </span>

                {currentItem.time && (
                  <span className="text-xs text-slate-300 flex items-center gap-1 bg-[#050816] px-2 py-1 rounded-lg border border-slate-700">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{currentItem.time}</span>
                  </span>
                )}

                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getStatusStyle(currentItem.status).bg} ${getStatusStyle(currentItem.status).border} ${getStatusStyle(currentItem.status).text}`}
                >
                  สถานะ: {currentItem.status}
                </span>
              </div>

              {/* Close Button & Share */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playDigitalSound('radar');
                    setShareMilestone(currentItem);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 text-xs font-bold transition-colors cursor-pointer"
                  title="แชร์โหนดนี้"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">แชร์</span>
                </button>

                <button
                  onClick={() => setIsCardModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-900/90 hover:bg-rose-500 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer active:scale-95"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg sm:text-2xl font-extrabold text-white leading-tight mb-2">
                  {currentItem.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  {currentItem.description}
                </p>
              </div>

              {/* Media Section: Video or Photo */}
              <div className="rounded-2xl overflow-hidden border-2 border-rose-500/40 bg-slate-950 shadow-xl">
                {currentItem.mediaType === 'video' && currentItem.videoUrl ? (
                  <div className="relative aspect-video w-full bg-black">
                    <iframe
                      src={currentItem.videoUrl.replace('watch?v=', 'embed/')}
                      title={currentItem.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="relative h-64 sm:h-96 w-full">
                    <img
                      src={currentItem.imageUrl}
                      alt={currentItem.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/assets/images/sai_building_inspection_1791689807795.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <button
                      onClick={() => setShowImageLightbox(true)}
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-rose-500 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>ขยายรูปภาพขนาดเต็ม</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Full Official Statement */}
              {currentItem.fullStatement && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#060a18] border border-rose-400/40 space-y-2 shadow-inner">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-rose-300">
                    <FileText className="w-4 h-4 text-rose-400" />
                    <span>แถลงการณ์และข้อเท็จจริงฉบับสมบูรณ์ (Official Statement):</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-line pl-4 font-normal">
                    {currentItem.fullStatement}
                  </div>
                </div>
              )}

              {/* Engineering Verification Spec Box */}
              <div className="p-4 rounded-2xl bg-[#070b1a] border border-amber-400/40 space-y-2 shadow-inner">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300">
                  <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>ข้อมูลทางวิศวกรรมและการตรวจวัด (Engineering Verification):</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed pl-4">
                  {currentItem.technicalDetails}
                </p>
              </div>

              {/* Reference Citations */}
              {currentItem.referenceTitle && (
                <div className="p-3 rounded-xl bg-[#040714] border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <ExternalLink className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <span className="font-bold text-rose-200 block sm:inline mr-2">
                        เอกสารอ้างอิงทางการ:
                      </span>
                      <span>{currentItem.referenceTitle}</span>
                    </div>
                  </div>
                  {currentItem.referenceUrl && (
                    <a
                      href={currentItem.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold shrink-0 transition-colors text-center"
                    >
                      เปิดดูเอกสารฉบับจริง ↗
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Modal Bottom Stepper Bar */}
            <div className="mt-7 pt-4 border-t border-rose-500/25 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={handlePrev}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-rose-400/60 transition-colors text-xs font-semibold cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 text-rose-400" />
                <span>โหนดก่อนหน้า</span>
              </button>

              <div className="text-xs font-mono text-rose-300">
                โหนด {activeIndex + 1} จากทั้งหมด {timeline.length}
              </div>

              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-rose-400/60 transition-colors text-xs font-semibold cursor-pointer active:scale-95"
              >
                <span>โหนดถัดไป</span>
                <ChevronRight className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full Image Zoom */}
      {showImageLightbox && currentItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fadeIn"
          onClick={() => setShowImageLightbox(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setShowImageLightbox(false)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-slate-800/80 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={currentItem.imageUrl}
              alt={currentItem.title}
              className="max-h-[85vh] w-auto rounded-xl border border-rose-500/50 shadow-2xl"
            />
            <div className="mt-3 text-center text-xs text-slate-300 font-mono">
              {currentItem.date} · {currentItem.title}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal Dialog */}
      {shareMilestone && (
        <ShareModal
          isOpen={!!shareMilestone}
          onClose={() => setShareMilestone(null)}
          item={{
            id: shareMilestone.id,
            title: `[สถานการณ์อาคาร สตง.] ${shareMilestone.title} (${shareMilestone.date})`,
            category: 'สถานการณ์ฉุกเฉินและวิศวกรรมโครงสร้าง สตง.',
            linkUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/#incident-timeline`,
          }}
        />
      )}
    </section>
  );
};
