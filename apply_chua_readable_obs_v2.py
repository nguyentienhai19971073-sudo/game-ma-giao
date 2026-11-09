#!/usr/bin/env python3
"""CHUA ONLINE v2: visible OBS typography (preserves full Xin Xam result popup)."""
from pathlib import Path
import re, shutil, sys
ROOT=Path(__file__).resolve().parent
MARK='chua-readability-v2'
source_css=ROOT/'chua-readable-obs.css'
if not source_css.is_file():
    sys.exit('LỖI: Thiếu chua-readable-obs.css trong ZIP. Chưa sửa source.')
files={
    'src/main.tsx':None,
    'src/components/ui/StreamingOverlay.tsx':None,
    'src/components/ui/CenterCeremonialPanel.tsx':None,
    'src/components/three/TempleScene.tsx':None,
    'src/systems/LabelCollisionManager.ts':None,
}
for rel in files:
    p=ROOT/rel
    if not p.is_file(): sys.exit('LỖI: Không tìm thấy '+rel+'; có đúng thư mục game không?')
    files[rel]=p.read_text(encoding='utf-8')
new=dict(files)
# import new scoped stylesheet, do not modify the original stylesheet or the fortune popup
s=new['src/main.tsx']
if "import './chua-readable-obs.css'" not in s:
    if "import './index.css';" not in s: sys.exit('LỖI: Không tìm thấy import index.css, dừng an toàn.')
    s=s.replace("import './index.css';", "import './index.css';\nimport './chua-readable-obs.css';",1)
new['src/main.tsx']=s
# label the streaming overlay and its compact areas; CSS only affects these areas
s=new['src/components/ui/StreamingOverlay.tsx']
if MARK not in s:
    pattern=r'(className=")(?=pointer-events-none absolute inset-0 z-20 flex flex-col justify-between)'
    s,n=re.subn(pattern,r'\1chua-readability-v2 ',s,count=1)
    if n!=1: sys.exit('LỖI: Không tìm thấy lớp StreamingOverlay, dừng an toàn.')
if 'chua-readability-offerings' not in s:
    s,n=re.subn(r'(className=")(?=w-\[\d+%\] max-w-\[\d+px\] min-w-0 shrink-0)',r'\1chua-readability-offerings ',s,count=1)
    if n!=1: sys.exit('LỖI: Không thấy khung Cúng Dường ở StreamingOverlay, dừng an toàn.')
if 'chua-event-toast-readable' not in s:
    s,n=re.subn(r'(className=")(?=self-start max-w-\[\d+px\] rounded )',r'\1chua-event-toast-readable ',s,count=1)
    if n!=1: sys.exit('LỖI: Không thấy thông báo sự kiện, dừng an toàn.')
if 'chua-subtitle-readable' not in s:
    s,n=re.subn(r'(className=")(?=max-w-\[\d+%\] rounded [^\"]*text-center)',r'\1chua-subtitle-readable ',s,count=1)
    if n!=1: sys.exit('LỖI: Không thấy khung phụ đề, dừng an toàn.')
# Current UI uses 86% scale after saved settings; boost *effective* scale but keep slider working.
# Xin Xam gets a different scale prop and is NOT affected.
if 'CHUA_READABILITY_V2_EFFECTIVE_SCALE' not in s:
    s,n=re.subn(r'const panelScale = overlaySettings\.panelScale \?\? [\d.]+;',
      'const panelScale = Math.min(1.45, Math.max(1.04, (overlaySettings.panelScale ?? 0.86) * 1.22)); // CHUA_READABILITY_V2_EFFECTIVE_SCALE',s,count=1)
    if n!=1: sys.exit('LỖI: Không thấy panelScale StreamingOverlay, dừng an toàn.')
new['src/components/ui/StreamingOverlay.tsx']=s
# Ceremony panel only (NOT the fortune result)
s=new['src/components/ui/CenterCeremonialPanel.tsx']
if 'chua-center-ceremony-readable' not in s:
    s,n=re.subn(r'(className=")(?=pointer-events-none absolute left-1/2 top-\[)',r'\1chua-center-ceremony-readable ',s,count=1)
    if n!=1: sys.exit('LỖI: Không thấy bảng nghi lễ chính, dừng an toàn.')
