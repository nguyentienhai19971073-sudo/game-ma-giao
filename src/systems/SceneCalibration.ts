import * as THREE from 'three';
import {
  AltarStationId,
  DEFAULT_SCENE_CALIBRATION,
  SceneCalibrationSettings,
} from '../types/temple';

export const SCENE_CALIBRATION_STORAGE_KEY = 'chua_online_scene_calibration_v1';

/**
 * Calibrated 9:16 perspective landmarks measured directly from `/public/assets/temple-background.png` (1080x1920):
 * - Chandelier: y = 0% .. 11%
 * - Golden Buddha Halo + Head + Body: y = 10.5% .. 39.0%, x = 22% .. 78%
 * - Golden Lotus Pedestal: y = 39.0% .. 45.2%
 * - Carved Wooden Offering Altar: y = 45.2% .. 60.4% (ndcY = +0.096 .. -0.208), x = 13% .. 87%
 * - Top of Red Carpet / Base of Wooden Altar: y = 60.4% (ndcY = -0.208), carpet x = 37.5% .. 62.5% (|ndcX| = 0.250)
 * - Bottom of Red Carpet at y = 100% (ndcY = -1.000): carpet x = 9.5% .. 90.5% (|ndcX| = 0.810)
 * - Vanishing point of horizontal floor rails: (0, ndcY = +0.145), right behind the Lotus Pedestal.
 */
export const IMAGE_BG_CAMERA_BASE = {
  posX: 0,
  posY: 4.84,
  posZ: 26.2,
  lookAtX: 0,
  lookAtY: -1.05, // TINH_TAM_V172_BUDDHA_TOP_THIRD: project altar to upper ~39% of portrait viewport
  lookAtZ: 0,
  baseFov916: 42,
  /** World Z where the wooden offering altar meets the floor (yPct = 60.4%, ndcY = -0.209) */
  altarFloorEdgeZ: -9.15,
  /** World half-width of the central red carpet (matches |ndcX| = 0.248 at z=-9.15 and |ndcX| = 0.78 at z=+15.1) */
  carpetHalfWidth: 0.22, // TINH_TAM_V179_LOI_DI_THANG: lối đi giữa thật hẹp
} as const;

export interface CalibratedAltarStation {
  id: AltarStationId;
  x: number;
  z: number;
  faceRotY: number;
  side: 'left' | 'right' | 'center';
}

export interface CalibratedSeatCoord {
  seatIndex: number;
  x: number;
  z: number;
  aisleZ: number;
  row: number;
  col: number;
  side: 'left' | 'right';
  isOverflow: boolean;
}

const IMAGE_SEAT_COLS_PER_SIDE = 4;
const IMAGE_TOTAL_MAIN_MATS = 80; // V17: 45 left + 45 right, exactly 90 visible positions

/**
 * 12 perspective-tapered row tiers per wing (45 seats/side × 2 = 90 main seats).
 * Upper/mid hall rows use 5 -> 4 -> 3 columns on the wide golden tiles; foreground rows where
 * the red carpet widens toward the bottom of the 9:16 frame taper cleanly to 2 -> 1 column.
 */
// TINH_TAM_V183_80_GHE_DEU: 10 hàng, 8 ghế mỗi hàng (4 trái + 4 phải).
// Một hệ lưới, không chia nhóm 3/4 cột; khoảng cách theo màn hình 9:16 đều nhau.
const IMAGE_PERSPECTIVE_SEAT_TIERS: ReadonlyArray<{ baseZ: number; cols: number }> = [
  { baseZ: -4.5, cols: 4 },
  { baseZ: 1.0, cols: 4 },
  { baseZ: 5.3, cols: 4 },
  { baseZ: 8.6, cols: 4 },
  { baseZ: 11.1, cols: 4 },
  { baseZ: 13.1, cols: 4 },
  { baseZ: 14.6, cols: 4 },
  { baseZ: 15.9, cols: 4 },
  { baseZ: 17.0, cols: 4 },
  { baseZ: 17.9, cols: 4 },
];

