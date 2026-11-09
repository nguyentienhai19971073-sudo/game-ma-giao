#!/usr/bin/env python3
"""CHUA ONLINE: increase readability of all livestream overlay panels EXCEPT fortune result.

Safe in-place patch: do not replace source files or user settings. Supports the prior
compact right-aligned price panel and optional Noto Serif bold patch. Original files
are backed up once with .before_ui_enlarge.bak suffix.
"""
from __future__ import annotations
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent
UI = ROOT / 'src/components/ui'
THREE = ROOT / 'src/components/three'
SYSTEMS = ROOT / 'src/systems'
MARK = '// CHUA_ONLINE_READABLE_PANELS_V1'
updates = {}

def require_replace(text: str, old: str, new: str, what: str):
    if old not in text:
        raise RuntimeError('Không tìm thấy cấu trúc: ' + what)
    return text.replace(old, new, 1)

def require_regex(text: str, pattern: str, replacement, what: str, count=1):
    text, n = re.subn(pattern, replacement, text, count=count, flags=re.M)
    if n < 1:
        raise RuntimeError('Không tìm thấy cấu trúc: ' + what)
    return text

def change(relative: str, edit):
    path = ROOT / relative
    if not path.is_file():
        raise RuntimeError('Thiếu file: ' + relative)
    old = path.read_text(encoding='utf-8')
    if MARK in old:
        print('Đã áp dụng trước đó, bỏ qua:', relative)
        return
    new = edit(old)
    if new == old:
        raise RuntimeError('Không có thay đổi trong ' + relative)
    updates[path] = (old, MARK + '\n' + new)


def streaming(s: str):
    # Expand right-side panel according to the EXISTING compact version, without
    # changing its two-column layout or right-aligned prices.
    def offer_width(m):
        pct, px = int(m.group(1)), int(m.group(2))
        return f'w-[{min(48, pct+4)}%] max-w-[{min(196, max(166, px+12))}px] min-w-0 shrink-0'
    s = require_regex(s,
        r'w-\[(\d+)%\] max-w-\[(\d+)px\] min-w-0 shrink-0', offer_width,
        'chiều rộng panel Cúng Dường')
    s = require_replace(s, 'className="w-full rounded px-1.5 py-[3px]"',
                        'className="w-full rounded px-2 py-[4px]"', 'thanh trên')
    s = require_replace(s, 'text-xs sm:text-[13px] font-bold',
                        'text-[13.5px] sm:text-[15px] font-bold', 'logo CHÙA ONLINE')
    s = require_replace(s, 'font-display text-[9px] italic',
                        'font-display text-[10px] italic', 'slogan')
    s = require_replace(s, 'gap-1 text-[8px] sm:text-[8.5px]',
                        'gap-1 text-[9.5px] sm:text-[10px]', 'số Phật tử')
    s = require_replace(s, 'gap-y-0.5 text-[7.8px] sm:text-[8px] leading-tight',
                        'gap-y-0.5 text-[9px] sm:text-[9.5px] leading-tight', 'thanh like/share')
    s = require_replace(s, 'gap-1 text-[7.8px] text-[#fff2dc]',
                        'gap-1 text-[9px] text-[#fff2dc]', 'đếm lượt thích')
    s = require_replace(s, 'self-start max-w-[185px] rounded px-2 py-0.5',
                        'self-start max-w-[225px] rounded px-2.5 py-1', 'thông báo sự kiện')
    s = require_replace(s, 'className="text-[8px] text-[#fff5e2] truncate leading-tight"',
                        'className="text-[9.5px] text-[#fff5e2] break-words leading-snug"', 'chữ thông báo sự kiện')
    s = require_replace(s, 'max-w-[92%] rounded px-2 py-[3px] text-center',
                        'max-w-[96%] rounded px-2.5 py-[4px] text-center', 'phụ đề giọng đọc')
    s = require_replace(s, 'text-[9.5px] sm:text-[10.5px] italic',
                        'text-[11px] sm:text-[12px] italic', 'chữ phụ đề')
    s = require_replace(s, 'text-[9.5px] font-semibold shadow',
                        'text-[10.5px] font-semibold shadow', 'nút âm thanh')
    s = s.replace('rounded text-[9px] text-[#ffe494]', 'rounded text-[10px] text-[#ffe494]', 1)
    return s


