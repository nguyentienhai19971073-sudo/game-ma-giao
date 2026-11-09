import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Participant, SceneCalibrationSettings } from '../../types/temple';
import { TOTAL_MAIN_MATS } from '../../systems/SeatManager';
import { getImageCalibratedSeatPosition } from '../../systems/SceneCalibration';

/**
 * Permanent congregation prayer cushions in IMAGE BACKGROUND mode.
 * The existing procedural temple already renders its own fixed mats;
 * mounting this only in image mode avoids duplicated cushions.
 *
 * The base 90 cushions never disappear when a worshipper walks to the altar
 * or leaves the LIVE. Temporary overflow positions also get a cushion while
 * they are assigned, without changing the existing seat coordinates.
 */
export function FixedPrayerMats({
  sceneCalibration,
  participants,
}: {
  sceneCalibration: SceneCalibrationSettings;
  participants: Participant[];
}) {
  const frameRef = useRef<THREE.InstancedMesh>(null);
  const cushionRef = useRef<THREE.InstancedMesh>(null);


  // V17: strictly 90 permanent cushions. Overflow users remain virtual until a seat frees up.
  // Keep participants as a public prop to preserve the calling interface without rendering extras.
  void participants;
  const seatIndexes = useMemo(
    () => Array.from({ length: TOTAL_MAIN_MATS }, (_, idx) => idx),
    [],
  );
  useLayoutEffect(() => {
    if (!frameRef.current || !cushionRef.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < seatIndexes.length; i++) {
      const seat = getImageCalibratedSeatPosition(seatIndexes[i], sceneCalibration);
      dummy.rotation.set(0, 0, 0);
      // TINH_TAM_V172_BUDDHA_TOP_THIRD: keep all 90 cushions equally sized in screen-space.
      // Without depth compensation, front-row mats become huge and overlap.
      const seatDepthScale = THREE.MathUtils.clamp((26.2 - seat.z) / 26.5, 0.34, 1.05);
      dummy.scale.set(seatDepthScale, 1, seatDepthScale);
      dummy.position.set(seat.x, 0.015, seat.z);
      dummy.updateMatrix();
      frameRef.current.setMatrixAt(i, dummy.matrix);

      dummy.position.set(seat.x, 0.034, seat.z);
      dummy.updateMatrix();
      cushionRef.current.setMatrixAt(i, dummy.matrix);
    }
    frameRef.current.count = seatIndexes.length;
    cushionRef.current.count = seatIndexes.length;
    frameRef.current.instanceMatrix.needsUpdate = true;
    cushionRef.current.instanceMatrix.needsUpdate = true;
    frameRef.current.computeBoundingSphere();
    cushionRef.current.computeBoundingSphere();
  }, [seatIndexes, sceneCalibration]);

  // Instancing gives two draw calls for all 90 permanent cushions.
  const capacity = TOTAL_MAIN_MATS;
  return (
    <group name="fixed-prayer-mats" renderOrder={1}>
      <instancedMesh ref={frameRef} args={[undefined, undefined, capacity]} receiveShadow>
        <cylinderGeometry args={[0.245, 0.245, 0.024, 20]} />
        <meshStandardMaterial color="#cda36a" metalness={0.12} roughness={0.78} />
      </instancedMesh>
      <instancedMesh ref={cushionRef} args={[undefined, undefined, capacity]} receiveShadow>
        <cylinderGeometry args={[0.205, 0.205, 0.026, 20]} />
        <meshStandardMaterial color="#9e342d" roughness={0.87} metalness={0.01} />
      </instancedMesh>
    </group>
  );
}