function clampNum(val: unknown, fallback: number, min: number, max: number): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Number(n.toFixed(3))));
}

export function sanitizeSceneCalibration(
  raw?: Partial<SceneCalibrationSettings> | null,
): SceneCalibrationSettings {
  if (!raw) return { ...DEFAULT_SCENE_CALIBRATION };
  return {
    sceneMode: raw.sceneMode === 'original_3d' ? 'original_3d' : 'image_background',
    backgroundUrl: '/assets/temple-background-v179-straight.webp',
    bgScale: clampNum(raw.bgScale, DEFAULT_SCENE_CALIBRATION.bgScale, 0.85, 1.35),
    bgOffsetX: clampNum(raw.bgOffsetX, DEFAULT_SCENE_CALIBRATION.bgOffsetX, -20, 20),
    bgOffsetY: clampNum(raw.bgOffsetY, DEFAULT_SCENE_CALIBRATION.bgOffsetY, -20, 20),
    cameraZoom: clampNum(raw.cameraZoom, DEFAULT_SCENE_CALIBRATION.cameraZoom, 0.75, 1.35),
    seatWidthScale: clampNum(
      raw.seatWidthScale,
      DEFAULT_SCENE_CALIBRATION.seatWidthScale,
      0.7,
      1.35,
    ),
    seatDepthScale: clampNum(
      raw.seatDepthScale,
      DEFAULT_SCENE_CALIBRATION.seatDepthScale,
      0.7,
      1.3,
    ),
    seatOffsetZ: clampNum(raw.seatOffsetZ, DEFAULT_SCENE_CALIBRATION.seatOffsetZ, -2.5, 2.5),
    nearCharacterScale: clampNum(
      raw.nearCharacterScale,
      DEFAULT_SCENE_CALIBRATION.nearCharacterScale,
      0.6,
      1.55,
    ),
    farCharacterScale: clampNum(
      raw.farCharacterScale,
      DEFAULT_SCENE_CALIBRATION.farCharacterScale,
      0.45,
      1.35,
    ),
    entranceZ: clampNum(raw.entranceZ, DEFAULT_SCENE_CALIBRATION.entranceZ, 11.5, 17.5),
    altarStationZ: clampNum(
      raw.altarStationZ,
      DEFAULT_SCENE_CALIBRATION.altarStationZ,
      -8.95,
      -6.8,
    ),
    altarStationSpreadX: clampNum(
      raw.altarStationSpreadX,
      DEFAULT_SCENE_CALIBRATION.altarStationSpreadX,
      0.65,
      1.35,
    ),
    showAlignmentGuides: Boolean(raw.showAlignmentGuides),
  };
}

export function loadPersistedSceneCalibration(): SceneCalibrationSettings {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_SCENE_CALIBRATION };
  }
  try {
    const raw = window.localStorage.getItem(SCENE_CALIBRATION_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SCENE_CALIBRATION };
    const parsed = JSON.parse(raw) as Partial<SceneCalibrationSettings>;
    return sanitizeSceneCalibration(parsed);
  } catch {
    return { ...DEFAULT_SCENE_CALIBRATION };
  }
}

export function savePersistedSceneCalibration(settings: SceneCalibrationSettings): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const clean = sanitizeSceneCalibration(settings);
    window.localStorage.setItem(SCENE_CALIBRATION_STORAGE_KEY, JSON.stringify(clean));
  } catch {
    // Ignore storage quota errors
  }
}

export function resetPersistedSceneCalibration(): SceneCalibrationSettings {
  const fresh = { ...DEFAULT_SCENE_CALIBRATION };
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(SCENE_CALIBRATION_STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // Ignore storage quota errors
    }
  }
  setActiveSceneCalibration(fresh);
  return fresh;
}

// Reactive singleton calibration state used across SeatManager, TikTokEventManager, WorshipperCharacter & TempleScene
let activeCalibration: SceneCalibrationSettings = loadPersistedSceneCalibration();
const calibrationListeners = new Set<(cal: SceneCalibrationSettings) => void>();

