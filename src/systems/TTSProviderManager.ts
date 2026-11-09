import {
  CURATED_VIENEU_VOICES,
  VieNeuMode,
  VieNeuVoiceOption,
  VoiceSettings,
} from '../types/temple';
import { waitForVietnameseBrowserVoices } from './browserVietnameseVoices';

interface CachedClip {
  dataUrl: string;
  latencyMs: number;
  createdAt: number;
}

export interface SpeakOutcome {
  ok: boolean;
  usedFallback: boolean;
  providerLabel: string;
  latencyMs?: number;
  errorWarning?: string;
}

export interface TTSConnectionTestOutcome {
  ok: boolean;
  providerUsed?: string;
  modeUsed?: VieNeuMode;
  endpointUsed?: string;
  latencyMs?: number;
  errorMessage?: string;
}

export class TTSProviderManager {
  private audioCache = new Map<string, CachedClip>();
  private pendingPreparations = new Map<string, Promise<boolean>>();
  private static readonly MAX_CACHE = 45;

  private getCacheKey(settings: VoiceSettings, text: string): string {
    return [
      settings.provider,
      settings.vieneuMode,
      settings.vieneuModel,
      settings.localEndpoint,
      settings.voiceId,
      settings.gender,
      settings.speed.toFixed(2),
      text,
    ].join('|');
  }

