#!/usr/bin/env python3
"""CHUA ONLINE: show viewer TikTok nickname across on-stream and admin panels.

Safe incremental patch. Does not modify userId, TikTok room handle, gift IDs,
ceremony logic, panel layout, Xin Xam dimensions, or durations.
"""
from pathlib import Path
from datetime import datetime
import subprocess
import sys
import re

root = Path.cwd()
base = Path(__file__).resolve().parent
helper = root / 'src/utils/tiktokDisplayName.ts'
scene = root / 'src/components/three/TempleScene.tsx'
board = root / 'src/components/ui/Leaderboard.tsx'
if not (root / 'server/tiktokAdapter.ts').exists() or not scene.is_file() or not board.is_file():
    sys.exit('DUNG: Ban phai cd vao thu muc goc CHUA ONLINE (co src/ va server/).')

# Include the previous nickname fix to work whether the user installed the first patch or not.
if not helper.is_file() or 'getTikTokDisplayName(p)' not in scene.read_text('utf-8') or 'getTikTokDisplayName(entry)' not in board.read_text('utf-8'):
    print('Buoc 1: Dong bo sua ten nickname TikTok cho nhan vat va Bang Cong Duc ...')
    result = subprocess.run([sys.executable, str(base / 'apply_chua_hien_ten_tiktok.py')], cwd=root)
    if result.returncode != 0:
        sys.exit('DUNG: Ban va ten TikTok nen chua ap dung duoc. Khong sua nhung bang khac.')

paths = {
    'types': root / 'src/types/temple.ts',
    'system': root / 'src/systems/TikTokEventManager.ts',
    'center': root / 'src/components/ui/CenterCeremonialPanel.tsx',
    'fortune': root / 'src/components/ui/XinXamResultPanel.tsx',
    'lotus': root / 'src/components/ui/FloatingLotusAvatars.tsx',
    'overlay': root / 'src/components/ui/StreamingOverlay.tsx',
    'fortuneadmin': root / 'src/components/ui/XinXamManagementPanel.tsx',
    'giftadmin': root / 'src/components/ui/GiftSimulatorPanel.tsx',
}
missing = [p for p in paths.values() if not p.is_file()]
if missing:
    sys.exit('DUNG: Thieu file: ' + ', '.join(str(p) for p in missing))
data = {k: p.read_text('utf-8') for k,p in paths.items()}

def change(k, old, new, expected=1):
    s = data[k]
    if new in s:
        return
    hits = s.count(old)
    if hits != expected:
        raise ValueError(f'{k}: khong tim thay chinh xac doan ma (gap {hits}, can {expected}): {old[:110]!r}')
    data[k] = s.replace(old, new, expected)

def add_import(k):
    line = "import { getTikTokDisplayName } from '../../utils/tiktokDisplayName';\n"
    if line not in data[k]:
        # TS/JS modules allow imports before regular imports.
        data[k] = line + data[k]

