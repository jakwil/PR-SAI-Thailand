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
      {/* Dedicated Ambient Glow Behind e-Audit Section (Zero-blur CSS radial gradient) */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(750px 450px at 50% 42%, rgba(13, 148, 136, 0.16), rgba(8, 145, 178, 0.13) 45%, rgba(37, 99, 235, 0.10) 70%, transparent 82%)',
        }}
      />

      {/* Section Header */}
      <div className="mb-8 pb-4 border-b border-slate-800/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-medium mb-3 backdrop-blur-sm">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>ประเด็นเด่นที่น่าสนใจ</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
          ข้อมูล e-Audit (Public Interest &amp; Insights)
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          เรื่องใหม่และสำคัญของ สตง. กับการตรวจเงินแผ่นดินทางอิเล็กทรอนิกส์ (e-Audit) เริ่มตั้งแต่ปีงบประมาณ 2570 พร้อมสิทธิการมีส่วนร่วมของประชาชน
        </p>
      </div>

      {/* Accordion List (Clean, concise 3-5 line / bullet answers for mobile & desktop) */}
      <div className="section-cv grid grid-cols-1 gap-3.5 max-w-4xl 2xl:max-w-5xl mx-auto">
        {EAUDIT_FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={item.id}
              className={`rounded-2xl transition-all duration-300 border ring-1 ring-white/5 ${
                isOpen
                  ? 'bg-[#0b2256]/96 border-2 border-cyan-400/60 shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_25px_rgba(6,182,212,0.25)]'
                  : 'bg-[#081a44]/94 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-4 cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5 sm:mt-0 ${
                      isOpen
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {renderFaqIcon(item.iconKey)}
                  </div>
                  <div className="min-w-0 space-y-1">
                    {item.badge && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/35 text-[10px] font-semibold text-amber-300">
                        {item.badge}
                      </span>
                    )}
                    <h3
                      className={`text-xs sm:text-sm font-semibold transition-colors leading-snug ${
                        isOpen ? 'text-amber-300' : 'text-white'
                      }`}
                    >
                      {item.q}
                    </h3>
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-slate-800/80 animate-fadeIn">
                  <div className="pl-11 space-y-2.5">
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {item.summary}
                    </p>

                    {item.bullets && item.bullets.length > 0 && (
                      <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                        {item.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
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

        {/* Companion Highlight Card for Deep-Dive Technical Explorer (Separate from Accordion to keep mobile clean) */}
        <div className="mt-2 rounded-2xl bg-gradient-to-r from-[#071a49]/95 via-[#0b235d]/95 to-[#061539]/95 border border-cyan-400/40 px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_12px_36px_rgba(2,10,31,0.65)]">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/15 border border-cyan-400/40 flex items-center justify-center shrink-0 text-cyan-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3 h-3" />
                <span>ชุดข้อมูล e-Audit ปีงบประมาณ 2570 (ฉบับสมบูรณ์)</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                สำรวจเทคโนโลยีการตรวจเงินแผ่นดินยุคดิจิทัล (Drone • GIS • Big Data 5V &amp; AI)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                เจาะลึกโครงสร้าง 11+10 ระบบหลัก แพลตฟอร์ม 13 ระบบ กรณีศึกษาจริง และบริการ Joint SAO (รอภาพประกอบเพิ่มเติม)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openDeepDive('overview')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
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
