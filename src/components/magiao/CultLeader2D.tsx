/**
 * MA GIÁO ONLINE – THIÊN HẠ ĐỆ NHẤT TÀ PHÁI
 * CultLeader2D:
 * Full 2D animated Wuxia Demonic Cult Leader with 35 distinct actions,
 * animated silver hair, expressive eyes & brows, real-time viseme lip-sync,
 * flowing sleeves, martial arts effects, and accessories (tea, fan, dragon aura).
 */

import React from 'react';
import { CultLeaderAnimId, LeaderVisualState } from '../../types/magiao';

interface Props {
  visualState: LeaderVisualState;
  scale?: number;
  showThrone?: boolean;
}

export const CultLeader2D: React.FC<Props> = ({
  visualState,
  scale = 1.0,
  showThrone = true,
}) => {
  const {
    currentAnim,
    isSeated,
    mouthViseme,
    eyeState,
    browState,
    auraEffect,
    hasShadowClones,
    facing,
  } = visualState;

  const isDrinkingTea = currentAnim === 'drink_tea';
  const isFanning = currentAnim === 'fan_self';
  const isStrokingBeard = currentAnim === 'stroke_beard';
  const isTappingThrone = currentAnim === 'tap_throne';
  const isBored = currentAnim === 'bored_pose';
  const isLaughing =
    currentAnim === 'evil_laugh' ||
    currentAnim === 'smug_laugh' ||
    currentAnim === 'belly_laugh';
  const isDozing = currentAnim === 'doze_off';
  const isPalmStriking = currentAnim === 'palm_strike';
  const isGatheringPower = currentAnim === 'gather_inner_power';
  const isMartialCombo = currentAnim === 'martial_arts_combo';
  const isFloating = currentAnim === 'lightness_skill';
  const isFacepalming = currentAnim === 'facepalm';
  const isScolding = currentAnim === 'scold_disciple';
  const isTripping = currentAnim === 'trip_on_robe';
  const isFailedKungfu = currentAnim === 'failed_kungfu';
  const isPromoting = currentAnim === 'promote_disciple' || currentAnim === 'grant_robe';
  const isHandsBehind = currentAnim === 'hands_behind_back';
  const isBowingTransfer = currentAnim === 'transfer_throne';

  return (
    <div
      className="relative flex flex-col items-center select-none pointer-events-none transition-transform duration-200"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'bottom center',
      }}
    >
      {/* --- 1. SPECIAL VISUAL FX (DRAGON, BARRIER, SMOKE, RAGE) --- */}
      {/* Spectral Demonic Dragon (summon_energy_dragon) */}
      {auraEffect === 'dragon' && (
        <div className="absolute -inset-16 pointer-events-none z-30 flex items-center justify-center animate-spin duration-[6000ms]">
          <div className="w-36 h-36 rounded-full border-2 border-red-500/70 border-t-amber-400 border-r-transparent animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.8)] flex items-start justify-end">
            <span className="text-2xl -mt-2 -mr-2 rotate-45">🐉</span>
          </div>
        </div>
      )}

      {/* Magic Barrier Dome (magic_barrier) */}
      {auraEffect === 'barrier' && (
        <div className="absolute -inset-20 rounded-full border-2 border-purple-500/80 bg-purple-950/20 backdrop-blur-xs animate-pulse shadow-[0_0_35px_rgba(168,85,247,0.7)] z-30 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full rounded-full border border-pink-400/30 animate-ping opacity-60" />
        </div>
      )}

      {/* Teleport Smoke Puff (shadow_teleport) */}
      {auraEffect === 'teleport' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-purple-900/90 blur-md animate-ping opacity-80" />
          <span className="absolute text-3xl animate-bounce">💨</span>
        </div>
      )}

      {/* Comical Rage Steam (comical_rage) */}
      {auraEffect === 'rage_steam' && (
        <div className="absolute -top-12 z-30 flex gap-10 animate-bounce">
          <span className="text-sm">♨️</span>
          <span className="text-sm">♨️</span>
        </div>
      )}

      {/* Inner Power Qi Rings (gather_inner_power / palm_strike) */}
      {auraEffect === 'inner_power' && (
        <div className="absolute -inset-8 rounded-full bg-radial from-red-600/40 via-purple-900/30 to-transparent animate-pulse -z-10" />
      )}

      {/* Dozing Zzz particles */}
      {isDozing && (
        <div className="absolute -top-10 right-2 z-30 font-bold text-cyan-300 text-xs animate-bounce space-y-1">
          <div className="text-[10px]">z</div>
          <div className="text-[12px] -ml-2">Z</div>
          <div className="text-[14px]">Zzz</div>
        </div>
      )}

      {/* Comic Stars on Trip or Failed Kungfu */}
      {(isTripping || isFailedKungfu) && (
        <div className="absolute -top-8 z-30 text-xs animate-spin text-amber-300">💫 ✨ 💫</div>
      )}

      {/* Shadow Clones (shadow_clones) */}
      {hasShadowClones && (
        <>
          <div className="absolute -left-14 top-2 opacity-40 blur-[0.5px] scale-95 pointer-events-none">
            <LeaderBodyRig {...{ visualState, isSeated, eyeState, browState, mouthViseme, facing }} />
          </div>
          <div className="absolute -right-14 top-2 opacity-40 blur-[0.5px] scale-95 pointer-events-none">
            <LeaderBodyRig {...{ visualState, isSeated, eyeState, browState, mouthViseme, facing }} />
          </div>
        </>
      )}

      {/* --- 2. DRAGON THRONE DAIS (NGÀI RỒNG HẮC MA) --- */}
      {showThrone && isSeated && (
        <div className="absolute -bottom-4 z-0 flex flex-col items-center">
          {/* Throne Backrest with Carved Dragon Horns */}
          <div className="relative w-28 h-32 rounded-t-xl bg-gradient-to-b from-[#2a080c] via-[#1a0507] to-black border-2 border-[#b91c1c] shadow-2xl flex flex-col items-center justify-start p-1.5 overflow-hidden">
            {/* Dragon Crest Gold Inlay */}
            <div className="w-10 h-10 rounded-full border border-amber-500/60 bg-red-950/80 flex items-center justify-center shadow-md">
              <span className="text-base text-amber-400">🐉</span>
            </div>
            {/* Throne Back Flares */}
            <div className="absolute top-1 left-1 text-xs text-amber-500">⚜️</div>
            <div className="absolute top-1 right-1 text-xs text-amber-500">⚜️</div>

            {/* Red Silk Cushion */}
            <div className="w-20 h-10 mt-auto rounded-t-md bg-gradient-to-r from-red-900 via-rose-700 to-red-900 border-t border-amber-500/50" />
          </div>

          {/* Golden Armrests */}
          <div className="absolute bottom-6 w-32 flex justify-between px-1">
            <div className="w-4 h-8 rounded bg-gradient-to-b from-amber-600 to-amber-950 border border-amber-400/60 shadow-md flex items-center justify-center">
              <div className="w-1 h-3 bg-red-600 rounded-full" />
            </div>
            <div className="w-4 h-8 rounded bg-gradient-to-b from-amber-600 to-amber-950 border border-amber-400/60 shadow-md flex items-center justify-center">
              <div className="w-1 h-3 bg-red-600 rounded-full" />
            </div>
          </div>

          {/* Stepped Dais Base */}
          <div className="w-36 h-3 bg-[#170509] border-t border-[#b91c1c] rounded-b-md shadow-lg" />
        </div>
      )}

      {/* --- 3. FLOOR DROP SHADOW --- */}
      <div
        className={`rounded-full bg-black/70 blur-[1px] transition-all duration-200 ${
          isFloating
            ? 'w-10 h-2 opacity-25 mt-10'
            : isSeated
            ? 'w-24 h-4 opacity-75 mt-0'
            : isTripping
            ? 'w-24 h-3 opacity-60 translate-x-2'
            : 'w-16 h-3 opacity-60'
        }`}
      />

      {/* --- 4. 2D ARTICULATED LEADER BODY RIG --- */}
      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-300 ${
          isFloating
            ? '-translate-y-8 animate-pulse'
            : isTripping
            ? 'rotate-12 translate-x-2 translate-y-2'
            : isBowingTransfer
            ? 'rotate-12 translate-y-1'
            : isMartialCombo
            ? 'animate-bounce'
            : isLaughing
            ? 'scale-105'
            : ''
        }`}
      >
        <LeaderBodyRig
          visualState={visualState}
          isSeated={isSeated}
          eyeState={eyeState}
          browState={browState}
          mouthViseme={mouthViseme}
          facing={facing}
          isDrinkingTea={isDrinkingTea}
          isFanning={isFanning}
          isStrokingBeard={isStrokingBeard}
          isTappingThrone={isTappingThrone}
          isBored={isBored}
          isPalmStriking={isPalmStriking}
          isGatheringPower={isGatheringPower}
          isFacepalming={isFacepalming}
          isScolding={isScolding}
          isPromoting={isPromoting}
          isHandsBehind={isHandsBehind}
          isLaughing={isLaughing}
        />
      </div>
    </div>
  );
};

interface BodyRigProps {
  visualState: LeaderVisualState;
  isSeated: boolean;
  eyeState: LeaderVisualState['eyeState'];
  browState: LeaderVisualState['browState'];
  mouthViseme: number;
  facing: 'front' | 'back' | 'left' | 'right';
  isDrinkingTea?: boolean;
  isFanning?: boolean;
  isStrokingBeard?: boolean;
  isTappingThrone?: boolean;
  isBored?: boolean;
  isPalmStriking?: boolean;
  isGatheringPower?: boolean;
  isFacepalming?: boolean;
  isScolding?: boolean;
  isPromoting?: boolean;
  isHandsBehind?: boolean;
  isLaughing?: boolean;
}

const LeaderBodyRig: React.FC<BodyRigProps> = ({
  visualState,
  isSeated,
  eyeState,
  browState,
  mouthViseme,
  facing,
  isDrinkingTea,
  isFanning,
  isStrokingBeard,
  isTappingThrone,
  isBored,
  isPalmStriking,
  isGatheringPower,
  isFacepalming,
  isScolding,
  isPromoting,
  isHandsBehind,
  isLaughing,
}) => {
  return (
    <div className="relative flex flex-col items-center">
      {/* --- A. HEAD, SILVER HAIR & FACIAL RIG --- */}
      <div className="relative w-10 h-11 flex flex-col items-center z-20">
        {/* Silver Hair Topknot with Golden Crown Pin */}
        <div className="absolute -top-4 w-5 h-4 bg-gradient-to-t from-slate-200 to-white rounded-t-full border border-slate-400 flex items-center justify-center shadow-xs">
          {/* Gold Demonic Guan (Crown Pin) */}
          <div className="w-6 h-1.5 bg-[#f59e0b] rounded-full shadow-xs flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
          </div>
        </div>

        {/* Long Flowing Silver Hair (Left & Right Locks) */}
        <div className="absolute -left-2.5 top-0 w-3 h-14 bg-gradient-to-b from-slate-200 via-slate-100 to-transparent rounded-l-full shadow-xs -z-10" />
        <div className="absolute -right-2.5 top-0 w-3 h-14 bg-gradient-to-b from-slate-200 via-slate-100 to-transparent rounded-r-full shadow-xs -z-10" />

        {/* Back Silver Ponytail (Billowing) */}
        {facing === 'back' && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-400 rounded-b-md flex flex-col items-center">
            <div className="w-5 h-12 bg-slate-200 rounded-b-lg mt-3 shadow-md" />
          </div>
        )}

        {/* Face Silhouette (Peach/Ivory Skin) */}
        {facing !== 'back' && (
          <div className="w-8 h-9 rounded-b-2xl bg-[#ffedd5] border border-[#7c2d12] shadow-sm flex flex-col items-center px-1 pt-1.5 overflow-visible">
            {/* Eyebrows */}
            <div className="w-full flex justify-between px-0.5 mt-0.5">
              <div
                className={`w-2.5 h-0.5 bg-[#475569] rounded-full transition-transform ${
                  browState === 'furrowed'
                    ? 'rotate-12 translate-y-0.5'
                    : browState === 'raised'
                    ? '-rotate-12 -translate-y-0.5'
                    : browState === 'arrogant'
                    ? '-rotate-6'
                    : ''
                }`}
              />
              <div
                className={`w-2.5 h-0.5 bg-[#475569] rounded-full transition-transform ${
                  browState === 'furrowed'
                    ? '-rotate-12 translate-y-0.5'
                    : browState === 'raised'
                    ? 'rotate-6'
                    : browState === 'arrogant'
                    ? 'rotate-6'
                    : ''
                }`}
              />
            </div>

            {/* Eyes */}
            <div className="w-full flex justify-between px-1 mt-0.5">
              {eyeState === 'laugh' ? (
                <>
                  <div className="w-2 h-1 border-t-2 border-[#1e293b] rounded-t-full" />
                  <div className="w-2 h-1 border-t-2 border-[#1e293b] rounded-t-full" />
                </>
              ) : eyeState === 'shocked' ? (
                <>
                  <div className="w-2 h-2 rounded-full border border-red-700 bg-white flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-black" />
                  </div>
                  <div className="w-2 h-2 rounded-full border border-red-700 bg-white flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-black" />
                  </div>
                </>
              ) : eyeState === 'dozing' ? (
                <>
                  <div className="w-2 h-0.5 bg-[#334155]" />
                  <div className="w-2 h-0.5 bg-[#334155]" />
                </>
              ) : eyeState === 'angry' ? (
                <>
                  <div className="w-2 h-1 bg-red-600 rounded-xs border border-black shadow-[0_0_4px_red]" />
                  <div className="w-2 h-1 bg-red-600 rounded-xs border border-black shadow-[0_0_4px_red]" />
                </>
              ) : eyeState === 'bored' ? (
                <>
                  <div className="w-2 h-1 bg-[#1e293b] rounded-b-full opacity-70" />
                  <div className="w-2 h-1 bg-[#1e293b] rounded-b-full opacity-70" />
                </>
              ) : (
                /* Normal Eyes */
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0f172a] flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-white ml-0.5 -mt-0.5" />
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0f172a] flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-white ml-0.5 -mt-0.5" />
                  </div>
                </>
              )}
            </div>

            {/* Silver Mustache */}
            <div className="w-4 h-1 flex justify-center mt-0.5">
              <div className="w-2 h-0.5 bg-slate-300 rounded-l-full rotate-6" />
              <div className="w-2 h-0.5 bg-slate-300 rounded-r-full -rotate-6" />
            </div>

            {/* Mouth (Lip-sync phonemes & expressions) */}
            <div className="flex items-center justify-center mt-[-1px]">
              {isLaughing ? (
                <div className="w-3.5 h-2 rounded-b-full bg-[#881337] border border-black flex items-center justify-center overflow-hidden">
                  <div className="w-2 h-0.5 bg-white -mt-1" />
                </div>
              ) : mouthViseme === 1 ? (
                <div className="w-2.5 h-1 rounded-full bg-[#881337] border border-black/40" />
              ) : mouthViseme === 2 ? (
                <div className="w-3 h-2 rounded-b-md bg-[#881337] border border-black/60 flex items-center justify-center">
                  <div className="w-1.5 h-0.5 bg-white -mt-1" />
                </div>
              ) : mouthViseme === 3 ? (
                <div className="w-2 h-2 rounded-full bg-[#881337] border border-black/60" />
              ) : (
                <div className="w-2 h-0.5 bg-[#450a0a] rounded-full" />
              )}
            </div>

            {/* Silver Goatee Beard */}
            <div className="w-1.5 h-3 bg-gradient-to-b from-slate-200 to-slate-400 rounded-b-full mt-0.5 shadow-xs" />
          </div>
        )}
      </div>

      {/* --- B. TORSO, ROBES & ARMS RIG --- */}
      <div className="relative w-16 h-18 flex flex-col items-center">
        {/* Obsidian & Dark Crimson Imperial Robe */}
        <div
          className={`relative rounded-t-md bg-gradient-to-b from-[#180a0e] via-[#450a0a] to-[#180a0e] border border-black/60 shadow-xl overflow-hidden flex flex-col items-center ${
            isSeated ? 'w-14 h-13' : 'w-12 h-14'
          }`}
        >
          {/* Dragon Embroidery Lapels (Vàng Kim) */}
          <div className="w-full flex justify-center">
            <div className="w-2 h-7 bg-[#b45309] rotate-12 -ml-1 border-r border-black/40" />
            <div className="w-2 h-7 bg-[#b45309] -rotate-12 -mr-1" />
          </div>

          {/* Golden Dragon Medallion on Chest */}
          <div className="absolute top-2 w-4 h-4 rounded-full border border-amber-400/80 bg-red-950 flex items-center justify-center shadow-xs">
            <span className="text-[8px] text-amber-300">🐲</span>
          </div>

          {/* Imperial Sash Belt */}
          <div className="w-full h-2 bg-[#09090b] mt-auto flex items-center justify-center border-t border-amber-600/50">
            {/* Jade Pendant */}
            <div className="w-2.5 h-2 rounded-sm bg-emerald-600 border border-amber-400 shadow-xs flex items-center justify-center">
              <div className="w-0.5 h-1 bg-amber-200" />
            </div>
          </div>
        </div>

        {/* --- C. ARTICULATED ARMS, HANDS & ACCESSORIES --- */}
        {/* 1. Drinking Tea (drink_tea) */}
        {isDrinkingTea && (
          <div className="absolute -top-3 right-0 z-30 flex flex-col items-center animate-bounce">
            <span className="text-sm">🍵</span>
            <div className="w-1 h-2 bg-white/40 blur-xs -mt-1" />
          </div>
        )}

        {/* 2. Folding War Fan (fan_self) */}
        {isFanning && (
          <div className="absolute -top-1 -right-4 z-30 text-lg rotate-12 animate-pulse">
            🪭
          </div>
        )}

        {/* 3. Stroking Beard (stroke_beard) */}
        {isStrokingBeard && (
          <div className="absolute -top-3 w-4 h-4 rounded-full bg-[#ffedd5] border border-[#7c2d12] z-30 flex items-center justify-center text-[9px]">
            ✊
          </div>
        )}

        {/* 4. Facepalm (facepalm) */}
        {isFacepalming && (
          <div className="absolute -top-6 w-5 h-5 rounded-full bg-[#ffedd5] border border-[#7c2d12] z-30 flex items-center justify-center text-xs">
            🤦‍♂️
          </div>
        )}

        {/* 5. Scolding Disciple (scold_disciple) */}
        {isScolding && (
          <div className="absolute top-2 -right-6 z-30 text-base animate-pulse">
            👉
          </div>
        )}

        {/* 6. Palm Strike (palm_strike) */}
        {isPalmStriking && (
          <div className="absolute top-1 -right-8 z-30 flex items-center">
            <span className="text-base">🫲</span>
            <div className="w-6 h-6 rounded-full bg-purple-600/70 blur-xs border border-red-500 animate-ping -ml-2" />
          </div>
        )}

        {/* 7. Gathering Inner Power (gather_inner_power) */}
        {isGatheringPower && (
          <div className="absolute top-0 -left-4 -right-4 flex justify-between z-30">
            <span className="text-sm animate-spin text-purple-400">🔮</span>
            <span className="text-sm animate-spin text-red-500">🔥</span>
          </div>
        )}

        {/* 8. Promoting Disciple (promote_disciple / grant_robe) */}
        {isPromoting && (
          <div className="absolute -top-6 right-1 z-30 flex flex-col items-center animate-bounce">
            <span className="text-base">👑</span>
            <span className="text-[10px] text-amber-300 font-bold">PHONG</span>
          </div>
        )}

        {/* 9. Tapping Throne (tap_throne) */}
        {isTappingThrone && (
          <div className="absolute bottom-2 -right-4 text-xs animate-bounce">
            🖐️
          </div>
        )}

        {/* 10. Hands Behind Back (hands_behind_back) */}
        {isHandsBehind && (
          <div className="absolute bottom-3 w-10 h-2 bg-[#2a080c] rounded-full border border-black/40 z-20" />
        )}

        {/* Wide Flowing Sleeves (Tay Áo Thụng) Left & Right */}
        {!isHandsBehind && (
          <>
            <div className="absolute top-1 -left-3 w-4 h-8 rounded-b-lg bg-[#2a080c] border border-black/40 shadow-md flex items-end justify-center pb-0.5">
              <div className="w-2 h-2 rounded-full bg-[#ffedd5] border border-[#7c2d12]" />
            </div>
            <div className="absolute top-1 -right-3 w-4 h-8 rounded-b-lg bg-[#2a080c] border border-black/40 shadow-md flex items-end justify-center pb-0.5">
              <div className="w-2 h-2 rounded-full bg-[#ffedd5] border border-[#7c2d12]" />
            </div>
          </>
        )}

        {/* --- D. LOWER ROBES & BOOTS --- */}
        {!isSeated && (
          <div className="w-10 flex justify-between px-1 mt-[-2px]">
            {/* Left Black Boot with Gold Toe */}
            <div className="w-3 h-5 bg-[#09090b] rounded-b-xs border-t-2 border-[#b45309] shadow-md flex items-end justify-center">
              <div className="w-full h-1 bg-[#f59e0b] rounded-b-xs" />
            </div>
            {/* Right Black Boot with Gold Toe */}
            <div className="w-3 h-5 bg-[#09090b] rounded-b-xs border-t-2 border-[#b45309] shadow-md flex items-end justify-center">
              <div className="w-full h-1 bg-[#f59e0b] rounded-b-xs" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
