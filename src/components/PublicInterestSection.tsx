import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  PhoneCall,
  FileCheck,
  Share2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import { ShareModal } from './ShareModal';
import { EAuditDeepDiveModal } from './EAuditDeepDiveModal';
import { EAUDIT_FAQS, EAuditDeepDiveTabId, EAuditFaqItem } from '../data/eAuditData';
import { playDigitalSound } from '../utils/audioEffects';
import { useSiteTheme } from '../contexts/ThemeContext';

interface PublicInterestSectionProps {}

function renderFaqIcon(iconKey: EAuditFaqItem['iconKey']) {
  switch (iconKey) {
    case 'sparkles':
      return <Sparkles className="w-4 h-4" />;
    case 'users':
      return <Users className="w-4 h-4" />;
    case 'compass':
      return <Compass className="w-4 h-4" />;
    case 'cpu':
      return <Cpu className="w-4 h-4" />;
    case 'phone':
      return <PhoneCall className="w-4 h-4" />;
    case 'external':
      return <ExternalLink className="w-4 h-4" />;
    case 'shield':
      return <FileCheck className="w-4 h-4" />;
    default:
      return <HelpCircle className="w-4 h-4" />;
  }
}

export const PublicInterestSection: React.FC<PublicInterestSectionProps> = () => {
  const { isClean } = useSiteTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [shareEaudit, setShareEaudit] = useState<{
    id: string;
    title: string;
    category?: string;
    description?: string;
    linkUrl?: string;
  } | null>(null);
  const [deepDiveTab, setDeepDiveTab] = useState<EAuditDeepDiveTabId>('overview');
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);

  const openDeepDive = (tab: EAuditDeepDiveTabId = 'overview') => {
    playDigitalSound('select');
    setDeepDiveTab(tab);
    setIsDeepDiveOpen(true);
  };

  return (
    <section
      id="public-interest"
      className={`relative w-full py-14 sm:py-16 scroll-mt-20 overflow-hidden transition-colors duration-300 ${
        isClean
          ? 'bg-gradient-to-b from-[#f1f6f3] via-[#f6faf8] to-[#edf4f0]'
          : 'bg-gradient-to-b from-[#031221]/80 via-[#04182a]/75 to-[#02091a]/85'
      }`}
    >
      {/* Section 4 Backdrop: Soft Jade-Celadon Pearl (Clean) / Deep Emerald-Teal Navy (Dark) */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{
            background: isClean
              ? 'radial-gradient(750px 450px at 50% 42%, rgba(16, 185, 129, 0.055), rgba(212, 175, 55, 0.05) 48%, transparent 80%), radial-gradient(600px 380px at 88% 18%, rgba(255, 255, 255, 0.85), transparent 74%)'
              : 'radial-gradient(750px 450px at 50% 42%, rgba(13, 148, 136, 0.16), rgba(8, 145, 178, 0.13) 45%, rgba(37, 99, 235, 0.10) 70%, transparent 82%)',
          }}
        />
        {isClean && (
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.20]"
            preserveAspectRatio="none"
            viewBox="0 0 1440 700"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M-40 220 C 320 150, 620 290, 980 200 C 1220 140, 1360 220, 1500 175" stroke="#b9cfc3" strokeWidth="1.6" strokeOpacity="0.65" />
            <path d="M-60 540 C 300 600, 660 460, 1060 530 C 1260 565, 1400 490, 1500 540" stroke="#d4c7a3" strokeWidth="1.4" strokeOpacity="0.55" />
          </svg>
        )}
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 w-full max-w-[1920px] 2xl:max-w-[2400px] 3xl:max-w-none mx-auto">

      {/* Section Header */}
      <div className={`mb-8 pb-4 border-b ${isClean ? 'border-[#d4af37]/45' : 'border-slate-800/80'}`}>
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-bold mb-3 backdrop-blur-sm ${
            isClean
              ? 'bg-gradient-to-r from-[#fff6d6] to-[#f4dc94] border-[#d4af37]/80 text-[#7a5000] shadow-sm'
              : 'bg-amber-500/15 border-amber-500/35 text-amber-300'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>ประเด็นเด่นที่น่าสนใจ</span>
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isClean ? 'text-slate-900' : 'text-white'
          }`}
        >
          ข้อมูล e-Audit (Public Interest &amp; Insights)
        </h2>
        <p className={`text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed ${isClean ? 'text-slate-700' : 'text-slate-300'}`}>
          เรื่องใหม่และสำคัญของ สตง. กับการตรวจเงินแผ่นดินทางอิเล็กทรอนิกส์ (e-Audit) เริ่มตั้งแต่ปีงบประมาณ 2570 พร้อมสิทธิการมีส่วนร่วมของประชาชน
        </p>
      </div>

      {/* Accordion List */}
      <div className="section-cv grid grid-cols-1 gap-3.5 max-w-4xl 2xl:max-w-5xl mx-auto">
        {EAUDIT_FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={item.id}
              className={`rounded-2xl transition-all duration-300 border ${
                isClean
                  ? isOpen
                    ? 'bg-gradient-to-br from-white via-[#fcf9f2] to-[#f7efdc] border-2 border-[#b8860b] shadow-[0_12px_32px_rgba(161,118,22,0.14)] ring-2 ring-[#d4af37]/25'
                    : 'bg-gradient-to-br from-white to-[#fcf8ee] border-[#d4af37]/50 hover:border-[#b8860b] shadow-[0_4px_18px_rgba(161,118,22,0.06)]'
                  : isOpen
                  ? 'bg-[#0b2256]/96 border-2 border-cyan-400/60 shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-white/5'
                  : 'bg-[#081a44]/94 border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)] ring-1 ring-white/5'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-4 cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5 sm:mt-0 border ${
                      isOpen
                        ? isClean
                          ? 'bg-gradient-to-br from-[#d4af37] to-[#b8860b] text-slate-950 border-[#8a5d00] font-bold shadow-sm'
                          : 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                        : isClean
                        ? 'bg-[#fcf7ea] border-[#d4af37]/55 text-[#8a5d00]'
                        : 'bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    {renderFaqIcon(item.iconKey)}
                  </div>
                  <div className="min-w-0 space-y-1">
                    {item.badge && (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                          isClean
                            ? 'bg-[#fff6d6] border-[#d4af37]/75 text-[#7a5000]'
                            : 'bg-amber-400/15 border-amber-400/35 text-amber-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <h3
                      className={`text-sm sm:text-base font-bold transition-colors leading-snug ${
                        isClean
                          ? isOpen
                            ? 'text-[#7a5000]'
                            : 'text-slate-900'
                          : isOpen
                          ? 'text-amber-300'
                          : 'text-white'
                      }`}
                    >
                      {item.q}
                    </h3>
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                    isOpen
                      ? isClean
                        ? 'rotate-180 text-[#8a5d00]'
                        : 'rotate-180 text-amber-400'
                      : isClean
                      ? 'text-[#b8860b]/70'
                      : 'text-slate-400'
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  className={`px-4 pb-4 sm:px-5 sm:pb-5 pt-2.5 border-t animate-fadeIn ${
                    isClean ? 'border-[#d4af37]/35' : 'border-slate-800/80'
                  }`}
                >
                  <div className="pl-12 space-y-3">
                    <p
                      className={`text-sm sm:text-[15px] leading-relaxed font-medium ${
                        isClean ? 'text-slate-800' : 'text-slate-100'
                      }`}
                    >
                      {item.summary}
                    </p>

                    {item.bullets && item.bullets.length > 0 && (
                      <ul
                        className={`space-y-2 text-sm leading-relaxed ${
                          isClean ? 'text-slate-700' : 'text-slate-200'
                        }`}
                      >
                        {item.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5">
                            <span
                              className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                                isClean ? 'bg-[#b8860b]' : 'bg-amber-400'
                              }`}
                            />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="pt-1.5 flex flex-wrap items-center gap-2">
                      {item.deepDiveTab ? (
                        <button
                          type="button"
                          onClick={() => openDeepDive(item.deepDiveTab)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <span>{item.actionText}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : item.actionAnchor ? (
                        <a
                          href={item.actionAnchor}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                            isClean
                              ? 'bg-[#fff6d6] hover:bg-[#f4dc94] border-[#d4af37]/70 text-[#7a5000]'
                              : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/30 text-amber-300'
                          }`}
                        >
                          <span>{item.actionText}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <a
                          href={item.actionLink}
                          target={item.actionLink?.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
                        >
                          <span>{item.actionText}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setShareEaudit({
                            id: item.id,
                            title: item.q,
                            category: 'ข้อมูล e-Audit สตง. (ปีงบประมาณ 2570)',
                            description: `${item.summary}${
                              item.bullets ? ' • ' + item.bullets.join(' • ') : ''
                            }`,
                            linkUrl:
                              typeof window !== 'undefined'
                                ? `${window.location.origin}/#public-interest`
                                : '',
                          })
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                          isClean
                            ? 'bg-[#fcf7ea] hover:bg-[#f4dc94]/60 text-[#7a5000] border-[#d4af37]/65'
                            : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-400/40'
                        }`}
                        title="แชร์คำถาม-คำตอบนี้"
                      >
                        <Share2 className={`w-3.5 h-3.5 ${isClean ? 'text-[#8a5d00]' : 'text-cyan-400'}`} />
                        <span>แชร์ข้อมูลนี้</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Companion Highlight Card for Deep-Dive Technical Explorer */}
        <div
          className={`relative mt-2 rounded-2xl border-2 px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden ${
            isClean
              ? 'bg-gradient-to-r from-white via-[#fcf7ea] to-[#f5e7c2] border-[#d4af37]/70 shadow-[0_12px_32px_rgba(161,118,22,0.12)]'
              : 'bg-gradient-to-r from-[#071a49]/95 via-[#0b235d]/95 to-[#061539]/95 border-cyan-400/40 shadow-[0_12px_36px_rgba(2,10,31,0.65)]'
          }`}
        >
          {isClean && (
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#a67c00] via-[#f1d57e] to-[#a67c00] pointer-events-none" />
          )}
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 ${
                isClean
                  ? 'bg-gradient-to-br from-[#fff6d6] to-[#f4dc94] border-[#d4af37]/75 text-[#8a5d00]'
                  : 'bg-cyan-400/15 border-cyan-400/40 text-cyan-300'
              }`}
            >
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div
                className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-0.5 ${
                  isClean ? 'text-[#8a5d00]' : 'text-amber-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>ชุดข้อมูล e-Audit ปีงบประมาณ 2570 (ฉบับสมบูรณ์)</span>
              </div>
              <h3 className={`text-base sm:text-lg font-extrabold ${isClean ? 'text-slate-900' : 'text-white'}`}>
                สำรวจเทคโนโลยีการตรวจเงินแผ่นดินยุคดิจิทัล (Drone • GIS • Big Data 5V &amp; AI)
              </h3>
              <p className={`text-sm mt-0.5 ${isClean ? 'text-slate-700' : 'text-slate-200'}`}>
                เจาะลึกโครงสร้าง 11+10 ระบบหลัก แพลตฟอร์ม 13 ระบบ กรณีศึกษาจริง และบริการ Joint SAO (รอภาพประกอบเพิ่มเติม)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openDeepDive('overview')}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer shrink-0 ${
              isClean
                ? 'bg-gradient-to-r from-[#d4af37] via-[#e7c55c] to-[#c5961b] hover:brightness-105 text-slate-950 border border-[#b8860b]'
                : 'bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            <span>เปิดดูข้อมูล e-Audit ครบทุกมิติ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={!!shareEaudit}
        onClose={() => setShareEaudit(null)}
        item={shareEaudit}
      />

      {/* Full-Screen e-Audit Deep Dive Modal */}
      <EAuditDeepDiveModal
        isOpen={isDeepDiveOpen}
        initialTab={deepDiveTab}
        onClose={() => setIsDeepDiveOpen(false)}
      />
      </div>
    </section>
  );
};
