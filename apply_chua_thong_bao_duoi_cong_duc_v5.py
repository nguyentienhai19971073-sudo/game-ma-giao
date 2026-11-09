#!/usr/bin/env python3
"""CHUA ONLINE - relocate notices under Merit Board without touching game logic.

Handles versions with different wrapper classes/paddings. Two-phase read/validate
before writing; saves dated backups; idempotent.
"""
from pathlib import Path
import datetime
import re
import shutil
import sys

root = Path.cwd()
ui = root / 'src/components/ui/StreamingOverlay.tsx'
fortune = root / 'src/components/ui/XinXamResultPanel.tsx'
cssfile = root / 'src/chua-notices-under-merit-v5.css'
MARK = 'CHUA_THONG_BAO_DUOI_CONG_DUC_V5'
if not ui.is_file() or not fortune.is_file():
    sys.exit('❌ Không tìm thấy file giao diện. Hãy cd vào thư mục Chua_Online_3D rồi chạy lại.')

s = ui.read_text(encoding='utf-8')
f = fortune.read_text(encoding='utf-8')
if MARK in s:
    print('✅ Bảng thông báo V5 đã được chuyển vị trí. Không cần chạy lại.')
    sys.exit(0)

# The older, partially applied dock is valid; don't remove/reinsert UI panels in that case.
old_dock = 'chua-ritual-notice-column' in s and s.find('chua-ritual-notice-column') > s.find('<Leaderboard')
if old_dock:
    print('ℹ️ Phát hiện cột thông báo phiên bản cũ; cập nhật CSS tương thích, không chèn bảng trùng.')

    # Reuse the old DOM class. Add a unique marker so repeating the script is safe.
    s = s.replace('className="chua-ritual-notice-column',
                  'className="chua-left-notice-v5 chua-ritual-notice-column', 1)
    # Old location already handled notification and fortune; only update styles.
    if s == ui.read_text(encoding='utf-8'):
        sys.exit('❌ Không tìm thấy lớp bọc cột thông báo để cập nhật.')
else:
    # JSX self closing nodes, independent of indentation and surrounding markup.
    pieces = []
    for name in ('CenterCeremonialPanel', 'XinXamResultPanel'):
        matches = list(re.finditer(r'<'+name+r'\b[\s\S]*?/>', s))
        if len(matches) != 1:
            sys.exit(f'❌ {name}: tìm thấy {len(matches)} vị trí, cần đúng 1; không ghi file.')
        pieces.append(matches[0].group())

    # Extract original event notification JSX, keeping original name and styling logic.
    toast_re = re.compile(
        r'\{overlaySettings\.showNotifications\s*&&\s*notifications\.length\s*>\s*0\s*&&\s*\('
        r'[\s\S]*?^[ \t]*\)\}', re.M)
    toasts = list(toast_re.finditer(s))
    if len(toasts) != 1:
        sys.exit(f'❌ Bảng thông báo sự kiện: tìm thấy {len(toasts)} vị trí, cần đúng 1; không ghi file.')
    toast = toasts[0].group()
    # Remove only the three original nodes after collecting all indices.
    matches = [re.search(re.escape(p), s) for p in pieces] + [toasts[0]]
    for m in sorted(matches, key=lambda x: x.start(), reverse=True):
        s = s[:m.start()] + s[m.end():]

    # Find Leaderboard JSX plus its existing conditional; do not depend on wrapper CSS.
    board_re = re.compile(
        r'\{\s*overlaySettings\.showLeaderboard\s*&&\s*\(\s*'
        r'<Leaderboard\b[\s\S]*?/>\s*\)\}', re.M)
    boards = list(board_re.finditer(s))
    if len(boards) != 1:
        sys.exit(f'❌ Bảng Công Đức: tìm thấy {len(boards)} vị trí, cần đúng 1; không ghi file.')

    # If both side panels are hidden, new notifications still need to be visible.
    side_condition = re.compile(
        r'\{\(\s*overlaySettings\.showLeaderboard\s*\|\|\s*overlaySettings\.showGiftPanel'
        r'(?P<rest>[^\n]*?)\)\s*&&\s*\(', re.M)
    conds = list(side_condition.finditer(s))
    if len(conds) != 1:
        sys.exit(f'❌ Không xác định được điều kiện mở khu vực bảng; tìm thấy {len(conds)}; không ghi file.')
    c = conds[0]
    old_cond = c.group(0)
    missing = []
    for check in ('Boolean(activeCenterAnnouncement)', 'Boolean(activeXinXamResult)',
                  '(overlaySettings.showNotifications && notifications.length > 0)'):
        if check not in old_cond:
            missing.append(check)
    if missing:
        # Safer insert before the closing ')' that precedes && (.replace via captured group)
        c = side_condition.search(s)
        prefix = c.group(0)
        ix = prefix.rfind(') && (')
        if ix < 0:
            # allow flexible whitespace around the delimiter
            mt = re.search(r'\)\s*&&\s*\($', prefix)
            if not mt:
                sys.exit('❌ Không thể mở rộng điều kiện hiển thị, không ghi file.')
            ix = mt.start()
        replacement = prefix[:ix] + ' || ' + ' || '.join(missing) + prefix[ix:]
        s = s[:c.start()] + replacement + s[c.end():]

    # Locate the board again after conditional edit; insert after its closing expression.
    b = board_re.search(s)
    if not b:
        sys.exit('❌ Không còn tìm thấy bảng Công Đức sau chỉnh điều kiện; không ghi file.')

    def indented(src: str, prefix: str) -> str:
        return '\n'.join(prefix + line.strip() if line.strip() else '' for line in src.splitlines())

    block = (
        '\n              {/* '+MARK+': Thông báo quà và Xin Xăm xếp dọc, ngay dưới Công Đức. */}\n'
        '              <div className="chua-left-notice-v5 pointer-events-none">\n'
        + indented(pieces[0], '                ') + '\n'
        + indented(pieces[1], '                ') + '\n'
        + indented(toast, '                ') + '\n'
        '              </div>'
    )
    s = s[:b.end()] + block + s[b.end():]

