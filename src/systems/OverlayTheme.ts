import type { CSSProperties } from 'react';
import {
  DEFAULT_OVERLAY_SETTINGS,
  DEFAULT_VOICE_SETTINGS,
  FortuneCategory,
  StreamOverlaySettings,
  VoiceSettings,
} from '../types/temple';

export const OVERLAY_SETTINGS_STORAGE_KEY = 'chua_online_overlay_settings_v4';
const COMMENT_DURATION_12S_MIGRATION_KEY = 'chua_online_comment_duration_12s_migrated_v1';
// CHUA_INACTIVITY_5MIN_V1: one-time upgrade of the former 120s idle default; preserve other custom durations.
const INACTIVITY_5MIN_MIGRATION_KEY = 'chua_online_inactivity_5min_migrated_v1';
// CHUA_LIVE_TOP_7MIN_1000LIKE_V1 - migrate former 300s default once; keep other custom durations.
const INACTIVITY_7MIN_MIGRATION_KEY = 'chua_online_inactivity_7min_migrated_v1';
export const VOICE_SETTINGS_STORAGE_KEY = 'chua_online_voice_settings_v2';

export function clampPanelOpacity(opacity: number | undefined): number {
  if (typeof opacity !== 'number' || !Number.isFinite(opacity)) {
    return DEFAULT_OVERLAY_SETTINGS.panelOpacity;
  }
  return Math.max(0.25, Math.min(0.92, Number(opacity.toFixed(2))));
}

export function clampPanelScale(scale: number | undefined): number {
  if (typeof scale !== 'number' || !Number.isFinite(scale)) {
    return DEFAULT_OVERLAY_SETTINGS.panelScale;
  }
  return Math.max(0.7, Math.min(1.25, Number(scale.toFixed(2))));
}

export function clampLotusDensity(density: number | undefined): number {
  if (typeof density !== 'number' || !Number.isFinite(density)) {
    return DEFAULT_OVERLAY_SETTINGS.lotusParticleDensity;
  }
  return Math.max(0.3, Math.min(2.5, Number(density.toFixed(2))));
}

export function clampPetalCount(count: number | undefined): number {
  if (typeof count !== 'number' || !Number.isFinite(count)) {
    return DEFAULT_OVERLAY_SETTINGS.petalCount;
  }
  return Math.max(8, Math.min(120, Math.round(count)));
}

export function clampLeafCount(count: number | undefined): number {
  if (typeof count !== 'number' || !Number.isFinite(count)) {
    return DEFAULT_OVERLAY_SETTINGS.leafCount;
  }
  return Math.max(2, Math.min(60, Math.round(count)));
}

export function clampCenterPanelDuration(ms: number | undefined): number {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) {
    return DEFAULT_OVERLAY_SETTINGS.centerPanelDuration;
  }
  return Math.max(2000, Math.min(25000, Math.round(ms)));
}

export function clampCommentBubbleDuration(ms: number | undefined): number {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) {
    return DEFAULT_OVERLAY_SETTINGS.commentBubbleDuration;
  }
  return Math.max(5000, Math.min(30000, Math.round(ms)));
}

export function clampEventNotificationDuration(ms: number | undefined): number {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) {
    return DEFAULT_OVERLAY_SETTINGS.eventNotificationDuration;
  }
  return Math.max(4000, Math.min(30000, Math.round(ms)));
}

/**
 * Builds an elegant Buddhist dark-burgundy RGBA background + thin gold border style.
 * IMPORTANT:
 * - Applies alpha ONLY via `rgba(...)` backgrounds — NEVER sets CSS `opacity` on the panel container,
 *   keeping Vietnamese typography 100% crisp and legible.
 * - Avoids `backdrop-filter` over WebGL to preserve smooth frame rates on MacBook M1 8GB RAM.
 */
