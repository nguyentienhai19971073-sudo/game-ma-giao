#!/usr/bin/env python3
"""Conservative 30fps/low-resource WebGL stability and diagnostics patch for CHUA ONLINE 3D.

Run at the project root. Stops without editing when source anchors differ.
"""
from datetime import datetime
from pathlib import Path
import sys

SCENE = Path('src/components/three/TempleScene.tsx')
MAIN = Path('src/main.tsx')
DIAG = Path('src/systems/RuntimeDiagnostics.ts')
BOUNDARY = Path('src/components/ui/AppErrorBoundary.tsx')
VERSION = 'CHUA_STABLE3D_DIAGNOSTICS_V3'

if not SCENE.is_file() or not MAIN.is_file():
    sys.exit('❌ Sai thư mục: hãy cd vào thư mục gốc Chua_Online_3D (phải có src/main.tsx).')
scene = SCENE.read_text(encoding='utf-8')
main = MAIN.read_text(encoding='utf-8')
if VERSION in scene:
    print('✅ Bản vá ổn định 3D V3 đã được áp dụng. Không sửa lần nữa.')
    sys.exit(0)
if 'CHUA_ONLINE_WEBGL_RECOVERY_V1' not in scene:
    sys.exit('❌ Chưa có bản WebGL Recovery V1 trong TempleScene.tsx; dừng để tránh ghi đè nhầm phiên bản.')

anchors = {
    "three import": ("import { getTikTokDisplayName } from '../../utils/tiktokDisplayName';", 1),
    "old slots": ('const MAX_LABEL_SLOTS = 160;', 1),
    "scene mode controller": ('function SceneModeAndCameraController({', 1),
    "label slots 1": ('const labelSlotCount = Math.max(MAX_LABEL_SLOTS, participants.length);', 1),
    "label slots 2": ('const labelSlotCount = Math.max(MAX_LABEL_SLOTS, labelSlice.length);', 1),
    "canvas": ('        <Canvas\n          key={webglRecoveryEpoch}', 1),
    "scene controller": ('          <SceneModeAndCameraController sceneCalibration={sceneCalibration} />', 1),
    "lost listener": ("            canvas.addEventListener('webglcontextlost', (e) => {\n              e.preventDefault();\n              setWebglError(true);\n            });", 1),
    "restored listener": ("            canvas.addEventListener('webglcontextrestored', () => {\n              setWebglError(false);\n            });", 1),
    "main render": ("createRoot(document.getElementById('root')!).render(<App />);", 1),
    "main import": ("import App from './App.tsx';", 1),
}
for name, (a, count) in anchors.items():
    haystack = main if name.startswith('main') else scene
    if haystack.count(a) != count:
        sys.exit(f'❌ Mã không khớp ({name}), dừng và chưa sửa bất kỳ file nào. Hãy gửi ảnh Terminal.')
if DIAG.exists() or BOUNDARY.exists():
    sys.exit('❌ Đã có module cùng tên trong dự án; không ghi đè để bảo vệ dữ liệu.')

scene = scene.replace(
    "import { getTikTokDisplayName } from '../../utils/tiktokDisplayName';",
    "import { getTikTokDisplayName } from '../../utils/tiktokDisplayName';\nimport { recordRuntimeDiagnostic } from '../../systems/RuntimeDiagnostics';",
    1,
)
scene = scene.replace('const MAX_LABEL_SLOTS = 160;', '''// CHUA_STABLE3D_DIAGNOSTICS_V3: Render only participant labels that exist.
// OBS 30 FPS mode reduces GPU load without disabling any ceremony or overlay.
function StableFrameTicker({ enabled }: { enabled: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => invalidate(), 1000 / 30);
    invalidate();
    return () => window.clearInterval(timer);
  }, [enabled, invalidate]);
  return null;
}

function RuntimeHealthProbe() {
  const gl = useThree((state) => state.gl);
  const frameCounter = useRef(0);
  useFrame(() => { frameCounter.current += 1; });
  useEffect(() => {
    let lastFrames = frameCounter.current;
    const timer = window.setInterval(() => {
      const frames = frameCounter.current - lastFrames;
      lastFrames = frameCounter.current;
      const context = gl.getContext();
      const contextLost = typeof context.isContextLost === 'function' && context.isContextLost();
      recordRuntimeDiagnostic('gpu_sample', {
        fpsApprox: Math.round(frames / 30),
        gpuGeometries: gl.info.memory.geometries,
        gpuTextures: gl.info.memory.textures,
        drawCalls: gl.info.render.calls,
        contextLost,
        visibility: document.visibilityState,
      });
      if (contextLost || (frames === 0 && document.visibilityState === 'visible')) {
        recordRuntimeDiagnostic('render_stalled', { frames, contextLost });
      }
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [gl]);
  return null;
}''', 1)
scene = scene.replace('const labelSlotCount = Math.max(MAX_LABEL_SLOTS, participants.length);', 'const labelSlotCount = participants.length;', 1)
scene = scene.replace('const labelSlotCount = Math.max(MAX_LABEL_SLOTS, labelSlice.length);', 'const labelSlotCount = labelSlice.length;', 1)
# Effective dpr only for OBS safe3d; stable rendering 30fps optional but default untouched.
anchor = "  const dpr: [number, number] =\n"
if scene.count(anchor) != 1: sys.exit('❌ Không thấy vị trí cài chế độ 30 FPS; dừng.')
scene = scene.replace(anchor, '''  // Enable conservative 30 FPS only if ?safe3d=1 or ?stable3d=1 is present.
  const stable3dEnabled = typeof window !== 'undefined' && (() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('safe3d') === '1' || params.get('stable3d') === '1';
  })();

''' + anchor, 1)
scene = scene.replace('        <Canvas\n          key={webglRecoveryEpoch}', "        <Canvas\n          frameloop={stable3dEnabled ? 'demand' : 'always'}\n          key={webglRecoveryEpoch}", 1)
scene = scene.replace('          <SceneModeAndCameraController sceneCalibration={sceneCalibration} />', '''          <StableFrameTicker enabled={stable3dEnabled} />
          <RuntimeHealthProbe />
          <SceneModeAndCameraController sceneCalibration={sceneCalibration} />''', 1)
