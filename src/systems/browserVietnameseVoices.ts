/** Only accept Vietnamese speech voices actually exposed by this browser. */
export function getVietnameseBrowserVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices().filter((voice) => /^vi(?:[-_]|$)/i.test(voice.lang.trim()));
}

/** Chromium can populate voices after the initial page render. */
export function waitForVietnameseBrowserVoices(timeoutMs = 2200): Promise<SpeechSynthesisVoice[]> {
  const found = getVietnameseBrowserVoices();
  if (found.length > 0) return Promise.resolve(found);
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve([]);
  const synth = window.speechSynthesis;
  return new Promise((resolve) => {
    let finished = false;
    let timer: number | undefined;
    const done = (voices: SpeechSynthesisVoice[]) => {
      if (finished) return;
      finished = true;
      synth.removeEventListener('voiceschanged', refresh);
      if (timer !== undefined) window.clearTimeout(timer);
      resolve(voices);
    };
    const refresh = () => {
      const voices = getVietnameseBrowserVoices();
      if (voices.length) done(voices);
    };
    synth.addEventListener('voiceschanged', refresh);
    timer = window.setTimeout(() => done(getVietnameseBrowserVoices()), timeoutMs);
    refresh();
  });
}
