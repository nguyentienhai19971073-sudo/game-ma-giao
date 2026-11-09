// CHUA_HIDE_DUPLICATE_RITUAL_SCORE_TOAST_V1: Hide duplicate gift ritual/merit toast only.
import { getTikTokDisplayName } from '../../utils/tiktokDisplayName';
// CHUA_ONLINE_READABLE_PANELS_V1
import { useMemo } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import {
  CeremonialAnnouncementItem,
  ConnectionStatus,
  FeedNotification,
  GiftMapping,
  LotusBurstTrigger,
  LotusCeremonyBadge,
  MeritLedgerEntry,
  ServerConnectionSnapshot,
  StreamOverlaySettings,
  XinXamDrawResult,
  XinXamSettings,
  sanitizeCeremonialText,
} from '../../types/temple';
import { VoiceStateSnapshot } from '../../systems/VoiceManager';
import { buildBurgundyPanelStyle } from '../../systems/OverlayTheme';
import { Leaderboard } from './Leaderboard';
import { BuddhistGiftPanel } from './BuddhistGiftPanel';
import { FloatingLotusAvatars } from './FloatingLotusAvatars';
import { LotusFallingEffect } from './LotusFallingEffect';
import { CenterCeremonialPanel } from './CenterCeremonialPanel';
import { XinXamResultPanel } from './XinXamResultPanel';
import '../../chua-notices-under-merit-v5.css';

interface StreamingOverlayProps {
  participantsCount: number;
  waitingCount: number;
  activeAltarCount: number;
  queuedAltarCount: number;
  totalLikesCount: number;
  totalWoodenFishCount: number;
  leaderboard: MeritLedgerEntry[];
  notifications?: FeedNotification[];
  giftMappings: GiftMapping[];
  xinXamSettings?: XinXamSettings;
  giftEventCounts: Record<string, number>;
  activeLotusBadges: LotusCeremonyBadge[];
  activeCenterAnnouncement?: CeremonialAnnouncementItem | null;
  activeXinXamResult?: XinXamDrawResult | null;
  xinXamPanelOpacity?: number;
  xinXamPanelScale?: number;
  xinXamParticleDensity?: number;
  activeLotusBursts?: LotusBurstTrigger[];
  prominentGiftBanner?: {
    id: string;
    username: string;
    giftName: string;
    points: number;
    isDemo: boolean;
    expiresAt: number;
  } | null;
  connectionSnapshot: ServerConnectionSnapshot;
  voiceSnapshot: VoiceStateSnapshot;
  overlaySettings: StreamOverlaySettings;
  onEnableAudio: () => void;
  onToggleObsCleanView: () => void;
  onTriggerDemoGift?: (mapping: GiftMapping) => void;
  onTriggerDemoXinXam?: () => void;
}

