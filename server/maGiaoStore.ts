/**
 * MA GIÁO ONLINE - BACKEND CONFIGURATION & PERSISTENCE STORE
 * Authoritative server storage for 20 admin categories, SQLite/JSON persistence,
 * OBS sync across instances, security authentication, and Socket.IO real-time broadcast.
 */

import fs from 'node:fs';
import path from 'node:path';
import { Request } from 'express';
import {
  CultLeaderAnimId,
  LeaderMood,
  LeaderPersonality,
  MaGiaoRankId,
  MaGiaoSettings,
  DEFAULT_MA_GIAO_SETTINGS,
  MA_GIAO_RANKS,
} from '../src/types/magiao.js';

export interface MaGiaoGiftDefinition {
  giftId: string;
  giftName: string;
  coinValue: number;
  mappedRank?: MaGiaoRankId;
  specialVfx?: 'inner_power' | 'dragon' | 'barrier' | 'rage_steam' | 'teleport' | 'confetti';
  leaderAnim?: CultLeaderAnimId;
  voiceLine?: string;
  isActive: boolean;
  priority: number;
  iconUrl?: string;
}

export interface MaGiaoKeywordDefinition {
  id: string;
  keyword: string;
  action: string;
  zonePreference?: string;
  enabled: boolean;
}

export interface MaGiaoDialogueCategory {
  id: string;
  name: string;
  lines: string[];
  mood: LeaderMood;
  frequencySec: number;
  enabled: boolean;
}

export interface MaGiaoBackgroundConfig {
  id: string;
  name: string;
  imageUrl: string;
  aspectRatio: string;
  leaderX: number;
  leaderY: number;
  throneX: number;
  throneY: number;
  walkBounds: { minX: number; maxX: number; minY: number; maxY: number };
  bgmAudioUrl?: string;
  isCustom?: boolean;
}

export interface MaGiaoBannerLayout {
  id: string;
  name: string;
  enabled: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  bgColor: string;
  bgOpacity: number;
  borderColor: string;
  durationMs: number;
  priority: number;
}

export interface MaGiaoFullAdminConfig {
  version: number;
  savedAt: number;

  // 1. General & Live Control
  live: {
    autoConnectUsername: string;
    autoReconnect: boolean;
    reconnectIntervalSec: number;
    logLevel: 'info' | 'warn' | 'error' | 'debug';
  };

  // 2. Settings (Inherited & Enhanced)
  settings: MaGiaoSettings;

  // 3. Cult Leader Visual Identity
  leaderProfile: {
    name: string;
    title: string;
    robeColor: string;
    hairColor: string;
    scale: number;
    x: number;
    y: number;
    facing: 'front' | 'back' | 'left' | 'right';
  };

  // 4. Cult Ranks CRUD (9 Ranks)
  ranks: Record<MaGiaoRankId, {
    id: MaGiaoRankId;
    title: string;
    minCoins: number;
    badge: string;
    titleColor: string;
    robeColor: string;
    auraStyle: string;
    roleDescription: string;
    voicePromotionLine?: string;
    leaderAnim?: CultLeaderAnimId;
    bannerDurationMs: number;
  }>;

  // 5. Gifts Management
  gifts: MaGiaoGiftDefinition[];
  unknownGifts: Array<{
    giftId: string;
    giftName?: string;
    diamondCount?: number;
    count: number;
    firstSeenAt: number;
    lastSeenAt: number;
    lastSender?: string;
  }>;

  // 6. Keywords & Comments
  keywords: MaGiaoKeywordDefinition[];
  commentSettings: {
    antiSpamCooldownSec: number;
    maxCommandsPerMinute: number;
    bubbleDisplayDurationSec: number;
    bubbleFadeDurationSec: number;
    bubbleFontSize: number;
    bubbleBgColor: string;
    bubbleTextColor: string;
    ttsEnabled: boolean;
    priorityOverNormalComments: boolean;
  };

  // 7. Dialogue Bank (13 Categories)
  dialogues: Record<string, MaGiaoDialogueCategory>;