def leaderboard(s: str):
    s = require_replace(s, 'w-[90px] sm:w-[98px]',
                        'w-[104px] sm:w-[114px]', 'độ rộng bảng công đức')
    s = require_replace(s, 'gap-1 text-[8px] py-[1px]',
                        'gap-1 text-[9.4px] py-[2px]', 'hàng xếp hạng')
    s = require_replace(s, 'font-display text-[8.5px] font-bold',
                        'font-display text-[10px] font-bold', 'tiêu đề bảng công đức')
    s = require_replace(s, 'text-[7.5px] text-[#dfd0b8]',
                        'text-[9px] text-[#dfd0b8]', 'bảng công đức trống')
    s = require_replace(s, 'max-h-[34px]', 'max-h-[55px]', 'cuộn hạng 5+')
    return s


def offerings(s: str):
    # Keep the existing price column at the RIGHT, retain font-offering-title if
    # previously installed, and NEVER modify panel right padding from prior patches.
    s = require_replace(s, 'text-[clamp(8px,1vw,9.5px)]',
                        'text-[clamp(9.7px,1.35vw,11px)]', 'tiêu đề bảng cúng dường')
    s = require_replace(s, 'max-h-[186px]', 'max-h-[235px]', 'chiều cao cuộn nghi lễ')
    s = require_replace(s, 'sizeClass="w-[11px] h-[11px]"',
                        'sizeClass="w-[13px] h-[13px]"', 'biểu tượng quà')
    s = require_regex(s, r'text-\[8\.5px\] font-(?:bold|extrabold)',
                      lambda m: m.group(0).replace('text-[8.5px]', 'text-[9.8px]'),
                      'tên nghi lễ')
    s = require_replace(s, 'text-[8px] font-semibold text-[#ffd978]',
                        'text-[9.2px] font-semibold text-[#ffd978]', 'giá xu')
    s = require_replace(s, 'text-[8.3px] text-[#fff3e0]',
                        'text-[9.5px] text-[#fff3e0]', 'tên quà')
    s = require_replace(s, 'text-[clamp(7px,0.95vw,8px)]',
                        'text-[clamp(8px,1.1vw,9px)]', 'số quà')
    # Larger fonts need slightly more row height, not more right padding.
    s = require_regex(s, r'(h-auto flex items-start gap-\[[23]px\] )py-\[2px\]',
                      r'\1py-[3px]', 'độ cao hàng nghi lễ')
    return s


def center_panel(s: str):
    s = require_replace(s, 'w-[82%] max-w-[252px]',
                        'w-[85%] max-w-[290px]', 'chiều rộng bảng nghi lễ')
    s = require_replace(s, 'border px-2.5 py-1.5 transition-all',
                        'border px-3 py-2 transition-all', 'padding bảng nghi lễ')
    s = require_replace(s, 'text-[7px] tracking-[0.14em]',
                        'text-[8.4px] tracking-[0.11em]', 'nhãn đại lễ')
    s = require_replace(s, 'w-8 h-8 rounded-full',
                        'w-9 h-9 rounded-full', 'ảnh đại diện')
    s = require_replace(s, 'text-[9px] font-semibold text-[#f8e6c4]',
                        'text-[10.5px] font-semibold text-[#f8e6c4]', 'tên người lễ')
    s = require_replace(s, 'text-[13px] sm:text-[14px]',
                        'text-[15px] sm:text-[16px]', 'tên đại lễ')
    s = require_replace(s, 'text-[12px] sm:text-[13px]',
                        'text-[14px] sm:text-[15px]', 'tên lễ thường')
    s = require_replace(s, 'text-[9px] text-[#fff6e5]',
                        'text-[10.5px] text-[#fff6e5]', 'diễn giải nghi lễ')
    return s


