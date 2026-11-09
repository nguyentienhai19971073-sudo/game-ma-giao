/**
 * MA GIÁO ONLINE – THIÊN HẠ ĐỆ NHẤT TÀ PHÁI
 * SectLeaderAnimationController:
 * High-precision Finite State Machine controlling Cult Leader 2D animations,
 * physical locomotion between throne and palace floor, prioritized animation interrupts,
 * synchronized viseme lip-sync speech, and 3 personality behavioral modes.
 */

import {
  CultLeaderAnimId,
  LeaderFsmState,
  LeaderPersonality,
  LeaderVisualState,
  MaGiaoSettings,
} from '../types/magiao';
import { maGiaoVoiceManager } from './MaGiaoVoiceManager';

export interface LeaderAnimMeta {
  id: CultLeaderAnimId;
  name: string;
  group: 'SEATED' | 'MOVEMENT' | 'MARTIAL' | 'EXPRESSION' | 'INTERACTION';
  defaultDurationMs: number;
  requiresStanding: boolean;
  eyeState: LeaderVisualState['eyeState'];
  browState: LeaderVisualState['browState'];
  auraEffect: LeaderVisualState['auraEffect'];
  targetY?: number;
}

export const LEADER_ANIM_REGISTRY: Record<CultLeaderAnimId, LeaderAnimMeta> = {
  // --- NHÓM A: SINH HOẠT TRÊN NGAI (1-8) ---
  throne_idle: {
    id: 'throne_idle',
    name: 'Ngồi Uy Nghiêm',
    group: 'SEATED',
    defaultDurationMs: 6000,
    requiresStanding: false,
    eyeState: 'normal',
    browState: 'normal',
    auraEffect: 'normal',
    targetY: 22,
  },
  stroke_beard: {
    id: 'stroke_beard',
    name: 'Vuốt Cằm Suy Nghĩ',
    group: 'SEATED',
    defaultDurationMs: 3800,
    requiresStanding: false,
    eyeState: 'normal',
    browState: 'raised',
    auraEffect: 'normal',
    targetY: 22,
  },
  drink_tea: {
    id: 'drink_tea',
    name: 'Thưởng Trà Ma Đạo',
    group: 'SEATED',
    defaultDurationMs: 4200,
    requiresStanding: false,
    eyeState: 'normal',
    browState: 'normal',
    auraEffect: 'none',
    targetY: 22,
  },
  evil_laugh: {
    id: 'evil_laugh',
    name: 'Ngửa Đầu Cười Lớn',
    group: 'SEATED',
    defaultDurationMs: 3500,
    requiresStanding: false,
    eyeState: 'laugh',
    browState: 'arrogant',
    auraEffect: 'normal',
    targetY: 22,
  },
  doze_off: {
    id: 'doze_off',
    name: 'Ngủ Gật Giật Mình',
    group: 'SEATED',
    defaultDurationMs: 4500,
    requiresStanding: false,
    eyeState: 'dozing',
    browState: 'normal',
    auraEffect: 'none',
    targetY: 22,
  },
  tap_throne: {
    id: 'tap_throne',
    name: 'Gõ Tay Thành Ngai',
    group: 'SEATED',
    defaultDurationMs: 3200,
    requiresStanding: false,
    eyeState: 'normal',
    browState: 'arrogant',
    auraEffect: 'normal',
    targetY: 22,
  },
  fan_self: {
    id: 'fan_self',
    name: 'Phẩy Quạt Kiêu Ngạo',
    group: 'SEATED',
    defaultDurationMs: 3800,
    requiresStanding: false,
    eyeState: 'normal',
    browState: 'arrogant',
    auraEffect: 'normal',
    targetY: 22,
  },
  bored_pose: {
    id: 'bored_pose',
    name: 'Chống Cằm Chán Nản',
    group: 'SEATED',
    defaultDurationMs: 4000,
    requiresStanding: false,
    eyeState: 'bored',
    browState: 'normal',
    auraEffect: 'none',
    targetY: 22,
  },

  // --- NHÓM B: ĐỨNG DẬY VÀ DI CHUYỂN (9-15) ---
  stand_from_throne: {
    id: 'stand_from_throne',
    name: 'Đứng Dậy Khỏi Ngai',
    group: 'MOVEMENT',
    defaultDurationMs: 2500,
    requiresStanding: true,
    eyeState: 'normal',
    browState: 'arrogant',
    auraEffect: 'normal',
    targetY: 24,
  },
  walk_down_steps: {
    id: 'walk_down_steps',
    name: 'Bước Xuống Bậc Thềm',
    group: 'MOVEMENT',
    defaultDurationMs: 3500,
    requiresStanding: true,
    eyeState: 'normal',
    browState: 'arrogant',
    auraEffect: 'normal',
    targetY: 34,
  },
  patrol_hall: {
    id: 'patrol_hall',
    name: 'Đi Tuần Đại Điện',
    group: 'MOVEMENT',
    defaultDurationMs: 6500,
    requiresStanding: true,
    eyeState: 'normal',
    browState: 'arrogant',
    auraEffect: 'normal',
    targetY: 42,
  },
  hands_behind_back: {
    id: 'hands_behind_back',
    name: 'Chắp Tay Sau Lưng',
    group: 'MOVEMENT',
    defaultDurationMs: 4500,
    requiresStanding: true,
    eyeState: 'normal',
    browState: 'arrogant',
    auraEffect: 'normal',
    targetY: 36,
  },
  turn_around: {
    id: 'turn_around',
    name: 'Xoay Người Đổi Hướng',
    group: 'MOVEMENT',
    defaultDurationMs: 2200,
    requiresStanding: true,
    eyeState: 'normal',
    browState: 'normal',
    auraEffect: 'normal',
    targetY: 34,
  },
  return_to_throne: {
    id: 'return_to_throne',
    name: 'Trở Về Ngai Vàng',
    group: 'MOVEMENT',
    defaultDurationMs: 3800,
    requiresStanding: false,
    eyeState: 'normal',
    browState: 'normal',
    auraEffect: 'normal',
    targetY: 22,
  },
  shadow_teleport: {
    id: 'shadow_teleport',
    name: 'Ảo Ảnh Dịch Chuyển',
    group: 'MOVEMENT',
    defaultDurationMs: 2800,
    requiresStanding: true,
    eyeState: 'normal',
    browState: 'arrogant',
    auraEffect: 'teleport',
  },

  // --- NHÓM C: VÕ CÔNG VÀ PHÉP THUẬT (16-23) ---
  gather_inner_power: {
    id: 'gather_inner_power',
    name: 'Vận Khí Ma Đạo',
    group: 'MARTIAL',
    defaultDurationMs: 4000,
    requiresStanding: true,
    eyeState: 'angry',
    browState: 'furrowed',
    auraEffect: 'inner_power',
    targetY: 32,
  },
  palm_strike: {
    id: 'palm_strike',
    name: 'Tung Chưởng Ma Quang',
    group: 'MARTIAL',
    defaultDurationMs: 3200,
    requiresStanding: true,
    eyeState: 'angry',
    browState: 'furrowed',
    auraEffect: 'inner_power',
    targetY: 32,
  },
  martial_arts_combo: {
    id: 'martial_arts_combo',
    name: 'Múa Quyền Ma Khí',
    group: 'MARTIAL',
    defaultDurationMs: 5000,
    requiresStanding: true,
    eyeState: 'angry',
    browState: 'arrogant',
    auraEffect: 'inner_power',
    targetY: 34,
  },
  lightness_skill: {
    id: 'lightness_skill',
    name: 'Khinh Công Phi Thiên',
    group: 'MARTIAL',
    defaultDurationMs: 4200,
    requiresStanding: true,
    eyeState: 'normal',
    browState: 'arrogant',
    auraEffect: 'inner_power',
    targetY: 18, // float higher
  },
  summon_energy_dragon: {
    id: 'summon_energy_dragon',
    name: 'Triệu Hồi Hắc Long',
    group: 'MARTIAL',
    defaultDurationMs: 5500,
    requiresStanding: true,
    eyeState: 'normal',
    browState: 'arrogant',
    auraEffect: 'dragon',
    targetY: 22,
  },
  shadow_clones: {
    id: 'shadow_clones',
    name: 'Tam Thân Huyễn Ảnh',
    group: 'MARTIAL',
    defaultDurationMs: 4500,
    requiresStanding: true,
    eyeState: 'normal',
    browState: 'arrogant',
    auraEffect: 'inner_power',
    targetY: 28,
  },
  magic_barrier: {
    id: 'magic_barrier',
    name: 'Ma Đạo Kết Giới',
    group: 'MARTIAL',
    defaultDurationMs: 4500,
    requiresStanding: true,
    eyeState: 'angry',
    browState: 'furrowed',
    auraEffect: 'barrier',
    targetY: 26,
  },
  failed_kungfu: {
    id: 'failed_kungfu',
    name: 'Luyện Võ Thất Bại',
    group: 'MARTIAL',
    defaultDurationMs: 3500,
    requiresStanding: true,
    eyeState: 'shocked',
    browState: 'raised',
    auraEffect: 'none',
    targetY: 32,
  },

  // --- NHÓM D: BIỂU CẢM HÀI HƯỚC (24-30) ---
  smug_laugh: {
    id: 'smug_laugh',
    name: 'Cười Đắc Ý Tinh Nghịch',
    group: 'EXPRESSION',
    defaultDurationMs: 3500,
    requiresStanding: false,
    eyeState: 'laugh',
    browState: 'arrogant',
    auraEffect: 'normal',
    targetY: 22,
  },
  shocked: {
    id: 'shocked',
    name: 'Há Hốc Kinh Ngạc',
    group: 'EXPRESSION',
    defaultDurationMs: 3200,
    requiresStanding: false,
    eyeState: 'shocked',
    browState: 'raised',
    auraEffect: 'none',
  },
  facepalm: {
    id: 'facepalm',
    name: 'Đập Trán Thở Dài',
    group: 'EXPRESSION',
    defaultDurationMs: 3500,
    requiresStanding: false,
    eyeState: 'bored',
    browState: 'furrowed',
    auraEffect: 'none',
  },
  scold_disciple: {
    id: 'scold_disciple',
    name: 'Chỉ Tay Mắng Yêu',
    group: 'EXPRESSION',
    defaultDurationMs: 3600,
    requiresStanding: true,
    eyeState: 'angry',
    browState: 'arrogant',
    auraEffect: 'normal',
    targetY: 26,
  },
  belly_laugh: {
    id: 'belly_laugh',
    name: 'Ôm Bụng Cười Ngặt',
    group: 'EXPRESSION',
    defaultDurationMs: 4200,
    requiresStanding: false,
    eyeState: 'laugh',
    browState: 'raised',
    auraEffect: 'normal',
  },
  comical_rage: {
    id: 'comical_rage',
    name: 'Tức Giận Bốc Khói',
    group: 'EXPRESSION',
    defaultDurationMs: 3800,
    requiresStanding: true,
    eyeState: 'angry',
    browState: 'furrowed',
    auraEffect: 'rage_steam',
    targetY: 26,
  },
  trip_on_robe: {
    id: 'trip_on_robe',
    name: 'Vấp Vạt Áo Bào',
    group: 'EXPRESSION',
    defaultDurationMs: 3400,
    requiresStanding: true,
    eyeState: 'shocked',
    browState: 'raised',
    auraEffect: 'none',
    targetY: 34,
  },

  // --- NHÓM E: TƯƠNG TÁC NGƯỜI CHƠI & QUÀ (31-35) ---
  promote_disciple: {
    id: 'promote_disciple',
    name: 'Giơ Tay Phong Chức',
    group: 'INTERACTION',
    defaultDurationMs: 4500,
    requiresStanding: true,
    eyeState: 'normal',
    browState: 'arrogant',
    auraEffect: 'inner_power',
    targetY: 26,
  },
  grant_robe: {
    id: 'grant_robe',
    name: 'Ban Tặng Áo Bào',
    group: 'INTERACTION',
    defaultDurationMs: 4200,
    requiresStanding: true,
    eyeState: 'normal',
    browState: 'arrogant',
    auraEffect: 'normal',
    targetY: 28,
  },
  welcome_elder: {
    id: 'welcome_elder',
    name: 'Nghênh Đón Trưởng Lão',
    group: 'INTERACTION',
    defaultDurationMs: 4500,
    requiresStanding: true,
    eyeState: 'normal',
    browState: 'arrogant',
    auraEffect: 'normal',
    targetY: 28,
  },
  equal_to_leader: {
    id: 'equal_to_leader',
    name: 'Đồng Tôn Liếc Nhìn',
    group: 'INTERACTION',
    defaultDurationMs: 5000,
    requiresStanding: true,
    eyeState: 'shocked',
    browState: 'raised',
    auraEffect: 'normal',
    targetY: 24,
  },
  transfer_throne: {
    id: 'transfer_throne',
    name: 'Chuyển Giao Ngai Vàng',
    group: 'INTERACTION',
    defaultDurationMs: 7000,
    requiresStanding: true,
    eyeState: 'bored',
    browState: 'furrowed',
    auraEffect: 'normal',
    targetY: 28,
  },
};

