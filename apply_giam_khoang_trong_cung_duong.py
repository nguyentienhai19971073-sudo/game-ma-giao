#!/usr/bin/env python3
"""Thu hep bang Cung Duong nhung GIU nguyen gia xu va so luong can phai.

Changes only the relevant UI markup/classes in-place, with original .bak backups.
Designed to work with both previous split-column and the most recent inline variant.
"""
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parent
panel = root / 'src/components/ui/BuddhistGiftPanel.tsx'
overlay = root / 'src/components/ui/StreamingOverlay.tsx'
if not (panel.is_file() and overlay.is_file()):
    sys.exit('❌ Không tìm thấy src/components/ui/... Hãy giải nén ZIP vào thư mục Chua_Online_3D và chạy script ở đó.')

p = panel.read_text(encoding='utf-8')
o = overlay.read_text(encoding='utf-8')

# Restore the ORIGINAL two-column price layout from any earlier compact or inline
# version, so that the price stays flush right and the content is unchanged.
start = '              <div className="flex-1 '
end = '              </div>\n            </div>\n          );'
if start not in p or end not in p:
    sys.exit('❌ Không nhận ra cấu trúc bảng Cúng Dường hiện tại. Dừng để tránh sửa sai.')
a = p.index(start)
b = p.index(end, a) + len('              </div>')
existing = p[a:b]
required_tokens = ('{item.ceremonyTitle}', '{item.referenceCoins}', '{item.vietnameseLabel}', '{count}')
if any(token not in existing for token in required_tokens) or len(existing)>4500:
    sys.exit('❌ Nội dung panel có cấu trúc mới, không tự thay vì tránh mất tính năng.')
replacement = '''              <div className="flex-1 w-full min-w-0 leading-[1.22]">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-[3px] w-full min-w-0">
                  <p className="font-display text-[8.5px] font-bold tracking-normal text-[#ffe89e] whitespace-normal break-words [word-break:normal] [overflow-wrap:break-word] min-w-0 leading-[1.15]">
                    {item.ceremonyTitle}
                  </p>
                  <span className="font-mono-tabular text-[8px] font-semibold text-[#ffd978] whitespace-nowrap shrink-0 leading-[1.15]">
                    {item.referenceCoins} xu
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-[2px] w-full min-w-0 mt-[1px]">
                  <p className="text-[8.3px] text-[#fff3e0] font-medium whitespace-normal break-words [word-break:normal] [overflow-wrap:break-word] min-w-0 leading-[1.16]">
                    {item.vietnameseLabel}
                  </p>
                  {count > 0 && (
                    <span className="font-mono-tabular text-[clamp(7px,0.95vw,8px)] font-bold text-[#ffe699]/90 whitespace-nowrap shrink-0">
                      ×{count}
                    </span>
                  )}
                </div>
              </div>'''
p = p[:a] + replacement + p[b:]

# Leave all font size, title, price, x count, and row gap unchanged.
# Only reduce panel's right-side padding, keeping left-side alignment stable.
p, n1 = re.subn(r'(className="divide-y divide-\[#d4af37\]/15 )px-(?:1|\[[0-9]+px\])',
                r'\1pl-[3px] pr-[1px]', p, count=1)
# Original and compact variants of row padding, no font or row height modifications.
p, n2 = re.subn(r'(className=\{`h-auto flex items-start gap-\[[0-9]+px\] py-\[2px\] )px-(?:0\.5|\[[0-9]+px\])',
                r'\1pl-[2px] pr-[1px]', p, count=1)
if n1 != 1 or n2 != 1:
    sys.exit('❌ Không nhận diện được padding hiện tại, không ghi file. Vui lòng gửi source để kiểm tra.')

# Reduce total WIDTH to remove the empty central strip; keep right-aligned coin column.
o, n3 = re.subn(r'w-\[\d+(?:\.\d+)?%\] max-w-\[\d+px\] min-w-0 shrink-0',
                'w-[39%] max-w-[148px] min-w-0 shrink-0', o, count=1)
if n3 != 1:
    sys.exit('❌ Không nhận diện được chiều rộng bảng trong StreamingOverlay. Chưa ghi file.')

for file, old, new in ((panel, panel.read_text(encoding='utf-8'), p), (overlay, overlay.read_text(encoding='utf-8'), o)):
    if old == new:
        continue
    backup = file.with_suffix(file.suffix + '.before_offering_width.bak')
    if not backup.exists():
        backup.write_text(old, encoding='utf-8')
    file.write_text(new, encoding='utf-8')

print('✅ Giảm chiều rộng bảng CÚNG DƯỜNG CẦU AN (39% khung, tối đa 148px).')
print('✅ Giảm padding-right còn 1px; không đổi font và chiều cao hàng.')
print('✅ Giữ tên nghi lễ BÊN TRÁI; giá xu và số lượng CĂN PHẢI.')
print('✅ Đã sao lưu file gốc dạng *.before_offering_width.bak.')
