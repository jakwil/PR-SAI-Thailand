import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  Mail,
  CheckCircle2,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  ExternalLink,
  Plus,
  Zap,
  RefreshCw
} from 'lucide-react';
import { HeroStory, NewsSubscriber, NewsBroadcastLog } from '../types';
import { playDigitalSound } from '../utils/audioEffects';
import { SmtpConfigModal } from './SmtpConfigModal';

interface PublishBroadcastConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: HeroStory;
  subscribers: NewsSubscriber[];
  onConfirmPublishAndBroadcast: (
    story: HeroStory,
    broadcastPayload?: {
      recipients: string[];
      subject: string;
      body: string;
      aiGenerated: boolean;
    }
  ) => Promise<void> | void;
  onConfirmPublishOnly: (story: HeroStory) => Promise<void> | void;
}

export const PublishBroadcastConfirmModal: React.FC<PublishBroadcastConfirmModalProps> = ({
  isOpen,
  onClose,
  story,
  subscribers,
  onConfirmPublishAndBroadcast,
  onConfirmPublishOnly,
}) => {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [extraEmails, setExtraEmails] = useState<string[]>([]);
  const [newRecipientInput, setNewRecipientInput] = useState('');
  const [isInstantTesting, setIsInstantTesting] = useState(false);
  const [instantTestResult, setInstantTestResult] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRationale, setAiRationale] = useState<string | null>(null);
  const [aiReasonsMap, setAiReasonsMap] = useState<Record<string, string>>({});
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [hasRunAi, setHasRunAi] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<any>(null);
  const [showSmtpModal, setShowSmtpModal] = useState(false);

  const fetchSmtpStatus = async () => {
    try {
      const res = await fetch('/api/email/smtp-status');
      if (res.ok) {
        const data = await res.json();
        setSmtpStatus(data);
      }
    } catch (e) {
      console.warn('Failed to fetch smtp status', e);
    }
  };

  // Initialize selected emails, default draft, and check smtp status when modal opens
  useEffect(() => {
    if (isOpen && story) {
      fetchSmtpStatus();
      const activeSubs = subscribers.filter((s) => s.active !== false);
      const allEmails = Array.from(new Set([
        'jakwil@jakwil.page',
        ...activeSubs.map((s) => s.email)
      ]));
      setSelectedEmails(allEmails);

      setSubject(`📢 ข่าวประชาสัมพันธ์ สตง. ล่าสุด: ${story.title.slice(0, 50)}...`);
      setBody(
        `เรียน ท่านผู้ติดตามข่าวสารสำนักงานการตรวจเงินแผ่นดิน (สตง.)\n\nสำนักประชาสัมพันธ์และสื่อสารองค์กร สตง. ขอแจ้งข่าวประชาสัมพันธ์ล่าสุด:\n\n• ${story.title}\n• หมวดหมู่: ${story.category || 'ข่าวเด่น สตง.'}\n• สาระสำคัญ: ${story.subtitle || 'ติดตามข้อมูล ข้อเท็จจริง และความคืบหน้าของภารกิจตรวจเงินแผ่นดิน'}\n• วันที่: ${story.date || 'ปัจจุบัน'}\n\nท่านสามารถเข้าดูรายละเอียดและภาพข่าวฉบับเต็มได้ทางเว็บไซต์ PR - SAI Thailand`
      );
      setAiRationale(null);
      setAiReasonsMap({});
      setHasRunAi(false);
    }
  }, [isOpen, story, subscribers]);

  if (!isOpen || !story) return null;

  const activeSubscribers = subscribers.filter((s) => s.active !== false);

  const handleAddExtraEmail = (emailToAdd: string) => {
    const trimmed = emailToAdd.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) return;
    if (!extraEmails.includes(trimmed)) {
      setExtraEmails((prev) => [...prev, trimmed]);
    }
    if (!selectedEmails.includes(trimmed)) {
      setSelectedEmails((prev) => [...prev, trimmed]);
    }
    setNewRecipientInput('');
    playDigitalSound('confirm');
  };

  const handleInstantTestSend = async (targetEmail: string) => {
    if (!targetEmail) return;
    try {
      setIsInstantTesting(true);
      setInstantTestResult(null);
      playDigitalSound('select');

      const res = await fetch('/api/email/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const isJakwil = targetEmail.toLowerCase().endsWith('@jakwil.page');
        setInstantTestResult({
          type: isJakwil ? 'warning' : 'success',
          message: isJakwil
            ? `เซิร์ฟเวอร์ส่งคำขอแล้ว แต่เนื่องจากโดเมน @jakwil.page ไม่มีระบบเซิร์ฟเวอร์รับอีเมล (ไม่มี DNS MX Records) ข้อความจึงไม่สามารถเข้ากล่องจดหมายได้ กรุณาระบุเป็นอีเมลจริง เช่น Gmail (@gmail.com) หรือ Hotmail ด้านล่างนี้เพื่อทดสอบรับข้อความจริง`
            : `ส่งอีเมลจริงไปยัง ${targetEmail} สำเร็จแล้ว! (Message ID: ${data.messageId || 'OK'})`,
          recipient: targetEmail,
        });
        playDigitalSound('confirm');
      } else {
        setInstantTestResult({
          type: 'error',
          message: data.error || 'ส่งอีเมลทดสอบไม่สำเร็จ โปรดตรวจสอบการตั้งค่า SMTP',
        });
      }
    } catch (err: any) {
      setInstantTestResult({
        type: 'error',
        message: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
      });
    } finally {
      setIsInstantTesting(false);
    }
  };

  const adminEmail = 'jakwil@jakwil.page';
  const hasAdminInSubs = activeSubscribers.some(
    (s) => s.email.toLowerCase() === adminEmail.toLowerCase()
  );

  const allSubscribersWithExtra = [
    ...(!hasAdminInSubs
      ? [
          {
            id: `admin_${adminEmail}`,
            email: adminEmail,
            storyTitle: 'อีเมลผู้ดูแลระบบ (Admin Copy)',
            category: 'ผู้ดูแลระบบ',
            subscribedAt: new Date().toISOString(),
            active: true,
          },
        ]
      : []),
    ...activeSubscribers,
    ...extraEmails
      .filter(
        (extra) =>
          extra.toLowerCase() !== adminEmail.toLowerCase() &&
          !activeSubscribers.some((s) => s.email.toLowerCase() === extra.toLowerCase())
      )
      .map((extra) => ({
        id: `extra_${extra}`,
        email: extra,
        storyTitle: 'อีเมลที่ระบุเพิ่มเติมโดยแอดมิน',
        category: 'ผู้รับเพิ่มเติม / ทดสอบ',
        subscribedAt: new Date().toISOString(),
        active: true,
      })),
  ];

  // Toggle email selection
  const handleToggleEmail = (email: string) => {
    playDigitalSound('blip');
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter((e) => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const handleSelectAll = () => {
    playDigitalSound('click');
    setSelectedEmails(allSubscribersWithExtra.map((s) => s.email));
  };

  const handleDeselectAll = () => {
    playDigitalSound('click');
    setSelectedEmails([]);
  };

  // Trigger Gemini AI Recommendation & Email Drafting
  const handleRunAiRecommendation = async () => {
    try {
      setIsAiLoading(true);
      playDigitalSound('select');

      const res = await fetch('/api/ai/recommend-news-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story,
          subscribers: activeSubscribers.map((s) => ({
            id: s.id,
            email: s.email,
            storyTitle: s.storyTitle,
            category: s.category,
            tags: s.tags,
          })),
        }),
      });

      if (!res.ok) throw new Error('AI recommendation service unavailable');

      const data = await res.json();

      if (data.recommendedEmails && Array.isArray(data.recommendedEmails)) {
        setSelectedEmails(data.recommendedEmails);
      }

      if (data.rationale) {
        setAiRationale(data.rationale);
      }

      if (data.recipientDetails && Array.isArray(data.recipientDetails)) {
        const map: Record<string, string> = {};
        data.recipientDetails.forEach((r: any) => {
          if (r.email && r.reason) map[r.email] = r.reason;
        });
        setAiReasonsMap(map);
      }

      if (data.emailDraft) {
        if (data.emailDraft.subject) setSubject(data.emailDraft.subject);
        if (data.emailDraft.body) {
          const fullBody = `${data.emailDraft.greeting || 'เรียน ท่านผู้ติดตามข่าวสาร สตง.'}\n\n${data.emailDraft.body}\n\n${data.emailDraft.signOff || 'สำนักประชาสัมพันธ์และสื่อสารองค์กร สตง.'}`;
          setBody(fullBody);
        }
      }

      setHasRunAi(true);
      setShowEmailPreview(true);
      playDigitalSound('confirm');
    } catch (err) {
      console.error('AI Recommendation Error:', err);
      // Fallback client-side matching
      const storyCat = (story.category || '').toLowerCase();
      const matched = activeSubscribers.filter(
        (s) =>
          (s.category && s.category.toLowerCase().includes(storyCat)) ||
          storyCat.includes((s.category || '').toLowerCase())
      );
      const matchedEmails = matched.length > 0 ? matched.map((s) => s.email) : activeSubscribers.map((s) => s.email);
      setSelectedEmails(matchedEmails);
      setAiRationale(
        `AI วิเคราะห์พบผู้ติดตาม ${matchedEmails.length} ท่านที่ให้ความสนใจในหมวดหมู่ "${story.category}" และหัวข้อข่าวที่เกี่ยวข้อง`
      );
      setHasRunAi(true);
      setShowEmailPreview(true);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBroadcastAndPublish = async () => {
    try {
      setIsSubmitting(true);
      playDigitalSound('select');
      await onConfirmPublishAndBroadcast(story, {
        recipients: selectedEmails,
        subject,
        body,
        aiGenerated: hasRunAi,
      });
      playDigitalSound('confirm');
      onClose();
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishOnly = async () => {
    try {
      setIsSubmitting(true);
      playDigitalSound('select');
      await onConfirmPublishOnly(story);
      playDigitalSound('confirm');
      onClose();
    } catch (err) {
      console.error('Publish only error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-3xl my-6 rounded-2xl bg-gradient-to-b from-[#081b47] via-[#051438] to-[#020b22] border border-amber-400/50 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.25)] text-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Gradient Bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/25 flex items-center justify-between shrink-0 bg-[#03091e]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
                Hero News Pre-Publish Workflow
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                ยืนยันการเผยแพร่ข่าว Hero & ส่งการแจ้งเตือนผู้ติดตาม
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

        {/* Modal Body (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Target Story Brief Card */}
          <div className="p-3.5 rounded-xl bg-[#03091e]/90 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <img
              src={story.imageUrl}
              alt={story.title}
              referrerPolicy="no-referrer"
              className="w-full sm:w-28 h-20 object-cover rounded-lg border border-amber-400/40 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/images/sai_digital_network_1791693065277.jpg';
              }}
            />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono">
                  {story.category || 'ข่าวเด่น สตง.'}
                </span>
                <span className="text-[11px] text-slate-400">{story.date}</span>
              </div>
              <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                {story.title}
              </h4>
              {story.subtitle && (
                <p className="text-xs text-slate-300 line-clamp-1">{story.subtitle}</p>
              )}
            </div>
          </div>

          {/* Question / Notification Box */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-200 space-y-1">
              <p className="font-semibold text-amber-300">
                ต้องการส่งข้อมูลข่าวใหม่นี้ไปยังผู้ติดตามที่ให้ Email ไว้หรือไม่?
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                ระบบพบผู้ติดตามข่าวในระบบทั้งหมด <span className="font-bold text-white font-mono">{activeSubscribers.length}</span> ท่าน
                คุณสามารถใช้ AI เพื่อวิเคราะห์ว่าอีเมลใดเชื่อมโยงกับข่าวนี้ และร่างจดหมายข่าวส่งอัตโนมัติได้
              </p>
            </div>
          </div>

          {/* Real Email Dispatch Status Banner */}
          <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs ${
            smtpStatus?.isConfigured
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                smtpStatus?.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`} />
              <div>
                <span className="font-semibold text-white">
                  {smtpStatus?.isConfigured 
                    ? `ช่องทางส่งอีเมลจริง: พร้อมใช้งาน (${smtpStatus.user})` 
                    : 'สถานะส่งอีเมล: ยังไม่ได้เชื่อมต่อบัญชีส่งอีเมลจริง (SMTP)'}
                </span>
                <p className="text-[11px] opacity-80">
                  {smtpStatus?.isConfigured
                    ? 'ระบบจะส่งอีเมลเข้ากล่องข้อความจริง (Inbox) ของผู้รับที่เลือกทุกคน'
                    : 'ขณะนี้อยู่ในโหมดจำลอง (ไม่เข้ากล่องจดหมายจริง) กรุณากดตั้งค่าเพื่อระบุบัญชีผู้ส่ง (Gmail / SMTP)'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playDigitalSound('click');
                setShowSmtpModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
            >
              <span>⚙️ ตั้งค่าส่งอีเมลจริง (SMTP)</span>
            </button>
          </div>

          {/* AI Recommendation Action Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/80 via-indigo-950/70 to-slate-900 border border-cyan-500/40 shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <span>AI วิเคราะห์ความเชื่อมโยง & แนะนำกลุ่มเป้าหมาย</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-300 font-mono">
                      Gemini 3.8
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    AI จะตรวจสอบว่าอีเมลต่างๆ เคยติดตามจากข่าวใด และแนะนำอีเมลที่เกี่ยวข้องพร้อมร่างข้อความ
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunAiRecommendation}
                disabled={isAiLoading || activeSubscribers.length === 0}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/30 transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isAiLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>AI กำลังวิเคราะห์...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>ให้ AI วิเคราะห์ & ร่างอีเมล</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Rationale Output */}
            {aiRationale && (
              <div className="p-3 rounded-lg bg-[#02081a]/80 border border-cyan-500/30 text-xs text-cyan-200 animate-fadeIn space-y-1">
                <span className="font-semibold text-cyan-400 block flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  บทวิเคราะห์จาก AI:
                </span>
                <p className="text-slate-200 leading-relaxed">{aiRationale}</p>
              </div>
            )}
          </div>

          {/* Quick Test Send & Add Extra Recipient Card */}
          <div className="p-3.5 rounded-xl bg-[#040e2b] border border-cyan-500/30 space-y-2.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-200">
                  ทดสอบส่งอีเมลจริงด่วน (Instant Test Delivery)
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleInstantTestSend('rebellion.vip@gmail.com')}
                  disabled={isInstantTesting}
                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  title="ทดสอบส่งเข้ากล่องจดหมาย rebellion.vip@gmail.com"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ ทดสอบส่ง rebellion.vip@gmail.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInstantTestSend(newRecipientInput.trim() || 'auditpicture.webapp@gmail.com')}
                  disabled={isInstantTesting}
                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  title="ทดสอบส่งเข้าอีเมลที่กรอกในช่องด้านล่าง"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{newRecipientInput.trim() ? `⚡ ส่งทดสอบเข้า ${newRecipientInput.trim()}` : '⚡ ส่งทดสอบอีเมลที่ระบุ'}</span>
                </button>
              </div>
            </div>

            {/* Manual Add Extra Recipient */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <input
                type="email"
                value={newRecipientInput}
                onChange={(e) => setNewRecipientInput(e.target.value)}
                placeholder="ระบุอีเมลผู้รับเพิ่มเติม เช่น contact@example.com"
                className="flex-1 px-3 py-1.5 bg-[#02071a] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddExtraEmail(newRecipientInput);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleAddExtraEmail(newRecipientInput)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1 whitespace-nowrap border border-slate-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>เพิ่มผู้รับ</span>
              </button>
            </div>

            {/* Instant Test Result Notice */}
            {instantTestResult && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-start gap-2 animate-fadeIn ${
                  instantTestResult.type === 'success'
                    ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/70 border border-rose-500/50 text-rose-200'
                }`}
              >
                {instantTestResult.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{instantTestResult.message}</p>
                  {instantTestResult.type === 'success' && (
                    <p className="text-[11px] text-emerald-300/90 mt-0.5">
                      💡 คำแนะนำ: หากไม่พบในกล่องข้อความหลัก โปรดตรวจสอบในโฟลเดอร์ <strong>Junk / Spam (จดหมายขยะ)</strong> หรือแท็บ Promotions
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Subscriber Connection & Selection Table */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <span className="font-bold text-amber-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>รายชื่อผู้รับที่จะส่งอีเมล (เลือกแล้ว {selectedEmails.length}/{allSubscribersWithExtra.length} อีเมล)</span>
              </span>

              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                >
                  เลือกทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                >
                  ไม่เลือก
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="max-h-56 overflow-y-auto rounded-xl border border-amber-500/30 bg-[#02071a]/90 divide-y divide-slate-800">
              {allSubscribersWithExtra.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  ยังไม่มีผู้ติดตามในระบบ (จะเผยแพร่ข่าวโดยไม่ส่งอีเมล)
                </div>
              ) : (
                allSubscribersWithExtra.map((sub) => {
                  const isChecked = selectedEmails.includes(sub.email);
                  const reason = aiReasonsMap[sub.email];
                  const isAdmin = sub.email.toLowerCase() === 'jakwil@jakwil.page';

                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleToggleEmail(sub.email)}
                      className={`p-2.5 sm:p-3 flex items-start sm:items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                        isChecked ? 'bg-amber-500/10 hover:bg-amber-500/15' : 'hover:bg-white/5 opacity-70'
                      }`}
                    >
                      {/* Checkbox and Email */}
                      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleEmail(sub.email)}
                          className="w-4 h-4 rounded border-amber-500/50 bg-[#02071a] text-amber-500 focus:ring-0 cursor-pointer accent-amber-400 mt-0.5 sm:mt-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-white font-mono block truncate">
                              {sub.email}
                            </span>
                            {isAdmin && (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-500/25 text-cyan-300 text-[9px] border border-cyan-400/40 font-sans">
                                อีเมลแอดมิน (คุณ)
                              </span>
                            )}
                          </div>
                          {reason && (
                            <span className="text-[10px] text-cyan-300 flex items-center gap-1 font-sans">
                              <Sparkles className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                              {reason}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Linkage: ติดตามจากข่าวไหน */}
                      <div className="text-right shrink-0 max-w-[200px] sm:max-w-[260px]">
                        <span className="text-[10px] text-slate-400 block">บทบาท / ข่าวที่ติดตาม:</span>
                        <span
                          className="text-[11px] font-medium text-amber-300/90 truncate block"
                          title={sub.storyTitle}
                        >
                          {sub.storyTitle}
                        </span>
                        {sub.category && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block mt-0.5">
                            {sub.category}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Email Draft Preview & Editor Toggle */}
          <div className="border border-amber-500/30 rounded-xl overflow-hidden bg-[#02071a]/80">
            <button
              type="button"
              onClick={() => setShowEmailPreview(!showEmailPreview)}
              className="w-full p-3 flex items-center justify-between text-xs font-semibold text-amber-300 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>
                  {hasRunAi ? 'จดหมายข่าวที่ AI ร่างไว้ (คลิกเพื่อดูและปรับแก้)' : 'แบบร่างข้อความที่จะส่ง (คลิกเพื่อดู)'}
                </span>
                {hasRunAi && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                    AI Generated
                  </span>
                )}
              </div>
              {showEmailPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showEmailPreview && (
              <div className="p-3.5 border-t border-amber-500/20 space-y-3 animate-fadeIn text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-amber-200 mb-1">
                    หัวข้ออีเมล (Subject Line)
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#040e2b] border border-amber-500/40 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-200 mb-1">
                    เนื้อหาอีเมล (Email Message Body)
                  </label>
                  <textarea
                    rows={6}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#040e2b] border border-amber-500/40 text-xs text-slate-200 outline-none focus:border-amber-400 leading-relaxed font-sans"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-amber-500/25 bg-[#03091e]/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-white/5 text-slate-300 text-xs font-medium transition-colors cursor-pointer order-3 sm:order-1"
          >
            กลับไปแก้ไขข่าว
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
            {/* Publish Only Button */}
            <button
              type="button"
              onClick={handlePublishOnly}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-amber-500/40 hover:bg-amber-500/10 text-amber-300 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
              title="บันทึกและเผยแพร่ข่าวขึ้นเว็บไซต์โดยไม่ส่งอีเมล"
            >
              เผยแพร่โดยไม่ส่งอีเมล
            </button>

            {/* Publish & Broadcast Button */}
            <button
              type="button"
              onClick={handleBroadcastAndPublish}
              disabled={isSubmitting || selectedEmails.length === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              title={`บันทึกข่าวพร้อมส่งอีเมลแจ้งเตือนไปยัง ${selectedEmails.length} อีเมล`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>กำลังเผยแพร่...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-slate-950" />
                  <span>เผยแพร่ & ส่งอีเมล ({selectedEmails.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Smtp Configuration Modal */}
      <SmtpConfigModal
        isOpen={showSmtpModal}
        onClose={() => setShowSmtpModal(false)}
        onConfigSaved={fetchSmtpStatus}
      />
    </div>
  );
};
