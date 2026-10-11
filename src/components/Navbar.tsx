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
  Lock
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

  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

  return (
    <>
      {/* Sleek, Non-Thick Header with Cyber Digital Data Background */}
      <header className="sticky top-0 z-40 w-full bg-[#030a24]/95 backdrop-blur-2xl border-b border-cyan-400/40 shadow-[0_4px_30px_rgba(0,0,0,0.85),0_0_20px_rgba(6,182,212,0.18)] transition-all select-none overflow-visible">
        {/* Layer 1: Digital Data Cyber Circuit Grid Pattern */}
        <div className="absolute inset-0 bg-digital-circuit opacity-35 pointer-events-none" />

        {/* Layer 2: Cyber Digital Dots Matrix */}
        <div className="absolute inset-0 bg-digital-dots opacity-20 pointer-events-none" />

        {/* Layer 3: Cyber Glowing Ambient Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 via-[#061539]/50 to-blue-950/30 pointer-events-none" />

        {/* Layer 4: Top & Bottom Glowing Laser Lines */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-85 pointer-events-none shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent pointer-events-none" />

        {/* Header Content Container - Compact height (h-14 sm:h-15 lg:h-16) to avoid thick/bloated top bar */}
        <div className="relative max-w-7xl mx-auto px-2.5 sm:px-5 lg:px-8 h-14 sm:h-15 lg:h-16 flex items-center justify-between gap-1.5 sm:gap-4 lg:gap-6">
          {/* Zone 1: Brand Wordmark & Radiant Yellow Logo */}
          <a
            href="#"
            className="flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-lg p-0.5 sm:p-1"
          >
            <img
              src="https://i.postimg.cc/Hx5fGXXX/Untitled-design-2026-07-21T141419-977.png"
              alt="โลโก้สำนักประชาสัมพันธ์และสื่อสารองค์กร สตง."
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 object-contain yellow-logo-filter transition-transform group-hover:scale-105 shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm lg:text-base font-bold tracking-tight text-white group-hover:text-yellow-300 transition-colors flex items-center gap-1 sm:gap-1.5">
                <span>PR - SAI Thailand</span>
                <span className="text-[8px] sm:text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hidden xs:inline">
                  สตง.
                </span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-cyan-400/80 hidden md:inline leading-none mt-0.5 font-mono">
                สำนักประชาสัมพันธ์และสื่อสารองค์กร สตง.
              </span>
            </div>
          </a>

          {/* Quick Search Bar (Prominent on Tablet & Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md xl:max-w-lg mx-2 lg:mx-4">
            <QuickSearchBar data={searchData} />
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-4 text-xs font-medium text-slate-300">
            <a
              href="#home"
              className="hover:text-yellow-300 transition-colors whitespace-nowrap shrink-0 py-1"
            >
              หน้าแรก
            </a>
            <a
              href="#incident-timeline"
              className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>สถานการณ์อาคาร สตง.</span>
            </a>
            <a
              href="#published-works"
              className="hover:text-yellow-300 transition-colors whitespace-nowrap shrink-0 py-1"
            >
              คลังสื่อดิจิทัล
            </a>
            <a
              href="#viral-clips"
              className="hover:text-yellow-300 transition-colors whitespace-nowrap shrink-0 py-1"
            >
              ข่าว & คลิปไวรัล
            </a>
            <a
              href="#public-interest"
              className="hover:text-yellow-300 transition-colors whitespace-nowrap shrink-0 py-1"
            >
              ข้อมูล e-Audit
            </a>
          </nav>

          {/* Zone 3: Action Buttons (Responsive & Touch-Friendly on Smartphone) */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-2.5 shrink-0 relative">
            {/* Mobile Instant Search Trigger Button */}
            <button
              onClick={() => {
                playDigitalSound('blip');
                setMobileSearchOpen(!mobileSearchOpen);
              }}
              className="md:hidden w-8 h-8 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 flex items-center justify-center transition-all active:scale-95"
              aria-label="ค้นหาข้อมูล"
              title="ค้นหาข้อมูลด่วน"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* PR Request Portal CTA - Scaled cleanly on Smartphone */}
            <a
              href="https://pr-request-system.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold text-slate-950 bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-500 hover:from-yellow-300 hover:to-yellow-400 rounded-lg sm:rounded-xl shadow-md shadow-yellow-500/15 hover:shadow-yellow-500/30 transition-all whitespace-nowrap shrink-0 active:scale-95"
              title="ระบบขอรับการสนับสนุนสื่อประชาสัมพันธ์และวิทยากร สตง."
            >
              <span className="hidden sm:inline">ขอสนับสนุนสื่อ</span>
              <span className="sm:hidden">ขอสื่อ</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Biometric 2.5-Second Press & Hold Button / Admin Quick Trigger */}
            <div className="relative flex items-center">
              {isAdminLoggedIn ? (
                <button
                  onClick={() => {
                    playDigitalSound('select');
                    onOpenAdminPanel();
                  }}
                  className="px-2 py-1.5 rounded-lg sm:rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center gap-1 text-[11px] shadow-md shadow-emerald-500/10 active:scale-95"
                  title="เปิดหน้าต่าง Admin"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline font-mono font-medium">Admin</span>
                </button>
              ) : (
                <div
                  className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center select-none cursor-pointer"
                  onMouseDown={startHold}
                  onMouseUp={cancelHold}
                  onMouseLeave={cancelHold}
                  onTouchStart={startHold}
                  onTouchEnd={cancelHold}
                  onTouchCancel={cancelHold}
                  title="แตะค้าง 2.5 วินาทีเพื่อเข้าสู่ระบบ Admin"
                >
                  {/* Circular Progress Ring */}
                  <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle
                      cx="20"
                      cy="20"
                      r={radius}
                      className="stroke-slate-800"
                      strokeWidth="2.5"
                      fill="transparent"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r={radius}
                      className={`transition-all ${
                        scanSuccess
                          ? 'stroke-emerald-400'
                          : isHolding
                          ? 'stroke-yellow-400'
                          : 'stroke-transparent'
                      }`}
                      strokeWidth="2.5"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Fingerprint Button Interior */}
                  <div
                    className={`w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                      scanSuccess
                        ? 'bg-emerald-500/30 text-emerald-300 scale-105 ring-2 ring-emerald-400'
                        : isHolding
                        ? 'bg-yellow-500/25 text-yellow-300 scale-95 shadow-[0_0_15px_rgba(250,204,21,0.6)]'
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
              className="xl:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-sm shadow-cyan-500/10"
              aria-label="Toggle navigation"
              title={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Quick Search Bar Dropdown Overlay (Opens when search icon is clicked) */}
        {mobileSearchOpen && (
          <div className="md:hidden px-3 py-2.5 bg-[#040e2c]/98 border-t border-cyan-500/30 animate-fadeIn">
            <div className="relative">
              <QuickSearchBar data={searchData} />
            </div>
          </div>
        )}
      </header>

      {/* Backdrop for Compact Right-Aligned Menu on Tablet & Mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Compact Right-Aligned Drawer:
          - Reduced size by 40% on Tablet & Mobile (w-[220px] sm:w-[235px] md:w-[250px])
          - Anchored firmly to the right side (right-2 sm:right-3 md:right-4)
          - Gorgeous digital data cyber background
          - Complete access to all information & features */}
      {mobileMenuOpen && (
        <div className="fixed top-15 sm:top-16 right-2 sm:right-3 md:right-4 z-50 w-[225px] sm:w-[240px] md:w-[255px] bg-gradient-to-b from-[#071946]/98 via-[#051338]/98 to-[#030c26]/98 backdrop-blur-2xl border-2 border-cyan-400/60 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(6,182,212,0.35)] p-3 space-y-2 xl:hidden animate-slide-in-right overflow-hidden select-none">
          {/* Cyber Digital Data Grid Texture */}
          <div className="absolute inset-0 bg-digital-grid opacity-30 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(6,182,212,0.8)] pointer-events-none" />

          {/* Tech Viewport Corner Brackets */}
          <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
          <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />
          <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none" />

          {/* Drawer Header with Data Telemetry Badge */}
          <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/25 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] font-bold text-white tracking-wide">เมนูหลัก สตง.</span>
              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-300">
                DATA NODE
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

          {/* Navigation Links with Icons & Cyber Hover Effects (Complete access to all data) */}
          <nav className="space-y-1 relative z-10 text-[11px]">
            <a
              href="#home"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 font-medium text-slate-200 hover:text-cyan-300 hover:bg-cyan-500/15 rounded-lg border border-transparent hover:border-cyan-500/30 transition-all"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>หน้าแรก (ข่าวม้าหมุน)</span>
            </a>

            <a
              href="#incident-timeline"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 font-medium text-cyan-300 hover:bg-cyan-500/20 rounded-lg border border-cyan-500/30 transition-all"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
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
              href="#viral-clips"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 font-medium text-slate-200 hover:text-rose-300 hover:bg-rose-500/15 rounded-lg border border-transparent hover:border-rose-500/30 transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>ข่าว & คลิปไวรัล สตง.</span>
            </a>

            <a
              href="#public-interest"
              onClick={() => {
                playDigitalSound('select');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 font-medium text-slate-200 hover:text-cyan-300 hover:bg-cyan-500/15 rounded-lg border border-transparent hover:border-cyan-500/30 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>ข้อมูล e-Audit (ข้อสงสัย)</span>
            </a>
          </nav>

          {/* Quick Search Shortcut inside Drawer */}
          <div className="pt-1.5 border-t border-cyan-500/20 relative z-10">
            <button
              onClick={() => {
                playDigitalSound('blip');
                setMobileMenuOpen(false);
                setMobileSearchOpen(true);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-medium text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Search className="w-3 h-3 text-cyan-400" />
                <span>ค้นหาข่าวและสื่อ สตง.</span>
              </span>
              <span className="text-[9px] font-mono text-cyan-400/80">CTRL+K</span>
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