export interface QueuedAction {
  animId: CultLeaderAnimId;
  priority: number;
  durationMs: number;
  fsmState: LeaderFsmState;
  targetDiscipleName?: string;
  onComplete?: () => void;
}

export class SectLeaderAnimationController {
  private visualState: LeaderVisualState = {
    currentAnim: 'throne_idle',
    fsmState: 'SEATED_IDLE',
    x: 50,
    y: 22,
    facing: 'front',
    isSeated: true,
    animStartTime: Date.now(),
    animDurationMs: 6000,
    isSpeaking: false,
    mouthViseme: 0,
    eyeState: 'normal',
    browState: 'normal',
    auraEffect: 'normal',
    hasShadowClones: false,
  };

  private personality: LeaderPersonality = 'COMEDIC';
  private currentPriority: number = 0;
  private actionQueue: QueuedAction[] = [];
  private lastAutoActionTime: number = Date.now();
  private subscribers: Set<(state: LeaderVisualState) => void> = new Set();
  private visemeCounter: number = 0;

  public setPersonality(personality: LeaderPersonality) {
    this.personality = personality;
  }

  public getPersonality(): LeaderPersonality {
    return this.personality;
  }

  constructor() {
    this.subscribeToVoice();
  }

  private subscribeToVoice() {
    maGiaoVoiceManager.subscribe((vState) => {
      const isSpeaking = vState.isSpeaking;
      this.visualState.isSpeaking = isSpeaking;
      if (isSpeaking && vState.currentText) {
        this.visualState.speechText = vState.currentText;
        // Map voice mood to expressive head gestures if idle
        if (this.currentPriority < 30) {
          const mood = vState.currentMood;
          if (mood === 'LAUGHING') {
            this.visualState.eyeState = 'laugh';
            this.visualState.browState = 'arrogant';
          } else if (mood === 'RAGE') {
            this.visualState.eyeState = 'angry';
            this.visualState.browState = 'furrowed';
          } else if (mood === 'TEA') {
            this.visualState.eyeState = 'normal';
            this.visualState.browState = 'raised';
          }
        }
      } else {
        delete this.visualState.speechText;
      }
      this.notify();
    });
  }

