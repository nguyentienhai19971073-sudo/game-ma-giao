/**
 * MA GIÁO ONLINE - GRAND PALACE (SẢNH CHÍNH MA GIÁO)
 * 9:16 vertical view reproducing the majestic ancient Chinese Demonic Cult Palace hall.
 * Features:
 * - 5 functional activity zones (A: Throne, B: Central Aisle, C: Martial Yards, D: Meditation, E: Social)
 * - Dynamic 2D roaming participants with true Z-index depth sorting & collision occlusion
 * - Animated Cult Leader with mood speech bubble and guardians
 * - Sweeping penalty wing, mass formation snap, and real-time promotion banner
 */

import React, { useMemo } from 'react';
import {
  LeaderVisualState,
  MaGiaoParticipant,
  SweeperItem,
} from '../../types/magiao';
import { CultLeader2D } from './CultLeader2D';
import { MaGiaoCharacterSprite } from './MaGiaoCharacterSprite';

interface Props {
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
  leaderVisualState: LeaderVisualState;
  leaderSpeech: {
    isSpeaking: boolean;
    text: string;
    mood: string;
    targetUser?: string;
  };
  lastPromotionNotice?: {
    username: string;
    rankTitle: string;
    timestamp: number;
  };
}

export const MaGiaoGrandPalace: React.FC<Props> = ({
  participants,
  sweepers,
  throneLeader,
  coLeader,
  leaderVisualState,
  leaderSpeech,
  lastPromotionNotice,
}) => {
  // 80 base prayer mat markers for formation / meditation
  const baseMats = useMemo(() => {
    const mats: Array<{ id: number; leftPct: number; topPct: number; side: 'left' | 'right' }> = [];
    const rows = 10;
    const cols = 4;

    // Left Wing (mats 0..39)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 11 + c * 7.2;
        const y = 40 + r * 5.2;
        mats.push({ id: r * cols * 2 + c, leftPct: x, topPct: y, side: 'left' });
      }
    }

    // Right Wing (mats 40..79)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 63 + c * 7.2;
        const y = 40 + r * 5.2;
        mats.push({ id: r * cols * 2 + cols + c, leftPct: x, topPct: y, side: 'right' });
      }
    }
    return mats;
  }, []);

  // Sort participants by Y coordinate for correct visual depth and occlusion
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => (a.y || 50) - (b.y || 50));
  }, [participants]);

  const isRecentPromotion =
    lastPromotionNotice && Date.now() - lastPromotionNotice.timestamp < 6000;

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#0a0507]">
      {/* 1. Backdrop image: Grand Palace with ambient smoke */}
      <img
        src="/assets/magiao/grand_palace.jpg"
        alt="Ma Giáo Grand Palace"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Atmospheric dark smoke & ember overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

      {/* Zone D & C Floor Highlights (Sparring rings & Meditation zone visual markings) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central Aisle carpet highlight */}
        <div className="absolute top-[34%] left-1/2 -translate-x-1/2 w-[16%] h-[60%] bg-gradient-to-b from-red-950/40 via-red-900/20 to-red-950/40 border-x border-red-600/30 blur-[0.5px]" />

        {/* Zone C: Martial training area ring borders */}
        <div className="absolute top-[48%] left-[7%] w-[33%] h-[23%] border border-red-500/20 rounded-lg bg-red-950/10 flex items-center justify-center">
          <span className="text-[9px] text-red-500/30 uppercase tracking-widest font-serif">VÕ ĐÀI TẢ</span>
        </div>
        <div className="absolute top-[48%] right-[7%] w-[33%] h-[23%] border border-red-500/20 rounded-lg bg-red-950/10 flex items-center justify-center">
          <span className="text-[9px] text-red-500/30 uppercase tracking-widest font-serif">VÕ ĐÀI HỮU</span>
        </div>

        {/* Zone D: Meditation area floor mats */}
        <div className="absolute top-[72%] left-[7%] w-[33%] h-[20%] border border-amber-600/20 rounded-lg bg-amber-950/10 flex items-center justify-center">
          <span className="text-[9px] text-amber-500/30 uppercase tracking-widest font-serif">THIỀN ĐỊNH TẢ</span>
        </div>
        <div className="absolute top-[72%] right-[7%] w-[33%] h-[20%] border border-amber-600/20 rounded-lg bg-amber-950/10 flex items-center justify-center">
          <span className="text-[9px] text-amber-500/30 uppercase tracking-widest font-serif">THIỀN ĐỊNH HỮU</span>
        </div>

        {/* 80 Floor Prayer Mats */}
        {baseMats.map((mat) => (
          <div
            key={mat.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-1.5 rounded-full bg-amber-950/40 border border-amber-500/20 shadow-xs"
            style={{
              left: `${mat.leftPct}%`,
              top: `${mat.topPct}%`,
            }}
          />
        ))}
      </div>

      {/* 2. Top Hall: Cult Leader on the Dragon Throne or Walking the Hall */}
      <div
        className="absolute -translate-x-1/2 flex flex-col items-center z-25 pointer-events-none transition-[top,left] duration-300 ease-out"
        style={{
          left: `${leaderVisualState?.x ?? 50}%`,
          top: `${leaderVisualState?.y ?? 22}%`,
        }}
      >
        {/* Leader Speech Callout Bubble */}
        {leaderSpeech.isSpeaking && leaderSpeech.text && (
          <div className="mb-2 max-w-[280px] px-3.5 py-2 rounded-lg bg-[#180a0e]/95 border-2 border-[#e11d48] text-white shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <span className="text-xs text-[#f43f5e] font-bold uppercase tracking-wider">
                {throneLeader.title}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            </div>
            <p className="text-xs leading-relaxed font-medium text-amber-100">
              "{leaderSpeech.text}"
            </p>
            {/* Bubble arrow */}
            <div className="w-0 h-0 mx-auto -mb-3 mt-1 border-x-6 border-x-transparent border-t-8 border-t-[#e11d48]" />
          </div>
        )}

        {/* Articulated 2D Cult Leader Rig with Dragon Throne */}
        {leaderVisualState && (
          <CultLeader2D
            visualState={leaderVisualState}
            scale={1.15}
            showThrone={leaderVisualState.isSeated}
          />
        )}

        {/* Cult Leader Nameplate */}
        <div className="mt-1 px-2.5 py-0.5 rounded bg-black/85 border border-[#f59e0b]/50 shadow-md flex flex-col items-center">
          <span className="text-[10px] font-bold text-[#f59e0b] leading-tight flex items-center gap-1">
            <span>👑</span>
            <span>{throneLeader.nickname || throneLeader.username}</span>
          </span>
          <span className="text-[8px] text-red-400 font-semibold tracking-tight">
            {throneLeader.title}
          </span>
        </div>
      </div>

      {/* Flanking Guardians & Co-Leader Dais (Permanently stationed on upper dais) */}
      <div className="absolute top-[17%] left-1/2 -translate-x-1/2 w-80 flex items-end justify-between px-4 z-20 pointer-events-none">
        {/* Left Guardian (Tả Hộ Pháp) */}
        <div className="flex flex-col items-center opacity-85">
          <span className="text-sm">🛡️</span>
          <div className="w-5 h-9 bg-[#3b0764] rounded-t-sm border border-purple-900/60 flex items-center justify-center shadow-md">
            <div className="w-1 h-3 bg-red-500/80 rounded-full" />
          </div>
          <span className="text-[8px] text-purple-300 font-semibold mt-0.5">Tả Hộ Pháp</span>
        </div>

        {/* Right Flank: Co-Leader or Right Guardian (Hữu Hộ Pháp) */}
        {coLeader ? (
          <div className="flex flex-col items-center animate-in zoom-in-90 duration-300">
            <div className="relative w-11 h-11 rounded-full border-2 border-rose-500 shadow-lg overflow-hidden bg-black/60 flex items-center justify-center">
              <span className="text-xl">🐉</span>
            </div>
            <div className="mt-1 px-2 py-0.5 rounded bg-black/85 border border-rose-500/50 shadow-xs flex flex-col items-center">
              <span className="text-[9px] font-bold text-rose-300 leading-tight">
                {coLeader.nickname || coLeader.username}
              </span>
              <span className="text-[7px] text-amber-300 font-medium">{coLeader.title}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center opacity-85">
            <span className="text-sm">🛡️</span>
            <div className="w-5 h-9 bg-[#3b0764] rounded-t-sm border border-purple-900/60 flex items-center justify-center shadow-md">
              <div className="w-1 h-3 bg-red-500/80 rounded-full" />
            </div>
            <span className="text-[8px] text-purple-300 font-semibold mt-0.5">Hữu Hộ Pháp</span>
          </div>
        )}
      </div>

      {/* 3. Dynamic Roaming 2D Participants with Z-Index Depth Sorting */}
      <div className="absolute inset-0 pointer-events-none">
        {sortedParticipants.map((participant, zOrder) => {
          const posX = participant.x ?? 50;
          const posY = participant.y ?? 70;

          // Depth perspective scaling: upper hall ~0.78, foreground ~1.08
          const depthRatio = Math.max(0, Math.min(1, (posY - 35) / 57));
          const depthScale = 0.76 + depthRatio * 0.32;

          return (
            <div
              key={participant.userId}
              className="absolute -translate-x-1/2 -translate-y-full transition-[left,top] duration-150 ease-linear"
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                zIndex: 30 + zOrder,
              }}
            >
              <MaGiaoCharacterSprite
                participant={participant}
                scale={depthScale}
                isTrainingArena={false}
              />
            </div>
          );
        })}
      </div>

      {/* 4. Side Widget: Sweeping Zone (Khu Quét Sân Ma Giáo) */}
      {sweepers.length > 0 && (
        <div className="absolute top-[28%] left-2.5 z-50 max-w-[155px] p-2 rounded-lg bg-black/85 border border-amber-500/40 backdrop-blur-xs text-xs text-amber-200 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-1 font-bold text-amber-400 mb-1">
            <span>🧹</span>
            <span>KHU QUÉT SÂN ({sweepers.length})</span>
          </div>
          <p className="text-[9px] text-slate-300 mb-1.5 leading-tight">
            Chưa đạt chỉ tiêu võ thuật! Bình luận lại để trở về đại điện ngay!
          </p>
          <div className="space-y-1">
            {sweepers.slice(0, 5).map((s) => (
              <div
                key={s.userId}
                className="flex items-center justify-between text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10"
              >
                <span className="truncate max-w-[90px] text-amber-100 font-medium">
                  {s.nickname || s.username}
                </span>
                <span className="text-[9px]">🧹</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Rank Promotion Banner Popup */}
      {isRecentPromotion && lastPromotionNotice && (
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-gradient-to-r from-red-950/95 via-amber-950/95 to-red-950/95 border-2 border-[#f59e0b] shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <span className="text-2xl animate-bounce">⚡</span>
          <div className="text-center">
            <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
              MA GIÁO PHONG CHỨC
            </div>
            <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
              <span className="text-[#f59e0b]">{lastPromotionNotice.username}</span>
              <span>đã thăng cấp</span>
              <span className="text-red-400 font-extrabold">{lastPromotionNotice.rankTitle}!</span>
            </div>
          </div>
          <span className="text-2xl animate-bounce">👑</span>
        </div>
      )}
    </div>
  );
};
