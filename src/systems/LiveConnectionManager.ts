import { io, Socket } from 'socket.io-client';
import {
  ConnectionStatus,
  FortuneRecord,
  GiftActionPreset,
  GiftMapping,
  ServerConnectionSnapshot,
  StreamOverlaySettings,
  SceneCalibrationSettings,
  TikTokNormalizedEvent,
  UnknownGiftRecord,
  XinXamDrawResult,
  XinXamSettings,
} from '../types/temple';

export type ObsSyncSnapshot = {
  overlay: Partial<StreamOverlaySettings>;
  scene: Partial<SceneCalibrationSettings>;
  savedAt: number;
};
type ObsSyncSubscriber = (snapshot: ObsSyncSnapshot) => void;
type EventSubscriber = (event: TikTokNormalizedEvent) => void;
type StatusSubscriber = (snapshot: ServerConnectionSnapshot) => void;
type AdminCmdSubscriber = (cmd: { action: string; payload?: any }) => void;
type GiftsUpdatedSubscriber = (payload: {
  gifts: GiftMapping[];
  presets: GiftActionPreset[];
}) => void;
type UnknownGiftsSubscriber = (payload: { unknownGifts: UnknownGiftRecord[] }) => void;
type XinXamUpdatedSubscriber = (payload: {
  settings: XinXamSettings;
  fortunes: FortuneRecord[];
  recentDraws: XinXamDrawResult[];
}) => void;
type XinXamDrawSubscriber = (draw: XinXamDrawResult) => void;
type MaGiaoConfigSubscriber = (config: any) => void;
type MaGiaoActionSubscriber = (action: any) => void;
type MaGiaoObsSyncSubscriber = (sync: any) => void;

export class LiveConnectionManager {
  private socket: Socket | null = null;
  private maGiaoConfigSubscribers = new Set<MaGiaoConfigSubscriber>();
  private maGiaoActionSubscribers = new Set<MaGiaoActionSubscriber>();
  private maGiaoObsSyncSubscribers = new Set<MaGiaoObsSyncSubscriber>();
  private snapshot: ServerConnectionSnapshot = {
    status: ConnectionStatus.DEMO,
    tiktokUsername: '',
    incomingEventCount: 0,
    receiverActive: false,
    isCloudRuntime: true,
    availableServerTts: {
      vieneuCloudKeyConfigured: false,
      vieneuCloudEndpoint: 'https://api.vieneu.io/api/v1/audio/speech',
      vieneuLocalEndpoint: 'http://127.0.0.1:8000/v1/audio/speech',
      gemini: false,
      elevenlabs: false,
      openai: false,
    },
  };

  private lastObsSync: ObsSyncSnapshot | null = null;
  private obsSyncSubscribers = new Set<ObsSyncSubscriber>();
  private eventSubscribers = new Set<EventSubscriber>();
  private statusSubscribers = new Set<StatusSubscriber>();
  private adminCmdSubscribers = new Set<AdminCmdSubscriber>();
  private giftsSubscribers = new Set<GiftsUpdatedSubscriber>();
  private unknownGiftsSubscribers = new Set<UnknownGiftsSubscriber>();
  private xinXamSubscribers = new Set<XinXamUpdatedSubscriber>();
  private xinXamDrawSubscribers = new Set<XinXamDrawSubscriber>();