if 'chua-avatar-readable' not in s:
    s,n=re.subn(r'(className=")(?=w-(?:8|9|10) h-(?:8|9|10) rounded-full )',r'\1chua-avatar-readable ',s,count=1)
    if n!=1: sys.exit('LỖI: Không thấy avatar nghi lễ, dừng an toàn.')
new['src/components/ui/CenterCeremonialPanel.tsx']=s
# 3D-attached name/comment labels have inline font sizes; override safely at the source
s=new['src/components/three/TempleScene.tsx']
if 'CHUA_NAME_READABLE_V2' not in s:
    pat=r'fontSize: `\$\{Math\.max\([\d.]+, Math\.round\([\d.]+ \* labelScale \* 10\) / 10\)\}px`,'
    matches=list(re.finditer(pat,s))
    if len(matches)!=2: sys.exit(f'LỖI: Dự kiến 2 font nhãn trong TempleScene, gặp {len(matches)}; dừng an toàn.')
    news=[
      'fontSize: `${Math.max(12, Math.round(14 * labelScale * 10) / 10)}px`, // CHUA_NAME_READABLE_V2',
      'fontSize: `${Math.max(14, Math.round(16 * labelScale * 10) / 10)}px`, // CHUA_COMMENT_READABLE_V2',
    ]
    s=s[:matches[0].start()]+news[0]+s[matches[0].end():matches[1].start()]+news[1]+s[matches[1].end():]
    s=re.sub(r'max-w-\[(?:68|78|90)px\] truncate align-bottom', 'max-w-[130px] truncate align-bottom',s,count=1)
    s=re.sub(r'relative max-w-\[(?:108|122|140)px\] px-1\.5', 'relative max-w-[210px] px-2',s,count=1)
new['src/components/three/TempleScene.tsx']=s
# Update collision estimates so more readable labels still move with each user's head
s=new['src/systems/LabelCollisionManager.ts']
if 'CHUA_COLLISION_READABLE_V2' not in s:
    pat=r'Math\.min\(\d+, Math\.max\(\d+, Math\.min\(charCount, \d+\) \* [\d.]+ \+ \d+\)\)'
    matches=list(re.finditer(pat,s))
    if len(matches)!=2: sys.exit(f'LỖI: Dự kiến 2 hàm đo chiều rộng nhãn, gặp {len(matches)}; dừng an toàn.')
    strs=[
      'Math.min(135, Math.max(50, Math.min(charCount, 20) * 7.4 + 18))',
      'Math.min(210, Math.max(85, Math.min(charCount, 28) * 7.5 + 24))',
    ]
    s=s[:matches[0].start()]+strs[0]+s[matches[0].end():matches[1].start()]+strs[1]+s[matches[1].end():]
    s=re.sub(r'const height = \(lines === 2 \? \d+ : \d+\) \* scale;', 'const height = (lines === 2 ? 53 : 32) * scale;',s,count=1)
    s=re.sub(r'const nameHeight = \d+ \* scale;', 'const nameHeight = 21 * scale; // CHUA_COLLISION_READABLE_V2',s,count=1)
new['src/systems/LabelCollisionManager.ts']=s

# Write only after all matches validate, with recoverable original backups
modified=[]
for rel, old in files.items():
    if new[rel]!=old:
        p=ROOT/rel
        backup=p.with_name(p.name+'.before_readable_obs_v2.bak')
        if not backup.exists(): backup.write_text(old, encoding='utf-8')
        p.write_text(new[rel],encoding='utf-8')
        modified.append(rel)
css_target=ROOT/'src/chua-readable-obs.css'
css_target.parent.mkdir(parents=True,exist_ok=True)
if not css_target.exists() or css_target.read_text(encoding='utf-8')!=source_css.read_text(encoding='utf-8'):
    css_target.write_text(source_css.read_text(encoding='utf-8'),encoding='utf-8')
print('✅ Đã tăng rõ kích thước bảng và chữ cho OBS, áp dụng tại:',ROOT)
for rel in modified: print('  ✓',rel)
print('  ✓ src/chua-readable-obs.css')
print('✅ Không sửa XinXamResultPanel.tsx, không đổi nội dung quẻ, điểm, LIVE hoặc VieNeu.')
print('✅ Nếu xem trong OBS vẫn cũ, hãy làm mới nguồn Browser và Chrome.')
