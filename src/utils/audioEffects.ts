// Web Audio API Digital Sound Effects Synthesizer
// Provides zero-latency, authentic high-tech digital & cyber UI sound effects without external audio files

export type DigitalSoundType = 'click' | 'blip' | 'switch' | 'select' | 'beep' | 'radar' | 'tab' | 'confirm';

class DigitalAudioEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private lastClickTime: number = 0;
  private globalListenerAttached: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.attachGlobalClickListener();
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  public toggle(): boolean {
    this.soundEnabled = !this.soundEnabled;
    if (this.soundEnabled) {
      this.play('click');
    }
    return this.soundEnabled;
  }

  /**
   * Automatically play digital click effect on interactive buttons/links
   */
  public attachGlobalClickListener(): void {
    if (this.globalListenerAttached || typeof window === 'undefined') return;
    this.globalListenerAttached = true;

    const handleGlobalClick = (e: MouseEvent) => {
      if (!this.soundEnabled) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, [role="button"], input[type="submit"], input[type="button"]');
      if (interactive) {
        // Prevent rapid double triggering (40ms debounce)
        const now = performance.now();
        if (now - this.lastClickTime > 40) {
          this.lastClickTime = now;
          this.play('click');
        }
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true, passive: true });
  }

  /**
   * Play a crisp digital UI sound effect
   */
  public play(type: DigitalSoundType = 'click'): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    try {
      switch (type) {
        case 'click': {
          // Authentic High-Tech Digital Click:
          // Dual-layer synthesis: Sharp high-frequency digital impulse transient + resonant cyber metallic ping
          
          // Layer 1: High-Frequency Digital Transient Impulse (3800Hz -> 1600Hz in 14ms)
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();

          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(3800, now);
          osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.014);

          gain1.gain.setValueAtTime(0.18, now);
          gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

          osc1.connect(gain1);
          gain1.connect(ctx.destination);

          osc1.start(now);
          osc1.stop(now + 0.02);

          // Layer 2: Resonant Cyber High-Pass Click (Crisp metallic digital snap)
          const osc2 = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain2 = ctx.createGain();

          osc2.type = 'square';
          osc2.frequency.setValueAtTime(2600, now);
          osc2.frequency.exponentialRampToValueAtTime(900, now + 0.012);

          filter.type = 'highpass';
          filter.frequency.setValueAtTime(1800, now);

          gain2.gain.setValueAtTime(0.09, now);
          gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

          osc2.connect(filter);
          filter.connect(gain2);
          gain2.connect(ctx.destination);

          osc2.start(now);
          osc2.stop(now + 0.018);
          break;
        }

        case 'blip': {
          // Sharp futuristic digital blip / micro-chirp (2400Hz -> 3600Hz in 22ms)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(2200, now);
          osc.frequency.exponentialRampToValueAtTime(3600, now + 0.022);

          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }

        case 'switch': {
          // Digital micro-relay toggle (two rapid crisp digital clicks 18ms apart)
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();

          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(2400, now);
          osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.012);

          gain1.gain.setValueAtTime(0.15, now);
          gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(now);
          osc1.stop(now + 0.018);

          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(3200, now + 0.018);
          osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.034);

          gain2.gain.setValueAtTime(0.0001, now);
          gain2.gain.setValueAtTime(0.14, now + 0.018);
          gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(now + 0.018);
          osc2.stop(now + 0.04);
          break;
        }

        case 'select': {
          // Futuristic digital confirmation chime (2-tone ascending cyber harmonic: 1400Hz -> 2400Hz)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(1480, now);
          osc1.frequency.exponentialRampToValueAtTime(1960, now + 0.045);

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(2220, now + 0.035);
          osc2.frequency.exponentialRampToValueAtTime(2960, now + 0.08);

          gain.gain.setValueAtTime(0.15, now);
          gain.gain.setValueAtTime(0.12, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.095);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc1.stop(now + 0.05);
          osc2.start(now + 0.035);
          osc2.stop(now + 0.1);
          break;
        }

        case 'beep': {
          // Clean digital ping / telemetry beacon (1760Hz with high-pass crispness)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(1760, now);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.065);
          break;
        }

        case 'tab': {
          // Subtle soft digital interface tap (2800Hz micro-snap)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(3200, now);
          osc.frequency.exponentialRampToValueAtTime(1800, now + 0.01);

          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.014);
          break;
        }

        case 'confirm': {
          // Pleasant high-tech success chime (chord 523Hz -> 659Hz -> 784Hz)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.05);
          osc.frequency.setValueAtTime(783.99, now + 0.1);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.23);
          break;
        }

        case 'radar': {
          // High-tech digital laser chirp / sweep (800Hz -> 3200Hz)
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(3200, now + 0.06);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(2200, now);

          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.075);
          break;
        }

        default: {
          this.play('click');
        }
      }
    } catch {
      // Audio playback suppressed or blocked by browser policy
    }
  }
}

export const digitalAudio = new DigitalAudioEngine();

export function playDigitalSound(type: DigitalSoundType = 'click'): void {
  digitalAudio.play(type);
}