if MARK not in s:
    s = '/* ' + MARK + ': update notice positioning only */\n' + s

# The fortune popup normally measures its immediate parent as the full game frame.
# When nested under a narrow column that height shrinks with the popup, this can
# cause a ResizeObserver feedback loop; measure a fixed overlay ancestor instead.
anchor = 'const gameFrame = popupRootRef.current?.parentElement;'
if anchor in f:
    f = f.replace(anchor,
        "const gameFrame = popupRootRef.current?.closest('.chua-readability-v2') "
        "|| popupRootRef.current?.parentElement; // "+MARK, 1)
else:
    if MARK not in f:
        sys.exit('❌ Mã đo khung Xin Xăm khác phiên bản dự kiến. Không ghi file để tránh lỗi.')

# Import scoped stylesheet: its rules override large old readability CSS only in dock.
if "import '../../chua-notices-under-merit-v5.css';" not in s:
    anchor_import = "import { XinXamResultPanel } from './XinXamResultPanel';"
    if anchor_import in s:
        s = s.replace(anchor_import, anchor_import + "\nimport '../../chua-notices-under-merit-v5.css';", 1)
    else:
        # The import still stays before TypeScript interfaces in custom source versions.
        match = re.search(r'(?m)^interface StreamingOverlayProps\b', s)
        if not match:
            sys.exit('❌ Không tìm thấy vị trí import CSS, không ghi file.')
        s = s[:match.start()] + "import '../../chua-notices-under-merit-v5.css';\n\n" + s[match.start():]

