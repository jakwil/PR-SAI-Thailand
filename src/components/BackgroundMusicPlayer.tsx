import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Disc3, Settings } from 'lucide-react';
import { MusicSettings } from '../types';
import { parseGoogleDriveAudioUrl } from '../firebase';

interface BackgroundMusicPlayerProps {
  settings?: MusicSettings;
  isDucked: boolean; // True when video or audio clip is actively playing
  onOpenSettings?: () => void;
  showWidget?: boolean; // False by default: hidden from regular users as admin controls audio
}

export const BackgroundMusicPlayer: React.FC<BackgroundMusicPlayerProps> = ({
  settings,
  isDucked,
  onOpenSettings,
  showWidget = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(settings?.defaultVolume ?? 0.18);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showVolumePopup, setShowVolumePopup] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  // Determine effective stream source URL prioritizing Google Drive direct proxy
  const audioSource = React.useMemo(() => {
    if (settings?.driveUrl && settings.driveUrl.trim().length > 0) {
      return parseGoogleDriveAudioUrl(settings.driveUrl);
    }
    if (settings?.streamUrl && settings.streamUrl.trim().length > 0) {
      return parseGoogleDriveAudioUrl(settings.streamUrl);
    }
    return 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3';
  }, [settings?.driveUrl, settings?.streamUrl]);

  // Reload audio element whenever source URL updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = audioSource;
    audio.load();
    if (isPlaying && settings?.enabled !== false) {
      audio.play().catch((err) => {
        console.warn('Playback resume notice:', err);
      });
    }
  }, [audioSource]);

  // Synchronize base volume from settings if changed by admin
  useEffect(() => {
    if (settings?.defaultVolume !== undefined && !hasInteracted) {
      setVolume(settings.defaultVolume);
    }
  }, [settings?.defaultVolume, hasInteracted]);

  // Audio Ducking Effect: smoothly fade volume down when isDucked is true, and fade back up when false
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    const targetVolume = isMuted
      ? 0
      : isDucked
      ? (settings?.duckingVolume ?? 0.03) // almost inaudible during video
      : volume; // gentle default volume

    const stepDuration = 30; // ms
    const fadeSteps = 15;
    let stepCount = 0;
    const startVolume = audio.volume;
    const volumeDelta = (targetVolume - startVolume) / fadeSteps;

    fadeIntervalRef.current = window.setInterval(() => {
      stepCount++;
      const nextVol = Math.max(0, Math.min(1, audio.volume + volumeDelta));
      audio.volume = nextVol;

      if (stepCount >= fadeSteps) {
        audio.volume = targetVolume;
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
      }
    }, stepDuration);

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [isDucked, volume, isMuted, settings?.duckingVolume]);

  // Auto-start on first user interaction if enabled
  useEffect(() => {
    const startAudioOnFirstClick = () => {
      if (!audioRef.current || isPlaying) return;
      if (settings?.enabled === false) return;

      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch(() => {
          // Autoplay blocked by browser until direct button press
        });
    };

    window.addEventListener('click', startAudioOnFirstClick, { once: true });
    window.addEventListener('touchstart', startAudioOnFirstClick, { once: true });

    return () => {
      window.removeEventListener('click', startAudioOnFirstClick);
      window.removeEventListener('touchstart', startAudioOnFirstClick);
    };
  }, [isPlaying, settings?.enabled]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch((err) => {
          console.warn('Playback error:', err);
        });
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setHasInteracted(true);
    if (audioRef.current && !isDucked && !isMuted) {
      audioRef.current.volume = newVol;
    }
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : isDucked ? (settings?.duckingVolume ?? 0.03) : volume;
    }
  };

  return (
    <>
      {/* Hidden audio element looping ambient track */}
      <audio
        ref={audioRef}
        src={audioSource}
        loop
        preload="auto"
        onError={(e) => {
          console.warn('Audio stream error, falling back to ambient melody');
          const target = e.target as HTMLAudioElement;
          if (target.src !== 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3') {
            target.src = 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3';
            if (isPlaying) target.play().catch(() => {});
          }
        }}
      />

      {/* Floating Modern Glass Music Control Bar - Only rendered if showWidget is true (Hidden from general users as requested) */}
      {showWidget && (
        <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2 select-none">
          <div className="relative flex items-center bg-[#030d29]/90 backdrop-blur-xl border border-cyan-500/40 hover:border-cyan-400/80 rounded-2xl px-3 py-2 shadow-[0_8px_32px_rgba(2,10,31,0.85)] transition-all">
            {/* Animated Vinyl / Music Icon */}
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 focus:outline-none group mr-2"
              title={isPlaying ? 'หยุดเพลงชั่วคราว' : 'เปิดเพลงประกอบเบาๆ'}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  isPlaying
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.7)] animate-spin-slow'
                    : 'bg-slate-800 text-slate-400 group-hover:text-cyan-300'
                }`}
                style={{ animationDuration: '6s' }}
              >
                {isPlaying ? (
                  <Disc3 className="w-4 h-4 text-slate-950" />
                ) : (
                  <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                )}
              </div>

              {/* Title & Status */}
              <div className="hidden sm:flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-white tracking-wide max-w-[130px] truncate">
                    {settings?.title || 'เพลงบรรเลง สตง.'}
                  </span>
                  {isDucked && isPlaying && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                      ลดเสียงคลิป
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-cyan-400/80 font-mono">
                  {isPlaying ? (isDucked ? 'หรี่เสียงอัตโนมัติ' : 'เปิดเพลงคลอเบาๆ') : 'แตะเพื่อเปิดเพลง'}
                </span>
              </div>
            </button>

            {/* Equalizer Sound Waves (When Playing) */}
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-4 px-1.5 mr-2">
                <span className={`w-0.5 bg-cyan-400 rounded-full animate-soundwave-1 ${isDucked ? 'opacity-30' : ''}`} />
                <span className={`w-0.5 bg-cyan-300 rounded-full animate-soundwave-2 ${isDucked ? 'opacity-30' : ''}`} />
                <span className={`w-0.5 bg-cyan-400 rounded-full animate-soundwave-3 ${isDucked ? 'opacity-30' : ''}`} />
                <span className={`w-0.5 bg-cyan-300 rounded-full animate-soundwave-4 ${isDucked ? 'opacity-30' : ''}`} />
              </div>
            )}

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="p-1 text-slate-300 hover:text-white transition-colors mr-1"
              title={isPlaying ? 'หยุดชั่วคราว' : 'เล่นเพลง'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Volume Button with Popover Slider */}
            <div className="relative">
              <button
                onClick={() => setShowVolumePopup(!showVolumePopup)}
                onMouseEnter={() => setShowVolumePopup(true)}
                className="p-1 text-slate-300 hover:text-cyan-300 transition-colors"
                title="ปรับระดับเสียง"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </button>

              {/* Volume Slider Popover */}
              {showVolumePopup && (
                <div
                  onMouseLeave={() => setShowVolumePopup(false)}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#040e2b]/95 backdrop-blur-xl border border-cyan-500/40 p-2.5 rounded-xl shadow-2xl flex flex-col items-center gap-2 animate-fadeIn z-50 min-w-[120px]"
                >
                  <div className="flex items-center justify-between w-full text-[10px] text-cyan-300 font-mono">
                    <span>เสียงเพลง</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.01"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-24 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <button
                    onClick={toggleMute}
                    className="text-[10px] text-slate-300 hover:text-yellow-300 underline"
                  >
                    {isMuted ? 'เปิดเสียง' : 'ปิดเสียงชั่วคราว'}
                  </button>
                </div>
              )}
            </div>

            {/* Admin Music Config Shortcut */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="ml-1.5 p-1 text-slate-400 hover:text-amber-300 transition-colors border-l border-cyan-500/20 pl-2"
                title="ตั้งค่าเพลงใน Admin"
              >
                <Settings className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