  public subscribe(fn: (state: LeaderVisualState) => void): () => void {
    this.subscribers.add(fn);
    fn({ ...this.visualState });
    return () => this.subscribers.delete(fn);
  }

  public getVisualState(): LeaderVisualState {
    return { ...this.visualState };
  }

  private notify() {
    const copy = { ...this.visualState };
    for (const sub of this.subscribers) {
      sub(copy);
    }
  }

  /**
   * Main animation trigger with priority handling
   */
  public playAnimation(
    animId: CultLeaderAnimId,
    priority: number = 20,
    customDurationMs?: number,
    targetDisciple?: string,
    onComplete?: () => void
  ): boolean {
    const meta = LEADER_ANIM_REGISTRY[animId];
    if (!meta) return false;

    const duration = customDurationMs || meta.defaultDurationMs;

    // Higher priority interrupts currently running action
    if (priority >= this.currentPriority) {
      this.executeAnimation(animId, priority, duration, targetDisciple, onComplete);
      return true;
    } else {
      // Enqueue if priority is decent (>= 40)
      if (priority >= 40 && this.actionQueue.length < 5) {
        this.actionQueue.push({
          animId,
          priority,
          durationMs: duration,
          fsmState: meta.requiresStanding ? 'STANDING' : 'SEATED_ACTION',
          targetDiscipleName: targetDisciple,
          onComplete,
        });
      }
      return false;
    }
  }

