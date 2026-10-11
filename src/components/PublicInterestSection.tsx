import React, { useState } from 'react';
import { HelpCircle, ChevronDown, PhoneCall, Search, FileCheck, Share2, ExternalLink, ArrowRight } from 'lucide-react';
import { ShareModal } from './ShareModal';

interface PublicInterestSectionProps {
  onAskAi: (question: string) => void;
}

export const PublicInterestSection: React.FC<PublicInterestSectionProps> = ({ onAskAi }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [shareEaudit, setShareEaudit] = useState<{ id: string; title: string; category?: string; description?: string; linkUrl?: string } | null>(null);

  const faqItems = [
    {
      q: 'ประชาชนสามารถแจ้งเบาะแสการใช้เงินแผ่นดินที่น่าสงสัยได้อย่างไร?',
      a: 'ประชาชนสามารถแจ้งเบาะแสผ่านสายด่วน สตง. 1730 หรือส่งหนังสือร้องเรียนผ่านสำนักตรวจเงินแผ่นดินจังหวัดทั่วประเทศ โดยข้อมูลของผู้แจ้งจะถูกเก็บเป็นความลับตามมาตรการคุ้มครองพยานและผู้แจ้งเบาะแสของ สตง. อย่างเคร่งครัด',
      actionText: 'โทรสายด่วน 1730',
      actionLink: 'tel:1730',
      icon: PhoneCall,
    },
    {
      q: 'วิธีตรวจสอบโครงการก่อสร้างภาครัฐในหมู่บ้านหรือตำบลของตนเอง?',
      a: 'สังเกตป้ายโครงการก่อสร้างซึ่งต้องระบุ: วงเงินงบประมาณ, วันเริ่มต้นและสิ้นสุดสัญญา, ผู้รับจ้าง, และผู้ควบคุมงาน หากพบว่างานก่อสร้างล่าช้าหรือใช้วัสดุไม่ตรงตามมาตรฐาน สามารถถ่ายภาพและแจ้งเบาะแสให้ สตง. ลงพื้นที่ตรวจสอบได้ทันที',
      actionText: 'ถาม AI แนะนำขั้นตอน',
      isAiPrompt: true,
      icon: Search,
    },
    {
      q: 'เหตุการณ์อาคาร สตง. ทรุดตัว กระทบต่อการตรวจสอบเงินแผ่นดินทั่วประเทศหรือไม่?',
      a: 'ไม่กระทบครับ/ค่ะ เนื่องจากสำนักงานการตรวจเงินแผ่นดินได้เปิดศูนย์บัญชาการปฏิบัติการชั่วคราว และปรับสู่ระบบ Digital Audit บน Secure Cloud เต็มรูปแบบ งานตรวจสอบงบประมาณและบัญชีแผ่นดินทั่วประเทศยังดำเนินไปตามกำหนดการ 100%',
      actionText: 'ดูไทม์ไลน์วิศวกรรม',
      actionAnchor: '#incident-timeline',
      icon: FileCheck,
    },
    {
      q: 'หน่วยงานภายนอก ชุมชน หรือสถาบันการศึกษา ขอรับการสนับสนุนสื่อ สตง. ได้อย่างไร?',
      a: 'สามารถขอรับสื่อประชาสัมพันธ์ วิทยากรบรรยาย หรือคลิปวิดีโอเพื่อการศึกษาได้ง่ายๆ ผ่านระบบคำขอออนไลน์ของสำนักประชาสัมพันธ์และสื่อสารองค์กร ที่เว็บไซต์ https://pr-request-system.vercel.app',
      actionText: 'ไปที่ระบบคำขอรับสื่อ',
      actionLink: 'https://pr-request-system.vercel.app',
      icon: ExternalLink,
    },
    {
      q: 'สตง. แตกต่างจาก ป.ป.ช. และ ป.ป.ท. อย่างไร?',
      a: 'สตง. (สำนักงานการตรวจเงินแผ่นดิน) ทำหน้าที่ตรวจสอบความถูกต้อง คุ้มค่า และโปร่งใสของการใช้เงินงบประมาณและทรัพย์สินของแผ่นดิน ส่วน ป.ป.ช. และ ป.ป.ท. มีอำนาจหลักในการไต่สวนชี้มูลความผิดทางวินัยและอาญาเกี่ยวกับการทุจริตประพฤติมิชอบ โดย สตง. จะส่งรายงานผลการตรวจสอบให้ ป.ป.ช./ป.ป.ท. ดำเนินคดีต่อไปเมื่อพบข้อบ่งชี้การทุจริต',
      actionText: 'ถาม AI เพิ่มเติม',
      isAiPrompt: true,
      icon: HelpCircle,
    },
  ];

  return (
    <section id="public-interest" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Dedicated Blurred Ambient Glow Behind e-Audit Section */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-r from-teal-600/18 via-cyan-600/15 to-blue-600/15 rounded-full blur-[130px]" />
      </div>

      {/* Section Header */}
      <div className="mb-8 pb-4 border-b border-slate-800/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-medium mb-3 backdrop-blur-sm">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>ประเด็นเด่นที่ประชาชนสนใจ</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
          ข้อมูล e-Audit (Public Interest & Insights)
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          ตอบข้อสงสัยที่พบบ่อย สิทธิของประชาชนในการมีส่วนร่วมตรวจสอบเงินแผ่นดิน และช่องทางการสื่อสาร
        </p>
      </div>

      {/* Accordion List with Frosted Glass Blur & Elevated Contrast */}
      <div className="grid grid-cols-1 gap-3.5 max-w-4xl mx-auto">
        {faqItems.map((item, idx) => {
          const isOpen = openIndex === idx;
          const Icon = item.icon;

          return (
            <div
              key={idx}
              className={`rounded-2xl transition-all duration-300 border backdrop-blur-xl ring-1 ring-white/5 ${
                isOpen
                  ? 'bg-[#0b2256]/90 border-2 border-cyan-400/60 shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_25px_rgba(6,182,212,0.25)]'
                  : 'bg-[#081a44]/85 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3
                    className={`text-xs sm:text-sm font-semibold transition-colors ${
                      isOpen ? 'text-amber-300' : 'text-white'
                    }`}
                  >
                    {item.q}
                  </h3>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-slate-800/80 animate-fadeIn">
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-11">
                    {item.a}
                  </p>

                  <div className="pl-11 mt-3 flex flex-wrap items-center gap-2">
                    {item.isAiPrompt ? (
                      <button
                        onClick={() => onAskAi(item.q)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors"
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
                          id: `eaudit-${idx}`,
                          title: item.q,
                          category: 'ข้อมูล e-Audit สตง.',
                          description: item.a,
                          linkUrl:
                            typeof window !== 'undefined'
                              ? `${window.location.origin}/#public-interest`
                              : '',
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-medium transition-colors"
                      title="แชร์คำถาม-คำตอบนี้"
                    >
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>แชร์ข้อมูลนี้</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={!!shareEaudit}
        onClose={() => setShareEaudit(null)}
        item={shareEaudit}
      />
    </section>
  );
};
