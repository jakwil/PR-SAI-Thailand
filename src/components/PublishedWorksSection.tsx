import React, { useState } from 'react';
import { ExternalLink, Eye, Calendar, Sparkles, Filter, ArrowUpRight, Share2, Check } from 'lucide-react';
import { PublishedWork } from '../types';
import { ShareModal } from './ShareModal';

interface PublishedWorksSectionProps {
  works: PublishedWork[];
}

export const PublishedWorksSection: React.FC<PublishedWorksSectionProps> = ({ works }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [activeModalWork, setActiveModalWork] = useState<PublishedWork | null>(null);
  const [shareItem, setShareItem] = useState<PublishedWork | null>(null);
  const [copied, setCopied] = useState(false);

  // Extract unique categories
  const categories = ['ทั้งหมด', ...Array.from(new Set(works.map((w) => w.category)))];

  const filteredWorks =
    selectedCategory === 'ทั้งหมด'
      ? works
      : works.filter((w) => w.category === selectedCategory);

  const handleCopyLink = (url: string) => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="published-works" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Dedicated Blurred Ambient Glow Behind Published Works */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-r from-indigo-600/20 via-sky-600/15 to-purple-600/15 rounded-full blur-[130px]" />
      </div>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/35 text-indigo-300 text-xs font-medium mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>คลังผลงานและสื่อประชาสัมพันธ์องค์กร</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
            คลังสื่อดิจิทัล (Digital Media Archive)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            รวบรวมสื่อสารคดี อินโฟกราฟิก และรายงานผลการตรวจสอบเงินแผ่นดินที่เผยแพร่สู่สาธารณะ
          </p>
        </div>

        {/* Category Filter Tabs (Zero-Pill interactive segmented controls) */}
        <div className="flex items-center gap-1.5 p-1 bg-[#05112e]/90 border border-slate-700/80 rounded-xl overflow-x-auto self-start sm:self-auto backdrop-blur-md shadow-inner">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Works with Frosted Glass Blur & Elevated Contrast */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredWorks.map((work) => (
          <div
            key={work.id}
            className="group rounded-2xl bg-[#081a44]/85 border border-cyan-400/35 hover:border-cyan-300/70 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.55)] hover:shadow-[0_12px_40px_rgba(6,182,212,0.25)] backdrop-blur-xl ring-1 ring-white/5 hover:scale-[1.01]"
          >
            <div>
              {/* Thumbnail with overlay */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <img
                  src={work.imageUrl}
                  alt={work.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      '/src/assets/images/sai_audit_hero_1791689796943.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {work.badge && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-amber-500/90 text-slate-950 text-[10px] font-bold">
                    {work.badge}
                  </span>
                )}

                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {work.publishDate}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Eye className="w-3 h-3 text-slate-400" />
                    {work.views}
                  </span>
                </div>
              </div>

              {/* Content text */}
              <div className="p-4 space-y-2">
                <span className="text-[11px] font-medium text-amber-400">
                  {work.category}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-amber-200 transition-colors leading-snug">
                  {work.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {work.description}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => setActiveModalWork(work)}
                className="text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                ดูรายละเอียด
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShareItem(work)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-400/40 text-xs font-medium transition-colors shadow-sm"
                  title="แชร์สื่อนี้"
                >
                  <Share2 className="w-3 h-3 text-cyan-400" />
                  <span>แชร์</span>
                </button>

                <a
                  href={work.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-700/80 text-xs font-medium transition-colors"
                  title="เปิดลิงก์ผลงาน"
                >
                  <span>เปิดดูสื่อ</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail for Published Work */}
      {activeModalWork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setActiveModalWork(null)}
        >
          <div
            className="relative w-full max-w-xl bg-[#0a0d18] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-800">
              <img
                src={activeModalWork.imageUrl}
                alt={activeModalWork.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-xs text-amber-300">
                {activeModalWork.category}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>เผยแพร่เมื่อ: {activeModalWork.publishDate}</span>
                <span>ยอดการเข้าชม: {activeModalWork.views} ครั้ง</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                {activeModalWork.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeModalWork.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShareItem(activeModalWork)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-medium transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>แชร์ผลงานนี้</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModalWork(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  ปิด
                </button>
                <a
                  href={activeModalWork.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
                >
                  <span>เปิดลิงก์ภายนอก</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={!!shareItem}
        onClose={() => setShareItem(null)}
        item={shareItem}
      />
    </section>
  );
};
