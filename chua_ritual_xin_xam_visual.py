#!/usr/bin/env python3
"""Move both 3D Xin Xam bamboo stands physically to the central ceremonial aisle.
Compatible with an existing installation of the prior center-ceremony patch.
"""
from pathlib import Path
import argparse
import shutil
import sys

MARK = 'CHUA_XIN_XAM_TRU_GIUA_V2'
parser = argparse.ArgumentParser()
parser.add_argument('--check', action='store_true', help='Validate target source without editing')
args = parser.parse_args()
root = Path.cwd()

paths = {
    '3d': root / 'src/components/three/BuddhaAltar.tsx',
    'image': root / 'src/components/three/TempleScene.tsx',
}
if any(not p.is_file() for p in paths.values()):
    print('❌ Không tìm thấy source CHÙA ONLINE 3D tại thư mục hiện tại. Chưa chỉnh file.')
    sys.exit(1)

originals = {k: p.read_text(encoding='utf-8') for k, p in paths.items()}

def one(s: str, old: str, new: str, title: str) -> str:
    n = s.count(old)
    if n != 1:
        raise RuntimeError(f'{title}: cần 1 vị trí khớp, tìm được {n}. Không ghi file.')
    return s.replace(old, new, 1)

try:
    # Both modes need visual movement, not merely changing the pathfinding station.
    # altar parent local z -12.4; z+3.12 gives -9.28, i.e. ~1.16m behind
    # grand_center ritual at z=-8.12. Cushion is placed at the kneeling position.
    altar = originals['3d']
    if MARK not in altar:
        altar = one(altar,
            '          SEPARATE 3D XIN XĂM RITUAL STATION (Bàn Xin Xăm Cầu Nguyện — Left Sanctuary x = -3.82)\n'
            '          Symmetrical counterpart to the Bronze Bell Stand; characters kneel at (-3.28, -8.92)\n'
            '          without ever walking into the elevated Buddha statue!',
            '          '+MARK+' — Move the physical fortune stand to central sanctuary x=0.\n'
            '          Keep its container BEHIND the kneeling character at grand_center (0,-8.12),\n'
            '          so it never blocks the central offering animations.',
            'Chú thích vị trí trụ 3D')
        # Earlier terminal guidance may already have changed the X position manually.
        # Still update cushion/annotation instead of treating that as a conflict.
        if '      <group position={[-3.82, 0, 3.12]}>' in altar:
            altar = one(altar,
                '      <group position={[-3.82, 0, 3.12]}>',
                '      <group position={[0, 0, 3.12]}>',
                'Vị trí trụ Xin Xăm ở cảnh 3D')
        elif '      <group position={[0, 0, 3.12]}>' not in altar:
            raise RuntimeError('Vị trí trụ 3D đã được tùy chỉnh khác; dừng để tránh ghi nhầm.')
        altar = one(altar,
            '        {/* Crimson & Gold Kneeling Cushion for Xin Xăm Worshipper (at world x = -3.28, z = -8.92) */}\n'
            '        <group position={[0.54, 0.02, 0.36]}>',
            '        {/* Kneeling cushion on the central carpet, in front of the fortune tube. */}\n'
            '        <group position={[0, 0.02, 1.16]}>',
            'Vị trí đệm quỳ trước trụ Xin Xăm')

    # Image background mode uses a different 3D model and does NOT mount BuddhaAltar.
    # Its place must be anchored on the centered xin_xam_station, behind the worshipper.
    scene = originals['image']
    if MARK not in scene:
        scene = one(scene,
            '      {/* Compact Floor-Level 3D Xin Xăm Bamboo Fortune Stand on the Left Wing (No duplicate Buddha!) */}\n'
            '      <group position={[xinXamStation.x - 0.36, 0, xinXamStation.z - 0.42]}>',
            '      {/* '+MARK+': central physical fortune stand (also in image background mode).\n'
            '          Keep it behind the central kneeling point, leaving room for worshipper. */}\n'
            '      <group position={[xinXamStation.x, 0, xinXamStation.z - 1.12]}>',
            'Vị trí trụ Xin Xăm khi dùng ảnh nền')
    edits = {'3d': altar, 'image': scene}
    changed = [k for k in paths if edits[k] != originals[k]]
    if args.check:
        print('✅ Mã nguồn tương thích; cần chỉnh:', ', '.join(changed) if changed else 'không (đã cài)')
        sys.exit(0)
    for key in changed:
        p = paths[key]
        backup = p.with_name(p.name + '.before_xin_xam_tru_giua_v2.bak')
        if not backup.exists():
            shutil.copy2(p, backup)
        p.write_text(edits[key], encoding='utf-8')
    if not changed:
        print('✅ Trụ Xin Xăm đã được chuyển vào trung tâm. Không sửa lại.')
    else:
        print('✅ Đã chuyển trụ Xin Xăm 3D về giữa và đặt đệm quỳ đúng vị trí.')
        print('✅ Đã chuyển trụ Xin Xăm trong chế độ ảnh nền về giữa.')
        print('✅ Giữ nguyên kích thước, mô hình trụ, hiệu ứng quẻ, âm thanh và Gift ID.')
except Exception as exc:
    print('❌', exc)
    sys.exit(1)
