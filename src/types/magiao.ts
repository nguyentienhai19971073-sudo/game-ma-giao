/**
 * MA GIÁO ONLINE – THIÊN HẠ ĐỆ NHẤT TÀ PHÁI
 * Core Data Models & Type Definitions
 */

export type MaGiaoRankId =
  | 'DAN_DEN'
  | 'NGOAI_MON'
  | 'NOI_MON'
  | 'SU_HUYNH'
  | 'TINH_ANH'
  | 'HO_PHAP'
  | 'DAI_TRUONG_LAO'
  | 'DONG_TON_GIAO_CHU'
  | 'TAN_GIAO_CHU';

export interface MaGiaoRankMeta {
  id: MaGiaoRankId;
  title: string;
  minCoins: number;
  badge: string;
  titleColor: string;
  robeColor: string;
  auraStyle?: string;
  roleDescription: string;
}

export const MA_GIAO_RANKS: Record<MaGiaoRankId, MaGiaoRankMeta> = {
  DAN_DEN: {
    id: 'DAN_DEN',
    title: 'Dân Đen',
    minCoins: 0,
    badge: '👤',
    titleColor: '#cbd5e1', // slate-300
    robeColor: '#64748b',
    roleDescription: 'Bá tánh tò mò lạc bước vào Ma Giáo',
  },
  NGOAI_MON: {
    id: 'NGOAI_MON',
    title: 'Ngoại Môn Đồ Đệ',
    minCoins: 1,
    badge: '🗡️',
    titleColor: '#67e8f9', // cyan-300
    robeColor: '#0e7490',
    roleDescription: 'Đệ tử mới nhập môn, chăm chỉ quét lá',
  },
  NOI_MON: {
    id: 'NOI_MON',
    title: 'Nội Môn Đệ Tử',
    minCoins: 5,
    badge: '⚔️',
    titleColor: '#60a5fa', // blue-400
    robeColor: '#1d4ed8',
    roleDescription: 'Đã lĩnh ngộ khẩu quyết Ma Quyền nhập môn',
  },
  SU_HUYNH: {
    id: 'SU_HUYNH',
    title: 'Sư Huynh / Sư Tỷ',
    minCoins: 10,
    badge: '🥋',
    titleColor: '#c084fc', // purple-400
    robeColor: '#7e22ce',
    roleDescription: 'Có quyền đứng gần ngai Giáo Chủ thêm ba bước',
  },
  TINH_ANH: {
    id: 'TINH_ANH',
    title: 'Tinh Anh Đệ Tử',
    minCoins: 20,
    badge: '🔥',
    titleColor: '#fb923c', // orange-400
    robeColor: '#c2410c',
    auraStyle: 'radial-gradient(circle, rgba(249,115,22,0.45) 0%, rgba(249,115,22,0) 70%)',
    roleDescription: 'Võ công cái thế, chân khí tỏa hồng quang',
  },
  HO_PHAP: {
    id: 'HO_PHAP',
    title: 'Hộ Pháp Ma Giáo',
    minCoins: 50,
    badge: '🛡️',
    titleColor: '#f87171', // red-400
    robeColor: '#b91c1c',
    auraStyle: 'radial-gradient(circle, rgba(239,68,68,0.55) 0%, rgba(239,68,68,0) 75%)',
    roleDescription: 'Kề cận ngai vàng, bảo vệ uy nghiêm Giáo Chủ',
  },
  DAI_TRUONG_LAO: {
    id: 'DAI_TRUONG_LAO',
    title: 'Đại Trưởng Lão',
    minCoins: 99,
    badge: '📜',
    titleColor: '#facc15', // yellow-400
    robeColor: '#a16207',
    auraStyle: 'radial-gradient(circle, rgba(234,179,8,0.65) 0%, rgba(234,179,8,0) 80%)',
    roleDescription: 'Nguyên lão Ma Giáo, tiếng nói uy chấn giang hồ',
  },
  DONG_TON_GIAO_CHU: {
    id: 'DONG_TON_GIAO_CHU',
    title: 'Đồng Tôn Giáo Chủ',
    minCoins: 199,
    badge: '👑',
    titleColor: '#f43f5e', // rose-500
    robeColor: '#881337',
    auraStyle: 'radial-gradient(circle, rgba(244,63,94,0.75) 0%, rgba(136,19,55,0) 85%)',
    roleDescription: 'Ngang hàng cùng Giáo Chủ, bục ngai sánh vai',
  },
  TAN_GIAO_CHU: {
    id: 'TAN_GIAO_CHU',
    title: 'Tân Giáo Chủ',
    minCoins: 500,
    badge: '🐉',
    titleColor: '#ffd700', // gold
    robeColor: '#450a0a',
    auraStyle: 'radial-gradient(circle, rgba(255,215,0,0.85) 0%, rgba(220,38,38,0.4) 50%, transparent 85%)',
    roleDescription: 'Tiếp quản ngai vàng, thống nhất thiên hạ!',
  },
};

