/**
 * MA GIÁO ONLINE - ADMIN CONTROL PANEL (/admincp)
 * Comprehensive, production-grade 20-category administrator dashboard
 * Inherited from Chùa Online 2 architecture, fully adapted for Ma Giáo Online.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code,
  Copy,
  Crown,
  Database,
  Download,
  Eye,
  FileText,
  Flame,
  Gift,
  Grid,
  Heart,
  HelpCircle,
  Laptop,
  Layers,
  Layout,
  Lock,
  LogOut,
  Maximize2,
  MessageSquare,
  Mic,
  Monitor,
  Palette,
  Play,
  PlayCircle,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  Square,
  Swords,
  Trash2,
  Tv,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import {
  CultLeaderAnimId,
  LeaderMood,
  LeaderPersonality,
  MaGiaoAction,
  MaGiaoParticipant,
  MaGiaoRankId,
  MaGiaoSettings,
  MA_GIAO_RANKS,
} from '../../../types/magiao';
import {
  MaGiaoFullAdminConfig,
  DEFAULT_MA_GIAO_FULL_CONFIG,
  MaGiaoGiftDefinition,
  MaGiaoKeywordDefinition,
} from '../../../../server/maGiaoStore';
import { maGiaoGameManager } from '../../../systems/MaGiaoGameManager';
import { maGiaoVoiceManager } from '../../../systems/MaGiaoVoiceManager';
import { liveConnectionManager } from '../../../systems/LiveConnectionManager';
import { LEADER_ANIM_REGISTRY } from '../../../systems/SectLeaderAnimationController';

export type AdminCategory =
  | 'overview'
  | 'live_control'
  | 'leader_management'
  | 'leader_animations'
  | 'disciples_management'
  | 'ranks_management'
  | 'gifts_management'
  | 'comments_keywords'
  | 'dialogue_bank'
  | 'tts_voice'
  | 'hall_background'
  | 'disciple_animations'
  | 'minigames'
  | 'transitions'
  | 'banners_leaderboard'
  | 'layout_css'
  | 'obs_streaming'
  | 'demo_testing'
  | 'backend_security'
  | 'logs_diagnostics';

interface CategoryItem {
  id: AdminCategory;
  name: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'overview', name: '1. Tổng Quan Hệ Thống', icon: Activity, description: 'Trạng thái hoạt động, chỉ số thực và thông báo' },
  { id: 'live_control', name: '2. Điều Khiển LIVE', icon: Radio, description: 'Kết nối TikTok LIVE, đồng bộ phát sóng' },
  { id: 'leader_management', name: '3. Quản Lý Giáo Chủ', icon: Crown, description: 'Ngoại hình, tọa độ, tính cách và hiệu lệnh trực tiếp' },
  { id: 'leader_animations', name: '4. Hoạt Ảnh Giáo Chủ (35)', icon: Sparkles, description: 'Danh mục 35 hoạt ảnh võ công, hài hước, sinh hoạt' },
  { id: 'disciples_management', name: '5. Quản Lý Đồ Đệ', icon: Users, description: '80 vị trí, điều khiển từng đồ đệ, khoảng cách sảnh' },
  { id: 'ranks_management', name: '6. Cấp Bậc Ma Giáo', icon: Award, description: '9 cấp bậc từ Dân Đen đến Tân Giáo Chủ, quy tắc ngai' },
  { id: 'gifts_management', name: '7. Quản Lý Quà TikTok', icon: Gift, description: 'Cấu hình quà, mốc xu, hoạt ảnh và nhật ký quà lạ' },
  { id: 'comments_keywords', name: '8. Tương Tác Bình Luận', icon: MessageSquare, description: 'Từ khóa hành động, bong bóng bình luận, chống spam' },
  { id: 'dialogue_bank', name: '9. Lời Thoại Giáo Chủ', icon: FileText, description: 'Kho câu thoại 13 nhóm, biến động và nghe thử' },
  { id: 'tts_voice', name: '10. Giọng Đọc & TTS', icon: Mic, description: 'Azure Speech, VieNeu TTS và tinh chỉnh âm vực' },
  { id: 'hall_background', name: '11. Quản Lý Đại Điện', icon: Layers, description: 'Hình nền, khu vực đi lại, ánh sáng và tải ảnh mới' },
  { id: 'disciple_animations', name: '12. Hoạt Ảnh Nhân Vật', icon: PlayCircle, description: '15 cử động võ hiệp của đồ đệ và lệnh tập thể' },
  { id: 'minigames', name: '13. Mini Game Luyện Võ', icon: Swords, description: 'Ma Quyền, Ma Ảnh, Tam Khí và đày quét sân' },
  { id: 'transitions', name: '14. Cấu Hình Chuyển Cảnh', icon: Clock, description: 'Chu kỳ chuyển cảnh 150-180s, hiệu ứng mờ' },
  { id: 'banners_leaderboard', name: '15. Thông Báo & Xếp Hạng', icon: Bell, description: 'Vị trí bảng thăng cấp, danh sách Đại Trưởng Lão' },
  { id: 'layout_css', name: '16. Giao Diện & Layout', icon: Layout, description: 'Tỷ lệ 9:16, vùng an toàn TikTok, Custom CSS' },
  { id: 'obs_streaming', name: '17. OBS & Phát Sóng', icon: Tv, description: 'Đồng bộ WebSocket Chrome ↔ OBS, chế độ sạch' },
  { id: 'demo_testing', name: '18. Chế Độ Demo & Kiểm Thử', icon: Laptop, description: 'Mô phỏng 1-200 người, quà, thăng cấp, stress test' },
  { id: 'backend_security', name: '19. Cài Đặt Backend & API', icon: Database, description: 'Sao lưu/phục hồi JSON, mã bảo mật ADMIN' },
  { id: 'logs_diagnostics', name: '20. Nhật Ký & Chẩn Đoán', icon: Sliders, description: 'Theo dõi sự kiện thời gian thực, FPS và bộ nhớ' },
];

interface Props {
  onClose?: () => void;
  onSwitchToChuaOnline?: () => void;
}

export const MaGiaoAdminCp: React.FC<Props> = ({ onClose, onSwitchToChuaOnline }) => {
  const [activeCategory, setActiveCategory] = useState<AdminCategory>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [config, setConfig] = useState<MaGiaoFullAdminConfig>(DEFAULT_MA_GIAO_FULL_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('MAGIAO_ADMIN_TOKEN') || '' : '';
  });

  // Real-time live engine snapshot
  const [gameState, setGameState] = useState(() => maGiaoGameManager.getSnapshot());
  const [voiceState, setVoiceState] = useState({ isSpeaking: false, currentMood: 'ARROGANT', currentText: '' });
  const [connectionSnapshot, setConnectionSnapshot] = useState(() => liveConnectionManager.getSnapshot());
  const [eventLogs, setEventLogs] = useState<Array<{ id: string; time: string; type: string; desc: string }>>([]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return CATEGORIES;
    const q = searchQuery.toLowerCase();
    return CATEGORIES.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }, [searchQuery]);

  // Load authoritative config on mount & subscribe to Socket.IO events
  useEffect(() => {
    fetch('/api/magiao/config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok && data.config) {
          setConfig(data.config);
        }
      })
      .catch(() => {});

    const unsubConfig = liveConnectionManager.onMaGiaoConfig((serverConfig) => {
      if (serverConfig) setConfig(serverConfig);
    });

    const unsubGame = maGiaoGameManager.subscribe((snap) => {
      setGameState(snap);
    });

    const unsubVoice = maGiaoVoiceManager.subscribe((v) => {
      setVoiceState({ isSpeaking: v.isSpeaking, currentMood: v.currentMood, currentText: v.currentText });
    });

    const unsubStatus = liveConnectionManager.onStatus(setConnectionSnapshot);

    const unsubEvents = liveConnectionManager.onEvent((ev) => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setEventLogs((prev) => [
        {
          id: `${Date.now()}_${Math.random()}`,
          time: timeStr,
          type: ev.type.toUpperCase(),
          desc: ev.type === 'comment' ? `${ev.nickname}: ${ev.comment}` : `${ev.nickname} tặng ${ev.giftName} (${ev.diamondCount} xu)`,
        },
        ...prev.slice(0, 99),
      ]);
    });

    return () => {
      unsubConfig();
      unsubGame();
      unsubVoice();
      unsubStatus();
      unsubEvents();
    };
  }, []);

  // Save changes to backend server
  const handleSaveConfig = async (patch?: Partial<MaGiaoFullAdminConfig>) => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const payload = patch || config;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
        headers['x-admin-token'] = adminToken;
      }
      const res = await fetch('/api/magiao/config', {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.ok && data.config) {
        setConfig(data.config);
        // Also update local game manager settings
        if (data.config.settings) {
          maGiaoGameManager.saveSettings(data.config.settings);
        }
        setSaveStatus('Lưu thành công trên máy chủ!');
      } else {
        setSaveStatus(data?.error || 'Lỗi khi lưu cấu hình');
      }
    } catch (err: any) {
      setSaveStatus(err?.message || 'Không thể kết nối máy chủ backend');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  // Reset to default
  const handleResetDefaults = async () => {
    if (!window.confirm('Bạn có chắc muốn khôi phục toàn bộ 20 danh mục về mặc định không?')) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/magiao/config/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (data?.ok && data.config) {
        setConfig(data.config);
        maGiaoGameManager.saveSettings(data.config.settings);
        setSaveStatus('Đã khôi phục toàn bộ cấu hình mặc định!');
      }
    } catch {
      setSaveStatus('Lỗi khi khôi phục');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  // Helper to update deeply nested config in memory
  const updateField = (updater: (prev: MaGiaoFullAdminConfig) => MaGiaoFullAdminConfig) => {
    setConfig((prev) => {
      const updated = updater(prev);
      return updated;
    });
  };

  // Broadcast admin action
  const sendAdminAction = (action: any) => {
    liveConnectionManager.broadcastMaGiaoAction(action);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0609] text-slate-100 font-sans select-none overflow-hidden">
      {/* TOP HEADER BAR */}
      <header className="h-14 bg-[#14080e] border-b border-red-950 flex items-center justify-between px-4 shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-red-950 to-black border border-red-500/50">
            <span className="text-lg">🐉</span>
            <div>
              <span className="text-xs font-black tracking-wider text-amber-300 uppercase">MA GIÁO ONLINE</span>
              <span className="text-[10px] text-red-400 font-bold ml-1.5 px-1.5 py-0.2 rounded bg-red-950/80 border border-red-800">
                ADMIN CP v2.0
              </span>
            </div>
          </div>

          {/* Real-time Status Badges */}
          <div className="hidden md:flex items-center gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-emerald-500/30 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SERVER PORT 3000</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-amber-500/30 text-amber-300">
              <Users className="w-3.5 h-3.5" />
              <span>{gameState.participants.length}/80 Đồ Đệ</span>
            </div>
            {gameState.sweepers.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-rose-500/30 text-rose-300">
                <Trash2 className="w-3.5 h-3.5" />
                <span>{gameState.sweepers.length} Quét Sân</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-purple-500/30 text-purple-300">
              <span>CẢNH: {gameState.currentScene === 'GRAND_PALACE' ? 'ĐẠI ĐIỆN' : 'VÕ ĐÀI'}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span
              className={`text-xs px-2.5 py-1 rounded font-medium animate-fadeIn ${
                saveStatus.includes('thành công') ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-red-950 text-rose-300 border border-rose-600'
              }`}
            >
              {saveStatus}
            </span>
          )}

          <button
            onClick={() => handleSaveConfig()}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-600 hover:to-green-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Đang Lưu...' : 'Lưu Thay Đổi'}</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-red-950 border border-red-800 text-red-300 text-xs font-semibold cursor-pointer transition-colors"
            title="Khôi phục mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mặc Định</span>
          </button>

          {onSwitchToChuaOnline && (
            <button
              onClick={onSwitchToChuaOnline}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-600/50 text-amber-300 text-xs font-semibold cursor-pointer"
            >
              <span>🪷</span>
              <span className="hidden sm:inline">Chùa Online 2</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 cursor-pointer transition-colors"
              title="Đóng trang quản trị"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER: LEFT SIDEBAR (20 CATEGORIES) + RIGHT CONTENT PANEL */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-72 bg-[#10070b] border-r border-red-950 flex flex-col shrink-0">
          {/* Search Category */}
          <div className="p-2.5 border-b border-red-950/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm danh mục (1-20)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded bg-black/60 border border-red-950 focus:border-red-600 text-xs text-slate-200 placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          {/* Categories List */}
          <nav className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-red-950 to-rose-950 border border-red-500/60 text-amber-300 font-bold shadow-md'
                      : 'text-slate-300 hover:bg-white/5 hover:text-slate-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-red-400'}`} />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </nav>

          {/* Quick Stats Footer */}
          <div className="p-2.5 border-t border-red-950 bg-black/40 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Phiên bản: 2.0.0-PRO</span>
            <span>Bảo mật: {adminToken ? 'Đã gán Token' : 'Cục bộ'}</span>
          </div>
        </aside>

        {/* RIGHT CONTENT PANEL (EACH CATEGORY) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-[#0e060a] to-[#070305] custom-scrollbar">
          {activeCategory === 'overview' && (
            <OverviewCategoryPanel
              config={config}
              gameState={gameState}
              connectionSnapshot={connectionSnapshot}
              voiceState={voiceState}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'live_control' && (
            <LiveControlPanel
              config={config}
              connectionSnapshot={connectionSnapshot}
              onUpdateConfig={(patch) => updateField((p) => ({ ...p, live: { ...p.live, ...patch } }))}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'leader_management' && (
            <LeaderManagementPanel
              config={config}
              gameState={gameState}
              onUpdateProfile={(patch) => updateField((p) => ({ ...p, leaderProfile: { ...p.leaderProfile, ...patch } }))}
              onUpdateSettings={(patch) => updateField((p) => ({ ...p, settings: { ...p.settings, ...patch } }))}
              onTriggerAction={sendAdminAction}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'leader_animations' && (
            <LeaderAnimations35Panel
              config={config}
              onUpdateConfig={(disabledAnims) => updateField((p) => ({ ...p, settings: { ...p.settings, disabledLeaderAnims: disabledAnims } }))}
              onTriggerAnim={(animId, priority) => sendAdminAction({ type: 'triggerLeaderAnim', animId, priority: priority || 100 })}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'disciples_management' && (
            <DisciplesManagementPanel
              config={config}
              gameState={gameState}
              onUpdateSettings={(patch) => updateField((p) => ({ ...p, settings: { ...p.settings, ...patch } }))}
              onTriggerAction={sendAdminAction}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'ranks_management' && (
            <RanksManagementPanel
              config={config}
              onUpdateRanks={(ranks) => updateField((p) => ({ ...p, ranks }))}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'gifts_management' && (
            <GiftsManagementPanel
              config={config}
              onUpdateGifts={(gifts) => updateField((p) => ({ ...p, gifts }))}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'comments_keywords' && (
            <CommentsKeywordsPanel
              config={config}
              onUpdateKeywords={(keywords) => updateField((p) => ({ ...p, keywords }))}
              onUpdateCommentSettings={(patch) => updateField((p) => ({ ...p, commentSettings: { ...p.commentSettings, ...patch } }))}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'dialogue_bank' && (
            <DialogueBankPanel
              config={config}
              onUpdateDialogues={(dialogues) => updateField((p) => ({ ...p, dialogues }))}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'tts_voice' && (
            <TtsVoicePanel
              config={config}
              onUpdateTts={(patch) => updateField((p) => ({ ...p, tts: { ...p.tts, ...patch } }))}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'hall_background' && (
            <HallBackgroundPanel
              config={config}
              onUpdateBackgrounds={(bgs, activeId) => updateField((p) => ({ ...p, backgrounds: bgs, activeBackgroundId: activeId }))}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'disciple_animations' && (
            <DiscipleAnimationsPanel
              config={config}
              onUpdateSettings={(patch) => updateField((p) => ({ ...p, settings: { ...p.settings, ...patch } }))}
              onTriggerAction={sendAdminAction}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'minigames' && (
            <MinigamesPanel
              config={config}
              gameState={gameState}
              onUpdateMinigames={(patch) => updateField((p) => ({ ...p, minigames: { ...p.minigames, ...patch } }))}
              onTriggerAction={sendAdminAction}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'transitions' && (
            <TransitionsPanel
              config={config}
              onUpdateTransitions={(patch) => updateField((p) => ({ ...p, transitions: { ...p.transitions, ...patch } }))}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'banners_leaderboard' && (
            <BannersLeaderboardPanel
              config={config}
              onUpdateBanners={(banners) => updateField((p) => ({ ...p, banners }))}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'layout_css' && (
            <LayoutCssPanel
              config={config}
              onUpdateLayout={(patch) => updateField((p) => ({ ...p, layout: { ...p.layout, ...patch } }))}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'obs_streaming' && (
            <ObsStreamingPanel
              config={config}
              onUpdateObs={(patch) => updateField((p) => ({ ...p, obsSync: { ...p.obsSync, ...patch } }))}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'demo_testing' && (
            <DemoTestingPanel
              config={config}
              onTriggerAction={sendAdminAction}
            />
          )}

          {activeCategory === 'backend_security' && (
            <BackendSecurityPanel
              config={config}
              adminToken={adminToken}
              onSetAdminToken={(token) => {
                setAdminToken(token);
                localStorage.setItem('MAGIAO_ADMIN_TOKEN', token);
              }}
              onSave={handleSaveConfig}
            />
          )}

          {activeCategory === 'logs_diagnostics' && (
            <LogsDiagnosticsPanel
              logs={eventLogs}
              onClear={() => setEventLogs([])}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// ============================================================================
// 1. TỔNG QUAN HỆ THỐNG
// ============================================================================
function OverviewCategoryPanel({
  config,
  gameState,
  connectionSnapshot,
  voiceState,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  gameState: any;
  connectionSnapshot: any;
  voiceState: any;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-red-950 pb-3">
        <div>
          <h2 className="text-lg font-black text-amber-300">1. TỔNG QUAN HỆ THỐNG &amp; THÔNG SỐ THỜI GIAN THỰC</h2>
          <p className="text-xs text-slate-400">Giám sát toàn diện tình trạng game engine, kết nối LIVE và hàng đợi</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/60 hover:bg-white/10 border border-white/20 text-xs text-slate-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm Mới</span>
        </button>
      </div>

      {/* Grid of Real-Time Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>TRẠNG THÁI SERVER</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-300">Đang Chạy (Cổng 3000)</div>
          <div className="text-[10px] text-slate-400 mt-1">Node.js + Express + WebSocket</div>
        </div>

        <div className="p-3 rounded-xl bg-black/60 border border-red-500/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>TIKTOK LIVE</span>
            <Radio className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-base font-bold text-amber-300">
            {connectionSnapshot.status === 'connected' ? 'ĐÃ KẾT NỐI' : 'CHẾ ĐỘ DEMO'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">User: {connectionSnapshot.tiktokUsername || 'Chưa nhập'}</div>
        </div>

        <div className="p-3 rounded-xl bg-black/60 border border-amber-500/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>SỐ ĐỒ ĐỆ TRONG SẢNH</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-300">{gameState.participants.length} / 80</div>
          <div className="text-[10px] text-slate-400 mt-1">Bồ đoàn kín: {Math.round((gameState.participants.length / 80) * 100)}%</div>
        </div>

        <div className="p-3 rounded-xl bg-black/60 border border-rose-500/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>KHU QUÉT SÂN</span>
            <Trash2 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-base font-bold text-rose-300">{gameState.sweepers.length} Người</div>
          <div className="text-[10px] text-slate-400 mt-1">Đày tạ tội sau khi thua mini game</div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-black/50 border border-red-950">
          <h3 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" />
            <span>Chức Danh Ngai Vàng</span>
          </h3>
          <div className="text-xs text-slate-300 space-y-1">
            <div>Giáo Chủ Chính: <span className="text-amber-300 font-bold">{gameState.throneLeader?.nickname || 'Giáo Chủ NPC'}</span></div>
            <div>Đồng Tôn / Thái Thượng: <span className="text-rose-300 font-semibold">{gameState.coLeader?.nickname || 'Trống'}</span></div>
            <div>Tổng Sự Kiện Quà: <span className="font-bold text-emerald-300">{gameState.totalGiftsRecorded}</span></div>
            <div>Tổng Bình Luận: <span className="font-bold text-cyan-300">{gameState.totalCommentsRecorded}</span></div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/50 border border-red-950">
          <h3 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5" />
            <span>Màn Mini Game Hiện Tại</span>
          </h3>
          <div className="text-xs text-slate-300 space-y-1">
            <div>Trận Đấu: <span className="text-amber-300 font-bold">{gameState.trainingState.activeMinigame}</span></div>
            <div>Trạng Thái: <span className="text-yellow-300">{gameState.trainingState.status}</span></div>
            <div>Thời Gian Còn: <span className="text-emerald-300 font-bold">{gameState.trainingState.timeRemainingSec}s</span></div>
            <div>Đã Hoàn Thành: <span className="text-cyan-300 font-bold">{gameState.trainingState.participantsDone.length}</span> người</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/50 border border-red-950">
          <h3 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5" />
            <span>Hàng Đợi Giọng Đọc TTS</span>
          </h3>
          <div className="text-xs text-slate-300 space-y-1">
            <div>Đang Đọc: <span className={voiceState.isSpeaking ? 'text-emerald-300 font-bold' : 'text-slate-500'}>{voiceState.isSpeaking ? 'CÓ' : 'KHÔNG'}</span></div>
            <div>Tâm Trạng: <span className="text-purple-300 font-semibold">{voiceState.currentMood}</span></div>
            <div className="truncate">Nội Dung: <span className="text-slate-200 italic">"{voiceState.currentText || 'Sảnh đường yên tĩnh'}"</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. ĐIỀU KHIỂN LIVE
// ============================================================================
function LiveControlPanel({
  config,
  connectionSnapshot,
  onUpdateConfig,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  connectionSnapshot: any;
  onUpdateConfig: (patch: any) => void;
  onSave: () => void;
}) {
  const [usernameInput, setUsernameInput] = useState(config.live.autoConnectUsername || '');
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (!usernameInput.trim()) {
      alert('Vui lòng nhập tên tài khoản TikTok LIVE!');
      return;
    }
    setConnecting(true);
    try {
      await liveConnectionManager.connectTikTok(usernameInput.trim());
      onUpdateConfig({ autoConnectUsername: usernameInput.trim() });
    } catch (err: any) {
      alert(`Lỗi kết nối: ${err?.message}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setConnecting(true);
    try {
      await liveConnectionManager.disconnectTikTok(true);
    } catch (err: any) {
      alert(`Lỗi: ${err?.message}`);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-red-950 pb-3">
        <h2 className="text-lg font-black text-amber-300">2. ĐIỀU KHIỂN KẾT NỐI TIKTOK LIVE</h2>
        <p className="text-xs text-slate-400">Kết nối trực tiếp phiên phát sóng thực qua TikTok-Live-Connector hoặc Webhook</p>
      </div>

      <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">TÊN TÀI KHOẢN TIKTOK (USERNAME)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="VD: @magiao_online hoặc tên kênh LIVE"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded bg-black/80 border border-red-950 focus:border-red-600 text-xs text-amber-300 font-medium outline-none"
            />
            {connectionSnapshot.status === 'connected' ? (
              <button
                onClick={handleDisconnect}
                disabled={connecting}
                className="px-4 py-2 rounded bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 text-xs font-bold cursor-pointer"
              >
                {connecting ? 'Đang Ngắt...' : 'Ngắt Kết Nối'}
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="px-4 py-2 rounded bg-emerald-900 hover:bg-emerald-800 border border-emerald-600 text-emerald-200 text-xs font-bold cursor-pointer"
              >
                {connecting ? 'Đang Kết Nối...' : 'Bắt Đầu Kết Nối LIVE'}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.live.autoReconnect}
              onChange={(e) => onUpdateConfig({ autoReconnect: e.target.checked })}
              className="accent-red-600 rounded"
            />
            <span>Tự Động Kết Nối Lại Khi Mất Tín Hiệu</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. QUẢN LÝ GIÁO CHỦ
// ============================================================================
function LeaderManagementPanel({
  config,
  gameState,
  onUpdateProfile,
  onUpdateSettings,
  onTriggerAction,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  gameState: any;
  onUpdateProfile: (patch: any) => void;
  onUpdateSettings: (patch: any) => void;
  onTriggerAction: (action: any) => void;
  onSave: () => void;
}) {
  const profile = config.leaderProfile;
  const settings = config.settings;

  const DIRECT_ACTIONS = [
    { id: 'throne_idle', label: 'Ngồi Uy Nghiêm', icon: Crown },
    { id: 'stand_from_throne', label: 'Đứng Dậy', icon: UserCheck },
    { id: 'walk_down_steps', label: 'Bước Xuống Bậc', icon: ChevronRight },
    { id: 'patrol_hall', label: 'Đi Tuần Đại Điện', icon: Users },
    { id: 'evil_laugh', label: 'Cười Lớn Tà Ác', icon: Sparkles },
    { id: 'drink_tea', label: 'Thưởng Trà Ma Đạo', icon: CoffeeIcon },
    { id: 'fan_self', label: 'Phẩy Quạt Kiêu Ngạo', icon: WindIcon },
    { id: 'gather_inner_power', label: 'Tụ Khí Đan Điền', icon: Zap },
    { id: 'martial_arts_combo', label: 'Múa Võ Liên Hoàn', icon: Swords },
    { id: 'lightness_skill', label: 'Khinh Công Đạp Không', icon: Flame },
    { id: 'return_to_throne', label: 'Quay Về Ngai Vàng', icon: RotateCcw },
    { id: 'promote_disciple', label: 'Phong Chức Đồ Đệ', icon: Award },
    { id: 'transfer_throne', label: 'Chuyển Giao Ngai', icon: Crown },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-red-950 pb-3">
        <h2 className="text-lg font-black text-amber-300">3. QUẢN LÝ GIÁO CHỦ &amp; HIỆU LỆNH TRỰC TIẾP</h2>
        <p className="text-xs text-slate-400">Tùy biến nhân vật Giáo Chủ 2D, tọa độ, tính cách và kích hoạt hành động tức thì</p>
      </div>

      {/* Direct Execution Toolbar */}
      <div className="p-4 rounded-xl bg-black/60 border border-red-950">
        <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-2.5">
          HIỆU LỆNH HÀNH ĐỘNG TRỰC TIẾP (KÍCH HOẠT VÀO GAME NGAY)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {DIRECT_ACTIONS.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => onTriggerAction({ type: 'triggerLeaderAnim', animId: act.id, priority: 100 })}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-xs font-semibold text-amber-200 cursor-pointer shadow hover:border-red-500 transition-all text-left"
              >
                <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Identity & Personality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-3">
          <h3 className="text-xs font-black text-slate-300 uppercase">Thông Tin Danh Xưng</h3>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">TÊN GIÁO CHỦ</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onUpdateProfile({ name: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-black/80 border border-red-950 text-xs text-amber-300 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">DANH HIỆU THIÊN HẠ</label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => onUpdateProfile({ title: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-black/80 border border-red-950 text-xs text-amber-300 outline-none"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-3">
          <h3 className="text-xs font-black text-slate-300 uppercase">Tính Cách Giáo Chủ</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['DOMINANT', 'COMEDIC', 'MARTIAL_MANIAC'] as LeaderPersonality[]).map((p) => {
              const selected = settings.leaderPersonality === p;
              return (
                <button
                  key={p}
                  onClick={() => onUpdateSettings({ leaderPersonality: p })}
                  className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
                    selected ? 'bg-red-950 border-red-500 text-amber-300 shadow-md' : 'bg-black/40 border-red-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p === 'DOMINANT' ? 'Bá Chủ' : p === 'COMEDIC' ? 'Hài Hước' : 'Cuồng Võ'}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 italic">
            {settings.leaderPersonality === 'DOMINANT' && 'Uy nghiêm, kiêu ngạo, đi tuần giữa đại điện, phẩy quạt.'}
            {settings.leaderPersonality === 'COMEDIC' && 'Uống trà, ngủ gật, cười lớn, vấp vạt áo, tụt khí.'}
            {settings.leaderPersonality === 'MARTIAL_MANIAC' && 'Đam mê múa võ, tụ khí, phóng chưởng, gọi Ma Long.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Icons for direct actions
function CoffeeIcon(props: any) {
  return <Sparkles {...props} />;
}
function WindIcon(props: any) {
  return <Flame {...props} />;
}

// ============================================================================
// 4. DANH MỤC 35 HOẠT ẢNH GIÁO CHỦ
// ============================================================================
function LeaderAnimations35Panel({
  config,
  onUpdateConfig,
  onTriggerAnim,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  onUpdateConfig: (disabled: CultLeaderAnimId[]) => void;
  onTriggerAnim: (animId: CultLeaderAnimId, priority?: number) => void;
  onSave: () => void;
}) {
  const disabledSet = new Set(config.settings.disabledLeaderAnims || []);

  const toggleAnim = (id: CultLeaderAnimId) => {
    const next = new Set(disabledSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onUpdateConfig(Array.from(next));
  };

  const animList = Object.values(LEADER_ANIM_REGISTRY);

  return (
    <div className="space-y-6">
      <div className="border-b border-red-950 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-amber-300">4. DANH MỤC 35 HOẠT ẢNH GIÁO CHỦ</h2>
          <p className="text-xs text-slate-400">Kiểm tra, xem trước và bật/tắt toàn bộ 35 hoạt ảnh võ thuật &amp; biểu cảm</p>
        </div>
        <div className="text-xs text-slate-400">
          Đang bật: <span className="font-bold text-emerald-400">{35 - disabledSet.size} / 35</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {animList.map((anim, idx) => {
          const isEnabled = !disabledSet.has(anim.id);
          return (
            <div
              key={anim.id}
              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                isEnabled ? 'bg-black/60 border-red-950 text-slate-200' : 'bg-black/30 border-red-950/40 text-slate-500 opacity-60'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-200">
                  <span className="text-[10px] text-red-400">#{idx + 1}</span>
                  <span className="truncate">{anim.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">{anim.id}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Thời lượng: {anim.defaultDurationMs}ms · Nhóm: {anim.group}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onTriggerAnim(anim.id, 100)}
                  className="px-2 py-1 rounded bg-red-950 hover:bg-red-900 border border-red-800 text-amber-300 text-[10px] font-bold cursor-pointer"
                  title="Xem trước hoạt ảnh trong game"
                >
                  Thử
                </button>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => toggleAnim(anim.id)}
                  className="accent-red-600 rounded cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 5. QUẢN LÝ ĐỒ ĐỆ
// ============================================================================
function DisciplesManagementPanel({
  config,
  gameState,
  onUpdateSettings,
  onTriggerAction,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  gameState: any;
  onUpdateSettings: (patch: any) => void;
  onTriggerAction: (action: any) => void;
  onSave: () => void;
}) {
  const participants = gameState.participants as MaGiaoParticipant[];

  return (
    <div className="space-y-6">
      <div className="border-b border-red-950 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-amber-300">5. QUẢN LÝ ĐỒ ĐỆ &amp; BẢNG DANH SÁCH ONLINE</h2>
          <p className="text-xs text-slate-400">Cấu hình 80 vị trí bồ đoàn và điều khiển từng nhân vật người chơi</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerAction({ type: 'orderFormation' })}
            className="px-2.5 py-1 rounded bg-red-950 border border-red-800 text-amber-300 text-xs font-semibold cursor-pointer"
          >
            Về Vị Trí Bồ Đoàn
          </button>
          <button
            onClick={() => onTriggerAction({ type: 'clearParticipants' })}
            className="px-2.5 py-1 rounded bg-black/60 border border-white/20 text-rose-300 text-xs font-semibold cursor-pointer"
          >
            Xóa Danh Sách
          </button>
        </div>
      </div>

      {/* Online Disciples Table */}
      <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-3">
        <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
          DANH SÁCH ĐỒ ĐỆ ĐANG ONLINE ({participants.length}/80)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-red-950 text-slate-400 text-[11px]">
                <th className="py-2 px-2">Vị Trí</th>
                <th className="py-2 px-2">Tên TikTok</th>
                <th className="py-2 px-2">Chức Danh</th>
                <th className="py-2 px-2">Tổng Xu</th>
                <th className="py-2 px-2">Hành Động</th>
                <th className="py-2 px-2 text-right">Lệnh Trực Tiếp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950/60">
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500 italic">
                    Chưa có đồ đệ nào trong sảnh. Hãy thử bình luận hoặc dùng tab Demo để thêm!
                  </td>
                </tr>
              ) : (
                participants.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-white/5">
                    <td className="py-2 px-2 font-mono text-slate-400">#{p.seatIndex + 1}</td>
                    <td className="py-2 px-2 font-bold text-amber-200 truncate max-w-[120px]">{p.nickname}</td>
                    <td className="py-2 px-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 border border-red-800 text-amber-300">
                        {MA_GIAO_RANKS[p.rank]?.title || p.rank}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-mono text-emerald-400 font-bold">{p.totalCoins}</td>
                    <td className="py-2 px-2 text-slate-300 font-mono text-[11px]">{p.actionState}</td>
                    <td className="py-2 px-2 text-right space-x-1">
                      <button
                        onClick={() => onTriggerAction({ type: 'summonDisciple', userId: p.userId })}
                        className="px-2 py-0.5 rounded bg-amber-950 border border-amber-700 text-amber-200 text-[10px] font-semibold cursor-pointer"
                        title="Gọi lên gặp Giáo Chủ"
                      >
                        Triệu Tập
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. CẤP BẬC MA GIÁO (CRUD)
// ============================================================================
function RanksManagementPanel({
  config,
  onUpdateRanks,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  onUpdateRanks: (ranks: any) => void;
  onSave: () => void;
}) {
  const ranks = config.ranks;

  const handleRankChange = (rankId: MaGiaoRankId, field: string, value: any) => {
    onUpdateRanks({
      ...ranks,
      [rankId]: {
        ...ranks[rankId],
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-red-950 pb-3">
        <h2 className="text-lg font-black text-amber-300">6. QUẢN LÝ CẤP BẬC MA GIÁO (CRUD 9 CẤP)</h2>
        <p className="text-xs text-slate-400">Điều chỉnh ngưỡng xu, màu áo bào, hào quang và câu thoại phong chức</p>
      </div>

      <div className="space-y-3">
        {(Object.keys(ranks) as MaGiaoRankId[]).map((rId) => {
          const rank = ranks[rId];
          return (
            <div key={rId} className="p-3.5 rounded-xl bg-black/60 border border-red-950 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">{rank.badge}</span>
                <div>
                  <input
                    type="text"
                    value={rank.title}
                    onChange={(e) => handleRankChange(rId, 'title', e.target.value)}
                    className="px-2 py-1 rounded bg-black/80 border border-red-950 text-amber-300 font-bold outline-none text-xs w-full"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">{rId}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">NGƯỠNG XU</label>
                <input
                  type="number"
                  value={rank.minCoins}
                  onChange={(e) => handleRankChange(rId, 'minCoins', Number(e.target.value))}
                  className="w-full px-2 py-1 rounded bg-black/80 border border-red-950 text-emerald-400 font-bold outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">MÀU ÁO BÀO</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={rank.robeColor}
                    onChange={(e) => handleRankChange(rId, 'robeColor', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="font-mono text-[10px] text-slate-300">{rank.robeColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">CÂU THOẠI PHONG CHỨC</label>
                <input
                  type="text"
                  value={rank.voicePromotionLine || ''}
                  placeholder="{user} thăng cấp..."
                  onChange={(e) => handleRankChange(rId, 'voicePromotionLine', e.target.value)}
                  className="w-full px-2 py-1 rounded bg-black/80 border border-red-950 text-slate-200 outline-none text-xs"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 7. QUẢN LÝ QUÀ TIKTOK
// ============================================================================
function GiftsManagementPanel({
  config,
  onUpdateGifts,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  onUpdateGifts: (gifts: MaGiaoGiftDefinition[]) => void;
  onSave: () => void;
}) {
  const [newGiftId, setNewGiftId] = useState('');
  const [newGiftName, setNewGiftName] = useState('');
  const [newCoin, setNewCoin] = useState(1);

  const handleAddGift = () => {
    if (!newGiftId.trim() || !newGiftName.trim()) return;
    const added: MaGiaoGiftDefinition = {
      giftId: newGiftId.trim().toLowerCase(),
      giftName: newGiftName.trim(),
      coinValue: Number(newCoin) || 1,
      isActive: true,
      priority: 50,
    };
    onUpdateGifts([...config.gifts, added]);
    setNewGiftId('');
    setNewGiftName('');
    setNewCoin(1);
  };

  const handleRemoveGift = (giftId: string) => {
    onUpdateGifts(config.gifts.filter((g) => g.giftId !== giftId));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-red-950 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-amber-300">7. QUẢN LÝ QUÀ TIKTOK &amp; MỐC XU</h2>
          <p className="text-xs text-slate-400">Gán ID quà với chức danh Ma Giáo, hoạt ảnh Giáo Chủ và hiệu ứng</p>
        </div>
      </div>

      {/* Add New Gift Form */}
      <div className="p-3.5 rounded-xl bg-black/60 border border-red-950 flex flex-wrap items-center gap-2 text-xs">
        <input
          type="text"
          placeholder="Mã ID Quà (VD: lion, cap)"
          value={newGiftId}
          onChange={(e) => setNewGiftId(e.target.value)}
          className="px-3 py-1.5 rounded bg-black/80 border border-red-950 text-amber-300 outline-none"
        />
        <input
          type="text"
          placeholder="Tên Quà Tặng"
          value={newGiftName}
          onChange={(e) => setNewGiftName(e.target.value)}
          className="px-3 py-1.5 rounded bg-black/80 border border-red-950 text-amber-300 outline-none"
        />
        <input
          type="number"
          placeholder="Số Xu"
          value={newCoin}
          onChange={(e) => setNewCoin(Number(e.target.value))}
          className="w-24 px-3 py-1.5 rounded bg-black/80 border border-red-950 text-emerald-400 font-bold outline-none"
        />
        <button
          onClick={handleAddGift}
          className="px-3 py-1.5 rounded bg-emerald-900 hover:bg-emerald-800 border border-emerald-600 text-emerald-200 font-bold cursor-pointer"
        >
          + Thêm Quà
        </button>
      </div>

      {/* Gifts Table */}
      <div className="p-4 rounded-xl bg-black/60 border border-red-950">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-red-950 text-slate-400 text-[11px]">
              <th className="py-2">Mã Quà</th>
              <th className="py-2">Tên Quà</th>
              <th className="py-2">Giá Trị Xu</th>
              <th className="py-2">Hoạt Ảnh Giáo Chủ</th>
              <th className="py-2">Trạng Thái</th>
              <th className="py-2 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-950/60">
            {config.gifts.map((g) => (
              <tr key={g.giftId} className="hover:bg-white/5">
                <td className="py-2 font-mono text-red-300 font-bold">{g.giftId}</td>
                <td className="py-2 text-amber-200">{g.giftName}</td>
                <td className="py-2 font-mono text-emerald-400 font-bold">{g.coinValue} xu</td>
                <td className="py-2 text-slate-300">{g.leaderAnim || 'Mặc định'}</td>
                <td className="py-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                    BẬT
                  </span>
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => handleRemoveGift(g.giftId)}
                    className="p-1 rounded hover:bg-rose-950 text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// 8. TƯƠNG TÁC BÌNH LUẬN
// ============================================================================
function CommentsKeywordsPanel({
  config,
  onUpdateKeywords,
  onUpdateCommentSettings,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  onUpdateKeywords: (keywords: MaGiaoKeywordDefinition[]) => void;
  onUpdateCommentSettings: (patch: any) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-red-950 pb-3">
        <h2 className="text-lg font-black text-amber-300">8. QUẢN LÝ BÌNH LUẬN &amp; LỆNH TƯƠNG TÁC</h2>
        <p className="text-xs text-slate-400">Quản lý từ khóa võ thuật (đi, chạy, múa, võ, đấm, đá, nhảy, thiền, đứng, chào) và bong bóng</p>
      </div>

      <div className="p-4 rounded-xl bg-black/60 border border-red-950 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">THỜI GIAN HIỂN THỊ BONG BÓNG (GIÂY)</label>
          <input
            type="number"
            value={config.commentSettings.bubbleDisplayDurationSec}
            onChange={(e) => onUpdateCommentSettings({ bubbleDisplayDurationSec: Number(e.target.value) })}
            className="w-full px-3 py-1.5 rounded bg-black/80 border border-red-950 text-amber-300 outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">THỜI GIAN CHỐNG SPAM (GIÂY)</label>
          <input
            type="number"
            value={config.commentSettings.antiSpamCooldownSec}
            onChange={(e) => onUpdateCommentSettings({ antiSpamCooldownSec: Number(e.target.value) })}
            className="w-full px-3 py-1.5 rounded bg-black/80 border border-red-950 text-amber-300 outline-none"
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-2">
        <h3 className="text-xs font-bold text-amber-300 uppercase">Danh Mục 10 Từ Khóa Chuẩn</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {config.keywords.map((kw) => (
            <div key={kw.id} className="p-2 rounded bg-black/80 border border-red-950 flex items-center justify-between">
              <span className="font-bold text-amber-300 font-mono">"{kw.keyword}"</span>
              <span className="text-[10px] text-slate-400">→ {kw.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 9. KHO LỜI THOẠI GIÁO CHỦ (13 NHÓM)
// ============================================================================
function DialogueBankPanel({
  config,
  onUpdateDialogues,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  onUpdateDialogues: (dialogues: any) => void;
  onSave: () => void;
}) {
  const dialogues = config.dialogues;

  const testVoiceLine = (text: string) => {
    maGiaoVoiceManager.enqueue({ text, priority: 100, mood: 'ARROGANT' });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-red-950 pb-3">
        <h2 className="text-lg font-black text-amber-300">9. KHO LỜI THOẠI GIÁO CHỦ (13 NHÓM ĐỘC QUYỀN)</h2>
        <p className="text-xs text-slate-400">Tùy biến câu thoại võ hiệp hài hước, biến động {'{playerName}'}, {'{rankName}'}</p>
      </div>

      <div className="space-y-4">
        {Object.entries(dialogues).map(([key, group]: any) => (
          <div key={key} className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300">{group.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 font-mono">
                  {group.mood}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">{group.lines.length} câu</span>
            </div>

            <div className="space-y-1.5">
              {group.lines.map((line: string, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-black/80 border border-red-950/60 text-xs text-slate-200">
                  <span className="truncate pr-2">"{line}"</span>
                  <button
                    onClick={() => testVoiceLine(line.replace('{playerName}', 'Đại Hiệp'))}
                    className="p-1 rounded hover:bg-white/10 text-emerald-400 shrink-0 cursor-pointer"
                    title="Nghe thử giọng đọc"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 10. GIỌNG ĐỌC & TTS
// ============================================================================
function TtsVoicePanel({
  config,
  onUpdateTts,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  onUpdateTts: (patch: any) => void;
  onSave: () => void;
}) {
  const tts = config.tts;

  const testTTS = () => {
    maGiaoVoiceManager.enqueue({
      text: 'Bản Giáo Chủ thiên thu vạn đại, nhất thống giang hồ!',
      priority: 100,
      mood: 'ARROGANT',
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-red-950 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-amber-300">10. GIỌNG ĐỌC &amp; TTS (AZURE / VIENEU / TRÌNH DUYỆT)</h2>
          <p className="text-xs text-slate-400">Kế thừa kiến trúc Azure Speech &amp; VieNeu từ Chùa Online 2</p>
        </div>
        <button
          onClick={testTTS}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-xs font-bold text-emerald-200 cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Nghe Thử</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-4 text-xs">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">NHÀ CUNG CẤP GIỌNG ĐỌC</label>
          <div className="grid grid-cols-3 gap-2">
            {(['browser', 'azure', 'vienieu'] as const).map((prov) => (
              <button
                key={prov}
                onClick={() => onUpdateTts({ provider: prov })}
                className={`py-2 rounded border font-bold text-center cursor-pointer ${
                  tts.provider === prov ? 'bg-red-950 border-red-500 text-amber-300' : 'bg-black/40 border-red-950 text-slate-400'
                }`}
              >
                {prov === 'browser' ? 'Trình Duyệt' : prov === 'azure' ? 'Microsoft Azure' : 'VieNeu TTS'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">TỐC ĐỘ NÓI (0.5 - 2.0)</label>
            <input
              type="number"
              step="0.05"
              value={tts.speechRate}
              onChange={(e) => onUpdateTts({ speechRate: Number(e.target.value) })}
              className="w-full px-3 py-1.5 rounded bg-black/80 border border-red-950 text-amber-300 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">ÂM LƯỢNG (0.0 - 1.0)</label>
            <input
              type="number"
              step="0.1"
              value={tts.speechVolume}
              onChange={(e) => onUpdateTts({ speechVolume: Number(e.target.value) })}
              className="w-full px-3 py-1.5 rounded bg-black/80 border border-red-950 text-amber-300 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={tts.mouthLipSync}
              onChange={(e) => onUpdateTts({ mouthLipSync: e.target.checked })}
              className="accent-red-600 rounded"
            />
            <span>Đồng Bộ Chuyển Động Miệng (Lip-Sync Visemes)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={tts.reverbEffect}
              onChange={(e) => onUpdateTts({ reverbEffect: e.target.checked })}
              className="accent-red-600 rounded"
            />
            <span>Hiệu Ứng Vang Vọng Đại Điện</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 11. QUẢN LÝ ĐẠI ĐIỆN & BACKGROUND
// ============================================================================
function HallBackgroundPanel({
  config,
  onUpdateBackgrounds,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  onUpdateBackgrounds: (bgs: any[], activeId: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-red-950 pb-3">
        <h2 className="text-lg font-black text-amber-300">11. QUẢN LÝ ĐẠI ĐIỆN &amp; BACKGROUND</h2>
        <p className="text-xs text-slate-400">Chọn phông nền đại điện, khu vực đi lại an toàn và tải ảnh mới</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {config.backgrounds.map((bg) => {
          const isSelected = config.activeBackgroundId === bg.id;
          return (
            <div
              key={bg.id}
              onClick={() => onUpdateBackgrounds(config.backgrounds, bg.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected ? 'bg-red-950/80 border-red-500 text-amber-300 shadow-lg' : 'bg-black/60 border-red-950 text-slate-400 hover:border-red-800'
              }`}
            >
              <div className="h-28 rounded-lg bg-black/80 border border-red-950/80 mb-2 flex items-center justify-center text-2xl font-bold">
                🏛️
              </div>
              <div className="font-bold text-xs truncate">{bg.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Tỷ lệ: {bg.aspectRatio}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 12. HOẠT ẢNH NHÂN VẬT (15 CỬ ĐỘNG)
// ============================================================================
function DiscipleAnimationsPanel({
  config,
  onUpdateSettings,
  onTriggerAction,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  onUpdateSettings: (patch: any) => void;
  onTriggerAction: (action: any) => void;
  onSave: () => void;
}) {
  const COLLECTIVE_COMMANDS = [
    { label: 'Tất Cả Đi Dạo', action: 'orderFormation' },
    { label: 'Tất Cả Luyện Võ', action: 'orderAllMartial' },
    { label: 'Tất Cả Ngồi Thiền', action: 'orderAllMeditate' },
    { label: 'Tất Cả Vỗ Tay Ăn Mừng', action: 'orderAllCheer' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-red-950 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-amber-300">12. QUẢN LÝ 15 HOẠT ẢNH ĐỒ ĐỆ &amp; LỆNH TẬP THỂ</h2>
          <p className="text-xs text-slate-400">Hiệu lệnh đồng loạt toàn bộ 80 đồ đệ trong sảnh thực hiện cử động võ thuật</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-3">
        <h3 className="text-xs font-bold text-amber-300 uppercase">Hiệu Lệnh Tập Thể Toàn Sảnh</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COLLECTIVE_COMMANDS.map((cmd) => (
            <button
              key={cmd.action}
              onClick={() => onTriggerAction({ type: cmd.action })}
              className="py-2.5 px-3 rounded-lg bg-red-950 hover:bg-red-900 border border-red-700 text-amber-200 text-xs font-bold shadow cursor-pointer transition-all"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 13. BA MINI GAME LUYỆN VÕ
// ============================================================================
function MinigamesPanel({
  config,
  gameState,
  onUpdateMinigames,
  onTriggerAction,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  gameState: any;
  onUpdateMinigames: (patch: any) => void;
  onTriggerAction: (action: any) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-red-950 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-amber-300">13. QUẢN LÝ 3 MINI GAME LUYỆN VÕ</h2>
          <p className="text-xs text-slate-400">Ma Quyền Loạn Vũ, Ma Ảnh Thân Pháp và Tam Khí Ma Trận</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerAction({ type: 'startMinigame', minigameId: 'MA_QUYEN_LOAN_VU' })}
            className="px-3 py-1.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-bold cursor-pointer"
          >
            Bắt Đầu Ma Quyền
          </button>
          <button
            onClick={() => onTriggerAction({ type: 'stopMinigame' })}
            className="px-3 py-1.5 rounded bg-black/60 border border-white/20 text-rose-300 text-xs font-semibold cursor-pointer"
          >
            Dừng &amp; Về Đại Điện
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-2">
          <h3 className="text-xs font-black text-amber-300 uppercase">1. Ma Quyền Loạn Vũ</h3>
          <p className="text-[11px] text-slate-400">Yêu cầu đồ đệ bình luận "múa", "quyền", "võ" để vận công liên hoàn.</p>
          <div className="text-xs space-y-1 text-slate-300">
            <div>Thời lượng: <span className="font-bold text-amber-300">{config.minigames.maQuyen.durationSec}s</span></div>
            <div>Tỷ lệ thắng: <span className="font-bold text-emerald-400">{config.minigames.maQuyen.targetPercent}%</span></div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-2">
          <h3 className="text-xs font-black text-amber-300 uppercase">2. Ma Ảnh Thân Pháp</h3>
          <p className="text-[11px] text-slate-400">Né đòn 3 vòng theo hướng TRÁI, PHẢI hoặc NHẢY qua cạm bẫy.</p>
          <div className="text-xs space-y-1 text-slate-300">
            <div>Số vòng: <span className="font-bold text-amber-300">{config.minigames.maAnh.roundsCount}</span></div>
            <div>Thời gian/vòng: <span className="font-bold text-amber-300">{config.minigames.maAnh.roundDurationSec}s</span></div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-2">
          <h3 className="text-xs font-black text-amber-300 uppercase">3. Tam Khí Ma Trận</h3>
          <p className="text-[11px] text-slate-400">Khắc chế nguyên tố LỬA, BĂNG, GIÓ bảo vệ trận pháp Ma Giáo.</p>
          <div className="text-xs space-y-1 text-slate-300">
            <div>Số vòng: <span className="font-bold text-amber-300">{config.minigames.tamKhi.roundsCount}</span></div>
            <div>Thời gian/vòng: <span className="font-bold text-amber-300">{config.minigames.tamKhi.roundDurationSec}s</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 14. CHUYỂN CẢNH TỰ ĐỘNG
// ============================================================================
function TransitionsPanel({
  config,
  onUpdateTransitions,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  onUpdateTransitions: (patch: any) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="border-b border-red-950 pb-3">
        <h2 className="text-lg font-black text-amber-300">14. CẤU HÌNH CHUYỂN CẢNH TỰ ĐỘNG</h2>
        <p className="text-xs text-slate-400">Chu kỳ luân chuyển giữa Đại Điện và Sân Luyện Võ (mặc định 150-180s)</p>
      </div>

      <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-4 text-xs">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">CHU KỲ TỰ ĐỘNG (GIÂY)</label>
          <input
            type="number"
            value={config.transitions.cycleDurationSec}
            onChange={(e) => onUpdateTransitions({ cycleDurationSec: Number(e.target.value) })}
            className="w-full px-3 py-1.5 rounded bg-black/80 border border-red-950 text-amber-300 outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">THỜI GIAN THÔNG BÁO CHUẨN BỊ (GIÂY)</label>
          <input
            type="number"
            value={config.transitions.prepAnnouncementSec}
            onChange={(e) => onUpdateTransitions({ prepAnnouncementSec: Number(e.target.value) })}
            className="w-full px-3 py-1.5 rounded bg-black/80 border border-red-950 text-amber-300 outline-none"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.transitions.autoCycleEnabled}
            onChange={(e) => onUpdateTransitions({ autoCycleEnabled: e.target.checked })}
            className="accent-red-600 rounded"
          />
          <span>Bật Tự Động Chuyển Cảnh Theo Chu Kỳ</span>
        </label>
      </div>
    </div>
  );
}

// ============================================================================
// 15. THÔNG BÁO & BẢNG XẾP HẠNG
// ============================================================================
function BannersLeaderboardPanel({
  config,
  onUpdateBanners,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  onUpdateBanners: (banners: any) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-red-950 pb-3">
        <h2 className="text-lg font-black text-amber-300">15. QUẢN LÝ BẢNG THÔNG BÁO &amp; XẾP HẠNG</h2>
        <p className="text-xs text-slate-400">Tùy biến tọa độ X/Y, kích thước và màu sắc các bảng HUD trên livestream</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(config.banners).map(([k, banner]: any) => (
          <div key={k} className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-3 text-xs">
            <h3 className="font-bold text-amber-300">{banner.name}</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400">TỌA ĐỘ Y (%)</label>
                <input
                  type="number"
                  value={banner.y}
                  onChange={(e) =>
                    onUpdateBanners({ ...config.banners, [k]: { ...banner, y: Number(e.target.value) } })
                  }
                  className="w-full px-2 py-1 rounded bg-black/80 border border-red-950 text-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400">CỠ CHỮ (PX)</label>
                <input
                  type="number"
                  value={banner.fontSize}
                  onChange={(e) =>
                    onUpdateBanners({ ...config.banners, [k]: { ...banner, fontSize: Number(e.target.value) } })
                  }
                  className="w-full px-2 py-1 rounded bg-black/80 border border-red-950 text-slate-200 outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 16. GIAO DIỆN & CUSTOM CSS
// ============================================================================
function LayoutCssPanel({
  config,
  onUpdateLayout,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  onUpdateLayout: (patch: any) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-red-950 pb-3">
        <h2 className="text-lg font-black text-amber-300">16. GIAO DIỆN &amp; CUSTOM CSS</h2>
        <p className="text-xs text-slate-400">Tỷ lệ 9:16 dọc TikTok LIVE và chỉnh sửa CSS tùy biến không đè mã nguồn gốc</p>
      </div>

      <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-3 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.layout.tiktokSafeZoneGuide}
            onChange={(e) => onUpdateLayout({ tiktokSafeZoneGuide: e.target.checked })}
            className="accent-red-600 rounded"
          />
          <span>Hiện Khung Vùng An Toàn TikTok LIVE (Safe Zone Overlay)</span>
        </label>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">MÃ CUSTOM CSS (ĐƯỢC LƯU BỀN VỮNG)</label>
          <textarea
            rows={8}
            value={config.layout.customCss}
            placeholder="/* Thêm CSS tùy biến tại đây... */"
            onChange={(e) => onUpdateLayout({ customCss: e.target.value })}
            className="w-full p-3 rounded bg-black/80 border border-red-950 font-mono text-xs text-emerald-300 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 17. OBS & PHÁT SÓNG
// ============================================================================
function ObsStreamingPanel({
  config,
  onUpdateObs,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  onUpdateObs: (patch: any) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="border-b border-red-950 pb-3">
        <h2 className="text-lg font-black text-amber-300">17. OBS BROWSER SOURCE &amp; ĐỒNG BỘ WEBSOCKET</h2>
        <p className="text-xs text-slate-400">Kế thừa chuẩn OBS sync từ Chùa Online 2, tự phục hồi khi ngắt kết nối</p>
      </div>

      <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-3 text-xs text-slate-300">
        <div className="p-3 rounded bg-black/80 border border-emerald-500/40 text-emerald-300">
          <div className="font-bold">ĐƯỜNG DẪN DÀNH CHO OBS BROWSER SOURCE:</div>
          <code className="block mt-1 p-2 rounded bg-black text-amber-300 text-xs select-all">
            http://localhost:3000/?obs=1
          </code>
          <p className="text-[10px] text-slate-400 mt-1">Độ phân giải khuyến nghị: 1080 x 1920 (9:16 Vertical)</p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.obsSync.enabled}
            onChange={(e) => onUpdateObs({ enabled: e.target.checked })}
            className="accent-red-600 rounded"
          />
          <span>Bật Tự Động Đồng Bộ Cấu Hình Đến Cửa Sổ OBS</span>
        </label>
      </div>
    </div>
  );
}

// ============================================================================
// 18. CHẾ ĐỘ DEMO & KIỂM THỬ
// ============================================================================
function DemoTestingPanel({
  config,
  onTriggerAction,
}: {
  config: MaGiaoFullAdminConfig;
  onTriggerAction: (action: any) => void;
}) {
  const spawnDisciples = (count: number) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        maGiaoGameManager.simulateRecruit();
      }, i * 40);
    }
  };

  const simulateGiftCoins = (coins: number, name: string) => {
    maGiaoGameManager.simulateGift(coins, name);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-red-950 pb-3">
        <h2 className="text-lg font-black text-amber-300">18. PHÒNG THÍ NGHIỆM DEMO &amp; KIỂM THỬ TẢI</h2>
        <p className="text-xs text-slate-400">Mô phỏng 1 đến 200 người chơi, tặng quà từ 1 đến 500 xu và soán ngôi Giáo Chủ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spawn Disciples */}
        <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-3">
          <h3 className="text-xs font-bold text-amber-300 uppercase">1. Tạo Đồ Đệ Mô Phỏng</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[1, 10, 50, 80, 200].map((c) => (
              <button
                key={c}
                onClick={() => spawnDisciples(c)}
                className="py-2 rounded bg-red-950 hover:bg-red-900 border border-red-800 text-amber-300 text-xs font-bold cursor-pointer"
              >
                +{c} Người
              </button>
            ))}
          </div>
        </div>

        {/* Simulate Gifts */}
        <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-3">
          <h3 className="text-xs font-bold text-amber-300 uppercase">2. Mô Phỏng Quà Tặng &amp; Thăng Cấp</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => simulateGiftCoins(1, 'Hoa Hồng')}
              className="p-2 rounded bg-black/80 hover:bg-white/10 border border-red-950 text-xs font-bold text-emerald-300 cursor-pointer"
            >
              1 Xu (Ngoại Môn)
            </button>
            <button
              onClick={() => simulateGiftCoins(99, 'Vương Miện')}
              className="p-2 rounded bg-black/80 hover:bg-white/10 border border-red-950 text-xs font-bold text-yellow-300 cursor-pointer"
            >
              99 Xu (Trưởng Lão)
            </button>
            <button
              onClick={() => simulateGiftCoins(199, 'Thần Thú')}
              className="p-2 rounded bg-black/80 hover:bg-white/10 border border-red-950 text-xs font-bold text-rose-300 cursor-pointer"
            >
              199 Xu (Đồng Tôn)
            </button>
            <button
              onClick={() => simulateGiftCoins(500, 'Thiên Ma Sư Tử')}
              className="p-2 rounded bg-gradient-to-r from-red-950 to-amber-950 border border-amber-600 text-xs font-bold text-amber-300 cursor-pointer col-span-3"
            >
              👑 500 Xu (Tân Giáo Chủ Soán Ngôi)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 19. BACKEND & SECURITY
// ============================================================================
function BackendSecurityPanel({
  config,
  adminToken,
  onSetAdminToken,
  onSave,
}: {
  config: MaGiaoFullAdminConfig;
  adminToken: string;
  onSetAdminToken: (token: string) => void;
  onSave: () => void;
}) {
  const [tokenInput, setTokenInput] = useState(adminToken);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `magiao_config_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="border-b border-red-950 pb-3">
        <h2 className="text-lg font-black text-amber-300">19. CÀI ĐẶT BACKEND, API &amp; BẢO MẬT</h2>
        <p className="text-xs text-slate-400">Sao lưu tệp JSON cấu hình và bảo vệ API bằng Token quản trị</p>
      </div>

      <div className="p-4 rounded-xl bg-black/60 border border-red-950 space-y-4 text-xs">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">MÃ QUẢN TRỊ ADMIN (ADMIN ACCESS TOKEN)</label>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Nhập mã token bảo mật..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded bg-black/80 border border-red-950 text-amber-300 outline-none"
            />
            <button
              onClick={() => onSetAdminToken(tokenInput.trim())}
              className="px-3 py-1.5 rounded bg-emerald-900 border border-emerald-600 text-emerald-200 font-bold cursor-pointer"
            >
              Áp Dụng
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black/80 hover:bg-white/10 border border-red-800 text-xs font-bold text-amber-300 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Bản Sao Lưu (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 20. NHẬT KÝ & CHẨN ĐOÁN
// ============================================================================
function LogsDiagnosticsPanel({
  logs,
  onClear,
}: {
  logs: Array<{ id: string; time: string; type: string; desc: string }>;
  onClear: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-red-950 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-amber-300">20. NHẬT KÝ SỰ KIỆN &amp; CHẨN ĐOÁN HỆ THỐNG</h2>
          <p className="text-xs text-slate-400">Luồng sự kiện thời gian thực từ TikTok LIVE, Socket.IO và lỗi engine</p>
        </div>
        <button
          onClick={onClear}
          className="px-2.5 py-1 rounded bg-black/60 border border-white/20 text-rose-300 text-xs font-semibold cursor-pointer"
        >
          Xóa Nhật Ký
        </button>
      </div>

      <div className="p-4 rounded-xl bg-black/60 border border-red-950 font-mono text-xs max-h-96 overflow-y-auto custom-scrollbar space-y-1">
        {logs.length === 0 ? (
          <div className="text-slate-500 italic py-4 text-center">Chưa có sự kiện nào được ghi nhận.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 py-1 border-b border-red-950/40 text-slate-300">
              <span className="text-slate-500 shrink-0">[{log.time}]</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-950 text-amber-300 shrink-0">
                {log.type}
              </span>
              <span className="truncate">{log.desc}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