export function getActiveSceneCalibration(): SceneCalibrationSettings {
  return activeCalibration;
}

export function setActiveSceneCalibration(next: Partial<SceneCalibrationSettings>): SceneCalibrationSettings {
  activeCalibration = sanitizeSceneCalibration({
    ...activeCalibration,
    ...next,
  });
  for (const listener of calibrationListeners) {
    listener(activeCalibration);
  }
  return activeCalibration;
}

export function subscribeSceneCalibration(
  listener: (cal: SceneCalibrationSettings) => void,
): () => void {
  calibrationListeners.add(listener);
  return () => {
    calibrationListeners.delete(listener);
  };
}

/**
 * Configures a THREE.PerspectiveCamera to match the exact 9:16 perspective of `temple-background.png`,
 * respecting cameraZoom as well as wide-aspect safety if vertical916 is toggled off.
 */
export function configureImageBackgroundCamera(
  cam: THREE.PerspectiveCamera,
  aspect = 9 / 16,
  cal: SceneCalibrationSettings = activeCalibration,
): void {
  const safeAspect = Math.max(0.42, aspect);
  const zoom = Math.max(0.75, Math.min(1.35, cal.cameraZoom || 1.0));
  const targetAspect = 9 / 16;

  let vFovDeg = IMAGE_BG_CAMERA_BASE.baseFov916 / zoom;

  if (safeAspect < targetAspect) {
    const baseTan = Math.tan(THREE.MathUtils.degToRad(vFovDeg / 2));
    const expandedTan = (baseTan * targetAspect) / safeAspect;
    vFovDeg = Math.min(68, THREE.MathUtils.radToDeg(2 * Math.atan(expandedTan)));
  }

  cam.position.set(
    IMAGE_BG_CAMERA_BASE.posX,
    IMAGE_BG_CAMERA_BASE.posY,
    IMAGE_BG_CAMERA_BASE.posZ,
  );
  cam.fov = vFovDeg;
  cam.aspect = safeAspect;
  cam.near = 0.25;
  cam.far = 110;
  cam.lookAt(
    IMAGE_BG_CAMERA_BASE.lookAtX,
    IMAGE_BG_CAMERA_BASE.lookAtY,
    IMAGE_BG_CAMERA_BASE.lookAtZ,
  );
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
}

/**
 * Computes the horizontal world half-width of the visible 9:16 floor at world Z
 * so seated worshippers never clip outside the left/right edges of the livestream frame.
 */
function computeSafeFloorMaxXAtZ(
  z: number,
  cal: SceneCalibrationSettings,
  maxAbsNdcX = 0.875,
): number {
  const zoom = Math.max(0.75, Math.min(1.35, cal.cameraZoom || 1.0));
  const vFovRad = THREE.MathUtils.degToRad(IMAGE_BG_CAMERA_BASE.baseFov916 / zoom);
  const tanH = (9 / 16) * Math.tan(vFovRad / 2);
  // V17.2: use real pitched-camera depth, not the old shallow-angle approximation.
  const pitch = Math.atan2(
    IMAGE_BG_CAMERA_BASE.posY - IMAGE_BG_CAMERA_BASE.lookAtY,
    IMAGE_BG_CAMERA_BASE.posZ - IMAGE_BG_CAMERA_BASE.lookAtZ,
  );
  const exactDepth = (IMAGE_BG_CAMERA_BASE.posZ - z) * Math.cos(pitch) +
    IMAGE_BG_CAMERA_BASE.posY * Math.sin(pitch);
  return maxAbsNdcX * Math.max(1, exactDepth) * tanH;
}

/**
 * Computes a perspective-calibrated seat position on the golden lotus floor tiles
 * symmetrically flanking both sides of the red carpet in `temple-background.png`.
 *
 * Guarantees:
 * 1. Never sits on the central red carpet (`|x| >= carpetHalfWidth + 0.24`).
 * 2. Never steps onto the wooden offering altar or Buddha statue (`z >= -7.35`).
 * 3. Extends close to the bottom of the 9:16 screen (`z` up to `+13.3`, ~92% screen height).
 * 4. Every seat stays strictly inside the 9:16 frame (`|ndcX| <= 0.89`) without overlapping neighbors.
 */
