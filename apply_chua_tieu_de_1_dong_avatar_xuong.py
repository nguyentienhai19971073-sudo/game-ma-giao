#!/usr/bin/env python3
"""Patch CHUA ONLINE ritual notice title safely without touching ritual logic.
Works on base, OBS-readable and V5 docked notice versions.
"""
from pathlib import Path
from datetime import datetime
import re
import shutil
import sys

MARK = 'CHUA_TITLE_SINGLE_LINE_AVATAR_BELOW_V6'
ROOT = Path.cwd()
P = ROOT / 'src/components/ui/CenterCeremonialPanel.tsx'
if not P.is_file():
    sys.exit('❌ Không tìm thấy src/components/ui/CenterCeremonialPanel.tsx. Hãy cd vào thư mục Chua_Online_3D trước.')
s = P.read_text(encoding='utf-8')
if MARK in s:
    print('✅ Bản vá V6 đã cài từ trước; không sửa lần nữa.')
    sys.exit(0)

# Match the block by its actual semantic header and the following avatar row,
# not by a CSS prefix which may be changed by earlier patches.
pat = re.compile(
    r'(?P<header>\s*\{/\* Top Sacred Lotus Gold Filigree Accent \*/\}\s*'
    r'<div\b[\s\S]*?\{announcement\.isMajor\s*\?\s*'
    r"'Đại Lễ Cầu Nguyện'\s*:\s*'Tâm Thành Lễ Phật'\}"
    r'[\s\S]*?</span>\s*</div>)'
    r'(?P<gap>\s*)'
    r'(?P<row><div\s+className="flex items-center gap-2 pt-0\.5">)',
)
found = list(pat.finditer(s))
if len(found) != 1:
    sys.exit(f'❌ Cấu trúc bảng nghi lễ khác dự kiến (tìm thấy {len(found)} đoạn). Chưa sửa file. Gửi mình đoạn mã hoặc log này.')
old_head = found[0].group('header')
# Preserve exact lotus icon markup from current user's source.
svg = re.search(r'<svg\b[\s\S]*?</svg>', old_head)
if not svg:
    sys.exit('❌ Không tìm thấy biểu tượng hoa sen trong tiêu đề. Chưa sửa file.')
lotus = svg.group(0).replace('className="w-2.5 h-2.5', 'className="shrink-0 w-2 h-2', 1)

new_head = f'''
        {{/* {MARK}: tiêu đề là một hàng trong bảng, không đè lên avatar. */}}
        <div
          aria-hidden="true"
          className="pointer-events-none relative box-border w-full min-w-0 rounded border border-[#e5bd5a]/65 px-1 py-[3px] text-center shadow-sm"
          style={{{{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            backgroundColor: 'rgba(38, 7, 13, 0.72)',
          }}}}
        >
          {lotus}
          <span
            className="font-display uppercase text-[#ffe494] font-semibold leading-none"
            style={{{{
              display: 'block',
              fontSize: 'clamp(6px, 0.9vw, 8px)',
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              flexShrink: 0,
            }}}}
          >
            {{announcement.isMajor ? 'Đại Lễ Cầu Nguyện' : 'Tâm Thành Lễ Phật'}}
          </span>
        </div>'''
new_row = '<div className="flex items-center gap-2 pt-1.5">'
out = s[:found[0].start()] + new_head + '\n\n        ' + new_row + s[found[0].end():]
if out.count(MARK) != 1 or 'pt-1.5' not in out:
    sys.exit('❌ Kiểm tra nội dung không đạt. Chưa sửa file.')
# Protect against unrelated collateral edits.
if out.count("'Tâm Thành Lễ Phật'") != s.count("'Tâm Thành Lễ Phật'"):
    sys.exit('❌ Kiểm tra nội dung tiêu đề không đạt. Chưa sửa file.')
backup = P.with_name(P.name + '.bak_before_v6_' + datetime.now().strftime('%Y%m%d_%H%M%S'))
shutil.copy2(P, backup)
P.write_text(out, encoding='utf-8')
print('✅ Đã sửa bảng TÂM THÀNH LỄ PHẬT: không xuống dòng, tiêu đề không nổi đè avatar.')
print('✅ Avatar và nội dung Phật tử nằm dưới hàng tiêu đề; khoảng cách tăng nhẹ.')
print('✅ Giữ nguyên vị trí bảng, nickname, nghi lễ, điểm công đức, Gift ID, Xin Xăm.')
print('✅ Đã sao lưu:', backup.name)
print('➡️ Kiểm tra: npm run build')
