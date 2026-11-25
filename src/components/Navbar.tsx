import React, { useState, useRef, useEffect } from 'react';
import {
  ExternalLink,
  Fingerprint,
  Menu,
  X,
  ShieldCheck,
  Check,
  Home,
  Clock,
  Film,
  HelpCircle,
  Radio,
  Search,
  BarChart3,
  Network,
  Sun,
  Moon,
  Type
} from 'lucide-react';
import { AppData } from '../types';
import { QuickSearchBar } from './QuickSearchBar';
import { playDigitalSound } from '../utils/audioEffects';
import { useSiteTheme } from '../contexts/ThemeContext';

interface NavbarProps {
  isAdminLoggedIn: boolean;
  onOpenAdminPanel: () => void;
  onBiometricSuccess: () => void;
  onOpenBureauStructure: () => void;
  searchData: AppData;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdminLoggedIn,
  onOpenAdminPanel,
  onBiometricSuccess,
  onOpenBureauStructure,
  searchData,
}) => {
  const { isClean, toggleSiteTheme, isLargeFont, toggleFontScale } = useSiteTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const HOLD_DURATION = 3000; // 3 seconds hold duration as requested

  const startHold = () => {
    if (isAdminLoggedIn || scanSuccess || isHolding) {
      if (isAdminLoggedIn) onOpenAdminPanel();
      return;
    }

    setIsHolding(true);
    startTimeRef.current = performance.now();

    const updateProgress = (currentTime: number) => {
      if (!startTimeRef.current) return;
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);

      if (progress < 100) {
        animationRef.current = requestAnimationFrame(updateProgress);
      } else {
        // Direct admin login
        setIsHolding(false);
        setScanSuccess(true);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([100, 50, 150]);
        }

        setTimeout(() => {
          setScanSuccess(false);
          setHoldProgress(0);
          onBiometricSuccess();
        }, 350);
      }
    };

    animationRef.current = requestAnimationFrame(updateProgress);
  };

  const cancelHold = () => {
    if (scanSuccess) return;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsHolding(false);
    startTimeRef.current = null;
    setHoldProgress(0);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Keyboard shortcut (Ctrl+K / Cmd+K) to open minimalist search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

  return (
    <>
      {/* Fixed Header (รองรับทั้งโทน Royal Navy และโทนสีคลีน) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl select-none overflow-hidden transition-colors duration-300 ${
          isClean
            ? 'bg-white/95 border-b border-slate-200 shadow-sm'
            : 'bg-gradient-to-r from-[#040e28]/95 via-[#07163d]/95 to-[#040e28]/95 border-b border-cyan-500/25 shadow-[0_4px_24px_rgba(0,0,0,0.75)]'
        }`}
      >
        {/* Subtle Top Luminous Accent Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none ${
            isClean
              ? 'bg-gradient-to-r from-sky-500/60 via-amber-500/60 to-sky-500/60'
              : 'bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent'
          }`}
        />

        {/* Header Content Container */}
        <div className="relative w-full max-w-[1920px] 2xl:max-w-[2400px] 3xl:max-w-none px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mx-auto h-13 sm:h-[58px] flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Brand Logo & Title */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              const homeEl = document.getElementById('home');
              if (homeEl) {
                homeEl.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              window.history.pushState(null, '', '#home');
            }}
            title="กลับสู่หน้าแรก (Home)"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group focus:outline-none rounded-lg p-0.5 cursor-pointer transition-opacity hover:opacity-90"
          >
            {/* Compact Logo */}
            <div className="relative shrink-0 flex items-center justify-center">
              <img
                src="https://i.postimg.cc/90TgPftw/Untitled-design-2026-10-13T095211-499.png"
                alt="โลโก้สำนักประชาสัมพันธ์และสื่อสารองค์กร สตง."
                referrerPolicy="no-referrer"
                className="relative z-10 h-[28px] sm:h-[32px] w-auto object-contain transition-transform duration-200 group-hover:scale-105 shrink-0 drop-shadow-[0_1px_6px_rgba(245,158,11,0.3)]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* Brand Typography */}
            <div className="flex items-center">
              <div className="flex flex-col justify-center leading-none">
                <span
                  className={`text-sm sm:text-base font-extrabold tracking-tight leading-tight transition-colors ${
                    isClean
                      ? 'text-slate-900 group-hover:text-sky-700'
                      : 'text-white group-hover:text-amber-300'
                  }`}
                >
                  {isClean ? (
                    'PR - SAI Thailand'
                  ) : (
                    <span className="bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                      PR - SAI Thailand
                    </span>
                  )}
                </span>
                <span
                  className={`text-[10px] sm:text-xs font-semibold tracking-wide leading-tight mt-[1px] transition-colors ${
                    isClean
                      ? 'text-sky-700 group-hover:text-sky-900'
                      : 'text-amber-300/90 group-hover:text-amber-200'
                  }`}
                >
                  สำนักประชาสัมพันธ์และสื่อสารองค์กร
                </span>
              </div>
            </div>
          </a>

          {/* Zone 2: Navigation Links (Larger & Clearer) */}
          <nav
            className={`hidden lg:flex items-center gap-4 xl:gap-5 text-sm font-semibold ${
              isClean ? 'text-slate-700' : 'text-slate-200'
            }`}
          >
            <a
              href="#home"
              className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
                isClean ? 'hover:text-sky-700' : 'hover:text-white'
              }`}
            >
              หน้าแรก
            </a>
            <button
              type="button"
              onClick={() => {
                playDigitalSound('select');
                onOpenBureauStructure();
              }}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 font-semibold cursor-pointer ${
                isClean
                  ? 'text-amber-700 hover:text-amber-900'
                  : 'text-amber-200 hover:text-amber-300'
              }`}
              title="เปิดดูโครงสร้าง 4 กลุ่มงาน ภารกิจ และผลงานสำนักประชาสัมพันธ์ฯ (เต็มจอ)"
            >
              <Network className={`w-4 h-4 ${isClean ? 'text-amber-600' : 'text-amber-400'}`} />
              <span>โครงสร้างและภารกิจ</span>
            </button>
            <a
              href="#viral-clips"
              className={`transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                isClean ? 'hover:text-sky-700' : 'hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${isClean ? 'bg-amber-500' : 'bg-amber-400'}`} />
              <span className={isClean ? 'text-slate-900 font-bold' : 'text-amber-200 font-bold'}>
                ข่าว & คลิปไวรัล
              </span>
            </a>
            <a
              href="#incident-timeline"
              className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
                isClean ? 'hover:text-sky-700' : 'hover:text-white'
              }`}
            >
              สถานการณ์อาคาร สตง.
            </a>
            <a
              href="#published-works"
              className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
                isClean ? 'hover:text-sky-700' : 'hover:text-white'
              }`}
            >
              คลังสื่อดิจิทัล
            </a>
            <a
              href="#public-interest"
              className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
                isClean ? 'hover:text-sky-700' : 'hover:text-white'
              }`}
            >
              ข้อมูล e-Audit
            </a>
            {isAdminLoggedIn && (
              <button
                type="button"
                onClick={() => {
                  playDigitalSound('select');
                  onOpenAdminPanel();
                }}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1 font-semibold cursor-pointer ${
                  isClean ? 'text-sky-700 hover:text-sky-900' : 'text-amber-300 hover:text-amber-200'
                }`}
                title="ดูศูนย์วิเคราะห์สถิติ Real-time (เฉพาะผู้ดูแลระบบ)"
              >
                <BarChart3 className={`w-4 h-4 ${isClean ? 'text-sky-600' : 'text-amber-400'}`} />
                <span>แดชบอร์ดสถิติ</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Theme Switcher, Text Size, Search, PR CTA, Biometric */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
            {/* Website Color Theme Selector: Clean Light vs Royal Navy */}
            <button
              type="button"
              onClick={() => {
                playDigitalSound('switch');
                toggleSiteTheme();
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                isClean
                  ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-sm'
                  : 'bg-white/95 hover:bg-white text-slate-900 border-white/80 shadow-sm'
              }`}
              title={isClean ? 'เปลี่ยนกลับเป็นโทน Royal Navy (เข้ม)' : 'เปลี่ยนเป็นโทนสีคลีน (สว่าง สบายตา)'}
              aria-label="สลับโทนสีเว็บไซต์"
            >
              {isClean ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="hidden xs:inline">โทนเข้ม</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="hidden xs:inline">โทนคลีน</span>
                </>
              )}
            </button>

            {/* Font Size Toggle (ใหญ่พิเศษ / ปกติ) */}
            <button
              type="button"
              onClick={() => {
                playDigitalSound('blip');
                toggleFontScale();
              }}
              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full text-xs font-extrabold border transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                isLargeFont
                  ? isClean
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                  : isClean
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
              }`}
              title={isLargeFont ? 'สลับเป็นตัวอักษรขนาดมาตรฐานชัด' : 'ขยายตัวอักษรให้ใหญ่พิเศษ'}
              aria-label="ปรับขนาดตัวอักษร"
            >
              <Type className="w-3.5 h-3.5 shrink-0" />
              <span>{isLargeFont ? 'ก++' : 'ก+'}</span>
            </button>

            {/* Minimalist Search Icon Button */}
            <button
              type="button"
              onClick={() => {
                playDigitalSound('blip');
                setSearchModalOpen(true);
              }}
              className={`p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer flex items-center justify-center group ${
                isClean
                  ? 'text-slate-700 hover:text-sky-700 hover:bg-slate-100'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
              title="ค้นหาด่วนทั่วทั้งเว็บไซต์ (Ctrl + K)"
              aria-label="ค้นหาด่วนทั่วทั้งเว็บไซต์"
            >
              <Search className="w-[18px] h-[18px] transition-colors" />
            </button>

            {/* PR Request Portal CTA */}
            <a
              href="https://pr-request-system.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-yellow-400 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all whitespace-nowrap shrink-0"
              title="ขอรับการสนับสนุนงาน PR สำนักประชาสัมพันธ์และสื่อสารองค์กร สตง."
            >
              <span>ขอรับการสนับสนุนงาน PR</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Biometric Button / Admin Quick Trigger (+10%) */}
            <div className="hidden sm:flex relative items-center">
              {isAdminLoggedIn ? (
                <button
                  onClick={() => {
                    playDigitalSound('select');
                    onOpenAdminPanel();
                  }}
                  className="px-2.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 text-[12px] shadow-sm active:scale-95"
                  title="เปิดหน้าต่าง Admin"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline font-mono font-medium">Admin</span>
                </button>
              ) : (
                <div
                  className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center select-none touch-none cursor-pointer"
                  onMouseDown={startHold}
                  onMouseUp={cancelHold}
                  onMouseLeave={cancelHold}
                  onTouchStart={startHold}
                  onTouchEnd={cancelHold}
                  onTouchCancel={cancelHold}
                  onContextMenu={(e) => e.preventDefault()}
                  title="แตะค้าง 3 วินาทีเพื่อเข้าสู่โหมดเลือก Google Account (Admin)"
                >
                  {/* Circular Progress Ring */}
                  <svg viewBox="0 0 32 32" className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle
                      cx="16"
                      cy="16"
                      r={radius}
                      className="stroke-slate-800"
                      strokeWidth="2"
                      fill="transparent"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r={radius}
                      className={`transition-all ${
                        scanSuccess
                          ? 'stroke-emerald-400'
                          : isHolding
                          ? 'stroke-yellow-400'
                          : 'stroke-transparent'
                      }`}
                      strokeWidth="2"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Fingerprint Button Interior */}
                  <div
                    className={`w-6 h-6 sm:w-[27px] sm:h-[27px] rounded-full flex items-center justify-center transition-all duration-200 ${
                      scanSuccess
                        ? 'bg-emerald-500/30 text-emerald-300 scale-105 ring-2 ring-emerald-400'
                        : isHolding
                        ? 'bg-yellow-500/25 text-yellow-300 scale-95 shadow-[0_0_12px_rgba(250,204,21,0.6)]'
                        : 'bg-slate-900/90 text-slate-300 hover:text-yellow-300 hover:bg-slate-800 border border-slate-700/60'
                    }`}
                  >
                    {scanSuccess ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Fingerprint
                        className={`w-3.5 h-3.5 transition-transform ${
                          isHolding ? 'scale-110 text-yellow-300 animate-pulse' : ''
                        }`}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile / Tablet Menu Hamburger Toggle */}
            <button
              onClick={() => {
                playDigitalSound('switch');
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className={`lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                isClean
                  ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Toggle navigation"
              title={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            >
              {mobileMenuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>
      </header>
      {/* Spacer to preserve document flow height for fixed navbar */}
      <div className="h-13 sm:h-[58px] w-full shrink-0 pointer-events-none" aria-hidden="true" />

      {/* Sitewide Instant Search Modal */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-16 px-3 sm:px-4 bg-black/75 backdrop-blur-md animate-fadeIn select-none"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-gradient-to-b from-[#0a1838] to-[#040e28] border border-cyan-400/45 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(6,182,212,0.3)] p-3 sm:p-5 animate-slide-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Search Title & Close button */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2 text-cyan-300 text-xs sm:text-sm font-semibold">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>ค้นหาด่วนทั่วทั้งเว็บไซต์ PR - SAI Thailand</span>
              </div>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="ปิด (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <QuickSearchBar
              data={searchData}
              onClose={() => setSearchModalOpen(false)}
              onOpenBureauStructure={onOpenBureauStructure}
              autoFocus={true}
            />
          </div>
        </div>
      )}

      {/* Backdrop for Compact Right-Aligned Menu on Tablet & Mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Compact Right-Aligned Drawer (ไม่มีปุ่มขอรับการสนับสนุนและกระชับขอบบนพอดี) */}
      {mobileMenuOpen && (
        <div
          className={`fixed top-[54px] sm:top-[60px] right-2 sm:right-3 md:right-4 z-50 w-[235px] sm:w-[250px] backdrop-blur-2xl rounded-2xl p-2.5 lg:hidden animate-slide-in-right overflow-hidden select-none ${
            isClean
              ? 'bg-white/98 border border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.16)]'
              : 'bg-gradient-to-b from-[#0a1e4d]/98 via-[#061539]/98 to-[#030d26]/98 border-2 border-amber-400/60 shadow-[0_16px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(245,158,11,0.3)]'
          }`}
        >
          {/* Floating Compact Close Button (ไม่กินพื้นที่แถวบน) */}
          <button
            onClick={() => {
              playDigitalSound('blip');
              setMobileMenuOpen(false);
            }}
            className={`absolute top-2 right-2 z-20 p-1 rounded-md transition-colors cursor-pointer ${
              isClean
                ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            aria-label="ปิดเมนู"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1 relative z-10 text-sm pr-5">
            <a
              href="#home"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-2.5 py-2 font-semibold rounded-lg transition-all ${
                isClean
                  ? 'text-slate-800 hover:text-sky-700 hover:bg-sky-50'
                  : 'text-slate-100 hover:text-amber-300 hover:bg-amber-500/15'
              }`}
            >
              <Home className={`w-4 h-4 shrink-0 ${isClean ? 'text-sky-600' : 'text-amber-400'}`} />
              <span>หน้าแรก</span>
            </a>

            <button
              type="button"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
                onOpenBureauStructure();
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 font-semibold rounded-lg border transition-all text-left cursor-pointer ${
                isClean
                  ? 'text-amber-800 bg-amber-50/70 hover:bg-amber-100 border-amber-200'
                  : 'text-amber-200 hover:text-amber-100 hover:bg-amber-500/20 border-amber-500/30'
              }`}
            >
              <Network className={`w-4 h-4 shrink-0 ${isClean ? 'text-amber-600' : 'text-amber-400'}`} />
              <span>โครงสร้างและภารกิจ</span>
            </button>

            <a
              href="#viral-clips"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-2.5 py-2 font-semibold rounded-lg transition-all ${
                isClean
                  ? 'text-slate-800 hover:text-sky-700 hover:bg-sky-50'
                  : 'text-amber-200 hover:text-amber-300 hover:bg-amber-500/15'
              }`}
            >
              <Radio className={`w-4 h-4 shrink-0 ${isClean ? 'text-sky-600' : 'text-amber-400'}`} />
              <span>ข่าว & คลิปไวรัล สตง.</span>
            </a>

            <a
              href="#incident-timeline"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-2.5 py-2 font-semibold rounded-lg border transition-all ${
                isClean
                  ? 'text-rose-700 bg-rose-50/70 hover:bg-rose-100 border-rose-200'
                  : 'text-amber-300 hover:bg-amber-500/20 border-amber-500/30'
              }`}
            >
              <Clock className={`w-4 h-4 shrink-0 ${isClean ? 'text-rose-600' : 'text-amber-400'}`} />
              <span>สถานการณ์อาคาร สตง.</span>
            </a>

            <a
              href="#published-works"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-2.5 py-2 font-semibold rounded-lg transition-all ${
                isClean
                  ? 'text-slate-800 hover:text-sky-700 hover:bg-sky-50'
                  : 'text-slate-100 hover:text-amber-300 hover:bg-amber-500/15'
              }`}
            >
              <Film className={`w-4 h-4 shrink-0 ${isClean ? 'text-sky-600' : 'text-amber-400'}`} />
              <span>คลังสื่อดิจิทัล</span>
            </a>

            <a
              href="#public-interest"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-2.5 py-2 font-semibold rounded-lg transition-all ${
                isClean
                  ? 'text-slate-800 hover:text-sky-700 hover:bg-sky-50'
                  : 'text-slate-100 hover:text-amber-300 hover:bg-amber-500/15'
              }`}
            >
              <HelpCircle className={`w-4 h-4 shrink-0 ${isClean ? 'text-sky-600' : 'text-amber-400'}`} />
              <span>ประเด็นเด่นที่น่าสนใจ (e-Audit)</span>
            </a>

            {isAdminLoggedIn && (
              <button
                type="button"
                onClick={() => {
                  playDigitalSound('select');
                  setMobileMenuOpen(false);
                  onOpenAdminPanel();
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 font-semibold rounded-lg border transition-all text-left cursor-pointer ${
                  isClean
                    ? 'text-sky-800 bg-sky-50 border-sky-200'
                    : 'text-amber-300 hover:bg-amber-500/20 border-amber-500/30'
                }`}
              >
                <BarChart3 className={`w-4 h-4 shrink-0 ${isClean ? 'text-sky-600' : 'text-amber-400'}`} />
                <span>แดชบอร์ดสถิติ (Admin)</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  );
};