export function getImageCalibratedSeatPosition(
  seatIndex: number,
  cal: SceneCalibrationSettings = activeCalibration,
): CalibratedSeatCoord {
  // TINH_TAM_V179_LOI_DI_THANG: ảnh nền 9:16 với lối giữa thật thẳng,
  // nệm sát hai bên, 90 vị trí chia đều hai cánh. Không sửa thuật toán nghi lễ.
  // TINH_TAM_V183_80_GHE_DEU: 10 hàng x 8 ghế, không có dãy cuối bị tách.
  // Khoảng cách giữa các hàng là một hằng số theo tọa độ màn hình 9:16.
  // Không lấy khoảng cách thế giới Z cố định, vì phối cảnh sẽ làm hàng gần bị thưa.
  const carpetClearMinX = IMAGE_BG_CAMERA_BASE.carpetHalfWidth + 0.13;

  if (seatIndex < IMAGE_TOTAL_MAIN_MATS) {
    const side: 'left' | 'right' = seatIndex % 2 === 0 ? 'left' : 'right';
    const sideSlot = Math.floor(seatIndex / 2); // 0..39 mỗi bên
    const row = Math.floor(sideSlot / 4);      // 0..9
    const col = sideSlot % 4;                  // 0..3, từ lối đi ra bên ngoài

    // Tọa độ hàng từ 42.5% đến 91.0% chiều cao khung 9:16.
    // Khoảng cách 5.39%/hàng, KHÔNG có hàng hoặc cụm ghế nào bị bỏ trống.
    const firstSeatY = 0.425;
    const lastSeatY = 0.910;
    const screenY = THREE.MathUtils.lerp(firstSeatY, lastSeatY, row / 9);
    const ndcY = 1 - 2 * screenY;

    // Chiếu ngược tọa độ màn hình lên mặt sàn y=0 của camera hiện tại.
    const pitch = Math.atan2(
      IMAGE_BG_CAMERA_BASE.posY - IMAGE_BG_CAMERA_BASE.lookAtY,
      IMAGE_BG_CAMERA_BASE.posZ - IMAGE_BG_CAMERA_BASE.lookAtZ,
    );
    const sinPitch = Math.sin(pitch);
    const cosPitch = Math.cos(pitch);
    const zoom = THREE.MathUtils.clamp(cal.cameraZoom || 1, 0.75, 1.35);
    const tanHalfV = Math.tan(THREE.MathUtils.degToRad(IMAGE_BG_CAMERA_BASE.baseFov916 / zoom / 2));
    const screenSlope = ndcY * tanHalfV;
    const cameraToSeatZ = IMAGE_BG_CAMERA_BASE.posY *
      (cosPitch + screenSlope * sinPitch) /
      (sinPitch - screenSlope * cosPitch);
    const minZ = Math.max(-7.25, cal.altarStationZ + 0.85);
    const z = THREE.MathUtils.clamp(IMAGE_BG_CAMERA_BASE.posZ - cameraToSeatZ, minZ, 18.25);

    // Bốn cột thẳng hàng mỗi bên và sát đường đi nhỏ; không xếp kiểu xen kẽ.
    const columnNdcX = 0.205 + col * 0.205;
    const viewDepth = (IMAGE_BG_CAMERA_BASE.posZ - z) * cosPitch +
      IMAGE_BG_CAMERA_BASE.posY * sinPitch;
    const tanHalfH = (9 / 16) * tanHalfV;
    const safeMaxX = computeSafeFloorMaxXAtZ(z, cal, 0.89);
    const absX = Math.min(safeMaxX, Math.max(carpetClearMinX, columnNdcX * viewDepth * tanHalfH));
    const x = side === 'left' ? -absX : absX;

    return {
      seatIndex,
      x: Number(x.toFixed(3)),
      z: Number(z.toFixed(3)),
      aisleZ: Number((z + 0.42).toFixed(3)),
      row,
      col,
      side,
      isOverflow: false,
    };
  }

  // Overflow seats (>104): neatly tucked along back/mid wing margins inside 9:16
  const overflowIdx = seatIndex - IMAGE_TOTAL_MAIN_MATS;
  const side: 'left' | 'right' = overflowIdx % 2 === 0 ? 'left' : 'right';
  const sideIdx = Math.floor(overflowIdx / 2);
  const z = Math.max(-6.8, Math.min(6.4, -6.4 + (sideIdx % 10) * 1.32));
  const safeMaxX = computeSafeFloorMaxXAtZ(z, cal, 0.885);
  const absX = Math.max(carpetClearMinX + 0.3, safeMaxX - (Math.floor(sideIdx / 10) % 2) * 0.48);

  return {
    seatIndex,
    x: Number((side === 'left' ? -absX : absX).toFixed(3)),
    z: Number(z.toFixed(3)),
    aisleZ: Number((z + 0.35).toFixed(3)),
    row: IMAGE_PERSPECTIVE_SEAT_TIERS.length + Math.floor(sideIdx / 2),
    col: IMAGE_SEAT_COLS_PER_SIDE,
    side,
    isOverflow: true,
  };
}

