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

  // Filter options with dedicated media format shortcuts
  const filterOptions = [
    { label: 'ทั้งหมด', value: 'ทั้งหมด' },
    { label: '📷 ข่าวภาพนิ่ง', value: 'photo' },
    { label: '📊 อินโฟกราฟิก', value: 'infographic' },
    { label: '🎬 วิดีโอ & สารคดี', value: 'video' },
  ];

  const filteredWorks = works.filter((work) => {
    if (selectedCategory === 'ทั้งหมด') return true;
    if (selectedCategory === 'photo') {
      return work.mediaType === 'photo' || work.category.includes('ภาพ');
    }
    if (selectedCategory === 'infographic') {
      return work.mediaType === 'infographic' || work.category.includes('อินโฟ') || work.category.includes('กราฟิก');
    }
    if (selectedCategory === 'video') {
      return work.mediaType === 'video' || work.category.includes('วิดีโอ') || work.category.includes('สารคดี');
    }
    return work.category === selectedCategory;
  });

  const getMediaBadgeInfo = (work: PublishedWork) => {
    if (work.mediaType === 'photo' || work.category.includes('ภาพ')) {
      return {
        label: '📷 ข่าวภาพนิ่ง',
        colorClass: 'bg-emerald-500/90 text-slate-950 border-emerald-400/40',
      };
    }
    if (work.mediaType === 'infographic' || work.category.includes('อินโฟ')) {
      return {
        label: '📊 อินโฟกราฟิก',
        colorClass: 'bg-amber-400/95 text-slate-950 border-amber-300/50',
      };
    }
    if (work.mediaType === 'video' || work.category.includes('วิดีโอ') || work.category.includes('สารคดี')) {
      return {
        label: '🎬 วิดีโอข่าว',
        colorClass: 'bg-rose-500/90 text-white border-rose-400/40',
      };
    }
    return {
      label: '📄 รายงานทางการ',
      colorClass: 'bg-blue-500/90 text-white border-blue-400/40',
    };
  };

  const isVideoItem = (work: PublishedWork) => {
    return work.mediaType === 'video' || work.category.includes('วิดีโอ') || work.category.includes('สารคดี');
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
            <span>คลังผลงานและสื่อประชาสัมพันธ์องค์กร (ครบครัน ภาพนิ่ง · Infographic · วิดีโอ)</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
            คลังสื่อดิจิทัล & ข่าวสารมัลติมีเดีย (Media Archive)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            รวบรวมข่าวภาพนิ่ง สื่ออินโฟกราฟิกสรุปข้อมูล และวิดีโอสารคดีผลการตรวจสอบเงินแผ่นดิน สตง.
          </p>
        </div>

        {/* Media Format Filter Tabs (ภาพนิ่ง · Infographic · วิดีโอ) */}
        <div className="flex items-center gap-1.5 p-1 bg-[#05112e]/90 border border-amber-400/30 rounded-xl overflow-x-auto self-start sm:self-auto backdrop-blur-md shadow-inner">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedCategory(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === opt.value
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Works with Frosted Glass Blur & Elevated Contrast */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredWorks.map((work) => {
          const mediaBadge = getMediaBadgeInfo(work);
          const isVideo = isVideoItem(work);

          return (
            <div
              key={work.id}
              className="group rounded-2xl bg-[#081a44]/85 border border-cyan-400/35 hover:border-amber-400/70 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.55)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.25)] backdrop-blur-xl ring-1 ring-white/5 hover:scale-[1.01]"
            >
              <div>
                {/* Thumbnail with overlay & Play button if video */}
                <div 
                  className="relative aspect-[16/10] overflow-hidden bg-slate-900 cursor-pointer"
                  onClick={() => setActiveModalWork(work)}
                >
                  <img
                    src={work.imageUrl}
                    alt={work.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        '/src/assets/images/sai_audit_hero_1791689796943.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

                  {/* Media Format Indicator Tag */}
                  <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold shadow-md ${mediaBadge.colorClass}`}>
                    {mediaBadge.label}
                  </span>

                  {/* Video Play Overlay */}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="translate-x-0.5 text-base">▶</span>
                      </div>
                    </div>
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
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <span className="font-semibold text-amber-400 truncate">
                      {work.category}
                    </span>
                    {work.badge && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] shrink-0 border border-amber-400/30">
                        {work.badge}
                      </span>
                    )}
                  </div>
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
                  className="text-xs font-semibold text-amber-300 hover:text-white transition-colors"
                >
                  {isVideo ? '▶ รับชมวิดีโอ' : 'ดูรายละเอียดภาพ'}
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
                    <span>เปิดดู</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
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
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-amber-400/30 bg-slate-950">
              <img
                src={activeModalWork.imageUrl}
                alt={activeModalWork.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold shadow-lg ${getMediaBadgeInfo(activeModalWork).colorClass}`}>
                {getMediaBadgeInfo(activeModalWork).label}
              </span>

              {isVideoItem(activeModalWork) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-4">
                  <a
                    href={activeModalWork.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 h-16 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:scale-110 transition-transform mb-2"
                  >
                    <span className="translate-x-0.5 text-2xl font-bold">▶</span>
                  </a>
                  <span className="text-xs text-amber-200 font-medium bg-black/60 px-3 py-1 rounded-full border border-amber-400/40">
                    คลิกเพื่อเปิดเล่นวิดีโอ
                  </span>
                </div>
              )}

              <span className="absolute bottom-2 left-3 px-2 py-0.5 rounded bg-black/70 text-xs text-amber-300 border border-amber-400/20">
                {activeModalWork.category}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>เผยแพร่เมื่อ: {activeModalWork.publishDate}</span>
                <span>ยอดการเข้าชม: {activeModalWork.views} ครั้ง</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                {activeModalWork.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#05112e]/60 p-3 rounded-xl border border-slate-800">
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
                <span>แชร์สื่อนี้</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModalWork(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  ปิด
                </button>
                <a
                  href={activeModalWork.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
                >
                  <span>{isVideoItem(activeModalWork) ? 'เปิดดูวิดีโอนี้' : 'เปิดดูสื่อต้นฉบับ'}</span>
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