export function buildBurgundyPanelStyle(
  panelOpacity = DEFAULT_OVERLAY_SETTINGS.panelOpacity,
  options?: {
    accentGoldBorder?: boolean;
    scale?: number;
    transformOrigin?: string;
  },
): CSSProperties {
  const alpha = clampPanelOpacity(panelOpacity);
  const topAlpha = Math.min(0.95, Number((alpha + 0.04).toFixed(2)));
  const botAlpha = Math.max(0.2, Number((alpha - 0.04).toFixed(2)));
  const borderAlpha = options?.accentGoldBorder ? 0.68 : 0.48;

  const style: CSSProperties = {
    backgroundImage: `linear-gradient(180deg, rgba(58, 10, 19, ${topAlpha}) 0%, rgba(26, 6, 10, ${botAlpha}) 100%)`,
    backgroundColor: `rgba(38, 8, 14, ${alpha})`,
    borderColor: `rgba(212, 175, 55, ${borderAlpha})`,
  };

  if (options?.scale !== undefined) {
    const s = clampPanelScale(options.scale);
    if (Math.abs(s - 1) > 0.005) {
      style.transform = `scale(${s})`;
      style.transformOrigin = options.transformOrigin || 'top left';
    }
  }

  return style;
}

export function buildBurgundyHeaderStyle(
  panelOpacity = DEFAULT_OVERLAY_SETTINGS.panelOpacity,
): CSSProperties {
  const alpha = clampPanelOpacity(panelOpacity);
  const headerTop = Math.min(0.96, Number((alpha + 0.1).toFixed(2)));
  const headerBot = Math.min(0.92, Number((alpha + 0.02).toFixed(2)));
  return {
    backgroundImage: `linear-gradient(180deg, rgba(88, 15, 28, ${headerTop}) 0%, rgba(44, 9, 15, ${headerBot}) 100%)`,
    borderColor: 'rgba(212, 175, 55, 0.34)',
  };
}

export function buildBurgundyScrollFooterStyle(
  panelOpacity = DEFAULT_OVERLAY_SETTINGS.panelOpacity,
): CSSProperties {
  const alpha = clampPanelOpacity(panelOpacity);
  const subAlpha = Math.max(0.22, Number((alpha - 0.03).toFixed(2)));
  return {
    backgroundColor: `rgba(18, 4, 7, ${subAlpha})`,
    borderColor: 'rgba(212, 175, 55, 0.22)',
  };
}

export function buildCharacterNameLabelStyle(
  panelOpacity = DEFAULT_OVERLAY_SETTINGS.panelOpacity,
  variant: 'idle' | 'default' | 'ceremony' | 'speaking' = 'idle',
): CSSProperties {
  const base = clampPanelOpacity(panelOpacity);
  if (variant === 'speaking') {
    const a = Math.min(0.92, Number((base + 0.16).toFixed(2)));
    return {
      backgroundColor: `rgba(68, 14, 24, ${a})`,
      borderColor: 'rgba(255, 224, 130, 0.88)',
    };
  }
  if (variant === 'ceremony') {
    const a = Math.min(0.88, Number((base + 0.1).toFixed(2)));
    return {
      backgroundColor: `rgba(52, 10, 18, ${a})`,
      borderColor: 'rgba(245, 205, 99, 0.68)',
    };
  }
  return {
    backgroundColor: `rgba(34, 8, 13, ${base})`,
    borderColor: 'rgba(212, 175, 55, 0.38)',
  };
}

export function buildCommentBubbleStyle(
  panelOpacity = DEFAULT_OVERLAY_SETTINGS.panelOpacity,
  isSpeaking = false,
): CSSProperties {
  const base = clampPanelOpacity(panelOpacity);
  // Keep bubble semi-transparent (default ~0.62 when panelOpacity is 0.55) while text stays 100% crisp
  const bubbleAlpha = Math.min(0.9, Math.max(0.45, Number((base + 0.07).toFixed(2))));
  return {
    backgroundImage: `linear-gradient(180deg, rgba(56, 11, 20, ${bubbleAlpha}) 0%, rgba(28, 6, 11, ${bubbleAlpha}) 100%)`,
    backgroundColor: `rgba(40, 8, 14, ${bubbleAlpha})`,
    borderColor: isSpeaking ? 'rgba(255, 226, 138, 0.92)' : 'rgba(229, 189, 90, 0.68)',
  };
}

