/**
 * MA GIÁO ONLINE - VOICE & SOUND SYNTHESIZER
 * Manages Cult Leader speech, priority queues, TTS synthesis and Web Audio Sound FX.
 */

import { LeaderMood } from '../types/magiao';

export interface MaGiaoVoiceItem {
  id: string;
  text: string;
  priority: number;
  mood: LeaderMood;
  targetUsername?: string;
  targetRank?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export type VoiceStateListener = (state: {
  isSpeaking: boolean;
  currentMood: LeaderMood;
  currentText: string;
  targetUser?: string;
}) => void;

class MaGiaoVoiceManager {
  private queue: MaGiaoVoiceItem[] = [];
  private isProcessing = false;
  private currentAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private listeners: Set<VoiceStateListener> = new Set();
  private enabled = true;
  private speed = 1.0;
  private volume = 1.0;
  private provider: 'vienieu' | 'azure' | 'browser' = 'browser';
  private currentMood: LeaderMood = 'ARROGANT';
  private currentText = '';
  private targetUser?: string;
  private isSpeaking = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('click', () => this.initAudioContext(), { once: true });
    }
  }

  private initAudioContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener({
      isSpeaking: this.isSpeaking,
      currentMood: this.currentMood,
      currentText: this.currentText,
      targetUser: this.targetUser,
    });
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const l of this.listeners) {
      l({
        isSpeaking: this.isSpeaking,
        currentMood: this.currentMood,
        currentText: this.currentText,
        targetUser: this.targetUser,
      });
    }
  }

  public setSettings(settings: {
    audioEnabled: boolean;
    voiceProvider: 'vienieu' | 'azure' | 'browser';
    speechSpeed: number;
    speechVolume: number;
  }) {
    this.enabled = settings.audioEnabled;
    this.provider = settings.voiceProvider;
    this.speed = Math.max(0.6, Math.min(1.6, settings.speechSpeed));
    this.volume = Math.max(0, Math.min(1.0, settings.speechVolume));
  }

  public enqueue(item: Omit<MaGiaoVoiceItem, 'id'>) {
    if (!this.enabled) return;

    const fullItem: MaGiaoVoiceItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
    };

    // If higher priority than currently waiting items, place ahead
    this.queue.push(fullItem);
    this.queue.sort((a, b) => b.priority - a.priority);

    // Limit backlog so it doesn't queue 100 obsolete comments
    if (this.queue.length > 8) {
      this.queue = this.queue.slice(0, 8);
    }

    if (!this.isProcessing) {
      this.processNext();
    }
  }

  private async processNext() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      this.isSpeaking = false;
      this.currentText = '';
      this.currentMood = 'ARROGANT';
      this.targetUser = undefined;
      this.notify();
      return;
    }

    this.isProcessing = true;
    const item = this.queue.shift()!;

    this.isSpeaking = true;
    this.currentMood = item.mood;
    this.currentText = item.text;
    this.targetUser = item.targetUsername;
    this.notify();

    item.onStart?.();

    try {
      await this.speak(item.text);
    } catch {
      // Speech fallback caught
    } finally {
      item.onEnd?.();
      setTimeout(() => {
        this.processNext();
      }, 400);
    }
  }

  private async speak(text: string): Promise<void> {
    if (this.provider !== 'browser') {
      try {
        const res = await fetch('/api/tts/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            provider: this.provider,
            speed: this.speed,
            gender: 'male',
          }),
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          await this.playAudioBlob(url);
          return;
        }
      } catch {
        // Fallback to browser
      }
    }

    // Default Browser Web Speech
    await this.speakBrowser(text);
  }

  private speakBrowser(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        // Mock delay for text readability
        setTimeout(resolve, Math.min(6000, Math.max(2000, text.length * 60)));
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.speed;
      utterance.volume = this.volume;
      utterance.pitch = 0.85; // Deeper male authority pitch

      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find((v) => v.lang.startsWith('vi') || v.lang.includes('VN'));
      if (viVoice) {
        utterance.voice = viVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);

      // Safety timeout
      setTimeout(resolve, Math.max(3000, text.length * 90));
    });
  }

  private playAudioBlob(url: string): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio(url);
      this.currentAudio = audio;
      audio.volume = this.volume;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.play().catch(() => resolve());
    });
  }

  public stopAndClear() {
    this.queue = [];
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isProcessing = false;
    this.isSpeaking = false;
    this.currentText = '';
    this.notify();
  }

  // --- Web Audio SFX Synthesis ---
  public playGongSound() {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.audioContext) return;

    try {
      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 1.8);

      gain.gain.setValueAtTime(0.4 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 2.0);
    } catch {
      // AudioContext policy
    }
  }

  public playPromotionFanfare() {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.audioContext) return;

    try {
      const ctx = this.audioContext;
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]; // C E G C E G
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.3 * this.volume, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.7);
      });
    } catch {
      // ignore
    }
  }

  public playMartialWhoosh() {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.audioContext) return;

    try {
      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.25 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // ignore
    }
  }
}

export const maGiaoVoiceManager = new MaGiaoVoiceManager();
