/**
 * MA GIÁO ONLINE - MAIN GAME CONTAINER
 * Root orchestrator for Ma Giáo Online, handling scene transitions,
 * TikTok LIVE event streams, voice reactivity, and OBS integration.
 */

import React, { useEffect, useState } from 'react';
import { SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import {
  MaGiaoStateSnapshot,
  maGiaoGameManager,
} from '../../systems/MaGiaoGameManager';
import { maGiaoVoiceManager } from '../../systems/MaGiaoVoiceManager';
import { liveConnectionManager } from '../../systems/LiveConnectionManager';
import { MaGiaoGrandPalace } from './MaGiaoGrandPalace';
import { MaGiaoTrainingArena } from './MaGiaoTrainingArena';
import { MaGiaoAdminDashboard } from './MaGiaoAdminDashboard';
import { MaGiaoAdminCp } from './admin/MaGiaoAdminCp';
import { TikTokNormalizedEvent } from '../../types/temple';

export const MaGiaoGameContainer: React.FC = () => {
  const [gameState, setGameState] = useState<MaGiaoStateSnapshot>(() =>
    maGiaoGameManager.getSnapshot(),
  );

  const [voiceState, setVoiceState] = useState({
    isSpeaking: false,
    currentMood: 'ARROGANT',
    currentText: '',
    targetUser: undefined as string | undefined,
  });

  const [adminOpen, setAdminOpen] = useState(false);
  const [isObsClean, setIsObsClean] = useState(false);

  // Check URL parameters for OBS mode (?obs=1)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isObs = params.get('obs') === '1' || params.get('mode') === 'obs';
      if (isObs) setIsObsClean(true);
    }
  }, []);

  // Subscribe to Ma Giao Game Manager & Voice Manager
  useEffect(() => {
    const unsubGame = maGiaoGameManager.subscribe(setGameState);
    const unsubVoice = maGiaoVoiceManager.subscribe((v) =>
      setVoiceState({
        isSpeaking: v.isSpeaking,
        currentMood: v.currentMood,
        currentText: v.currentText,
        targetUser: v.targetUser,
      }),
    );

    // Wire real-time TikTok LIVE connector events to Ma Giao
    const unsubEvents = liveConnectionManager.onEvent((event: TikTokNormalizedEvent) => {
      if (event.type === 'comment' && event.comment) {
        maGiaoGameManager.handleComment({
          userId: event.userId,
          username: event.username,
          nickname: event.nickname,
          comment: event.comment,
          avatarUrl: event.avatarUrl,
          isDemo: event.isDemo,
        });
      } else if (event.type === 'gift') {
        maGiaoGameManager.handleGift({
          userId: event.userId,
          username: event.username,
          nickname: event.nickname,
          giftId: event.giftId,
          giftName: event.giftName,
          diamondCount: event.diamondCount,
          repeatCount: event.giftCount,
          isStreakCompletionOnly: event.isStreakCompletionOnly,
          avatarUrl: event.avatarUrl,
          isDemo: event.isDemo,
        });
      }
    });

    // Auto-spawn initial demo disciples on fresh launch if empty
    const timer = setTimeout(() => {
      if (maGiaoGameManager.getSnapshot().participants.length === 0) {
        maGiaoGameManager.simulateRecruit('Lệnh Hồ Xung');
        setTimeout(() => maGiaoGameManager.simulateRecruit('Tiêu Phong'), 800);
        setTimeout(() => maGiaoGameManager.simulateRecruit('Dương Quá'), 1600);
      }
    }, 1200);

    return () => {
      clearTimeout(timer);
      unsubGame();
      unsubVoice();
      unsubEvents();
    };
  }, []);

  const toggleAudio = () => {
    const next = !gameState.settings.audioEnabled;
    maGiaoGameManager.saveSettings({ audioEnabled: next });
  };

  const isObs = isObsClean || gameState.settings.obsCleanView;

  return (
    <div className="relative w-screen h-screen bg-[#070406] overflow-hidden flex items-center justify-center font-sans">
      {/* Aspect Ratio 9:16 Canvas Frame */}
      <div className="relative w-full h-full max-w-[540px] max-h-[960px] aspect-[9/16] shadow-2xl overflow-hidden bg-black flex flex-col">
        {/* Main Scene: Grand Palace vs Training Arena */}
        {gameState.currentScene === 'GRAND_PALACE' ? (
          <MaGiaoGrandPalace
            participants={gameState.participants}
            sweepers={gameState.sweepers}
            throneLeader={gameState.throneLeader}
            coLeader={gameState.coLeader}
            leaderVisualState={gameState.leaderVisualState}
            leaderSpeech={{
              isSpeaking: voiceState.isSpeaking,
              text: voiceState.currentText,
              mood: voiceState.currentMood,
              targetUser: voiceState.targetUser,
            }}
            lastPromotionNotice={gameState.lastPromotionNotice}
          />
        ) : (
          <MaGiaoTrainingArena
            participants={gameState.participants}
            trainingState={gameState.trainingState}
            leaderVisualState={gameState.leaderVisualState}
            leaderSpeech={{
              isSpeaking: voiceState.isSpeaking,
              text: voiceState.currentText,
              mood: voiceState.currentMood,
            }}
          />
        )}

        {/* Floating Top Control Bar (Hidden in OBS Clean View) */}
        {!isObs && (
          <div className="absolute top-2.5 inset-x-2.5 z-40 flex items-center justify-between pointer-events-auto">
            {/* Brand Logo / Switcher */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-red-500/40 backdrop-blur-xs text-white shadow-lg">
              <span className="text-sm">🐉</span>
              <span className="text-xs font-black tracking-wide text-amber-300 uppercase">
                MA GIÁO ONLINE
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              {/* Audio Mute Toggle */}
              <button
                onClick={toggleAudio}
                title={gameState.settings.audioEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                className="p-1.5 rounded-lg bg-black/80 hover:bg-white/10 border border-white/20 text-white shadow-md transition-colors"
              >
                {gameState.settings.audioEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                )}
              </button>

              {/* Admin Button */}
              <button
                onClick={() => setAdminOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Quản Trị</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Disciples Counter Badge (Bottom Left) */}
        <div className="absolute bottom-2 left-2 z-30 pointer-events-none px-2 py-0.5 rounded bg-black/75 border border-white/10 text-[10px] text-slate-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-semibold text-amber-300">
            {gameState.participants.length}/80 Đồ Đệ
          </span>
          {gameState.sweepers.length > 0 && (
            <span className="text-rose-300 font-semibold">
              · {gameState.sweepers.length} Quét Sân
            </span>
          )}
        </div>
      </div>

      {/* 20-Category Professional Admin Dashboard */}
      {adminOpen && (
        <MaGiaoAdminCp
          onClose={() => setAdminOpen(false)}
        />
      )}
    </div>
  );
};
