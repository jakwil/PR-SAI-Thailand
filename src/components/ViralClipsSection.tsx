import React, { useState } from 'react';
import { Film, Play, Eye, Clock, Share2, Sparkles, X, ExternalLink } from 'lucide-react';
import { ViralClip } from '../types';
import { ShareModal } from './ShareModal';

interface ViralClipsSectionProps {
  clips: ViralClip[];
  onPlayingChange?: (isPlaying: boolean) => void;
}

export const ViralClipsSection: React.FC<ViralClipsSectionProps> = ({ clips, onPlayingChange }) => {
  const [activeClipModal, setActiveClipModal] = useState<ViralClip | null>(null);
  const [shareClip, setShareClip] = useState<ViralClip | null>(null);

  const handleOpenClip = (clip: ViralClip) => {
    setActiveClipModal(clip);
    onPlayingChange?.(true);
  };

  const handleCloseClip = () => {
    setActiveClipModal(null);
    onPlayingChange?.(false);
  };

  return (
    <section id="viral-clips" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Dedicated Blurred Ambient Glow Behind Viral Clips */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl" aria-hidden="true">
        <div className="absolute top-1/4 right-10 w-[700px] h-[450px] bg-gradient-to-r from-rose-600/18 via-amber-600/15 to-blue-600/15 rounded-full blur-[130px]" />
      </div>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs font-medium mb-3 backdrop-blur-sm">
            <Film className="w-3.5 h-3.5" />
            <span>วิดีโอสร้างสรรค์ยอดนิยม</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
            ข่าวสาร & คลิปไวรัลประชาสัมพันธ์ (Viral Media)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            สื่อวิดีโอสั้นและสาระน่ารู้การตรวจเงินแผ่นดินที่เข้าใจง่าย ได้รับความนิยมสูงสุด
          </p>
        </div>

        <span className="text-xs text-cyan-300 font-mono px-2.5 py-1 rounded-lg bg-[#040e2b]/80 border border-cyan-500/30 backdrop-blur-sm">
          อัปเดตเรียลไทม์ {clips.length} คลิป
        </span>
      </div>

      {/* Grid of Viral Clips with Frosted Glass Blur & Elevated Contrast */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clips.map((clip) => (
          <div
            key={clip.id}
            onClick={() => handleOpenClip(clip)}
            className="group cursor-pointer rounded-2xl bg-[#081a44]/85 border border-cyan-400/35 hover:border-amber-400/60 p-3.5 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.55)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.2)] backdrop-blur-xl ring-1 ring-white/5 flex flex-col justify-between hover:scale-[1.01]"
          >
            <div>
              {/* Video Thumbnail with Play Button */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 mb-3">
                <img
                  src={clip.thumbnail}
                  alt={clip.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      '/src/assets/images/sai_public_campaign_1791689820118.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-slate-950 translate-x-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {clip.duration}
                </div>

                {/* View count */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-amber-300 font-mono flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {clip.views}
                </div>
              </div>

              {/* Title & Creator */}
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                {clip.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {clip.creator}
              </p>
            </div>

            {/* Bottom Highlight Kicker & Actions */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-amber-400 font-medium line-clamp-1 max-w-[170px]">
                {clip.highlight}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareClip(clip);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-400/40 text-[10px] font-medium transition-colors"
                  title="แชร์คลิปนี้"
                >
                  <Share2 className="w-3 h-3 text-cyan-400" />
                  <span>แชร์</span>
                </button>
                <span className="text-xs text-slate-400 group-hover:text-white transition-colors">
                  ชมคลิป
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Player Preview */}
      {activeClipModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={handleCloseClip}
        >
          <div
            className="relative w-full max-w-2xl bg-[#090c16] border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <span className="text-xs font-semibold text-amber-300">
                {activeClipModal.creator}
              </span>
              <button
                onClick={handleCloseClip}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img
                src={activeClipModal.thumbnail}
                alt={activeClipModal.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                  <Play className="w-7 h-7 fill-slate-950 translate-x-0.5" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white max-w-md">
                  {activeClipModal.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-sm">
                  {activeClipModal.highlight}
                </p>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between bg-slate-950/80">
              <span className="text-xs text-slate-400">
                ความยาว {activeClipModal.duration} · ยอดชม {activeClipModal.views}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShareClip(activeClipModal)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-medium transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>แชร์คลิปนี้</span>
                </button>
                <a
                  href={activeClipModal.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs"
                >
                  <span>เปิดดูบนช่องทางทางการ</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={!!shareClip}
        onClose={() => setShareClip(null)}
        item={
          shareClip
            ? {
                id: shareClip.id,
                title: shareClip.title,
                category: 'ข่าว & คลิปไวรัล สตง.',
                description: `${shareClip.creator} · ${shareClip.highlight}`,
                linkUrl: shareClip.linkUrl,
              }
            : null
        }
      />
    </section>
  );
};
