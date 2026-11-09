/** CHUA_OBS_SYNC_V10 — only presentation settings, never voice/API credentials. */
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_OVERLAY_SETTINGS, DEFAULT_SCENE_CALIBRATION } from '../src/types/temple.ts';

export interface ObsSyncSettings {
  overlay: Record<string, unknown>;
  scene: Record<string, unknown>;
  savedAt: number;
}

const FILE = path.join(process.cwd(), '.chua_obs_sync_settings.json');
const allowedOverlay = new Set(Object.keys(DEFAULT_OVERLAY_SETTINGS).filter(k => k !== 'obsCleanView'));
const allowedScene = new Set(Object.keys(DEFAULT_SCENE_CALIBRATION));

function filterSettings(input: unknown, allowed: Set<string>, type: string): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error(`Thiếu cấu hình ${type} hợp lệ`);
  }
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!allowed.has(key)) continue;
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean' && value !== null) continue;
    if (typeof value === 'number' && !Number.isFinite(value)) continue;
    if (typeof value === 'string' && value.length > 2048) continue;
    sanitized[key] = value;
  }
  return sanitized;
}

export function readObsSyncSettings(): ObsSyncSettings | null {
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8')) as ObsSyncSettings;
    if (!raw || !raw.overlay || !raw.scene || !Number.isFinite(raw.savedAt)) return null;
    return {
      overlay: filterSettings(raw.overlay, allowedOverlay, 'giao diện'),
      scene: filterSettings(raw.scene, allowedScene, 'camera'),
      savedAt: raw.savedAt,
    };
  } catch {
    return null;
  }
}

export function writeObsSyncSettings(body: unknown): ObsSyncSettings {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Dữ liệu không hợp lệ');
  const data = body as { overlay?: unknown; scene?: unknown };
  const overlay = filterSettings(data.overlay, allowedOverlay, 'giao diện');
  const scene = filterSettings(data.scene, allowedScene, 'camera');
  if (Object.keys(overlay).length < 8 || Object.keys(scene).length < 5) {
    throw new Error('Cấu hình không đầy đủ; không ghi đè');
  }
  const snapshot = { overlay, scene, savedAt: Date.now() };
  const serialized = JSON.stringify(snapshot);
  if (serialized.length > 16000) throw new Error('Cấu hình vượt giới hạn');
  const tmp = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, serialized, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(tmp, FILE);
  return snapshot;
}
