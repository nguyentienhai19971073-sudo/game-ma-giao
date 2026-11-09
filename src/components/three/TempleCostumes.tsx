import * as THREE from 'three';
import type { TempleCharacterType } from '../../types/temple';

// Lightweight real 3D procedural clothes: no GLB download, PNG texture,
// runtime geometry creation, skeletal rig or network request. Every geometry
// and material below is shared by all characters of every role.
const cloth = (hex: string) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.96, metalness: 0 });
const skin = (hex: string) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.88, metalness: 0 });
const trim = (hex: string) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.82, metalness: 0 });

export interface TempleCostume {
  robe: THREE.MeshStandardMaterial;
  trousers: THREE.MeshStandardMaterial;
  collar: THREE.MeshStandardMaterial;
  skin: THREE.MeshStandardMaterial;
  hair: THREE.MeshStandardMaterial;
  details: THREE.MeshStandardMaterial;
  bald: boolean;
  hairBun: boolean;
  stature: number;
}

const COMMON_SKIN = skin('#edbea0');
const MATURE_SKIN = skin('#e8b899');
const CHILD_SKIN = skin('#f1c9ac');
const BLACK_HAIR = cloth('#28211f');
const SILVER_HAIR = cloth('#e1dfdb');
const GOLD = trim('#d8b36c');
const SILVER_TRIM = trim('#ded2bc');
const MAT = {
  brownBeads: cloth('#59371e'),
  darkEyes: cloth('#302522'),
  smile: cloth('#885f53'),
  silverBrow: trim('#cfcac2'),
  blush: trim('#df9f8f'),
};

export const TEMPLE_COSTUMES: Record<TempleCharacterType, TempleCostume> = {
  nam: {
    robe: cloth('#9295a9'), trousers: cloth('#74798c'), collar: trim('#dad9df'),
    skin: COMMON_SKIN, hair: BLACK_HAIR, details: SILVER_TRIM,
    bald: false, hairBun: false, stature: 1,
  },
  nu: {
    robe: cloth('#a5a1b9'), trousers: cloth('#85809c'), collar: trim('#ece5f0'),
    skin: COMMON_SKIN, hair: BLACK_HAIR, details: SILVER_TRIM,
    bald: false, hairBun: true, stature: 0.95,
  },
  ong: {
    robe: cloth('#81859a'), trousers: cloth('#666c7f'), collar: trim('#c9cbd5'),
    skin: MATURE_SKIN, hair: SILVER_HAIR, details: SILVER_TRIM,
    bald: false, hairBun: false, stature: 0.95,
  },
  ba: {
    robe: cloth('#9992ab'), trousers: cloth('#7b728e'), collar: trim('#ddd4e0'),
    skin: MATURE_SKIN, hair: SILVER_HAIR, details: SILVER_TRIM,
    bald: false, hairBun: true, stature: 0.92,
  },
  ni: {
    robe: cloth('#a5a3ac'), trousers: cloth('#85828d'), collar: trim('#d6d1d3'),
    skin: COMMON_SKIN, hair: BLACK_HAIR, details: SILVER_TRIM,
    bald: true, hairBun: false, stature: 0.95,
  },
  tieu: {
    robe: cloth('#8a6754'), trousers: cloth('#6d4a3e'), collar: trim('#c0a894'),
    skin: CHILD_SKIN, hair: BLACK_HAIR, details: SILVER_TRIM,
    bald: true, hairBun: false, stature: 0.78,
  },
  cao_tang: {
    robe: cloth('#dfab42'), trousers: cloth('#815131'), collar: trim('#8b522b'),
    skin: MATURE_SKIN, hair: SILVER_HAIR, details: GOLD,
    bald: true, hairBun: false, stature: 1.05,
  },
};

export function getTempleCostume(type: TempleCharacterType | undefined): TempleCostume | null {
  return type ? TEMPLE_COSTUMES[type] || null : null;
}

