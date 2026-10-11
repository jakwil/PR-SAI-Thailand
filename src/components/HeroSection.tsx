import React from 'react';
import { ArrowRight, Sparkles, Building2, ExternalLink, Activity, Radio, ShieldCheck } from 'lucide-react';
import { HeroStory } from '../types';
import { HeroCarousel } from './HeroCarousel';

interface HeroSectionProps {
  stories: HeroStory[];
  onOpenChat: () => void;
  onExploreTimeline: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  stories,
  onOpenChat,
  onExploreTimeline,
}) => {
  return (
    <section id="home" className="relative pt-1 pb-5 sm:pt-2 sm:pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-3.5">
      {/* 1. Hero Carousel สลับกลับมาอยู่ด้านบนสุดตามคำขอ (ปรับลดความสูงลง 30% ให้กระชับ สวยงามแบบ Cinematic) */}
      <div className="w-full">
        <HeroCarousel stories={stories} />
      </div>

      {/* 2. ส่วนข้อมูลพันธกิจและศูนย์กลางสื่อสารองค์กร สตง. ด้านล่าง Hero (Frosted Glass & Elevated Contrast) */}
      <div className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-[#081b44]/85 border border-cyan-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(6,182,212,0.18)] backdrop-blur-xl ring-1 ring-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Left Column: Mission text & quick action CTAs */}
          <div className="lg:col-span-8 space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] sm:text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>ศูนย์กลางประชาสัมพันธ์และสื่อสารองค์กร สตง.</span>
              <span className="text-slate-500">·</span>
              <span className="text-cyan-400 font-mono text-[10px]">SAI THAILAND</span>
            </div>

            {/* Headline reduced 30% */}
            <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-white leading-snug">
              ก้าวสู่ยุคการตรวจเงินแผ่นดินดิจิทัล{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                โปร่งใส แม่นยำ เพื่อประชาชน
              </span>
            </h1>

            {/* Subtitle reduced 30% */}
            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed max-w-2xl">
              สำนักประชาสัมพันธ์และสื่อสารองค์กร สำนักงานการตรวจเงินแผ่นดิน
              พร้อมให้บริการข้อมูลข่าวสาร สื่อมัลติมีเดีย รายงานสถานการณ์อาคาร สตง.
              และเปิดรับคำขอสนับสนุนสื่อสำหรับหน่วยงานทั่วประเทศ
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={onExploreTimeline}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 text-[11px] font-semibold transition-all shadow-sm active:scale-95"
              >
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>สถานการณ์อาคาร สตง.</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <a
                href="https://pr-request-system.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all active:scale-95"
              >
                <span>ขอสนับสนุนสื่อ</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={onOpenChat}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/40 text-[11px] font-medium transition-all active:scale-95"
              >
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span>ผู้ช่วย AI</span>
              </button>
            </div>
          </div>

          {/* Right Column: Compact status indicators with Frosted Blur & Contrast */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-2 text-left">
            <div className="p-2.5 rounded-xl bg-[#040e2b]/90 border border-cyan-500/35 backdrop-blur-md shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-cyan-300 mb-0.5">
                <span>สถานะระบบ</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <span className="block text-base sm:text-lg font-bold text-white font-mono leading-none">100%</span>
              <span className="text-[9px] text-slate-400">Digital Audit ต่อเนื่อง</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#040e2b]/90 border border-cyan-500/35 backdrop-blur-md shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-cyan-300 mb-0.5">
                <span>สายด่วน สตง.</span>
                <Activity className="w-3 h-3 text-cyan-400" />
              </div>
              <span className="block text-base sm:text-lg font-bold text-cyan-400 font-mono leading-none">1730</span>
              <span className="text-[9px] text-slate-400">แจ้งเบาะแส 24 ชม.</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#040e2b]/90 border border-cyan-500/35 backdrop-blur-md shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-cyan-300 mb-0.5">
                <span>ความปลอดภัย</span>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="block text-base sm:text-lg font-bold text-emerald-400 font-mono leading-none">วสท.</span>
              <span className="text-[9px] text-slate-400">เฝ้าระวังโครงสร้าง</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#040e2b]/90 border border-cyan-500/35 backdrop-blur-md shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-cyan-300 mb-0.5">
                <span>เครือข่ายสื่อสาร</span>
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              </div>
              <span className="block text-base sm:text-lg font-bold text-white font-mono leading-none">ทั่วไทย</span>
              <span className="text-[9px] text-slate-400">ครอบคลุมทุกจังหวัด</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
