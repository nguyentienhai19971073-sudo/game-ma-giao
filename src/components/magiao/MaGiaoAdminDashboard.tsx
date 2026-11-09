/**
 * MA GIÁO ONLINE - ADMIN CONTROL DASHBOARD
 * Comprehensive management panel for stream configuration, ranks, minigames,
 * TTS speech tuning, live TikTok connector, and interactive demo simulator.
 */

import React, { useState } from 'react';
import {
  SlidersHorizontal,
  X,
  Play,
  RotateCcw,
  Volume2,
  Users,
  Award,
  Swords,
  Radio,
  Sparkles,
  Activity,
  Footprints,
  Crown,
  Flame,
} from 'lucide-react';
import {
  CultLeaderAnimId,
  LeaderPersonality,
  MA_GIAO_RANKS,
  MaGiaoRankId,
  MaGiaoSettings,
} from '../../types/magiao';
import { maGiaoGameManager } from '../../systems/MaGiaoGameManager';
import { maGiaoVoiceManager } from '../../systems/MaGiaoVoiceManager';
import { LEADER_ANIM_REGISTRY } from '../../systems/SectLeaderAnimationController';
import { SILLY_EVIL_BOASTS } from '../../data/maGiaoDialogues';

interface Props {
  settings: MaGiaoSettings;
  onUpdateSettings: (newSettings: Partial<MaGiaoSettings>) => void;
  onClose: () => void;
  participantCount: number;
  sweeperCount: number;
  currentScene: 'GRAND_PALACE' | 'TRAINING_ARENA';
}