export type MaGiaoAction =
  | 'idle'
  | 'walk'
  | 'run'
  | 'bow'
  | 'punch'
  | 'kick'
  | 'combo'
  | 'jump'
  | 'dodge'
  | 'dodging'
  | 'meditate'
  | 'stand_up'
  | 'cheer'
  | 'laugh'
  | 'fail'
  | 'leave'
  | 'sweeping'
  // Compatibility aliases
  | 'walking'
  | 'múa'
  | 'casting';

export type MaGiaoFacing = 'front' | 'back' | 'left' | 'right';

export type MaGiaoZoneId =
  | 'ZONE_A_THRONE'
  | 'ZONE_B_AISLE'
  | 'ZONE_C_MARTIAL'
  | 'ZONE_D_MEDITATE'
  | 'ZONE_E_SOCIAL';

export interface MaGiaoZoneDef {
  id: MaGiaoZoneId;
  name: string;
  description: string;
  bounds: { minX: number; maxX: number; minY: number; maxY: number }[];
  allowedActions: MaGiaoAction[];
  maxOccupancy?: number;
}

export interface MaGiaoParticipant {
  id: string;
  userId: string;
  username: string;
  nickname: string;
  avatarUrl?: string;
  totalCoins: number;
  rank: MaGiaoRankId;
  seatIndex: number; // 0..79 base home mat
  joinedAt: number;
  lastActiveAt: number;
  lastComment?: string;
  lastCommentAt?: number;
  isSweeping: boolean;
  sweptAt?: number;
  isDemo?: boolean;

  // Dynamic 2D positioning & animation state
  x: number; // 0..100 (%)
  y: number; // 0..100 (%)
  baseX?: number; // home mat X
  baseY?: number; // home mat Y
  targetX?: number;
  targetY?: number;
  facing: MaGiaoFacing;
  currentZone: MaGiaoZoneId;
  actionState: MaGiaoAction;
  actionTimer?: number;
  actionExpiresAt?: number;
  partnerUserId?: string;
  speedMultiplier?: number;
  animFrame?: number;
  completedCurrentTraining?: boolean;
}

export type TrainingMinigameId =
  | 'NONE'
  | 'MA_QUYEN_LOAN_VU'
  | 'MA_ANH_THAN_PHAP'
  | 'TAM_KHI_MA_TRAN';

export interface TrainingState {
  activeMinigame: TrainingMinigameId;
  timeRemainingSec: number;
  round: number; // For Ma Anh: 1, 2, 3
  activeCommand?: string; // e.g. "MÚA", "TRÁI", "PHẢI", "NHẢY", "LỬA", "BĂNG", "GIÓ"
  correctAnswer?: string; // For counter elements
  participantsDone: string[]; // userIds who succeeded
  targetCount: number;
  totalEligible: number;
  status: 'PREPARING' | 'IN_PROGRESS' | 'EVALUATING' | 'VICTORY' | 'DEFEAT';
  resultNotice?: string;
}

export interface SweeperItem {
  userId: string;
  username: string;
  nickname: string;
  rank: MaGiaoRankId;
  sweptAt: number;
}

export type LeaderMood =
  | 'ARROGANT'
  | 'LAUGHING'
  | 'POINTING'
  | 'TEA'
  | 'RAGE'
  | 'CONFERRING'
  | 'MARTIAL_ARTS'
  | 'FALLEN_FAN';

export interface LeaderDialogueEvent {
  text: string;
  mood: LeaderMood;
  targetUsername?: string;
  targetRank?: string;
  priority: number;
  timestamp: number;
}

// --- CULT LEADER 35 ANIMATIONS & FSM STATE DEFINITIONS ---
export type CultLeaderAnimGroup = 'SEATED' | 'MOVEMENT' | 'MARTIAL' | 'EXPRESSION' | 'INTERACTION';

export type CultLeaderAnimId =
  // Nhóm A – Sinh hoạt trên ngai (1-8)
  | 'throne_idle'
  | 'stroke_beard'
  | 'drink_tea'
  | 'evil_laugh'
  | 'doze_off'
  | 'tap_throne'
  | 'fan_self'
  | 'bored_pose'
  // Nhóm B – Đứng dậy và di chuyển (9-15)
  | 'stand_from_throne'
  | 'walk_down_steps'
  | 'patrol_hall'
  | 'hands_behind_back'
  | 'turn_around'
  | 'return_to_throne'
  | 'shadow_teleport'
  // Nhóm C – Võ công và phép thuật (16-23)
  | 'gather_inner_power'
  | 'palm_strike'
  | 'martial_arts_combo'
  | 'lightness_skill'
  | 'summon_energy_dragon'
  | 'shadow_clones'
  | 'magic_barrier'
  | 'failed_kungfu'
  // Nhóm D – Biểu cảm hài hước (24-30)
  | 'smug_laugh'
  | 'shocked'
  | 'facepalm'
  | 'scold_disciple'
  | 'belly_laugh'
  | 'comical_rage'
  | 'trip_on_robe'
  // Nhóm E – Tương tác với người chơi và quà TikTok (31-35)
  | 'promote_disciple'
  | 'grant_robe'
  | 'welcome_elder'
  | 'equal_to_leader'
  | 'transfer_throne';

