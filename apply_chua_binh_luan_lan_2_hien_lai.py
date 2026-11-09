#!/usr/bin/env python3
"""CHUA ONLINE 3D: show EVERY subsequent accepted LIVE comment over same worshipper.

Works as an incremental patch on the existing project. Does not change
viewer identity, layout panels, gift IDs, fortune, voice, merit, or bubble duration.
"""
from pathlib import Path
from datetime import datetime
import sys

root = Path.cwd()
files = {
    'server': root / 'server/tiktokAdapter.ts',
    'events': root / 'src/systems/TikTokEventManager.ts',
    'labels': root / 'src/systems/LabelCollisionManager.ts',
}
if not (root / 'src/App.tsx').exists() or not all(p.is_file() for p in files.values()):
    sys.exit('DUNG: Hay cd vao thu muc goc CHUA ONLINE (co src/App.tsx va server/tiktokAdapter.ts).')

original = {key: p.read_text('utf-8') for key, p in files.items()}
modified = original.copy()

# Rate limit still discourages malicious burst spam, but does not silently discard
# real consecutive comments posted at normal TikTok chat speeds.
old_server = '''      const prevTime = this.userCommentTimestamps.get(userId) || 0;
      if (now - prevTime < 1200) return;'''
new_server = '''      // CHUA_REPEAT_COMMENT_FIX_V1: do not suppress the next valid chat for 1.2s.
      // Keep only a 100ms burst guard; real message IDs are deduped client-side.
      const prevTime = this.userCommentTimestamps.get(userId) || 0;
      if (now - prevTime < 100) return;'''

old_events = '''    if (params.now - prevCommentAt < 750) return;'''
new_events = '''    // CHUA_REPEAT_COMMENT_FIX_V1: each distinct accepted comment refreshes the bubble.
    if (params.now - prevCommentAt < 100) return;'''

# The collision solver already updates bubble text/timestamp on every frame.
# When the returning viewer has sat down, the preferred bubble rect may overlap
# the altar/panel or another permanent name label: it was previously dropped.
# Offer a small search area near the head, prioritize avoiding sacred areas,
# and as a last resort keep the bubble visible (clamped within the viewport).
anchor = '''    // Persistent identity labels must never time out or vanish due to crowd collisions.
'''
insert = '''    // CHUA_REPEAT_COMMENT_FIX_V1: NEVER silently discard a valid new comment.
    // Seated worshippers can be surrounded by other nameplates, so the normal
    // collision-free pass above may fail even though their comment was received.
    // Prefer nearby spots outside Buddha/altar/panels; relax ONLY overlap with
    // other names/bubbles, not the position of the actual worshipper.
    if (bubble && !bestBubbleRect) {
      const minX = edgePad + bubble.width * 0.5;
      const maxX = viewportWidth - edgePad - bubble.width * 0.5;
      const clampedX = Math.max(minX, Math.min(maxX, item.sx));
      const candidateBottom = baseNameBottom - (hasName ? nameHeight + bubbleGap : bubbleGap);
      const minBottom = edgePad + bubble.height;
      const maxBottom = viewportHeight - edgePad;
      const yOffsets = [0, -16, 16, -32, 32, -55, 55, -85, 85];
      const xOffsets = [0, -18, 18, -40, 40];

      for (const dy of yOffsets) {
        if (bestBubbleRect) break;
        for (const dx of xOffsets) {
          const bx = Math.max(minX, Math.min(maxX, clampedX + dx * scale));
          const by = Math.max(minBottom, Math.min(maxBottom, candidateBottom + dy * scale));
          const rect: ScreenRect = {
            left: bx - bubble.width * 0.5,
            right: bx + bubble.width * 0.5,
            top: by - bubble.height,
            bottom: by,
          };
          if (!isRectInsideViewport(rect, viewportWidth, viewportHeight, edgePad)) continue;
          if (hudExclusionRects.some((ex) => screenRectsOverlap(rect, ex, 2))) continue;
          bestBubbleRect = rect;
          bestBubbleX = bx;
          bestBubbleY = by;
          break;
        }
      }

      // Extreme crowd / narrow 9:16 canvas: a short overlap is better than
      // hiding every subsequent comment. Never put the bubble off-screen.
      if (!bestBubbleRect) {
        const bx = clampedX;
        const by = Math.max(minBottom, Math.min(maxBottom, candidateBottom));
        bestBubbleX = bx;
        bestBubbleY = by;
        bestBubbleRect = {
          left: bx - bubble.width * 0.5,
          right: bx + bubble.width * 0.5,
          top: by - bubble.height,
          bottom: by,
        };
      }
    }

'''

edits = [
    ('server', old_server, new_server),
    ('events', old_events, new_events),
    ('labels', anchor, insert + anchor),
]
for k, old, new in edits:
    s = modified[k]
    if new in s:
        print(f'DA AP DUNG TU TRUOC: {files[k].relative_to(root)}')
        continue
    if s.count(old) != 1:
        sys.exit(f'DUNG AN TOAN: Khong tim thay dung 1 diem sua trong {files[k].relative_to(root)}. Chua ghi file nao.')
    modified[k] = s.replace(old, new, 1)

stamp = datetime.now().strftime('%Y%m%d_%H%M%S')
for k, p in files.items():
    if original[k] == modified[k]:
        continue
    backup = p.with_name(f'{p.name}.before_repeat_comment_{stamp}.bak')
    backup.write_text(original[k], encoding='utf-8')
    p.write_text(modified[k], encoding='utf-8')
    print('DA SUA:', p.relative_to(root))
    print('SAO LUU:', backup.relative_to(root))
print('XONG: Moi binh luan hop le se cap nhat lai bong bong tren dau cung phat tu; thoi gian 12s van giu nguyen.')