  private executeAnimation(
    animId: CultLeaderAnimId,
    priority: number,
    durationMs: number,
    targetDisciple?: string,
    onComplete?: () => void
  ) {
    const meta = LEADER_ANIM_REGISTRY[animId];
    const now = Date.now();

    this.currentPriority = priority;
    this.visualState.currentAnim = animId;
    this.visualState.animStartTime = now;
    this.visualState.animDurationMs = durationMs;
    this.visualState.eyeState = meta.eyeState;
    this.visualState.browState = meta.browState;
    this.visualState.auraEffect = meta.auraEffect;
    this.visualState.targetDiscipleName = targetDisciple;
    this.visualState.isSeated = !meta.requiresStanding;
    this.visualState.hasShadowClones = animId === 'shadow_clones';

    // FSM State assignment
    if (animId === 'transfer_throne') {
      this.visualState.fsmState = 'THRONE_TRANSFER';
    } else if (animId === 'promote_disciple' || animId === 'grant_robe') {
      this.visualState.fsmState = 'PROMOTING';
    } else if (meta.group === 'MARTIAL') {
      this.visualState.fsmState = 'PERFORMING_MARTIAL_ARTS';
    } else if (meta.group === 'MOVEMENT') {
      this.visualState.fsmState = 'WALKING';
    } else if (meta.requiresStanding) {
      this.visualState.fsmState = 'STANDING';
    } else {
      this.visualState.fsmState = 'SEATED_ACTION';
    }

    // Set target physical positioning
    if (meta.targetY !== undefined) {
      this.visualState.y = meta.targetY;
    }

    // Facing direction
    if (animId === 'return_to_throne') {
      this.visualState.facing = 'back';
    } else if (animId === 'turn_around') {
      this.visualState.facing = this.visualState.facing === 'left' ? 'right' : 'left';
    } else {
      this.visualState.facing = 'front';
    }

    this.notify();
  }

