import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Camera,
  Cpu,
  Building2,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { playDigitalSound } from '../utils/audioEffects';

interface AICoverStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyTitle?: string;
  subtitle?: string;
  category?: string;
  onSelectImage: (imageUrl: string) => void;
}

export const AICoverStudioModal: React.FC<AICoverStudioModalProps> = ({
  isOpen,
  onClose,
  storyTitle = '',
  subtitle = '',
  category = '',
  onSelectImage,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<'inspection' | 'digital' | 'official' | 'infographic'>('digital');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResultUrl, setCurrentResultUrl] = useState<string | null>(null);
  const [generationNote, setGenerationNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Curated High-Quality 16:9 SAI Thailand Covers for instant fallback/selection
  const curatedCovers = [
    {
      id: 'insp-1',
      title: 'วิศวกรและผู้บริหาร สตง. ตรวจงานโครงสร้าง',
      styleName: 'ภาพถ่ายข่าวสมจริง',
      category: 'การลงพื้นที่ตรวจสอบ',
      url: '/src/assets/images/sai_hero_inspection_1792297056517.jpg',
    },
    {
      id: 'digi-1',
      title: 'ศูนย์ปฏิบัติการ Digital Audit & ข้อมูลงบประมาณ',
      styleName: 'เทคโนโลยีดิจิทัล AI',
      category: 'นวัตกรรมดิจิทัล',
      url: '/src/assets/images/sai_digital_audit_ai_1792297056483.jpg',
    },
    {
      id: 'press-1',
      title: 'ภาพชุดการประชุมแถลงข่าว คณะผู้บริหาร สตง.',
      styleName: 'แถลงข่าวทางการ',
      category: 'ข่าวภาพนิ่ง',
      url: '/src/assets/images/sai_press_photo_1791791796122.jpg',
    },
    {
      id: 'info-1',
      title: 'Infographic: สรุปผลสัมฤทธิ์และดัชนีความโปร่งใส',
      styleName: 'สรุปสาระสำคัญ',
      category: 'อินโฟกราฟิก',
      url: '/src/assets/images/sai_infographic_stats_1791791809566.jpg',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setPrompt(storyTitle || 'ภารกิจตรวจสอบเงินแผ่นดินเพื่อประโยชน์สูงสุดของประเทศชาติ');
      setCurrentResultUrl(null);
      setError(null);
      setGenerationNote(null);
    }
  }, [isOpen, storyTitle]);

  if (!isOpen) return null;

  const handleGenerateCover = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setGenerationNote(null);
      playDigitalSound('select');

      const res = await fetch('/api/ai/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          storyTitle,
          subtitle,
          category,
          style: selectedStyle,
          aspectRatio: '16:9',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'สร้างภาพ COVER ไม่สำเร็จ');
      }

      if (data.imageUrl) {
        setCurrentResultUrl(data.imageUrl);
        if (data.note) setGenerationNote(data.note);
        playDigitalSound('confirm');
      } else {
        throw new Error('ไม่ได้รับข้อมูลรูปภาพจาก AI');
      }
    } catch (err: any) {
      console.error('Generate cover error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างภาพ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyImage = (url: string) => {
    playDigitalSound('confirm');
    onSelectImage(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-3xl my-6 rounded-2xl bg-gradient-to-b from-[#081b47] via-[#051438] to-[#020b22] border border-cyan-400/50 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(6,182,212,0.25)] text-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Accent */}
        <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-blue-400 to-amber-400 shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/25 flex items-center justify-between shrink-0 bg-[#03091e]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Wand2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">
                AI Cover Studio (High Quality 16:9)
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                ให้ AI ออกแบบภาพ COVER ข่าว Hero อัตโนมัติ
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Story Context Card */}
          <div className="p-3.5 rounded-xl bg-[#02081c] border border-cyan-500/30 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {category || 'ข่าวประชาสัมพันธ์ สตง.'}
                </span>
                <span className="text-[10px] text-slate-400">อัตราส่วนภาพ: 16:9 Widescreen คมชัดสูง</span>
              </div>
              <h4 className="font-bold text-white text-sm line-clamp-1">{storyTitle || 'ระบุชื่อหัวข้อข่าว'}</h4>
              {subtitle && <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {/* Style Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-cyan-300">
              1. เลือกสไตล์ภาพปกที่ต้องการ (Visual Theme)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  playDigitalSound('select');
                  setSelectedStyle('digital');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedStyle === 'digital'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-[#030a21] border-slate-750 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5 text-cyan-300">
                  <Cpu className="w-4 h-4" />
                  <span className="font-bold">Digital Audit</span>
                </div>
                <span className="text-[10px] text-slate-300">โฮโลกราฟิก 3D แผนที่ไทย เครือข่ายงบประมาณ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playDigitalSound('select');
                  setSelectedStyle('inspection');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedStyle === 'inspection'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-[#030a21] border-slate-750 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5 text-emerald-300">
                  <Camera className="w-4 h-4" />
                  <span className="font-bold">ลงพื้นที่ตรวจสอบ</span>
                </div>
                <span className="text-[10px] text-slate-300">วิศวกร สตง. หมวกนิรภัย ตรวจแบบแปลนจริง</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playDigitalSound('select');
                  setSelectedStyle('official');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedStyle === 'official'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-[#030a21] border-slate-750 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5 text-amber-300">
                  <Building2 className="w-4 h-4" />
                  <span className="font-bold">แถลงข่าวทางการ</span>
                </div>
                <span className="text-[10px] text-slate-300">ห้องแถลงข่าว สตง. ตราสัญลักษณ์ทองหลวง</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playDigitalSound('select');
                  setSelectedStyle('infographic');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedStyle === 'infographic'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-[#030a21] border-slate-750 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5 text-purple-300">
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-bold">Infographic</span>
                </div>
                <span className="text-[10px] text-slate-300">กราฟิกสถิติดิจิทัล คอนทราสต์คมชัด ทันสมัย</span>
              </button>
            </div>
          </div>

          {/* Prompt Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              2. ข้อความอธิบายภาพ (Prompt ให้ AI ออกแบบ)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="ระบุคำสั่งภาพ หรือใช้เนื้อหาข่าวอัตโนมัติ..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#02071a] border border-cyan-500/40 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-300"
              />
              <button
                type="button"
                onClick={handleGenerateCover}
                disabled={isGenerating || !prompt}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/30 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'กำลังสร้างภาพ...' : 'สร้างภาพด้วย AI'}</span>
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generation Note */}
          {generationNote && (
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{generationNote}</span>
            </div>
          )}

          {/* Generated Result Preview (If just generated) */}
          {currentResultUrl && (
            <div className="p-4 rounded-xl bg-[#02081a] border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>ผลลัพธ์ภาพ COVER ที่สร้างสำเร็จ (16:9)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Ready to Apply</span>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden border border-cyan-500/50 group">
                <img
                  src={currentResultUrl}
                  alt="Generated Cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleApplyImage(currentResultUrl)}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/30 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>นำภาพนี้ไปใช้เป็น COVER ทันที</span>
                </button>
              </div>
            </div>
          )}

          {/* Curated Pre-Generated 16:9 Gallery */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                หรือเลือกจากภาพ COVER คุณภาพสูงระดับ 8K ที่เตรียมไว้สำหรับ สตง.
              </label>
              <span className="text-[10px] text-cyan-400">คลิกที่ภาพเพื่อเลือกทันที</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {curatedCovers.map((cov) => (
                <div
                  key={cov.id}
                  onClick={() => handleApplyImage(cov.url)}
                  className="group relative rounded-xl border border-slate-700/80 hover:border-cyan-400 bg-[#02071a] overflow-hidden cursor-pointer transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] flex flex-col"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={cov.url}
                      alt={cov.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-black/70 backdrop-blur-sm text-cyan-300 border border-cyan-400/30 font-mono">
                      {cov.styleName}
                    </div>
                  </div>
                  <div className="p-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h5 className="font-semibold text-white text-xs truncate group-hover:text-cyan-300 transition-colors">
                        {cov.title}
                      </h5>
                      <span className="text-[10px] text-slate-400">{cov.category}</span>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-md bg-cyan-500/20 group-hover:bg-cyan-400 text-cyan-300 group-hover:text-slate-950 font-bold text-[10px] shrink-0 transition-colors"
                    >
                      เลือก
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#03091e]/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
