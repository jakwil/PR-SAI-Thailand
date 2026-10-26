import React from 'react';

interface BeaconRippleDotProps {
  color?: string; // hex or CSS color, default '#f59e0b'
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BeaconRippleDot: React.FC<BeaconRippleDotProps> = ({
  color = '#f59e0b',
  size = 'md',
  className = '',
}) => {
  // Dimensions based on size
  const containerDim = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const coreDim = size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  return (
    <span
      className={`relative inline-flex items-center justify-center ${containerDim} shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      {/* Wave Ring 1 (Immediate Pulse) */}
      <span
        className="absolute inset-0 rounded-full animate-beacon-wave-1 pointer-events-none"
        style={{
          border: `1.5px solid ${color}`,
          backgroundColor: `${color}25`,
        }}
      />

      {/* Wave Ring 2 (Staggered Delay +0.72s) */}
      <span
        className="absolute inset-0 rounded-full animate-beacon-wave-2 pointer-events-none"
        style={{
          border: `1.5px solid ${color}`,
          backgroundColor: `${color}18`,
        }}
      />

      {/* Wave Ring 3 (Staggered Delay +1.44s) */}
      <span
        className="absolute inset-0 rounded-full animate-beacon-wave-3 pointer-events-none"
        style={{
          border: `1.5px solid ${color}`,
          backgroundColor: `${color}10`,
        }}
      />

      {/* Radiant Glowing Core Beacon Dot */}
      <span
        className={`relative inline-block rounded-full ${coreDim}`}
        style={{
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}, 0 0 18px ${color}`,
        }}
      />
    </span>
  );
};
