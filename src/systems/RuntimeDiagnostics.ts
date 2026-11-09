// CHUA_STABLE3D_DIAGNOSTICS_V3: local-only bounded runtime diagnostics.
// No usernames, comments, gift messages, or TikTok credentials are recorded.
export const CHUA_DIAGNOSTIC_KEY = 'chua_runtime_health_v3';

type DiagnosticFields = Record<string, string | number | boolean | null | undefined>;
interface DiagnosticEvent {
  time: string;
  type: string;
  details: DiagnosticFields;
}

export function recordRuntimeDiagnostic(type: string, details: DiagnosticFields = {}): void {
  try {
    const current = JSON.parse(localStorage.getItem(CHUA_DIAGNOSTIC_KEY) || '[]') as DiagnosticEvent[];
    const safeDetails = Object.fromEntries(Object.entries(details).map(([key, value]) => [
      key, typeof value === 'string' ? value.slice(0, 240) : value,
    ])) as DiagnosticFields;
    current.push({ time: new Date().toISOString(), type, details: safeDetails });
    localStorage.setItem(CHUA_DIAGNOSTIC_KEY, JSON.stringify(current.slice(-120)));
  } catch { /* Storage may be blocked in a browser source; never interrupt the game. */ }
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    recordRuntimeDiagnostic('javascript_error', { message: event.message || 'unknown', file: event.filename?.split('/').pop() || '' });
  });
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    recordRuntimeDiagnostic('promise_rejection', { message });
  });
  (window as Window & { __chuaDiagnostics?: () => DiagnosticEvent[] }).__chuaDiagnostics = () => {
    try { return JSON.parse(localStorage.getItem(CHUA_DIAGNOSTIC_KEY) || '[]') as DiagnosticEvent[]; }
    catch { return []; }
  };
  recordRuntimeDiagnostic('page_started', { urlMode: new URLSearchParams(window.location.search).get('safe3d') === '1' ? 'safe3d' : 'normal' });
}
