#!/usr/bin/env python3
"""Safely patch existing CHUA ONLINE source without replacing newer customizations."""
from pathlib import Path
import shutil
import sys

root = Path.cwd()
manager = root / 'src/systems/TikTokEventManager.ts'
app = root / 'src/App.tsx'

for f in (manager, app):
    if not f.is_file():
        raise SystemExit(f'KHONG tim thay file: {f}. Hay cd vao thu muc CHUA ONLINE truoc.')

original_manager = manager.read_text(encoding='utf-8')
original_app = app.read_text(encoding='utf-8')

# Place a gift-driven entrance before GiftRegistry / XinXam rules. This also
# lets legitimate *unknown* / disabled Gift IDs create a devotee without
# inventing a ceremony for an unmapped gift.
old = """    if (raw.type === 'gift') {
      const normalizedGiftId = normalizeGiftId(raw.giftId);
      if (!normalizedGiftId) return;
"""
new = """    if (raw.type === 'gift') {
      // A genuine gift always grants entry, even when its Gift ID is not mapped.
      // ensureParticipant reuses the SAME userId and reserved seat when this
      // viewer has already joined via comment or an earlier gift.
      // Likes, follows, shares and joins still cannot create a devotee.
      this.ensureParticipant({
        userId,
        username,
        nickname,
        avatarUrl: raw.avatarUrl,
        isDemo,
        now,
      });

      const normalizedGiftId = normalizeGiftId(raw.giftId);
      if (!normalizedGiftId) {
        // Keep the viewer in the temple, but never invent a Gift ID or ritual.
        this.scheduleNotify();
        return;
      }
"""

marker = 'A genuine gift always grants entry, even when its Gift ID is not mapped.'
if marker in original_manager:
    updated_manager = original_manager
    print('Gift entrance: da duoc cap nhat, bo qua.')
else:
    count = original_manager.count(old)
    if count != 1:
        raise SystemExit(f'Khong tim thay dung 1 doan Gift handler (tim thay {count}). DUNG lai de tranh ghi sai ma nguon.')
    updated_manager = original_manager.replace(old, new, 1)
    print('Gift entrance: them xu ly mot userId/mot Phat tu cho moi su kien tang qua.')

# Stop fake demo devotees being automatically injected into the livestream
# viewport when the page opens. Admin Demo buttons remain fully functional.
# Optional ?demoIntro=1 preserves the old introductory showcase on demand.
intro_anchor = """    if (params.get('empty') !== '1') {
      demoIntroTimer1 = window.setTimeout(() => {
"""
intro_new = """    if (params.get('demoIntro') === '1' && params.get('empty') !== '1') {
      demoIntroTimer1 = window.setTimeout(() => {
"""
if intro_new in original_app:
    updated_app = original_app
    print('Demo introduction: da tat mac dinh, bo qua.')
else:
    count = original_app.count(intro_anchor)
    if count != 1:
        raise SystemExit(f'Khong tim thay dung 1 doan demo intro (tim thay {count}). DUNG lai de tranh ghi sai ma nguon.')
    updated_app = original_app.replace(intro_anchor, intro_new, 1)
    print('Demo introduction: chi bat khi chu dong them ?demoIntro=1.')

if 'const { participant, isNew } = this.ensureParticipant(params);' not in updated_manager:
    raise SystemExit('Comment handler khong dung ensureParticipant. DUNG lai de kiem tra code.')
if 'const { participant } = this.ensureParticipant(params);' not in updated_manager:
    raise SystemExit('Gift ceremony handler khong dung ensureParticipant. DUNG lai de kiem tra code.')

for path, content in ((manager, updated_manager), (app, updated_app)):
    if path.read_text(encoding='utf-8') == content:
        continue
    backup = path.with_suffix(path.suffix + '.bak_entry_gift')
    if not backup.exists():
        shutil.copy2(path, backup)
    path.write_text(content, encoding='utf-8')
    print('DA SUA:', path.relative_to(root))

print('HOAN TAT: Binh luan hoac tang qua -> vao chua. Mot userId = mot Phat tu.')
print('Gift chua cau hinh -> van vao chua, khong kich hoat nghi le.')
print('Khong co user mau tu dong. Thu Demo mau voi ?demoIntro=1 neu can.')