  /**
   * Main simulation tick called on animation loop (~15-20fps)
   */
  public tick(deltaSec: number, settings: MaGiaoSettings): void {
    const now = Date.now();

    // 1. Lip-sync mouth phoneme animation when speaking
    if (this.visualState.isSpeaking) {
      this.visemeCounter += deltaSec * 10;
      this.visualState.mouthViseme = Math.floor(this.visemeCounter) % 4;
    } else {
      this.visualState.mouthViseme = 0;
    }

    // 2. Physical coordinate interpolation for walking / patrol
    if (this.visualState.currentAnim === 'patrol_hall') {
      // Gentle patrol drift along central aisle
      const t = (now - this.visualState.animStartTime) / this.visualState.animDurationMs;
      this.visualState.x = 50 + Math.sin(t * Math.PI * 2) * 4;
      this.visualState.y = 35 + Math.cos(t * Math.PI) * 6;
      this.visualState.facing = Math.sin(t * Math.PI * 2) > 0 ? 'right' : 'left';
    }

    // 3. Check if current action expired
    const elapsed = now - this.visualState.animStartTime;
    if (elapsed >= this.visualState.animDurationMs) {
      this.handleActionFinished(settings);
    }

    // 4. Autonomous behavior scheduler when idle on throne
    if (
      settings.leaderAutoAnimEnabled &&
      this.visualState.fsmState === 'SEATED_IDLE' &&
      now - this.lastAutoActionTime >= settings.leaderAnimFrequencySec * 1000
    ) {
      this.pickAutonomousAction(settings);
    }
  }

  private handleActionFinished(settings: MaGiaoSettings) {
    this.currentPriority = 0;

    // 1. Process queued action if any
    if (this.actionQueue.length > 0) {
      const next = this.actionQueue.shift()!;
      this.executeAnimation(
        next.animId,
        next.priority,
        next.durationMs,
        next.targetDiscipleName,
        next.onComplete
      );
      return;
    }

    // 2. If character finished standing or walking down, walk back to throne first
    if (!this.visualState.isSeated && this.visualState.currentAnim !== 'return_to_throne') {
      this.executeAnimation('return_to_throne', 20, 3200);
      return;
    }

    // 3. Return to standard Seated Idle on dragon throne
    this.currentPriority = 0;
    this.visualState.currentAnim = 'throne_idle';
    this.visualState.fsmState = 'SEATED_IDLE';
    this.visualState.x = 50;
    this.visualState.y = 22;
    this.visualState.facing = 'front';
    this.visualState.isSeated = true;
    this.visualState.animStartTime = Date.now();
    this.visualState.animDurationMs = 6000;
    this.visualState.eyeState = 'normal';
    this.visualState.browState = 'normal';
    this.visualState.auraEffect = 'normal';
    this.visualState.hasShadowClones = false;
    delete this.visualState.targetDiscipleName;
    this.lastAutoActionTime = Date.now();

    this.notify();
  }

