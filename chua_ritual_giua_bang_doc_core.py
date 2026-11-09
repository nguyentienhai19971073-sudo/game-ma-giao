#!/usr/bin/env python3
"""CHUA ONLINE: all gift rituals at centre; small vertical notices under merit board.
Safe and repeatable patch for the user's existing project; never overwrites unrelated files.
"""
from pathlib import Path
import re, shutil, sys

MARK = 'CHUA_RITUAL_GIUA_BANG_DOC_V1'
root = Path.cwd()
if not (root/'src/systems/TikTokEventManager.ts').exists():
    print('❌ Chạy script từ thư mục ~/CHUA_ONLINE_TEST/Chua_Online_3D')
    sys.exit(1)
paths = {
 'events': root/'src/systems/TikTokEventManager.ts',
 'calibration': root/'src/systems/SceneCalibration.ts',
 'seats': root/'src/systems/SeatManager.ts',
 'overlay': root/'src/components/ui/StreamingOverlay.tsx',
}
texts={k:p.read_text(encoding='utf-8') for k,p in paths.items()}
if MARK in texts['events'] and MARK in texts['overlay']:
    print('✅ Bản vá đã cài, không áp dụng lại.')
    sys.exit(0)

def one(s,old,new,title):
    n=s.count(old)
    if n!=1:
        raise RuntimeError(f'{title}: cần 1 đoạn khớp, tìm thấy {n}. KHÔNG ghi file.')
    return s.replace(old,new,1)

# 1. Every gift ceremony (including Xin Xăm) has ONE mutually exclusive, central station.
e=texts['events']
e=one(e,
  '      const candidates = getCandidateStationsForRitual(stationLookupType, seat.side);',
  '      // '+MARK+': each TikTok gift ritual uses the same central carpet altar.\n'
  "      // Xin Xăm keeps its own station ID and bamboo-draw animation, but that station is centered.\n"
  "      // Other social rituals (follow/share) keep their original destinations.\n"
  "      const candidates = item.isGiftCeremony\n"
  "        ? (stationLookupType === 'xin_xam' ? ['xin_xam_station' as const] : ['grand_center' as const])\n"
  "        : getCandidateStationsForRitual(stationLookupType, seat.side);",
  'Điều phối vị trí hành lễ')
