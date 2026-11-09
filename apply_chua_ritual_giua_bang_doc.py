#!/usr/bin/env python3
"""Combined CHÙA ONLINE patch: center ceremonies, slim vertical alerts and central physical Xin Xăm stand.
Can run on a fresh project OR a project already patched with the original center-ceremony version.
"""
from pathlib import Path
import subprocess
import sys

root = Path.cwd()
folder = Path(__file__).resolve().parent
if not (root / 'src/systems/TikTokEventManager.ts').is_file():
    print('❌ Hãy cd vào thư mục ~/CHUA_ONLINE_TEST/Chua_Online_3D rồi chạy lại.')
    sys.exit(1)

steps = [
    [sys.executable, str(folder/'chua_ritual_xin_xam_visual.py'), '--check'],
    [sys.executable, str(folder/'chua_ritual_giua_bang_doc_core.py')],
    [sys.executable, str(folder/'chua_ritual_xin_xam_visual.py')],
]
for i, cmd in enumerate(steps, start=1):
    print(f'\n--- BƯỚC {i}/3 ---', flush=True)
    result = subprocess.run(cmd, cwd=str(root))
    if result.returncode:
        print('❌ Đã dừng. Không chạy tiếp khi có lỗi; hãy gửi log Terminal.')
        sys.exit(result.returncode)
print('\n✅ HOÀN THÀNH: cả 6 nghi lễ đi giữa; thông báo xếp dọc; trụ Xin Xăm đặt ở giữa.')
