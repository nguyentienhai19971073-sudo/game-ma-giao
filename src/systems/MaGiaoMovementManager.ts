/**
 * MA GIÁO ONLINE – THIÊN HẠ ĐỆ NHẤT TÀ PHÁI
 * Dynamic 2D Movement, Activity FSM & Zone Collision Manager
 */

import {
  MaGiaoAction,
  MaGiaoFacing,
  MaGiaoParticipant,
  MaGiaoRankId,
  MaGiaoSettings,
  MaGiaoZoneDef,
  MaGiaoZoneId,
} from '../types/magiao';

export const PALACE_ZONES: Record<MaGiaoZoneId, MaGiaoZoneDef> = {
  ZONE_A_THRONE: {
    id: 'ZONE_A_THRONE',
    name: 'Khu Ngai Giáo Chủ',
    description: 'Thềm ngai vàng uy nghiêm, nơi diện kiến và bái chào Giáo Chủ',
    bounds: [{ minX: 42, maxX: 58, minY: 32, maxY: 38 }],
    allowedActions: ['bow', 'idle', 'cheer', 'stand_up'],
    maxOccupancy: 4,
  },
  ZONE_B_AISLE: {
    id: 'ZONE_B_AISLE',
    name: 'Hành Lang Trung Tâm',
    description: 'Lối đi chính giữa điện, kết nối cổng chính lên ngai vàng',
    bounds: [{ minX: 44, maxX: 56, minY: 38, maxY: 92 }],
    allowedActions: ['walk', 'run', 'bow', 'idle'],
    maxOccupancy: 12,
  },
  ZONE_C_MARTIAL: {
    id: 'ZONE_C_MARTIAL',
    name: 'Sân Luyện Võ Cung Điện',
    description: 'Hai khoảng sân hai bên điện để đệ tử thi triển quyền cước',
    bounds: [
      { minX: 8, maxX: 38, minY: 48, maxY: 70 }, // Left martial yard
      { minX: 62, maxX: 92, minY: 48, maxY: 70 }, // Right martial yard
    ],
    allowedActions: ['punch', 'kick', 'combo', 'jump', 'dodge', 'idle', 'cheer', 'fail'],
    maxOccupancy: 28,
  },
  ZONE_D_MEDITATE: {
    id: 'ZONE_D_MEDITATE',
    name: 'Khu Thiền Định & Bồ Đoàn',
    description: 'Khu vực bồ đoàn trải chiếu đệm để tĩnh tâm tu luyện ma công',
    bounds: [
      { minX: 8, maxX: 38, minY: 72, maxY: 90 }, // Left meditation wing
      { minX: 62, maxX: 92, minY: 72, maxY: 90 }, // Right meditation wing
    ],
    allowedActions: ['meditate', 'stand_up', 'idle'],
    maxOccupancy: 30,
  },
  ZONE_E_SOCIAL: {
    id: 'ZONE_E_SOCIAL',
    name: 'Khu Giao Lưu & Đàm Đạo',
    description: 'Hàng lang cánh trên, nơi đệ tử tụ tập trò chuyện và ngắm Giáo Chủ',
    bounds: [
      { minX: 12, maxX: 38, minY: 36, maxY: 46 }, // Left social balcony
      { minX: 62, maxX: 88, minY: 36, maxY: 46 }, // Right social balcony
    ],
    allowedActions: ['idle', 'laugh', 'cheer', 'walk', 'fail'],
    maxOccupancy: 16,
  },
};

// Impassable obstacles (Throne platform + pillars)
export const OBSTACLES = [
  { minX: 36, maxX: 64, minY: 15, maxY: 31 }, // Throne & backdrop
  { minX: 4, maxX: 8, minY: 30, maxY: 95 }, // Left wall
  { minX: 92, maxX: 96, minY: 30, maxY: 95 }, // Right wall
];

export class MaGiaoMovementManager {
  private lastUpdate: number = Date.now();
  private baseSeatMats: { x: number; y: number }[] = [];

  constructor() {
    this.initBaseMats();
  }