css = r'''/* CHUA_THONG_BAO_DUOI_CONG_DUC_V5
   Just ceremony / fortune / event notices. Do not resize Leaderboard or offerings.
   Keeps central carpet clear for actual avatar's ritual animation. */
.chua-left-notice-v5 {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  gap: 6px !important;
  width: min(190px, 38vw) !important;
  min-width: 0 !important;
  max-width: 100% !important;
  margin-top: 5px !important;
  z-index: 40;
  pointer-events: none;
}
/* Override legacy absolute/fixed CENTER presentation, but only inside the dock. */
.chua-left-notice-v5 > [role="status"],
.chua-readability-v2 .chua-left-notice-v5 > [role="status"] {
  position: relative !important;
  inset: auto !important;
  left: auto !important;
  top: auto !important;
  right: auto !important;
  bottom: auto !important;
  transform: none !important;
  translate: none !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: stretch !important;
  z-index: auto !important;
}
.chua-left-notice-v5 > [role="status"] > div,
.chua-readability-v2 .chua-left-notice-v5 > .chua-center-ceremony-readable,
.chua-readability-v2 .chua-left-notice-v5 > [role="status"] > div {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  height: auto !important;
  transform: none !important;
  transform-origin: top left !important;
  box-sizing: border-box !important;
}
.chua-readability-v2 .chua-left-notice-v5 .chua-center-ceremony-readable > div {
  padding: 6px !important;
}
.chua-left-notice-v5 .chua-center-ceremony-readable .flex.items-center {
  flex-direction: column !important;
  align-items: center !important;
  gap: 3px !important;
}
.chua-left-notice-v5 .chua-center-ceremony-readable .flex.items-center > div:last-child {
  width: 100% !important;
  text-align: center !important;
}
.chua-readability-v2 .chua-left-notice-v5 .chua-center-ceremony-readable p,
.chua-readability-v2 .chua-left-notice-v5 .chua-center-ceremony-readable p.font-display {
  font-size: clamp(11px, 1.4vw, 15px) !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  text-overflow: clip !important;
  line-height: 1.22 !important;
  text-align: center !important;
}
.chua-readability-v2 .chua-left-notice-v5 .chua-avatar-readable {
  width: 30px !important;
  height: 30px !important;
}
.chua-left-notice-v5 .fortune-result-card {
  max-height: min(43vh, 520px) !important;
  overflow-y: auto !important;
  padding: 5px 6px !important;
  box-sizing: border-box !important;
}
.chua-left-notice-v5 .fortune-result-card .whitespace-nowrap {
  white-space: normal !important;
}
.chua-left-notice-v5 .fortune-result-card p,
.chua-left-notice-v5 .fortune-result-card h3 {
  overflow-wrap: anywhere !important;
}
.chua-left-notice-v5 .chua-event-toast-readable,
.chua-readability-v2 .chua-left-notice-v5 .chua-event-toast-readable,
.chua-left-notice-v5 > div:not([role="status"]) {
  width: 100% !important;
  max-width: 100% !important;
  transform: none !important;
  padding: 5px 6px !important;
  box-sizing: border-box !important;
  text-align: center !important;
}
.chua-left-notice-v5 .chua-event-toast-readable p,
.chua-readability-v2 .chua-left-notice-v5 .chua-event-toast-readable p,
.chua-readability-v2 .chua-left-notice-v5 .chua-event-toast-readable strong {
  font-size: clamp(11px, 1.35vw, 14px) !important;
  line-height: 1.22 !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  text-align: center !important;
}
'''

# Verify the result before modifying any project file.
if s.count('<CenterCeremonialPanel') != 1 or s.count('<XinXamResultPanel') != 1:
    sys.exit('❌ Phát hiện bảng thông báo trùng, không ghi file.')
if MARK not in s and not old_dock:
    sys.exit('❌ Dấu hiệu vá không xuất hiện, không ghi file.')

stamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
backup_dir = root / ('.chua_notice_v5_backup_' + stamp)
backup_dir.mkdir(exist_ok=False)
for name, path, content in [
    ('StreamingOverlay.tsx', ui, s),
    ('XinXamResultPanel.tsx', fortune, f),
]:
    shutil.copy2(path, backup_dir / name)
    if path.read_text(encoding='utf-8') != content:
        path.write_text(content, encoding='utf-8')
if cssfile.exists():
    shutil.copy2(cssfile, backup_dir / cssfile.name)
cssfile.write_text(css, encoding='utf-8')
print('✅ Đã chuyển thông báo nghi lễ, Xin Xăm và sự kiện thành cột dọc dưới Bảng Công Đức.')
print('✅ Thu nhỏ bảng, căn giữa thông báo quà; không che vị trí hành lễ trung tâm.')
print('✅ Không sửa Gift ID, hệ thống hành lễ V4, thời gian 5 phút, TTS hoặc Cúng Dường.')
print('✅ Sao lưu:', backup_dir)
print('➡️ Tiếp theo: npm run build && npm run dev')
