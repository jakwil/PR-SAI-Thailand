import React, { useEffect, useState } from 'react';
import {
  X,
  Home,
  Cpu,
  Scale,
  Database,
  Plane,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Compass,
  Layers,
} from 'lucide-react';
import { EAUDIT_DEEP_DIVE, EAuditDeepDiveTabId } from '../data/eAuditData';
import { playDigitalSound } from '../utils/audioEffects';

interface EAuditDeepDiveModalProps {
  isOpen: boolean;
  initialTab?: EAuditDeepDiveTabId;
  onClose: () => void;
}

const TABS: {
  id: EAuditDeepDiveTabId;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'overview',
    label: 'วิสัยทัศน์ & กรอบกฎหมาย 2570',
    shortLabel: 'ภาพรวม 2570',
    icon: <Scale className="w-3.5 h-3.5" />,
  },
  {
    id: 'systems',
    label: 'ระบบ e-Audit (11+10) & 13 ระบบหลัก',
    shortLabel: 'ระบบ e-Audit',
    icon: <Layers className="w-3.5 h-3.5" />,
  },
  {
    id: 'bigdata-ai',
    label: 'Big Data 5V & เทคโนโลยี AI',
    shortLabel: 'Big Data & AI',
    icon: <Database className="w-3.5 h-3.5" />,
  },
  {
    id: 'drone-gis',
    label: 'โดรนสำรวจ & ระบบ GIS',
    shortLabel: 'โดรน & GIS',
    icon: <Plane className="w-3.5 h-3.5" />,
  },
  {
    id: 'joint-hr',
    label: 'Joint SAO & HR Digital',
    shortLabel: 'Joint SAO',
    icon: <Users className="w-3.5 h-3.5" />,
  },
];

