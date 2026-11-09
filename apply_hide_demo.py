#!/usr/bin/env python3
"""Hide only the visual Demo status at top right; keep demo engine unchanged."""
from pathlib import Path

path = Path(__file__).resolve().parent / 'src/components/ui/StreamingOverlay.tsx'
if not path.exists():
    raise SystemExit(f'❌ Không tìm thấy file giao diện: {path}\nHãy giải nén bản vá ngay trong thư mục Chua_Online_3D.')

text = path.read_text(encoding='utf-8')
old = '''              <span aria-hidden="true">·</span>
              {isLive ? (
                <span className="text-[#9ef0b4] font-semibold">
                  LIVE @{connectionSnapshot.tiktokUsername}
                </span>
              ) : connectionSnapshot.status === ConnectionStatus.CONNECTING ? (
                <span className="text-[#f7d87c]">Kết nối...</span>
              ) : (
                <span className="text-[#e3d2b8]">Demo</span>
              )}'''
new = '''              {(isLive || connectionSnapshot.status === ConnectionStatus.CONNECTING) && (
                <span aria-hidden="true">·</span>
              )}
              {isLive ? (
                <span className="text-[#9ef0b4] font-semibold">
                  LIVE @{connectionSnapshot.tiktokUsername}
                </span>
              ) : connectionSnapshot.status === ConnectionStatus.CONNECTING ? (
                <span className="text-[#f7d87c]">Kết nối...</span>
              ) : null}'''
if old not in text:
    if new in text:
        print('✅ Chữ Demo đã được ẩn từ trước; không cần sửa thêm.')
        raise SystemExit(0)
    raise SystemExit('❌ Không thấy đoạn giao diện Demo tương ứng. Chưa thay đổi file nào.')
if text.count(old) != 1:
    raise SystemExit('❌ Có nhiều hơn một vị trí phù hợp; chưa thay đổi file.')
backup = path.with_suffix('.tsx.bak_hide_demo')
if not backup.exists():
    backup.write_text(text, encoding='utf-8')
path.write_text(text.replace(old, new, 1), encoding='utf-8')
print('✅ Đã ẩn chữ Demo ở góc trên bên phải, không thay đổi tính năng Demo.')
print('✅ Trạng thái LIVE và Kết nối... vẫn hiện khi tương ứng.')
print('File gốc dự phòng:', backup)