export function buildCenterCeremonialPanelStyle(
  panelOpacity = DEFAULT_OVERLAY_SETTINGS.panelOpacity,
  isMajor = false,
): CSSProperties {
  const base = clampPanelOpacity(panelOpacity);
  const topAlpha = Math.min(0.88, Number((base + 0.06).toFixed(2)));
  const botAlpha = Math.min(0.84, Math.max(0.32, Number((base - 0.02).toFixed(2))));
  return {
    backgroundImage: isMajor
      ? `linear-gradient(180deg, rgba(74, 12, 23, ${topAlpha}) 0%, rgba(34, 7, 12, ${botAlpha}) 100%)`
      : `linear-gradient(180deg, rgba(60, 10, 20, ${topAlpha}) 0%, rgba(28, 6, 11, ${botAlpha}) 100%)`,
    backgroundColor: `rgba(40, 8, 14, ${base})`,
    borderColor: isMajor ? 'rgba(245, 204, 98, 0.86)' : 'rgba(212, 175, 55, 0.68)',
    boxShadow: isMajor
      ? '0 8px 26px rgba(0, 0, 0, 0.55), 0 0 18px rgba(245, 198, 84, 0.22)'
      : '0 6px 20px rgba(0, 0, 0, 0.48), 0 0 12px rgba(212, 175, 55, 0.14)',
  };
}

export function buildXinXamResultPanelStyle(
  panelOpacity = 0.55,
  categoryOrDaiCat: FortuneCategory | boolean = 'Trung Cát',
): CSSProperties {
  const base = clampPanelOpacity(panelOpacity);
  const topAlpha = Math.min(0.9, Number((base + 0.04).toFixed(2)));
  const botAlpha = Math.min(0.86, Math.max(0.28, Number((base - 0.02).toFixed(2))));

  const category: FortuneCategory =
    typeof categoryOrDaiCat === 'boolean'
      ? categoryOrDaiCat
        ? 'Đại Cát'
        : 'Trung Cát'
      : categoryOrDaiCat;

  let borderColor = 'rgba(218, 178, 68, 0.78)';
  let boxShadow = '0 6px 20px rgba(0, 0, 0, 0.48), 0 0 12px rgba(212, 175, 55, 0.14)';

  switch (category) {
    case 'Đại Cát':
      borderColor = 'rgba(255, 218, 106, 0.92)';
      boxShadow = '0 8px 24px rgba(0, 0, 0, 0.54), 0 0 18px rgba(255, 206, 86, 0.24)';
      break;
    case 'Trung Cát':
      borderColor = 'rgba(244, 198, 92, 0.84)';
      boxShadow = '0 7px 22px rgba(0, 0, 0, 0.5), 0 0 14px rgba(244, 198, 92, 0.18)';
      break;
    case 'Tiểu Cát':
      borderColor = 'rgba(247, 178, 196, 0.82)';
      boxShadow = '0 6px 20px rgba(0, 0, 0, 0.48), 0 0 13px rgba(247, 168, 192, 0.16)';
      break;
    case 'Bình':
      borderColor = 'rgba(222, 196, 146, 0.74)';
      boxShadow = '0 6px 18px rgba(0, 0, 0, 0.46), 0 0 10px rgba(212, 175, 55, 0.12)';
      break;
    case 'Cần Thận Trọng':
      borderColor = 'rgba(236, 168, 118, 0.8)';
      boxShadow = '0 6px 20px rgba(0, 0, 0, 0.5), 0 0 12px rgba(236, 158, 102, 0.15)';
      break;
  }

  return {
    backgroundImage: `linear-gradient(180deg, rgba(68, 12, 23, ${topAlpha}) 0%, rgba(36, 7, 13, ${botAlpha}) 100%)`,
    backgroundColor: `rgba(48, 9, 17, ${base})`,
    borderColor,
    boxShadow,
  };
}

