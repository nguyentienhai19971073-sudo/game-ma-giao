// CHUA_ONLINE_READABLE_PANELS_V1
import * as THREE from 'three';
import { TempleSceneMode } from '../types/temple';
import { SANCTUARY_BUDDHA_BOUNDS } from './SeatManager';

export interface ScreenRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface LabelCandidateInput {
  userId: string;
  username: string;
  worldX: number;
  worldY: number;
  worldZ: number;
  headY: number;
  lastComment?: string;
  lastCommentAt?: number;
  ritualStatusLabel?: string;
  isSpeaking: boolean;
  isCeremonyActor: boolean;
  isRecentlyActive: boolean;
  seatIndex: number;
}

export interface SolvedOverlayPlacement {
  userId: string;
  username: string;
  anchorX: number;
  anchorY: number;
  // Small character name label (username ONLY — zero avatar!)
  nameVisible: boolean;
  nameOpacity: number;
  nameX: number;
  nameY: number;
  nameRect: ScreenRect | null;
  ritualLabelText: string;
  // Configurable-duration overhead comment bubble (original comment ONLY — no avatar!)
  bubbleVisible: boolean;
  bubbleOpacity: number;
  bubbleText: string;
  bubbleX: number;
  bubbleY: number;
  bubbleRect: ScreenRect | null;
}

export interface LabelLayoutOptions {
  viewportWidth: number;
  viewportHeight: number;
  now: number;
  showUsernames: boolean;
  showCommentBubbles: boolean;
  panelScale?: number;
  namePlateWidth?: number;
  namePlateHeight?: number;
  namePlateOffsetY?: number;
  commentBubbleWidth?: number;
  commentBubbleHeight?: number;
  showLeaderboard?: boolean;
  showGiftPanel?: boolean;
  commentDurationMs?: number;
  sceneMode?: TempleSceneMode;
}

export interface LabelLayoutResult {
  placements: Map<string, SolvedOverlayPlacement>;
  items: SolvedOverlayPlacement[];
  buddhaExclusionRect: ScreenRect;
  altarExclusionRect: ScreenRect;
  visibleNameCount: number;
  visibleBubbleCount: number;
}

const _projVec = new THREE.Vector3();
const _projFeet = new THREE.Vector3(); // TINH_TAM_V179_LOI_DI_THANG
const _bTop = new THREE.Vector3();
const _bBot = new THREE.Vector3();
const _bSide = new THREE.Vector3();
const _aTop = new THREE.Vector3();
const _aBot = new THREE.Vector3();
const _aSide = new THREE.Vector3();

export function screenRectsOverlap(a: ScreenRect, b: ScreenRect, pad = 0): boolean {
  return !(
    a.right + pad <= b.left ||
    a.left - pad >= b.right ||
    a.bottom + pad <= b.top ||
    a.top - pad >= b.bottom
  );
}

export function isRectInsideViewport(
  rect: ScreenRect,
  viewportWidth: number,
  viewportHeight: number,
  margin = 4,
): boolean {
  return (
    rect.left >= margin - 0.5 &&
    rect.right <= viewportWidth - margin + 0.5 &&
    rect.top >= margin - 0.5 &&
    rect.bottom <= viewportHeight - margin + 0.5
  );
}

// TINH_TAM_V1852_LABEL_UI: bubble rectangles must match the rendered fixed-size DOM.
function estimateBubbleDims(scale: number, widthPx: number, heightPx: number): { width: number; height: number } {
  return { width: widthPx * scale, height: heightPx * scale };
}

// Keep tags physically attached to the projected head. Do not flank the altar,
// move them multiple rows away, or show a "floating" comment for another user.
// A pair (comment + name) shares the same screen-space X coordinate.
const HEAD_STACK_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [-6, -3], [6, -3], [0, -7], [-10, -6], [10, -6],
];

/**
 * Projects 3D character positions to 2D screen coordinates and solves non-overlapping
 * screen-space placement for both timed Comment Bubbles and persistent Character Name Labels.
 *
 * Guarantees:
 * - Avoids overlaps when space permits, but never hides an in-frame participant username.
 * - Never merges multiple usernames into a single label.
 * - Never places labels or bubbles outside the camera viewport.
 * - Never covers the Golden Buddha Statue or central sanctuary altar.
 * - Names persist with each visible worshipper until that participant exits.
 * - In very dense rows, comment bubbles can hide; usernames remain head-anchored.
 */
