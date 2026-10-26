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
  PhoneCall,
  Sparkles,
  Lock,
  BarChart3
} from 'lucide-react';
import { AppData } from '../types';
import { QuickSearchBar } from './QuickSearchBar';
import { playDigitalSound } from '../utils/audioEffects';

interface NavbarProps {
  isAdminLoggedIn: boolean;
  onOpenAdminPanel: () => void;
  onBiometricSuccess: () => void;
  searchData: AppData;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdminLoggedIn,
  onOpenAdminPanel,
  onBiometricSuccess,
  searchData,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const HOLD_DURATION = 2500; // 2.5 seconds hold duration for snappy mobile UX

  const startHold = () => {
    if (isAdminLoggedIn || scanSuccess) {
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
      {/* Apple-Style Ultra-Slim, Fixed Header (อยู่ตลอดไม่หาย ไม่ว่าจะเลื่อนขึ้นหรือเลื่อนลง) */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#03091e]/90 backdrop-blur-xl border-b border-amber-500/25 shadow-[0_2px_20px_rgba(0,0,0,0.7)] select-none">
        {/* Layer 1: Subtle Royal Guilloché Pattern */}
        <div className="absolute inset-0 bg-digital-grid opacity-10 pointer-events-none" />

        {/* Layer 2: Subtle Luminous Gold Edge Lines */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent pointer-events-none" />

        {/* Header Content Container - Ultra-Slim & Compact (44px - 48px Apple Navbar Height) */}
        <div className="relative w-full max-w-[1920px] 2xl:max-w-[2400px] 3xl:max-w-none px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mx-auto h-11 sm:h-12 flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Brand Logo & Title (Slim, Compact & Minimal) */}
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
            className="flex items-center gap-2 whitespace-nowrap shrink-0 group focus:outline-none rounded-lg p-0.5 cursor-pointer transition-opacity hover:opacity-90"
          >
            {/* Small Compact Logo */}
            <div className="relative shrink-0 flex items-center justify-center">
              <img
                src="https://i.postimg.cc/90TgPftw/Untitled-design-2026-10-13T095211-499.png"
                alt="โลโก้สำนักประชาสัมพันธ์และสื่อสารองค์กร สตง."
                referrerPolicy="no-referrer"
                className="relative z-10 h-6 sm:h-7 w-auto object-contain transition-transform duration-200 group-hover:scale-105 shrink-0 drop-shadow-[0_1px_6px_rgba(245,158,11,0.3)]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* Compact Brand Typography */}
            <div className="flex items-center">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                  PR - SAI Thailand
                </span>
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold">
                  สตง.
                </span>
              </span>
              <span className="hidden 2xl:inline text-[11px] text-amber-300/80 font-normal pl-2 ml-2 border-l border-amber-500/30 whitespace-nowrap">
                สำนักประชาสัมพันธ์และสื่อสารองค์กร
              </span>
            </div>
          </a>

          {/* Zone 2: Navigation Links (Desktop - Minimalist Horizontal Row in Apple Style) */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 text-[11.5px] xl:text-[12.5px] font-medium text-slate-300">
            <a
              href="#home"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1"
            >
              หน้าแรก
            </a>
            <a
              href="#viral-clips"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-200 font-semibold">ข่าว & คลิปไวรัล</span>
            </a>
            <a
              href="#incident-timeline"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1"
            >
              สถานการณ์อาคาร สตง.
            </a>
            <a
              href="#published-works"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1"
            >
              คลังสื่อดิจิทัล
            </a>
            <a
              href="#public-interest"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1"
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
                className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1 text-amber-300/90 font-medium"
                title="ดูศูนย์วิเคราะห์สถิติ Real-time (เฉพาะผู้ดูแลระบบ)"
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span>แดชบอร์ดสถิติ</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Minimalist Actions (Apple Style) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 relative">
            {/* Minimalist Search Icon Button (Apple Style) */}
            <button
              type="button"
              onClick={() => {
                playDigitalSound('blip');
                setSearchModalOpen(true);
              }}
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer flex items-center justify-center group"
              title="ค้นหาข้อมูล (Ctrl + K)"
              aria-label="ค้นหาข้อมูล"
            >
              <Search className="w-4 h-4 text-slate-300 group-hover:text-amber-300 transition-colors" />
            </button>

            {/* PR Request Portal CTA - Slim Apple Pill Button */}
            <a
              href="https://pr-request-system.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-yellow-400 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all whitespace-nowrap shrink-0"
              title="ระบบขอรับการสนับสนุนสื่อประชาสัมพันธ์และวิทยากร สตง."
            >
              <span>ขอสนับสนุนสื่อ</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            {/* Biometric Button / Admin Quick Trigger */}
            <div className="hidden sm:flex relative items-center">
              {isAdminLoggedIn ? (
                <button
                  onClick={() => {
                    playDigitalSound('select');
                    onOpenAdminPanel();
                  }}
                  className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center gap-1 text-[11px] shadow-sm active:scale-95"
                  title="เปิดหน้าต่าง Admin"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline font-mono font-medium">Admin</span>
                </button>
              ) : (
                <div
                  className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center select-none cursor-pointer"
                  onMouseDown={startHold}
                  onMouseUp={cancelHold}
                  onMouseLeave={cancelHold}
                  onTouchStart={startHold}
                  onTouchEnd={cancelHold}
                  onTouchCancel={cancelHold}
                  title="แตะค้าง 2.5 วินาทีเพื่อเข้าสู่ระบบ Admin"
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
                    className={`w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                      scanSuccess
                        ? 'bg-emerald-500/30 text-emerald-300 scale-105 ring-2 ring-emerald-400'
                        : isHolding
                        ? 'bg-yellow-500/25 text-yellow-300 scale-95 shadow-[0_0_12px_rgba(250,204,21,0.6)]'
                        : 'bg-slate-900/90 text-slate-300 hover:text-yellow-300 hover:bg-slate-800 border border-slate-700/60'
                    }`}
                  >
                    {scanSuccess ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Fingerprint
                        className={`w-3 h-3 transition-transform ${
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
              className="lg:hidden w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              aria-label="Toggle navigation"
              title={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>
      {/* Spacer to preserve document flow height for fixed navbar */}
      <div className="h-11 sm:h-12 w-full shrink-0 pointer-events-none" aria-hidden="true" />

      {/* Apple-style Minimalist Quick Search Dropdown / Overlay */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-16 px-3 sm:px-4 bg-black/75 backdrop-blur-md animate-fadeIn select-none"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl bg-gradient-to-b from-[#0a1838] to-[#040e28] border border-cyan-400/40 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(6,182,212,0.3)] p-3 sm:p-4 overflow-hidden animate-slide-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Search Title & Close button */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/20">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold">
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>ค้นหาด่วน ข้อมูลประชาสัมพันธ์ สตง.</span>
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
            <QuickSearchBar data={searchData} />
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

      {/* Compact Right-Aligned Drawer */}
      {mobileMenuOpen && (
        <div className="fixed top-12 sm:top-13 right-2 sm:right-3 md:right-4 z-50 w-[225px] sm:w-[240px] md:w-[255px] bg-gradient-to-b from-[#0a1e4d]/98 via-[#061539]/98 to-[#030d26]/98 backdrop-blur-2xl border-2 border-amber-400/60 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(245,158,11,0.3)] p-3 space-y-2 lg:hidden animate-slide-in-right overflow-hidden select-none">
          {/* Royal Gold Grid Texture */}
          <div className="absolute inset-0 bg-digital-grid opacity-20 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.8)] pointer-events-none" />

          {/* Tech Viewport Corner Brackets */}
          <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-amber-400/80 pointer-events-none" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-amber-400/80 pointer-events-none" />
          <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-amber-400/80 pointer-events-none" />
          <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-amber-400/80 pointer-events-none" />

          {/* Drawer Header with Data Telemetry Badge */}
          <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/25 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-bold text-white tracking-wide">เมนูหลัก สตง.</span>
              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
                ROYAL NODE
              </span>
            </div>
            <button
              onClick={() => {
                playDigitalSound('blip');
                setMobileMenuOpen(false);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="ปิดเมนู"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation Links with Icons & Royal Hover Effects (Complete access to all data) */}
          <nav className="space-y-1 relative z-10 text-[11px]">
            <a
              href="#home"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 font-medium text-slate-200 hover:text-amber-300 hover:bg-amber-500/15 rounded-lg border border-transparent hover:border-amber-500/30 transition-all"
            >
              <Home className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>หน้าแรก (ข่าวม้าหมุน)</span>
            </a>

            <a
              href="#viral-clips"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 font-medium text-amber-200 hover:text-amber-300 hover:bg-amber-500/15 rounded-lg border border-transparent hover:border-amber-500/30 transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>ข่าว & คลิปไวรัล สตง.</span>
            </a>

            <a
              href="#incident-timeline"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 font-medium text-amber-300 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 transition-all"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>สถานการณ์อาคาร สตง.</span>
            </a>

            <a
              href="#published-works"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 font-medium text-slate-200 hover:text-amber-300 hover:bg-amber-500/15 rounded-lg border border-transparent hover:border-amber-500/30 transition-all"
            >
              <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>คลังสื่อดิจิทัล & วารสาร</span>
            </a>

            <a
              href="#public-interest"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 font-medium text-slate-200 hover:text-amber-300 hover:bg-amber-500/15 rounded-lg border border-transparent hover:border-amber-500/30 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>ข้อมูล e-Audit (ข้อสงสัย)</span>
            </a>

            {isAdminLoggedIn && (
              <button
                type="button"
                onClick={() => {
                  playDigitalSound('select');
                  setMobileMenuOpen(false);
                  onOpenAdminPanel();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 font-medium text-amber-300 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 transition-all text-left"
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>แดชบอร์ดสถิติ (Admin)</span>
              </button>
            )}
          </nav>

          {/* Quick Search Shortcut inside Drawer */}
          <div className="pt-1.5 border-t border-amber-500/20 relative z-10">
            <button
              onClick={() => {
                playDigitalSound('blip');
                setMobileMenuOpen(false);
                setMobileSearchOpen(true);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 rounded-lg transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Search className="w-3 h-3 text-amber-400" />
                <span>ค้นหาข่าวและสื่อ สตง.</span>
              </span>
              <span className="text-[9px] font-mono text-amber-300/80">CTRL+K</span>
            </button>
          </div>

          {/* Quick Hotline 1730 Contact */}
          <div className="relative z-10">
            <a
              href="tel:1730"
              className="flex items-center justify-between px-2.5 py-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-lg transition-all"
            >
              <span className="flex items-center gap-1.5">
                <PhoneCall className="w-3 h-3 text-emerald-400" />
                <span>สายด่วน สตง. 1730</span>
              </span>
              <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1 rounded">โทรฟรี</span>
            </a>
          </div>

          {/* Request Media Portal Button */}
          <div className="pt-1 border-t border-cyan-500/20 relative z-10">
            <a
              href="https://pr-request-system.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-950 bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-500 hover:from-yellow-300 hover:to-yellow-400 rounded-lg shadow-md shadow-yellow-500/20 active:scale-95 transition-all"
            >
              <span className="truncate">ระบบขอสนับสนุนสื่อ สตง.</span>
              <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
            </a>
          </div>

          {/* Admin Login Quick Link */}
          <div className="relative z-10 pt-0.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (isAdminLoggedIn) {
                  onOpenAdminPanel();
                } else {
                  // Prompt hold instruction or open panel if authorized
                  onBiometricSuccess();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1 text-[10px] text-cyan-400/80 hover:text-cyan-200 transition-colors"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>{isAdminLoggedIn ? 'เปิดหน้าต่าง Admin' : 'เข้าสู่ระบบผู้ดูแล (Admin)'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
