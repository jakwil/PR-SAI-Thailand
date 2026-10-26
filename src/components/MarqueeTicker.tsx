import React, { useState } from 'react';
import { MarqueeTickerSettings } from '../types';
import { BeaconRippleDot } from './BeaconRippleDot';

interface MarqueeTickerProps {
  settings?: MarqueeTickerSettings;
  className?: string;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({
  settings,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

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

  const direction = settings?.direction || 'left-to-right'; // User specified default: left to right
  const speedSeconds = settings?.speedSeconds || 32;
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
    <div
      className={`w-full max-w-[1920px] 2xl:max-w-[2400px] 3xl:max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mx-auto ${className}`}
    >
      {/* Full-Width Outer Frame Container (ขยายเต็มกรอบ) */}
      <div
        className="relative w-full rounded-2xl bg-gradient-to-r from-[#061539]/95 via-[#081a44]/95 to-[#051130]/95 border border-amber-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.6),0_0_20px_rgba(245,158,11,0.22)] backdrop-blur-xl overflow-hidden py-1.5 sm:py-2 px-2 sm:px-3 flex items-center group/ticker"
        onMouseEnter={() => pauseOnHover && setIsHovered(true)}
        onMouseLeave={() => pauseOnHover && setIsHovered(false)}
      >
        {/* Holographic Top & Bottom Laser Accent Lines */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

        {/* Optional Prefix Badge (if configured) */}
        {settings?.prefixLabel && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-[11px] font-bold shrink-0 mr-3 z-20">
            <span>{settings.prefixLabel}</span>
          </div>
        )}

        {/* Edge Gradient Fades for Smooth Enter/Exit */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#061539] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#051130] to-transparent pointer-events-none z-10" />

        {/* Scrolling Marquee Track */}
        <div className="w-full overflow-hidden flex items-center">
          <div
            className={`flex items-center whitespace-nowrap gap-8 sm:gap-14 ${animationClass} ${
              isHovered ? 'pause-animation' : ''
            }`}
            style={{
              animationDuration: `${speedSeconds}s`,
            }}
          >
            {loopedMessages.map((item, idx) => {
              const itemColor = item.textColor || '#f59e0b';
              const dotColor = item.dotColor || itemColor;

              const content = (
                <div className="inline-flex items-center gap-2.5 sm:gap-3 shrink-0 py-0.5">
                  {/* Blinking Expanding Ripple Wave Beacon Dot (เหมือนคลิปวิดีโอ) */}
                  <BeaconRippleDot color={dotColor} size="md" />

                  {/* Message Text with Customizable Color & Hover Glow */}
                  <span
                    className="font-bold text-xs sm:text-[13.5px] tracking-wide transition-all"
                    style={{
                      color: itemColor,
                      textShadow: `0 0 10px ${itemColor}40`,
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