const GEO = {
  eye: new THREE.SphereGeometry(0.015, 7, 6),
  ear: new THREE.SphereGeometry(0.034, 7, 7),
  nose: new THREE.SphereGeometry(0.016, 7, 6),
  mouth: new THREE.TorusGeometry(0.031, 0.005, 3, 9, Math.PI),
  brow: new THREE.BoxGeometry(0.046, 0.008, 0.008),
  cheek: new THREE.SphereGeometry(0.028, 6, 5),
  goatee: new THREE.ConeGeometry(0.065, 0.14, 7),
  whisker: new THREE.SphereGeometry(0.042, 7, 5),
  collarBand: new THREE.BoxGeometry(0.055, 0.30, 0.020),
  robeOverlay: new THREE.BoxGeometry(0.13, 0.57, 0.026),
  button: new THREE.SphereGeometry(0.012, 6, 5),
  shoulder: new THREE.SphereGeometry(0.11, 10, 7),
  mala: new THREE.TorusGeometry(0.145, 0.018, 5, 16, Math.PI * 1.85),
  malaBead: new THREE.SphereGeometry(0.028, 7, 6),
  lotus: new THREE.SphereGeometry(0.035, 8, 6),
};

/** Visible facial age/hair/monastic differences. Attached to animated head. */
export function TempleFaceDetails({ type }: { type: TempleCharacterType | undefined }) {
  const costume = getTempleCostume(type);
  if (!costume) return null;
  const senior = type === 'ong' || type === 'ba' || type === 'cao_tang';
  const female = type === 'nu' || type === 'ba' || type === 'ni';
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.163, -0.019, 0]} geometry={GEO.ear} material={costume.skin} scale={[0.75, 1.10, 0.68]} />
          <mesh position={[side * 0.065, 0.032, 0.150]} geometry={GEO.eye} material={MAT.darkEyes} />
          <mesh position={[side * 0.065, 0.078, 0.142]} geometry={GEO.brow}
            material={senior ? MAT.silverBrow : costume.hair} rotation={[0, 0, side * 0.08]} />
          {female && <mesh position={[side * 0.097, -0.012, 0.145]} geometry={GEO.cheek}
            material={MAT.blush} scale={[0.8, 0.25, 0.19]} />}
        </group>
      ))}
      <mesh position={[0, -0.025, 0.160]} geometry={GEO.nose} material={costume.skin} />
      <mesh position={[0, -0.076, 0.154]} rotation={[0, 0, Math.PI]} geometry={GEO.mouth} material={MAT.smile} />
      {type === 'ong' && (
        <group>
          <mesh position={[0, -0.155, 0.148]} rotation={[0, 0, Math.PI]} geometry={GEO.goatee} material={SILVER_HAIR} />
          <mesh position={[-0.027, -0.060, 0.174]} scale={[0.68, 0.36, 0.46]} geometry={GEO.whisker} material={SILVER_HAIR} />
          <mesh position={[0.027, -0.060, 0.174]} scale={[0.68, 0.36, 0.46]} geometry={GEO.whisker} material={SILVER_HAIR} />
        </group>
      )}
      {type === 'cao_tang' && (
        <group>
          <mesh position={[0, -0.140, 0.149]} rotation={[0, 0, Math.PI]} scale={[0.8, 0.67, 0.9]} geometry={GEO.goatee} material={SILVER_HAIR} />
          <mesh position={[-0.032, -0.058, 0.169]} scale={[0.68, 0.31, 0.40]} geometry={GEO.whisker} material={SILVER_HAIR} />
          <mesh position={[0.032, -0.058, 0.169]} scale={[0.68, 0.31, 0.40]} geometry={GEO.whisker} material={SILVER_HAIR} />
        </group>
      )}
    </group>
  );
}

