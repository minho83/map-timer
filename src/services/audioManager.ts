class AudioManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  generateTone(frequency: number, duration: number, volume: number): void {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(volume / 100, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  play(soundId: string, volume: number = 70): void {
    switch (soundId) {
      case 'alarm-default':
        this.generateTone(880, 0.5, volume);
        setTimeout(() => this.generateTone(880, 0.5, volume), 600);
        break;
      case 'alarm-bell':
        this.generateTone(1200, 0.3, volume);
        setTimeout(() => this.generateTone(1500, 0.3, volume), 400);
        setTimeout(() => this.generateTone(1200, 0.3, volume), 800);
        break;
      case 'alarm-chime':
        this.generateTone(523, 0.4, volume);
        setTimeout(() => this.generateTone(659, 0.4, volume), 500);
        setTimeout(() => this.generateTone(784, 0.6, volume), 1000);
        break;
      case 'alarm-urgent':
        for (let i = 0; i < 5; i++) {
          setTimeout(() => this.generateTone(1000, 0.15, volume), i * 200);
        }
        break;
      default:
        this.generateTone(880, 0.5, volume);
    }
  }

  preview(soundId: string, volume: number = 70): void {
    this.play(soundId, volume);
  }

  stopAll(): void {
    this.audioCache.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}

export const audioManager = new AudioManager();
