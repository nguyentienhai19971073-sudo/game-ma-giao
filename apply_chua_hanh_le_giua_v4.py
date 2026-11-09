#!/usr/bin/env python3
"""Single-step combined V4 repair for CHUA ONLINE. Run from project root."""
from pathlib import Path
import subprocess,sys
root=Path.cwd()
here=Path(__file__).resolve().parent
if not (root/'src/systems/TikTokEventManager.ts').is_file():
    sys.exit('❌ Cần chạy trong ~/CHUA_ONLINE_TEST/Chua_Online_3D')
for script in ('apply_chua_ritual_giua_bang_doc.py','chua_fix_center_v4.py'):
    print('\n---',script,'---',flush=True)
    result=subprocess.run([sys.executable,str(here/script)],cwd=str(root))
    if result.returncode:
        sys.exit('❌ Bản vá dừng vì source hiện tại khác cấu trúc đã kiểm tra. KHÔNG chạy game cho đến khi kiểm tra log trên.')
print('\n✅ BẢN VÁ V4 HOÀN THÀNH. Hãy chạy: npm run build && npm run dev')