/** Distinctive formal temple garments. Attached to animated torso (walk/kneel/bow). */
export function TempleRobeDetails({ type }: { type: TempleCharacterType | undefined }) {
  const costume = getTempleCostume(type);
  if (!costume) return null;
  const monastic = type === 'ni' || type === 'tieu' || type === 'cao_tang';
  return (
    <group>
      {/* Layered Vietnamese Buddhist cross-collar: unlike the generic shirt collar. */}
      <mesh position={[-0.072, 0.393, 0.179]} rotation={[0, 0, -0.40]}
        geometry={GEO.collarBand} material={costume.collar} />
      <mesh position={[0.054, 0.395, 0.179]} rotation={[0, 0, 0.40]}
        geometry={GEO.collarBand} material={costume.collar} />
      {monastic ? (
        <>
          <mesh position={[-0.105, 0.292, 0.165]} rotation={[0, 0, -0.30]}
            geometry={GEO.robeOverlay} material={type === 'cao_tang' ? costume.collar : costume.details} />
          {type === 'cao_tang' && (
            <>
              <mesh position={[-0.14, 0.475, 0.04]} scale={[1.15, 0.6, 1.5]} geometry={GEO.shoulder} material={costume.collar} />
              <mesh position={[0, 0.39, 0.232]} rotation={[0, 0, Math.PI * 0.10]}
                geometry={GEO.mala} material={MAT.brownBeads} />
              <mesh position={[0, 0.26, 0.25]} geometry={GEO.malaBead} material={MAT.brownBeads} />
            </>
          )}
        </>
      ) : (
        <>
          {/* Tiny cloth buttons + embroidered lotus, visible when close to the camera. */}
          <mesh position={[0.065, 0.21, 0.194]} geometry={GEO.button} material={costume.details} />
          <mesh position={[0.065, 0.12, 0.199]} geometry={GEO.button} material={costume.details} />
          <mesh position={[-0.09, 0.17, 0.196]} scale={[0.9, 0.58, 0.23]}
            geometry={GEO.lotus} material={costume.details} />
        </>
      )}
    </group>
  );
}

// V14 / Organic stylized silhouette. All geometries are shared globally and
// the component is mounted only for the seven opt-in temple costumes.
// Shapes have rounded surfaces and small tailored details; no rectangular body.
const SOFT_GEO = (() => {
  const robe = new THREE.LatheGeometry([
    new THREE.Vector2(0.244, -0.285),
    new THREE.Vector2(0.246, -0.255),
    new THREE.Vector2(0.236, -0.170),
    new THREE.Vector2(0.216, -0.030),
    new THREE.Vector2(0.198, 0.155),
    new THREE.Vector2(0.172, 0.310),
    new THREE.Vector2(0.155, 0.450),
    new THREE.Vector2(0.108, 0.520),
  ], 28);
  const pos = robe.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const angle = Math.atan2(z, x);
    const drape = 1 + (0.019 * Math.sin(angle * 9 + y * 4)) * Math.max(0, 0.45 - y);
    pos.setXYZ(i, x * drape, y, z * drape);
  }
  robe.computeVertexNormals();
  return {
    robe,
    sash: new THREE.CapsuleGeometry(0.021, 0.34, 5, 8),
    collar: new THREE.CapsuleGeometry(0.018, 0.23, 4, 8),
    sleeve: new THREE.CylinderGeometry(0.075, 0.102, 0.295, 16, 3),
    cuff: new THREE.TorusGeometry(0.100, 0.010, 5, 16),
    hem: new THREE.TorusGeometry(0.243, 0.011, 5, 28),
    bead: new THREE.SphereGeometry(0.018, 9, 7),
    petal: new THREE.SphereGeometry(0.038, 10, 8),
    hairLock: new THREE.CapsuleGeometry(0.033, 0.085, 5, 8),
    braid: new THREE.SphereGeometry(0.057, 12, 10),
    robeFold: new THREE.CapsuleGeometry(0.006, 0.33, 4, 6),
  };
})();

const PETAL_LIGHT = new THREE.MeshStandardMaterial({ color: '#eee0d2', roughness: 0.92 });

