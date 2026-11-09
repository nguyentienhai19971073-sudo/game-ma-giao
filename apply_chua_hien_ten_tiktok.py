#!/usr/bin/env python3
"""Patch CHUA ONLINE to show TikTok display nickname instead of internal userId.

Changes only backend user-name extraction and visible character / merit names.
Does not modify event IDs, identity map, gift logic, audio, UI sizing, or fortune panel.
"""
from pathlib import Path
from datetime import datetime
import re
import sys

root = Path.cwd()
server = root / 'server/tiktokAdapter.ts'
scene = root / 'src/components/three/TempleScene.tsx'
leaderboard = root / 'src/components/ui/Leaderboard.tsx'
manager = root / 'src/systems/TikTokEventManager.ts'
helper = root / 'src/utils/tiktokDisplayName.ts'
paths = [server, scene, leaderboard, manager]
if not all(p.is_file() for p in paths):
    for p in paths:
        if not p.is_file():
            print('KHONG TIM THAY:', p)
    sys.exit('DUNG: Hay cd vao thu muc game CHUA ONLINE co src va server.')

helper_text = '''/** TikTok LIVE's nickname is the public display name, unlike displayId or numeric User.id. */
export function getTikTokDisplayName(user: {
  nickname?: string;
  username?: string;
  userId?: string;
}): string {
  // Keep userId internal: never show a long numeric ID as someone's name.
  for (const value of [user.nickname, user.username]) {
    const name = typeof value === 'string' ? value.trim() : '';
    if (!name || name === user.userId || /^\\d{10,}$/.test(name)) continue;
    return name;
  }
  return 'Phật tử';
}
'''

s = server.read_text('utf-8')
scene_src = scene.read_text('utf-8')
board_src = leaderboard.read_text('utf-8')
manager_src = manager.read_text('utf-8')

# Anchor to method boundary; fail safely when the project is a different version.
pattern = re.compile(r'  private extractUserFields\(data: any\) \{\n.*?\n  \}\n\n(?=  private bindEvents\()', re.S)
new_method = '''  private extractUserFields(data: any) {
    const user = data?.user || data || {};
    // TikTok v2.5: user.id = stable internal ID; user.displayId = @handle;
    // user.nickname = the public display name shown in TikTok LIVE.
    const firstText = (...values: unknown[]): string => {
      for (const value of values) {
        if (typeof value === 'string' && value.trim()) return value.trim();
      }
      return '';
    };
    const userId = String(user?.id ?? user?.userId ?? data?.userId ?? user?.displayId ?? user?.uniqueId ?? '').trim();
    const handle = firstText(user?.displayId, user?.uniqueId, data?.uniqueId, data?.username).replace(/^@+/, '');
    const username = handle || userId || 'phattu';
    const nameFromTikTok = firstText(
      user?.nickname, user?.nickName, user?.displayName,
      data?.nickname, data?.nickName, data?.displayName,
    );
    // A missing nickname must not turn a numeric userId into a label.
    const nickname = nameFromTikTok && nameFromTikTok !== userId
      ? nameFromTikTok
      : (handle && handle !== userId ? handle : 'Phật tử');
    const avatarUrl = this.extractAvatar(user);
    return { userId, username, nickname, avatarUrl };
  }

'''

if 'nameFromTikTok && nameFromTikTok !== userId' not in s:
    if len(pattern.findall(s)) != 1:
        sys.exit('DUNG: khong xac dinh duoc ham extractUserFields; chua sua file.')
    # Require original shape so patch cannot accidentally override unrelated changes.
    old_method = pattern.search(s).group(0)
    if 'const nickname = String(user?.nickname || username);' not in old_method:
        sys.exit('DUNG: ham extractUserFields da thay doi khac du kien. Can xem ma nguon.')
    s = pattern.sub(lambda _: new_method, s, count=1)

import_helper = "import { getTikTokDisplayName } from '../../utils/tiktokDisplayName';\n"
if import_helper not in scene_src:
    anchor = "import { createRadialGlowTexture, liveCharacterPositions } from './templeResources';\n"
    if scene_src.count(anchor) != 1:
        sys.exit('DUNG: khong tim thay vi tri import trong TempleScene.')
    scene_src = scene_src.replace(anchor, anchor + import_helper, 1)
if import_helper not in board_src:
    anchor = "import { MeritLedgerEntry } from '../../types/temple';\n"
    if board_src.count(anchor) != 1:
        sys.exit('DUNG: khong tim thay vi tri import trong Leaderboard.')
    board_src = board_src.replace(anchor, anchor + import_helper, 1)

# Label collision solver and the rendered label must use IDENTICAL display text.
source_and_replacement = [
    ('username: p.username,', 'username: getTikTokDisplayName(p),'),
    ('{p.username}', '{getTikTokDisplayName(p)}'),
]
for old, new in source_and_replacement:
    if new not in scene_src:
        if scene_src.count(old) != 1:
            sys.exit(f'DUNG: TempleScene khong co dung mot vi tri {old!r}.')
        scene_src = scene_src.replace(old, new, 1)

if '{getTikTokDisplayName(entry)}' not in board_src:
    if board_src.count('{entry.username}') != 1:
        sys.exit('DUNG: Leaderboard khong co dung 1 vi tri hien thi ten.')
    board_src = board_src.replace('{entry.username}', '{getTikTokDisplayName(entry)}', 1)

# If a later gift arrives without user.nickname, preserve the last authentic name.
old_nick_update = '      existing.nickname = params.nickname || existing.nickname;'
new_nick_update = '''      if (params.nickname && params.nickname !== 'Phật tử' && params.nickname !== params.userId) {
        existing.nickname = params.nickname;
      }'''
if new_nick_update not in manager_src:
    if manager_src.count(old_nick_update) != 1:
        sys.exit('DUNG: khong xac dinh duoc doan luu nickname cua nhan vat.')
    manager_src = manager_src.replace(old_nick_update, new_nick_update, 1)

updates = ((server, s), (scene, scene_src), (leaderboard, board_src), (manager, manager_src), (helper, helper_text))
# Complete all checks before committing any edits.
if helper.exists() and helper.read_text('utf-8') != helper_text:
    sys.exit('DUNG: src/utils/tiktokDisplayName.ts ton tai nhung khac ban va. Chua ghi de.')

stamp = datetime.now().strftime('%Y%m%d_%H%M%S')
for path, new in updates:
    old = path.read_text('utf-8') if path.exists() else None
    if old == new:
        print('DA CO:', path.relative_to(root))
        continue
    if old is not None:
        backup = path.with_name(f'{path.name}.before_tiktok_nickname_{stamp}.bak')
        backup.write_text(old, encoding='utf-8')
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(new, encoding='utf-8')
    print('DA SUA:', path.relative_to(root))

print('HOAN TAT: Hien nickname TikTok tren nhan nhan vat va Bang Cong Duc.')
print('Giua nguyen userId de gan ghe, ghi cong duc, nhan qua, va ngan user trung.')
print('Neu TikTok khong gui nickname/handle, hien Phat tu thay vi ma userId.')
