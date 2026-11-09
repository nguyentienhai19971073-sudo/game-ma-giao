#!/usr/bin/env python3
"""Fix unintended R3F unmount on WebGL context loss + optional OBS low-GPU mode.

Run inside the CHUA ONLINE 3D root directory. Safe to rerun.
"""
from pathlib import Path
from datetime import datetime
import sys

p = Path('src/components/three/TempleScene.tsx')
if not p.is_file():
    sys.exit('❌ Không tìm thấy src/components/three/TempleScene.tsx. Hãy cd vào thư mục Chua_Online_3D trước.')
s = p.read_text(encoding='utf-8')
marker = 'CHUA_ONLINE_WEBGL_RECOVERY_V1'
if marker in s:
    print('✅ Bản vá khôi phục WebGL đã có. Không sửa thêm.')
    sys.exit(0)

# Guard all anchors before modifying any file.
state_anchor = '  const [webglError, setWebglError] = useState(false);'
quality_anchor = "    if (typeof window !== 'undefined' && window.isSoftwareGl) {"
fallback_start = '  if (webglError) {\n    return (\n'
scene_start = '  return (\n    <div className="relative w-full h-full overflow-hidden select-none bg-[#170904]">'
canvas_start = '        <Canvas\n          shadows={effectiveQuality !== \'low\'}'
canvas_end = '        </Canvas>\n      </div>'
for needle in [state_anchor, quality_anchor, fallback_start, scene_start, canvas_start, canvas_end]:
    if s.count(needle) != 1:
        sys.exit(f'❌ Không sửa file vì mã khác phiên bản ở đoạn: {needle[:80]!r}. Không có gì bị ghi đè.')
if s.index(fallback_start) > s.index(scene_start):
    sys.exit('❌ Phần thay thế fallback không đúng vị trí; bản vá dừng để bảo vệ mã.')

state_new = '''  // CHUA_ONLINE_WEBGL_RECOVERY_V1: Keep R3F canvas mounted during context loss.
  const [webglError, setWebglError] = useState(false);
  const [webglRecoveryEpoch, setWebglRecoveryEpoch] = useState(0);
  const webglRetryCount = useRef(0);

  // Three.js can restore a lost context when the ORIGINAL canvas remains mounted.
  // If no restore arrives, rebuild the renderer at most twice during this page session.
  useEffect(() => {
    if (!webglError) return;
    const recoveryTimer = window.setTimeout(() => {
      if (webglRetryCount.current >= 2) return;
      webglRetryCount.current += 1;
      setWebglRecoveryEpoch((epoch) => epoch + 1);
      setWebglError(false);
    }, 7000);
    return () => window.clearTimeout(recoveryTimer);
  }, [webglError]);'''
s = s.replace(state_anchor, state_new, 1)

# safe3d=1 lets OBS render 1080x1920 at DPR1 with no shadows / MSAA. No effect unless explicitly opted into.
s = s.replace(
    quality_anchor,
    "    if (typeof window !== 'undefined' && (window.isSoftwareGl || new URLSearchParams(window.location.search).get('safe3d') === '1')) {",
    1,
)

# Replace fatal fallback return with an overlay; keep Canvas alive for context restoration.
pos1 = s.index(fallback_start)
pos2 = s.index(scene_start, pos1)
s = s[:pos1] + '''  // Do not return a different tree on webglcontextlost: that would unmount the
  // very canvas which is supposed to receive webglcontextrestored.
''' + s[pos2:]

s = s.replace(canvas_start, "        <Canvas\n          key={webglRecoveryEpoch}\n          shadows={effectiveQuality !== 'low'}", 1)
s = s.replace(canvas_end, '''        </Canvas>
        {webglError && (
          <div role="status" aria-live="polite" className="absolute inset-0 z-20 flex items-end justify-center pb-5 pointer-events-none">
            <div className="rounded-lg border border-[#d4af37]/40 bg-black/80 px-3 py-2 text-center text-sm text-[#ffe9b0] shadow-lg">
              Đang khôi phục hình ảnh 3D…
            </div>
          </div>
        )}
      </div>''', 1)

# Stale React state in old mounts could happen if the old GL context is lost during teardown;
# the max 2 forced remounts and onCreated event listeners prevent unbounded restart.
backup = p.with_suffix(p.suffix + '.before_webgl_recovery_' + datetime.now().strftime('%Y%m%d_%H%M%S') + '.bak')
backup.write_text(p.read_text(encoding='utf-8'), encoding='utf-8')
p.write_text(s, encoding='utf-8')
print('✅ Đã sửa lỗi gỡ Canvas khiến WebGL không tự khôi phục.')
print('✅ Tự khởi tạo lại renderer tối đa 2 lần nếu WebGL không tự phục hồi.')
print('✅ Có chế độ giảm tải 3D khi thêm ?safe3d=1 vào URL OBS.')
print(f'✅ Đã sao lưu mã gốc: {backup.name}')
print('ℹ️  Các bảng, nickname, bình luận, Gift ID, TTS, TikTok LIVE không thay đổi.')