export const MaGiaoAdminDashboard: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onClose,
  participantCount,
  sweeperCount,
  currentScene,
}) => {
  const [activeTab, setActiveTab] = useState<
    'LEADER_ANIMS' | 'ACTIVITIES' | 'SIMULATION' | 'MINIGAMES' | 'RANKS' | 'VOICE' | 'SETTINGS'
  >('LEADER_ANIMS');

  const [testLine, setTestLine] = useState('');
  const [tiktokUsername, setTiktokUsername] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#140b0f] border-2 border-[#e11d48]/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#f8fafc]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-red-950 via-[#1e0a12] to-black border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐉</span>
            <div>
              <h2 className="text-sm font-black text-amber-300 tracking-wider uppercase">
                QUẢN TRỊ MA GIÁO ONLINE
              </h2>
              <span className="text-[10px] text-slate-400">
                Thiên Hạ Đệ Nhất Tà Phái · TikTok LIVE Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-amber-300 border border-white/10">
              Đệ tử: {participantCount}/80 · Quét sân: {sweeperCount}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-black/40 border-b border-white/5 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('LEADER_ANIMS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activeTab === 'LEADER_ANIMS'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Hoạt Ảnh Giáo Chủ (35)</span>
          </button>

          <button
            onClick={() => setActiveTab('ACTIVITIES')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activeTab === 'ACTIVITIES'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Hoạt Động & Luyện Võ</span>
          </button>

          <button
            onClick={() => setActiveTab('SIMULATION')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activeTab === 'SIMULATION'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mô Phỏng / Demo</span>
          </button>

          <button
            onClick={() => setActiveTab('MINIGAMES')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activeTab === 'MINIGAMES'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Sân Luyện Võ</span>
          </button>

          <button
            onClick={() => setActiveTab('RANKS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activeTab === 'RANKS'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Cấp Bậc & Quà</span>
          </button>

          <button
            onClick={() => setActiveTab('VOICE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activeTab === 'VOICE'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Giọng Giáo Chủ</span>
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activeTab === 'SETTINGS'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Cài Đặt Sảnh</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB: CULT LEADER 35 ANIMATIONS & PERSONALITIES */}
          {activeTab === 'LEADER_ANIMS' && (
            <div className="space-y-4 text-xs">
              {/* 1. Personality Mode Selector */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/90 via-black to-red-950/90 border-2 border-red-600/70 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-amber-300 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>3 Chế Độ Tính Cách Giáo Chủ</span>
                  </h3>
                  <span className="text-[10px] text-red-300 font-mono">Quyết định hành vi tự động</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: 'DOMINANT' as LeaderPersonality,
                      title: 'BÁ CHỦ',
                      icon: '👑',
                      desc: 'Ngồi uy nghiêm, đi tuần, phẩy quạt, vuốt cằm, kiêu ngạo',
                    },
                    {
                      id: 'COMEDIC' as LeaderPersonality,
                      title: 'HÀI HƯỚC',
                      icon: '🎭',
                      desc: 'Uống trà, ngủ gật, cười lớn, vấp vạt áo, nghịch ngợm',
                    },
                    {
                      id: 'MARTIAL_MANIAC' as LeaderPersonality,
                      title: 'CUỒNG VÕ',
                      icon: '🥋',
                      desc: 'Vận nội công, tung chưởng, múa quyền, triệu hồi rồng',
                    },
                  ].map((p) => {
                    const isSelected = settings.leaderPersonality === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => onUpdateSettings({ leaderPersonality: p.id })}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-red-900/80 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                            : 'bg-black/40 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-white text-xs mb-1">
                          <span>{p.icon}</span>
                          <span className={isSelected ? 'text-amber-300' : 'text-slate-200'}>
                            {p.title}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300 leading-tight">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Direct Instant Action Buttons */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                <h3 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Ra Lệnh Giáo Chủ Tức Thì</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => maGiaoGameManager.triggerLeaderAnimation('stand_from_throne', 85)}
                    className="px-3 py-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/60 font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🧍</span>
                    <span>Đứng Dậy Khỏi Ngai</span>
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.triggerLeaderAnimation('return_to_throne', 85)}
                    className="px-3 py-2 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 font-semibold text-amber-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🪑</span>
                    <span>Trở Về Ngai Vàng</span>
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.triggerLeaderAnimation('martial_arts_combo', 85)}
                    className="px-3 py-2 rounded-lg bg-orange-950/80 hover:bg-orange-900 border border-orange-700/60 font-semibold text-orange-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🥋</span>
                    <span>Múa Quyền Ma Khí</span>
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.triggerLeaderAnimation('shadow_teleport', 85)}
                    className="px-3 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 font-semibold text-purple-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>💨</span>
                    <span>Ảo Ảnh Dịch Chuyển</span>
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.triggerLeaderAnimation('promote_disciple', 90)}
                    className="px-3 py-2 rounded-lg bg-yellow-950/80 hover:bg-yellow-900 border border-yellow-700/60 font-semibold text-yellow-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>👑</span>
                    <span>Thử Phong Chức</span>
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.triggerLeaderAnimation('transfer_throne', 100)}
                    className="px-3 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 font-semibold text-rose-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🐉</span>
                    <span>Chuyển Giao Ngai</span>
                  </button>
                </div>
              </div>

              {/* 3. 35 Animations Catalog by 5 Groups */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                    <span>🎬</span>
                    <span>Thư Viện 35 Hoạt Ảnh Chuyên Nghiệp (Bấm để xem thử)</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Real 2D Animation Rig</span>
                </div>

                {/* Group A: Seated */}
                <div className="space-y-1.5">
                  <div className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                    <span>🏰</span>
                    <span>NHÓM A – Sinh Hoạt Trên Ngai (8 hoạt ảnh)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(
                      [
                        { id: 'throne_idle', label: 'Ngồi Uy Nghiêm', icon: '👑' },
                        { id: 'stroke_beard', label: 'Vuốt Cằm Suy Nghĩ', icon: '🧔' },
                        { id: 'drink_tea', label: 'Thưởng Trà', icon: '🍵' },
                        { id: 'evil_laugh', label: 'Ngửa Đầu Cười Lớn', icon: '😈' },
                        { id: 'doze_off', label: 'Ngủ Gật Giật Mình', icon: '💤' },
                        { id: 'tap_throne', label: 'Gõ Tay Thành Ngai', icon: '🖐️' },
                        { id: 'fan_self', label: 'Phẩy Quạt Kiêu Ngạo', icon: '🪭' },
                        { id: 'bored_pose', label: 'Chống Cằm Chán Nản', icon: '🥱' },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => maGiaoGameManager.triggerLeaderAnimation(item.id, 95)}
                        className="px-2.5 py-1.5 rounded bg-black/60 hover:bg-red-950 border border-white/10 hover:border-red-500/50 text-left text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <span className="text-sm shrink-0">{item.icon}</span>
                        <span className="truncate text-[11px] font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Group B: Standing & Movement */}
                <div className="space-y-1.5">
                  <div className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                    <span>🚶</span>
                    <span>NHÓM B – Đứng Dậy & Di Chuyển (7 hoạt ảnh)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(
                      [
                        { id: 'stand_from_throne', label: 'Đứng Dậy Khỏi Ngai', icon: '🧍' },
                        { id: 'walk_down_steps', label: 'Bước Xuống Bậc Thềm', icon: '🪜' },
                        { id: 'patrol_hall', label: 'Đi Tuần Đại Điện', icon: '🚶' },
                        { id: 'hands_behind_back', label: 'Chắp Tay Sau Lưng', icon: '🥷' },
                        { id: 'turn_around', label: 'Xoay Người Đổi Hướng', icon: '🔄' },
                        { id: 'return_to_throne', label: 'Trở Về Ngai Vàng', icon: '🪑' },
                        { id: 'shadow_teleport', label: 'Ảo Ảnh Dịch Chuyển', icon: '💨' },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => maGiaoGameManager.triggerLeaderAnimation(item.id, 95)}
                        className="px-2.5 py-1.5 rounded bg-black/60 hover:bg-cyan-950 border border-white/10 hover:border-cyan-500/50 text-left text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <span className="text-sm shrink-0">{item.icon}</span>
                        <span className="truncate text-[11px] font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Group C: Martial Arts & Magic */}
                <div className="space-y-1.5">
                  <div className="font-bold text-orange-300 text-xs flex items-center gap-1.5">
                    <span>⚔️</span>
                    <span>NHÓM C – Võ Công & Phép Thuật (8 hoạt ảnh)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(
                      [
                        { id: 'gather_inner_power', label: 'Vận Khí Ma Đạo', icon: '🔮' },
                        { id: 'palm_strike', label: 'Tung Chưởng Ma Quang', icon: '💥' },
                        { id: 'martial_arts_combo', label: 'Múa Quyền Ma Khí', icon: '🥋' },
                        { id: 'lightness_skill', label: 'Khinh Công Phi Thiên', icon: '🪽' },
                        { id: 'summon_energy_dragon', label: 'Triệu Hồi Hắc Long', icon: '🐉' },
                        { id: 'shadow_clones', label: 'Tam Thân Huyễn Ảnh', icon: '👥' },
                        { id: 'magic_barrier', label: 'Ma Đạo Kết Giới', icon: '🛡️' },
                        { id: 'failed_kungfu', label: 'Luyện Võ Thất Bại', icon: '🤕' },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => maGiaoGameManager.triggerLeaderAnimation(item.id, 95)}
                        className="px-2.5 py-1.5 rounded bg-black/60 hover:bg-orange-950 border border-white/10 hover:border-orange-500/50 text-left text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <span className="text-sm shrink-0">{item.icon}</span>
                        <span className="truncate text-[11px] font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Group D: Expressions */}
                <div className="space-y-1.5">
                  <div className="font-bold text-yellow-300 text-xs flex items-center gap-1.5">
                    <span>🎭</span>
                    <span>NHÓM D – Biểu Cảm Hài Hước (7 hoạt ảnh)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(
                      [
                        { id: 'smug_laugh', label: 'Cười Đắc Ý Tinh Nghịch', icon: '😏' },
                        { id: 'shocked', label: 'Há Hốc Kinh Ngạc', icon: '😲' },
                        { id: 'facepalm', label: 'Đập Trán Thở Dài', icon: '🤦‍♂️' },
                        { id: 'scold_disciple', label: 'Chỉ Tay Mắng Yêu', icon: '👉' },
                        { id: 'belly_laugh', label: 'Ôm Bụng Cười Ngặt', icon: '🤣' },
                        { id: 'comical_rage', label: 'Tức Giận Bốc Khói', icon: '😡' },
                        { id: 'trip_on_robe', label: 'Vấp Vạt Áo Bào', icon: '💫' },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => maGiaoGameManager.triggerLeaderAnimation(item.id, 95)}
                        className="px-2.5 py-1.5 rounded bg-black/60 hover:bg-yellow-950 border border-white/10 hover:border-yellow-500/50 text-left text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <span className="text-sm shrink-0">{item.icon}</span>
                        <span className="truncate text-[11px] font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Group E: Interaction & Gifts */}
                <div className="space-y-1.5">
                  <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <span>🎁</span>
                    <span>NHÓM E – Tương Tác & Quà TikTok (5 hoạt ảnh)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'promote_disciple', label: 'Giơ Tay Phong Chức', icon: '🎖️' },
                        { id: 'grant_robe', label: 'Ban Tặng Áo Bào', icon: '👘' },
                        { id: 'welcome_elder', label: 'Nghênh Đón Trưởng Lão', icon: '📜' },
                        { id: 'equal_to_leader', label: 'Đồng Tôn Liếc Nhìn', icon: '👀' },
                        { id: 'transfer_throne', label: 'Chuyển Giao Ngai Vàng', icon: '👑' },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => maGiaoGameManager.triggerLeaderAnimation(item.id, 95)}
                        className="px-2.5 py-1.5 rounded bg-black/60 hover:bg-amber-950 border border-white/10 hover:border-amber-500/50 text-left text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <span className="text-sm shrink-0">{item.icon}</span>
                        <span className="truncate text-[11px] font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Leader Timing & Performance Settings */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <h3 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Cấu Hình Tần Suất & Hiệu Năng Hoạt Ảnh</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Tần suất hoạt ảnh tự động: {settings.leaderAnimFrequencySec}s
                    </label>
                    <input
                      type="range"
                      min={15}
                      max={45}
                      step={1}
                      value={settings.leaderAnimFrequencySec}
                      onChange={(e) =>
                        onUpdateSettings({ leaderAnimFrequencySec: Number(e.target.value) })
                      }
                      className="w-full accent-red-500"
                    />
                    <div className="text-[10px] text-slate-400">
                      Khoảng cách tự chọn hành động khi sảnh yên tĩnh (15s – 45s)
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Tốc độ hoạt ảnh Giáo Chủ: {settings.leaderSpeed.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min={0.7}
                      max={1.6}
                      step={0.1}
                      value={settings.leaderSpeed}
                      onChange={(e) => onUpdateSettings({ leaderSpeed: Number(e.target.value) })}
                      className="w-full accent-red-500"
                    />
                    <div className="text-[10px] text-slate-400">
                      Tốc độ cử động tay chân, áo bào và chuyển động ngai
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-4 border-t border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.leaderAutoAnimEnabled}
                      onChange={(e) => onUpdateSettings({ leaderAutoAnimEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-red-600"
                    />
                    <span className="font-semibold text-slate-200">
                      Tự động hoạt ảnh khi sảnh yên tĩnh
                    </span>
                  </label>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-300 font-medium">Hiệu ứng FX:</span>
                    <select
                      value={settings.leaderFxFidelity}
                      onChange={(e) =>
                        onUpdateSettings({
                          leaderFxFidelity: e.target.value as 'low' | 'medium' | 'high',
                        })
                      }
                      className="px-2 py-1 rounded bg-black/60 border border-white/20 text-amber-300 font-semibold"
                    >
                      <option value="high">Cao (Đầy đủ rồng, kết giới, hào quang)</option>
                      <option value="medium">Vừa (Tối ưu cho máy tầm trung)</option>
                      <option value="low">Tiết kiệm (Mượt mà tối đa cho LIVE)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACTIVITIES & MARTIAL ARTS */}
          {activeTab === 'ACTIVITIES' && (
            <div className="space-y-4 text-xs">
              {/* 1. Cult Leader Mass Commands */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/90 via-black to-red-950/90 border-2 border-red-600/60 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-amber-300 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <span>👑</span>
                    <span>Hiệu Lệnh Tập Thể Của Giáo Chủ</span>
                  </h3>
                  <span className="text-[10px] text-red-300 font-mono">Đồng bộ toàn bộ sảnh</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => maGiaoGameManager.orderFormation()}
                    className="px-3 py-2 rounded-lg bg-red-900 hover:bg-red-800 border border-red-500 font-bold text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🎯</span>
                    <span>Về Đúng Bồ Đoàn</span>
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.orderAllMartial()}
                    className="px-3 py-2 rounded-lg bg-orange-900 hover:bg-orange-800 border border-orange-500 font-bold text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🥋</span>
                    <span>Tất Cả Luyện Võ!</span>
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.orderAllMeditate()}
                    className="px-3 py-2 rounded-lg bg-amber-900 hover:bg-amber-800 border border-amber-500 font-bold text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🧘</span>
                    <span>Tất Cả Đi Thiền Định</span>
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.orderAllCheer()}
                    className="px-3 py-2 rounded-lg bg-rose-900 hover:bg-rose-800 border border-rose-500 font-bold text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🙌</span>
                    <span>Hô Vang Khẩu Hiệu</span>
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.resumeFreeRoam()}
                    className="px-3 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500 font-bold text-emerald-200 shadow-xs transition-colors flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1"
                  >
                    <span>🍃</span>
                    <span>Tự Do Hoạt Động</span>
                  </button>
                </div>
              </div>

              {/* 2. Zone Toggles & Autonomous Behaviors */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <h3 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                  <Footprints className="w-4 h-4" />
                  <span>Kích Hoạt Phân Khu & Hành Vi Tự Động</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoRoamEnabled}
                      onChange={(e) => onUpdateSettings({ autoRoamEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-red-600"
                    />
                    <div>
                      <div className="font-semibold text-slate-200">Tự do đi lại trong sảnh</div>
                      <div className="text-[10px] text-slate-400">Đồ đệ tự rời bồ đoàn di chuyển qua lại</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoMartialEnabled}
                      onChange={(e) => onUpdateSettings({ autoMartialEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-red-600"
                    />
                    <div>
                      <div className="font-semibold text-slate-200">Luyện võ tại Zone C</div>
                      <div className="text-[10px] text-slate-400">Đấm, đá, nhảy, né, múa quyền cước</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoMeditateEnabled}
                      onChange={(e) => onUpdateSettings({ autoMeditateEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-red-600"
                    />
                    <div>
                      <div className="font-semibold text-slate-200">Thiền định tại Zone D</div>
                      <div className="text-[10px] text-slate-400">Ngồi xếp bằng trên bồ đoàn tĩnh tâm</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSocialEnabled}
                      onChange={(e) => onUpdateSettings({ autoSocialEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-red-600"
                    />
                    <div>
                      <div className="font-semibold text-slate-200">Đàm đạo tại Zone E</div>
                      <div className="text-[10px] text-slate-400">Tụ tập trò chuyện, cười, vỗ tay</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Movement Physics & Timers */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <h3 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Tinh Chỉnh Tốc Độ & Thời Gian Hành Động</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Tốc độ di chuyển: {settings.moveSpeed.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min={0.5}
                      max={2.5}
                      step={0.1}
                      value={settings.moveSpeed}
                      onChange={(e) => onUpdateSettings({ moveSpeed: Number(e.target.value) })}
                      className="w-full accent-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Giới hạn di chuyển cùng lúc: {settings.maxConcurrentMoving} người
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={40}
                      step={1}
                      value={settings.maxConcurrentMoving}
                      onChange={(e) =>
                        onUpdateSettings({ maxConcurrentMoving: Number(e.target.value) })
                      }
                      className="w-full accent-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Thời gian ngồi thiền: {settings.meditateDurationSec} giây
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={45}
                      step={1}
                      value={settings.meditateDurationSec}
                      onChange={(e) =>
                        onUpdateSettings({ meditateDurationSec: Number(e.target.value) })
                      }
                      className="w-full accent-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Thời gian múa võ / quyền: {settings.martialDurationSec} giây
                    </label>
                    <input
                      type="range"
                      min={3}
                      max={25}
                      step={1}
                      value={settings.martialDurationSec}
                      onChange={(e) =>
                        onUpdateSettings({ martialDurationSec: Number(e.target.value) })
                      }
                      className="w-full accent-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Viewer Command Tester (Thử Lệnh Bình Luận Khán Giả) */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                    <span>💬</span>
                    <span>Thử Bình Luận Khán Giả Điều Khiển Nhân Vật</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">Bấm để giả lập 1 đệ tử bình luận</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Đi bộ', cmd: 'đi' },
                    { label: 'Chạy nhanh', cmd: 'chạy' },
                    { label: 'Múa võ', cmd: 'múa' },
                    { label: 'Đấm quyền', cmd: 'đấm' },
                    { label: 'Đá cước', cmd: 'đá' },
                    { label: 'Nhảy cao', cmd: 'nhảy' },
                    { label: 'Né đòn', cmd: 'né' },
                    { label: 'Ngồi thiền', cmd: 'thiền' },
                    { label: 'Đứng dậy', cmd: 'đứng' },
                    { label: 'Bái chào', cmd: 'chào' },
                    { label: 'Cười lớn', cmd: 'cười' },
                    { label: 'Trượt chân', cmd: 'ngã' },
                  ].map((btn) => (
                    <button
                      key={btn.cmd}
                      onClick={() => {
                        const snap = maGiaoGameManager.getSnapshot();
                        if (snap.participants.length === 0) {
                          maGiaoGameManager.simulateRecruit();
                        }
                        const p =
                          snap.participants[
                            Math.floor(Math.random() * snap.participants.length)
                          ] || snap.participants[0];
                        if (p) {
                          maGiaoGameManager.handleComment({
                            userId: p.userId,
                            username: p.username,
                            nickname: p.nickname,
                            comment: btn.cmd,
                            isDemo: true,
                          });
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-black/60 hover:bg-red-950 border border-white/15 text-slate-200 hover:text-white font-medium text-xs transition-colors"
                    >
                      "{btn.cmd}" ({btn.label})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: SIMULATION / DEMO */}
          {activeTab === 'SIMULATION' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <h3 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  <span>Mô Phỏng Người Chơi & Bình Luận</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => maGiaoGameManager.simulateRecruit()}
                    className="px-3 py-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/60 font-semibold text-white transition-colors"
                  >
                    + Thêm 1 Đồ Đệ Mới
                  </button>

                  <button
                    onClick={() => {
                      for (let i = 0; i < 5; i++) {
                        setTimeout(() => maGiaoGameManager.simulateRecruit(), i * 300);
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/60 font-semibold text-white transition-colors"
                  >
                    + Thêm 5 Đồ Đệ Liền
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.clearParticipants()}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 font-semibold text-rose-300 transition-colors"
                  >
                    Dọn Trống Sảnh
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <h3 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4" />
                  <span>Mô Phỏng Quà Tặng & Thăng Chức</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => maGiaoGameManager.simulateGift(1, 'Hoa Hồng (1 xu)')}
                    className="px-3 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 font-semibold text-cyan-200 transition-colors"
                  >
                    🌹 Hoa Hồng (1 xu)
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.simulateGift(10, 'Bánh Quy (10 xu)')}
                    className="px-3 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700 font-semibold text-purple-200 transition-colors"
                  >
                    🍪 Sư Huynh (10 xu)
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.simulateGift(50, 'Khiên Bạc (50 xu)')}
                    className="px-3 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 font-semibold text-rose-200 transition-colors"
                  >
                    🛡️ Hộ Pháp (50 xu)
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.simulateGift(199, 'Vương Miện (199 xu)')}
                    className="px-3 py-2 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500 font-bold text-amber-200 transition-colors"
                  >
                    👑 Đồng Tôn (199 xu)
                  </button>
                </div>

                <div className="mt-2">
                  <button
                    onClick={() => maGiaoGameManager.simulateGift(500, 'Sư Tử Vàng (500 xu)')}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border border-amber-300 font-black text-white text-sm shadow-lg transition-transform hover:scale-[1.01]"
                  >
                    🐉 TÂN GIÁO CHỦ ĐĂNG QUANG (500 xu / Quà Tối Cao)
                  </button>
                </div>
              </div>

              {/* Minigame Quick Trigger */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <h3 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                  <Swords className="w-4 h-4" />
                  <span>Kích Hoạt Luyện Võ Thủ Công</span>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => maGiaoGameManager.startTrainingMinigame('MA_QUYEN_LOAN_VU')}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-red-800 font-semibold text-white border border-white/10 transition-colors"
                  >
                    Màn 1: Ma Quyền
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.startTrainingMinigame('MA_ANH_THAN_PHAP')}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-red-800 font-semibold text-white border border-white/10 transition-colors"
                  >
                    Màn 2: Ma Ảnh
                  </button>

                  <button
                    onClick={() => maGiaoGameManager.startTrainingMinigame('TAM_KHI_MA_TRAN')}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-red-800 font-semibold text-white border border-white/10 transition-colors"
                  >
                    Màn 3: Tam Khí
                  </button>
                </div>

                {currentScene === 'TRAINING_ARENA' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => maGiaoGameManager.simulateMinigameAction()}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-colors"
                    >
                      Mô Phỏng 70% Đồ Đệ Thực Hiện Đúng
                    </button>
                    <button
                      onClick={() => maGiaoGameManager.returnToGrandPalace()}
                      className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 font-semibold text-white transition-colors"
                    >
                      Về Đại Điện Ngay
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MINIGAMES CONFIG */}
          {activeTab === 'MINIGAMES' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <h3 className="font-bold text-amber-300 text-sm">Chu Kỳ & Thời Lượng Luyện Võ</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Chu kỳ đổi cảnh sảnh ↔ sân tập (giây):
                    </label>
                    <input
                      type="number"
                      min={60}
                      max={360}
                      value={settings.trainingIntervalSec}
                      onChange={(e) =>
                        onUpdateSettings({ trainingIntervalSec: Number(e.target.value) || 160 })
                      }
                      className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/20 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400">
                      Mặc định: 150–180s tự động chuyển sang sân tập
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Thời lượng mỗi màn luyện võ (giây):
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={120}
                      value={settings.trainingDurationSec}
                      onChange={(e) =>
                        onUpdateSettings({ trainingDurationSec: Number(e.target.value) || 50 })
                      }
                      className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/20 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400">
                      Mặc định: 45–60s mỗi màn
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Tỷ lệ hoàn thành để THẮNG (%):
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={settings.winPercentThreshold}
                      onChange={(e) =>
                        onUpdateSettings({ winPercentThreshold: Number(e.target.value) || 60 })
                      }
                      className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/20 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400">
                      Mặc định: 60% đồ đệ đạt yêu cầu
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Số người tối đa bị phạt quét sân:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={settings.maxSweepers}
                      onChange={(e) =>
                        onUpdateSettings({ maxSweepers: Number(e.target.value) || 5 })
                      }
                      className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/20 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400">
                      Mặc định: tối đa 5 người
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoTrainingEnabled}
                      onChange={(e) => onUpdateSettings({ autoTrainingEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-red-600 focus:ring-0"
                    />
                    <span className="font-semibold text-slate-200">
                      Bật chế độ tự động chuyển cảnh định kỳ
                    </span>
                  </label>
                </div>
              </div>

              {/* Individual minigames toggle */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <h3 className="font-bold text-amber-300 text-sm">Bật / Tắt Từng Màn Luyện Võ</h3>
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enabledMinigames.maQuyen}
                      onChange={(e) =>
                        onUpdateSettings({
                          enabledMinigames: {
                            ...settings.enabledMinigames,
                            maQuyen: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded text-red-600"
                    />
                    <span className="text-slate-200">Màn 1: Ma Quyền Loạn Vũ (Bình luận "MÚA")</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enabledMinigames.maAnh}
                      onChange={(e) =>
                        onUpdateSettings({
                          enabledMinigames: {
                            ...settings.enabledMinigames,
                            maAnh: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded text-red-600"
                    />
                    <span className="text-slate-200">
                      Màn 2: Ma Ảnh Thân Pháp (Bình luận "TRÁI" / "PHẢI" / "NHẢY")
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enabledMinigames.tamKhi}
                      onChange={(e) =>
                        onUpdateSettings({
                          enabledMinigames: {
                            ...settings.enabledMinigames,
                            tamKhi: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded text-red-600"
                    />
                    <span className="text-slate-200">
                      Màn 3: Tam Khí Ma Trận (Khắc chế LỬA - BĂNG - GIÓ)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RANKS */}
          {activeTab === 'RANKS' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-amber-300 mb-2 text-sm">
                  Hệ Thống 9 Cấp Bậc Ma Giáo
                </h3>
                <div className="space-y-1.5">
                  {(Object.keys(MA_GIAO_RANKS) as MaGiaoRankId[]).map((rId) => {
                    const r = MA_GIAO_RANKS[rId];
                    return (
                      <div
                        key={rId}
                        className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{r.badge}</span>
                          <div>
                            <span className="font-bold" style={{ color: r.titleColor }}>
                              {r.title}
                            </span>
                            <div className="text-[10px] text-slate-400">{r.roleDescription}</div>
                          </div>
                        </div>
                        <span className="font-mono text-amber-300 font-bold">{r.minCoins} xu</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VOICE */}
          {activeTab === 'VOICE' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <h3 className="font-bold text-amber-300 text-sm">Cấu Hình Giọng Đọc Giáo Chủ</h3>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Nhà cung cấp giọng đọc (TTS Provider):
                  </label>
                  <select
                    value={settings.voiceProvider}
                    onChange={(e) =>
                      onUpdateSettings({
                        voiceProvider: e.target.value as 'vienieu' | 'azure' | 'browser',
                      })
                    }
                    className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/20 text-white"
                  >
                    <option value="browser">Trình duyệt Web (Mặc định - Nam trầm tiếng Việt)</option>
                    <option value="vienieu">VieNeu TTS AI (Máy chủ proxy)</option>
                    <option value="azure">Microsoft Azure Speech (Nam trầm Nam Bộ/Bắc Bộ)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Tốc độ nói: {settings.speechSpeed}x
                    </label>
                    <input
                      type="range"
                      min={0.7}
                      max={1.4}
                      step={0.05}
                      value={settings.speechSpeed}
                      onChange={(e) =>
                        onUpdateSettings({ speechSpeed: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Âm lượng: {Math.round(settings.speechVolume * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1.0}
                      step={0.05}
                      value={settings.speechVolume}
                      onChange={(e) =>
                        onUpdateSettings({ speechVolume: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.audioEnabled}
                      onChange={(e) => onUpdateSettings({ audioEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-red-600"
                    />
                    <span className="font-semibold text-slate-200">
                      Bật âm thanh giọng đọc & hiệu ứng võ công
                    </span>
                  </label>
                </div>
              </div>

              {/* Direct voice tester */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <h3 className="font-bold text-amber-300 text-sm">Thử Giọng Đọc Giáo Chủ</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testLine}
                    placeholder="Nhập câu thoại thử giọng..."
                    onChange={(e) => setTestLine(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded bg-black/60 border border-white/20 text-white"
                  />
                  <button
                    onClick={() => {
                      const textToSay =
                        testLine.trim() ||
                        SILLY_EVIL_BOASTS[Math.floor(Math.random() * SILLY_EVIL_BOASTS.length)];
                      maGiaoVoiceManager.enqueue({
                        text: textToSay,
                        priority: 99,
                        mood: 'ARROGANT',
                      });
                    }}
                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 font-bold text-white transition-colors"
                  >
                    Phát Thử
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <h3 className="font-bold text-amber-300 text-sm">Thông Số Đại Điện</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Số đồ đệ tối đa trong sảnh:
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={80}
                      value={settings.maxParticipants}
                      onChange={(e) =>
                        onUpdateSettings({ maxParticipants: Number(e.target.value) || 80 })
                      }
                      className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/20 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400">
                      Mặc định: 80 vị trí cân đối 2 cánh
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Thời gian rời sảnh khi im lặng (giây):
                    </label>
                    <input
                      type="number"
                      min={60}
                      max={900}
                      value={settings.inactivityTimeoutSec}
                      onChange={(e) =>
                        onUpdateSettings({ inactivityTimeoutSec: Number(e.target.value) || 300 })
                      }
                      className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/20 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400">
                      Mặc định: 300 giây (5 phút)
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.obsCleanView}
                      onChange={(e) => onUpdateSettings({ obsCleanView: e.target.checked })}
                      className="w-4 h-4 rounded text-red-600"
                    />
                    <span className="font-semibold text-slate-200">
                      Chế độ OBS Clean View (ẩn thanh công cụ và nút quản trị trên luồng phát)
                    </span>
                  </label>
                </div>
              </div>

              {/* OBS Integration link */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <h3 className="font-bold text-amber-300 text-sm">Đường Dẫn Nguồn OBS Studio</h3>
                <p className="text-slate-300 text-[11px]">
                  Thêm nguồn Trình duyệt (Browser Source) trong OBS với kích thước 1080x1920:
                </p>
                <div className="px-3 py-2 rounded bg-black/80 font-mono text-cyan-300 border border-white/10 select-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}?game=magiao&obs=1` : '?game=magiao&obs=1'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-black/60 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            MA GIÁO ONLINE · Hệ thống tự động đồng bộ thời gian thực
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 font-bold text-white text-xs transition-colors"
          >
            Đóng Bảng Quản Trị
          </button>
        </div>
      </div>
    </div>
  );
};