export function solveLabelAndBubbleLayout(
  candidates: LabelCandidateInput[],
  camera: THREE.Camera,
  options: LabelLayoutOptions,
): LabelLayoutResult {
  const {
    viewportWidth,
    viewportHeight,
    now,
    showUsernames,
    showCommentBubbles,
    panelScale = 0.9,
    showLeaderboard = false,
    showGiftPanel = false,
    commentDurationMs = 5000,
    namePlateWidth: rawNamePlateWidth = 72,
    namePlateHeight: rawNamePlateHeight = 22,
    namePlateOffsetY: rawNamePlateOffsetY = 8,
    commentBubbleWidth: rawCommentBubbleWidth = 160,
    commentBubbleHeight: rawCommentBubbleHeight = 56,
    sceneMode = 'original_3d',
  } = options;

  const halfW = viewportWidth * 0.5;
  const halfH = viewportHeight * 0.5;
  const scale = Math.max(0.75, Math.min(1.15, panelScale));
  const namePlateWidth = Math.max(44, Math.min(160, rawNamePlateWidth));
  const namePlateHeight = Math.max(16, Math.min(54, rawNamePlateHeight));
  const namePlateOffsetY = Math.max(0, Math.min(30, rawNamePlateOffsetY));
  const commentBubbleWidth = Math.max(90, Math.min(280, rawCommentBubbleWidth));
  const commentBubbleHeight = Math.max(36, Math.min(110, rawCommentBubbleHeight)); // TINH_TAM_V1852_LABEL_UI
  const edgePad = 5;
  const topSafeY = Math.max(36, 40 * scale);
  const bottomSafeY = Math.min(viewportHeight - 10, viewportHeight - 36 * scale);

  let buddhaExclusionRect: ScreenRect;
  let altarExclusionRect: ScreenRect;
  let buddhaCenterX = halfW;

  if (sceneMode === 'image_background') {
    // Exact painted Golden Buddha (halo + head + body + lotus pedestal: x = 22%..78%, y = 10%..45.5%)
    // and Carved Wooden Offering Altar (x = 14%..86%, y = 45.2%..58.5%) in `/assets/temple-background.png`
    buddhaExclusionRect = {
      left: viewportWidth * 0.22,
      right: viewportWidth * 0.78,
      top: viewportHeight * 0.1,
      bottom: viewportHeight * 0.455,
    };
    altarExclusionRect = {
      left: viewportWidth * 0.18,
      right: viewportWidth * 0.82,
      top: viewportHeight * 0.452,
      bottom: viewportHeight * 0.578,
    };
  } else {
    // 1. Project Golden Buddha Statue Exclusion Zone (head halo crown -> lotus pedestal)
    _bTop
      .set(
        SANCTUARY_BUDDHA_BOUNDS.centerX,
        SANCTUARY_BUDDHA_BOUNDS.haloTopY,
        SANCTUARY_BUDDHA_BOUNDS.centerZ,
      )
      .project(camera);
    _bBot
      .set(
        SANCTUARY_BUDDHA_BOUNDS.centerX,
        SANCTUARY_BUDDHA_BOUNDS.pedestalBottomY,
        SANCTUARY_BUDDHA_BOUNDS.centerZ,
      )
      .project(camera);
    _bSide
      .set(
        SANCTUARY_BUDDHA_BOUNDS.halfWidthX,
        (SANCTUARY_BUDDHA_BOUNDS.haloTopY + SANCTUARY_BUDDHA_BOUNDS.pedestalBottomY) * 0.5,
        SANCTUARY_BUDDHA_BOUNDS.centerZ,
      )
      .project(camera);

    buddhaCenterX = _bTop.x * halfW + halfW;
    const buddhaHalfPxW = Math.abs(_bSide.x * halfW + halfW - buddhaCenterX) + 6;
    const bY1 = -_bTop.y * halfH + halfH;
    const bY2 = -_bBot.y * halfH + halfH;

    buddhaExclusionRect = {
      left: buddhaCenterX - buddhaHalfPxW,
      right: buddhaCenterX + buddhaHalfPxW,
      top: Math.min(bY1, bY2) - 4,
      bottom: Math.max(bY1, bY2) + 4,
    };

    // 2. Project Central Elevated Incense Altar Table Exclusion Zone (strictly within central aisle |x| <= 1.32)
    _aTop.set(0, 4.45, -10.8).project(camera);
    _aBot.set(0, 0.45, -10.0).project(camera);
    _aSide.set(1.32, 2.55, -10.4).project(camera);

    const altarCenterX = _aTop.x * halfW + halfW;
    const altarHalfPxW = Math.abs(_aSide.x * halfW + halfW - altarCenterX) + 2;
    const aY1 = -_aTop.y * halfH + halfH;
    const aY2 = -_aBot.y * halfH + halfH;
    altarExclusionRect = {
      left: altarCenterX - altarHalfPxW,
      right: altarCenterX + altarHalfPxW,
      top: Math.min(aY1, aY2),
      bottom: Math.max(aY1, aY2),
    };
  }

  // Optional corner HUD panel exclusion zones so labels never collide with edge panels
  const hudExclusionRects: ScreenRect[] = [buddhaExclusionRect, altarExclusionRect];
  if (showLeaderboard) {
    hudExclusionRects.push({
      left: 0,
      right: 106 * scale + 8,
      top: 0,
      bottom: topSafeY + 132 * scale,
    });
  }
  if (showGiftPanel) {
    hudExclusionRects.push({
      left: viewportWidth - (122 * scale + 8),
      right: viewportWidth,
      top: 0,
      bottom: topSafeY + 148 * scale,
    });
  }

  // 3. Project all candidates into screen space
  interface ProjectedItem {
    input: LabelCandidateInput;
    inFrustum: boolean;
    sx: number;
    sy: number;
    feetY: number;
    hasActiveBubble: boolean;
    bubbleAgeMs: number;
    priorityScore: number;
  }

  const projected: ProjectedItem[] = [];
  const placements = new Map<string, SolvedOverlayPlacement>();

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    _projVec.set(c.worldX, c.worldY + c.headY + 0.14, c.worldZ).project(camera);

    const inFrustum =
      _projVec.z >= -1 &&
      _projVec.z <= 1 &&
      _projVec.x >= -0.96 &&
      _projVec.x <= 0.96 &&
      _projVec.y >= -0.96 &&
      _projVec.y <= 0.96;

    const sx = _projVec.x * halfW + halfW;
    const sy = -_projVec.y * halfH + halfH;
    _projFeet.set(c.worldX, c.worldY + 0.04, c.worldZ).project(camera);
    const feetY = -_projFeet.y * halfH + halfH; // TINH_TAM_V179_LOI_DI_THANG

    const bubbleAgeMs =
      c.lastComment && c.lastCommentAt !== undefined ? now - c.lastCommentAt : Infinity;
    const hasActiveBubble = Boolean(
      showCommentBubbles && c.lastComment && bubbleAgeMs >= 0 && bubbleAgeMs < commentDurationMs,
    );

    const priorityScore =
      (c.isSpeaking ? 10000 : 0) +
      (hasActiveBubble ? 6000 + Math.max(0, 1000 - bubbleAgeMs * 0.2) : 0) +
      (c.isCeremonyActor ? 3500 : 0) +
      (c.isRecentlyActive ? 1200 : 0) +
      (c.worldZ + 20) * 18 -
      c.seatIndex * 0.25;

    projected.push({
      input: c,
      inFrustum,
      sx,
      sy,
      feetY,
      hasActiveBubble,
      bubbleAgeMs,
      priorityScore,
    });

    placements.set(c.userId, {
      userId: c.userId,
      username: c.username,
      anchorX: sx,
      anchorY: sy,
      nameVisible: false,
      nameOpacity: 0,
      nameX: sx,
      nameY: sy,
      nameRect: null,
      ritualLabelText: c.ritualStatusLabel || '',
      bubbleVisible: false,
      bubbleOpacity: 0,
      bubbleText: c.lastComment || '',
      bubbleX: sx,
      bubbleY: sy - 16 * scale,
      bubbleRect: null,
    });
  }

  const placedRects: ScreenRect[] = [];
  let visibleBubbleCount = 0;
  let visibleNameCount = 0;

  // Place a participant's comment and name as one head-anchored vertical stack.
  // Comments are rendered ABOVE the name. In crowded views hide lower-priority
  // stacks rather than disconnecting them from their owner's 3D head position.
  const ordered = projected
    .filter((p) => p.inFrustum)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const isAvailable = (rect: ScreenRect): boolean =>
    isRectInsideViewport(rect, viewportWidth, viewportHeight, edgePad) &&
    !hudExclusionRects.some((ex) => screenRectsOverlap(rect, ex, 2)) &&
    !placedRects.some((pr) => screenRectsOverlap(rect, pr, 3));

  for (const item of ordered) {
    const out = placements.get(item.input.userId)!;
    const hasName = showUsernames;
    const hasBubble = showCommentBubbles && item.hasActiveBubble;
    if (!hasName && !hasBubble) continue;

    const nameWidth = namePlateWidth * scale;
    const nameHeight = namePlateHeight * scale;
    const bubble = hasBubble
      ? estimateBubbleDims(scale, commentBubbleWidth, commentBubbleHeight)
      : null;
    // Nameplate TOP starts slightly below projected feet. It never floats above the head.
    const baseNameBottom = item.feetY + (namePlateHeight + namePlateOffsetY) * scale; // TINH_TAM_V1852_LABEL_UI
    const baseBubbleBottom = item.sy - 6 * scale;

    let bestNameRect: ScreenRect | null = null;
    let bestBubbleRect: ScreenRect | null = null;
    let bestNameX = item.sx;
    let bestNameY = baseNameBottom;
    let bestBubbleX = item.sx;
    let bestBubbleY = baseBubbleBottom;

    for (const [offsetX, offsetY] of HEAD_STACK_OFFSETS) {
      const cx = item.sx + offsetX * scale;
      const nameBottom = baseNameBottom + offsetY * scale;
      const nameRect: ScreenRect = {
        left: cx - nameWidth * 0.5,
        right: cx + nameWidth * 0.5,
        top: nameBottom - nameHeight,
        bottom: nameBottom,
      };
      const bubbleBottom = baseBubbleBottom + offsetY * scale;
      const bubbleRect: ScreenRect | null = bubble
        ? {
            left: cx - bubble.width * 0.5,
            right: cx + bubble.width * 0.5,
            top: bubbleBottom - bubble.height,
            bottom: bubbleBottom,
          }
        : null;

      if (hasName && !isAvailable(nameRect)) continue;
      if (bubbleRect && !isAvailable(bubbleRect)) continue;

      bestNameRect = hasName ? nameRect : null;
      bestBubbleRect = bubbleRect;
      bestNameX = cx;
      bestNameY = nameBottom;
      bestBubbleX = cx;
      bestBubbleY = bubbleBottom;
      break;
    }

    // When a long bubble cannot fit, preserve a compact name label at the head.
    // Never move the bubble far away or attach it to another participant.
    if (!bestNameRect && !bestBubbleRect && hasName) {
      for (const [offsetX, offsetY] of HEAD_STACK_OFFSETS) {
        const cx = item.sx + offsetX * scale;
        const by = baseNameBottom + offsetY * scale;
        const nameRect = {
          left: cx - nameWidth * 0.5,
          right: cx + nameWidth * 0.5,
          top: by - nameHeight,
          bottom: by,
        };
        if (!isAvailable(nameRect)) continue;
        bestNameRect = nameRect;
        bestNameX = cx;
        bestNameY = by;
        break;
      }
    }

    // Allow a comment to remain above the head even if the username is hidden
    // in a very dense scene, while respecting the exact same tight anchor.
    if (!bestNameRect && !bestBubbleRect && bubble) {
      for (const [offsetX, offsetY] of HEAD_STACK_OFFSETS) {
        const cx = item.sx + offsetX * scale;
        const by = baseBubbleBottom + offsetY * scale;
        const bubbleRect = {
          left: cx - bubble.width * 0.5,
          right: cx + bubble.width * 0.5,
          top: by - bubble.height,
          bottom: by,
        };
        if (!isAvailable(bubbleRect)) continue;
        bestBubbleRect = bubbleRect;
        bestBubbleX = cx;
        bestBubbleY = by;
        break;
      }
    }

    // CHUA_REPEAT_COMMENT_FIX_V1: NEVER silently discard a valid new comment.
    // Seated worshippers can be surrounded by other nameplates, so the normal
    // collision-free pass above may fail even though their comment was received.
    // Prefer nearby spots outside Buddha/altar/panels; relax ONLY overlap with
    // other names/bubbles, not the position of the actual worshipper.
    if (bubble && !bestBubbleRect) {
      const minX = edgePad + bubble.width * 0.5;
      const maxX = viewportWidth - edgePad - bubble.width * 0.5;
      const clampedX = Math.max(minX, Math.min(maxX, item.sx));
      const candidateBottom = baseBubbleBottom;
      const minBottom = edgePad + bubble.height;
      const maxBottom = viewportHeight - edgePad;
      // CHUA_BUBBLE_COLLISION_SAFE_V1: search free rows lower in the
      // portrait frame before hiding a lower-priority bubble. Keep the original
      // near-head offsets first; only extend search in crowded scenes.
      // CHUA_BUBBLE_5S_NO_OVERLAP_V2: check the last usable portrait rows as
      // well, so five simultaneous comments can remain visible without overlaps.
      const yOffsets = [0, -16, 16, -32, 32, -55, 55, -85, 85, 135, 195, 255, 315, 330, 345, 360];
      const xOffsets = [0, -18, 18, -40, 40];

      for (const dy of yOffsets) {
        if (bestBubbleRect) break;
        for (const dx of xOffsets) {
          const bx = Math.max(minX, Math.min(maxX, clampedX + dx * scale));
          const by = Math.max(minBottom, Math.min(maxBottom, candidateBottom + dy * scale));
          const rect: ScreenRect = {
            left: bx - bubble.width * 0.5,
            right: bx + bubble.width * 0.5,
            top: by - bubble.height,
            bottom: by,
          };
          // Check other placed bubbles/names, HUD, Buddha and viewport.
          // Do not overlap the current worshipper's name either.
          if (!isAvailable(rect)) continue;
          if (bestNameRect && screenRectsOverlap(rect, bestNameRect, 2)) continue;
          bestBubbleRect = rect;
          bestBubbleX = bx;
          bestBubbleY = by;
          break;
        }
      }

      // If all safe positions are occupied, do not force a collision.
      // Existing comment events and voice processing are unaffected; only the
      // overcrowded screen bubble can be temporarily hidden.
      // CHUA_BUBBLE_COLLISION_SAFE_V1
    }

    // Persistent identity labels must never time out or vanish due to crowd collisions.
    // If all collision-free positions are occupied, allow only the NAME to overlap as
    // a last resort while keeping it close to the projected head and inside the frame.
    if (!bestNameRect && hasName) {
      const cx = Math.min(
        viewportWidth - edgePad - nameWidth * 0.5,
        Math.max(edgePad + nameWidth * 0.5, item.sx),
      );
      const nameBottom = Math.min(
        viewportHeight - edgePad,
        Math.max(edgePad + nameHeight, baseNameBottom),
      );
      bestNameX = cx;
      bestNameY = nameBottom;
      bestNameRect = {
        left: cx - nameWidth * 0.5,
        right: cx + nameWidth * 0.5,
        top: nameBottom - nameHeight,
        bottom: nameBottom,
      };
    }

    if (bestNameRect) {
      out.nameVisible = true;
      out.nameX = bestNameX;
      out.nameY = bestNameY;
      out.nameRect = bestNameRect;
      out.nameOpacity = 1;
      placedRects.push(bestNameRect);
      visibleNameCount++;
    }
    if (bestBubbleRect) {
      const fadeStartMs = commentDurationMs - 1000;
      const fadeRatio = item.bubbleAgeMs <= fadeStartMs
        ? 1
        : Math.max(0, 1 - (item.bubbleAgeMs - fadeStartMs) / 1000);
      out.bubbleVisible = fadeRatio > 0.02;
      out.bubbleOpacity = Number(fadeRatio.toFixed(2));
      out.bubbleX = bestBubbleX;
      out.bubbleY = bestBubbleY;
      out.bubbleRect = bestBubbleRect;
      if (out.bubbleVisible) {
        placedRects.push(bestBubbleRect);
        visibleBubbleCount++;
      }
    }
  }

  // CHUA_BUBBLE_GROUP_REFLOW_V3: The original greedy head placement can leave
  // gaps that are individually too short for the next valid 5-second comment.
  // Reflow the active group ONLY when at least one active comment was hidden.
  // Keep all existing name labels, and leave normal (non-crowded) layouts alone.
  const activeComments = ordered.filter((item) => item.hasActiveBubble);
  if (
    activeComments.length > 1 &&
    activeComments.some((item) => !placements.get(item.input.userId)?.bubbleVisible)
  ) {
    const reservedNames = Array.from(placements.values())
      .filter((placement) => placement.nameVisible && placement.nameRect)
      .map((placement) => placement.nameRect!);
    const reflowBubbles: ScreenRect[] = [];
    visibleBubbleCount = 0;

    // Render the most recent/prioritized comments first. Limit extra layout
    // work on a crowded stream; remaining comments still exist in event data.
    for (const [index, item] of activeComments.entries()) {
      const out = placements.get(item.input.userId)!;
      out.bubbleVisible = false;
      out.bubbleRect = null;
      out.bubbleOpacity = 0;
      if (index >= 16) continue;

      const bubble = estimateBubbleDims(scale, commentBubbleWidth, commentBubbleHeight);
      const minX = edgePad + bubble.width * 0.5;
      const maxX = viewportWidth - edgePad - bubble.width * 0.5;
      if (minX > maxX) continue;
      const clampedX = Math.max(minX, Math.min(maxX, item.sx));
      let allocated: ScreenRect | null = null;
      let allocatedX = clampedX;
      let allocatedY = 0;

      // Compact packing from the bottom upward avoids fragmented free gaps.
      // Apply the same viewport/Buddha/altar/HUD/name checks to every position.
      for (let bottom = viewportHeight - edgePad; bottom >= edgePad + bubble.height; bottom -= 4) {
        for (const dx of [0, -36, 36, -72, 72, -108, 108, -144, 144]) {
          const cx = Math.max(minX, Math.min(maxX, clampedX + dx * scale));
          const rect: ScreenRect = {
            left: cx - bubble.width * 0.5,
            right: cx + bubble.width * 0.5,
            top: bottom - bubble.height,
            bottom,
          };
          if (!isRectInsideViewport(rect, viewportWidth, viewportHeight, edgePad)) continue;
          // Reserve the very top strip for the existing LIVE header.
          if (rect.top < topSafeY + 4) continue;
          if (hudExclusionRects.some((ex) => screenRectsOverlap(rect, ex, 2))) continue;
          if (reservedNames.some((name) => screenRectsOverlap(rect, name, 3))) continue;
          if (reflowBubbles.some((occupied) => screenRectsOverlap(rect, occupied, 3))) continue;
          allocated = rect;
          allocatedX = cx;
          allocatedY = bottom;
          break;
        }
        if (allocated) break;
      }
      if (!allocated) continue;
      const fadeStartMs = commentDurationMs - 1000;
      const fadeRatio = item.bubbleAgeMs <= fadeStartMs
        ? 1
        : Math.max(0, 1 - (item.bubbleAgeMs - fadeStartMs) / 1000);
      out.bubbleVisible = fadeRatio > 0.02;
      out.bubbleOpacity = Number(fadeRatio.toFixed(2));
      if (!out.bubbleVisible) continue;
      out.bubbleX = allocatedX;
      out.bubbleY = allocatedY;
      out.bubbleRect = allocated;
      reflowBubbles.push(allocated);
      visibleBubbleCount++;
    }
  }

  return {
    placements,
    items: Array.from(placements.values()),
    buddhaExclusionRect,
    altarExclusionRect,
    visibleNameCount,
    visibleBubbleCount,
  };
}