/**
 * Computes calibrated altar ritual stations positioned right in front of the carved wooden altar
 * (`yPct ≈ 61.5%..65%` on screen, `z ≈ -8.15 .. -7.45`), aligned with the painted incense burner,
 * lotus lamps, fruit bowls, pink lotus vases, bronze bell side, and left Xin Xăm bamboo stand.
 * Characters NEVER walk onto the wooden altar (`z < -9.05`) or cover the Golden Buddha!
 */
export function getImageCalibratedAltarStation(
  stationId: AltarStationId,
  cal: SceneCalibrationSettings = activeCalibration,
): CalibratedAltarStation {
  const baseZ = Math.max(-8.85, Math.min(-6.8, cal.altarStationZ ?? -8.15));
  const spread = cal.altarStationSpreadX ?? 1.0;

  const defs: Record<
    AltarStationId,
    { dx: number; dz: number; faceRotY: number; side: 'left' | 'right' | 'center' }
  > = {
    incense_center: { dx: 0, dz: 0, faceRotY: Math.PI, side: 'center' },
    incense_left: { dx: -0.95, dz: 0.08, faceRotY: Math.PI - 0.06, side: 'left' },
    incense_right: { dx: 0.95, dz: 0.08, faceRotY: Math.PI + 0.06, side: 'right' },
    lotus_left: { dx: -1.68, dz: 0.14, faceRotY: Math.PI - 0.1, side: 'left' },
    lotus_right: { dx: 1.68, dz: 0.14, faceRotY: Math.PI + 0.1, side: 'right' },
    fruit_left: { dx: -2.35, dz: 0.22, faceRotY: Math.PI - 0.14, side: 'left' },
    fruit_right: { dx: 2.35, dz: 0.22, faceRotY: Math.PI + 0.14, side: 'right' },
    flower_left: { dx: -2.95, dz: 0.3, faceRotY: Math.PI - 0.18, side: 'left' },
    flower_right: { dx: 2.95, dz: 0.3, faceRotY: Math.PI + 0.18, side: 'right' },
    lantern_left: { dx: -1.28, dz: 0.55, faceRotY: Math.PI - 0.08, side: 'left' },
    lantern_right: { dx: 1.28, dz: 0.55, faceRotY: Math.PI + 0.08, side: 'right' },
    bell_right: { dx: 3.15, dz: 0.42, faceRotY: Math.PI - 0.32, side: 'right' },
    grand_center: { dx: 0, dz: 0.48, faceRotY: Math.PI, side: 'center' },
    xin_xam_station: { dx: 0, dz: 0.48, faceRotY: Math.PI, side: 'center' }, // CHUA_XIN_XAM_CENTRAL_V4
  };

  const d = defs[stationId] || defs.incense_center;
  const z = Math.max(-8.9, baseZ + d.dz);
  const safeMaxX = computeSafeFloorMaxXAtZ(z, cal, 0.84);
  const rawX = d.dx * spread;
  const x = Math.max(-safeMaxX, Math.min(safeMaxX, rawX));

  return {
    id: stationId,
    x: Number(x.toFixed(3)),
    z: Number(z.toFixed(3)),
    faceRotY: d.faceRotY,
    side: d.side,
  };
}

