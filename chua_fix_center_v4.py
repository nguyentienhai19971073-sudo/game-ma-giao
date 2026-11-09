#!/usr/bin/env python3
"""V4: all mapped gift ceremonies MUST walk the central aisle; physically center the Xin Xam stand.
Only edit known code locations, backup first, verify source before writing, idempotent.
"""
from pathlib import Path
import shutil, sys

root = Path.cwd()
mark = 'CHUA_GIFT_CENTER_FORCE_ALL_V4'
paths = {
    'events': root/'src/systems/TikTokEventManager.ts',
    'seats': root/'src/systems/SeatManager.ts',
    'calibration': root/'src/systems/SceneCalibration.ts',
    'altar': root/'src/components/three/BuddhaAltar.tsx',
    'scene': root/'src/components/three/TempleScene.tsx',
}
for name,p in paths.items():
    if not p.is_file():
        sys.exit(f'❌ Không tìm thấy {p.relative_to(root)}. Chưa sửa file nào.')
orig = {key:p.read_text(encoding='utf8') for key,p in paths.items()}
updated = orig.copy()

def one(s, old, new, title):
    n = s.count(old)
    if n != 1:
        raise ValueError(f'{title}: cần 1 điểm sửa, tìm thấy {n}. KHÔNG sửa file.')
    return s.replace(old,new,1)

