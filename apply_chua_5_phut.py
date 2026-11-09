#!/usr/bin/env python3
"""Change CHUA ONLINE 3D default idle timeout from 120 to 300 seconds.

One-time migrates existing browser settings from old built-in 120-second timeout;
other user-defined timeout values are untouched. Retains all other settings.
"""
from pathlib import Path
from datetime import datetime
import sys

ROOT = Path.cwd()
FILES = {
    'settings': ROOT/'src/types/temple.ts',
    'manager': ROOT/'src/systems/TikTokEventManager.ts',
    'overlay': ROOT/'src/systems/OverlayTheme.ts',
    'admin': ROOT/'src/components/ui/AdminDashboard.tsx',
    'tests': ROOT/'src/tests/livestreamUpgrade.test.ts',
}
VERSION='CHUA_INACTIVITY_5MIN_V1'
if not all(p.exists() for k,p in FILES.items() if k!='tests'):
    sys.exit('❌ Bạn cần cd vào thư mục Chua_Online_3D trước khi chạy file vá.')
if VERSION in FILES['overlay'].read_text(encoding='utf8'):
    print('✅ Bản vá 5 phút đã có trong game, không cần cài lại.')
    sys.exit(0)

original={k:p.read_text(encoding='utf8') for k,p in FILES.items() if p.exists()}
new=original.copy()

def replace_once(k,old,newtext,label):
    s=new[k]
    c=s.count(old)
    if c!=1:
        sys.exit(f'❌ Mã không khớp ({label}): tìm thấy {c} đoạn thay vì 1. Chưa sửa file nào. Hãy gửi kết quả Terminal.')
    new[k]=s.replace(old,newtext,1)

replace_once('settings','  inactivityTimeoutSec: 120,','  inactivityTimeoutSec: 300,','default 300')
replace_once('manager','  private inactivityTimeoutSec = 120; // Production default: 120 seconds',
             '  private inactivityTimeoutSec = 300; // Production default: 300 seconds (5 minutes)','manager 300')
replace_once('manager','Math.round(params.timeoutSec || 120)', 'Math.round(params.timeoutSec || 300)', 'manager fallback')
replace_once('manager','  // Automatic 120-Second Inactivity Timeout State', '  // Automatic 300-Second Inactivity Timeout State', 'comment manager')

replace_once('overlay',
 'const COMMENT_DURATION_12S_MIGRATION_KEY = \'chua_online_comment_duration_12s_migrated_v1\';',
 "const COMMENT_DURATION_12S_MIGRATION_KEY = 'chua_online_comment_duration_12s_migrated_v1';\n"+
 f"// {VERSION}: one-time upgrade of the former 120s idle default; preserve other custom durations.\n"+
 "const INACTIVITY_5MIN_MIGRATION_KEY = 'chua_online_inactivity_5min_migrated_v1';",
 'migration key')
replace_once('overlay',
 "    const parsed = JSON.parse(raw) as Partial<StreamOverlaySettings>;",
 "    const parsed = JSON.parse(raw) as Partial<StreamOverlaySettings>;\n"+
 "    const inactivity5MinAlreadyMigrated = window.localStorage.getItem(INACTIVITY_5MIN_MIGRATION_KEY) === '1';\n"+
 "    if (!inactivity5MinAlreadyMigrated) window.localStorage.setItem(INACTIVITY_5MIN_MIGRATION_KEY, '1');",
 'migration state')
replace_once('overlay',
 "      ...DEFAULT_OVERLAY_SETTINGS,\n      ...parsed,\n      panelScale:",
 "      ...DEFAULT_OVERLAY_SETTINGS,\n      ...parsed,\n"+
 "      // Convert only the former built-in 120s to 5 minutes, once per browser profile.\n"+
 "      inactivityTimeoutSec: !inactivity5MinAlreadyMigrated &&\n"+
 "        (parsed.inactivityTimeoutSec === 120 || parsed.inactivityTimeoutSec == null)\n"+
 "          ? 300 : (parsed.inactivityTimeoutSec ?? DEFAULT_OVERLAY_SETTINGS.inactivityTimeoutSec),\n"+
 "      // Disable old accelerated 12s Demo mode during the 5-minute migration.\n"+
 "      demoAcceleratedTimeout: !inactivity5MinAlreadyMigrated\n"+
 "        ? false : Boolean(parsed.demoAcceleratedTimeout),\n"+
 "      panelScale:",
 'migration override')

replace_once('admin', '                  Tự Động Cáo Lễ Rời Chánh Điện Sau 2 Phút (120 Giây)',
             '                  Tự Động Cáo Lễ Rời Chánh Điện Sau 5 Phút (300 Giây)', 'admin heading')
