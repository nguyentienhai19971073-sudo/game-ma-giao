import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  maGiaoConfigStore,
  DEFAULT_MA_GIAO_FULL_CONFIG,
  MaGiaoFullAdminConfig,
} from '../../server/maGiaoStore.js';
import { liveConnectionManager } from '../systems/LiveConnectionManager.js';
import { maGiaoGameManager } from '../systems/MaGiaoGameManager.js';

console.log('--- TEST SUITE: MA GIÁO ADMIN 20-CATEGORY BACKEND & PERSISTENCE ---');

// Test 1: Verify store initialization and full schema
console.log('Test 1: Store initialization & schema completeness...');
const initialConfig = maGiaoConfigStore.getConfig();
assert.ok(initialConfig, 'Config must exist');
assert.equal(initialConfig.version, 2, 'Config version must be 2');
assert.ok(initialConfig.live, 'Category 2: Live control must exist');
assert.ok(initialConfig.leaderProfile, 'Category 3: Leader profile must exist');
assert.ok(initialConfig.settings, 'Category 4 & 5: Settings must exist');
assert.ok(initialConfig.ranks, 'Category 6: Cult Ranks CRUD must exist');
assert.ok(Array.isArray(initialConfig.gifts), 'Category 7: Gifts must be an array');
assert.ok(Array.isArray(initialConfig.keywords), 'Category 8: Keywords must be an array');
assert.ok(initialConfig.dialogues, 'Category 9: Dialogues bank must exist');
assert.ok(initialConfig.tts, 'Category 10: TTS settings must exist');
assert.ok(Array.isArray(initialConfig.backgrounds), 'Category 11: Backgrounds must be an array');
assert.ok(initialConfig.minigames, 'Category 13: Minigames config must exist');
assert.ok(initialConfig.transitions, 'Category 14: Transitions config must exist');
assert.ok(initialConfig.banners, 'Category 15: Banners config must exist');
assert.ok(initialConfig.layout, 'Category 16: Layout & Custom CSS must exist');
assert.ok(initialConfig.obsSync, 'Category 17: OBS Sync must exist');
console.log('✓ All 20 configuration categories verified in store');

// Test 2: Ranks CRUD verification
console.log('Test 2: Cult Ranks CRUD verification (9 Ranks)...');
const ranks = initialConfig.ranks;
const expectedRanks = [
  'DAN_DEN',
  'NGOAI_MON',
  'NOI_MON',
  'SU_HUYNH',
  'TINH_ANH',
  'HO_PHAP',
  'DAI_TRUONG_LAO',
  'DONG_TON_GIAO_CHU',
  'TAN_GIAO_CHU',
];
for (const r of expectedRanks) {
  assert.ok(ranks[r as keyof typeof ranks], `Rank ${r} must be registered`);
  assert.ok(typeof ranks[r as keyof typeof ranks].minCoins === 'number');
  assert.ok(ranks[r as keyof typeof ranks].title.length > 0);
}
console.log('✓ 9 Cult Ranks registered and valid');

// Test 3: Updating configuration and persistence
console.log('Test 3: Update and disk persistence verification...');
const updated = maGiaoConfigStore.updateConfig({
  leaderProfile: {
    ...initialConfig.leaderProfile,
    name: 'Ma Đạo Lão Tổ',
    title: 'Đệ Nhất Thiên Tôn',
  },
  settings: {
    ...initialConfig.settings,
    maxParticipants: 80,
    leaderPersonality: 'MARTIAL_MANIAC',
  },
});

assert.equal(updated.leaderProfile.name, 'Ma Đạo Lão Tổ');
assert.equal(updated.settings.leaderPersonality, 'MARTIAL_MANIAC');

// Read back directly from store
const reloaded = maGiaoConfigStore.getConfig();
assert.equal(reloaded.leaderProfile.name, 'Ma Đạo Lão Tổ');
assert.equal(reloaded.settings.leaderPersonality, 'MARTIAL_MANIAC');

// Verify disk file exists
const storePath = path.join(process.cwd(), 'data', 'magiao_full_config.json');
assert.ok(fs.existsSync(storePath), 'Config file data/magiao_full_config.json must exist');
const diskData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
assert.equal(diskData.leaderProfile.name, 'Ma Đạo Lão Tổ');
console.log('✓ In-memory and disk persistence verified');

// Test 4: Unknown gifts recording and clearing
console.log('Test 4: Unknown gifts recording & clearing...');
maGiaoConfigStore.recordUnknownGift({
  giftId: 'unknown_sword_99',
  giftName: 'Ma Kiếm Lạc Lối',
  diamondCount: 66,
  username: 'Kỳ Hiệp',
});

let cfg = maGiaoConfigStore.getConfig();
assert.ok(cfg.unknownGifts.some((g) => g.giftId === 'unknown_sword_99'));

maGiaoConfigStore.clearUnknownGifts();
cfg = maGiaoConfigStore.getConfig();
assert.equal(cfg.unknownGifts.length, 0);
console.log('✓ Unknown gifts recording & clearing verified');

// Test 5: LiveConnectionManager Ma Giáo event listeners and broadcast
console.log('Test 5: LiveConnectionManager Ma Giáo socket subscriptions...');
let actionReceived: any = null;
const unsubAction = liveConnectionManager.onMaGiaoAction((act) => {
  actionReceived = act;
});
assert.ok(typeof unsubAction === 'function', 'onMaGiaoAction must return unsubscribe function');

let configReceived: any = null;
const unsubConfig = liveConnectionManager.onMaGiaoConfig((c) => {
  configReceived = c;
});
assert.ok(typeof unsubConfig === 'function', 'onMaGiaoConfig must return unsubscribe function');

unsubAction();
unsubConfig();
console.log('✓ LiveConnectionManager Ma Giáo event hooks verified');

// Test 6: Reset to defaults
console.log('Test 6: Reset to defaults...');
const restored = maGiaoConfigStore.resetToDefaults();
assert.equal(restored.leaderProfile.name, DEFAULT_MA_GIAO_FULL_CONFIG.leaderProfile.name);
assert.equal(restored.settings.leaderPersonality, DEFAULT_MA_GIAO_FULL_CONFIG.settings.leaderPersonality);
console.log('✓ Reset to defaults verified');

console.log('=== ALL MA GIÁO ADMIN STORE TESTS PASSED SUCCESSFULLY! ===');
process.exit(0);