export const EAuditDeepDiveModal: React.FC<EAuditDeepDiveModalProps> = ({
  isOpen,
  initialTab = 'overview',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<EAuditDeepDiveTabId>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[75] flex flex-col bg-[#020818] text-slate-100 animate-fadeIn overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="ศูนย์ข้อมูล e-Audit ปีงบประมาณ 2570 สำนักงานการตรวจเงินแผ่นดิน"
    >
      {/* Ambient Background Gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-75"
        style={{
          backgroundImage: [
            'radial-gradient(700px 420px at 50% 0%, rgba(245, 158, 11, 0.14), transparent 70%)',
            'radial-gradient(600px 450px at 12% 75%, rgba(6, 182, 212, 0.13), transparent 70%)',
            'radial-gradient(600px 450px at 88% 80%, rgba(16, 185, 129, 0.10), transparent 70%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      {/* Top Sticky Executive Bar */}
      <header className="relative z-20 shrink-0 bg-[#040f2c]/95 backdrop-blur-xl border-b border-amber-400/30 shadow-[0_6px_30px_rgba(0,0,0,0.65)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/25 to-cyan-500/20 border border-amber-400/50 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(245,158,11,0.25)]">
              <Cpu className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white truncate">
                {EAUDIT_DEEP_DIVE.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-300/90 truncate">
                เริ่มใช้ปีงบประมาณ 2570 (1 ต.ค. 2569) · ข้อมูลฉบับข้อความ (เตรียมรองรับภาพนิทรรศการเพิ่มเติม)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                playDigitalSound('select');
                onClose();
                if (typeof window !== 'undefined') {
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 80);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400 text-amber-200 hover:text-slate-950 border border-amber-400/50 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="กลับสู่หน้าหลัก (Home)"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playDigitalSound('blip');
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/25 border border-slate-600/60 hover:border-rose-400/60 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              title="ปิดหน้าต่างเต็มจอ (Esc)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">ปิดหน้าต่าง</span>
            </button>
          </div>
        </div>

        {/* Category Tabs Bar */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    playDigitalSound('select');
                    setActiveTab(tab.id);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 border-amber-300 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-[#061538]/90 text-slate-300 border-white/15 hover:text-white hover:border-cyan-400/45'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Notice Banner: Text-first phase before photos */}
          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-400/35 flex items-center gap-2 text-xs text-cyan-200">
            <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>
              <strong>ชุดข้อมูล e-Audit ปีงบประมาณ 2570:</strong> นำเสนอสาระสำคัญครบทุกพันธกิจในรูปแบบอ่านง่าย (พร้อมรองรับการอัปโหลดภาพอินโฟกราฟิกเพิ่มเติมในขั้นตอนถัดไป)
            </span>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Vision Banner Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#061438]/90 border border-amber-400/40 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold">
                    วิสัยทัศน์หลัก สตง.
                  </span>
                  <span className="text-xs text-cyan-300 font-semibold">
                    Driving Digital SAO&apos;s DNA
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {EAUDIT_DEEP_DIVE.vision.concept}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {EAUDIT_DEEP_DIVE.vision.description}
                </p>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/35 text-xs sm:text-sm text-amber-100 leading-relaxed">
                  <strong className="text-amber-300 block mb-1">หลักการสำคัญ:</strong>
                  {EAUDIT_DEEP_DIVE.vision.corePrinciple}
                </div>

                {/* 5-Step Audit Journey */}
                <div className="pt-2 space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-cyan-300">
                    วงจรการตรวจสอบดิจิทัล (Audit Journey) 5 ขั้นตอน
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {EAUDIT_DEEP_DIVE.vision.auditJourney.map((stage) => (
                      <div
                        key={stage.step}
                        className="p-3.5 rounded-xl bg-[#040e28]/90 border border-white/12 space-y-1.5"
                      >
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold">
                          {stage.step}
                        </div>
                        <div className="text-xs font-bold text-white">{stage.name}</div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{stage.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5 Core Values */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-300 mb-2">ค่านิยมและเป้าหมายหลัก 5 ประการ</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {EAUDIT_DEEP_DIVE.vision.values.map((val, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-[#040e28]/75 border border-white/10 text-center"
                      >
                        <div className="text-xs font-bold text-amber-300">{val.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{val.en}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legal Framework & FY 2570 Timeline */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#061438]/90 border border-cyan-400/35 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5">
                  <Scale className="w-5 h-5 text-cyan-300 shrink-0" />
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    กรอบเวลา กฎหมาย และบทบาทของระบบ e-Audit (เริ่มปีงบประมาณ 2570)
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#040e28]/90 border border-white/10 space-y-2">
                    <span className="text-[11px] font-bold text-amber-300">อ้างอิงกฎหมายและวันเริ่มใช้</span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {EAUDIT_DEEP_DIVE.legalFramework.gazetteRef}
                    </p>
                    <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-400/35 text-xs font-semibold text-emerald-200">
                      {EAUDIT_DEEP_DIVE.legalFramework.effectiveDate}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#040e28]/90 border border-white/10 space-y-2">
                    <span className="text-[11px] font-bold text-cyan-300">กลุ่มเป้าหมายและกรณีขอขยายเวลา</span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {EAUDIT_DEEP_DIVE.legalFramework.targetAgencies}
                    </p>
                    <p className="text-xs text-amber-200/90 leading-relaxed pt-1 border-t border-white/10">
                      {EAUDIT_DEEP_DIVE.legalFramework.gracePeriod}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30 space-y-1.5">
                    <h4 className="text-xs font-bold text-cyan-300">สิ่งที่เปลี่ยน (What Changes)</h4>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {EAUDIT_DEEP_DIVE.legalFramework.changeComparison.changed}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 space-y-1.5">
                    <h4 className="text-xs font-bold text-emerald-300">สิ่งที่ไม่เปลี่ยน (What Remains)</h4>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {EAUDIT_DEEP_DIVE.legalFramework.changeComparison.unchanged}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'systems' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Mission 1: 13 Main Systems */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#061438]/90 border border-white/15 shadow-xl space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-amber-300">พันธกิจที่ 1</span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    โครงการพัฒนาแพลตฟอร์มการตรวจเงินแผ่นดิน (13 ระบบงานหลักและบริการ)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {EAUDIT_DEEP_DIVE.mission1Systems.map((sys, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-[#040e28]/85 border border-white/10 text-xs text-slate-200 leading-relaxed"
                    >
                      <span className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{sys}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-200">
                  {EAUDIT_DEEP_DIVE.mission1AiNote}
                </div>
              </div>

              {/* Mission 4: e-Audit 11 + 10 */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#061438]/90 border border-cyan-400/30 shadow-xl space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-cyan-300">พันธกิจที่ 4 · แกนกลางระบบ e-Audit</span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    ระบบบริหารงานตรวจสอบ (11 ระบบ) และระบบสนับสนุนการตรวจสอบ (10 ระบบ)
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#040e28]/90 border border-amber-400/30 space-y-2.5">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                      ระบบบริหารงานตรวจสอบ (11 ระบบ)
                    </h4>
                    <ol className="space-y-1.5 text-xs text-slate-200">
                      {EAUDIT_DEEP_DIVE.eAudit11AdminSystems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 font-mono font-bold w-5 shrink-0">{i + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-4 rounded-xl bg-[#040e28]/90 border border-cyan-400/30 space-y-2.5">
                    <h4 className="text-xs sm:text-sm font-bold text-cyan-300">
                      ระบบสนับสนุนการตรวจสอบ (10 ระบบ)
                    </h4>
                    <ol className="space-y-1.5 text-xs text-slate-200">
                      {EAUDIT_DEEP_DIVE.eAudit10SupportSystems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cyan-400 font-mono font-bold w-5 shrink-0">{i + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* SMART SAO + Big Data Platform TOR */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#040e28]/90 border border-white/12 space-y-2">
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-300">
                      ระบบการประชุมและชี้แจงทางอิเล็กทรอนิกส์ (SMART SAO)
                    </h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {EAUDIT_DEEP_DIVE.smartSaoModules.map((mod, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/35 text-xs text-emerald-200 font-medium"
                        >
                          {idx + 1}. {mod}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#040e28]/90 border border-white/12 space-y-2">
                    <h4 className="text-xs sm:text-sm font-bold text-indigo-300">
                      แพลตฟอร์มศูนย์ข้อมูลขนาดใหญ่ (Big Data Platform for State Audit)
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>สถานะ:</strong> {EAUDIT_DEEP_DIVE.bigDataPlatform.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bigdata-ai' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Public Sector Data Integration Flow */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#061438]/90 border border-cyan-400/35 shadow-xl space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  การเชื่อมโยงข้อมูลภาครัฐแบบครบวงจรสู่ Audit Intelligence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#040e28]/90 border border-white/12 space-y-2">
                    <h4 className="text-xs font-bold text-amber-300">1. แหล่งข้อมูลต้นทาง</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {EAUDIT_DEEP_DIVE.dataIntegrationFlow.sources.map((src) => (
                        <span
                          key={src}
                          className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-200"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#040e28]/90 border border-white/12 space-y-2">
                    <h4 className="text-xs font-bold text-cyan-300">2. Data Platform (5 ระบบ)</h4>
                    <ul className="space-y-1 text-[11px] text-slate-200">
                      {EAUDIT_DEEP_DIVE.dataIntegrationFlow.platform5.map((p, i) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-[#040e28]/90 border border-white/12 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-300">3. Analytics, AI & ผลลัพธ์</h4>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {EAUDIT_DEEP_DIVE.dataIntegrationFlow.analytics.map((a) => (
                        <span
                          key={a}
                          className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/35 text-[10px] text-emerald-200"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {EAUDIT_DEEP_DIVE.dataIntegrationFlow.outcomes}
                    </p>
                  </div>
                </div>
              </div>

              {/* Big Data 5V */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#061438]/90 border border-amber-400/35 shadow-xl space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  หลักการ Big Data 5V สำหรับการตรวจเงินแผ่นดิน
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {EAUDIT_DEEP_DIVE.bigData5V.map((v) => (
                    <div
                      key={v.letter}
                      className="p-4 rounded-xl bg-[#040e28]/90 border border-amber-400/25 space-y-2"
                    >
                      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-bold font-mono">
                        {v.letter}
                      </span>
                      <h4 className="text-xs font-bold text-white">{v.name}</h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{v.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI & Analytics Challenger */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#061438]/90 border border-indigo-400/35 shadow-xl space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  การยกระดับการตรวจสอบด้วย AI และ Data Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#040e28]/90 border border-white/10 space-y-1.5">
                    <strong className="text-cyan-300 block">เทคโนโลยีด้าน AI:</strong>
                    <p className="text-slate-200 leading-relaxed">{EAUDIT_DEEP_DIVE.aiCapabilities.aiTools}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#040e28]/90 border border-white/10 space-y-1.5">
                    <strong className="text-amber-300 block">เทคโนโลยีด้าน Data Analytics:</strong>
                    <p className="text-slate-200 leading-relaxed">{EAUDIT_DEEP_DIVE.aiCapabilities.analyticsTools}</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-500/15 border border-indigo-400/35 text-xs text-indigo-100 font-semibold text-center">
                  ความเชื่อมโยง: {EAUDIT_DEEP_DIVE.aiCapabilities.chain}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300 mb-2">
                    กิจกรรมท้าทายทักษะ Data Analytics &amp; AI Challenger (5 ด่าน + โบนัส)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    {EAUDIT_DEEP_DIVE.aiCapabilities.challengerStages.map((stage, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#040e28]/80 border border-white/10 text-[11px] text-slate-200 leading-relaxed"
                      >
                        {stage}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'drone-gis' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 sm:p-6 rounded-2xl bg-[#061438]/90 border border-emerald-400/35 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-300 shrink-0" />
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    4 เทคโนโลยีสำรวจทางอากาศ ดาวเทียม และ GIS พร้อมกรณีศึกษาจริง
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EAUDIT_DEEP_DIVE.droneGis.fourTechnologies.map((tech, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#040e28]/90 border border-emerald-400/25 space-y-2"
                    >
                      <h4 className="text-xs sm:text-sm font-bold text-emerald-300">{tech.name}</h4>
                      <p className="text-xs text-slate-300">{tech.desc}</p>
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-[11px] text-emerald-100 leading-relaxed">
                        {tech.caseStudy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 p-5 rounded-2xl bg-[#061438]/90 border border-white/15 space-y-3">
                  <h4 className="text-sm font-bold text-amber-300">การประยุกต์ใช้ 5 ด้านเพื่อความยั่งยืน</h4>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {EAUDIT_DEEP_DIVE.droneGis.fiveApplications.map((appItem, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{appItem}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-300 pt-2 border-t border-white/10 leading-relaxed">
                    {EAUDIT_DEEP_DIVE.droneGis.flightMission}
                  </p>
                </div>

                <div className="lg:col-span-7 p-5 rounded-2xl bg-[#061438]/90 border border-cyan-400/30 space-y-3">
                  <h4 className="text-sm font-bold text-cyan-300">
                    ยุทโธปกรณ์โดรนสำรวจของ สตง. (4 รุ่นหลัก)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EAUDIT_DEEP_DIVE.droneGis.droneModels.map((drone) => (
                      <div
                        key={drone.model}
                        className="p-3.5 rounded-xl bg-[#040e28]/90 border border-cyan-400/25 space-y-1"
                      >
                        <div className="text-xs font-bold text-amber-300 font-mono">
                          {drone.model}
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">{drone.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'joint-hr' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Joint SAO */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#061438]/90 border border-amber-400/35 shadow-xl space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-amber-300">พันธกิจที่ 3 · การมีส่วนร่วมและความโปร่งใส</span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    Joint SAO ระบบสารสนเทศเพื่อประชาชน ภาคเอกชน และหน่วยรับตรวจ
                  </h3>
                  <p className="text-xs text-amber-200/90 mt-1">
                    &ldquo;{EAUDIT_DEEP_DIVE.jointSao.slogans[0]}&rdquo; · &ldquo;{EAUDIT_DEEP_DIVE.jointSao.slogans[1]}&rdquo;
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {EAUDIT_DEEP_DIVE.jointSao.sixServices.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#040e28]/90 border border-white/12 space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-white">{srv.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{srv.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-[#040e28]/90 border border-cyan-400/30 text-xs text-slate-200 space-y-1">
                  <div>
                    <strong className="text-cyan-300">กลุ่มผู้ใช้งาน (4 กลุ่ม):</strong>{' '}
                    {EAUDIT_DEEP_DIVE.jointSao.userGroups.join(' · ')}
                  </div>
                  <div>
                    <strong className="text-emerald-300">ช่องทางการเข้าถึงและยืนยันตัวตน:</strong>{' '}
                    {EAUDIT_DEEP_DIVE.jointSao.accessChannels}
                  </div>
                </div>
              </div>

              {/* HR Digital Platform */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#061438]/90 border border-cyan-400/30 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-300 shrink-0" />
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    ระบบดิจิทัลด้านทรัพยากรบุคคลและการเรียนรู้ของ สตง. (HR Digital Platform)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {EAUDIT_DEEP_DIVE.hrDigital.map((hr) => (
                    <div
                      key={hr.name}
                      className="p-4 rounded-xl bg-[#040e28]/90 border border-white/12 space-y-1.5"
                    >
                      <h4 className="text-xs font-bold text-cyan-300">{hr.name}</h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{hr.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom quick switch prompt */}
          <div className="pt-2 pb-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                playDigitalSound('blip');
                onClose();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              <span>กลับหน้าเว็บไซต์หลัก</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
