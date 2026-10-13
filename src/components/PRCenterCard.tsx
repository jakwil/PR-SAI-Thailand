import React from 'react';
import { ArrowRight, Sparkles, Building2, ExternalLink, Activity, Radio, ShieldCheck } from 'lucide-react';
import { playDigitalSound } from '../utils/audioEffects';

interface PRCenterCardProps {
  onExploreTimeline: () => void;
  onOpenChat: () => void;
}

export const PRCenterCard: React.FC<PRCenterCardProps> = ({
  onExploreTimeline,
  onOpenChat,
}) => {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-2 sm:py-3">
      <div className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-[#081a44]/90 border border-amber-400/35 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(245,158,11,0.15)] backdrop-blur-xl ring-1 ring-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Left Column: Mission text & quick action CTAs */}
          <div className="lg:col-span-8 space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[10px] sm:text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              <span>ศูนย์กลางประชาสัมพันธ์และสื่อสารองค์กร สตง.</span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-400 font-mono text-[10px] font-bold">SAI THAILAND</span>
            </div>

            {/* Headline */}
            <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-white leading-snug">
              ก้าวสู่ยุคการตรวจเงินแผ่นดินดิจิทัล{' '}
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent font-extrabold">
                โปร่งใส แม่นยำ เพื่อประชาชน
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed max-w-2xl">
              สำนักประชาสัมพันธ์และสื่อสารองค์กร สำนักงานการตรวจเงินแผ่นดิน
              พร้อมให้บริการข้อมูลข่าวสาร สื่อมัลติมีเดีย รายงานสถานการณ์อาคาร สตง.
              และเปิดรับคำขอสนับสนุนสื่อสำหรับหน่วยงานทั่วประเทศ
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => {
                  playDigitalSound('select');
                  onExploreTimeline();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-[11px] font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>สถานการณ์อาคาร สตง.</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <a
                href="https://pr-request-system.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playDigitalSound('click')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all active:scale-95"
              >
                <span>ขอสนับสนุนสื่อ</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => {
                  playDigitalSound('select');
                  onOpenChat();
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-900/40 hover:bg-blue-800/50 text-amber-200 border border-amber-400/40 text-[11px] font-medium transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>ผู้ช่วย AI</span>
              </button>
            </div>
          </div>

          {/* Right Column: Compact status indicators with Royal Gold Accents */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-2 text-left">
            <div className="p-2.5 rounded-xl bg-[#040e2b]/95 border border-amber-500/30 backdrop-blur-md shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-amber-300 mb-0.5">
                <span>สถานะระบบ</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <span className="block text-base sm:text-lg font-bold text-white font-mono leading-none">100%</span>
              <span className="text-[9px] text-slate-400">Digital Audit ต่อเนื่อง</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#040e2b]/90 border border-amber-500/30 backdrop-blur-md shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-amber-300 mb-0.5">
                <span>สายด่วน สตง.</span>
                <Activity className="w-3 h-3 text-amber-400" />
              </div>
              <span className="block text-base sm:text-lg font-bold text-amber-400 font-mono leading-none">1730</span>
              <span className="text-[9px] text-slate-400">แจ้งเบาะแส 24 ชม.</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#040e2b]/90 border border-amber-500/30 backdrop-blur-md shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-amber-300 mb-0.5">
                <span>ความปลอดภัย</span>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="block text-base sm:text-lg font-bold text-emerald-400 font-mono leading-none">วสท.</span>
              <span className="text-[9px] text-slate-400">เฝ้าระวังโครงสร้าง</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#040e2b]/90 border border-amber-500/30 backdrop-blur-md shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-amber-300 mb-0.5">
                <span>เครือข่ายสื่อสาร</span>
                <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
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