/**
 * Calibrated outbound/return/exit red-carpet lane X offsets matching `temple-background.png`.
 */
export function getImageCalibratedCarpetLanes(
  side: 'left' | 'right',
  isXinXam = false,
): {
  outboundLaneX: number;
  returnLaneX: number;
  exitLaneX: number;
  altarApproachThresholdZ: number;
} {
  return {
    outboundLaneX: isXinXam ? -0.09 : side === 'left' ? -0.11 : 0.11,
    returnLaneX: side === 'left' ? -0.19 : 0.19,
    exitLaneX: side === 'left' ? -0.16 : 0.16,
    altarApproachThresholdZ: (activeCalibration.altarStationZ ?? -8.15) + 1.25,
  };
}

/**
 * Computes depth-aware character scale so worshippers near the bottom of the screen appear
 * naturally foreground-sized while distant worshippers near the altar scale harmoniously.
 */
export function computeCharacterDepthScale(
  worldZ: number,
  cal: SceneCalibrationSettings = activeCalibration,
): number {
  if (cal.sceneMode !== 'image_background') {
    return 1.0;
  }
  const zFar = cal.altarStationZ ?? -8.15;
  const zNear = Math.max(zFar + 4, 19.30 - 1.2);
  const depthT = THREE.MathUtils.clamp((worldZ - zFar) / (zNear - zFar), 0, 1);
  // V17.2: consistent small, legible 2D figures across 12 screen-space rows.
  // Preserve the user's near/far scale tuning while limiting crowding at the front.
  // TINH_TAM_V181_USER_XA_RO_NET:
  // Chỉ tăng mạnh nhân vật HÀNG XA gần tượng Phật; hàng trước tăng ít.
  // Smoothstep hạn chế đổi kích thước đột ngột giữa các hàng ghế.
  // Mức sàn ngăn cài đặt cũ trong localStorage làm người hàng xa quá bé.
  const easedDepthT = depthT * depthT * (3 - 2 * depthT);
  const farScale = Math.max(0.75, cal.farCharacterScale * 0.91);
  const nearScale = Math.max(0.48, cal.nearCharacterScale * 0.46);
  return THREE.MathUtils.lerp(farScale, nearScale, easedDepthT);
}

/**
 * Verifies the 9:16 perspective framing & bounds of `IMAGE BACKGROUND` mode for automated tests.
 */
