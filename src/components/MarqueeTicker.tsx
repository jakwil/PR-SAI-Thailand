import React, { useState, useEffect, useRef } from 'react';
import { MarqueeTickerSettings } from '../types';
import { BeaconRippleDot } from './BeaconRippleDot';
import { useSiteTheme } from '../contexts/ThemeContext';

interface MarqueeTickerProps {
  settings?: MarqueeTickerSettings;
  className?: string;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({
  settings,
  className = '',
}) => {
  const { isClean } = useSiteTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const tickerWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tickerWrapperRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Default fallback if settings are missing or disabled
  const isEnabled = settings?.enabled !== false;
  if (!isEnabled) {
    return null;
  }

  const messages = (settings?.messages || []).filter((m) => m.active !== false);
  const activeMessages = messages.length > 0 ? messages : [
    {
      id: 'default-1',
      text: 'ศูนย์กลางประชาสัมพันธ์และสื่อสารองค์กร สตง. · SAI THAILAND',
      textColor: '#f59e0b',
      dotColor: '#f59e0b',
      active: true,
    },
  ];

  const direction = settings?.direction || 'right-to-left'; // เลื่อนจากขวาไปซ้าย
  const speedSeconds = settings?.speedSeconds || 85; // เคลื่อนไหวช้ามากๆ (85 วินาทีต่อรอบ)
  const pauseOnHover = settings?.pauseOnHover !== false;

  // Duplicate items 4 times to ensure seamless infinite looping track
  const loopedMessages = [
    ...activeMessages,
    ...activeMessages,
    ...activeMessages,
    ...activeMessages,
  ];

  const isLeftToRight = direction === 'left-to-right';
  const animationClass = isLeftToRight ? 'animate-marquee-track-right' : 'animate-marquee-track-left';

  return (
    <div ref={tickerWrapperRef} className={`w-full ${className}`}>
      {/* Full-Bleed Edge-to-Edge Outer Frame Container */}
      <div
        className={`relative w-full rounded-none border-y border-x-0 overflow-hidden py-2 sm:py-2.5 px-0 flex items-center group/ticker transition-colors ${
          isClean
            ? 'bg-gradient-to-r from-sky-50 via-white to-amber-50/80 border-slate-200 shadow-sm'
            : 'bg-gradient-to-r from-[#061539]/98 via-[#081a44]/98 to-[#051130]/98 border-amber-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.6),0_0_20px_rgba(245,158,11,0.22)]'
        }`}
        onMouseEnter={() => pauseOnHover && setIsHovered(true)}
        onMouseLeave={() => pauseOnHover && setIsHovered(false)}
      >
        {/* Top & Bottom Accent Lines */}
        <div
          className={`absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none ${
            isClean
              ? 'bg-gradient-to-r from-transparent via-sky-500/60 to-transparent'
              : 'bg-gradient-to-r from-transparent via-amber-400/80 to-transparent'
          }`}
        />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

        {/* Optional Prefix Badge */}
        {settings?.prefixLabel && (
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 ml-3 sm:ml-4 rounded-full border text-xs font-bold shrink-0 mr-3 z-20 ${
              isClean
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-amber-500/20 border-amber-400/60 text-amber-300'
            }`}
          >
            <span>{settings.prefixLabel}</span>
          </div>
        )}

        {/* Edge Gradient Fades */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r to-transparent pointer-events-none z-10 ${
            isClean ? 'from-sky-50' : 'from-[#061539]'
          }`}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l to-transparent pointer-events-none z-10 ${
            isClean ? 'from-amber-50/80' : 'from-[#051130]'
          }`}
        />

        {/* Scrolling Marquee Track */}
        <div className="w-full overflow-hidden flex items-center">
          <div
            className={`flex items-center whitespace-nowrap gap-8 sm:gap-14 transform-gpu ${animationClass} ${
              isHovered || !isInViewport ? 'pause-animation' : ''
            }`}
            style={{
              animationDuration: `${speedSeconds}s`,
            }}
          >
            {loopedMessages.map((item, idx) => {
              const rawColor = item.textColor || '#f59e0b';
              const dotColor = item.dotColor || rawColor;
              const cleanTextColor = isClean ? '#0f172a' : rawColor;

              const content = (
                <div className="inline-flex items-center gap-2.5 sm:gap-3 shrink-0 py-0.5">
                  <BeaconRippleDot color={dotColor} size="md" />
                  <span
                    className="font-bold text-sm sm:text-base tracking-wide transition-all"
                    style={{
                      color: cleanTextColor,
                      textShadow: isClean ? 'none' : `0 0 10px ${rawColor}40`,
                    }}
                  >
                    {item.text}
                  </span>
                </div>
              );

              if (item.linkUrl) {
                return (
                  <a
                    key={`ticker-${item.id}-${idx}`}
                    href={item.linkUrl}
                    target={item.linkUrl.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
                    title={`คลิกเปิด: ${item.text}`}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <div key={`ticker-${item.id}-${idx}`}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