export type LeaderPersonality = 'DOMINANT' | 'COMEDIC' | 'MARTIAL_MANIAC';

export type LeaderFsmState =
  | 'SEATED_IDLE'
  | 'SEATED_ACTION'
  | 'STANDING'
  | 'WALKING'
  | 'PERFORMING_MARTIAL_ARTS'
  | 'SPEAKING'
  | 'INTERACTING_WITH_PLAYER'
  | 'PROMOTING'
  | 'MINIGAME_DIRECTOR'
  | 'THRONE_TRANSFER'
  | 'RETURNING_TO_THRONE';

export interface LeaderVisualState {
  currentAnim: CultLeaderAnimId;
  fsmState: LeaderFsmState;
  x: number; // percentage (default 50)
  y: number; // percentage (default 22 seated on dais)
  facing: 'front' | 'back' | 'left' | 'right';
  isSeated: boolean;
  animStartTime: number;
  animDurationMs: number;
  isSpeaking: boolean;
  speechText?: string;
  mouthViseme: number; // 0: closed, 1: slight, 2: wide, 3: round O
  eyeState: 'normal' | 'laugh' | 'shocked' | 'angry' | 'bored' | 'dozing';
  browState: 'normal' | 'raised' | 'furrowed' | 'arrogant';
  auraEffect: 'none' | 'normal' | 'dragon' | 'barrier' | 'inner_power' | 'teleport' | 'rage_steam';
  hasShadowClones?: boolean;
  targetDiscipleName?: string;
  subordinateThroneUser?: {
    username: string;
    nickname: string;
    title: string;
  };
}

export interface MaGiaoSettings {
  maxParticipants: number;
  inactivityTimeoutSec: number;
  trainingIntervalSec: number;
  trainingDurationSec: number;
  winPercentThreshold: number;
  maxSweepers: number;
  enabledMinigames: {
    maQuyen: boolean;
    maAnh: boolean;
    tamKhi: boolean;
  };
  audioEnabled: boolean;
  voiceProvider: 'vienieu' | 'azure' | 'browser';
  speechSpeed: number;
  speechVolume: number;
  autoTrainingEnabled: boolean;
  supremeGiftId: string;
  obsCleanView: boolean;

  // Character activity settings
  autoRoamEnabled: boolean;
  autoMartialEnabled: boolean;
  autoMeditateEnabled: boolean;
  autoSocialEnabled: boolean;
  moveSpeed: number;
  actionChangeFreqSec: number;
  meditateDurationSec: number;
  martialDurationSec: number;
  maxConcurrentMoving: number;
  collisionAvoidanceDist: number;

  // Cult Leader 35 animations & personality settings
  leaderPersonality: LeaderPersonality;
  leaderAutoAnimEnabled: boolean;
  leaderAnimFrequencySec: number; // seconds between spontaneous actions (15-35s)
  leaderSpeed: number;
  leaderFxFidelity: 'low' | 'medium' | 'high';
  disabledLeaderAnims: CultLeaderAnimId[];
}

export const DEFAULT_MA_GIAO_SETTINGS: MaGiaoSettings = {
  maxParticipants: 80,
  inactivityTimeoutSec: 300,
  trainingIntervalSec: 160,
  trainingDurationSec: 50,
  winPercentThreshold: 60,
  maxSweepers: 5,
  enabledMinigames: {
    maQuyen: true,
    maAnh: true,
    tamKhi: true,
  },
  audioEnabled: true,
  voiceProvider: 'browser',
  speechSpeed: 1.0,
  speechVolume: 1.0,
  autoTrainingEnabled: true,
  supremeGiftId: 'lion',
  obsCleanView: false,

  // Character activity defaults
  autoRoamEnabled: true,
  autoMartialEnabled: true,
  autoMeditateEnabled: true,
  autoSocialEnabled: true,
  moveSpeed: 1.0,
  actionChangeFreqSec: 8,
  meditateDurationSec: 16,
  martialDurationSec: 8,
  maxConcurrentMoving: 18,
  collisionAvoidanceDist: 4.5,

  // Cult Leader defaults
  leaderPersonality: 'COMEDIC',
  leaderAutoAnimEnabled: true,
  leaderAnimFrequencySec: 20,
  leaderSpeed: 1.0,
  leaderFxFidelity: 'high',
  disabledLeaderAnims: [],
};