scene = scene.replace("            canvas.addEventListener('webglcontextlost', (e) => {\n              e.preventDefault();\n              setWebglError(true);\n            });", """            canvas.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              recordRuntimeDiagnostic('webglcontextlost', { statusMessage: (e as WebGLContextEvent).statusMessage || '' });
              setWebglError(true);
            });""", 1)
scene = scene.replace("            canvas.addEventListener('webglcontextrestored', () => {\n              setWebglError(false);\n            });", """            canvas.addEventListener('webglcontextrestored', () => {
              recordRuntimeDiagnostic('webglcontextrestored');
              webglRetryCount.current = 0;
              setWebglError(false);
            });""", 1)
scene = scene.replace('      webglRetryCount.current += 1;\n      setWebglRecoveryEpoch', "      webglRetryCount.current += 1;\n      recordRuntimeDiagnostic('webgl_retry', { attempt: webglRetryCount.current });\n      setWebglRecoveryEpoch", 1)

main = main.replace("import App from './App.tsx';", "import App from './App.tsx';\nimport { AppErrorBoundary } from './components/ui/AppErrorBoundary';\nimport './systems/RuntimeDiagnostics';", 1)
main = main.replace("createRoot(document.getElementById('root')!).render(<App />);", 'createRoot(document.getElementById(\'root\')!).render(<AppErrorBoundary><App /></AppErrorBoundary>);', 1)

diag_code = r'''// CHUA_STABLE3D_DIAGNOSTICS_V3: local-only bounded runtime diagnostics.
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
'''

boundary_code = r'''// CHUA_STABLE3D_DIAGNOSTICS_V3: Show a useful error instead of a blank React root.
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { recordRuntimeDiagnostic } from '../../systems/RuntimeDiagnostics';

interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; message: string; }

export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || 'Lỗi giao diện không xác định' };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    recordRuntimeDiagnostic('react_error', { message: error.message });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', background: '#170904', color: '#ffe9b0', padding: 24, fontFamily: 'sans-serif' }}>
        <h2>CHÙA ONLINE — Lỗi giao diện</h2>
        <p>Đã lưu nhật ký lỗi trên trình duyệt. Có thể tải lại trang để tiếp tục.</p>
        <p style={{ fontSize: 12, opacity: 0.8 }}>{this.state.message}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 16px', cursor: 'pointer' }}>
          Tải lại trang
        </button>
      </div>
    );
  }
}
'''

# All preflights are now satisfied. Back up then commit edits.
stamp = datetime.now().strftime('%Y%m%d_%H%M%S')
for target in (SCENE, MAIN):
    backup = target.with_name(target.name + '.before_stable3d_v3_' + stamp + '.bak')
    backup.write_text(target.read_text(encoding='utf-8'), encoding='utf-8')
    print('✅ Sao lưu:', backup)
SCENE.write_text(scene, encoding='utf-8')
MAIN.write_text(main, encoding='utf-8')
DIAG.write_text(diag_code, encoding='utf-8')
BOUNDARY.write_text(boundary_code, encoding='utf-8')
print('✅ Đã giảm tải GPU: ?safe3d=1 => DPR 1, 30FPS + chất lượng thấp.')
print('✅ Đã giảm nhãn DOM rỗng (trước đây luôn 160 nhãn tên + 160 bong bóng).')
print('✅ Đã thêm nhật ký GPU/React/WebGL cục bộ với tối đa 120 dòng.')
print('✅ Giữ nguyên dữ liệu, nghi lễ, Gift ID, bảng Xin Xăm, Cúng Dường, Công Đức.')
print('ℹ️  Hãy chạy npm run build / npm run dev và thêm ?safe3d=1 vào URL game.')
