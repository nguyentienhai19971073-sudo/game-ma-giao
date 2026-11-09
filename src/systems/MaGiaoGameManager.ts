/**
 * MA GIÁO ONLINE - GAME STATE MANAGER
 * Authoritative client game engine controlling participants, 80-seat hall layout,
 * TikTok LIVE interaction, coin accumulation, rank promotions, martial arts training,
 * and the Sweeping Zone.
 */

import {
  DEFAULT_MA_GIAO_SETTINGS,
  LeaderMood,
  MA_GIAO_RANKS,
  MaGiaoParticipant,
  MaGiaoRankId,
  MaGiaoSettings,
  SweeperItem,
  TrainingMinigameId,
  TrainingState,
} from '../types/magiao';
import {
  IDLE_THOUGHTS,
  PROMOTION_DIALOGUES,
  RECRUIT_WELCOMES,
  SILLY_EVIL_BOASTS,
  TEASE_REGULARS,
  TRAINING_COMMANDS,
  TRAINING_RESULTS,
} from '../data/maGiaoDialogues';
import {
  CultLeaderAnimId,
  LeaderPersonality,
  LeaderVisualState,
} from '../types/magiao';
import { maGiaoMovementManager } from './MaGiaoMovementManager';
import { maGiaoVoiceManager } from './MaGiaoVoiceManager';
import { sectLeaderController } from './SectLeaderAnimationController';
import { liveConnectionManager } from './LiveConnectionManager';

export interface MaGiaoStateSnapshot {
  participants: MaGiaoParticipant[];
  sweepers: SweeperItem[];
  throneLeader: {
    userId?: string;
    username: string;
    nickname: string;
    title: string;
    isNpc: boolean;
  };
  coLeader?: {
    userId: string;
    username: string;
    nickname: string;
    title: string;
  };
  currentScene: 'GRAND_PALACE' | 'TRAINING_ARENA';
  trainingState: TrainingState;
  settings: MaGiaoSettings;
  leaderVisualState: LeaderVisualState;
  totalCommentsRecorded: number;
  totalGiftsRecorded: number;
  lastPromotionNotice?: {
    username: string;
    rankTitle: string;
    timestamp: number;
  };
}

const STORAGE_SETTINGS_KEY = 'ma_giao_settings_v1';

export class MaGiaoGameManager {
  private participants: Map<string, MaGiaoParticipant> = new Map();
  private sweepers: Map<string, SweeperItem> = new Map();
  private settings: MaGiaoSettings = DEFAULT_MA_GIAO_SETTINGS;
  private currentScene: 'GRAND_PALACE' | 'TRAINING_ARENA' = 'GRAND_PALACE';
  private previousMinigame: TrainingMinigameId = 'NONE';
  private trainingState: TrainingState = {
    activeMinigame: 'NONE',
    timeRemainingSec: 0,
    round: 1,
    participantsDone: [],
    targetCount: 0,
    totalEligible: 0,
    status: 'PREPARING',
  };
  private throneLeader: {
    userId?: string;
    username: string;
    nickname: string;
    title: string;
    isNpc: boolean;
  } = {
    userId: undefined,
    username: 'Độc Cô Cầu Bại',
    nickname: 'Giáo Chủ Tà Phái',
    title: 'Thiên Hạ Đệ Nhất Giáo Chủ',
    isNpc: true,
  };
  private coLeader?: {
    userId: string;
    username: string;
    nickname: string;
    title: string;
  };
  private listeners: Set<(state: MaGiaoStateSnapshot) => void> = new Set();
  private trainingTimer?: number;
  private autoTrainingCycleTimer?: number;
  private inactivityCheckTimer?: number;
  private idleCheckTimer?: number;
  private movementTickTimer?: number;
  private lastMovementTick = Date.now();
  private lastActivityTimestamp = Date.now();
  private totalComments = 0;
  private totalGifts = 0;
  private lastPromotionNotice?: {
    username: string;
    rankTitle: string;
    timestamp: number;
  };
  private processedGiftTxIds: Set<string> = new Set();

  constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined') {
      this.startTimers();
    }
  }

  private loadSettings() {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) {
        this.settings = { ...DEFAULT_MA_GIAO_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      this.settings = DEFAULT_MA_GIAO_SETTINGS;
    }

    // Attempt to load authoritative configuration from backend
    fetch('/api/magiao/config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok && data.config?.settings) {
          this.settings = { ...this.settings, ...data.config.settings };
          this.applySettings();
          this.notify();
        }
      })
      .catch(() => {});

    // Listen to real-time config updates from other clients or Admin CP
    liveConnectionManager.onMaGiaoConfig((serverConfig) => {
      if (serverConfig?.settings) {
        this.settings = { ...this.settings, ...serverConfig.settings };
        this.applySettings();
        this.notify();
      }
    });

    // Listen to real-time administrative broadcast actions
    liveConnectionManager.onMaGiaoAction((act) => {
      if (!act || !act.type) return;
      if (act.type === 'triggerLeaderAnim') {
        this.triggerLeaderAnimation(act.animId, act.priority || 100);
      } else if (act.type === 'orderFormation') {
        this.orderFormation();
      } else if (act.type === 'orderAllMartial') {
        this.orderAllMartial();
      } else if (act.type === 'orderAllMeditate') {
        this.orderAllMeditate();
      } else if (act.type === 'orderAllCheer') {
        this.orderAllCheer();
      } else if (act.type === 'summonDisciple' && act.userId) {
        this.summonDiscipleToThrone(act.userId);
      } else if (act.type === 'startMinigame') {
        this.startTrainingMinigame(act.minigameId);
      } else if (act.type === 'stopMinigame') {
        this.returnToGrandPalace();
      } else if (act.type === 'skipMinigame') {
        this.evaluateTrainingResult();
      } else if (act.type === 'clearParticipants') {
        this.clearParticipants();
      }
    });

    this.applySettings();
  }

  private applySettings() {
    maGiaoVoiceManager.setSettings({
      audioEnabled: this.settings.audioEnabled,
      voiceProvider: this.settings.voiceProvider,
      speechSpeed: this.settings.speechSpeed,
      speechVolume: this.settings.speechVolume,
    });
  }

  public saveSettings(newSettings: Partial<MaGiaoSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(this.settings));
      // Sync to backend store
      fetch('/api/magiao/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: this.settings }),
      }).catch(() => {});
      liveConnectionManager.broadcastMaGiaoConfig({ settings: this.settings });
    }
    this.applySettings();
    this.notify();
  }

  public subscribe(listener: (state: MaGiaoStateSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  public getSnapshot(): MaGiaoStateSnapshot {
    return {
      participants: Array.from(this.participants.values()),
      sweepers: Array.from(this.sweepers.values()),
      throneLeader: { ...this.throneLeader },
      coLeader: this.coLeader ? { ...this.coLeader } : undefined,
      currentScene: this.currentScene,
      trainingState: { ...this.trainingState },
      settings: { ...this.settings },
      leaderVisualState: sectLeaderController.getVisualState(),
      totalCommentsRecorded: this.totalComments,
      totalGiftsRecorded: this.totalGifts,
      lastPromotionNotice: this.lastPromotionNotice,
    };
  }

  private notify() {
    const snap = this.getSnapshot();
    for (const l of this.listeners) {
      l(snap);
    }
  }

  public startTimers() {
    if (this.movementTickTimer) return; // already started

    // 1. Movement & Autonomous 2D FSM simulation (runs at ~15-20fps tick for smooth coordination)
    this.lastMovementTick = Date.now();
    this.movementTickTimer = (setInterval(() => {
      this.tickMovement();
    }, 80) as unknown) as number;

    // 2. Inactivity & departure check (every 5 seconds)
    this.inactivityCheckTimer = (setInterval(() => {
      this.checkInactivity();
    }, 5000) as unknown) as number;

    // 3. Auto-training arena scheduler (every 10 seconds check if interval elapsed)
    let secondsSinceLastTraining = 0;
    this.autoTrainingCycleTimer = (setInterval(() => {
      if (!this.settings.autoTrainingEnabled || this.currentScene === 'TRAINING_ARENA') {
        secondsSinceLastTraining = 0;
        return;
      }
      secondsSinceLastTraining += 10;
      if (secondsSinceLastTraining >= this.settings.trainingIntervalSec) {
        secondsSinceLastTraining = 0;
        this.startRandomTraining();
      }
    }, 10000) as unknown) as number;

    // 4. Idle chatter (if silent for 40 seconds)
    this.idleCheckTimer = (setInterval(() => {
      if (this.currentScene === 'GRAND_PALACE' && Date.now() - this.lastActivityTimestamp > 40000) {
        this.triggerIdleThought();
      }
    }, 25000) as unknown) as number;
  }

  public stopTimers() {
    if (this.movementTickTimer) clearInterval(this.movementTickTimer);
    if (this.inactivityCheckTimer) clearInterval(this.inactivityCheckTimer);
    if (this.autoTrainingCycleTimer) clearInterval(this.autoTrainingCycleTimer);
    if (this.idleCheckTimer) clearInterval(this.idleCheckTimer);
    if (this.trainingTimer) clearInterval(this.trainingTimer);
    this.movementTickTimer = undefined;
    this.inactivityCheckTimer = undefined;
    this.autoTrainingCycleTimer = undefined;
    this.idleCheckTimer = undefined;
    this.trainingTimer = undefined;
  }

  public tickMovement(customDeltaSec?: number) {
    const now = Date.now();
    const delta = customDeltaSec !== undefined ? customDeltaSec : Math.max(0.01, Math.min(0.2, (now - this.lastMovementTick) / 1000));
    this.lastMovementTick = now;

    // 1. Tick Cult Leader FSM, locomotion & animations
    sectLeaderController.tick(delta, this.settings);

    // 2. Tick participants simulation if in Grand Palace
    if (this.currentScene === 'GRAND_PALACE' && this.participants.size > 0) {
      maGiaoMovementManager.updateSimulation(
        Array.from(this.participants.values()),
        this.settings,
        delta
      );
    }
    this.notify();
  }

  private checkInactivity() {
    const now = Date.now();
    const timeoutMs = this.settings.inactivityTimeoutSec * 1000;
    let changed = false;

    for (const [uid, p] of this.participants.entries()) {
      if (now - p.lastActiveAt > timeoutMs) {
        this.participants.delete(uid);
        this.sweepers.delete(uid);
        changed = true;
      }
    }

    if (changed) {
      this.notify();
    }
  }

  /**
   * Find first free seat (0..79).
   * Even seats on Left Wing, Odd seats on Right Wing.
   */
  private findAvailableSeat(): number {
    const occupied = new Set(Array.from(this.participants.values()).map((p) => p.seatIndex));
    for (let i = 0; i < this.settings.maxParticipants; i++) {
      if (!occupied.has(i)) return i;
    }
    return Math.floor(Math.random() * this.settings.maxParticipants);
  }

  // --- COMMENT PROCESSING ---
  public handleComment(event: {
    userId: string;
    username: string;
    nickname?: string;
    comment: string;
    avatarUrl?: string;
    isDemo?: boolean;
  }) {
    this.lastActivityTimestamp = Date.now();
    this.totalComments++;

    const userId = event.userId || event.username;
    const cleanNick = (event.nickname || event.username).replace(/^@+/, '').trim();
    let participant = this.participants.get(userId);

    // 1. If currently in Sweeping Zone, returning comment immediately pardons them!
    if (this.sweepers.has(userId) || participant?.isSweeping) {
      this.sweepers.delete(userId);
      if (participant) {
        participant.isSweeping = false;
        participant.actionState = 'idle';
      }
    }

    // 2. New recruit joining
    if (!participant) {
      if (this.participants.size >= this.settings.maxParticipants) {
        // Find oldest active or ignore overflow
        return;
      }

      const newSeat = this.findAvailableSeat();
      const homeMat = maGiaoMovementManager.getHomeMat(newSeat);
      participant = {
        id: userId,
        userId,
        username: event.username,
        nickname: cleanNick,
        avatarUrl: event.avatarUrl,
        totalCoins: 0,
        rank: 'DAN_DEN',
        seatIndex: newSeat,
        x: 50,
        y: 92,
        baseX: homeMat.x,
        baseY: homeMat.y,
        targetX: homeMat.x,
        targetY: homeMat.y,
        facing: 'back',
        currentZone: 'ZONE_B_AISLE',
        joinedAt: Date.now(),
        lastActiveAt: Date.now(),
        lastComment: event.comment,
        lastCommentAt: Date.now(),
        isSweeping: false,
        isDemo: event.isDemo,
        actionState: 'walk',
        actionExpiresAt: Date.now() + 6000,
      };
      this.participants.set(userId, participant);

      maGiaoVoiceManager.playGongSound();

      // Cult Leader turns head, fans or greets new recruit
      sectLeaderController.onRecruitJoined(cleanNick);

      // Chance Cult Leader welcomes recruit
      if (Math.random() < 0.35) {
        const welcomeTemplate = RECRUIT_WELCOMES[Math.floor(Math.random() * RECRUIT_WELCOMES.length)];
        maGiaoVoiceManager.enqueue({
          text: welcomeTemplate,
          priority: 50,
          mood: 'ARROGANT',
          targetUsername: cleanNick,
        });
      }
    } else {
      // Existing recruit updated
      participant.lastActiveAt = Date.now();
      participant.lastComment = event.comment;
      participant.lastCommentAt = Date.now();
      participant.nickname = cleanNick;
      if (event.avatarUrl) participant.avatarUrl = event.avatarUrl;

      // Occasional teasing of regulars
      if (Math.random() < 0.12 && participant.totalCoins > 0) {
        const teaseTemplate = TEASE_REGULARS[Math.floor(Math.random() * TEASE_REGULARS.length)];
        const spoken = teaseTemplate.replace('{user}', cleanNick);
        maGiaoVoiceManager.enqueue({
          text: spoken,
          priority: 40,
          mood: 'LAUGHING',
          targetUsername: cleanNick,
        });
      }
    }

    // 3. Comment-based Action Control in Grand Palace
    if (this.currentScene === 'GRAND_PALACE' && participant && !participant.isSweeping) {
      const parsed = maGiaoMovementManager.parseCommentToAction(event.comment);
      if (parsed && parsed.action) {
        const act = parsed.action;
        participant.actionState = act;

        // Cult Leader reacts to martial arts or comical slip
        sectLeaderController.onDiscipleCommentReaction(participant.nickname, act);

        if (act === 'bow') {
          participant.targetX = 50;
          participant.targetY = 36;
          participant.facing = 'back';
          participant.actionState = 'walk';
        } else if (act === 'walk' || act === 'run') {
          const preferredZone =
            parsed.zonePreference || (Math.random() < 0.5 ? 'ZONE_C_MARTIAL' : 'ZONE_D_MEDITATE');
          const pt = maGiaoMovementManager.getRandomPointInZone(preferredZone);
          participant.targetX = pt.x;
          participant.targetY = pt.y;
          participant.facing = maGiaoMovementManager.calculateFacing(
            participant.x,
            participant.y,
            pt.x,
            pt.y
          );
        } else if (act === 'meditate') {
          participant.facing = 'front';
          participant.actionExpiresAt = Date.now() + this.settings.meditateDurationSec * 1000;
        } else if (act === 'punch' || act === 'kick' || act === 'combo' || act === 'jump' || act === 'dodge') {
          participant.actionExpiresAt = Date.now() + this.settings.martialDurationSec * 1000;
        } else {
          participant.actionExpiresAt = Date.now() + 4000;
        }
      }
    }

    // 4. If in active Training Arena, check minigame input!
    if (this.currentScene === 'TRAINING_ARENA' && this.trainingState.status === 'IN_PROGRESS') {
      this.evaluateTrainingComment(participant, event.comment);
    }

    this.notify();
  }

  // --- LEADER MASS COMMANDS & ACTIVITY CONTROLS ---
  public orderFormation() {
    maGiaoVoiceManager.enqueue({
      text: 'Tất cả đệ tử Ma Giáo! Mau chóng về đúng vị trí bồ đoàn!',
      priority: 85,
      mood: 'ARROGANT',
    });
    maGiaoMovementManager.orderFormation(Array.from(this.participants.values()));
    this.notify();
  }

  public orderAllMartial() {
    maGiaoVoiceManager.enqueue({
      text: 'Tất cả đồ đệ! Mau đứng dậy luyện võ!',
      priority: 85,
      mood: 'MARTIAL_ARTS',
    });
    maGiaoMovementManager.orderAllMartial(Array.from(this.participants.values()));
    this.notify();
  }

  public orderAllMeditate() {
    maGiaoVoiceManager.enqueue({
      text: 'Người nào mệt rồi thì mau đi thiền định!',
      priority: 85,
      mood: 'TEA',
    });
    maGiaoMovementManager.orderAllMeditate(Array.from(this.participants.values()));
    this.notify();
  }

  public orderAllCheer() {
    maGiaoVoiceManager.enqueue({
      text: 'Thiên hạ đệ nhất Ma Giáo! Vạn thọ vô cương!',
      priority: 85,
      mood: 'LAUGHING',
    });
    maGiaoMovementManager.orderAllCheer(Array.from(this.participants.values()));
    this.notify();
  }

  public summonDiscipleToThrone(userId: string) {
    const p = this.participants.get(userId);
    if (!p) return;
    maGiaoVoiceManager.enqueue({
      text: `Khá khen cho đệ tử ${p.nickname}! Mau tiến lên ba bước diện kiến Giáo Chủ!`,
      priority: 90,
      mood: 'CONFERRING',
      targetUsername: p.nickname,
    });
    maGiaoMovementManager.summonToThrone(p);
    this.notify();
  }

  public resumeFreeRoam() {
    for (const p of this.participants.values()) {
      p.actionExpiresAt = 0;
    }
    this.notify();
  }

  // --- GIFT & RANK PROMOTION PROCESSING ---
  public handleGift(event: {
    userId: string;
    username: string;
    nickname?: string;
    giftId?: string | number;
    giftName?: string;
    diamondCount?: number;
    repeatCount?: number;
    isStreakCompletionOnly?: boolean;
    txId?: string;
    avatarUrl?: string;
    isDemo?: boolean;
  }) {
    if (event.isStreakCompletionOnly) return;
    if (event.txId && this.processedGiftTxIds.has(event.txId)) return;
    if (event.txId) this.processedGiftTxIds.add(event.txId);

    this.lastActivityTimestamp = Date.now();
    this.totalGifts++;

    const userId = event.userId || event.username;
    const cleanNick = (event.nickname || event.username).replace(/^@+/, '').trim();
    let participant = this.participants.get(userId);

    if (!participant) {
      const newSeat = this.findAvailableSeat();
      const homeMat = maGiaoMovementManager.getHomeMat(newSeat);
      participant = {
        id: userId,
        userId,
        username: event.username,
        nickname: cleanNick,
        avatarUrl: event.avatarUrl,
        totalCoins: 0,
        rank: 'DAN_DEN',
        seatIndex: newSeat,
        x: 50,
        y: 92,
        baseX: homeMat.x,
        baseY: homeMat.y,
        targetX: homeMat.x,
        targetY: homeMat.y,
        facing: 'back',
        currentZone: 'ZONE_B_AISLE',
        joinedAt: Date.now(),
        lastActiveAt: Date.now(),
        isSweeping: false,
        isDemo: event.isDemo,
        actionState: 'walk',
        actionExpiresAt: Date.now() + 6000,
      };
      this.participants.set(userId, participant);
    }

    // Accumulate coins
    const count = Math.max(1, Number(event.repeatCount || 1));
    const coinValuePerGift = Math.max(1, Number(event.diamondCount || 1));
    const deltaCoins = coinValuePerGift * count;
    participant.totalCoins += deltaCoins;
    participant.lastActiveAt = Date.now();

    // Check for Rank Promotion
    const oldRank = participant.rank;
    const newRank = this.calculateRank(participant.totalCoins, String(event.giftId || ''));

    if (newRank !== oldRank) {
      participant.rank = newRank;
      const rankMeta = MA_GIAO_RANKS[newRank];

      this.lastPromotionNotice = {
        username: cleanNick,
        rankTitle: rankMeta.title,
        timestamp: Date.now(),
      };

      maGiaoVoiceManager.playPromotionFanfare();

      // Trigger Cult Leader promotion animation & interaction
      sectLeaderController.onGiftPromotion(cleanNick, newRank, participant.totalCoins);

      // Check special thrones
      if (newRank === 'DONG_TON_GIAO_CHU') {
        this.coLeader = {
          userId: participant.userId,
          username: participant.username,
          nickname: cleanNick,
          title: rankMeta.title,
        };
      } else if (newRank === 'TAN_GIAO_CHU') {
        // Former leader becomes Thai Thuong
        this.coLeader = {
          userId: this.throneLeader.userId || 'npc_leader',
          username: this.throneLeader.username,
          nickname: this.throneLeader.nickname,
          title: 'Thái Thượng Giáo Chủ',
        };
        // New leader ascends throne!
        this.throneLeader = {
          userId: participant.userId,
          username: participant.username,
          nickname: cleanNick,
          title: 'Tân Giáo Chủ Ma Giáo',
          isNpc: false,
        };
      }

      // Voice promotion announcement
      const lines = PROMOTION_DIALOGUES[newRank] || PROMOTION_DIALOGUES.NGOAI_MON;
      const template = lines[Math.floor(Math.random() * lines.length)];
      const announcement = template.replace(/{user}/g, cleanNick);

      maGiaoVoiceManager.enqueue({
        text: announcement,
        priority: newRank === 'TAN_GIAO_CHU' || newRank === 'DONG_TON_GIAO_CHU' ? 100 : 80,
        mood: newRank === 'TAN_GIAO_CHU' ? 'RAGE' : 'CONFERRING',
        targetUsername: cleanNick,
        targetRank: rankMeta.title,
      });
    }

    this.notify();
  }

  private calculateRank(coins: number, giftId: string): MaGiaoRankId {
    if (giftId === this.settings.supremeGiftId || coins >= MA_GIAO_RANKS.TAN_GIAO_CHU.minCoins) {
      return 'TAN_GIAO_CHU';
    }
    if (coins >= MA_GIAO_RANKS.DONG_TON_GIAO_CHU.minCoins) return 'DONG_TON_GIAO_CHU';
    if (coins >= MA_GIAO_RANKS.DAI_TRUONG_LAO.minCoins) return 'DAI_TRUONG_LAO';
    if (coins >= MA_GIAO_RANKS.HO_PHAP.minCoins) return 'HO_PHAP';
    if (coins >= MA_GIAO_RANKS.TINH_ANH.minCoins) return 'TINH_ANH';
    if (coins >= MA_GIAO_RANKS.SU_HUYNH.minCoins) return 'SU_HUYNH';
    if (coins >= MA_GIAO_RANKS.NOI_MON.minCoins) return 'NOI_MON';
    if (coins >= MA_GIAO_RANKS.NGOAI_MON.minCoins) return 'NGOAI_MON';
    return 'DAN_DEN';
  }

  // --- MARTIAL ARTS TRAINING SYSTEM ---
  public startRandomTraining() {
    if (this.currentScene === 'TRAINING_ARENA') return;

    const available: TrainingMinigameId[] = [];
    if (this.settings.enabledMinigames.maQuyen && this.previousMinigame !== 'MA_QUYEN_LOAN_VU') {
      available.push('MA_QUYEN_LOAN_VU');
    }
    if (this.settings.enabledMinigames.maAnh && this.previousMinigame !== 'MA_ANH_THAN_PHAP') {
      available.push('MA_ANH_THAN_PHAP');
    }
    if (this.settings.enabledMinigames.tamKhi && this.previousMinigame !== 'TAM_KHI_MA_TRAN') {
      available.push('TAM_KHI_MA_TRAN');
    }

    if (available.length === 0) {
      available.push('MA_QUYEN_LOAN_VU');
    }

    const chosen = available[Math.floor(Math.random() * available.length)];
    this.startTrainingMinigame(chosen);
  }

  public startTrainingMinigame(minigameId: TrainingMinigameId) {
    this.previousMinigame = minigameId;
    this.currentScene = 'TRAINING_ARENA';

    // Cult Leader demonstrates martial moves to open the training session
    sectLeaderController.onMinigameDirector('PREPARING');

    const eligibleUsers = Array.from(this.participants.values()).filter((p) => !p.isSweeping);
    const target = Math.max(1, Math.ceil((eligibleUsers.length * this.settings.winPercentThreshold) / 100));

    // Reset participant training flags
    for (const p of this.participants.values()) {
      p.completedCurrentTraining = false;
      p.actionState = 'idle';
    }

    let activeCmd = 'MÚA';
    let correctAns = undefined;

    if (minigameId === 'MA_ANH_THAN_PHAP') {
      const directions = ['TRÁI', 'PHẢI', 'NHẢY'];
      activeCmd = directions[Math.floor(Math.random() * directions.length)];
    } else if (minigameId === 'TAM_KHI_MA_TRAN') {
      const elements = ['LỬA', 'BĂNG', 'GIÓ'];
      const leaderElem = elements[Math.floor(Math.random() * elements.length)];
      activeCmd = leaderElem;
      // Cyclical counter rule: BĂNG khắc LỬA, GIÓ khắc BĂNG, LỬA khắc GIÓ
      correctAns = leaderElem === 'LỬA' ? 'BĂNG' : leaderElem === 'BĂNG' ? 'GIÓ' : 'LỬA';
    }

    this.trainingState = {
      activeMinigame: minigameId,
      timeRemainingSec: this.settings.trainingDurationSec,
      round: 1,
      activeCommand: activeCmd,
      correctAnswer: correctAns,
      participantsDone: [],
      totalEligible: eligibleUsers.length,
      targetCount: target,
      status: 'IN_PROGRESS',
    };

    // Leader shouts instruction
    const cmds = TRAINING_COMMANDS[minigameId];
    if (cmds && cmds.length > 0) {
      const line = cmds[Math.floor(Math.random() * cmds.length)];
      maGiaoVoiceManager.enqueue({
        text: line,
        priority: 70,
        mood: 'MARTIAL_ARTS',
      });
    }

    maGiaoVoiceManager.playMartialWhoosh();
    this.notify();

    if (this.trainingTimer) clearInterval(this.trainingTimer);
    this.trainingTimer = setInterval(() => {
      if (this.trainingState.timeRemainingSec <= 1) {
        clearInterval(this.trainingTimer);
        this.evaluateTrainingResult();
      } else {
        this.trainingState.timeRemainingSec--;

        // For Ma Anh Than Phap, cycle command every 15s
        if (
          this.trainingState.activeMinigame === 'MA_ANH_THAN_PHAP' &&
          this.trainingState.timeRemainingSec % 15 === 0 &&
          this.trainingState.round < 3
        ) {
          this.trainingState.round++;
          const directions = ['TRÁI', 'PHẢI', 'NHẢY'];
          this.trainingState.activeCommand = directions[Math.floor(Math.random() * directions.length)];
          maGiaoVoiceManager.playMartialWhoosh();
        }

        this.notify();
      }
    }, 1000) as unknown as number;
  }

  private evaluateTrainingComment(p: MaGiaoParticipant, commentText: string) {
    if (p.completedCurrentTraining) return;

    const lower = commentText.toLowerCase().trim();
    let isCorrect = false;

    if (this.trainingState.activeMinigame === 'MA_QUYEN_LOAN_VU') {
      if (lower.includes('múa') || lower.includes('mua') || lower.includes('muas')) {
        isCorrect = true;
        p.actionState = 'múa';
      }
    } else if (this.trainingState.activeMinigame === 'MA_ANH_THAN_PHAP') {
      const target = (this.trainingState.activeCommand || '').toLowerCase();
      if (
        (target === 'trái' && (lower.includes('trái') || lower.includes('trai') || lower.includes('left'))) ||
        (target === 'phải' && (lower.includes('phải') || lower.includes('phai') || lower.includes('right'))) ||
        (target === 'nhảy' && (lower.includes('nhảy') || lower.includes('nhay') || lower.includes('jump')))
      ) {
        isCorrect = true;
        p.actionState = 'dodging';
      }
    } else if (this.trainingState.activeMinigame === 'TAM_KHI_MA_TRAN') {
      const target = (this.trainingState.correctAnswer || '').toLowerCase();
      if (lower.includes(target)) {
        isCorrect = true;
        p.actionState = 'casting';
      }
    }

    if (isCorrect) {
      p.completedCurrentTraining = true;
      if (!this.trainingState.participantsDone.includes(p.userId)) {
        this.trainingState.participantsDone.push(p.userId);
        maGiaoVoiceManager.playMartialWhoosh();
      }
    }
  }

  private evaluateTrainingResult() {
    this.trainingState.status = 'EVALUATING';
    const isVictory = this.trainingState.participantsDone.length >= this.trainingState.targetCount;

    // Leader reacts to training victory or defeat
    sectLeaderController.onMinigameDirector(isVictory ? 'VICTORY' : 'DEFEAT');

    if (isVictory) {
      this.trainingState.status = 'VICTORY';
      const lines = TRAINING_RESULTS.victory;
      const speech = lines[Math.floor(Math.random() * lines.length)];

      for (const p of this.participants.values()) {
        if (p.completedCurrentTraining) {
          p.actionState = 'múa';
        }
      }

      maGiaoVoiceManager.playPromotionFanfare();
      maGiaoVoiceManager.enqueue({
        text: speech,
        priority: 75,
        mood: 'LAUGHING',
      });
    } else {
      this.trainingState.status = 'DEFEAT';
      const lines = TRAINING_RESULTS.defeat;
      const speech = lines[Math.floor(Math.random() * lines.length)];

      // Select up to maxSweepers who failed to complete
      const failed = Array.from(this.participants.values()).filter(
        (p) => !p.completedCurrentTraining && !p.isSweeping,
      );
      const toSweep = failed.slice(0, this.settings.maxSweepers);

      for (const s of toSweep) {
        s.isSweeping = true;
        s.actionState = 'sweeping';
        this.sweepers.set(s.userId, {
          userId: s.userId,
          username: s.username,
          nickname: s.nickname,
          rank: s.rank,
          sweptAt: Date.now(),
        });
      }

      maGiaoVoiceManager.enqueue({
        text: speech,
        priority: 75,
        mood: 'RAGE',
      });
    }

    this.notify();

    // After 8 seconds, transition back to Grand Palace
    setTimeout(() => {
      this.returnToGrandPalace();
    }, 8000);
  }

  public setParticipantSweeping(userId: string, isSweeping = true) {
    const p = this.participants.get(userId);
    if (p) {
      p.isSweeping = isSweeping;
      p.actionState = isSweeping ? 'sweeping' : 'idle';
      if (isSweeping) {
        this.sweepers.set(userId, {
          userId: p.userId,
          username: p.username,
          nickname: p.nickname,
          rank: p.rank,
          sweptAt: Date.now(),
        });
      } else {
        this.sweepers.delete(userId);
      }
      this.notify();
    }
  }

  public returnToGrandPalace() {
    if (this.trainingTimer) clearInterval(this.trainingTimer);
    this.currentScene = 'GRAND_PALACE';
    this.trainingState.activeMinigame = 'NONE';
    this.trainingState.status = 'PREPARING';

    // Cult Leader teleports back to throne
    sectLeaderController.playAnimation('shadow_teleport', 60, 2800);

    for (const p of this.participants.values()) {
      if (!p.isSweeping) {
        p.actionState = 'idle';
      }
    }

    this.notify();
  }

  public triggerLeaderAnimation(animId: CultLeaderAnimId, priority = 100, customDurationMs?: number) {
    sectLeaderController.playAnimation(animId, priority, customDurationMs);
    this.notify();
  }

  public setLeaderPersonality(personality: LeaderPersonality) {
    sectLeaderController.setPersonality(personality);
    this.saveSettings({ leaderPersonality: personality });
  }

  private triggerIdleThought() {
    const lines = IDLE_THOUGHTS;
    const thought = lines[Math.floor(Math.random() * lines.length)];
    maGiaoVoiceManager.enqueue({
      text: thought,
      priority: 20,
      mood: 'TEA',
    });
  }

  // --- DEMO / SIMULATION HELPERS ---
  public simulateRecruit(name?: string) {
    const demoNames = [
      'Tiêu Phong',
      'Đoàn Dự',
      'Hư Trúc',
      'Lệnh Hồ Xung',
      'Dương Quá',
      'Tiểu Long Nữ',
      'Hoàng Dung',
      'Quách Tĩnh',
      'Trương Vô Kỵ',
      'Triệu Mẫn',
    ];
    const chosen = name || demoNames[Math.floor(Math.random() * demoNames.length)] + '_' + Math.floor(Math.random() * 99);
    this.handleComment({
      userId: 'demo_' + chosen,
      username: chosen,
      nickname: chosen,
      comment: 'Bái kiến Giáo Chủ! Đệ tử xin gia nhập Ma Giáo!',
      isDemo: true,
    });
  }

  public simulateGift(coins = 10, giftName = 'Hoa Hồng') {
    const list = Array.from(this.participants.values());
    if (list.length === 0) {
      this.simulateRecruit();
    }
    const target = list[Math.floor(Math.random() * list.length)] || Array.from(this.participants.values())[0];
    if (!target) return;

    this.handleGift({
      userId: target.userId,
      username: target.username,
      nickname: target.nickname,
      diamondCount: coins,
      repeatCount: 1,
      giftName,
      isDemo: true,
    });
  }

  public simulateMinigameAction() {
    if (this.currentScene !== 'TRAINING_ARENA') return;
    const list = Array.from(this.participants.values()).filter((p) => !p.completedCurrentTraining);
    if (list.length === 0) return;

    const sample = list.slice(0, Math.ceil(list.length * 0.7));
    let sampleComment = 'múa';
    if (this.trainingState.activeMinigame === 'MA_ANH_THAN_PHAP') {
      sampleComment = this.trainingState.activeCommand?.toLowerCase() || 'trái';
    } else if (this.trainingState.activeMinigame === 'TAM_KHI_MA_TRAN') {
      sampleComment = this.trainingState.correctAnswer?.toLowerCase() || 'băng';
    }

    for (const p of sample) {
      this.handleComment({
        userId: p.userId,
        username: p.username,
        nickname: p.nickname,
        comment: sampleComment,
        isDemo: true,
      });
    }
  }

  public clearParticipants() {
    this.participants.clear();
    this.sweepers.clear();
    this.notify();
  }
}

export const maGiaoGameManager = new MaGiaoGameManager();