try:
    # Walk ALL configured gift rituals, regardless of customized Vietnamese title and old no_animation / seat_prayer mapping.
    e=updated['events']
    if mark not in e:
        start_candidates = [
            e.find('    // Five CHÙA ONLINE canonical ceremonies must walk to the center',e.find('private executeGiftCeremonyAndEffects(')),
            e.find('    // Case A: "No animation"',e.find('private executeGiftCeremonyAndEffects(')),
        ]
        starts = [x for x in start_candidates if x>=0]
        if not starts:
            raise ValueError('Không tìm được đoạn điều khiển chuyển động quà tặng (event manager).')
        start = min(starts)
        end = e.find('\n    this.prominentGiftBanner = null;', start)
        if end<0:
            raise ValueError('Không tìm được cuối xử lý nghi lễ quà tặng.')
        # All gift events with a configured mapping now enter the ceremony queue,
        # regardless of saved admin ritualTitle and animation settings.
        new_block=f'''    // {mark}: ALWAYS walk to the central altar for every configured gift ritual.
    // No-animation/seated mappings are promoted to walking prayer, keeping their configured sound/FX.
    // Dedicated Xin Xăm gift IDs are handled by triggerXinXamForUser() above.
    const walkRitualType: RitualActionType =
      mapping.ritualType === 'no_animation' ||
      mapping.ritualType === 'seat_prayer' ||
      mapping.ritualType === 'seat_wooden_fish'
        ? 'altar_pray_clasped'
        : mapping.ritualType;
    const walkCharacterAnimation: GiftCharacterAnimType =
      !mapping.characterAnimation ||
      mapping.characterAnimation === 'none' ||
      mapping.characterAnimation === 'seated_pray'
        ? 'walk_kneel_pray'
        : mapping.characterAnimation;

    this.enqueueAltarRitual({{
      userId: participant.userId,
      giftId: mapping.giftId,
      giftName: ceremonialTitle,
      type: walkRitualType,
      characterAnimation: walkCharacterAnimation,
      customEffect: mapping.effect,
      customSound: mapping.soundEffect,
      awardedPoints,
      isDemo: params.isDemo,
      label: `${{ritualDisplayVi}} · ${{ceremonialTitle}}`,
      ceremonyBadgeTitle: badgeLabel,
      offeringLabel: ritualDisplayVi,
      spokenText: params.spokenText,
      playBellBeforeSpeech: params.playBellBeforeSpeech,
      isLargeCeremony: isLarge,
      isGiftCeremony: true,
      priorityOverride: mapping.voicePriority,
      durationMs,
    }});
'''
        e=e[:start]+new_block+e[end:]
        # remove no longer needed local seat to avoid unused lint (ts compiler allows unused but clean).
        # The event manager may have other references to seat, so only touch the local one inside method.
        methodstart = e.index('private executeGiftCeremonyAndEffects(')
        methodend = e.index('    this.prominentGiftBanner = null;',methodstart)
        before = e[:methodstart]
        method = e[methodstart:methodend]
        method=method.replace('    const seat = getSeatPosition(participant.seatIndex);\n','',1)
        e=before+method+e[methodend:]
        updated['events']=e

    # Guard: same physical altar station for every mapped gift, serialized by isStationAvailable().
    required_snippet="item.isGiftCeremony\n        ? (stationLookupType === 'xin_xam' ? ['xin_xam_station' as const] : ['grand_center' as const])"
    if required_snippet not in updated['events']:
        old='      const candidates = getCandidateStationsForRitual(stationLookupType, seat.side);'
        new=("      const candidates = item.isGiftCeremony\n"
             "        ? (stationLookupType === 'xin_xam' ? ['xin_xam_station' as const] : ['grand_center' as const])\n"
             "        : getCandidateStationsForRitual(stationLookupType, seat.side);")
        updated['events']=one(updated['events'],old,new,'Điều phối tất cả nghi lễ vào giữa')

    # Make collision-safe stations central for both scene modes.
    seats=updated['seats']
    old="xin_xam_station: { id: 'xin_xam_station', x: -3.28, z: -8.92, faceRotY: Math.PI * 0.88 },"
    new="xin_xam_station: { id: 'xin_xam_station', x: 0.0, z: -8.12, faceRotY: Math.PI }, // CHUA_XIN_XAM_CENTRAL_V4"
    if old in seats: seats=one(seats,old,new,'Trạm Xin Xăm 3D')
    elif "xin_xam_station: { id: 'xin_xam_station', x: 0.0, z: -8.12, faceRotY: Math.PI }" not in seats:
        raise ValueError('Không xác định được trạm Xin Xăm 3D, không ghi file.')
    updated['seats']=seats
    cal=updated['calibration']
    old="xin_xam_station: { dx: -3.05, dz: 0.42, faceRotY: Math.PI + 0.28, side: 'left' },"
    new="xin_xam_station: { dx: 0, dz: 0.48, faceRotY: Math.PI, side: 'center' }, // CHUA_XIN_XAM_CENTRAL_V4"
    if old in cal: cal=one(cal,old,new,'Trạm Xin Xăm nền ảnh')
    elif "xin_xam_station: { dx: 0, dz: 0.48, faceRotY: Math.PI, side: 'center' }" not in cal:
        raise ValueError('Không xác định được trạm Xin Xăm ảnh nền, không ghi file.')
    updated['calibration']=cal

    # THREE object itself, not just its destination coordinate. Supports old and already-patched V2.
    altar=updated['altar']
    old='      <group position={[-3.82, 0, 3.12]}>'
    new='      <group position={[0, 0, 3.12]}>'
    if old in altar: altar=one(altar,old,new,'Trụ Xin Xăm trong chùa 3D')
    elif new not in altar: raise ValueError('Không tìm thấy mô hình trụ Xin Xăm 3D.')
    old='        <group position={[0.54, 0.02, 0.36]}>'
    new='        <group position={[0, 0.02, 1.16]}>'
    if old in altar: altar=one(altar,old,new,'Đệm quỳ Xin Xăm 3D')
    elif new not in altar: raise ValueError('Không tìm thấy đệm quỳ Xin Xăm 3D.')
    updated['altar']=altar

    scene=updated['scene']
    old='      <group position={[xinXamStation.x - 0.36, 0, xinXamStation.z - 0.42]}>'
    new='      <group position={[xinXamStation.x, 0, xinXamStation.z - 1.12]}>'
    if old in scene: scene=one(scene,old,new,'Trụ Xin Xăm trong cảnh ảnh nền')
    elif new not in scene: raise ValueError('Không tìm thấy mô hình trụ Xin Xăm ảnh nền.')
    updated['scene']=scene

    # Validate changed content before writing a single file.
    assert mark in updated['events']
    assert "item.isGiftCeremony" in updated['events']
    assert '      <group position={[0, 0, 3.12]}>' in updated['altar']
    assert '      <group position={[xinXamStation.x, 0, xinXamStation.z - 1.12]}>' in updated['scene']
    assert "xin_xam_station: { dx: 0, dz: 0.48" in updated['calibration']
    assert "xin_xam_station: { id: 'xin_xam_station', x: 0.0, z: -8.12" in updated['seats']
    changed=[key for key,p in paths.items() if updated[key] != orig[key]]
    for key in changed:
        p=paths[key]
        b=p.with_name(p.name+'.before_center_v4.bak')
        if not b.exists(): shutil.copy2(p,b)
    for key in changed:
        paths[key].write_text(updated[key],encoding='utf8')
    print('✅ Đã sửa:', ', '.join(paths[k].relative_to(root).as_posix() for k in changed) or '(đã sửa trước đó)')
    print('✅ Mọi quà được gán nghi lễ đều đi ra giữa, bất kể tên nghi lễ hay kiểu hoạt hình đã lưu.')
    print('✅ Trụ và đệm Xin Xăm nằm tại tâm chùa, cả cảnh ảnh nền lẫn cảnh 3D.')
    print('✅ Giữ nguyên âm thanh/hiệu ứng từng Gift ID; xếp hàng khi trạm trung tâm đang bận.')
    print('ℹ️ Quà CHƯA GÁN Gift ID vào nghi lễ sẽ không tự kích hoạt lễ.')
except Exception as ex:
    sys.exit(f'❌ {ex}')
