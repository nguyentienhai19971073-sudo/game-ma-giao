#!/usr/bin/env python3
"""CHUA ONLINE: prevent invalid Unicode TikTok nicknames from crashing SVG avatar rendering.

Applies a focused, repeat-safe change to src/systems/DemoEventManager.ts only.
Original is backed up in .chua_uri_malformed_backup/ before being changed.
"""
from pathlib import Path
import sys

root = Path.cwd()
file = root / 'src/systems/DemoEventManager.ts'
marker = 'CHUA_FIX_URI_MALFORMED_EMOJI_V1'
if not file.is_file():
    sys.exit('❌ Không tìm thấy src/systems/DemoEventManager.ts. Hãy cd vào thư mục Chua_Online_3D.')

source = file.read_text(encoding='utf-8')
if marker in source:
    print('✅ Bản vá sửa URI malformed đã có. Không cần áp dụng lại.')
    sys.exit(0)
old = '''  const clean = displayName.trim().replace(/^@+/, '');
  const parts = clean.split(/[\\s._-]+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase()
      : clean.slice(0, 2).toUpperCase() || 'PT';'''
new = '''  // CHUA_FIX_URI_MALFORMED_EMOJI_V1: Keep Unicode code points intact.
  // TikTok names may begin with emoji (surrogate pairs) or include malformed UTF-16.
  // String indexing/slice(0, 2) can split emojis and make encodeURIComponent(svg) throw.
  const rawName = String(displayName ?? '').trim().replace(/^@+/, '');
  const clean = Array.from(rawName, (char) => {
    const point = char.codePointAt(0) ?? 0;
    return point >= 0xD800 && point <= 0xDFFF ? '\\uFFFD' : char;
  }).join('');
  const parts = clean.split(/[\\s._-]+/).filter(Boolean);
  const firstCodePoint = (part: string) => Array.from(part)[0] || '';
  const rawInitials = parts.length >= 2
    ? `${firstCodePoint(parts[0])}${firstCodePoint(parts[parts.length - 1])}`
    : Array.from(clean).slice(0, 2).join('');
  // Safe as SVG text even when the nickname contains &, < or >.
  const initials = (rawInitials.toUpperCase() || 'PT')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');'''
count = source.count(old)
if count != 1:
    sys.exit(f'❌ Mã nguồn không khớp mẫu dự kiến ({count} vị trí). Chưa sửa gì. Hãy gửi nội dung file để đối chiếu.')
backup = root / '.chua_uri_malformed_backup' / 'DemoEventManager.ts'
backup.parent.mkdir(parents=True, exist_ok=True)
if not backup.exists():
    backup.write_text(source, encoding='utf-8')
file.write_text(source.replace(old, new, 1), encoding='utf-8')
print('✅ Đã sửa lỗi URI malformed khi tên TikTok có emoji hoặc Unicode không hợp lệ.')
print('✅ Chỉ cập nhật src/systems/DemoEventManager.ts, không thay đổi nickname hiển thị hoặc bất kỳ bảng nào.')
print('✅ File gốc đã sao lưu tại .chua_uri_malformed_backup/DemoEventManager.ts')
print('ℹ️ Chạy npm run build để kiểm tra, rồi npm run dev để khởi động lại.')
