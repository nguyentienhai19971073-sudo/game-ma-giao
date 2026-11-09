/**
 * MA GIÁO ONLINE - 2D WUXIA CHARACTER SPRITE
 * High-fidelity 2D martial arts disciple rendering with:
 * - 4-directional views (Front, Back, Left, Right)
 * - 15 distinct action animations (Idle, Walk, Run, Bow, Punch, Kick, Combo,
 *   Jump, Dodge, Meditate on prayer mat, StandUp, Cheer, Laugh, Fail, Leave)
 * - Dynamic rank robes, authentic wuxia hairstyles & hairbands
 * - Detachable drop shadow, martial energy trails, comment bubbles
 */

import React from 'react';
import { MA_GIAO_RANKS, MaGiaoParticipant } from '../../types/magiao';

interface Props {
  participant: MaGiaoParticipant;
  scale?: number;
  isTrainingArena?: boolean;
}

export const MaGiaoCharacterSprite: React.FC<Props> = ({
  participant,
  scale = 1.0,
  isTrainingArena = false,
}) => {
  const rankMeta = MA_GIAO_RANKS[participant.rank] || MA_GIAO_RANKS.DAN_DEN;
  const hasAura = Boolean(rankMeta.auraStyle);
  const isRecentComment =
    participant.lastComment &&
    participant.lastCommentAt &&
    Date.now() - participant.lastCommentAt < 7000;

  const action = participant.actionState || 'idle';
  const facing = participant.facing || 'front';

  // Action-specific transforms & animations
  const isJumping = action === 'jump';
  const isMeditating = action === 'meditate';
  const isFallen = action === 'fail';
  const isBowing = action === 'bow';
  const isKicking = action === 'kick';
  const isPunching = action === 'punch';
  const isCombo = action === 'combo' || action === 'múa';
  const isRunning = action === 'run';
  const isWalking = action === 'walk' || action === 'walking';
  const isCheering = action === 'cheer';
  const isLaughing = action === 'laugh';
  const isDodging = action === 'dodge' || action === 'dodging';
  const isSweeping = participant.isSweeping || action === 'sweeping';

  // Orientation flip for side view
  const isFlipX = facing === 'left';

  return (
    <div
      className="relative flex flex-col items-center select-none pointer-events-none transition-transform duration-150"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'bottom center',
      }}
    >
      {/* 1. Comment Bubble Above Head */}
      {isRecentComment && (
        <div className="absolute -top-12 z-40 max-w-[130px] px-2 py-1 bg-[#1a0509]/95 border border-[#e11d48] rounded-md text-[10px] text-[#fef2f2] shadow-xl text-center leading-tight whitespace-normal break-words animate-in fade-in zoom-in-95 duration-150">
          <div className="line-clamp-2 font-medium">{participant.lastComment}</div>
          {/* Bubble tail */}
          <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-[6px] border-t-[#e11d48]" />
        </div>
      )}

      {/* 2. Disciples Aura Glow for High Ranks */}
      {hasAura && !isSweeping && (
        <div
          className={`absolute rounded-full opacity-70 pointer-events-none -z-10 transition-all duration-300 ${
            isCombo ? 'scale-135 animate-ping' : 'scale-110 animate-pulse'
          }`}
          style={{
            inset: isMeditating ? '-8px -8px 0px -8px' : '-10px -10px -2px -10px',
            background: rankMeta.auraStyle,
          }}
        />
      )}

      {/* 3. Meditation Prayer Mat (Zone D or Lotus pose) */}
      {isMeditating && (
        <div className="absolute bottom-4 z-0 w-11 h-4 rounded-full bg-gradient-to-r from-[#78350f] via-[#b45309] to-[#78350f] border border-[#f59e0b]/60 shadow-md flex items-center justify-center">
          <div className="w-8 h-2 rounded-full border border-yellow-200/40" />
        </div>
      )}

      {/* 4. Floor Drop Shadow (shrinks when jumping) */}
      <div
        className={`rounded-full bg-black/60 blur-[1px] transition-all duration-200 ${
          isJumping
            ? 'w-4 h-1.5 opacity-30 mt-3'
            : isMeditating
            ? 'w-11 h-3 opacity-70'
            : isFallen
            ? 'w-12 h-3 opacity-60'
            : 'w-7 h-2 opacity-50'
        }`}
      />

      {/* 5. 2D Animated Body Container */}
      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-200 ${
          isFlipX ? '-scale-x-100' : ''
        } ${
          isJumping
            ? '-translate-y-5'
            : isBowing
            ? 'translate-y-1.5 rotate-[16deg]'
            : isFallen
            ? 'rotate-90 translate-y-3'
            : isDodging
            ? 'translate-x-3 -skew-x-12'
            : isMeditating
            ? '-translate-y-0.5'
            : isRunning
            ? 'skew-x-6'
            : ''
        }`}
      >
        {/* Martial arts energy sparks for punch / kick / combo */}
        {(isPunching || isKicking || isCombo) && (
          <div className="absolute -top-2 text-xs animate-ping z-30">
            {isPunching ? '💥' : isKicking ? '⚡' : '🔥'}
          </div>
        )}

        {/* Laughter / Cheer / Fail particles */}
        {isLaughing && (
          <div className="absolute -top-3 text-[10px] animate-bounce text-yellow-300 font-bold z-30">
            Haha!
          </div>
        )}
        {isCheering && (
          <div className="absolute -top-4 text-xs animate-bounce z-30">✨</div>
        )}
        {isFallen && (
          <div className="absolute -top-3 text-xs animate-spin z-30">💫</div>
        )}

        {/* --- HEAD & HAIR --- */}
        <div className="relative w-4 h-4.5 rounded-full bg-[#fed7aa] border border-[#78350f] flex items-center justify-center shadow-xs">
          {/* Topknot hairstyle with ribbon */}
          <div className="absolute -top-2 w-2 h-2 rounded-full bg-[#09090b] border-t border-red-700">
            {/* Hair ribbon */}
            <div className="absolute -right-1 top-0 w-1.5 h-1 bg-[#dc2626] rounded-xs" />
          </div>

          {/* FACING BACK: Long flowing hair down back */}
          {facing === 'back' && (
            <div className="absolute inset-0 bg-[#09090b] rounded-full flex flex-col items-center">
              <div className="w-2.5 h-3 bg-[#09090b] mt-1.5 rounded-b-sm shadow-xs" />
            </div>
          )}

          {/* FACING FRONT: Eyes & Headband */}
          {facing === 'front' && (
            <>
              {/* Forehead headband */}
              <div className="absolute top-0.5 w-full h-1 bg-[#991b1b]" />
              {/* Eyes */}
              <div className="flex gap-1 mt-1 z-10">
                <div className="w-0.5 h-0.5 rounded-full bg-[#0f172a]" />
                <div className="w-0.5 h-0.5 rounded-full bg-[#0f172a]" />
              </div>
            </>
          )}

          {/* FACING LEFT/RIGHT (PROFILE) */}
          {(facing === 'left' || facing === 'right') && (
            <>
              <div className="absolute top-0.5 w-full h-1 bg-[#991b1b]" />
              <div className="absolute right-0.5 top-2 w-0.5 h-0.5 rounded-full bg-[#0f172a]" />
            </>
          )}
        </div>

        {/* --- TORSO & ROBE --- */}
        <div
          className={`relative rounded-t-sm flex flex-col items-center shadow-md border border-black/40 overflow-hidden transition-all ${
            isMeditating
              ? 'w-7 h-4.5 rounded-b-md' // lotus seated torso
              : 'w-6 h-6.5'
          }`}
          style={{ backgroundColor: rankMeta.robeColor }}
        >
          {/* Robe Lapel / Collar Trim */}
          {facing !== 'back' ? (
            <div className="w-full flex justify-center">
              <div className="w-1.5 h-3 bg-[#d4af37]/80 rotate-12 -ml-1 border-r border-black/30" />
              <div className="w-1.5 h-3 bg-[#d4af37]/80 -rotate-12 -mr-1" />
            </div>
          ) : (
            /* Back crest symbol on robe */
            <div className="mt-1 w-2.5 h-2.5 rounded-full border border-red-500/60 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-red-600" />
            </div>
          )}

          {/* Martial Belt Sash */}
          <div className="w-full h-1 bg-[#18181b] mt-auto flex items-center justify-center">
            <div className="w-1.5 h-1 bg-[#facc15] shadow-xs" />
          </div>
        </div>

        {/* --- ARMS / WEAPONS / ACTIONS --- */}
        {isSweeping ? (
          <div className="absolute right-[-6px] top-3 text-sm animate-pulse">🧹</div>
        ) : isPunching ? (
          <div className="absolute -right-3 top-2 text-xs animate-ping">👊</div>
        ) : isKicking ? (
          <div className="absolute -right-3 bottom-0 text-xs rotate-[-30deg]">🥋</div>
        ) : isCombo ? (
          <div className="absolute -left-2 -right-2 top-2 flex justify-between text-xs animate-bounce">
            <span>⚔️</span>
            <span>🔥</span>
          </div>
        ) : isBowing ? (
          <div className="absolute top-3 w-5 h-2 rounded bg-[#fed7aa] border border-[#78350f] flex items-center justify-center text-[8px]">
            🙏
          </div>
        ) : isCheering ? (
          <div className="absolute -top-1 w-7 flex justify-between text-[10px]">
            <span>🙌</span>
          </div>
        ) : isMeditating ? (
          /* Hands in lap mudra */
          <div className="absolute bottom-1 w-3 h-1.5 rounded-full bg-[#fed7aa] border border-[#78350f]" />
        ) : null}

        {/* --- LEGS & FEET --- */}
        {!isMeditating && !isFallen && (
          <div
            className={`flex gap-1 mt-[-1px] ${
              isWalking ? 'animate-bounce' : isRunning ? 'animate-pulse' : ''
            }`}
          >
            {/* Left foot */}
            <div className="w-2 h-2.5 bg-[#18181b] rounded-b-xs border-t border-[#78350f]" />
            {/* Right foot */}
            <div className="w-2 h-2.5 bg-[#18181b] rounded-b-xs border-t border-[#78350f]" />
          </div>
        )}
      </div>

      {/* 6. Name and Rank Badge Below Feet */}
      <div className="mt-1 flex flex-col items-center">
        <div className="px-1.5 py-0.5 rounded bg-black/80 border border-white/10 shadow-md flex items-center gap-1 max-w-[90px]">
          <span className="text-[9px] leading-none shrink-0">{rankMeta.badge}</span>
          <span
            className="text-[10px] font-semibold leading-none truncate"
            style={{ color: rankMeta.titleColor }}
          >
            {participant.nickname || participant.username}
          </span>
        </div>

        {/* Title if ranked above Dân Đen */}
        {participant.rank !== 'DAN_DEN' && !isTrainingArena && (
          <span
            className="text-[8px] font-bold leading-tight tracking-tight mt-0.5 drop-shadow-xs"
            style={{ color: rankMeta.titleColor }}
          >
            {rankMeta.title}
          </span>
        )}
      </div>
    </div>
  );
};
