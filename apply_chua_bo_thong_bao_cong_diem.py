#!/usr/bin/env python3
"""Ẩn chỉ thông báo điểm nghi lễ dư thừa, không thay dữ liệu công đức."""
from pathlib import Path
from datetime import datetime
import re
import shutil
import sys

path = Path('src/components/ui/StreamingOverlay.tsx')
marker = 'CHUA_HIDE_DUPLICATE_RITUAL_SCORE_TOAST_V1'
if not path.is_file():
    sys.exit('❌ Không tìm thấy StreamingOverlay.tsx. Hãy cd vào thư mục game trước.')
original = path.read_text(encoding='utf-8')
if marker in original:
    print('✅ Bản sửa này đã được cài, không cần cài lại.')
    sys.exit(0)
# Feed notification is generated with kind='ritual' and pointsDelta. It duplicates
# CenterCeremonialPanel, which is preserved. Suppress only that transient feed toast,
# not the ritual itself or merit changes, and avoid resurfacing stale older notices.
pattern = re.compile(
    r'(overlaySettings\.showNotifications\s*&&\s*)(notifications\.length\s*>\s*0\s*&&\s*\()'
)
matches = list(pattern.finditer(original))
if len(matches) != 1:
    sys.exit(f'❌ Không sửa file: tìm thấy {len(matches)} khối thông báo, cần đúng 1. Hãy gửi log để kiểm tra.')
updated = pattern.sub(
    r"\1notifications[0]?.kind !== 'ritual' && \2",
    original, count=1
)
updated = f'// {marker}: Hide duplicate gift ritual/merit toast only.\n' + updated
if updated.count("notifications[0]?.kind !== 'ritual'") != 1:
    sys.exit('❌ Kiểm tra an toàn không đạt. Chưa sửa file.')
backup = path.with_name(path.name + '.bak-' + datetime.now().strftime('%Y%m%d-%H%M%S'))
shutil.copy2(path, backup)
path.write_text(updated, encoding='utf-8')
print('✅ Đã ẩn thông báo phụ: “Phật tử – Cầu Sức Khỏe – +120” (và tương tự cho các nghi lễ khác).')
print('✅ Giữ nguyên bảng lễ chính, kết quả Xin Xăm và điểm Công Đức.')
print('✅ Đã sao lưu:', backup)