export function verifyImageModeFraming916(
  cal: SceneCalibrationSettings = DEFAULT_SCENE_CALIBRATION,
): {
  cameraPos: { x: number; y: number; z: number };
  cameraFov: number;
  altarEdgeNdcY: number;
  carpetTopAbsNdcX: number;
  carpetBottomAbsNdcX: number;
  minSeatNdcX: number;
  maxSeatNdcX: number;
  minSeatNdcY: number;
  maxSeatFootNdcY: number;
  maxSeatHeadNdcY: number;
  allSeatsInside916: boolean;
  allSeatsClearOfCarpet: boolean;
  allSeatsBelowAltar: boolean;
  minPairwiseSeatDist: number;
  nearScale: number;
  farScale: number;
  allStationsBelowAltar: boolean;
} {
  const cleanCal = sanitizeSceneCalibration({ ...cal, sceneMode: 'image_background' });
  const cam = new THREE.PerspectiveCamera(42, 9 / 16, 0.25, 110);
  configureImageBackgroundCamera(cam, 9 / 16, cleanCal);

  const project = (x: number, y: number, z: number) => {
    const v = new THREE.Vector3(x, y, z).project(cam);
    return { x: v.x, y: v.y };
  };

  const altarEdge = project(0, 0, IMAGE_BG_CAMERA_BASE.altarFloorEdgeZ);
  const carpetTop = project(
    IMAGE_BG_CAMERA_BASE.carpetHalfWidth,
    0,
    IMAGE_BG_CAMERA_BASE.altarFloorEdgeZ,
  );
  const carpetBot = project(IMAGE_BG_CAMERA_BASE.carpetHalfWidth, 0, 15.1);

  let minSeatNdcX = Infinity;
  let maxSeatNdcX = -Infinity;
  let minSeatNdcY = Infinity;
  let maxSeatFootNdcY = -Infinity;
  let maxSeatHeadNdcY = -Infinity;
  let allSeatsClearOfCarpet = true;
  let minPairwiseSeatDist = Infinity;

  const coords: CalibratedSeatCoord[] = [];
  for (let i = 0; i < IMAGE_TOTAL_MAIN_MATS; i++) {
    const seat = getImageCalibratedSeatPosition(i, cleanCal);
    coords.push(seat);
    if (Math.abs(seat.x) < IMAGE_BG_CAMERA_BASE.carpetHalfWidth + 0.15) {
      allSeatsClearOfCarpet = false;
    }
    const pFoot = project(seat.x, 0, seat.z);
    const charScale = computeCharacterDepthScale(seat.z, cleanCal);
    const pHead = project(seat.x, 1.15 * charScale, seat.z);

    minSeatNdcX = Math.min(minSeatNdcX, pFoot.x, pHead.x);
    maxSeatNdcX = Math.max(maxSeatNdcX, pFoot.x, pHead.x);
    minSeatNdcY = Math.min(minSeatNdcY, pFoot.y);
    maxSeatFootNdcY = Math.max(maxSeatFootNdcY, pFoot.y);
    maxSeatHeadNdcY = Math.max(maxSeatHeadNdcY, pHead.y);
  }

  for (let i = 0; i < coords.length; i++) {
    for (let j = i + 1; j < coords.length; j++) {
      const d = Math.hypot(coords[i].x - coords[j].x, coords[i].z - coords[j].z);
      if (d < minPairwiseSeatDist) {
        minPairwiseSeatDist = d;
      }
    }
  }

  const stationIds: AltarStationId[] = [
    'incense_center',
    'incense_left',
    'incense_right',
    'fruit_left',
    'fruit_right',
    'flower_left',
    'flower_right',
    'lotus_left',
    'lotus_right',
    'lantern_left',
    'lantern_right',
    'bell_right',
    'grand_center',
    'xin_xam_station',
  ];
  let allStationsBelowAltar = true;
  for (const id of stationIds) {
    const st = getImageCalibratedAltarStation(id, cleanCal);
    const pSt = project(st.x, 0, st.z);
    if (pSt.y > altarEdge.y + 0.005) {
      allStationsBelowAltar = false;
    }
  }

  const allSeatsBelowAltar = maxSeatFootNdcY <= altarEdge.y + 0.005 && maxSeatHeadNdcY <= Math.max(0.25, altarEdge.y + 0.05);
  const allSeatsInside916 =
    minSeatNdcX >= -0.95 &&
    maxSeatNdcX <= 0.95 &&
    minSeatNdcY >= -0.97 &&
    allSeatsBelowAltar;

  const nearScale = computeCharacterDepthScale(13.0, cleanCal);
  const farScale = computeCharacterDepthScale(-7.5, cleanCal);

  return {
    cameraPos: { x: cam.position.x, y: cam.position.y, z: cam.position.z },
    cameraFov: cam.fov,
    altarEdgeNdcY: altarEdge.y,
    carpetTopAbsNdcX: Math.abs(carpetTop.x),
    carpetBottomAbsNdcX: Math.abs(carpetBot.x),
    minSeatNdcX,
    maxSeatNdcX,
    minSeatNdcY,
    maxSeatFootNdcY,
    maxSeatHeadNdcY,
    allSeatsInside916,
    allSeatsClearOfCarpet,
    allSeatsBelowAltar,
    minPairwiseSeatDist,
    nearScale,
    farScale,
    allStationsBelowAltar,
  };
}