# For mappings configured with no animation / seated animation, force a real walk for the 5 canonical groups.
needle='    // Case A: "No animation" — keep character seated without changing pose, play configured sound/visual effect immediately'
assert needle in e
inject="""    // Five CHÙA ONLINE canonical ceremonies must walk to the center even when an older
    // Admin mapping was saved as no_animation / seated_pray. Preserve their mapped sounds/FX.
    const compactTitle = ceremonialTitle.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
      .replace(/đ/gi, 'd').toLowerCase();
    const isCanonicalCenterRitual = [
      'cau binh an', 'cau suc khoe', 'cau gia dao', 'cau tai loc', 'cau cong duc',
    ].some((name) => compactTitle.includes(name));
"""
e=one(e,needle,inject+'\n'+needle,'Phân loại năm nghi lễ')
e=one(e,
"    if (mapping.ritualType === 'no_animation' || mapping.characterAnimation === 'none') {",
"    if (!isCanonicalCenterRitual && (mapping.ritualType === 'no_animation' || mapping.characterAnimation === 'none')) {",
'Đi bộ thay vì không hoạt hình')
e=one(e,
"    else if (mapping.characterAnimation === 'seated_pray' || mapping.ritualType === 'seat_prayer') {",
"    else if (!isCanonicalCenterRitual && (mapping.characterAnimation === 'seated_pray' || mapping.ritualType === 'seat_prayer')) {",
'Đi bộ thay vì ngồi một chỗ')
e=one(e,
'        type: mapping.ritualType,\n        characterAnimation: mapping.characterAnimation,',
"        type: isCanonicalCenterRitual && (mapping.ritualType === 'no_animation' || mapping.ritualType === 'seat_prayer')\n"
"          ? 'altar_pray_clasped' : mapping.ritualType,\n"
"        characterAnimation: isCanonicalCenterRitual && (mapping.characterAnimation === 'none' || mapping.characterAnimation === 'seated_pray')\n"
"          ? 'walk_kneel_pray' : mapping.characterAnimation,",
'Giữ động tác hành lễ')
e=e.replace('        originX: -3.55,\n        originZ: -9.05,',
"        originX: getActiveAltarStation('xin_xam_station').x,\n        originZ: getActiveAltarStation('xin_xam_station').z - 0.25,")
texts['events']=e
# 2. The Xin Xăm bamboo station moves to the same X/Z as the existing Cầu Công Đức station.
c=texts['calibration']
c=one(c,
'xin_xam_station: { dx: -3.05, dz: 0.42, faceRotY: Math.PI + 0.28, side: \'left\' },',
"xin_xam_station: { dx: 0, dz: 0.48, faceRotY: Math.PI, side: 'center' }, // " + MARK,
'Chuyển trạm Xin Xăm nền ảnh về chính giữa')
texts['calibration']=c
s=texts['seats']
s=one(s,
"xin_xam_station: { id: 'xin_xam_station', x: -3.28, z: -8.92, faceRotY: Math.PI * 0.88 },",
"xin_xam_station: { id: 'xin_xam_station', x: 0.0, z: -8.12, faceRotY: Math.PI }, // " + MARK,
'Chuyển trạm Xin Xăm chế độ 3D về chính giữa')
texts['seats']=s
# 3. Move both regular ceremony announcements and fortune-result notices to a narrow vertical lane below the Leaderboard.
o=texts['overlay']
center_pattern=re.compile(r'(?m)^      <CenterCeremonialPanel\n[\s\S]*?^      />\n')
fortune_pattern=re.compile(r'(?m)^      <XinXamResultPanel\n[\s\S]*?^      />\n')
mc=center_pattern.findall(o)
mf=fortune_pattern.findall(o)
if len(mc)!=1 or len(mf)!=1: raise RuntimeError(f'Không tìm được chính xác bảng thông báo ({len(mc)}, {len(mf)})')
center=mc[0].strip()
fortune=mf[0].strip()
o=o.replace(mc[0],'',1).replace(mf[0],'',1)
# Move existing event toast too; retain existing center/notification conditions.
pattern=re.compile(r'(?m)^        \{/\* Optional Compact Edge Event Notification Panel[^\n]*\*/\}\n[\s\S]*?^        \)}\n')
mm=pattern.findall(o)
if len(mm)!=1: raise RuntimeError(f'Không tìm được thông báo sự kiện ({len(mm)})')
oldtoast_source=mm[0]
oldtoast=oldtoast_source.replace('className="', 'className="chua-ritual-small-toast ', 1)
# Remove toast from old bottom location, insert it within the left column.
o=o.replace(oldtoast_source,'',1)
old_left='            <div>\n              {overlaySettings.showLeaderboard && ('
new_left='            <div className="chua-ritual-left-column flex flex-col items-start gap-1">\n              {overlaySettings.showLeaderboard && ('
o=one(o,old_left,new_left,'Cột trái dưới Công Đức')
o=one(o,
    '{(overlaySettings.showLeaderboard || overlaySettings.showGiftPanel) && (',
    '{(overlaySettings.showLeaderboard || overlaySettings.showGiftPanel || Boolean(activeCenterAnnouncement) || Boolean(activeXinXamResult) || (overlaySettings.showNotifications && notifications.length > 0)) && (',
    'Giữ thông báo ngay cả khi bảng Công Đức bị ẩn')
