import { useEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import type { MutableRefObject } from 'react';
import type { TempleCharacterType } from '../../types/temple';

// TINH_TAM_V173_SIT_EXIT_ANIMATION
// True rear-facing illustrations for entry / worship; original front illustration
// only during actual exit. Frame-based seated poses; shared cached small WebP assets.
// No new 3D geometry, no per-user animation intervals, and no camera-angle reversal.
const ANIMATION_ASSETS: Record<TempleCharacterType, {
  rear: string; front: string; half: string; seated: string;
  exit0: string; exit1: string; frontRatio: number;
}> = {
  nam: { rear: '/characters/temple_2d/nam_back.webp', front: '/characters/temple_2d/nam.webp', half: '/characters/temple_2d/nam_sit_half.webp', seated: '/characters/temple_2d/nam_sit.webp', exit0: '/characters/temple_2d/nam_exit_0.webp', exit1: '/characters/temple_2d/nam_exit_1.webp', frontRatio: 240 / 720 },
  nu: { rear: '/characters/temple_2d/nu_back.webp', front: '/characters/temple_2d/nu.webp', half: '/characters/temple_2d/nu_sit_half.webp', seated: '/characters/temple_2d/nu_sit.webp', exit0: '/characters/temple_2d/nu_exit_0.webp', exit1: '/characters/temple_2d/nu_exit_1.webp', frontRatio: 219 / 720 },
  ong: { rear: '/characters/temple_2d/ong_back.webp', front: '/characters/temple_2d/ong.webp', half: '/characters/temple_2d/ong_sit_half.webp', seated: '/characters/temple_2d/ong_sit.webp', exit0: '/characters/temple_2d/ong_exit_0.webp', exit1: '/characters/temple_2d/ong_exit_1.webp', frontRatio: 240 / 720 },
  ba: { rear: '/characters/temple_2d/ba_back.webp', front: '/characters/temple_2d/ba.webp', half: '/characters/temple_2d/ba_sit_half.webp', seated: '/characters/temple_2d/ba_sit.webp', exit0: '/characters/temple_2d/ba_exit_0.webp', exit1: '/characters/temple_2d/ba_exit_1.webp', frontRatio: 223 / 720 },
  ni: { rear: '/characters/temple_2d/ni_back.webp', front: '/characters/temple_2d/ni.webp', half: '/characters/temple_2d/ni_sit_half.webp', seated: '/characters/temple_2d/ni_sit.webp', exit0: '/characters/temple_2d/ni_exit_0.webp', exit1: '/characters/temple_2d/ni_exit_1.webp', frontRatio: 223 / 720 },
  tieu: { rear: '/characters/temple_2d/tieu_back.webp', front: '/characters/temple_2d/tieu.webp', half: '/characters/temple_2d/tieu_sit_half.webp', seated: '/characters/temple_2d/tieu_sit.webp', exit0: '/characters/temple_2d/tieu_exit_0.webp', exit1: '/characters/temple_2d/tieu_exit_1.webp', frontRatio: 236 / 720 },
  cao_tang: { rear: '/characters/temple_2d/cao_tang_back.webp', front: '/characters/temple_2d/cao_tang.webp', half: '/characters/temple_2d/cao_tang_sit_half.webp', seated: '/characters/temple_2d/cao_tang_sit.webp', exit0: '/characters/temple_2d/cao_tang_exit_0.webp', exit1: '/characters/temple_2d/cao_tang_exit_1.webp', frontRatio: 272 / 720 },
};

export type Temple2DAnimation = {
  walking: boolean;
  phase: number;
  rotY: number;
  kneeling: boolean;
  bow: number;
  sitAmount: number; // 0 standing -> 1 seated, eased by WorshipperCharacter stage timer
  departing: boolean; // true only after reaching the outward path from church/temple
};

// Reuse the R3F/Three cache across all 90 worshippers. No per-character textures.
Object.values(ANIMATION_ASSETS).forEach(({ rear, front, half, seated, exit0, exit1 }) => {
  [rear, front, half, seated, exit0, exit1].forEach((url) =>
    useLoader.preload(THREE.TextureLoader, url),
  );
});

export function Temple2DAvatar({ type, animationRef }: {
  type: TempleCharacterType;
  animationRef: MutableRefObject<Temple2DAnimation>;
}) {
  const assets = ANIMATION_ASSETS[type];
  const textures = useLoader(THREE.TextureLoader, [
    assets.rear, assets.front, assets.half, assets.seated, assets.exit0, assets.exit1,
  ]);
  const spriteRef = useRef<THREE.Sprite>(null);
  const materialRef = useRef<THREE.SpriteMaterial>(null);
  const height = 1.42;
  const rearRatio = 260 / 720;

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
    });
  }, [textures]);

  useFrame(() => {
    const sprite = spriteRef.current;
    const material = materialRef.current;
    if (!sprite || !material) return;
    const motion = animationRef.current;
    const sit = THREE.MathUtils.clamp(motion.sitAmount, 0, 1);
    const stride = motion.walking ? Math.sin(motion.phase) : 0;

    // Moving toward entrance = looking AT the camera, regardless of camera rotation.
    // Every other phase uses the back view, consistent with facing the Buddha.
    let desired: THREE.Texture;
    if (motion.departing) {
      desired = !motion.walking
        ? textures[1]
        : stride < 0 ? textures[4] : textures[5];
    } else {
      desired = sit < 0.22 ? textures[0] : sit < 0.74 ? textures[2] : textures[3];
    }
    if (material.map !== desired) {
      material.map = desired;
      material.needsUpdate = true;
    }

    // All assets have the same 720 px high transparent canvas, grounded at the feet.
    // Sit poses are physically shorter *within* that canvas (head lowers, robe fans out),
    // rather than an abrupt scale cut of the whole upright photograph.
    const bow = THREE.MathUtils.clamp(motion.bow, 0, 0.9);
    const visibleHeight = height * (1 - bow * 0.045);
    const sway = motion.walking ? 0.013 * stride : 0;
    const ratio = motion.departing ? assets.frontRatio : rearRatio;
    sprite.scale.set(visibleHeight * ratio, visibleHeight, 1);
    sprite.position.set(sway, visibleHeight * 0.5 + (motion.walking ? 0.006 * Math.abs(stride) : 0), 0);
  });

  return (
    <sprite ref={spriteRef} position={[0, height / 2, 0]} scale={[height * rearRatio, height, 1]}>
      <spriteMaterial
        ref={materialRef}
        map={textures[0]}
        transparent
        alphaTest={0.08}
        depthWrite={false}
        toneMapped={false}
        color={'#ffffff'}
      />
    </sprite>
  );
}
