import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  ExternalLink,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { recordShareEvent } from '../utils/analytics';
import { playDigitalSound } from '../utils/audioEffects';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    category?: string;
    description?: string;
    imageUrl?: string;
    linkUrl?: string;
    badge?: string;
  } | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [copied, setCopied] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  // Determine final share URL (absolute)
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = item.linkUrl && item.linkUrl.startsWith('http')
    ? item.linkUrl
    : `${currentOrigin}/#item-${item.id}`;

  const shareTitle = `${item.title} | สตง. สำนักงานการตรวจเงินแผ่นดิน`;
  const shareText = `${item.title} - ติดตามข้อมูลข่าวสารและนวัตกรรมตรวจเงินแผ่นดินได้ที่`;

  const handleCopyLink = async () => {
    try {
      playDigitalSound('select');
      await navigator.clipboard.writeText(`${shareTitle}\n${shareUrl}`);
      setCopied(true);
      setLastAction('คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว');
      recordShareEvent(item.id, item.title, 'copy_link', item.category, shareUrl);
      setTimeout(() => {
        setCopied(false);
        setLastAction(null);
      }, 3000);
    } catch {
      // Fallback
    }
  };

  const handleShareFacebook = () => {
    playDigitalSound('blip');
    recordShareEvent(item.id, item.title, 'facebook', item.category, shareUrl);
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`;
    window.open(fbUrl, '_blank', 'width=600,height=500');
    setLastAction('เปิดแชร์ไปยัง Facebook');
  };

  const handleShareLine = () => {
    playDigitalSound('blip');
    recordShareEvent(item.id, item.title, 'line', item.category, shareUrl);
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(lineUrl, '_blank', 'width=600,height=500');
    setLastAction('เปิดแชร์ไปยัง LINE');
  };

  const handleShareTwitter = () => {
    playDigitalSound('blip');
    recordShareEvent(item.id, item.title, 'twitter', item.category, shareUrl);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}&hashtags=สตง,SAIThailand,ตรวจเงินแผ่นดิน,eAudit`;
    window.open(tweetUrl, '_blank', 'width=600,height=500');
    setLastAction('เปิดแชร์ไปยัง X (Twitter)');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        playDigitalSound('select');
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        recordShareEvent(item.id, item.title, 'native', item.category, shareUrl);
        setLastAction('แชร์ผ่านระบบปฏิบัติการสำเร็จ');
      } catch (err) {
        // User cancelled share
      }
    }
  };

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-gradient-to-b from-[#091b48] via-[#061438] to-[#040e29] border-2 border-cyan-400/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] p-5 sm:p-6 text-left space-y-4 animate-scaleUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Holographic Header Laser Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.8)]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>แชร์ข่าว / สื่อ สตง.</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300">
                  PUBLIC SHARE
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                ร่วมสร้างการรับรู้และความโปร่งใสภาครัฐ
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playDigitalSound('switch');
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* News Preview Card */}
        <div className="p-3.5 rounded-xl bg-[#030b22]/90 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold text-cyan-400 font-mono">
              {item.category || 'ข่าว สตง.'}
            </span>
            {item.badge && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                {item.badge}
              </span>
            )}
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
            {item.title}
          </h4>
          {item.description && (
            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
          <div className="text-[10px] text-slate-400 font-mono truncate pt-1 border-t border-slate-800/80">
            {shareUrl}
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-semibold text-slate-300 block">
            เลือกช่องทางแชร์ข่าว:
          </span>

          <div className="grid grid-cols-3 gap-2.5">
            {/* LINE */}
            <button
              onClick={handleShareLine}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#06c755]/15 hover:bg-[#06c755]/25 border border-[#06c755]/40 text-emerald-300 hover:text-emerald-200 transition-all hover:scale-[1.02] group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#06c755] text-slate-950 font-bold flex items-center justify-center text-xs shadow-md mb-1.5 group-hover:scale-110 transition-transform">
                LINE
              </div>
              <span className="text-[11px] font-semibold text-slate-200">แชร์ LINE</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleShareFacebook}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1877f2]/15 hover:bg-[#1877f2]/25 border border-[#1877f2]/40 text-blue-300 hover:text-blue-200 transition-all hover:scale-[1.02] group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#1877f2] text-white font-bold flex items-center justify-center text-sm shadow-md mb-1.5 group-hover:scale-110 transition-transform">
                f
              </div>
              <span className="text-[11px] font-semibold text-slate-200">Facebook</span>
            </button>

            {/* X (Twitter) */}
            <button
              onClick={handleShareTwitter}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 text-slate-200 hover:text-white transition-all hover:scale-[1.02] group"
            >
              <div className="w-8 h-8 rounded-lg bg-black text-white font-bold flex items-center justify-center text-xs border border-white/20 shadow-md mb-1.5 group-hover:scale-110 transition-transform">
                𝕏
              </div>
              <span className="text-[11px] font-semibold text-slate-200">X (Twitter)</span>
            </button>
          </div>

          {/* Native Mobile Share if supported */}
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-semibold text-xs transition-colors"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>แชร์ผ่านแอปอื่นในอุปกรณ์ (มือถือ / แท็บเล็ต)</span>
            </button>
          )}

          {/* Copy Link Direct Button */}
          <div className="pt-2">
            <button
              onClick={handleCopyLink}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                copied
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>คัดลอกลิงก์สำเร็จแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>คัดลอกลิงก์ข่าว (Copy Link)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {lastAction && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{lastAction}</span>
          </div>
        )}
      </div>
    </div>
  );
};