try:
    # Forward nickname to notifications and logs while retaining original handles/IDs.
    change('types', "export interface FeedNotification {\n  id: string;\n  kind:", "export interface FeedNotification {\n  id: string;\n  nickname?: string;\n  kind:")
    change('types', "export interface GiftCalculationLogEntry {\n  id: string;\n  userId: string;\n  username: string;", "export interface GiftCalculationLogEntry {\n  id: string;\n  userId: string;\n  username: string;\n  nickname?: string;")
    change('types', "export interface GiftCeremonyQueueItemSnapshot {\n  id: string;\n  userId: string;\n  username: string;", "export interface GiftCeremonyQueueItemSnapshot {\n  id: string;\n  userId: string;\n  username: string;\n  nickname?: string;")

    # Keep queued names when users are temporarily away from the temple.
    change('system', '''          username: p.username,
          giftId: p.activeRitual.giftId,''', '''          username: p.username,
          nickname: p.nickname,
          giftId: p.activeRitual.giftId,''')
    change('system', '''        username: qp?.username || q.userId,
        giftId: q.giftId,''', '''        username: qp?.username || q.userId,
        nickname: qp?.nickname || this.meritLedger.get(q.userId)?.nickname,
        giftId: q.giftId,''')
    change('system', '''  private recordGiftCalculationLog(entry: GiftCalculationLogEntry): void {
    this.recentGiftLogs.unshift(entry);''', '''  private recordGiftCalculationLog(entry: GiftCalculationLogEntry): void {
    const nick = this.participantsMap.get(entry.userId)?.nickname || this.meritLedger.get(entry.userId)?.nickname;
    this.recentGiftLogs.unshift({ ...entry, nickname: nick || entry.nickname });''')

    change('system', '''  private pushEventNotification(params: {
    kind: FeedNotification['kind'];
    username: string;''', '''  private pushEventNotification(params: {
    kind: FeedNotification['kind'];
    username: string;
    nickname?: string;''')
    change('system', '''      kind: params.kind,
      username: params.username,
      message: params.message,''', '''      kind: params.kind,
      username: params.username,
      nickname: params.nickname,
      message: params.message,''')

    # Source events that produce bottom notifications: Xin Xam, Follow, Share, Gift.
    change('system', '''      kind: 'xin_xam',
      username: draw.username,
      message:''', '''      kind: 'xin_xam',
      username: draw.username,
      nickname: draw.nickname,
      message:''')
    change('system', '''          kind: 'follow',
          username,
          message:''', '''          kind: 'follow',
          username,
          nickname: existing.nickname,
          message:''')
    change('system', '''          kind: 'share',
          username,
          message:''', '''          kind: 'share',
          username,
          nickname: existing.nickname,
          message:''')
    change('system', '''      kind: 'ritual',
      username: participant.username,
      message:''', '''      kind: 'ritual',
      username: participant.username,
      nickname: participant.nickname,
      message:''')

    # Username placeholder in ritual subtitle = public nickname, NOT @handle.
    change('system', '''      username: participant.username,
      ritualTitle,
      meritPoints: effectiveMeritForSpeech,''', '''      username: participant.nickname || participant.username,
      ritualTitle,
      meritPoints: effectiveMeritForSpeech,''')
    change('system', '''sanitizeCeremonialText(params.ritualSubtitle, `Phật tử ${params.username} cầu bình an`)''', '''sanitizeCeremonialText(params.ritualSubtitle, `Phật tử ${params.nickname || params.username} cầu bình an`)''')
    change('system', '''ritualSubtitle: `Phật tử ${p.username} cầu bình an`''', '''ritualSubtitle: `Phật tử ${p.nickname || p.username} cầu bình an`''')
    change('system', '''ritualSubtitle: `Phật tử ${username} cầu bình an`''', '''ritualSubtitle: `Phật tử ${existing.nickname || username} cầu bình an`''', expected=2)

    add_import('center')
    change('center', '''  const cleanTitle = sanitizeCeremonialText(announcement.ritualTitle, 'CẦU BÌNH AN');''', '''  const displayName = getTikTokDisplayName(announcement);
  const cleanTitle = sanitizeCeremonialText(announcement.ritualTitle, 'CẦU BÌNH AN');''')
    change('center', '''`Phật tử ${announcement.username} cầu bình an`''', '''`Phật tử ${displayName} cầu bình an`''')
    change('center', 'alt={announcement.username}', 'alt={displayName}')
    change('center', '@{announcement.username}', '{displayName}')

    add_import('fortune')
    change('fortune', '''  const fallbackAvatarUri = buildSacredAvatarDataUri(
    result.userId,''', '''  const displayName = getTikTokDisplayName(result);
  const fallbackAvatarUri = buildSacredAvatarDataUri(
    result.userId,''')
    change('fortune', 'alt={result.username}', 'alt={displayName}')
    change('fortune', '@{result.username}', '{displayName}')

    add_import('lotus')
    change('lotus', '          {badge.username}', '          {getTikTokDisplayName(badge)}')

    add_import('overlay')
    change('overlay', '>{n.username}</strong>', '>{getTikTokDisplayName(n)}</strong>')

    add_import('fortuneadmin')
    change('fortuneadmin', '@{d.username}</span>', '{getTikTokDisplayName(d)}</span>')

    add_import('giftadmin')
    change('giftadmin', '''        username: resolvedViewer.username,
        ritualTitle: activeGift.ritualTitle || activeGift.ceremonyTitle,''', '''        username: resolvedViewer.nickname || resolvedViewer.username,
        ritualTitle: activeGift.ritualTitle || activeGift.ceremonyTitle,''')
    change('giftadmin', '''@{q.username}</strong> · {q.ritualLabel}''', '''{getTikTokDisplayName(q)}</strong> · {q.ritualLabel}''')
    change('giftadmin', '''@{log.username}</strong> · ID {log.giftId}''', '''{getTikTokDisplayName(log)}</strong> · ID {log.giftId}''')

except ValueError as e:
    sys.exit('DUNG AN TOAN: ' + str(e) + '\nChua ghi de file nao o buoc mo rong.')

stamp = datetime.now().strftime('%Y%m%d_%H%M%S')
modified = 0
for key, path in paths.items():
    old = path.read_text('utf-8')
    new = data[key]
    if old == new:
        print('DA CO:', path.relative_to(root))
        continue
    backup = path.with_name(f'{path.name}.before_all_nickname_{stamp}.bak')
    backup.write_text(old, encoding='utf-8')
    path.write_text(new, encoding='utf-8')
    modified += 1
    print('DA SUA:', path.relative_to(root))
print(f'HOAN TAT: {modified} file moi. Da dong bo nickname Tat Ca Bang, gom ten phat tu, cong duc, nghi le, qua, hoa sen, xin xam, nhat ky.')
print('Khong doi userId, ID qua, kich thuoc bang, TTS, thoi gian thong bao.')
