#!/usr/bin/env python3
"""CHUA ONLINE 3D: skip extended TikTok gift metadata prefetch.

The EulerStream URL-signing endpoint for room gift-list enrichment requires
Business tier. TikTok gift events themselves don't require this enrichment.
"""
from pathlib import Path
from datetime import datetime
import sys

ROOT = Path.cwd()
p = ROOT / 'server' / 'tiktokAdapter.ts'
if not p.is_file():
    sys.exit('❌ Không tìm thấy server/tiktokAdapter.ts. Hãy cd vào thư mục Chua_Online_3D trước khi chạy.')
s = p.read_text(encoding='utf-8')
old = 'enableExtendedGiftInfo: true,'
new = 'enableExtendedGiftInfo: false,'
if old in s:
    assert s.count(old) == 1, f'Có {s.count(old)} mục giống nhau; dừng để tránh sửa nhầm.'
    backup = p.with_name(f'tiktokAdapter.ts.before_euler_fix_{datetime.now():%Y%m%d_%H%M%S}.bak')
    backup.write_text(s, encoding='utf-8')
    p.write_text(s.replace(old, new, 1), encoding='utf-8')
    print('✅ Đã tắt yêu cầu danh sách quà mở rộng cần chữ ký URL Business của Euler Stream.')
    print('✅ Không thay đổi sự kiện TikTok CHAT/GIFT/LIKE, Gift ID, nghi lễ hoặc giao diện.')
    print(f'✅ Đã sao lưu: {backup.name}')
elif new in s:
    print('✅ Game đã dùng enableExtendedGiftInfo: false. Không cần sửa thêm.')
else:
    sys.exit('⚠️ Không tìm thấy đúng cấu hình enableExtendedGiftInfo. Dừng, chưa sửa file.')
print('➡️ Khởi động lại game bằng: npm run dev; sau đó nhấn KẾT NỐI LIVE lại.')
