/**
 * MA GIÁO ONLINE - MARTIAL ARTS TRAINING ARENA (SÂN LUYỆN VÕ MA GIÁO)
 * Automatically runs 1 of 3 minigames: Ma Quyền Loạn Vũ, Ma Ảnh Thân Pháp, or Tam Khí Ma Trận.
 */

import React from 'react';
import {
  LeaderVisualState,
  MaGiaoParticipant,
  TrainingState,
} from '../../types/magiao';
import { CultLeader2D } from './CultLeader2D';
import { MaGiaoCharacterSprite } from './MaGiaoCharacterSprite';

interface Props {
  participants: MaGiaoParticipant[];
  trainingState: TrainingState;
  leaderVisualState?: LeaderVisualState;
  leaderSpeech: {
    isSpeaking: boolean;
    text: string;
    mood: string;
  };
}

export const MaGiaoTrainingArena: React.FC<Props> = ({
  participants,
  trainingState,
  leaderVisualState,
  leaderSpeech,
}) => {
  const eligible = participants.filter((p) => !p.isSweeping);
  const doneCount = trainingState.participantsDone.length;
  const targetCount = trainingState.targetCount || Math.max(1, Math.ceil(eligible.length * 0.6));
  const progressPct = Math.min(100, Math.round((doneCount / targetCount) * 100));

  // Determine title and keyword display
  let minigameTitle = 'MA QUYỀN LOẠN VŨ';
  let keywordDisplay = 'MÚA';
  let instruction = 'Bình luận "MÚA" 1 lần để nhân vật tung cước biểu diễn!';

  if (trainingState.activeMinigame === 'MA_ANH_THAN_PHAP') {
    minigameTitle = 'MA ẢNH THÂN PHÁP';
    keywordDisplay = trainingState.activeCommand || 'TRÁI';
    instruction = `VÒNG ${trainingState.round}/3: Bình luận "${keywordDisplay}" theo lệnh để né chướng ngại vật!`;
  } else if (trainingState.activeMinigame === 'TAM_KHI_MA_TRAN') {
    minigameTitle = 'TAM KHÍ MA TRẬN';
    keywordDisplay = `KHẮC [${trainingState.activeCommand}]`;
    instruction = `Bổn tọa xuất [${trainingState.activeCommand}]! Bình luận "${trainingState.correctAnswer}" để khắc chế!`;
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#0a0c10]">
      {/* 1. Backdrop image: Training Arena in mist */}
      <img
        src="/assets/magiao/training_arena.jpg"
        alt="Ma Giáo Training Ground"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Atmospheric lighting overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/50 pointer-events-none" />

      {/* Cult Leader Standing on High Arena Pavilion */}
      {leaderVisualState && (
        <div className="absolute top-[2.5%] left-1/2 -translate-x-1/2 z-35 flex flex-col items-center pointer-events-none">
          <CultLeader2D
            visualState={{
              ...leaderVisualState,
              isSeated: false,
            }}
            scale={0.88}
            showThrone={false}
          />
        </div>
      )}

      {/* 2. Top Banner: Commander Pavilion & Leader Shout */}
      <div className="absolute top-[16%] left-1/2 -translate-x-1/2 w-[92%] z-30 flex flex-col items-center">
        {/* Minigame Badge & Timer Bar */}
        <div className="w-full px-3 py-2 rounded-xl bg-black/85 border-2 border-red-500/60 shadow-2xl backdrop-blur-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">⚔️</span>
              <span className="text-xs font-black tracking-wider text-red-400 uppercase">
                {minigameTitle}
              </span>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-1 text-xs font-black text-amber-300">
              <span>⏱️</span>
              <span className="tabular-nums text-sm">{trainingState.timeRemainingSec}s</span>
            </div>
          </div>

          {/* Large Keyword Callout */}
          <div className="my-1.5 flex flex-col items-center">
            <span className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold">
              TỪ KHÓA BÌNH LUẬN
            </span>
            <div className="px-5 py-1 rounded-lg bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border border-white/20 text-white font-black text-2xl tracking-widest shadow-lg animate-pulse">
              {keywordDisplay}
            </div>
          </div>

          {/* Plain Vietnamese Instruction */}
          <p className="text-[11px] text-amber-200 text-center font-medium leading-tight mb-2">
            {instruction}
          </p>

          {/* Elemental Counter Diagram (Only for Tam Khi Ma Tran) */}
          {trainingState.activeMinigame === 'TAM_KHI_MA_TRAN' && (
            <div className="w-full py-1 px-2 mb-2 rounded bg-white/5 border border-white/10 flex items-center justify-around text-[10px] font-semibold text-slate-200">
              <span className="text-cyan-400">❄️ BĂNG dập LỬA</span>
              <span className="text-emerald-400">🌪️ GIÓ tan BĂNG</span>
              <span className="text-rose-400">🔥 LỬA nuốt GIÓ</span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full flex items-center gap-2">
            <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden border border-white/10 relative">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] font-bold tabular-nums text-amber-300 shrink-0">
              {doneCount}/{targetCount} ({progressPct}%)
            </span>
          </div>
        </div>

        {/* Cult Leader Speech Bubble from High Pavilion */}
        {leaderSpeech.isSpeaking && leaderSpeech.text && (
          <div className="mt-2 max-w-[280px] px-3 py-1.5 rounded-lg bg-red-950/90 border border-red-500 text-amber-100 text-xs font-semibold text-center shadow-xl animate-in zoom-in-95 duration-150">
            "{leaderSpeech.text}"
          </div>
        )}
      </div>

      {/* 3. Martial Arts Training Formation (Courtyard Floor) */}
      <div className="absolute inset-x-4 bottom-[8%] top-[40%] pointer-events-none">
        <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-1 place-items-center">
          {eligible.slice(0, 36).map((participant, idx) => (
            <div key={participant.userId} className="relative flex flex-col items-center">
              <MaGiaoCharacterSprite
                participant={participant}
                scale={0.88}
                isTrainingArena={true}
              />

              {/* Status Indicator checkmark or punching effect */}
              {participant.completedCurrentTraining && (
                <span className="absolute -top-3 text-xs animate-bounce">✨</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Round Evaluation Modal (Victory / Defeat) */}
      {trainingState.status === 'VICTORY' && (
        <div className="absolute inset-0 z-40 bg-black/70 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-200">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950 via-black to-red-950 border-2 border-amber-400 shadow-2xl text-center max-w-[320px]">
            <span className="text-4xl animate-bounce">🏆</span>
            <h3 className="text-xl font-black text-amber-400 tracking-wider mt-2 mb-1">
              ĐẠI THẮNG QUANG VINH!
            </h3>
            <p className="text-xs text-amber-100 leading-relaxed font-medium mb-3">
              Toàn thể đệ tử hợp lực thi triển tuyệt kỹ hoàn mỹ! Giáo Chủ vô cùng hài lòng!
            </p>
            <div className="text-[11px] text-slate-300 bg-white/5 py-1 px-3 rounded-full border border-white/10">
              Đạt chỉ tiêu: {doneCount}/{targetCount} cao thủ ({progressPct}%)
            </div>
          </div>
        </div>
      )}

      {trainingState.status === 'DEFEAT' && (
        <div className="absolute inset-0 z-40 bg-black/70 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-200">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-red-950 via-black to-slate-950 border-2 border-red-500 shadow-2xl text-center max-w-[320px]">
            <span className="text-4xl">🧹</span>
            <h3 className="text-xl font-black text-red-400 tracking-wider mt-2 mb-1">
              CHƯA ĐẠT CHỈ TIÊU!
            </h3>
            <p className="text-xs text-rose-100 leading-relaxed font-medium mb-3">
              Múa may lười biếng! Giáo Chủ phạt 5 đệ tử chậm nhất đi quét sân ngắm trăng!
            </p>
            <div className="text-[11px] text-slate-300 bg-white/5 py-1 px-3 rounded-full border border-white/10">
              Chỉ có {doneCount}/{targetCount} người hoàn thành
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