/** Smooth long áo tràng silhouette with layered Buddhist collar and flowing hems. */
export function TempleSculptedRobe({ type }: { type: TempleCharacterType | undefined }) {
  const c = getTempleCostume(type);
  if (!c) return null;
  const monk = type === 'ni' || type === 'tieu' || type === 'cao_tang';
  const embellished = type === 'cao_tang';
  return (
    <group>
      <mesh geometry={SOFT_GEO.robe} material={c.robe} castShadow={false} />
      <mesh geometry={SOFT_GEO.hem} material={c.collar} position={[0, -0.280, 0]}
        rotation={[Math.PI / 2, 0, 0]} scale={[1.005, 1.005, 1]} />
      {/* Narrow cloth pleats are subdued at a distance, never box-shaped. */}
      {[-0.17, 0.17].map((x, idx) => (
        <mesh key={idx} geometry={SOFT_GEO.robeFold} material={c.details}
          position={[x, -0.080, 0.161]} rotation={[0, 0, x < 0 ? -0.09 : 0.09]}
          scale={[0.55, 1.14, 0.55]} />
      ))}
      <mesh geometry={SOFT_GEO.collar} material={c.collar}
        position={[-0.050, 0.386, 0.185]} rotation={[0, 0, -0.48]} />
      <mesh geometry={SOFT_GEO.collar} material={c.collar}
        position={[0.045, 0.382, 0.186]} rotation={[0, 0, 0.42]} />
      {monk ? (
        <>
          <mesh geometry={SOFT_GEO.sash} material={c.collar}
            position={[-0.110, 0.270, 0.204]} rotation={[0, 0, -0.31]}
            scale={[embellished ? 2.9 : 1.85, 1, 0.6]} />
          {embellished && (
            <mesh geometry={SOFT_GEO.sash} material={c.details}
              position={[-0.146, 0.286, 0.223]} rotation={[0, 0, -0.31]}
              scale={[0.38, 1.02, 0.6]} />
          )}
        </>
      ) : (
        <>
          <mesh geometry={SOFT_GEO.sash} material={c.collar}
            position={[0.007, 0.205, 0.214]} rotation={[0, 0, -0.014]}
            scale={[0.55, 1.00, 0.55]} />
          {/* Small lotus stitched onto the áo lam rather than large image texture. */}
          {[-1, 0, 1].map((n) => (
            <mesh key={n} geometry={SOFT_GEO.petal} material={PETAL_LIGHT}
              position={[-0.108 + n * 0.025, -0.132 + Math.abs(n) * 0.012, 0.212]}
              rotation={[0, 0, n * -0.36]} scale={[0.37, 0.61, 0.13]} />
          ))}
        </>
      )}
    </group>
  );
}

/** Existing arm pivot still drives walking, prayer and offering animations. */
export function TempleSculptedSleeve({ type }: { type: TempleCharacterType | undefined }) {
  const c = getTempleCostume(type);
  if (!c) return null;
  return (
    <group>
      <mesh geometry={SOFT_GEO.sleeve} material={c.robe} position={[0, -0.150, 0]} />
      <mesh geometry={SOFT_GEO.cuff} material={c.collar} position={[0, -0.297, 0]}
        rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

/** Rounded hair tufts and the optional mala necklace for monks. */
export function TempleSculptedHead({ type }: { type: TempleCharacterType | undefined }) {
  const c = getTempleCostume(type);
  if (!c) return null;
  const old = type === 'ong' || type === 'ba';
  const visitor = type === 'nam' || type === 'nu' || old;
  return (
    <group>
      {visitor && (
        <>
          {[-1, 1].map((side) => (
            <mesh key={side} geometry={SOFT_GEO.hairLock} material={c.hair}
              position={[side * 0.087, 0.103, 0.102]}
              rotation={[0, 0, side * (old ? 0.30 : 0.48)]} scale={[1.0, 0.82, 0.73]} />
          ))}
          {(type === 'nu' || type === 'ba') && (
            <mesh geometry={SOFT_GEO.braid} material={c.hair}
              position={[0.010, 0.152, -0.095]} scale={[1.4, 1.15, 1.2]} />
          )}
        </>
      )}
      {type === 'cao_tang' && (
        <mesh geometry={SOFT_GEO.bead} material={c.details}
          position={[0, -0.183, 0.154]} scale={[1.4, 1, 0.9]} />
      )}
    </group>
  );
}