replace_once('admin', 'trong 120s, nhân vật đứng dậy', 'trong 300s, nhân vật đứng dậy','admin description')
replace_once('admin', 'inactivityTimeoutSec: Math.max(15, Number(e.target.value) || 120)',
             'inactivityTimeoutSec: Math.max(15, Number(e.target.value) || 300)', 'admin input')
replace_once('admin', '                        inactivityTimeoutSec: 120,',
             '                        inactivityTimeoutSec: 300,','admin reset')
replace_once('admin', '                    Chuẩn 120s', '                    Chuẩn 300s','admin button')
replace_once('admin', 'Tăng tốc kiểm thử Demo (12s — không sửa cấu hình 120s)',
             'Tăng tốc kiểm thử Demo (12s — không sửa cấu hình 300s)', 'admin demo label')
replace_once('admin', 'Mặc định sản xuất luôn giữ chuẩn <span className="font-mono-tabular">120s</span> (2 phút).',
             'Mặc định sản xuất luôn giữ chuẩn <span className="font-mono-tabular">300s</span> (5 phút).', 'admin demo info')
replace_once('admin', '04. Kiểm Thử Hết Hạn 120s, 200 Đệm 9:16 &amp; Top Công Đức',
             '04. Kiểm Thử Hết Hạn 300s, 200 Đệm 9:16 &amp; Top Công Đức','admin demo heading')
replace_once('admin', '5. CHARACTERS, 200-SEAT 9:16 LAYOUT & 120-SECOND INACTIVITY TIMEOUT TAB',
             '5. CHARACTERS, 200-SEAT 9:16 LAYOUT & 300-SECOND INACTIVITY TIMEOUT TAB', 'admin comment')
replace_once('admin', '{/* Section 4: 120s Inactivity Timeout, 200-Seat 9:16 Frame & Compact Leaderboard Tests */}',
             '{/* Section 4: 300s Inactivity Timeout, 200-Seat 9:16 Frame & Compact Leaderboard Tests */}', 'admin comment section')

# Keep integration test expectation in sync with the new default.
if 'tests' in new:
    replace_once('tests', "runTest('2. 200 participants capacity, primary mat cap & 120-second inactivity departure'",
                 "runTest('2. 200 participants capacity, primary mat cap & 300-second inactivity departure'", 'test heading')
    replace_once('tests', "assert.equal(snap.effectiveTimeoutSec, 120, 'Default inactivity timeout preserved at 120 seconds');",
                 "assert.equal(snap.effectiveTimeoutSec, 300, 'Default inactivity timeout is 300 seconds');", 'test default')
    replace_once('tests', "firstUser.lastInteractionAt = Date.now() - 125_000;",
                 "firstUser.lastInteractionAt = Date.now() - 305_000;", 'test threshold')
    replace_once('tests', "assert.equal(swept, 1, '120s sweep initiates departure for inactive user');",
                 "assert.equal(swept, 1, '300s sweep initiates departure for inactive user');", 'test sweep')
    replace_once('tests', '  // Force one user\'s lastInteractionAt past 120s and sweep',
                 '  // Force one user\'s lastInteractionAt past 300s and sweep', 'test comment')
    replace_once('tests', '  // Force User A past 120s inactivity WHILE still performing Xin Xăm -> must NOT be removed mid-ritual!',
                 '  // Force User A past 300s inactivity WHILE still performing Xin Xăm -> must NOT be removed mid-ritual!', 'test ritual comment')
    replace_once('tests', "internalMap.get('u-xam-a')!.lastInteractionAt = Date.now() - 150_000;",
                 "internalMap.get('u-xam-a')!.lastInteractionAt = Date.now() - 310_000;", 'test ritual threshold')

# Only write after all anchor verification succeeds.
changed={k:s for k,s in new.items() if original[k]!=s}
backup_dir=ROOT/'.chua_5min_backup'
backup_dir.mkdir(exist_ok=True)
for k in changed:
    backup=(backup_dir/FILES[k].relative_to(ROOT))
    backup.parent.mkdir(parents=True,exist_ok=True)
    if not backup.exists(): backup.write_text(original[k],encoding='utf8')
for k,s in changed.items():
    FILES[k].write_text(s,encoding='utf8')
print('✅ Đã đổi thời gian Phật tử ở chùa 120 → 300 giây (5 phút).')
print('✅ Cập nhật cài đặt mặc định, giao diện Admin và chuyển cấu hình cũ 120s sang 300s.')
print('✅ Không thay đổi dữ liệu quà, hiệu ứng, âm thanh, tên TikTok hay bảng Xin Xăm.')
print('✅ Đã sao lưu file gốc trong .chua_5min_backup/')
print('ℹ️ Nếu OBS đang mở Browser Source, hãy làm mới nguồn để nhận cấu hình mới.')
