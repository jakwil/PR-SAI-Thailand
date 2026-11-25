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
      className="relative py-16 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 w-full max-w-[1920px] 2xl:max-w-[2400px] 3xl:max-w-none mx-auto scroll-mt-20"
    >
      {/* Dedicated Ambient Glow Behind e-Audit Section */}
      {!isClean && (
        <div
          className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(750px 450px at 50% 42%, rgba(13, 148, 136, 0.16), rgba(8, 145, 178, 0.13) 45%, rgba(37, 99, 235, 0.10) 70%, transparent 82%)',
          }}
        />
      )}

      {/* Section Header */}
      <div className={`mb-8 pb-4 border-b ${isClean ? 'border-slate-200' : 'border-slate-800/80'}`}>
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-bold mb-3 backdrop-blur-sm ${
            isClean
              ? 'bg-amber-50 border-amber-300 text-amber-800'
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
        <p className={`text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed ${isClean ? 'text-slate-600' : 'text-slate-300'}`}>
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
                    ? 'bg-white border-2 border-sky-500 shadow-lg ring-2 ring-sky-100'
                    : 'bg-white border-slate-200 hover:border-sky-400 shadow-sm'
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
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5 sm:mt-0 ${
                      isOpen
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : isClean
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {renderFaqIcon(item.iconKey)}
                  </div>
                  <div className="min-w-0 space-y-1">
                    {item.badge && (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                          isClean
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
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
                            ? 'text-sky-700'
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
                        ? 'rotate-180 text-sky-600'
                        : 'rotate-180 text-amber-400'
                      : 'text-slate-400'
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  className={`px-4 pb-4 sm:px-5 sm:pb-5 pt-2.5 border-t animate-fadeIn ${
                    isClean ? 'border-slate-200' : 'border-slate-800/80'
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
                                isClean ? 'bg-sky-600' : 'bg-amber-400'
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition-colors"
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-medium transition-colors cursor-pointer"
                        title="แชร์คำถาม-คำตอบนี้"
                      >
                        <Share2 className="w-3.5 h-3.5 text-cyan-400" />
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
          className={`mt-2 rounded-2xl border px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isClean
              ? 'bg-gradient-to-r from-sky-50 via-white to-amber-50/70 border-sky-200 shadow-sm'
              : 'bg-gradient-to-r from-[#071a49]/95 via-[#0b235d]/95 to-[#061539]/95 border-cyan-400/40 shadow-[0_12px_36px_rgba(2,10,31,0.65)]'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isClean
                  ? 'bg-sky-100 border-sky-300 text-sky-700'
                  : 'bg-cyan-400/15 border-cyan-400/40 text-cyan-300'
              }`}
            >
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div
                className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-0.5 ${
                  isClean ? 'text-amber-700' : 'text-amber-300'
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
                ? 'bg-sky-600 hover:bg-sky-700 text-white'
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
    </section>
  );
};