  /**
   * Precalculate 80 base prayer mat positions in grand palace.
   * Left side: 4 columns x 10 rows (seats 0..39)
   * Right side: 4 columns x 10 rows (seats 40..79)
   */
  private initBaseMats() {
    this.baseSeatMats = [];
    const rows = 10;
    const cols = 4;

    // Left Wing (seats 0..39)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 11 + c * 7.2;
        const y = 40 + r * 5.2;
        this.baseSeatMats.push({ x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) });
      }
    }

    // Right Wing (seats 40..79)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 63 + c * 7.2;
        const y = 40 + r * 5.2;
        this.baseSeatMats.push({ x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) });
      }
    }
  }

  /**
   * Get home mat coordinates for a given seat index
   */
  public getHomeMat(seatIndex: number): { x: number; y: number } {
    const idx = Math.max(0, Math.min(this.baseSeatMats.length - 1, seatIndex));
    return this.baseSeatMats[idx] || { x: 50, y: 80 };
  }

  /**
   * Identify which functional palace zone a coordinate falls into
   */
  public getZoneAt(x: number, y: number): MaGiaoZoneId {
    for (const [zoneId, zoneDef] of Object.entries(PALACE_ZONES)) {
      for (const b of zoneDef.bounds) {
        if (x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY) {
          return zoneId as MaGiaoZoneId;
        }
      }
    }
    // Default to central aisle or closest area
    if (x >= 40 && x <= 60) return 'ZONE_B_AISLE';
    if (y < 48) return 'ZONE_E_SOCIAL';
    if (y < 71) return 'ZONE_C_MARTIAL';
    return 'ZONE_D_MEDITATE';
  }

  /**
   * Clamp point inside walkable grand palace interior bounds
   */
  public clampPoint(x: number, y: number): { x: number; y: number } {
    let clampedX = Math.max(10, Math.min(90, x));
    let clampedY = Math.max(34, Math.min(92, y));

    // Avoid throne obstacle
    if (clampedX >= 36 && clampedX <= 64 && clampedY < 32) {
      clampedY = 34;
    }

    return { x: clampedX, y: clampedY };
  }

  /**
   * Pick a valid random coordinate inside a specific zone
   */
  public getRandomPointInZone(zoneId: MaGiaoZoneId): { x: number; y: number } {
    const def = PALACE_ZONES[zoneId] || PALACE_ZONES.ZONE_B_AISLE;
    const bound = def.bounds[Math.floor(Math.random() * def.bounds.length)];
    const x = bound.minX + Math.random() * (bound.maxX - bound.minX);
    const y = bound.minY + Math.random() * (bound.maxY - bound.minY);
    return this.clampPoint(x, y);
  }

  /**
   * Parse viewer comments into action requests
   */
  public parseCommentToAction(comment: string): {
    action?: MaGiaoAction;
    zonePreference?: MaGiaoZoneId;
    isRun?: boolean;
  } | null {
    const raw = comment.toLowerCase().trim();
    const padded = ` ${raw.replace(/[,.!?~]/g, ' ')} `;

    const hasExact = (words: string[]) =>
      words.some((w) => padded.includes(` ${w} `));

    const hasAnywhere = (sub: string[]) =>
      sub.some((s) => padded.includes(s));

    // 1. Specific martial arts actions (priority over generic particles)
    if (hasAnywhere(['múa', 'combo', 'luyện võ', 'biểu diễn'])) {
      return { action: 'combo', zonePreference: 'ZONE_C_MARTIAL' };
    }
    if (hasAnywhere(['đấm', 'punch', 'ma quyền'])) {
      return { action: 'punch', zonePreference: 'ZONE_C_MARTIAL' };
    }
    if (hasAnywhere(['đá', 'kick', 'cước'])) {
      return { action: 'kick', zonePreference: 'ZONE_C_MARTIAL' };
    }
    if (hasAnywhere(['nhảy', 'jump'])) {
      return { action: 'jump', zonePreference: 'ZONE_C_MARTIAL' };
    }
    if (hasAnywhere(['né', 'dodge', 'tránh'])) {
      return { action: 'dodge', zonePreference: 'ZONE_C_MARTIAL' };
    }
    if (hasAnywhere(['thiền', 'tĩnh tâm', 'meditate', 'ngồi xếp bằng'])) {
      return { action: 'meditate', zonePreference: 'ZONE_D_MEDITATE' };
    }
    if (hasAnywhere(['đứng dậy', 'đứng lên', 'stand'])) {
      return { action: 'stand_up' };
    }
    if (hasAnywhere(['chào', 'bái', 'kính chào', 'bow'])) {
      return { action: 'bow', zonePreference: 'ZONE_A_THRONE' };
    }
    if (hasAnywhere(['cười', 'haha', 'hihi', 'laugh'])) {
      return { action: 'laugh', zonePreference: 'ZONE_E_SOCIAL' };
    }
    if (hasAnywhere(['vỗ tay', 'hoan hô', 'cheer', 'chúc mừng'])) {
      return { action: 'cheer' };
    }
    if (hasAnywhere(['ngã', 'trượt', 'té', 'fail', 'ngã rồi'])) {
      return { action: 'fail' };
    }
    if (hasAnywhere(['rút lui', 'leave', 'đi ra', 'ra về'])) {
      return { action: 'leave', zonePreference: 'ZONE_B_AISLE' };
    }

    // 2. Running vs Walking commands
    if (hasExact(['chạy', 'mau', 'run', 'nhanh']) || hasAnywhere(['chạy mau', 'chạy nhanh'])) {
      return { action: 'run', isRun: true };
    }
    if (hasExact(['đi', 'bước', 'dạo', 'walk', 'đứng']) || hasAnywhere(['đi dạo', 'đi dạo sảnh', 'bước đi'])) {
      if (hasExact(['đứng'])) return { action: 'stand_up' };
      return { action: 'walk', isRun: false };
    }

    return null;
  }

  /**
   * Determine facing direction based on movement vector
   */
  public calculateFacing(
    currentX: number,
    currentY: number,
    targetX: number,
    targetY: number
  ): MaGiaoFacing {
    const dx = targetX - currentX;
    const dy = targetY - currentY;

    if (Math.abs(dy) > Math.abs(dx)) {
      // dy < 0 means moving upward on screen toward the throne
      return dy < 0 ? 'back' : 'front';
    } else {
      return dx < 0 ? 'left' : 'right';
    }
  }

  /**
   * Assign a new autonomous behavioral goal to a participant
   */
  public assignAutonomousGoal(
    p: MaGiaoParticipant,
    settings: MaGiaoSettings,
    movingCount: number
  ): void {
    const now = Date.now();
    // Cap concurrent moving entities
    const canMove = movingCount < settings.maxConcurrentMoving;

    // Pick behavior based on current rank and activity preferences
    const roll = Math.random();

    // 1. High rank (Hộ Pháp, Đại Trưởng Lão, Đồng Tôn, Tân Giáo Chủ) might pay homage to Throne
    const isHighRank = ['HO_PHAP', 'DAI_TRUONG_LAO', 'DONG_TON_GIAO_CHU', 'TAN_GIAO_CHU'].includes(
      p.rank
    );

    if (isHighRank && roll < 0.25 && canMove) {
      // Approach Zone A to bow to Cult Leader
      const pt = this.getRandomPointInZone('ZONE_A_THRONE');
      p.targetX = pt.x;
      p.targetY = pt.y;
      p.actionState = 'walk';
      p.facing = this.calculateFacing(p.x, p.y, pt.x, pt.y);
      p.actionExpiresAt = now + 4000;
      return;
    }

    // 2. Martial Training (Zone C)
    if (settings.autoMartialEnabled && roll < 0.55) {
      if (p.currentZone !== 'ZONE_C_MARTIAL' && canMove) {
        // Move to martial yard
        const pt = this.getRandomPointInZone('ZONE_C_MARTIAL');
        p.targetX = pt.x;
        p.targetY = pt.y;
        p.actionState = Math.random() < 0.3 ? 'run' : 'walk';
        p.facing = this.calculateFacing(p.x, p.y, pt.x, pt.y);
        p.actionExpiresAt = now + 5000;
      } else {
        // In martial yard: execute martial combos
        const moves: MaGiaoAction[] = ['punch', 'kick', 'combo', 'jump', 'dodge'];
        p.actionState = moves[Math.floor(Math.random() * moves.length)];
        p.facing = Math.random() < 0.5 ? 'front' : Math.random() < 0.5 ? 'left' : 'right';
        p.actionExpiresAt = now + (settings.martialDurationSec * 1000) / 2 + Math.random() * 2000;
        // Occasional comical fail
        if (Math.random() < 0.08) {
          p.actionState = 'fail';
          p.actionExpiresAt = now + 2500;
        }
      }
      return;
    }

    // 3. Meditation (Zone D)
    if (settings.autoMeditateEnabled && roll < 0.8) {
      if (p.currentZone !== 'ZONE_D_MEDITATE' && canMove) {
        // Move to meditation mat
        const pt = this.getRandomPointInZone('ZONE_D_MEDITATE');
        p.targetX = pt.x;
        p.targetY = pt.y;
        p.actionState = 'walk';
        p.facing = this.calculateFacing(p.x, p.y, pt.x, pt.y);
        p.actionExpiresAt = now + 6000;
      } else {
        // Sit in meditation
        p.actionState = 'meditate';
        p.facing = 'front';
        p.actionExpiresAt = now + settings.meditateDurationSec * 1000 + Math.random() * 4000;
      }
      return;
    }

    // 4. Socializing / Chatting (Zone E or Corridor)
    if (settings.autoSocialEnabled && roll < 0.92) {
      if (p.currentZone !== 'ZONE_E_SOCIAL' && canMove) {
        const pt = this.getRandomPointInZone('ZONE_E_SOCIAL');
        p.targetX = pt.x;
        p.targetY = pt.y;
        p.actionState = 'walk';
        p.facing = this.calculateFacing(p.x, p.y, pt.x, pt.y);
        p.actionExpiresAt = now + 5000;
      } else {
        const socialActions: MaGiaoAction[] = ['laugh', 'cheer', 'idle'];
        p.actionState = socialActions[Math.floor(Math.random() * socialActions.length)];
        p.facing = Math.random() < 0.5 ? 'left' : 'right';
        p.actionExpiresAt = now + 4000 + Math.random() * 3000;
      }
      return;
    }

    // 5. Wander in central corridor or return toward home mat
    if (canMove && Math.random() < 0.4) {
      const pt = Math.random() < 0.5 ? this.getRandomPointInZone('ZONE_B_AISLE') : this.getHomeMat(p.seatIndex);
      p.targetX = pt.x;
      p.targetY = pt.y;
      p.actionState = 'walk';
      p.facing = this.calculateFacing(p.x, p.y, pt.x, pt.y);
      p.actionExpiresAt = now + 5000;
    } else {
      p.actionState = 'idle';
      p.facing = 'front';
      p.actionExpiresAt = now + 3000 + Math.random() * 3000;
    }
  }

  /**
   * Main step simulation: updates participant positions, collision repulsion, and state transitions
   */
  public updateSimulation(
    participants: MaGiaoParticipant[],
    settings: MaGiaoSettings,
    deltaSec: number
  ): void {
    const now = Date.now();
    const cappedDelta = Math.min(deltaSec, 0.1); // Avoid huge skips on tab background
    const baseSpeed = 4.5 * settings.moveSpeed; // % screen width per second

    let currentlyMoving = participants.filter(
      (p) => p.actionState === 'walk' || p.actionState === 'run' || p.actionState === 'leave'
    ).length;

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];

      // Handle Sweeper broom state
      if (p.isSweeping) {
        p.actionState = 'sweeping';
        // Wandering around the edges
        if (!p.targetX || (p.x === p.targetX && p.y === p.targetY)) {
          const pt = this.clampPoint(
            15 + Math.random() * 70,
            50 + Math.random() * 40
          );
          p.targetX = pt.x;
          p.targetY = pt.y;
        }
      }

      // Check if target is set and moving
      if (
        (p.actionState === 'walk' || p.actionState === 'run' || p.actionState === 'leave' || p.isSweeping) &&
        p.targetX !== undefined &&
        p.targetY !== undefined
      ) {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.6) {
          // Arrived at destination!
          p.x = p.targetX;
          p.y = p.targetY;
          delete p.targetX;
          delete p.targetY;
          p.currentZone = this.getZoneAt(p.x, p.y);

          // Arrived behavior based on zone
          if (p.currentZone === 'ZONE_A_THRONE') {
            p.actionState = 'bow';
            p.facing = 'back';
            p.actionExpiresAt = now + 3500;
          } else if (p.currentZone === 'ZONE_C_MARTIAL') {
            p.actionState = Math.random() < 0.5 ? 'combo' : 'punch';
            p.facing = 'front';
            p.actionExpiresAt = now + settings.martialDurationSec * 1000;
          } else if (p.currentZone === 'ZONE_D_MEDITATE') {
            p.actionState = 'meditate';
            p.facing = 'front';
            p.actionExpiresAt = now + settings.meditateDurationSec * 1000;
          } else if (p.currentZone === 'ZONE_E_SOCIAL') {
            p.actionState = Math.random() < 0.5 ? 'laugh' : 'cheer';
            p.facing = Math.random() < 0.5 ? 'left' : 'right';
            p.actionExpiresAt = now + 4000;
          } else {
            p.actionState = 'idle';
            p.facing = 'front';
            p.actionExpiresAt = now + 3000;
          }
        } else {
          // Keep moving towards target
          const speedMultiplier = p.actionState === 'run' ? 1.8 : 1.0;
          const step = (baseSpeed * speedMultiplier * cappedDelta);
          const ratio = Math.min(1, step / dist);
          p.x += dx * ratio;
          p.y += dy * ratio;
          p.facing = this.calculateFacing(p.x, p.y, p.targetX, p.targetY);
          p.currentZone = this.getZoneAt(p.x, p.y);
        }
      } else {
        // Not moving: check if current stationary action expired
        if (
          settings.autoRoamEnabled &&
          (!p.actionExpiresAt || now >= p.actionExpiresAt)
        ) {
          // If meditating, stand up first
          if (p.actionState === 'meditate') {
            p.actionState = 'stand_up';
            p.actionExpiresAt = now + 1500;
          } else {
            this.assignAutonomousGoal(p, settings, currentlyMoving);
            if (p.actionState === 'walk' || p.actionState === 'run') {
              currentlyMoving++;
            }
          }
        }
      }
    }

    // Apply soft collision repulsion so characters don't stack on exact same spot
    this.applySoftCollisionRepulsion(participants, settings.collisionAvoidanceDist);
  }

  /**
   * Gently nudge overlapping characters apart without jitter
   */
  private applySoftCollisionRepulsion(participants: MaGiaoParticipant[], minDist: number): void {
    const len = participants.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const p1 = participants[i];
        const p2 = participants[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.001 && dist < minDist) {
          const overlap = (minDist - dist) * 0.15; // gentle nudge factor
          const nx = (dx / dist) * overlap;
          const ny = (dy / dist) * overlap;

          // Only nudge if not fixed in meditation
          if (p1.actionState !== 'meditate') {
            p1.x = Math.max(10, Math.min(90, p1.x - nx));
            p1.y = Math.max(34, Math.min(92, p1.y - ny));
          }
          if (p2.actionState !== 'meditate') {
            p2.x = Math.max(10, Math.min(90, p2.x + nx));
            p2.y = Math.max(34, Math.min(92, p2.y + ny));
          }
        }
      }
    }
  }

  /**
   * Cult Leader / Admin Mass Order: Tất cả đệ tử vào đội hình (Return to base mats)
   */
  public orderFormation(participants: MaGiaoParticipant[]): void {
    const now = Date.now();
    for (const p of participants) {
      const mat = this.getHomeMat(p.seatIndex);
      p.targetX = mat.x;
      p.targetY = mat.y;
      p.actionState = 'run';
      p.facing = this.calculateFacing(p.x, p.y, mat.x, mat.y);
      p.actionExpiresAt = now + 7000;
    }
  }

  /**
   * Cult Leader / Admin Mass Order: Tất cả đồ đệ! Mau đứng dậy luyện võ!
   */
  public orderAllMartial(participants: MaGiaoParticipant[]): void {
    const now = Date.now();
    for (const p of participants) {
      delete p.targetX;
      delete p.targetY;
      p.actionState = 'combo';
      p.facing = Math.random() < 0.5 ? 'front' : Math.random() < 0.5 ? 'left' : 'right';
      p.actionExpiresAt = now + 12000;
    }
  }

  /**
   * Cult Leader / Admin Mass Order: Người nào mệt rồi thì mau đi thiền định!
   */
  public orderAllMeditate(participants: MaGiaoParticipant[]): void {
    const now = Date.now();
    for (const p of participants) {
      delete p.targetX;
      delete p.targetY;
      p.actionState = 'meditate';
      p.facing = 'front';
      p.actionExpiresAt = now + 20000;
    }
  }

  /**
   * Cult Leader / Admin Mass Order: Tất cả đệ tử hoan hô Giáo Chủ!
   */
  public orderAllCheer(participants: MaGiaoParticipant[]): void {
    const now = Date.now();
    for (const p of participants) {
      delete p.targetX;
      delete p.targetY;
      p.actionState = 'cheer';
      p.facing = 'back'; // Facing toward throne!
      p.actionExpiresAt = now + 8000;
    }
  }

  /**
   * Cult Leader summons a specific disciple to step before the throne
   */
  public summonToThrone(p: MaGiaoParticipant): void {
    const now = Date.now();
    p.targetX = 50;
    p.targetY = 35;
    p.actionState = 'run';
    p.facing = 'back';
    p.actionExpiresAt = now + 6000;
  }
}

export const maGiaoMovementManager = new MaGiaoMovementManager();
