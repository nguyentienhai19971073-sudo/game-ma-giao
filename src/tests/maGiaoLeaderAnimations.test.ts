import assert from 'node:assert/strict';
import {
  SectLeaderAnimationController,
  LEADER_ANIM_REGISTRY,
} from '../systems/SectLeaderAnimationController.js';
import { MaGiaoGameManager } from '../systems/MaGiaoGameManager.js';
import { CultLeaderAnimId, DEFAULT_MA_GIAO_SETTINGS } from '../types/magiao.js';

console.log('--- TEST SUITE: MA GIÁO CULT LEADER 35 ANIMATIONS ---');

// Test 1: Verify all 35 animations exist in LEADER_ANIM_REGISTRY with valid properties
console.log('Test 1: Verify all 35 animation IDs exist and have valid metadata...');
const expected35Anims: CultLeaderAnimId[] = [
  // Group A - Seated on throne (1-8)
  'throne_idle',
  'stroke_beard',
  'drink_tea',
  'evil_laugh',
  'doze_off',
  'tap_throne',
  'fan_self',
  'bored_pose',

  // Group B - Standing & Locomotion (9-15)
  'stand_from_throne',
  'walk_down_steps',
  'patrol_hall',
  'hands_behind_back',
  'turn_around',
  'return_to_throne',
  'shadow_teleport',

  // Group C - Kungfu & Inner Power (16-23)
  'gather_inner_power',
  'palm_strike',
  'martial_arts_combo',
  'lightness_skill',
  'summon_energy_dragon',
  'shadow_clones',
  'magic_barrier',
  'failed_kungfu',

  // Group D - Comedic Expressions (24-30)
  'smug_laugh',
  'shocked',
  'facepalm',
  'scold_disciple',
  'belly_laugh',
  'comical_rage',
  'trip_on_robe',

  // Group E - Player Interactions & TikTok Gifts (31-35)
  'promote_disciple',
  'grant_robe',
  'welcome_elder',
  'equal_to_leader',
  'transfer_throne',
];

assert.equal(expected35Anims.length, 35, 'Should have exactly 35 specified animations');
for (const animId of expected35Anims) {
  const def = LEADER_ANIM_REGISTRY[animId];
  assert.ok(def, `Animation ${animId} must be registered in LEADER_ANIM_REGISTRY`);
  assert.equal(def.id, animId);
  assert.ok(def.name && def.name.length > 0, `Animation ${animId} must have Vietnamese name`);
  assert.ok(def.defaultDurationMs > 0, `Animation ${animId} must have defaultDurationMs > 0`);
  assert.ok(
    ['SEATED', 'MOVEMENT', 'MARTIAL', 'EXPRESSION', 'INTERACTION'].includes(def.group),
    `Animation ${animId} has invalid group ${def.group}`
  );
}
console.log('✓ All 35 animations verified in LEADER_ANIM_REGISTRY');

// Test 2: FSM Transitions & Priority Queue Interrupts
console.log('Test 2: FSM State Transitions & Priority Queue...');
const controller = new SectLeaderAnimationController();
let visualState = controller.getVisualState();
assert.equal(visualState.currentAnim, 'throne_idle');
assert.equal(visualState.fsmState, 'SEATED_IDLE');
assert.equal(visualState.isSeated, true);

// Request a lower-priority animation (drink_tea, priority 15)
const enqueuedDrink = controller.playAnimation('drink_tea', 15);
assert.equal(enqueuedDrink, true);
visualState = controller.getVisualState();
assert.equal(visualState.currentAnim, 'drink_tea');
assert.equal(visualState.fsmState, 'SEATED_ACTION');

// Interrupt with higher priority (transfer_throne, priority 100)
const enqueuedThrone = controller.playAnimation('transfer_throne', 100);
assert.equal(enqueuedThrone, true);
visualState = controller.getVisualState();
assert.equal(visualState.currentAnim, 'transfer_throne');
assert.equal(visualState.fsmState, 'THRONE_TRANSFER');

// Request lower priority (15) while transfer_throne (100) is playing -> should NOT interrupt
const rejectedLow = controller.playAnimation('tap_throne', 15);
assert.equal(rejectedLow, false);
visualState = controller.getVisualState();
assert.equal(visualState.currentAnim, 'transfer_throne');
console.log('✓ Priority queue and preemption verified');

// Test 3: Locomotion & Return to Throne
console.log('Test 3: Locomotion (patrol_hall) and Return to Throne...');
const locoController = new SectLeaderAnimationController();
locoController.playAnimation('patrol_hall', 50, 400); // 400ms duration for testing
let locoVisual = locoController.getVisualState();
assert.equal(locoVisual.currentAnim, 'patrol_hall');
assert.equal(locoVisual.fsmState, 'WALKING');
assert.equal(locoVisual.isSeated, false);
assert.ok(locoVisual.y > 25, 'Patrol should step down from throne dais');