def lotus_badges(s: str):
    s = require_replace(s, 'w-[60px] sm:w-[66px]',
                        'w-[71px] sm:w-[76px]', 'huy hiệu nghi lễ')
    s = require_replace(s, 'w-6 h-6 sm:w-7 sm:h-7',
                        'w-7 h-7 sm:w-8 sm:h-8', 'biểu tượng huy hiệu')
    s = require_replace(s, 'text-[7.5px] font-semibold text-[#fff6e3]',
                        'text-[8.8px] font-semibold text-[#fff6e3]', 'tên trên huy hiệu')
    s = require_replace(s, 'font-display text-[7px] font-bold',
                        'font-display text-[8.2px] font-bold', 'nghi lễ trên huy hiệu')
    return s


def scene_labels(s: str):
    s = require_replace(s, 'Math.max(6.2, Math.round(7.4 * labelScale * 10) / 10)',
                        'Math.max(7.1, Math.round(8.4 * labelScale * 10) / 10)', 'font bảng tên Phật tử')
    s = require_replace(s, 'max-w-[68px] truncate align-bottom',
                        'max-w-[78px] truncate align-bottom', 'chiều rộng bảng tên')
    s = require_replace(s, 'Math.max(7.2, Math.round(8.2 * labelScale * 10) / 10)',
                        'Math.max(8.1, Math.round(9.4 * labelScale * 10) / 10)', 'font bình luận')
    s = require_replace(s, 'relative max-w-[108px] px-1.5 py-[2.5px]',
                        'relative max-w-[122px] px-1.5 py-[3px]', 'bong bóng bình luận')
    return s


def collision(s: str):
    s = require_replace(s, 'Math.min(76, Math.max(30, Math.min(charCount, 17) * 4.55 + 12))',
                        'Math.min(86, Math.max(34, Math.min(charCount, 17) * 5.15 + 13))', 'kích thước dự toán tên')
    s = require_replace(s, 'Math.min(108, Math.max(44, Math.min(charCount, 26) * 4.5 + 16))',
                        'Math.min(122, Math.max(50, Math.min(charCount, 26) * 5.05 + 18))', 'kích thước dự toán bình luận')
    s = require_replace(s, 'const height = (lines === 2 ? 34 : 22) * scale;',
                        'const height = (lines === 2 ? 38 : 25) * scale;', 'chiều cao dự toán bình luận')
    s = require_replace(s, 'const nameHeight = 14 * scale;',
                        'const nameHeight = 16 * scale;', 'chiều cao dự toán tên')
    return s

jobs = {
    'src/components/ui/StreamingOverlay.tsx': streaming,
    'src/components/ui/Leaderboard.tsx': leaderboard,
    'src/components/ui/BuddhistGiftPanel.tsx': offerings,
    'src/components/ui/CenterCeremonialPanel.tsx': center_panel,
    'src/components/ui/FloatingLotusAvatars.tsx': lotus_badges,
    'src/components/three/TempleScene.tsx': scene_labels,
    'src/systems/LabelCollisionManager.ts': collision,
}
try:
    for rel, fn in jobs.items():
        change(rel, fn)
except RuntimeError as exc:
    sys.exit('❌ DỪNG - chưa ghi file nào. ' + str(exc))

if not updates:
    print('✅ Bản vá đã áp dụng từ trước, không cần chạy lại.')
    sys.exit(0)

# Safeguard: Xin Xam result panel must NOT be touched at all.
assert all(p.name != 'XinXamResultPanel.tsx' for p in updates)

for path, (old, new) in updates.items():
    backup = path.with_name(path.name + '.before_ui_enlarge.bak')
    if not backup.exists():
        backup.write_text(old, encoding='utf-8')
    path.write_text(new, encoding='utf-8')
    print('✅', path.relative_to(ROOT))
print('✅ Bảng KẾT QUẢ XIN XĂM giữ nguyên 100% (không sửa component hoặc cấu hình).')
print('✅ Không sửa các thời lượng, TikTok LIVE, TTS, tọa độ nhân vật hay danh sách quà.')
print('✅ Có các file *.before_ui_enlarge.bak để khôi phục nếu cần.')