  public init(): void {
    if (this.socket) return;

    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 8000,
    });

    this.socket = socket;

    socket.on('tiktok:status', (snap: ServerConnectionSnapshot) => {
      this.snapshot = snap;
      this.notifyStatus();
    });

    socket.on('tiktok:event', (ev: TikTokNormalizedEvent) => {
      for (const sub of this.eventSubscribers) {
        sub(ev);
      }
    });

    socket.on('temple:obs_sync_settings', (snapshot: ObsSyncSnapshot) => {
      if (!snapshot || !snapshot.overlay || !snapshot.scene) return;
      this.lastObsSync = snapshot;
      for (const sub of this.obsSyncSubscribers) sub(snapshot);
    }); // CHUA_OBS_SYNC_V10

    socket.on('temple:admin_command', (cmd: { action: string; payload?: any }) => {
      for (const sub of this.adminCmdSubscribers) {
        sub(cmd);
      }
    });

    socket.on('gifts:updated', (payload: { gifts: GiftMapping[]; presets: GiftActionPreset[] }) => {
      if (payload && Array.isArray(payload.gifts)) {
        for (const sub of this.giftsSubscribers) {
          sub(payload);
        }
      }
    });

    socket.on('gifts:unknown_updated', (payload: { unknownGifts: UnknownGiftRecord[] }) => {
      if (payload && Array.isArray(payload.unknownGifts)) {
        for (const sub of this.unknownGiftsSubscribers) {
          sub(payload);
        }
      }
    });

    socket.on(
      'xinxam:updated',
      (payload: {
        settings: XinXamSettings;
        fortunes: FortuneRecord[];
        recentDraws: XinXamDrawResult[];
      }) => {
        if (payload && Array.isArray(payload.fortunes)) {
          for (const sub of this.xinXamSubscribers) {
            sub(payload);
          }
        }
      },
    );

    socket.on('xinxam:draw_recorded', (draw: XinXamDrawResult) => {
      if (draw && draw.eventDedupeKey) {
        for (const sub of this.xinXamDrawSubscribers) {
          sub(draw);
        }
      }
    });

    socket.on('magiao:config_updated', (config: any) => {
      for (const sub of this.maGiaoConfigSubscribers) sub(config);
    });

    socket.on('magiao:obs_sync', (sync: any) => {
      for (const sub of this.maGiaoObsSyncSubscribers) sub(sync);
    });

    socket.on('magiao:admin_action', (action: any) => {
      for (const sub of this.maGiaoActionSubscribers) sub(action);
    });

    // Initial health fetch
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (data?.connection) {
          this.snapshot = data.connection;
          this.notifyStatus();
        }
      })
      .catch(() => {
        // Stay in local DEMO mode cleanly if offline
      });
  }

  public getSnapshot(): ServerConnectionSnapshot {
    return this.snapshot;
  }

  private notifyStatus(): void {
    for (const sub of this.statusSubscribers) {
      sub(this.snapshot);
    }
  }

  public onObsSync(cb: ObsSyncSubscriber): () => void {
    this.obsSyncSubscribers.add(cb);
    if (this.lastObsSync) cb(this.lastObsSync);
    return () => { this.obsSyncSubscribers.delete(cb); };
  }

  public onEvent(cb: EventSubscriber): () => void {
    this.eventSubscribers.add(cb);
    return () => this.eventSubscribers.delete(cb);
  }

  public onStatus(cb: StatusSubscriber): () => void {
    this.statusSubscribers.add(cb);
    cb(this.snapshot);
    return () => this.statusSubscribers.delete(cb);
  }

  public onAdminCommand(cb: AdminCmdSubscriber): () => void {
    this.adminCmdSubscribers.add(cb);
    return () => this.adminCmdSubscribers.delete(cb);
  }

  public onGiftsUpdated(cb: GiftsUpdatedSubscriber): () => void {
    this.giftsSubscribers.add(cb);
    return () => this.giftsSubscribers.delete(cb);
  }

  public onUnknownGiftsUpdated(cb: UnknownGiftsSubscriber): () => void {
    this.unknownGiftsSubscribers.add(cb);
    return () => this.unknownGiftsSubscribers.delete(cb);
  }

  public onXinXamUpdated(cb: XinXamUpdatedSubscriber): () => void {
    this.xinXamSubscribers.add(cb);
    return () => this.xinXamSubscribers.delete(cb);
  }

  public onXinXamDrawRecorded(cb: XinXamDrawSubscriber): () => void {
    this.xinXamDrawSubscribers.add(cb);
    return () => this.xinXamDrawSubscribers.delete(cb);
  }

  public async connectTikTok(username: string): Promise<ServerConnectionSnapshot> {
    const res = await fetch('/api/tiktok/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    const snap: ServerConnectionSnapshot = data?.snapshot || data;
    if (snap && snap.status) {
      this.snapshot = snap;
      this.notifyStatus();
    }
    return this.snapshot;
  }

  public async disconnectTikTok(switchToDemo = false): Promise<ServerConnectionSnapshot> {
    const res = await fetch('/api/tiktok/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ switchToDemo }),
    });
    const snap: ServerConnectionSnapshot = await res.json();
    if (snap && snap.status) {
      this.snapshot = snap;
      this.notifyStatus();
    }
    return this.snapshot;
  }

  public broadcastDemoEvent(event: TikTokNormalizedEvent): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('temple:broadcast_demo_event', event);
    } else {
      for (const sub of this.eventSubscribers) {
        sub(event);
      }
    }
  }

  public broadcastAdminCommand(action: string, payload?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('temple:admin_command', { action, payload });
    }
  }

  public onMaGiaoConfig(cb: (config: any) => void): () => void {
    this.maGiaoConfigSubscribers.add(cb);
    return () => this.maGiaoConfigSubscribers.delete(cb);
  }

  public onMaGiaoAction(cb: (action: any) => void): () => void {
    this.maGiaoActionSubscribers.add(cb);
    return () => this.maGiaoActionSubscribers.delete(cb);
  }

  public onMaGiaoObsSync(cb: (sync: any) => void): () => void {
    this.maGiaoObsSyncSubscribers.add(cb);
    return () => this.maGiaoObsSyncSubscribers.delete(cb);
  }

  public broadcastMaGiaoAction(action: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('magiao:admin_action', action);
    }
    // Also post to HTTP API for reliable delivery
    fetch('/api/magiao/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action),
    }).catch(() => {});
  }

  public broadcastMaGiaoConfig(patch: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('magiao:update_config', patch);
    }
  }
}

export const liveConnectionManager = new LiveConnectionManager();
