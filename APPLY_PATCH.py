#!/usr/bin/env python3
"""Apply this ZIP over game-ma-giao-main; only deletes explicitly listed legacy files."""
from pathlib import Path
import shutil
here=Path(__file__).resolve().parent
root=here
if not (root/'package.json').exists():
 raise SystemExit('ERROR: Unzip patch into game-ma-giao-main first (package.json missing).')
removed=0
for line in (here/'DELETE_FILES.txt').read_text(encoding='utf-8').splitlines():
 if not line.strip(): continue
 path=root/line
 if path.is_file():path.unlink();removed+=1
for d in sorted(root.rglob('*'),key=lambda p:len(p.parts),reverse=True):
 if d.is_dir() and d !=root:
  try:d.rmdir()
  except OSError:pass
print(f'Ma Giáo: removed {removed} legacy files; updated files already extracted.')
print('Now run: npm install && npm run build')
