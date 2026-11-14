import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  auth,
  ADMIN_EMAILS,
  isAuthorizedAdminEmail,
  signInAdminWithGoogle,
  signOutAdmin
} from '../firebase';
import { playDigitalSound } from '../utils/audioEffects';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string) => void;
}

// SHA-256 digests of "<lowercase_email>:<passcode>"
const ADMIN_PASSCODE_HASHES: Record<string, string> = {
  'jakwil@jakwil.page': 'd3b8a57ccd23f9bb8cf6a3830eb2e5432bcc78eb36af2637125cbdcb05fa935c',
  'auditpicture.webapp@gmail.com': 'f04de4b527b6a6d85f9425fd4978c1b982b972a99b6eacc0d56362b85358a027',
};

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isVerifyingPasscode, setIsVerifyingPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unauthorizedDomainHint, setUnauthorizedDomainHint] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setUnauthorizedDomainHint(null);
      setPasscode('');
      const current = auth.currentUser;
      if (current && isAuthorizedAdminEmail(current.email)) {
        setGoogleUser(current);
      } else {
        setGoogleUser(null);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectGoogleAccount = async (hintEmail?: string) => {
    setErrorMsg(null);
    setUnauthorizedDomainHint(null);
    setIsSigningInGoogle(true);
    playDigitalSound('select');

    try {
      const user = await signInAdminWithGoogle(hintEmail);
      setGoogleUser(user);
      setPasscode('');
      playDigitalSound('confirm');
    } catch (err: any) {
      console.error('Google Admin Sign-In error:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setErrorMsg('ยกเลิกการเลือกบัญชี Google Account กรุณากดเลือกใหม่อีกครั้ง');
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg('เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาต Pop-up สำหรับเว็บไซต์นี้แล้วลองใหม่');
      } else if (code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        setUnauthorizedDomainHint(host);
        setErrorMsg(
          `โดเมน "${host}" ยังไม่ได้รับอนุญาตใน Firebase Authentication กรุณาเพิ่มใน Firebase Console → Authentication → Settings → Authorized domains`
        );
      } else {
        setErrorMsg(err?.message || 'ไม่สามารถเชื่อมต่อ Google Account ได้ กรุณาลองใหม่อีกครั้ง');
      }
      playDigitalSound('blip');
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleSwitchAccount = async () => {
    playDigitalSound('click');
    setErrorMsg(null);
    setPasscode('');
    await signOutAdmin().catch(() => null);
    setGoogleUser(null);
  };

  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser?.email) return;

    const email = googleUser.email.trim().toLowerCase();
    const expectedHash = ADMIN_PASSCODE_HASHES[email];
    if (!expectedHash) {
      setErrorMsg('บัญชีนี้ไม่ได้รับอนุญาตให้เข้าใช้งานระบบ Admin');
      return;
    }

    if (!passcode) {
      setErrorMsg('กรุณากรอก Passcode เพื่อยืนยันตัวตน');
      playDigitalSound('blip');
      return;
    }

    setIsVerifyingPasscode(true);
    setErrorMsg(null);

    try {
      const digest = await sha256Hex(`${email}:${passcode}`);
      if (digest === expectedHash) {
        playDigitalSound('confirm');
        onAuthSuccess(email);
      } else {
        playDigitalSound('blip');
        setErrorMsg(`Passcode สำหรับบัญชี ${email} ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง`);
      }
    } catch (err) {
      console.error('Passcode verification error:', err);
      setErrorMsg('เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน');
    } finally {
      setIsVerifyingPasscode(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#091b48] via-[#07153b] to-[#040e28] border border-amber-400/45 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.2)] overflow-hidden ring-1 ring-white/10">
        {/* Top Accent Line */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-cyan-400" />

        {/* Header */}
        <div className="px-5 py-4 border-b border-cyan-500/20 bg-[#05112f] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">เข้าสู่ระบบผู้ดูแล (Admin Access)</h3>
              <p className="text-[11px] text-slate-400">
                ยืนยันตัวตนด้วย Google Account + Passcode
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 text-[11px]">
            <div
              className={`flex-1 px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                googleUser
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-400/50 text-amber-300 font-semibold'
              }`}
            >
              {googleUser ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <UserCheck className="w-3.5 h-3.5 shrink-0" />}
              <span>1. เลือก Google Account</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <div
              className={`flex-1 px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                googleUser
                  ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300 font-semibold'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-400'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 shrink-0" />
              <span>2. ยืนยัน Passcode</span>
            </div>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="leading-relaxed">{errorMsg}</p>
                {unauthorizedDomainHint && (
                  <p className="text-[11px] font-mono text-amber-300 bg-black/40 px-2 py-1 rounded">
                    Domain ที่ต้องเพิ่ม: {unauthorizedDomainHint}
                  </p>
                )}
              </div>
            </div>
          )}

          {!googleUser ? (
            /* STEP 1: Choose one of the 2 Google Accounts */
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                กรุณาเลือกบัญชี <strong className="text-amber-300">Google Account</strong> ที่ได้รับสิทธิ์ผู้ดูแลระบบเพื่อดำเนินการต่อ:
              </p>

              <div className="space-y-2">
                {ADMIN_EMAILS.map((email, idx) => (
                  <button
                    key={email}
                    type="button"
                    disabled={isSigningInGoogle}
                    onClick={() => handleSelectGoogleAccount(email)}
                    className="w-full p-3 rounded-xl bg-[#030d26] hover:bg-blue-900/40 border border-cyan-500/30 hover:border-amber-400/60 transition-all flex items-center justify-between gap-3 text-left group cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center shrink-0 shadow-sm font-bold text-sm">
                        G
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          {email}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          บัญชีผู้ดูแลระบบ #{idx + 1} · Google Sign-In
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={isSigningInGoogle}
                onClick={() => handleSelectGoogleAccount()}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSigningInGoogle ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังเปิดหน้าต่างเลือกบัญชี Google...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>เปิดหน้าต่างเลือกบัญชี Google Account</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* STEP 2: Verify Passcode for Selected Google Account */
            <form onSubmit={handleVerifyPasscode} className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt={googleUser.email || 'Admin'}
                      className="w-9 h-9 rounded-full border border-emerald-400/50 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 font-bold text-sm shrink-0">
                      {googleUser.email?.[0]?.toUpperCase() || 'A'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[10px] text-emerald-300 font-semibold">
                      ยืนยัน Google Account สำเร็จ
                    </div>
                    <div className="text-xs font-bold text-white truncate font-mono">
                      {googleUser.email}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shrink-0 cursor-pointer transition-colors"
                >
                  สลับบัญชี
                </button>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                  กรอก Passcode ประจำบัญชีนี้
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    autoFocus
                    placeholder="ระบุ Passcode..."
                    className="w-full pl-9 pr-10 py-2.5 bg-[#030d26] border border-cyan-500/35 focus:border-amber-400 rounded-xl text-sm text-white outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                    title={showPasscode ? 'ซ่อน Passcode' : 'แสดง Passcode'}
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingPasscode}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isVerifyingPasscode ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ Admin'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