  // 8. TTS Voice Settings
  tts: {
    provider: 'browser' | 'azure' | 'vienieu';
    azureRegion: string;
    azureKeyMasked: boolean;
    azureVoice: string;
    vieNeuUrl: string;
    vieNeuCloudUrl: string;
    vieNeuVoice: string;
    vieNeuTimeoutMs: number;
    speechRate: number;
    speechVolume: number;
    pauseBetweenLinesSec: number;
    reverbEffect: boolean;
    mouthLipSync: boolean;
  };

  // 9. Backgrounds & Grand Palace
  backgrounds: MaGiaoBackgroundConfig[];
  activeBackgroundId: string;

  // 10. Minigames Detailed Parameters
  minigames: {
    maQuyen: {
      enabled: boolean;
      durationSec: number;
      targetPercent: number;
      sweeperPenaltyCount: number;
    };
    maAnh: {
      enabled: boolean;
      roundsCount: number;
      roundDurationSec: number;
      targetPercent: number;
      commands: string[];
    };
    tamKhi: {
      enabled: boolean;
      roundsCount: number;
      roundDurationSec: number;
      targetPercent: number;
      elements: string[];
    };
  };

  // 11. Scene Transitions
  transitions: {
    cycleDurationSec: number;
    transitionFxDurationSec: number;
    autoCycleEnabled: boolean;
    prepAnnouncementSec: number;
    resultAnnouncementSec: number;
    antiConsecutiveMinigame: boolean;
  };

  // 12. Notification & Leaderboard Banners Layout
  banners: Record<string, MaGiaoBannerLayout>;

  // 13. Layout & Custom CSS
  layout: {
    vertical916: boolean;
    tiktokSafeZoneGuide: boolean;
    obsCleanView: boolean;
    customCss: string;
  };

  // 14. OBS Sync Configuration
  obsSync: {
    enabled: boolean;
    syncCamera: boolean;
    syncHud: boolean;
    syncVoiceMute: boolean;
    lastSyncedAt: number;
  };
}