export function loadPersistedOverlaySettings(obsFromUrl = false): StreamOverlaySettings {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      ...DEFAULT_OVERLAY_SETTINGS,
      obsCleanView: obsFromUrl,
    };
  }
  try {
    const raw = window.localStorage.getItem(OVERLAY_SETTINGS_STORAGE_KEY);
    // One-time migration: update only the previous built-in 8s/15s defaults.
    // After migration, manually setting 8s in Admin remains persistent.
    const alreadyMigrated = window.localStorage.getItem(COMMENT_DURATION_12S_MIGRATION_KEY) === '1';
    if (!raw) {
      if (!alreadyMigrated) window.localStorage.setItem(COMMENT_DURATION_12S_MIGRATION_KEY, '1');
      return {
        ...DEFAULT_OVERLAY_SETTINGS,
        obsCleanView: obsFromUrl,
      };
    }
    const parsed = JSON.parse(raw) as Partial<StreamOverlaySettings>;
    const inactivity5MinAlreadyMigrated = window.localStorage.getItem(INACTIVITY_5MIN_MIGRATION_KEY) === '1';
    const inactivity7MinAlreadyMigrated = window.localStorage.getItem(INACTIVITY_7MIN_MIGRATION_KEY) === '1';
    if (!inactivity7MinAlreadyMigrated) window.localStorage.setItem(INACTIVITY_7MIN_MIGRATION_KEY, '1');
    if (!inactivity5MinAlreadyMigrated) window.localStorage.setItem(INACTIVITY_5MIN_MIGRATION_KEY, '1');
    const upgradePreviousCommentDefault = !alreadyMigrated &&
      (parsed.commentBubbleDuration === 8000 || parsed.commentBubbleDuration === 15000);
    if (!alreadyMigrated) window.localStorage.setItem(COMMENT_DURATION_12S_MIGRATION_KEY, '1');
    return {
      ...DEFAULT_OVERLAY_SETTINGS,
      ...parsed,
      // Migrate former 5-minute (300s) default to 7 minutes on first load.
      // Also migrate 120s only if 5-minute migration had not yet run.
      inactivityTimeoutSec: !inactivity7MinAlreadyMigrated &&
        (parsed.inactivityTimeoutSec === 300 || parsed.inactivityTimeoutSec == null ||
          (!inactivity5MinAlreadyMigrated && parsed.inactivityTimeoutSec === 120))
          ? 420 : (!inactivity5MinAlreadyMigrated && parsed.inactivityTimeoutSec === 120
            ? 300 : (parsed.inactivityTimeoutSec ?? DEFAULT_OVERLAY_SETTINGS.inactivityTimeoutSec)),
      // Disable old accelerated 12s Demo mode during the 5-minute migration.
      demoAcceleratedTimeout: !inactivity5MinAlreadyMigrated
        ? false : Boolean(parsed.demoAcceleratedTimeout),
      panelScale: clampPanelScale(parsed.panelScale),
      panelOpacity: clampPanelOpacity(parsed.panelOpacity),
      lotusParticleDensity: clampLotusDensity(parsed.lotusParticleDensity),
      petalCount: clampPetalCount(parsed.petalCount),
      leafCount: clampLeafCount(parsed.leafCount),
      // Upgrade previous release defaults (3.4s/10s) to the new 8s default; retain custom values.
      centerPanelDuration: clampCenterPanelDuration(
        parsed.centerPanelDuration === 3400 || parsed.centerPanelDuration === 10000
          ? DEFAULT_OVERLAY_SETTINGS.centerPanelDuration
          : parsed.centerPanelDuration,
      ),
      commentBubbleDuration: clampCommentBubbleDuration(
        upgradePreviousCommentDefault
          ? DEFAULT_OVERLAY_SETTINGS.commentBubbleDuration
          : parsed.commentBubbleDuration,
      ),
      eventNotificationDuration: clampEventNotificationDuration(
        parsed.eventNotificationDuration === 12000
          ? DEFAULT_OVERLAY_SETTINGS.eventNotificationDuration
          : parsed.eventNotificationDuration,
      ),
      showAvatarInCenterPanel:
        parsed.showAvatarInCenterPanel !== undefined
          ? Boolean(parsed.showAvatarInCenterPanel)
          : DEFAULT_OVERLAY_SETTINGS.showAvatarInCenterPanel,
      showXinXamPanel:
        parsed.showXinXamPanel !== undefined
          ? Boolean(parsed.showXinXamPanel)
          : DEFAULT_OVERLAY_SETTINGS.showXinXamPanel,
      showOfferingCoins: parsed.showOfferingCoins !== false,
      offeringCoinUnit: typeof parsed.offeringCoinUnit === 'string' && parsed.offeringCoinUnit.trim()
        ? parsed.offeringCoinUnit.trim().slice(0, 12) : 'xu',
      offeringCoinFontSize: Math.max(9, Math.min(18,
        Number.isFinite(parsed.offeringCoinFontSize) ? Number(parsed.offeringCoinFontSize) : 11)),
      offeringCoinColor: typeof parsed.offeringCoinColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(parsed.offeringCoinColor)
        ? parsed.offeringCoinColor : '#ffe699',
      obsCleanView: obsFromUrl || Boolean(parsed.obsCleanView && false),
    };
  } catch {
    return {
      ...DEFAULT_OVERLAY_SETTINGS,
      obsCleanView: obsFromUrl,
    };
  }
}