# Insert stacked notices before the closing div of leaderboard container, preserving the exact Leaderboard props.
leftend=re.compile(r'(              \{overlaySettings\.showLeaderboard && \(\n\s*<Leaderboard[\s\S]*?\n\s*/>\n\s*\)\}\n)(\s*</div>)')
ml=leftend.search(o)
if not ml: raise RuntimeError('Không xác định được cuối bảng Công Đức')
# CSS wrapper will dock both existing panels (their normal absolute positioning is overridden only in this column).
block='''              {/* CHUA_RITUAL_GIUA_BANG_DOC_V1: compact portrait notices, never cover center aisle */}
              <div className="chua-ritual-notice-column flex flex-col gap-1 w-[142px] max-w-[40vw]">
'''
block+='\n'.join('                '+line for line in center.splitlines())+'\n'
block+='\n'.join('                '+line for line in fortune.splitlines())+'\n'
block+='\n'.join('    '+line for line in oldtoast.strip().splitlines())+'\n'
block+='              </div>\n'
o=o[:ml.start()]+ml.group(1)+block+ml.group(2)+o[ml.end():]
# Import the scoped stylesheet from this React component. CSS class changes in earlier patches remain untouched.
cssimport="import '../../chua-ritual-left-notices.css';"
if cssimport not in o:
    idx=o.find('\n')
    o=o[:idx+1]+cssimport+'\n'+o[idx+1:]
texts['overlay']=o

css=r'''/* CHUA_RITUAL_GIUA_BANG_DOC_V1 — Scoped to the notification column below BẢNG CÔNG ĐỨC */
/* Override the old fixed CENTER popups only when they are inside the left column. */
.chua-ritual-left-column { min-width: 0; flex-shrink: 0; max-width: 44%; }
.chua-ritual-notice-column { width: min(142px, 40vw); min-width: 0; align-items: stretch; }
.chua-ritual-notice-column > [role="status"] {
  position: relative !important;
  inset: auto !important;
  top: auto !important;
  left: auto !important;
  right: auto !important;
  bottom: auto !important;
  width: 100% !important;
  height: auto !important;
  max-width: none !important;
  min-width: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  transform: none !important;
  display: flex !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
}
.chua-ritual-notice-column > [role="status"] > div {
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  min-width: 0 !important;
  transform: none !important;
  transform-origin: top left !important;
}
.chua-ritual-notice-column > [role="status"] > div > div.fortune-result-card {
  max-height: min(38vh, 350px) !important;
  padding: 5px 6px !important;
}
/* Portrait gift/ceremony card: avatar above; name/title/description stacked and centered. */
.chua-ritual-notice-column > [role="status"] > div > div.flex.items-center {
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 2px !important;
  padding-top: 5px;
}
.chua-ritual-notice-column > [role="status"] > div > div.flex.items-center > div:last-child {
  width: 100%;
  text-align: center !important;
}
.chua-ritual-notice-column > [role="status"] p.truncate {
  white-space: normal !important;
  overflow-wrap: anywhere;
  overflow: visible !important;
  text-overflow: clip !important;
}
.chua-ritual-notice-column > [role="status"] p { max-width: 100%; text-align: center; }
/* Let fortune category wrap on narrow portrait cards, keeping all text available. */
.chua-ritual-notice-column > [role="status"] .whitespace-nowrap { white-space: normal !important; }
.chua-ritual-notice-column > [role="status"] .flex.items-baseline { flex-wrap: wrap; justify-content: center; }
.chua-ritual-notice-column > [role="status"] .fortune-result-card p { text-align: left; }
.chua-ritual-notice-column .chua-ritual-small-toast { width: 100% !important; max-width: 100% !important; transform: none !important; text-align: center; }
.chua-ritual-notice-column .chua-ritual-small-toast p { white-space: normal !important; overflow-wrap: anywhere; text-align: center; }
'''
# Only write AFTER all four file transformations have succeeded.
for key,p in paths.items():
    original=p.read_text(encoding='utf-8')
    if texts[key] != original:
        backup=p.with_name(p.name+'.before_ceremonies_center_20261102.bak')
        if not backup.exists(): shutil.copy2(p,backup)
        p.write_text(texts[key], encoding='utf-8')
csspath=root/'src/chua-ritual-left-notices.css'
csspath.write_text(css,encoding='utf-8')
print('✅ Đã chuyển các nghi lễ quà ra trung tâm, đảm bảo xếp hàng không chồng lên nhau.')
print('✅ Xin Xăm giữ động tác rút quẻ nhưng đứng tại giữa thảm.')
print('✅ Thông báo quà, thông báo sự kiện và kết quả Xin Xăm xếp dọc dưới BẢNG CÔNG ĐỨC.')
print('✅ Không thay đổi Gift ID / công đức / TTS / thời gian hành lễ.')