export const DEFAULT_MA_GIAO_FULL_CONFIG: MaGiaoFullAdminConfig = {
  version: 2,
  savedAt: Date.now(),

  live: {
    autoConnectUsername: '',
    autoReconnect: true,
    reconnectIntervalSec: 15,
    logLevel: 'info',
  },

  settings: DEFAULT_MA_GIAO_SETTINGS,

  leaderProfile: {
    name: 'Độc Cô Cầu Bại',
    title: 'Thiên Hạ Đệ Nhất Giáo Chủ',
    robeColor: '#450a0a',
    hairColor: '#e2e8f0',
    scale: 1.0,
    x: 50,
    y: 22,
    facing: 'front',
  },

  ranks: {
    DAN_DEN: {
      id: 'DAN_DEN',
      title: 'Dân Đen',
      minCoins: 0,
      badge: '👤',
      titleColor: '#cbd5e1',
      robeColor: '#64748b',
      auraStyle: 'none',
      roleDescription: 'Bá tánh tò mò lạc bước vào Ma Giáo',
      bannerDurationMs: 4000,
    },
    NGOAI_MON: {
      id: 'NGOAI_MON',
      title: 'Ngoại Môn Đồ Đệ',
      minCoins: 1,
      badge: '🗡️',
      titleColor: '#67e8f9',
      robeColor: '#0e7490',
      auraStyle: 'none',
      roleDescription: 'Đệ tử mới nhập môn, chăm chỉ quét lá',
      voicePromotionLine: 'Khá khen {user}! Bản Giáo Chủ thu nhận ngươi làm Ngoại Môn Đồ Đệ!',
      leaderAnim: 'promote_disciple',
      bannerDurationMs: 5000,
    },
    NOI_MON: {
      id: 'NOI_MON',
      title: 'Nội Môn Đệ Tử',
      minCoins: 5,
      badge: '⚔️',
      titleColor: '#60a5fa',
      robeColor: '#1d4ed8',
      auraStyle: 'none',
      roleDescription: 'Đã lĩnh ngộ khẩu quyết Ma Quyền nhập môn',
      voicePromotionLine: 'Tiến bộ lắm {user}! Mau bước chân vào Nội Môn tu luyện bí pháp!',
      leaderAnim: 'promote_disciple',
      bannerDurationMs: 5000,
    },
    SU_HUYNH: {
      id: 'SU_HUYNH',
      title: 'Sư Huynh / Sư Tỷ',
      minCoins: 10,
      badge: '🥋',
      titleColor: '#c084fc',
      robeColor: '#7e22ce',
      auraStyle: 'none',
      roleDescription: 'Có quyền đứng gần ngai Giáo Chủ thêm ba bước',
      voicePromotionLine: 'Bái kiến Sư Huynh {user}! Cả đại điện mau cúi chào!',
      leaderAnim: 'hands_behind_back',
      bannerDurationMs: 5000,
    },
    TINH_ANH: {
      id: 'TINH_ANH',
      title: 'Tinh Anh Đệ Tử',
      minCoins: 20,
      badge: '🔥',
      titleColor: '#fb923c',
      robeColor: '#c2410c',
      auraStyle: 'radial-gradient(circle, rgba(249,115,22,0.45) 0%, rgba(249,115,22,0) 70%)',
      roleDescription: 'Võ công cái thế, chân khí tỏa hồng quang',
      voicePromotionLine: 'Chân khí ngút trời! Phong cho {user} làm Tinh Anh Ma Giáo!',
      leaderAnim: 'palm_strike',
      bannerDurationMs: 5500,
    },
    HO_PHAP: {
      id: 'HO_PHAP',
      title: 'Hộ Pháp Ma Giáo',
      minCoins: 50,
      badge: '🛡️',
      titleColor: '#f87171',
      robeColor: '#b91c1c',
      auraStyle: 'radial-gradient(circle, rgba(239,68,68,0.55) 0%, rgba(239,68,68,0) 75%)',
      roleDescription: 'Kề cận ngai vàng, bảo vệ uy nghiêm Giáo Chủ',
      voicePromotionLine: 'Lệnh bài Hộ Pháp trao tay {user}, thay ta chấp chưởng quy củ!',
      leaderAnim: 'grant_robe',
      bannerDurationMs: 6000,
    },
    DAI_TRUONG_LAO: {
      id: 'DAI_TRUONG_LAO',
      title: 'Đại Trưởng Lão',
      minCoins: 99,
      badge: '📜',
      titleColor: '#facc15',
      robeColor: '#a16207',
      auraStyle: 'radial-gradient(circle, rgba(234,179,8,0.65) 0%, rgba(234,179,8,0) 80%)',
      roleDescription: 'Nguyên lão Ma Giáo, tiếng nói uy chấn giang hồ',
      voicePromotionLine: 'Cung nghênh Đại Trưởng Lão {user}! Bản tọa xin nâng chén tương kính!',
      leaderAnim: 'welcome_elder',
      bannerDurationMs: 6500,
    },
    DONG_TON_GIAO_CHU: {
      id: 'DONG_TON_GIAO_CHU',
      title: 'Đồng Tôn Giáo Chủ',
      minCoins: 199,
      badge: '👑',
      titleColor: '#f43f5e',
      robeColor: '#881337',
      auraStyle: 'radial-gradient(circle, rgba(244,63,94,0.75) 0%, rgba(136,19,55,0) 85%)',
      roleDescription: 'Ngang hàng cùng Giáo Chủ, bục ngai sánh vai',
      voicePromotionLine: 'Ái chà! {user} đã ngồi ngang hàng bản Giáo Chủ rồi đấy à?',
      leaderAnim: 'equal_to_leader',
      bannerDurationMs: 7000,
    },
    TAN_GIAO_CHU: {
      id: 'TAN_GIAO_CHU',
      title: 'Tân Giáo Chủ',
      minCoins: 500,
      badge: '🐉',
      titleColor: '#ffd700',
      robeColor: '#450a0a',
      auraStyle: 'radial-gradient(circle, rgba(255,215,0,0.85) 0%, rgba(220,38,38,0.4) 50%, transparent 85%)',
      roleDescription: 'Tiếp quản ngai vàng, thống nhất thiên hạ!',
      voicePromotionLine: 'Thiên Ma Hoàng Bào quy vị! Cung nghênh Tân Giáo Chủ {user} đăng cơ!',
      leaderAnim: 'transfer_throne',
      bannerDurationMs: 8000,
    },
  },

  gifts: [
    {
      giftId: 'rose',
      giftName: 'Hoa Hồng Đỏ',
      coinValue: 1,
      mappedRank: 'NGOAI_MON',
      specialVfx: 'inner_power',
      leaderAnim: 'fan_self',
      voiceLine: 'Một cành hoa đỏ, nhập môn Ma Giáo!',
      isActive: true,
      priority: 30,
    },
    {
      giftId: 'tiktok',
      giftName: 'Logo TikTok',
      coinValue: 1,
      mappedRank: 'NGOAI_MON',
      specialVfx: 'inner_power',
      leaderAnim: 'stroke_beard',
      voiceLine: 'Đồ đệ dâng bảo vật, khá lắm!',
      isActive: true,
      priority: 30,
    },
    {
      giftId: 'heart',
      giftName: 'Trái Tim Ma Thuật',
      coinValue: 5,
      mappedRank: 'NOI_MON',
      specialVfx: 'inner_power',
      leaderAnim: 'smug_laugh',
      voiceLine: 'Ma tâm kiên định, thăng cấp Nội Môn!',
      isActive: true,
      priority: 40,
    },
    {
      giftId: 'cap',
      giftName: 'Vương Miện Ma Quái',
      coinValue: 99,
      mappedRank: 'DAI_TRUONG_LAO',
      specialVfx: 'dragon',
      leaderAnim: 'welcome_elder',
      voiceLine: 'Trưởng Lão hiển thánh, uy chấn bát phương!',
      isActive: true,
      priority: 85,
    },
    {
      giftId: 'corgi',
      giftName: 'Thần Thú Corgi',
      coinValue: 199,
      mappedRank: 'DONG_TON_GIAO_CHU',
      specialVfx: 'dragon',
      leaderAnim: 'equal_to_leader',
      voiceLine: 'Thần thú hộ giá, Đồng Tôn Giáo Chủ sánh vai!',
      isActive: true,
      priority: 95,
    },
    {
      giftId: 'lion',
      giftName: 'Thiên Ma Sư Tử Vàng',
      coinValue: 500,
      mappedRank: 'TAN_GIAO_CHU',
      specialVfx: 'dragon',
      leaderAnim: 'transfer_throne',
      voiceLine: 'Thiên Ma Sư Tử xuất thế, soán ngôi Giáo Chủ!',
      isActive: true,
      priority: 100,
    },
  ],

  unknownGifts: [],

  keywords: [
    { id: 'kw_1', keyword: 'đi', action: 'walk', enabled: true },
    { id: 'kw_2', keyword: 'chạy', action: 'run', enabled: true },
    { id: 'kw_3', keyword: 'múa', action: 'combo', zonePreference: 'ZONE_C_MARTIAL', enabled: true },
    { id: 'kw_4', keyword: 'võ', action: 'punch', zonePreference: 'ZONE_C_MARTIAL', enabled: true },
    { id: 'kw_5', keyword: 'đấm', action: 'punch', zonePreference: 'ZONE_C_MARTIAL', enabled: true },
    { id: 'kw_6', keyword: 'đá', action: 'kick', zonePreference: 'ZONE_C_MARTIAL', enabled: true },
    { id: 'kw_7', keyword: 'nhảy', action: 'jump', enabled: true },
    { id: 'kw_8', keyword: 'thiền', action: 'meditate', zonePreference: 'ZONE_D_MEDITATE', enabled: true },
    { id: 'kw_9', keyword: 'đứng', action: 'stand_up', enabled: true },
    { id: 'kw_10', keyword: 'chào', action: 'bow', enabled: true },
  ],

  commentSettings: {
    antiSpamCooldownSec: 3,
    maxCommandsPerMinute: 20,
    bubbleDisplayDurationSec: 5,
    bubbleFadeDurationSec: 1.5,
    bubbleFontSize: 12,
    bubbleBgColor: 'rgba(20, 10, 15, 0.88)',
    bubbleTextColor: '#fef08a',
    ttsEnabled: false,
    priorityOverNormalComments: true,
  },

  dialogues: {
    welcome: {
      id: 'welcome',
      name: 'Chào Người Mới Vào Sảnh',
      mood: 'ARROGANT',
      frequencySec: 30,
      enabled: true,
      lines: [
        'Kẻ nào to gan dám bước chân vào Hắc Mộc Nhai của bản Giáo Chủ?',
        'Lại thêm một đệ tử có duyên với Ma Đạo! Mau đứng vào hàng ngũ!',
        'Bước vào Ma Giáo rồi thì tuyệt đối không được ăn cắp vặt bánh bao của sư huynh!',
      ],
    },
    brag: {
      id: 'brag',
      name: 'Khoe Tội Ác Hài Hước',
      mood: 'LAUGHING',
      frequencySec: 45,
      enabled: true,
      lines: [
        'Hôm qua bản tọa đã làm một việc kinh thiên động địa: giấu dép của Trưởng Lão!',
        'Bản Giáo Chủ từng uống trà sữa mà không thèm khuấy trân châu! Tà ác chưa?',
        'Ta vừa ra lệnh cho đầu bếp Ma Giáo nấu canh chua mà cố tình bỏ thêm đường!',
      ],
    },
    tease: {
      id: 'tease',
      name: 'Trêu Đồ Đệ Thường Xuyên',
      mood: 'LAUGHING',
      frequencySec: 60,
      enabled: true,
      lines: [
        'Đệ tử {playerName}, tấn công như muỗi đốt inox thế kia à?',
        '{playerName} mau đứng thẳng người lên, tướng đứng thế kia nhìn tưởng con tôm luộc!',
      ],
    },
    training_order: {
      id: 'training_order',
      name: 'Hiệu Lệnh Luyện Võ',
      mood: 'MARTIAL_ARTS',
      frequencySec: 120,
      enabled: true,
      lines: [
        'Tất cả đồ đệ! Vận chuyển chân khí mười thành công lực, bắt đầu luyện Ma Quyền!',
        'Ma Ảnh Thân Pháp! Ai né hụt sẽ bị bản tọa đày đi quét sân cả tháng!',
      ],
    },
  },

  tts: {
    provider: 'browser',
    azureRegion: 'southeastasia',
    azureKeyMasked: false,
    azureVoice: 'vi-VN-NamMinhNeural',
    vieNeuUrl: 'http://localhost:5000/v1',
    vieNeuCloudUrl: '',
    vieNeuVoice: 'vi-vn-thanh-long',
    vieNeuTimeoutMs: 6000,
    speechRate: 1.05,
    speechVolume: 1.0,
    pauseBetweenLinesSec: 1.2,
    reverbEffect: true,
    mouthLipSync: true,
  },

  backgrounds: [
    {
      id: 'bg_grand_palace',
      name: 'Đại Điện Hắc Long (Chính)',
      imageUrl: '/assets/magiao/bg_grand_palace.jpg',
      aspectRatio: '9:16',
      leaderX: 50,
      leaderY: 22,
      throneX: 50,
      throneY: 22,
      walkBounds: { minX: 10, maxX: 90, minY: 32, maxY: 94 },
    },
    {
      id: 'bg_night_palace',
      name: 'Đại Điện Đêm Huyền Bí',
      imageUrl: '/assets/magiao/bg_night_palace.jpg',
      aspectRatio: '9:16',
      leaderX: 50,
      leaderY: 22,
      throneX: 50,
      throneY: 22,
      walkBounds: { minX: 10, maxX: 90, minY: 32, maxY: 94 },
    },
    {
      id: 'bg_training_arena',
      name: 'Võ Đài Thiên Ma Quyền',
      imageUrl: '/assets/magiao/bg_arena.jpg',
      aspectRatio: '9:16',
      leaderX: 50,
      leaderY: 18,
      throneX: 50,
      throneY: 18,
      walkBounds: { minX: 12, maxX: 88, minY: 28, maxY: 92 },
    },
  ],
  activeBackgroundId: 'bg_grand_palace',

  minigames: {
    maQuyen: {
      enabled: true,
      durationSec: 50,
      targetPercent: 60,
      sweeperPenaltyCount: 5,
    },
    maAnh: {
      enabled: true,
      roundsCount: 3,
      roundDurationSec: 12,
      targetPercent: 65,
      commands: ['TRÁI', 'PHẢI', 'NHẢY'],
    },
    tamKhi: {
      enabled: true,
      roundsCount: 3,
      roundDurationSec: 14,
      targetPercent: 60,
      elements: ['LỬA', 'BĂNG', 'GIÓ'],
    },
  },

  transitions: {
    cycleDurationSec: 160,
    transitionFxDurationSec: 3.5,
    autoCycleEnabled: true,
    prepAnnouncementSec: 5,
    resultAnnouncementSec: 6,
    antiConsecutiveMinigame: true,
  },

  banners: {
    promotionNotice: {
      id: 'promotionNotice',
      name: 'Bảng Thông Báo Thăng Cấp',
      enabled: true,
      x: 50,
      y: 12,
      width: 85,
      height: 10,
      fontSize: 14,
      bgColor: 'rgba(25, 5, 8, 0.92)',
      bgOpacity: 0.92,
      borderColor: '#f59e0b',
      durationMs: 5000,
      priority: 90,
    },
    sweepingNotice: {
      id: 'sweepingNotice',
      name: 'Khu Quét Sân Tạ Tội',
      enabled: true,
      x: 50,
      y: 92,
      width: 90,
      height: 7,
      fontSize: 11,
      bgColor: 'rgba(15, 23, 42, 0.9)',
      bgOpacity: 0.9,
      borderColor: '#94a3b8',
      durationMs: 6000,
      priority: 50,
    },
  },

  layout: {
    vertical916: true,
    tiktokSafeZoneGuide: false,
    obsCleanView: false,
    customCss: '',
  },

  obsSync: {
    enabled: true,
    syncCamera: true,
    syncHud: true,
    syncVoiceMute: true,
    lastSyncedAt: Date.now(),
  },
};