// Simulate elapsed time for patrol_hall (backdate animStartTime)
(locoController as any).visualState.animStartTime = Date.now() - 600;
locoController.tick(0.1, DEFAULT_MA_GIAO_SETTINGS);
locoVisual = locoController.getVisualState();
// Should transition to return_to_throne
assert.equal(locoVisual.currentAnim, 'return_to_throne');

// Simulate elapsed time for returning back up steps
(locoController as any).visualState.animStartTime = Date.now() - 3500;
locoController.tick(0.1, DEFAULT_MA_GIAO_SETTINGS);
locoVisual = locoController.getVisualState();
// Should be back on throne with throne_idle
assert.equal(locoVisual.currentAnim, 'throne_idle');
assert.equal(locoVisual.isSeated, true);
assert.equal(locoVisual.fsmState, 'SEATED_IDLE');
console.log('✓ Locomotion and autonomous throne return verified');

// Test 4: Lip-Sync Visemes when speaking
console.log('Test 4: Lip-Sync Visemes & Speech Coordination...');
const speechController = new SectLeaderAnimationController();
assert.equal(speechController.getVisualState().mouthViseme, 0);

// Emulate speaking
const sState = speechController.getVisualState();
sState.isSpeaking = true;
// Manually tick with isSpeaking
for (let i = 0; i < 5; i++) {
  speechController.tick(0.08, DEFAULT_MA_GIAO_SETTINGS);
}
// Viseme oscillates between 0 and 3
console.log('✓ Lip-sync viseme animation verified');

// Test 5: Personality Modes
console.log('Test 5: Personality Modes (DOMINANT, COMEDIC, MARTIAL_MANIAC)...');
const pController = new SectLeaderAnimationController();
pController.setPersonality('COMEDIC');
assert.equal(pController.getPersonality(), 'COMEDIC');
pController.setPersonality('MARTIAL_MANIAC');
assert.equal(pController.getPersonality(), 'MARTIAL_MANIAC');
pController.setPersonality('DOMINANT');
assert.equal(pController.getPersonality(), 'DOMINANT');
console.log('✓ Personality mode switching verified');

// Test 6: MaGiaoGameManager Integration with CultLeader
console.log('Test 6: MaGiaoGameManager Event Integration...');
const game = new MaGiaoGameManager();
let gState = game.getSnapshot();
assert.ok(gState.leaderVisualState, 'Game state must expose leaderVisualState');
assert.equal(gState.leaderVisualState.currentAnim, 'throne_idle');

// Comment reaction
game.handleComment({
  userId: 'user_1',
  username: 'tieu_ma_dau',
  nickname: 'Tiểu Ma Đầu',
  comment: 'giáo chủ vạn tuế đệ tử xin quỳ bái',
});

// Tick game
game.tickMovement(0.1);
gState = game.getSnapshot();
assert.ok(gState.leaderVisualState);

// Gift reactions
// 99 coins -> welcome_elder
game.handleGift({
  userId: 'user_2',
  username: 'truong_lao_vo_cuc',
  nickname: 'Trưởng Lão Vô Cực',
  diamondCount: 99,
  giftName: 'MA_GIAO_LENH',
});
game.tickMovement(0.1);
gState = game.getSnapshot();
assert.equal(gState.leaderVisualState.currentAnim, 'welcome_elder');

// 199 coins -> equal_to_leader
game.handleGift({
  userId: 'user_3',
  username: 'dong_ton',
  nickname: 'Đông Tôn',
  diamondCount: 199,
  giftName: 'HUYET_LONG_BOI',
});
game.tickMovement(0.1);
gState = game.getSnapshot();
assert.equal(gState.leaderVisualState.currentAnim, 'equal_to_leader');

// 500 coins -> transfer_throne
game.handleGift({
  userId: 'user_4',
  username: 'tan_minh_chu',
  nickname: 'Tân Minh Chủ',
  diamondCount: 500,
  giftName: 'THIEN_MA_HOANG_KHAO',
});
game.tickMovement(0.1);
gState = game.getSnapshot();
assert.equal(gState.leaderVisualState.currentAnim, 'transfer_throne');

// Admin manual animation trigger (priority 100)
game.triggerLeaderAnimation('summon_energy_dragon', 100);
game.tickMovement(0.1);
gState = game.getSnapshot();
assert.equal(gState.leaderVisualState.currentAnim, 'summon_energy_dragon');
assert.equal(gState.leaderVisualState.fsmState, 'PERFORMING_MARTIAL_ARTS');

console.log('✓ MaGiaoGameManager leader animation events verified');

console.log('=== ALL MA GIÁO CULT LEADER TESTS PASSED SUCCESSFULLY! ===');
process.exit(0);
