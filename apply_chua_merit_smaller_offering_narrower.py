#!/usr/bin/env python3
"""Small, repeatable patch: shrink merit panel; narrow offerings ONLY."""
from pathlib import Path
import sys

root = Path(__file__).resolve().parent
main = root / 'src/main.tsx'
overlay = root / 'src/components/ui/StreamingOverlay.tsx'
css_source = root / 'chua-merit-smaller-offering-narrower.css'
css_target = root / 'src/chua-merit-smaller-offering-narrower.css'

if not main.is_file() or not overlay.is_file() or not css_source.is_file():
    sys.exit('❌ Chưa tìm thấy mã nguồn. Hãy giải nén ZIP vào thư mục game CHÙA ONLINE rồi chạy lại.')

source = overlay.read_text(encoding='utf-8')
if 'chua-compact-merit-holder' not in source or 'chua-readability-offerings' not in source:
    sys.exit('❌ Phiên bản game này chưa có cấu trúc bảng tương thích. Chưa chỉnh sửa file nào.')

text = main.read_text(encoding='utf-8')
statement = "import './chua-merit-smaller-offering-narrower.css';"
if statement not in text:
    anchors = [
        "import './chua-small-panels-gift-centered.css';",
        "import './chua-readable-obs.css';",
        "import './index.css';",
    ]
    anchor = next((x for x in anchors if x in text), None)
    if anchor is None:
        sys.exit('❌ Không tìm thấy chỗ nhập CSS, chưa chỉnh sửa file nào.')
    # Import after the most recent overlay stylesheet, before mounting React.
    updated = text.replace(anchor, anchor + '\n' + statement, 1)
    backup = main.with_name('main.tsx.before_merit_smaller_offering_narrower.bak')
    if not backup.exists():
        backup.write_text(text, encoding='utf-8')
    main.write_text(updated, encoding='utf-8')

content = css_source.read_text(encoding='utf-8')
if not css_target.is_file() or css_target.read_text(encoding='utf-8') != content:
    css_target.write_text(content, encoding='utf-8')

print('✅ Bảng Công Đức đã nhỏ hơn: chiều rộng, chữ và chiều cao hàng.')
print('✅ Bảng Cúng Dường chỉ hẹp ngang; không đổi chữ, chiều cao hàng và giá xu căn phải.')
print('✅ Giữ nguyên Thông Báo Quà, Xin Xăm, TikTok, Gift ID, âm thanh.')
