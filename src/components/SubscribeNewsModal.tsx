import React, { useState } from 'react';
import { X, Mail, Bell, CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { HeroStory, NewsSubscriber } from '../types';
import { playDigitalSound } from '../utils/audioEffects';

interface SubscribeNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: HeroStory | null;
  onSubscribe: (subscriber: Omit<NewsSubscriber, 'id' | 'subscribedAt'>) => Promise<void> | void;
}

export const SubscribeNewsModal: React.FC<SubscribeNewsModalProps> = ({
  isOpen,
  onClose,
  story,
  onSubscribe,
}) => {
  const [email, setEmail] = useState('');
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !story) return null;

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('กรุณากรอกอีเมลของคุณ');
      playDigitalSound('blip');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMessage('รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง (เช่น yourname@domain.com)');
      playDigitalSound('blip');
      return;
    }

    try {
      setIsSubmitting(true);
      playDigitalSound('select');

      const tags = [story.category || 'ข่าวเด่น'];
      if (weeklyDigest) tags.push('สรุปรายสัปดาห์');

      await onSubscribe({
        email: cleanEmail,
        storyId: story.id,
        storyTitle: story.title,
        category: story.category || 'ข่าวเด่น สตง.',
        active: true,
        tags,
        notifyCount: 0,
      });

      playDigitalSound('confirm');
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Subscription error:', err);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#091d4a] via-[#051336] to-[#020b22] border border-amber-400/50 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.25)] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gold Bar */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
          title="ปิดหน้าต่าง"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_25px_rgba(52,211,153,0.4)] animate-scaleIn">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white tracking-wide">
                ติดตามข่าวเรื่องนี้เรียบร้อยแล้ว!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                ระบบได้บันทึกอีเมล <span className="text-amber-300 font-semibold font-mono">{email}</span> สำหรับรับการแจ้งเตือนแล้ว
              </p>
            </div>

            {/* Subscribed Details Card */}
            <div className="p-3.5 rounded-xl bg-[#03091e]/80 border border-amber-500/30 text-left text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>ข่าวที่คุณติดตาม:</span>
              </div>
              <p className="text-white font-semibold line-clamp-2 pl-5">
                {story.title}
              </p>
              <div className="pl-5 flex items-center gap-2 text-[11px] text-slate-400">
                <span>หมวด: {story.category}</span>
                <span>•</span>
                <span>สตง. จะส่งอีเมลเมื่อมีอัปเดตใหม่</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleClose}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-500/30 transition-all active:scale-95 cursor-pointer"
              >
                เสร็จสิ้น / กลับสู่หน้าเว็บไซต์
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-7 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-sm shrink-0 mt-0.5">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider mb-1 font-mono">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  Hero News Alert
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  ติดตามข่าวสารเรื่องนี้ (Subscribe News)
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  รับอีเมลแจ้งเตือนทันทีเมื่อ สตง. มีการเผยแพร่ความคืบหน้าหรือข่าวสารใหม่ที่เกี่ยวข้อง
                </p>
              </div>
            </div>

            {/* Story Card Preview */}
            <div className="flex gap-3 p-2.5 rounded-xl bg-[#03091e]/90 border border-amber-500/30 backdrop-blur-sm">
              <img
                src={story.imageUrl}
                alt={story.title}
                referrerPolicy="no-referrer"
                className="w-20 h-16 sm:w-24 sm:h-18 object-cover rounded-lg shrink-0 border border-amber-400/30"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/src/assets/images/sai_digital_network_1791693065277.jpg';
                }}
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 text-left">
                <div>
                  <span className="text-[10px] font-medium text-amber-300/90 block">
                    {story.category}
                  </span>
                  <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug mt-0.5">
                    {story.title}
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {story.date}
                </span>
              </div>
            </div>

            {/* Subscription Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="subscriber-email" className="block text-xs font-semibold text-amber-200 mb-1.5 flex items-center justify-between">
                  <span>ระบุอีเมลสำหรับรับข่าวสาร</span>
                  <span className="text-[10px] text-slate-400 font-normal">ความปลอดภัยข้อมูลตามมาตรฐาน สตง.</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 text-amber-400" />
                  </div>
                  <input
                    id="subscriber-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="example@domain.com หรืออีเมลหน่วยงานของคุณ"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#02071a] border border-amber-500/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>
              </div>

              {/* Preferences Checkbox */}
              <div className="space-y-2 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="w-4 h-4 rounded border-amber-500/50 bg-[#02071a] text-amber-500 focus:ring-amber-400 focus:ring-offset-0 cursor-pointer accent-amber-400"
                  />
                  <span>ยินดีรับสรุปข่าวสารและภารกิจสำคัญของ สตง. ทางอีเมล</span>
                </label>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>อีเมลของท่านจะถูกใช้เพื่อการแจ้งเตือนข่าวสาร สตง. เท่านั้น และสามารถยกเลิกได้ตลอดเวลา</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-700 hover:bg-white/5 text-slate-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 text-slate-950" />
                      <span>ยืนยันการติดตามข่าว</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