  /**
   * Autonomous idle action picker based on Leader Personality
   */
  public pickAutonomousAction(settings: MaGiaoSettings): void {
    const personality = settings.leaderPersonality || 'COMEDIC';
    const disabled = new Set(settings.disabledLeaderAnims || []);

    let candidates: Array<{ anim: CultLeaderAnimId; weight: number }> = [];

    if (personality === 'DOMINANT') {
      // Bá Chủ: Uy nghiêm, kiêu ngạo, đi tuần, phẩy quạt
      candidates = [
        { anim: 'fan_self', weight: 30 },
        { anim: 'stroke_beard', weight: 25 },
        { anim: 'tap_throne', weight: 20 },
        { anim: 'patrol_hall', weight: 15 },
        { anim: 'gather_inner_power', weight: 10 },
        { anim: 'hands_behind_back', weight: 15 },
        { anim: 'smug_laugh', weight: 15 },
      ];
    } else if (personality === 'MARTIAL_MANIAC') {
      // Cuồng Võ: Đam mê luyện chưởng, thi triển võ công
      candidates = [
        { anim: 'gather_inner_power', weight: 30 },
        { anim: 'palm_strike', weight: 25 },
        { anim: 'martial_arts_combo', weight: 20 },
        { anim: 'summon_energy_dragon', weight: 15 },
        { anim: 'shadow_clones', weight: 15 },
        { anim: 'lightness_skill', weight: 15 },
        { anim: 'magic_barrier', weight: 10 },
      ];
    } else {
      // Hài Hước (COMEDIC): Uống trà, ngủ gật, cười lớn, vấp áo
      candidates = [
        { anim: 'evil_laugh', weight: 25 },
        { anim: 'drink_tea', weight: 25 },
        { anim: 'doze_off', weight: 20 },
        { anim: 'bored_pose', weight: 15 },
        { anim: 'belly_laugh', weight: 15 },
        { anim: 'trip_on_robe', weight: 15 },
        { anim: 'failed_kungfu', weight: 12 },
        { anim: 'smug_laugh', weight: 15 },
      ];
    }

    // Filter out disabled animations
    const available = candidates.filter((c) => !disabled.has(c.anim));
    if (available.length === 0) return;

    const totalWeight = available.reduce((acc, c) => acc + c.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const item of available) {
      roll -= item.weight;
      if (roll <= 0) {
        this.playAnimation(item.anim, 15);
        this.lastAutoActionTime = Date.now();
        break;
      }
    }
  }

  // --- SPECIAL EVENT HOOKS ---

  /**
   * New disciple joined the hall: Leader turns head, waves or fans, welcomes
   */
  public onRecruitJoined(username: string): void {
    if (this.currentPriority > 40) return;
    const anim = Math.random() < 0.5 ? 'fan_self' : 'smug_laugh';
    this.playAnimation(anim, 40, 3000, username);
  }

  /**
   * Disciple performed martial comment: Leader reacts
   */
  public onDiscipleCommentReaction(username: string, action: string): void {
    if (this.currentPriority > 45) return;
    if (action === 'combo' || action === 'punch' || action === 'kick') {
      const reaction = Math.random() < 0.6 ? 'palm_strike' : 'smug_laugh';
      this.playAnimation(reaction, 45, 3500, username);
    } else if (action === 'fail') {
      this.playAnimation('facepalm', 45, 3200, username);
    } else if (action === 'bow') {
      this.playAnimation('stroke_beard', 45, 3000, username);
    }
  }

  /**
   * Disciple rank promotion: Interrupt with high priority (85)
   */
  public onGiftPromotion(username: string, rankId: string, coins: number): void {
    if (rankId === 'TAN_GIAO_CHU' || coins >= 500) {
      // 500 coins: Throne transfer sequence (Priority 100)
      this.playAnimation('transfer_throne', 100, 7500, username);
      return;
    }

    if (rankId === 'DONG_TON_GIAO_CHU' || coins >= 199) {
      this.playAnimation('equal_to_leader', 90, 5000, username);
      return;
    }

    if (rankId === 'DAI_TRUONG_LAO' || coins >= 99) {
      this.playAnimation('welcome_elder', 88, 4500, username);
      return;
    }

    // Standard promotion
    const anim = Math.random() < 0.5 ? 'promote_disciple' : 'grant_robe';
    this.playAnimation(anim, 85, 4500, username);
  }

  /**
   * Minigame director triggers in Training Arena
   */
  public onMinigameDirector(status: 'PREPARING' | 'VICTORY' | 'DEFEAT'): void {
    if (status === 'PREPARING') {
      // Demonstrate sample kungfu move
      this.playAnimation('martial_arts_combo', 70, 4500);
    } else if (status === 'VICTORY') {
      this.playAnimation('belly_laugh', 75, 4200);
    } else if (status === 'DEFEAT') {
      this.playAnimation('comical_rage', 75, 4000);
    }
  }
}

export const sectLeaderController = new SectLeaderAnimationController();
