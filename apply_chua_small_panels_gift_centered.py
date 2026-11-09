#!/usr/bin/env python3
"""Minimal, repeatable patch: shrink 3 panels; center ONLY gift notification content."""
from pathlib import Path
import sys

root=Path(__file__).resolve().parent
files={
    'src/main.tsx': root/'src/main.tsx',
    'src/components/ui/StreamingOverlay.tsx': root/'src/components/ui/StreamingOverlay.tsx',
    'src/components/ui/CenterCeremonialPanel.tsx': root/'src/components/ui/CenterCeremonialPanel.tsx',
}
css_src=root/'chua-small-panels-gift-centered.css'
if not css_src.is_file() or any(not p.is_file() for p in files.values()):
    sys.exit('❌ Thiếu file bản vá hoặc mã nguồn. Hãy giải nén vào đúng thư mục game và chạy lại.')
orig={rel:p.read_text(encoding='utf-8') for rel,p in files.items()}
new=dict(orig)

def replace_once(txt, old, repl, label):
    if repl in txt: return txt  # already applied
    if txt.count(old) != 1:
        sys.exit(f'❌ Không khớp phần {label}. Chưa ghi thay đổi nào; vui lòng gửi file hiện tại để sửa đúng phiên bản.')
    return txt.replace(old,repl,1)

# Import final override stylesheet strictly after the earlier readability stylesheet.
s=new['src/main.tsx']
import_stmt="import './chua-small-panels-gift-centered.css';"
if import_stmt not in s:
    if "import './chua-readable-obs.css';" in s:
        s=s.replace("import './chua-readable-obs.css';", "import './chua-readable-obs.css';\n"+import_stmt,1)
    elif "import './index.css';" in s:
        s=s.replace("import './index.css';", "import './index.css';\n"+import_stmt,1)
    else: sys.exit('❌ Không tìm thấy entry CSS của ứng dụng.')
new['src/main.tsx']=s

s=new['src/components/ui/StreamingOverlay.tsx']
if 'chua-readability-v2' not in s:
    sys.exit('❌ Hãy áp dụng bản vá chữ lớn OBS trước; bản vá này chỉ THU NHỎ từ phiên bản đó.')
s=replace_once(s,
    '<div>\n              {overlaySettings.showLeaderboard && (',
    '<div className="chua-compact-merit-holder">\n              {overlaySettings.showLeaderboard && (',
    'vùng Bảng Công Đức')
s=replace_once(s,
    'className="chua-event-toast-readable self-start max-w-[225px] rounded px-2.5 py-1"',
    'className={`chua-event-toast-readable self-start max-w-[225px] rounded px-2.5 py-1 ${\n            [\'gift\', \'ritual\'].includes(notifications[0]?.kind ?? \'\') ? \'chua-gift-toast-centered\' : \'\'\n          }`}',
    'thông báo quà phía dưới')
new['src/components/ui/StreamingOverlay.tsx']=s

s=new['src/components/ui/CenterCeremonialPanel.tsx']
s=replace_once(s,
    '  const scale = clampPanelScale(panelScale);',
    "  const isGiftAnnouncement = announcement.id.startsWith('ceremony-');\n  const scale = clampPanelScale(panelScale * (isGiftAnnouncement ? 0.86 : 1));",
    'kích thước thông báo nghi lễ quà')
s=replace_once(s,
    'className="chua-center-ceremony-readable pointer-events-none absolute',
    "className={`chua-center-ceremony-readable ${isGiftAnnouncement ? 'chua-gift-announcement-centered' : ''} pointer-events-none absolute",
    'căn giữa thông báo quà')
# If changed static className to template literal, close with template brace at the end.
if "className={`chua-center-ceremony-readable ${isGiftAnnouncement" in s:
    s=replace_once(s,
      'z-30 w-[85%] max-w-[290px] flex justify-center"',
      'z-30 w-[85%] max-w-[290px] flex justify-center`}',
      'kết thúc className thông báo quà')
new['src/components/ui/CenterCeremonialPanel.tsx']=s

# Only write after all conditions validated.
for rel,src in new.items():
    p=files[rel]
    if src != orig[rel]:
        backup=p.with_name(p.name+'.before_small_panels_gift_centered.bak')
        if not backup.exists(): backup.write_text(orig[rel],encoding='utf-8')
        p.write_text(src,encoding='utf-8')
target=root/'src/chua-small-panels-gift-centered.css'
if not target.exists() or target.read_text(encoding='utf-8') != css_src.read_text(encoding='utf-8'):
    target.write_text(css_src.read_text(encoding='utf-8'),encoding='utf-8')
print('✅ Đã thu nhỏ Bảng Công Đức, Cúng Dường, thông báo QUÀ.')
print('✅ Chỉ thông báo QUÀ được căn giữa chữ, avatar và nội dung.')
print('✅ Giữ nguyên giá xu căn phải; không sửa bảng kết quả Xin Xăm.')
print('✅ Không đụng tới LIVE, Gift ID, âm thanh hoặc thời gian hiển thị.')
