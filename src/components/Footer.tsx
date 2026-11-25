import React from 'react';
import { ExternalLink, Phone, ArrowUp } from 'lucide-react';
import { useSiteTheme } from '../contexts/ThemeContext';

export const Footer: React.FC = () => {
  const { isClean } = useSiteTheme();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className={`section-cv py-12 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 transition-colors ${
        isClean
          ? 'border-t border-slate-200 bg-white text-slate-600'
          : 'border-t border-cyan-500/20 bg-[#020718] text-slate-300'
      }`}
    >
      <div
        className={`w-full max-w-[1920px] 2xl:max-w-[2400px] 3xl:max-w-none mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b ${
          isClean ? 'border-slate-200' : 'border-cyan-500/15'
        }`}
      >
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <img
              src="https://i.postimg.cc/90TgPftw/Untitled-design-2026-10-13T095211-499.png"
              alt="Logo SAI Thailand"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              className="h-9 sm:h-[43px] w-auto max-w-[90px] object-contain drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className={`text-lg font-bold ${isClean ? 'text-slate-900' : 'text-white'}`}>
              PR - SAI Thailand
            </span>
          </div>
          <p className={`text-sm max-w-md leading-relaxed ${isClean ? 'text-slate-600' : 'text-slate-300'}`}>
            สำนักประชาสัมพันธ์และสื่อสารองค์กร สำนักงานการตรวจเงินแผ่นดิน (สตง.)
            มุ่งมั่นเผยแพร่ข้อมูลข่าวสาร สร้างความรู้ความเข้าใจ และส่งเสริมธรรมาภิบาลเพื่อปวงชน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3.5 text-sm font-medium">
          <a
            href="tel:022718000,2224"
            title="ติดต่อสำนักประชาสัมพันธ์และสื่อสารองค์กร 02-271-8000 ต่อ 2224"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-colors ${
              isClean
                ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-sky-400'
                : 'bg-slate-900 border-slate-800 text-slate-200 hover:text-amber-300'
            }`}
          >
            <Phone className={`w-4 h-4 ${isClean ? 'text-sky-600' : 'text-amber-400'}`} />
            <span>02-271-8000 ต่อ 2224</span>
          </a>

          <a
            href="https://pr-request-system.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-semibold transition-colors ${
              isClean
                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:text-white'
            }`}
          >
            <span>ระบบขอรับการสนับสนุนงาน PR</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={scrollToTop}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isClean
                ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="กลับขึ้นบนสุด"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className={`w-full max-w-[1920px] 2xl:max-w-[2400px] 3xl:max-w-none mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-3 ${
          isClean ? 'text-slate-600' : 'text-slate-300'
        }`}
      >
        <span>
          © 2026 PR - SAI Thailand (สำนักงานการตรวจเงินแผ่นดิน). All Rights Reserved.
        </span>
        <div className="flex items-center gap-4 font-medium">
          <a href="#incident-timeline" className={isClean ? 'hover:text-sky-700' : 'hover:text-white'}>
            สถานการณ์อาคาร สตง.
          </a>
          <span className={isClean ? 'text-slate-300' : 'text-slate-700'}>·</span>
          <a href="#published-works" className={isClean ? 'hover:text-sky-700' : 'hover:text-white'}>
            คลังสื่อดิจิทัล
          </a>
          <span className={isClean ? 'text-slate-300' : 'text-slate-700'}>·</span>
          <a href="#public-interest" className={isClean ? 'hover:text-sky-700' : 'hover:text-white'}>
            ข้อมูล e-Audit
          </a>
        </div>
      </div>
    </footer>
  );
};