export function StreamingOverlay({
  participantsCount,
  waitingCount,
  activeAltarCount,
  queuedAltarCount,
  totalLikesCount,
  totalWoodenFishCount,
  leaderboard,
  notifications = [],
  giftMappings,
  xinXamSettings,
  giftEventCounts,
  activeLotusBadges,
  activeCenterAnnouncement = null,
  activeXinXamResult = null,
  xinXamPanelOpacity,
  xinXamPanelScale,
  xinXamParticleDensity,
  activeLotusBursts = [],
  connectionSnapshot,
  voiceSnapshot,
  overlaySettings,
  onToggleObsCleanView,
  onTriggerDemoGift,
  onTriggerDemoXinXam,
}: StreamingOverlayProps) {
  const isLive = connectionSnapshot.status === ConnectionStatus.LIVE;
  const panelOpacity = overlaySettings.panelOpacity ?? 0.45;
  const panelScale = Math.min(1.45, Math.max(1.04, (overlaySettings.panelScale ?? 0.86) * 1.22)); // CHUA_READABILITY_V2_EFFECTIVE_SCALE
  const effectiveLotusDensity =
    activeXinXamResult && xinXamParticleDensity
      ? xinXamParticleDensity
      : (overlaySettings.lotusParticleDensity ?? 1.15);

  const topPlaqueStyle = useMemo(
    () => buildBurgundyPanelStyle(panelOpacity),
    [panelOpacity],
  );
  const subtitleStyle = useMemo(
    () =>
      buildBurgundyPanelStyle(panelOpacity, {
        scale: panelScale,
        transformOrigin: 'bottom center',
      }),
    [panelOpacity, panelScale],
  );
  const eventToastStyle = useMemo(
    () =>
      buildBurgundyPanelStyle(panelOpacity, {
        scale: panelScale,
        transformOrigin: 'bottom left',
      }),
    [panelOpacity, panelScale],
  );
  const controlBtnStyle = useMemo(
    () => buildBurgundyPanelStyle(panelOpacity),
    [panelOpacity],
  );

  const cleanSubtitle = useMemo(
    () =>
      voiceSnapshot.currentSubtitle
        ? sanitizeCeremonialText(voiceSnapshot.currentSubtitle, voiceSnapshot.currentSubtitle)
        : '',
    [voiceSnapshot.currentSubtitle],
  );

  return (
    <div className="chua-readability-v2 pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-1 sm:p-1.5">
      {/* ==========================================================================
          LAYERED SACRED LOTUS FLOWERS, PETALS & LEAVES SHOWER
          Attenuates over the elevated upper-center Golden Buddha sanctuary so Buddha stays clear
         ========================================================================== */}
      <LotusFallingEffect
        bursts={activeLotusBursts}
        enabled={overlaySettings.effectsEnabled}
        density={effectiveLotusDensity}
        petalCount={overlaySettings.petalCount ?? 44}
        leafCount={overlaySettings.leafCount ?? 16}
      />

      {/* ==========================================================================
          COMPACT LOWER-MIDDLE XIN XĂM RESULT POPUP ("🪷 KẾT QUẢ XIN XĂM")
         ========================================================================== */}
      

      {/* ==========================================================================
          CENTER CEREMONIAL ANNOUNCEMENT PANEL (Sequential, Non-Overlapping)
         ========================================================================== */}
      

      {/* ==========================================================================
          FLOATING SACRED LOTUS CEREMONY EMBLEMS (Left & Right Outer Edges ONLY)
         ========================================================================== */}
      {overlaySettings.showLotusAvatars && (
        <FloatingLotusAvatars
          badges={activeLotusBadges}
          panelOpacity={panelOpacity}
          panelScale={panelScale}
        />
      )}

      {/* ==========================================================================
          TOP EDGE: COMPACT RGBA HEADER + PARTICIPANT COUNTER + EDGE SIDE PANELS
          Upper-Left: "BẢNG CÔNG ĐỨC" | Center: 100% Open Golden Buddha | Upper-Right: "CÚNG DƯỜNG CẦU AN"
         ========================================================================== */}
      <div className="flex flex-col gap-1 relative z-20">
        <header style={topPlaqueStyle} className="w-full rounded px-2 py-[4px]">
          <div className="flex flex-wrap items-center justify-between gap-x-1.5 gap-y-0.5">
            <div className="flex items-center gap-1 min-w-0">
              <svg
                viewBox="0 0 24 24"
                className="w-3 h-3 text-[#ffe082] shrink-0 fill-current"
                aria-hidden="true"
              >
                <path d="M12 2.5C10 6 8.2 8.7 8.2 11.4C8.2 13.6 9.8 15.4 12 16C14.2 15.4 15.8 13.6 15.8 11.4C15.8 8.7 14 6 12 2.5ZM4.8 9.4C4.4 12.3 5.7 15 8.6 16.3C7.4 14.5 7 12.2 7.4 10.1C6.5 9.8 5.7 9.6 4.8 9.4ZM19.2 9.4C18.3 9.6 17.5 9.8 16.6 10.1C17 12.2 16.6 14.5 15.4 16.3C18.3 15 19.6 12.3 19.2 9.4ZM3.6 17C6.4 19 9.2 19.8 12 19.8C14.8 19.8 17.6 19 20.4 17C17.5 17.1 14.7 17.6 12 18.4C9.3 17.6 6.5 17.1 3.6 17Z" />
              </svg>
              <h1 className="font-display text-[13.5px] sm:text-[15px] font-bold tracking-wider text-[#ffe699] leading-none whitespace-nowrap">
                TĨNH TÂM ONLINE
              </h1>
              <span className="text-[#d4af37]/60 text-[9px]" aria-hidden="true">
                ·
              </span>
              <span className="font-display text-[10px] italic text-[#f7ead4] truncate">
                Nam Mô A Di Đà Phật
              </span>
            </div>

            {/* Compact Participant Counter & Live Status */}
            <div className="flex items-center gap-1 text-[9.5px] sm:text-[10px] text-[#f5e7cf] whitespace-nowrap">
              <span>
                <strong className="font-mono-tabular text-[#ffe699]">{participantsCount}</strong> Phật tử
              </span>
              {waitingCount > 0 && (
                <span className="font-mono-tabular text-[#dfd0b8]">(+{waitingCount})</span>
              )}
              {(activeAltarCount > 0 || queuedAltarCount > 0) && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#ffe082]">
                    Lễ <strong className="font-mono-tabular">{activeAltarCount}</strong>
                    {queuedAltarCount > 0 ? `+${queuedAltarCount}` : ''}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* CHUA_LIVE_TOP_7MIN_1000LIKE_V1: Ẩn hướng dẫn tương tác và bộ đếm chỉ ở HEADER. */}
        </header>

        {/* COMPACT EDGE SIDE PANELS: Left = BẢNG CÔNG ĐỨC | Right = CÚNG DƯỜNG CẦU AN */}
        {(overlaySettings.showLeaderboard || overlaySettings.showGiftPanel || Boolean(activeCenterAnnouncement) || Boolean(activeXinXamResult) || (overlaySettings.showNotifications && notifications.length > 0)) && (
          <div className="flex items-start justify-between gap-1">
            <div className="chua-compact-merit-holder">
              {overlaySettings.showLeaderboard && (
                <Leaderboard
                  leaderboard={leaderboard}
                  panelOpacity={panelOpacity}
                  panelScale={panelScale}
                />
              )}
              {/* CHUA_THONG_BAO_DUOI_CONG_DUC_V5: Thông báo quà và Xin Xăm xếp dọc, ngay dưới Công Đức. */}
              <div className="chua-left-notice-v5 pointer-events-none">
                <CenterCeremonialPanel
                announcement={activeCenterAnnouncement}
                panelOpacity={panelOpacity}
                panelScale={panelScale}
                showAvatarInCenterPanel={overlaySettings.showAvatarInCenterPanel !== false}
                />
                <XinXamResultPanel
                result={overlaySettings.showXinXamPanel !== false ? activeXinXamResult : null}
                panelOpacity={xinXamPanelOpacity ?? xinXamSettings?.panelOpacity ?? 0.55}
                panelScale={xinXamPanelScale ?? xinXamSettings?.panelScale ?? 1.0}
                displayMode={xinXamSettings?.displayMode ?? 'compact'}
                textScale={xinXamSettings?.textScale ?? 1.0}
                showAvatar={overlaySettings.showAvatarInCenterPanel !== false}
                />
                {overlaySettings.showNotifications && notifications[0]?.kind !== 'ritual' && notifications.length > 0 && (
                <div style={eventToastStyle} className={`chua-event-toast-readable self-start max-w-[225px] rounded px-2.5 py-1 ${
                ['gift', 'ritual'].includes(notifications[0]?.kind ?? '') ? 'chua-gift-toast-centered' : ''
                }`}>
                {notifications.slice(0, 1).map((n) => (
                <p key={n.id} className="text-[9.5px] text-[#fff5e2] break-words leading-snug">
                <strong className="text-[#ffe494]">{getTikTokDisplayName(n)}</strong>{' '}
                {sanitizeCeremonialText(n.message, 'thành tâm cầu an')}
                {n.pointsDelta ? (
                <span className="font-mono-tabular text-[#ffd978] ml-1">+{n.pointsDelta}</span>
                ) : null}
                </p>
                ))}
                </div>
                )}
              </div>
            </div>

            <div className="chua-readability-offerings w-[43%] max-w-[166px] min-w-0 shrink-0">
              {overlaySettings.showGiftPanel && (
                <BuddhistGiftPanel
                  giftMappings={giftMappings}
                  xinXamSettings={xinXamSettings}
                  giftEventCounts={giftEventCounts}
                  isDemoMode={!isLive}
                  onTriggerDemoGift={onTriggerDemoGift}
                  onTriggerDemoXinXam={onTriggerDemoXinXam}
                  panelOpacity={panelOpacity}
                  panelScale={panelScale}
                  coinVisible={overlaySettings.showOfferingCoins !== false}
                  coinUnit={overlaySettings.offeringCoinUnit ?? 'xu'}
                  coinFontSize={overlaySettings.offeringCoinFontSize ?? 11}
                  coinColor={overlaySettings.offeringCoinColor ?? '#ffe699'}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==========================================================================
          BOTTOM EDGE: Compact Event Notifications, Gift Notification & Voice Subtitles
          (Zero global comment panel; zero profile avatars!)
         ========================================================================== */}
      <div className="flex flex-col gap-1 pb-8 sm:pb-1 relative z-20">
        {/* Optional Compact Edge Event Notification Panel (Text-Only, Zero Avatars) */}
        

        {/* CHUA_OBS_HIDE_BOTTOM_AUDIO_V102: chi an dieu khien am thanh o OBS, van giu voice & subtitle */}
        {/* CHUA_REMOVE_OVERLAY_AUDIO_BUTTON_V103: remove audio CTA and speaker icon from all overlay modes, keep subtitles & audio engine */}
        {/* Compact Voice Subtitle Panel & Edge Controls */}
        <div className="flex items-end justify-between gap-1">
          <div className="flex-1 flex justify-center min-w-0">
            {cleanSubtitle ? (
              <div
                style={subtitleStyle}
                className="chua-subtitle-readable max-w-[96%] rounded px-2.5 py-[4px] text-center"
              >
                <p className="font-display text-[11px] sm:text-[12px] italic text-[#fff8e6] leading-snug line-clamp-2">
                  “{cleanSubtitle}”
                </p>
              </div>
            ) : null}
          </div>

          <div className="pointer-events-auto flex items-center gap-1 shrink-0">
            
            <button
              type="button"
              onClick={onToggleObsCleanView}
              style={controlBtnStyle}
              title={
                overlaySettings.obsCleanView
                  ? 'Thoát chế độ OBS (Hiện bảng quản trị)'
                  : 'Chế độ toàn màn hình sạch cho OBS'
              }
              className="inline-flex items-center gap-1 px-1.5 py-[3px] rounded hover:brightness-125 text-[9px] font-medium text-[#fff4de] transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              {overlaySettings.obsCleanView ? (
                <>
                  <Minimize2 className="w-2.5 h-2.5 text-[#ffe494]" />
                  <span>Quản trị</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-2.5 h-2.5 text-[#ffe494]" />
                  <span>OBS</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