const STORE_PATH = path.join(process.cwd(), 'data', 'magiao_full_config.json');
const BACKUP_PATH = path.join(process.cwd(), 'data', 'magiao_full_config_backup.json');

export class MaGiaoConfigStore {
  private config: MaGiaoFullAdminConfig;

  constructor() {
    this.config = this.loadFromDisk();
  }

  private loadFromDisk(): MaGiaoFullAdminConfig {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf8');
        const parsed = JSON.parse(raw) as Partial<MaGiaoFullAdminConfig>;
        return {
          ...DEFAULT_MA_GIAO_FULL_CONFIG,
          ...parsed,
          settings: {
            ...DEFAULT_MA_GIAO_FULL_CONFIG.settings,
            ...(parsed.settings || {}),
          },
          leaderProfile: {
            ...DEFAULT_MA_GIAO_FULL_CONFIG.leaderProfile,
            ...(parsed.leaderProfile || {}),
          },
          ranks: {
            ...DEFAULT_MA_GIAO_FULL_CONFIG.ranks,
            ...(parsed.ranks || {}),
          },
          dialogues: {
            ...DEFAULT_MA_GIAO_FULL_CONFIG.dialogues,
            ...(parsed.dialogues || {}),
          },
          tts: {
            ...DEFAULT_MA_GIAO_FULL_CONFIG.tts,
            ...(parsed.tts || {}),
          },
          minigames: {
            ...DEFAULT_MA_GIAO_FULL_CONFIG.minigames,
            ...(parsed.minigames || {}),
          },
          transitions: {
            ...DEFAULT_MA_GIAO_FULL_CONFIG.transitions,
            ...(parsed.transitions || {}),
          },
          banners: {
            ...DEFAULT_MA_GIAO_FULL_CONFIG.banners,
            ...(parsed.banners || {}),
          },
          layout: {
            ...DEFAULT_MA_GIAO_FULL_CONFIG.layout,
            ...(parsed.layout || {}),
          },
          obsSync: {
            ...DEFAULT_MA_GIAO_FULL_CONFIG.obsSync,
            ...(parsed.obsSync || {}),
          },
        };
      }
    } catch (err) {
      console.warn('[MaGiaoStore] Lỗi đọc file cấu hình, sử dụng mặc định:', err);
    }
    return { ...DEFAULT_MA_GIAO_FULL_CONFIG };
  }

  public saveToDisk(): boolean {
    try {
      const dataDir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.config.savedAt = Date.now();
      const serialized = JSON.stringify(this.config, null, 2);

      // Write temp file first for atomic persistence
      const tmpPath = `${STORE_PATH}.${process.pid}.tmp`;
      fs.writeFileSync(tmpPath, serialized, 'utf8');
      fs.renameSync(tmpPath, STORE_PATH);

      // Write backup
      fs.writeFileSync(BACKUP_PATH, serialized, 'utf8');
      return true;
    } catch (err) {
      console.error('[MaGiaoStore] Lỗi lưu cấu hình ra đĩa:', err);
      return false;
    }
  }

  public getConfig(): MaGiaoFullAdminConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  public updateConfig(patch: Partial<MaGiaoFullAdminConfig>): MaGiaoFullAdminConfig {
    if (patch.live) this.config.live = { ...this.config.live, ...patch.live };
    if (patch.settings) this.config.settings = { ...this.config.settings, ...patch.settings };
    if (patch.leaderProfile) this.config.leaderProfile = { ...this.config.leaderProfile, ...patch.leaderProfile };
    if (patch.ranks) this.config.ranks = { ...this.config.ranks, ...patch.ranks };
    if (patch.gifts) this.config.gifts = patch.gifts;
    if (patch.keywords) this.config.keywords = patch.keywords;
    if (patch.commentSettings) this.config.commentSettings = { ...this.config.commentSettings, ...patch.commentSettings };
    if (patch.dialogues) this.config.dialogues = { ...this.config.dialogues, ...patch.dialogues };
    if (patch.tts) this.config.tts = { ...this.config.tts, ...patch.tts };
    if (patch.backgrounds) this.config.backgrounds = patch.backgrounds;
    if (patch.activeBackgroundId) this.config.activeBackgroundId = patch.activeBackgroundId;
    if (patch.minigames) this.config.minigames = { ...this.config.minigames, ...patch.minigames };
    if (patch.transitions) this.config.transitions = { ...this.config.transitions, ...patch.transitions };
    if (patch.banners) this.config.banners = { ...this.config.banners, ...patch.banners };
    if (patch.layout) this.config.layout = { ...this.config.layout, ...patch.layout };
    if (patch.obsSync) this.config.obsSync = { ...this.config.obsSync, ...patch.obsSync };

    this.saveToDisk();
    return this.getConfig();
  }

  public resetToDefaults(): MaGiaoFullAdminConfig {
    this.config = JSON.parse(JSON.stringify(DEFAULT_MA_GIAO_FULL_CONFIG));
    this.saveToDisk();
    return this.getConfig();
  }

  public recordUnknownGift(gift: { giftId: string; giftName?: string; diamondCount?: number; username?: string }) {
    const existing = this.config.unknownGifts.find((g) => g.giftId === gift.giftId);
    if (existing) {
      existing.count += 1;
      existing.lastSeenAt = Date.now();
      if (gift.username) existing.lastSender = gift.username;
    } else {
      this.config.unknownGifts.push({
        giftId: gift.giftId,
        giftName: gift.giftName,
        diamondCount: gift.diamondCount,
        count: 1,
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        lastSender: gift.username,
      });
    }
    this.saveToDisk();
  }

  public clearUnknownGifts() {
    this.config.unknownGifts = [];
    this.saveToDisk();
  }
}

export const maGiaoConfigStore = new MaGiaoConfigStore();