  /**
   * Start VieNeu synthesis when the fortune is DRAWN, several seconds before its
   * animated reveal. Only caches the clip: never plays early or overlaps another voice.
   * The regular speakText() waits for the same in-flight request if necessary.
   */
  public prepareText(text: string, settings: VoiceSettings): Promise<boolean> {
    if (settings.provider === 'browser' || !text.trim()) return Promise.resolve(false);
    const key = this.getCacheKey(settings, text);
    if (this.audioCache.has(key)) return Promise.resolve(true);
    const existing = this.pendingPreparations.get(key);
    if (existing) return existing;
    if (this.pendingPreparations.size >= 6) return Promise.resolve(false);

    const task = (async () => {
      const controller = new AbortController();
      // Allow local TTS enough time to finish so prewarming does not abort
      // before the server's 60-second synthesis timeout and trigger duplicate work.
      const timeout = setTimeout(() => controller.abort(), 70000);
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: settings.provider,
            vieneuMode: settings.vieneuMode,
            vieneuModel: settings.vieneuModel,
            localEndpoint: settings.localEndpoint,
            text,
            endpoint: settings.endpoint,
            voiceId: settings.voiceId,
            gender: settings.gender,
            speed: settings.speed,
          }),
          signal: controller.signal,
        });
        if (!response.ok) return false;
        const data = await response.json();
        if (!data?.ok || !data.audioBase64) return false;
        if (this.audioCache.size >= TTSProviderManager.MAX_CACHE) {
          const oldestKey = this.audioCache.keys().next().value;
          if (oldestKey) this.audioCache.delete(oldestKey);
        }
        this.audioCache.set(key, {
          dataUrl: `data:${data.mimeType || 'audio/mpeg'};base64,${data.audioBase64}`,
          latencyMs: Number(data.latencyMs || 0),
          createdAt: Date.now(),
        });
        return true;
      } catch {
        return false; // Network/endpoint failures fall through to existing TTS fallback.
      } finally {
        clearTimeout(timeout);
      }
    })();
    this.pendingPreparations.set(key, task);
    void task.finally(() => this.pendingPreparations.delete(key));
    return task;
  }

  public async fetchAvailableVoices(
    mode: VieNeuMode,
    localEndpoint?: string,
  ): Promise<{
    ok: boolean;
    voices: VieNeuVoiceOption[];
    effectiveEndpoint: string;
    apiKeyConfigured: boolean;
    isCloudRuntime: boolean;
    warning?: string;
  }> {
    try {
      const qs = new URLSearchParams({ mode });
      if (localEndpoint) qs.set('localEndpoint', localEndpoint);
      const res = await fetch(`/api/tts/voices?${qs.toString()}`);
      const data = await res.json();
      return {
        ok: Boolean(data?.ok),
        voices:
          Array.isArray(data?.voices) && data.voices.length > 0
            ? data.voices
            : CURATED_VIENEU_VOICES,
        effectiveEndpoint:
          data?.effectiveEndpoint ||
          (mode === 'cloud'
            ? 'https://api.vieneu.io/api/v1/audio/speech'
            : localEndpoint || 'http://127.0.0.1:8000/v1/audio/speech'),
        apiKeyConfigured: Boolean(data?.apiKeyConfigured),
        isCloudRuntime: Boolean(data?.isCloudRuntime),
        warning: data?.warning || data?.error,
      };
    } catch (err: unknown) {
      return {
        ok: false,
        voices: CURATED_VIENEU_VOICES,
        effectiveEndpoint:
          mode === 'cloud'
            ? 'https://api.vieneu.io/api/v1/audio/speech'
            : localEndpoint || 'http://127.0.0.1:8000/v1/audio/speech',
        apiKeyConfigured: false,
        isCloudRuntime: true,
        warning: err instanceof Error ? err.message : 'Không tải được danh sách giọng đọc.',
      };
    }
  }

  /**
   * Executes a real connection test against the configured TTS backend without masking errors with fallback.
   */
  public async testConnection(
    settings: VoiceSettings,
    playSampleAudio = true,
  ): Promise<TTSConnectionTestOutcome> {
    if (settings.provider === 'browser') {
      try {
        const viVoices = await waitForVietnameseBrowserVoices();
        if (!viVoices.length) throw new Error('Chrome chưa cung cấp giọng tiếng Việt. Hãy thử Safari hoặc chọn Azure Speech.');
        if (playSampleAudio) {
          const ctrl = new AbortController();
          await this.speakWithBrowserSynthesis(
            'Nam mô A Di Đà Phật. Giọng đọc tiếng Việt đã sẵn sàng.',
            settings,
            ctrl.signal,
          );
        }
        return { ok: true, providerUsed: 'browser', latencyMs: 0 };
      } catch (error: unknown) {
        return {
          ok: false,
          errorMessage: error instanceof Error ? error.message : 'Không có giọng đọc tiếng Việt trong trình duyệt.',
        };
      }
    }

    try {
      const response = await fetch('/api/tts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: settings.provider,
          vieneuMode: settings.vieneuMode,
          vieneuModel: settings.vieneuModel,
          localEndpoint: settings.localEndpoint,
          endpoint: settings.endpoint,
          voiceId: settings.voiceId,
          gender: settings.gender,
          speed: settings.speed,
          text: 'Nam mô A Di Đà Phật. Kính chúc quý Phật tử luôn bình an.',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.ok || !data?.audioBase64) {
        return {
          ok: false,
          errorMessage: data?.error || `Lỗi kết nối TTS (HTTP ${response.status})`,
        };
      }

      if (playSampleAudio) {
        const dataUrl = `data:${data.mimeType || 'audio/mpeg'};base64,${data.audioBase64}`;
        const ctrl = new AbortController();
        await this.playAudioDataUrl(dataUrl, settings.volume, ctrl.signal);
      }

      return {
        ok: true,
        providerUsed: data.providerUsed || settings.provider,
        modeUsed: data.modeUsed || settings.vieneuMode,
        endpointUsed: data.endpointUsed,
        latencyMs: data.latencyMs,
      };
    } catch (err: unknown) {
      return {
        ok: false,
        errorMessage: err instanceof Error ? err.message : 'Không thể kết nối máy chủ TTS.',
      };
    }
  }

  public async speakText(
    text: string,
    settings: VoiceSettings,
    abortSignal: AbortSignal,
    onPlaybackStart?: () => void,
  ): Promise<SpeakOutcome> {
    if (abortSignal.aborted) {
      return { ok: true, usedFallback: false, providerLabel: settings.provider };
    }

    if (settings.provider === 'browser') {
      try {
        await this.speakWithBrowserSynthesis(text, settings, abortSignal, onPlaybackStart);
        return { ok: true, usedFallback: false, providerLabel: 'Browser SpeechSynthesis (Tiếng Việt)' };
      } catch (error: unknown) {
        return {
          ok: false,
          usedFallback: false,
          providerLabel: 'Browser SpeechSynthesis',
          errorWarning: error instanceof Error ? error.message : 'Không có giọng tiếng Việt trong trình duyệt.',
        };
      }
    }

    const cacheKey = this.getCacheKey(settings, text);
    const preparing = this.pendingPreparations.get(cacheKey);
    if (preparing) {
      let resolveAbort: () => void = () => {};
      const aborted = new Promise<void>((resolve) => { resolveAbort = resolve; });
      const onAbort = () => resolveAbort();
      abortSignal.addEventListener('abort', onAbort, { once: true });
      try {
        await Promise.race([preparing, aborted]);
      } finally {
        abortSignal.removeEventListener('abort', onAbort);
      }
    }
    if (abortSignal.aborted) {
      return { ok: true, usedFallback: false, providerLabel: settings.provider };
    }
    const cached = this.audioCache.get(cacheKey);
    if (cached) {
      await this.playAudioDataUrl(cached.dataUrl, settings.volume, abortSignal, onPlaybackStart);
      return {
        ok: true,
        usedFallback: false,
        providerLabel:
          settings.provider === 'vieneu'
            ? `VieNeu (${settings.vieneuMode === 'cloud' ? 'Cloud' : 'Local'})`
            : settings.provider,
        latencyMs: cached.latencyMs,
      };
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: settings.provider,
          vieneuMode: settings.vieneuMode,
          vieneuModel: settings.vieneuModel,
          localEndpoint: settings.localEndpoint,
          text,
          endpoint: settings.endpoint,
          voiceId: settings.voiceId,
          gender: settings.gender,
          speed: settings.speed,
        }),
        signal: abortSignal,
      });

      const data = await response.json();
      if (!response.ok || !data?.ok || !data?.audioBase64) {
        throw new Error(data?.error || `TTS HTTP ${response.status}`);
      }

      const dataUrl = `data:${data.mimeType || 'audio/mpeg'};base64,${data.audioBase64}`;
      if (this.audioCache.size >= TTSProviderManager.MAX_CACHE) {
        const oldestKey = this.audioCache.keys().next().value;
        if (oldestKey) this.audioCache.delete(oldestKey);
      }
      this.audioCache.set(cacheKey, {
        dataUrl,
        latencyMs: Number(data.latencyMs || 0),
        createdAt: Date.now(),
      });

      await this.playAudioDataUrl(dataUrl, settings.volume, abortSignal, onPlaybackStart);
      return {
        ok: true,
        usedFallback: false,
        providerLabel:
          settings.provider === 'vieneu'
            ? `VieNeu ${settings.vieneuMode === 'cloud' ? 'Cloud' : 'Local'}`
            : settings.provider,
        latencyMs: data.latencyMs,
      };
    } catch (err: unknown) {
      if (abortSignal.aborted) {
        return { ok: true, usedFallback: false, providerLabel: settings.provider };
      }
      const actualError = err instanceof Error ? err.message : 'Lỗi kết nối dịch vụ TTS';

      if (settings.browserFallbackEnabled) {
        try {
          await this.speakWithBrowserSynthesis(text, settings, abortSignal, onPlaybackStart);
          return {
            ok: false,
            usedFallback: true,
            providerLabel: 'Browser SpeechSynthesis (Dự phòng tiếng Việt)',
            errorWarning: actualError,
          };
        } catch (fallbackError: unknown) {
          return {
            ok: false,
            usedFallback: false,
            providerLabel: settings.provider,
            errorWarning: `${actualError}. ${fallbackError instanceof Error ? fallbackError.message : 'Trình duyệt thiếu giọng tiếng Việt.'}`,
          };
        }
      }

      // If browser fallback is disabled, keep subtitle visible briefly and report the real error
      await new Promise<void>((resolve) => {
        const t = window.setTimeout(resolve, 2600);
        abortSignal.addEventListener('abort', () => {
          window.clearTimeout(t);
          resolve();
        });
      });

      return {
        ok: false,
        usedFallback: false,
        providerLabel: settings.provider,
        errorWarning: actualError,
      };
    }
  }

  private playAudioDataUrl(
    dataUrl: string,
    volume: number,
    abortSignal: AbortSignal,
    onPlaybackStart?: () => void,
  ): Promise<void> {
    return new Promise((resolve) => {
      if (abortSignal.aborted) {
        resolve();
        return;
      }
      const audio = new Audio(dataUrl);
      audio.volume = Math.max(0, Math.min(1, volume));

      const cleanup = () => {
        audio.onplaying = null;
        audio.onended = null;
        audio.onerror = null;
        abortSignal.removeEventListener('abort', onAbort);
      };

      const onAbort = () => {
        audio.pause();
        audio.src = '';
        cleanup();
        resolve();
      };

      abortSignal.addEventListener('abort', onAbort);
      audio.onplaying = () => {
        onPlaybackStart?.();
        audio.onplaying = null;
      };
      audio.onended = () => {
        cleanup();
        resolve();
      };
      audio.onerror = () => {
        cleanup();
        resolve();
      };

      audio.play().catch(() => {
        cleanup();
        resolve();
      });
    });
  }

  public async speakWithBrowserSynthesis(
    text: string,
    settings: VoiceSettings,
    abortSignal: AbortSignal,
    onPlaybackStart?: () => void,
  ): Promise<void> {
    if (abortSignal.aborted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      throw new Error('Trình duyệt không hỗ trợ SpeechSynthesis.');
    }
    const viVoices = await waitForVietnameseBrowserVoices();
    if (abortSignal.aborted) return;
    if (!viVoices.length) {
      throw new Error('Không tìm thấy giọng tiếng Việt (vi-VN) trong Chrome. Không sử dụng giọng nước ngoài. Hãy chọn Azure Speech hoặc thử Safari.');
    }
    const selected = viVoices.find((v) => v.voiceURI === settings.browserVoiceURI)
      || viVoices.find((v) => /^linh(?:\b|\s|\()/i.test(v.name))
      || viVoices[0];

    await new Promise<void>((resolve, reject) => {
      if (abortSignal.aborted) { resolve(); return; }
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selected; // Do not rely solely on lang; explicitly select Vietnamese voice
      utterance.lang = selected.lang.replace('_', '-');
      utterance.volume = Math.max(0, Math.min(1, settings.volume));
      utterance.rate = Math.max(0.65, Math.min(1.4, settings.speed));
      utterance.pitch = 1;
      const maxDurationMs = Math.min(30000, Math.max(6000, text.length * 110));
      let settled = false;
      let timer: number | undefined;
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        if (timer !== undefined) window.clearTimeout(timer);
        abortSignal.removeEventListener('abort', onAbort);
        utterance.onstart = null;
        utterance.onend = null;
        utterance.onerror = null;
        if (error && !abortSignal.aborted) reject(error);
        else resolve();
      };
      const onAbort = () => { synth.cancel(); finish(); };
      abortSignal.addEventListener('abort', onAbort, { once: true });
      utterance.onstart = () => onPlaybackStart?.();
      utterance.onend = () => finish();
      utterance.onerror = (event) => finish(new Error(`Không phát được giọng Việt ${selected.name}: ${event.error}`));
      timer = window.setTimeout(() => { synth.cancel(); finish(new Error('Trình duyệt không phản hồi khi phát giọng tiếng Việt.')); }, maxDurationMs);
      synth.speak(utterance);
    });
  }
}
