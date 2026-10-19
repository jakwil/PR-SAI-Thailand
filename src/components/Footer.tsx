import React from 'react';
import { ExternalLink, Phone, Shield, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-cyan-500/20 bg-[#020718] text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-cyan-500/15">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <img
              src="https://i.postimg.cc/90TgPftw/Untitled-design-2026-10-13T095211-499.png"
              alt="Logo SAI Thailand"
              referrerPolicy="no-referrer"
              className="h-9 sm:h-[43px] w-auto max-w-[90px] object-contain drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-base font-bold text-white">
              PR - SAI Thailand
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            สำนักประชาสัมพันธ์และสื่อสารองค์กร สำนักงานการตรวจเงินแผ่นดิน (สตง.)
            มุ่งมั่นเผยแพร่ข้อมูลข่าวสาร สร้างความรู้ความเข้าใจ และส่งเสริมธรรมาภิบาลเพื่อปวงชน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <a
            href="tel:1730"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>สายด่วน สตง. 1730</span>
          </a>

          <a
            href="https://pr-request-system.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:text-white transition-colors"
          >
            <span>ระบบขอรับการสนับสนุนสื่อ</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={scrollToTop}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="กลับขึ้นบนสุด"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <span>
          © 2026 PR - SAI Thailand (สำนักงานการตรวจเงินแผ่นดิน). All Rights Reserved.
        </span>
        <div className="flex items-center gap-4">
          <a href="#incident-timeline" className="hover:text-slate-300">
            สถานการณ์อาคาร สตง.
          </a>
          <span className="text-slate-700">·</span>
          <a href="#published-works" className="hover:text-slate-300">
            คลังสื่อดิจิทัล
          </a>
          <span className="text-slate-700">·</span>
          <a href="#public-interest" className="hover:text-slate-300">
            ข้อมูล e-Audit
          </a>
        </div>
      </div>
    </footer>
  );
};