export function savePersistedOverlaySettings(settings: StreamOverlaySettings): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const toSave: Partial<StreamOverlaySettings> = {
      ...settings,
      obsCleanView: false,
      panelScale: clampPanelScale(settings.panelScale),
      panelOpacity: clampPanelOpacity(settings.panelOpacity),
      lotusParticleDensity: clampLotusDensity(settings.lotusParticleDensity),
      petalCount: clampPetalCount(settings.petalCount),
      leafCount: clampLeafCount(settings.leafCount),
      centerPanelDuration: clampCenterPanelDuration(settings.centerPanelDuration),
      commentBubbleDuration: clampCommentBubbleDuration(settings.commentBubbleDuration),
      eventNotificationDuration: clampEventNotificationDuration(settings.eventNotificationDuration),
      showAvatarInCenterPanel: Boolean(settings.showAvatarInCenterPanel),
      showXinXamPanel: settings.showXinXamPanel !== false,
      showOfferingCoins: settings.showOfferingCoins !== false,
      offeringCoinUnit: typeof settings.offeringCoinUnit === 'string' && settings.offeringCoinUnit.trim()
        ? settings.offeringCoinUnit.trim().slice(0, 12) : 'xu',
      offeringCoinFontSize: Math.max(9, Math.min(18,
        Number.isFinite(settings.offeringCoinFontSize) ? Number(settings.offeringCoinFontSize) : 11)),
      offeringCoinColor: typeof settings.offeringCoinColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(settings.offeringCoinColor)
        ? settings.offeringCoinColor : '#ffe699',
    };
    window.localStorage.setItem(OVERLAY_SETTINGS_STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadPersistedVoiceSettings(): VoiceSettings {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_VOICE_SETTINGS };
  }
  try {
    const raw = window.localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_VOICE_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<VoiceSettings>;
    return {
      ...DEFAULT_VOICE_SETTINGS,
      ...parsed,
      commentTemplates: {
        ...DEFAULT_VOICE_SETTINGS.commentTemplates,
        ...(parsed.commentTemplates || {}),
      },
    };
  } catch {
    return { ...DEFAULT_VOICE_SETTINGS };
  }
}

export function savePersistedVoiceSettings(settings: VoiceSettings): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(VOICE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Pixel dimensions inside the ACTUAL 9:16 game viewport (not the browser window).
 * Google AI Studio renders the game in a scaled embedded preview, so relying on
 * CSS vw/vh alone can otherwise produce a much larger overlay than intended.
 */
export function calculateFortunePopupLayout(
  frameWidth: number,
  frameHeight: number,
  browserHeight: number,
  detailed = false,
): { width: number; maxHeight: number } {
  const fw = Math.max(0, Number.isFinite(frameWidth) ? frameWidth : 0);
  const fh = Math.max(0, Number.isFinite(frameHeight) ? frameHeight : 0);
  const bh = Math.max(0, Number.isFinite(browserHeight) ? browserHeight : fh);
  const fraction = detailed ? 0.40 : 0.28;
  return {
    width: Math.max(0, Math.min(520, fw * 0.80, fw - 8)),
    maxHeight: Math.max(0, Math.floor(Math.min(fh * fraction, bh * fraction))),
  };
}
