import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  Server,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  Info,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  RefreshCw
} from 'lucide-react';
import { playDigitalSound } from '../utils/audioEffects';

interface SmtpConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const SmtpConfigModal: React.FC<SmtpConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [provider, setProvider] = useState<'gmail' | 'outlook' | 'custom'>('gmail');
  const [host, setHost] = useState('smtp.gmail.com');
  const [port, setPort] = useState(465);
  const [secure, setSecure] = useState(true);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [fromName, setFromName] = useState('สำนักประชาสัมพันธ์และสื่อสารองค์กร สตง. (PR SAI Thailand)');
  const [fromEmail, setFromEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('jakwil@jakwil.page');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'warning' | 'error';
    title: string;
    description: string;
    previewUrl?: string;
  } | null>(null);

  const [currentSmtpStatus, setCurrentSmtpStatus] = useState<any>(null);

  // Load current SMTP configuration on open
  useEffect(() => {
    if (isOpen) {
      loadSmtpStatus();
    }
  }, [isOpen]);

  const loadSmtpStatus = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/email/smtp-status');
      if (res.ok) {
        const data = await res.json();
        setCurrentSmtpStatus(data);
        if (data.service) setProvider(data.service);
        if (data.host) setHost(data.host);
        if (data.port) setPort(data.port);
        if (data.secure !== undefined) setSecure(data.secure);
        if (data.rawUser) {
          setUser(data.rawUser);
          if (!testEmail) setTestEmail('jakwil@jakwil.page');
        }
        if (data.fromName) setFromName(data.fromName);
        if (data.fromEmail) setFromEmail(data.fromEmail);
      }
    } catch (err) {
      console.error('Failed to load SMTP status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSelect = (p: 'gmail' | 'outlook' | 'custom') => {
    playDigitalSound('select');
    setProvider(p);
    if (p === 'gmail') {
      setHost('smtp.gmail.com');
      setPort(465);
      setSecure(true);
    } else if (p === 'outlook') {
      setHost('smtp.office365.com');
      setPort(587);
      setSecure(false);
    }
  };

  const handleSaveSmtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || (!pass && !currentSmtpStatus?.hasPassword)) {
      setStatusMessage({
        type: 'error',
        title: 'ข้อมูลไม่ครบถ้วน',
        description: 'กรุณาระบุบัญชีอีเมล (Email) และรหัสผ่าน / App Password',
      });
      return;
    }

    try {
      setIsLoading(true);
      setStatusMessage(null);
      playDigitalSound('select');

      const res = await fetch('/api/email/save-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: provider,
          host,
          port,
          secure,
          user: user.trim(),
          pass: pass.trim(),
          fromName: fromName.trim(),
          fromEmail: fromEmail.trim() || user.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึก SMTP');
      }

      if (data.verified) {
        setStatusMessage({
          type: 'success',
          title: 'เชื่อมต่อและบันทึกสำเร็จ!',
          description: data.message || 'ระบบทดสอบเชื่อมต่อ SMTP ผ่านเรียบร้อย พร้อมส่งอีเมลจริงไปยังกล่องข้อความแล้ว',
        });
        playDigitalSound('confirm');
      } else {
        setStatusMessage({
          type: 'warning',
          title: 'บันทึกแล้ว แต่การทดสอบเชื่อมต่อมีปัญหา',
          description: data.warning || 'โปรดตรวจสอบชื่อผู้ใช้หรือ App Password อีกครั้ง',
        });
      }

      loadSmtpStatus();
      if (onConfigSaved) onConfigSaved();
    } catch (err: any) {
      console.error('Save SMTP Error:', err);
      setStatusMessage({
        type: 'error',
        title: 'บันทึกไม่สำเร็จ',
        description: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    const recipient = testEmail.trim() || user.trim();
    if (!recipient) {
      setStatusMessage({
        type: 'error',
        title: 'ระบุอีเมลปลายทาง',
        description: 'กรุณาระบุอีเมลที่ต้องการส่งทดสอบไปถึง',
      });
      return;
    }

    try {
      setIsTesting(true);
      setStatusMessage(null);
      playDigitalSound('select');

      const res = await fetch('/api/email/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: recipient,
          customConfig: user && pass ? {
            service: provider,
            host,
            port,
            secure,
            user,
            pass,
            fromName,
            fromEmail: fromEmail || user
          } : undefined
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.hint ? `${data.error} (${data.hint})` : (data.error || 'ส่งอีเมลทดสอบไม่สำเร็จ'));
      }

      if (data.isReal) {
        setStatusMessage({
          type: 'success',
          title: 'ส่งอีเมลจริงสำเร็จ!',
          description: `ระบบได้ส่งอีเมลทดสอบไปยัง "${recipient}" เรียบร้อยแล้ว กรุณาเปิดดูในกล่องจดหมาย (Inbox / Junk) ของท่าน`,
        });
        playDigitalSound('confirm');
      } else {
        setStatusMessage({
          type: 'warning',
          title: 'ส่งในโหมดจำลอง (Ethereal)',
          description: 'ระบบยังไม่ได้บันทึกบัญชี SMTP จริง จึงส่งผ่านโหมดจำลอง ท่านสามารถกดดูตัวอย่างอีเมลได้ที่ปุ่มด้านล่าง',
          previewUrl: data.previewUrl,
        });
      }
    } catch (err: any) {
      console.error('Test Email Error:', err);
      setStatusMessage({
        type: 'error',
        title: 'ส่งอีเมลทดสอบไม่สำเร็จ',
        description: err.message || 'โปรดตรวจสอบความถูกต้องของรหัสผ่าน App Password หรือการตั้งค่าพอร์ต',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-2xl my-6 rounded-2xl bg-gradient-to-b from-[#081b47] via-[#051438] to-[#020b22] border border-amber-400/50 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.25)] text-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Stripe */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/25 flex items-center justify-between shrink-0 bg-[#03091e]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <Mail className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
                Real Email Dispatch Engine
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                ตั้งค่าระบบส่งอีเมลจริง (SMTP / Gmail App Password)
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Current Status Badge */}
          <div className="p-3.5 rounded-xl bg-[#02081c] border border-slate-700/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full shrink-0 ${
                  currentSmtpStatus?.isConfigured
                    ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                    : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                }`}
              />
              <div>
                <div className="text-xs font-semibold text-white">
                  สถานะปัจจุบัน:{' '}
                  {currentSmtpStatus?.isConfigured ? (
                    <span className="text-emerald-400">พร้อมส่งอีเมลจริง ({currentSmtpStatus?.user || 'บัญชีที่เชื่อมต่อ'})</span>
                  ) : (
                    <span className="text-amber-400">ยังไม่ได้ตั้งค่าบัญชีจริง (ส่งในโหมดจำลอง)</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {currentSmtpStatus?.isConfigured
                    ? 'ระบบจะส่งอีเมลแจ้งเตือนข่าว Hero เข้ากล่องข้อความจริงของผู้รับทุกคนทันที'
                    : 'หากไม่ระบุ SMTP อีเมลจะถูกบันทึกในฐานข้อมูล แต่จะไม่เข้ากล่องจดหมายจริง'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={loadSmtpStatus}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="รีเฟรชสถานะ"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Status Message Notification */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1 animate-fadeIn ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : statusMessage.type === 'warning'
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
                <span>{statusMessage.title}</span>
              </div>
              <p className="text-[11px] opacity-90">{statusMessage.description}</p>
              {statusMessage.previewUrl && (
                <div className="pt-2">
                  <a
                    href={statusMessage.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-semibold"
                  >
                    <span>ดูตัวอย่างอีเมลที่ส่ง (Ethereal Preview)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Provider Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-amber-300">
              เลือกประเภทผู้ให้บริการส่งอีเมล (Email Provider)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleProviderSelect('gmail')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  provider === 'gmail'
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-[#030a21] border-slate-750 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-amber-300">Gmail</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono">
                    แนะนำ
                  </span>
                </div>
                <span className="text-[10px] text-slate-300">ส่งผ่าน smtp.gmail.com (ใช้ App Password)</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('outlook')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  provider === 'outlook'
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-[#030a21] border-slate-750 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-cyan-300">Outlook / 365</span>
                </div>
                <span className="text-[10px] text-slate-300">smtp.office365.com (พอร์ต 587)</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('custom')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  provider === 'custom'
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-[#030a21] border-slate-750 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-purple-300">Custom SMTP</span>
                </div>
                <span className="text-[10px] text-slate-300">เซิร์ฟเวอร์ สตง. หรือผู้ให้บริการอื่น</span>
              </button>
            </div>
          </div>

          {/* Gmail App Password Helper Box */}
          {provider === 'gmail' && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-200 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>คำแนะนำการใช้ Gmail ส่งอีเมล:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                เนื่องจากความปลอดภัยของ Google กรุณาใช้ <strong>"App Password (รหัสผ่านสำหรับแอป 16 หลัก)"</strong> แทนรหัสผ่านปกติของบัญชี:
              </p>
              <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-slate-300">
                <li>ไปที่หน้าจัดการบัญชี Google (myaccount.google.com/security)</li>
                <li>เปิดการยืนยันแบบ 2 ขั้นตอน (2-Step Verification)</li>
                <li>ค้นหาเมนู "รหัสผ่านสำหรับแอป" (App Passwords)</li>
                <li>สร้างรหัสผ่านใหม่ (เช่น ตั้งชื่อว่า "PR SAI Thailand") แล้วคัดลอกรหัสผ่าน 16 หลักมาใส่ด้านล่าง</li>
              </ol>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSaveSmtp} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                  อีเมลผู้ส่ง (Username / Email) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={user}
                    onChange={(e) => {
                      setUser(e.target.value);
                      if (!fromEmail) setFromEmail(e.target.value);
                      if (!testEmail) setTestEmail(e.target.value);
                    }}
                    placeholder="เช่น pr.saithailand@gmail.com"
                    required
                    className="w-full pl-8 pr-3 py-2 bg-[#02071a] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-300 font-semibold">
                    รหัสผ่าน (App Password 16 หลัก) {!currentSmtpStatus?.hasPassword && <span className="text-rose-400">*</span>}
                  </label>
                  {currentSmtpStatus?.hasPassword && (
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> บันทึกแล้ว
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder={currentSmtpStatus?.hasPassword ? '•••••••• (บันทึกไว้แล้ว - เว้นว่างถ้าไม่ต้องการเปลี่ยน)' : 'เช่น abcd efgh ijkl mnop'}
                    required={!currentSmtpStatus?.hasPassword}
                    className="w-full pl-8 pr-10 py-2 bg-[#02071a] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {currentSmtpStatus?.hasPassword && !pass && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    ระบบบันทึกรหัสผ่านไว้แล้ว หากไม่ต้องการเปลี่ยนสามารถเว้นว่างช่องนี้ไว้ได้
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                  ชื่อผู้ส่งที่แสดง (Sender Name)
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="สำนักประชาสัมพันธ์และสื่อสารองค์กร สตง."
                  className="w-full px-3 py-2 bg-[#02071a] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                  อีเมลผู้ส่งที่แสดง (From Email)
                </label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder={user || 'เช่น pr@oag.go.th'}
                  className="w-full px-3 py-2 bg-[#02071a] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Custom Host & Port */}
            {provider === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#02071a] border border-slate-700/60">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                    SMTP Host Server
                  </label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="เช่น mail.oag.go.th หรือ smtp.sendgrid.net"
                    className="w-full px-3 py-2 bg-[#010411] border border-slate-750 rounded-lg text-xs text-white outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                    Port & SSL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(Number(e.target.value))}
                      placeholder="465"
                      className="w-20 px-2 py-2 bg-[#010411] border border-slate-750 rounded-lg text-xs text-white outline-none focus:border-amber-400 font-mono"
                    />
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={secure}
                        onChange={(e) => setSecure(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>SSL (465)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Save & Test Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              {/* Test Email Section */}
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="ใส่อีเมลปลายทาง เช่น jakwil@jakwil.page"
                    className="px-2.5 py-1.5 bg-[#02071a] border border-cyan-500/40 rounded-lg text-xs text-white placeholder-slate-500 w-full sm:w-64 outline-none focus:border-cyan-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={isTesting}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'กำลังส่ง...' : 'ทดสอบส่งเมลจริง'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 flex-wrap">
                  <span>เลือกส่งด่วน:</span>
                  <button
                    type="button"
                    onClick={() => setTestEmail('jakwil@jakwil.page')}
                    className={`px-1.5 py-0.5 rounded border transition-colors ${
                      testEmail === 'jakwil@jakwil.page'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                        : 'bg-white/5 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    jakwil@jakwil.page
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestEmail('auditpicture.webapp@gmail.com')}
                    className={`px-1.5 py-0.5 rounded border transition-colors ${
                      testEmail === 'auditpicture.webapp@gmail.com'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                        : 'bg-white/5 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    auditpicture.webapp@gmail.com
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_4px_14px_rgba(245,158,11,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า SMTP'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
