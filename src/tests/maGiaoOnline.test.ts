/**
 * MA GIÁO ONLINE – THIÊN HẠ ĐỆ NHẤT TÀ PHÁI
 * Automated Test Suite verifying core game engine, ranks, minigames, and dialogue bank.
 */

import assert from 'node:assert/strict';
import { MA_GIAO_RANKS, MaGiaoRankId } from '../types/magiao';
import {
  IDLE_THOUGHTS,
  PROMOTION_DIALOGUES,
  RECRUIT_WELCOMES,
  SILLY_EVIL_BOASTS,
  TEASE_REGULARS,
  TRAINING_COMMANDS,
  TRAINING_RESULTS,
} from '../data/maGiaoDialogues';
import { maGiaoGameManager } from '../systems/MaGiaoGameManager';
import { maGiaoMovementManager } from '../systems/MaGiaoMovementManager';

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    throw err;
  }
}

console.log('\n--- BẮT ĐẦU KIỂM THỬ MA GIÁO ONLINE ---');

// 1. Kiểm tra kho thoại hơn 300 câu theo đúng 7 danh mục
runTest('1. Kho thoại Giáo Chủ đầy đủ hơn 300 câu phân loại chuẩn', () => {
  assert.ok(SILLY_EVIL_BOASTS.length >= 100, `Khoe tà ác ngớ ngẩn: ${SILLY_EVIL_BOASTS.length}/100 câu`);
  assert.ok(RECRUIT_WELCOMES.length >= 40, `Chào người mới: ${RECRUIT_WELCOMES.length}/40 câu`);
  assert.ok(TEASE_REGULARS.length >= 30, `Trêu chọc khách quen: ${TEASE_REGULARS.length}/30 câu`);

  let promoCount = 0;
  for (const list of Object.values(PROMOTION_DIALOGUES)) {
    promoCount += list.length;
  }
  assert.ok(promoCount >= 40, `Phong chức theo cấp bậc: ${promoCount} câu`);

  let trainingCmdCount = 0;
  for (const list of Object.values(TRAINING_COMMANDS)) {
    trainingCmdCount += list.length;
  }
  assert.ok(trainingCmdCount >= 30, `Điều hành luyện võ: ${trainingCmdCount} câu`);

  const resultsCount = TRAINING_RESULTS.victory.length + TRAINING_RESULTS.defeat.length;
  assert.ok(resultsCount >= 20, `Tổng kết thắng thua: ${resultsCount}/20 câu`);
  assert.ok(IDLE_THOUGHTS.length >= 20, `Độc thoại khi sảnh vắng: ${IDLE_THOUGHTS.length}/20 câu`);

  const grandTotal =
    SILLY_EVIL_BOASTS.length +
    RECRUIT_WELCOMES.length +
    TEASE_REGULARS.length +
    promoCount +
    trainingCmdCount +
    resultsCount +
    IDLE_THOUGHTS.length;

  assert.ok(grandTotal >= 300, `Tổng số câu thoại phải đạt ít nhất 300 câu (hiện có: ${grandTotal})`);
});

// 2. Hệ thống 9 cấp bậc Ma Giáo chuẩn xác
runTest('2. 9 cấp bậc Ma Giáo với ngưỡng xu và danh hiệu', () => {
  const expectedRanks: Array<{ id: MaGiaoRankId; coins: number }> = [
    { id: 'DAN_DEN', coins: 0 },
    { id: 'NGOAI_MON', coins: 1 },
    { id: 'NOI_MON', coins: 5 },
    { id: 'SU_HUYNH', coins: 10 },
    { id: 'TINH_ANH', coins: 20 },
    { id: 'HO_PHAP', coins: 50 },
    { id: 'DAI_TRUONG_LAO', coins: 99 },
    { id: 'DONG_TON_GIAO_CHU', coins: 199 },
    { id: 'TAN_GIAO_CHU', coins: 500 },
  ];

  for (const r of expectedRanks) {
    const meta = MA_GIAO_RANKS[r.id];
    assert.ok(meta, `Cấp bậc ${r.id} phải tồn tại`);
    assert.equal(meta.minCoins, r.coins, `Mốc xu của ${r.id} phải là ${r.coins}`);
    assert.ok(meta.title.length > 0, `Chức danh của ${r.id} không được để trống`);
  }
});

// 3. Gia nhập sảnh & chống trùng lặp nhân vật
runTest('3. Gia nhập đại điện, cấp phát vị trí và không tạo trùng', () => {
  maGiaoGameManager.clearParticipants();

  // Khán giả bình luận lần đầu -> tạo nhân vật Dân Đen
  maGiaoGameManager.handleComment({
    userId: 'user_1',
    username: 'DocCoKiem',
    comment: 'Chào Giáo Chủ!',
  });

  const snap1 = maGiaoGameManager.getSnapshot();
  assert.equal(snap1.participants.length, 1);
  assert.equal(snap1.participants[0].username, 'DocCoKiem');
  assert.equal(snap1.participants[0].rank, 'DAN_DEN');
  assert.ok(snap1.participants[0].seatIndex >= 0 && snap1.participants[0].seatIndex < 80);

  // Khán giả bình luận lần hai -> cập nhật bình luận, không tăng số lượng nhân vật
  maGiaoGameManager.handleComment({
    userId: 'user_1',
    username: 'DocCoKiem',
    comment: 'Tuyệt kỹ Ma Quyền đỉnh quá!',
  });

  const snap2 = maGiaoGameManager.getSnapshot();
  assert.equal(snap2.participants.length, 1, 'Không được tạo trùng nhân vật');
  assert.equal(snap2.participants[0].lastComment, 'Tuyệt kỹ Ma Quyền đỉnh quá!');
});

// 4. Tặng quà, cộng dồn xu, thăng cấp và Tân Giáo Chủ đăng quang
runTest('4. Tích lũy xu, thăng cấp liên tục và Tân Giáo Chủ soán ngôi', () => {
  maGiaoGameManager.clearParticipants();

  maGiaoGameManager.handleComment({
    userId: 'user_hero',
    username: 'LenhHoXung',
    comment: 'Tiểu đệ bái kiến!',
  });

  // Tặng 1 xu -> Ngoại Môn Đồ Đệ
  maGiaoGameManager.handleGift({
    userId: 'user_hero',
    username: 'LenhHoXung',
    diamondCount: 1,
    repeatCount: 1,
  });
  assert.equal(maGiaoGameManager.getSnapshot().participants[0].rank, 'NGOAI_MON');

  // Tặng thêm 9 xu (tổng 10 xu) -> Sư Huynh
  maGiaoGameManager.handleGift({
    userId: 'user_hero',
    username: 'LenhHoXung',
    diamondCount: 9,
    repeatCount: 1,
  });
  assert.equal(maGiaoGameManager.getSnapshot().participants[0].rank, 'SU_HUYNH');

  // Tặng thêm 189 xu (tổng 199 xu) -> Đồng Tôn Giáo Chủ
  maGiaoGameManager.handleGift({
    userId: 'user_hero',
    username: 'LenhHoXung',
    diamondCount: 189,
    repeatCount: 1,
  });
  const snapDongTon = maGiaoGameManager.getSnapshot();
  assert.equal(snapDongTon.participants[0].rank, 'DONG_TON_GIAO_CHU');
  assert.ok(snapDongTon.coLeader, 'Đồng Tôn Giáo Chủ phải được xếp chỗ cạnh ngai');

  // Tặng quà tối cao (Sư Tử 500 xu) -> TÂN GIÁO CHỦ ĐĂNG QUANG!
  maGiaoGameManager.handleGift({
    userId: 'user_hero',
    username: 'LenhHoXung',
    diamondCount: 301,
    repeatCount: 1,
  });
  const snapTanGiaoChu = maGiaoGameManager.getSnapshot();
  assert.equal(snapTanGiaoChu.participants[0].rank, 'TAN_GIAO_CHU');
  assert.equal(snapTanGiaoChu.throneLeader.username, 'LenhHoXung', 'Tân Giáo Chủ phải tiếp quản ngai vàng');
  assert.equal(snapTanGiaoChu.coLeader?.title, 'Thái Thượng Giáo Chủ', 'Cựu Giáo Chủ chuyển thành Thái Thượng');
});

// 5. Ba màn luyện võ, nhận diện từ khóa và cơ chế Quét Sân
runTest('5. Ba màn luyện võ, tính điểm và cơ chế phục hồi từ Khu Quét Sân', () => {
  maGiaoGameManager.clearParticipants();

  // Tạo 5 đệ tử
  for (let i = 1; i <= 5; i++) {
    maGiaoGameManager.handleComment({
      userId: `disciple_${i}`,
      username: `DeTu_${i}`,
      comment: 'Có mặt!',
    });
  }

  // Khởi động Màn 1: Ma Quyền Loạn Vũ
  maGiaoGameManager.startTrainingMinigame('MA_QUYEN_LOAN_VU');
  assert.equal(maGiaoGameManager.getSnapshot().currentScene, 'TRAINING_ARENA');

  // Đệ tử 1 và 2 bình luận "múa"
  maGiaoGameManager.handleComment({
    userId: 'disciple_1',
    username: 'DeTu_1',
    comment: 'múa dẻo quẹo nè',
  });
  maGiaoGameManager.handleComment({
    userId: 'disciple_2',
    username: 'DeTu_2',
    comment: 'MÚA liên hoàn quyền',
  });

  const snapTraining = maGiaoGameManager.getSnapshot();
  assert.equal(snapTraining.trainingState.participantsDone.length, 2);

  // Đệ tử 3 chưa hoàn thành và bị đưa vào khu quét sân
  maGiaoGameManager.handleComment({
    userId: 'disciple_3',
    username: 'DeTu_3',
    comment: 'Em xin lỗi em mải ăn bánh',
  });

  // Đưa vào khu quét sân
  maGiaoGameManager.setParticipantSweeping('disciple_3', true);
  assert.equal(maGiaoGameManager.getSnapshot().sweepers.length, 1);

  // Khi đệ tử 3 bình luận lại -> ngay lập tức được giải phóng khỏi Khu Quét Sân!
  maGiaoGameManager.handleComment({
    userId: 'disciple_3',
    username: 'DeTu_3',
    comment: 'Em hứa chăm chỉ luyện võ!',
  });

  const snapRestored = maGiaoGameManager.getSnapshot();
  const p3Restored = snapRestored.participants.find((p) => p.userId === 'disciple_3')!;
  assert.equal(p3Restored.isSweeping, false, 'Đệ tử phải trở về sảnh chính ngay khi bình luận lại');
  maGiaoGameManager.returnToGrandPalace();
});

// 6. Phân vùng đại điện (Zone A, B, C, D, E) và vật cản ngai vàng
runTest('6. Nhận diện 5 phân khu đại điện và giới hạn vật cản ngai vàng', () => {


  // Zone A: Thềm ngai
  assert.equal(maGiaoMovementManager.getZoneAt(50, 35), 'ZONE_A_THRONE');

  // Zone B: Hành lang trung tâm
  assert.equal(maGiaoMovementManager.getZoneAt(50, 60), 'ZONE_B_AISLE');

  // Zone C: Sân luyện võ tả/hữu
  assert.equal(maGiaoMovementManager.getZoneAt(20, 58), 'ZONE_C_MARTIAL');
  assert.equal(maGiaoMovementManager.getZoneAt(75, 58), 'ZONE_C_MARTIAL');

  // Zone D: Khu thiền định bồ đoàn
  assert.equal(maGiaoMovementManager.getZoneAt(20, 80), 'ZONE_D_MEDITATE');
  assert.equal(maGiaoMovementManager.getZoneAt(75, 80), 'ZONE_D_MEDITATE');

  // Zone E: Khu giao lưu đàm đạo
  assert.equal(maGiaoMovementManager.getZoneAt(25, 42), 'ZONE_E_SOCIAL');

  // Tránh vật cản ngai vàng: nhân vật không được xuyên qua ngai (x: 50, y: 20 -> clamp xuống y >= 34)
  const clamped = maGiaoMovementManager.clampPoint(50, 20);
  assert.ok(clamped.y >= 34, `Tọa độ y phải bị đẩy ra ngoài bục ngai: ${clamped.y}`);
});

// 7. Nhận diện lệnh bình luận điều khiển hành động
runTest('7. Phân tích bình luận khán giả thành 15 hành động võ hiệp', () => {


  assert.equal(maGiaoMovementManager.parseCommentToAction('chạy mau lên')?.action, 'run');
  assert.equal(maGiaoMovementManager.parseCommentToAction('đi dạo sảnh')?.action, 'walk');
  assert.equal(maGiaoMovementManager.parseCommentToAction('đấm một quyền')?.action, 'punch');
  assert.equal(maGiaoMovementManager.parseCommentToAction('đá liên hoàn cước')?.action, 'kick');
  assert.equal(maGiaoMovementManager.parseCommentToAction('múa võ đi sư huynh')?.action, 'combo');
  assert.equal(maGiaoMovementManager.parseCommentToAction('nhảy lên')?.action, 'jump');
  assert.equal(maGiaoMovementManager.parseCommentToAction('né đòn')?.action, 'dodge');
  assert.equal(maGiaoMovementManager.parseCommentToAction('ngồi thiền tĩnh tâm')?.action, 'meditate');
  assert.equal(maGiaoMovementManager.parseCommentToAction('đứng dậy')?.action, 'stand_up');
  assert.equal(maGiaoMovementManager.parseCommentToAction('bái chào Giáo Chủ')?.action, 'bow');
  assert.equal(maGiaoMovementManager.parseCommentToAction('haha cười rớt nước mắt')?.action, 'laugh');
  assert.equal(maGiaoMovementManager.parseCommentToAction('hoan hô vỗ tay')?.action, 'cheer');
  assert.equal(maGiaoMovementManager.parseCommentToAction('trượt chân ngã rồi')?.action, 'fail');
});

// 8. Tính toán hướng nhìn 4 chiều (Front, Back, Left, Right)
runTest('8. Tính toán hướng nhìn 4 chiều theo vector di chuyển', () => {


  // Đi sâu vào đại điện hướng về ngai (dy < 0) -> nhìn từ phía sau ('back')
  assert.equal(maGiaoMovementManager.calculateFacing(50, 80, 50, 40), 'back');

  // Đi ra ngoài cổng (dy > 0) -> nhìn mặt trước ('front')
  assert.equal(maGiaoMovementManager.calculateFacing(50, 40, 50, 80), 'front');

  // Đi sang trái (dx < 0) -> nhìn sang trái ('left')
  assert.equal(maGiaoMovementManager.calculateFacing(60, 50, 20, 50), 'left');

  // Đi sang phải (dx > 0) -> nhìn sang phải ('right')
  assert.equal(maGiaoMovementManager.calculateFacing(20, 50, 60, 50), 'right');
});

// 9. Mô phỏng di chuyển mượt & cập nhật tọa độ
runTest('9. Cập nhật vị trí mượt theo delta time và tiến trình đến đích', () => {

  const dummyP = {
    id: 'test_mover',
    userId: 'test_mover',
    username: 'TestMover',
    nickname: 'TestMover',
    totalCoins: 0,
    rank: 'DAN_DEN' as const,
    seatIndex: 0,
    x: 50,
    y: 80,
    targetX: 50,
    targetY: 40,
    facing: 'back' as const,
    currentZone: 'ZONE_B_AISLE' as const,
    joinedAt: Date.now(),
    lastActiveAt: Date.now(),
    isSweeping: false,
    actionState: 'walk' as const,
  };

  const initialY = dummyP.y;
  maGiaoMovementManager.updateSimulation([dummyP], maGiaoGameManager.getSnapshot().settings, 0.5);

  assert.ok(dummyP.y < initialY, `Nhân vật phải di chuyển lên trên: ban đầu ${initialY}, sau đó ${dummyP.y}`);
  assert.equal(dummyP.facing, 'back');
});

// 10. Chống va chạm mềm (Soft Collision Repulsion)
runTest('10. Đẩy nhẹ khi hai nhân vật đứng trùng khít một điểm', () => {

  const p1 = {
    id: 'col_1',
    userId: 'col_1',
    username: 'Col1',
    nickname: 'Col1',
    totalCoins: 0,
    rank: 'DAN_DEN' as const,
    seatIndex: 0,
    x: 50.0,
    y: 60.0,
    facing: 'front' as const,
    currentZone: 'ZONE_B_AISLE' as const,
    joinedAt: Date.now(),
    lastActiveAt: Date.now(),
    isSweeping: false,
    actionState: 'idle' as const,
  };
  const p2 = {
    id: 'col_2',
    userId: 'col_2',
    username: 'Col2',
    nickname: 'Col2',
    totalCoins: 0,
    rank: 'DAN_DEN' as const,
    seatIndex: 1,
    x: 50.2,
    y: 60.1,
    facing: 'front' as const,
    currentZone: 'ZONE_B_AISLE' as const,
    joinedAt: Date.now(),
    lastActiveAt: Date.now(),
    isSweeping: false,
    actionState: 'idle' as const,
  };

  maGiaoMovementManager.updateSimulation([p1, p2], maGiaoGameManager.getSnapshot().settings, 0.1);
  const distAfter = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  assert.ok(distAfter > 0.2, `Khoảng cách giữa hai người phải tăng lên: ${distAfter}`);
});

// 11. Hiệu lệnh tập thể: Về đúng bồ đoàn
runTest('11. Hiệu lệnh tập thể Giáo Chủ: Về đúng bồ đoàn (orderFormation)', () => {
  maGiaoGameManager.clearParticipants();
  maGiaoGameManager.handleComment({
    userId: 'p_form_1',
    username: 'PForm1',
    comment: 'Gia nhập!',
  });
  const snap = maGiaoGameManager.getSnapshot();
  const p = snap.participants[0];
  p.x = 80;
  p.y = 85;

  maGiaoGameManager.orderFormation();
  const snapAfter = maGiaoGameManager.getSnapshot();
  const pAfter = snapAfter.participants[0];
  assert.ok(pAfter.targetX !== undefined, 'Phải có targetX về bồ đoàn');
  assert.equal(pAfter.actionState, 'run', 'Đệ tử phải chạy về vị trí');
});

// 12. Hiệu lệnh tập thể: Tất cả đứng dậy luyện võ
runTest('12. Hiệu lệnh tập thể Giáo Chủ: Tất cả luyện võ (orderAllMartial)', () => {
  maGiaoGameManager.orderAllMartial();
  const snap = maGiaoGameManager.getSnapshot();
  for (const p of snap.participants) {
    assert.equal(p.actionState, 'combo', 'Đệ tử phải chuyển sang trạng thái combo võ thuật');
  }
});

// 13. Hiệu lệnh tập thể: Tất cả đi thiền định
runTest('13. Hiệu lệnh tập thể Giáo Chủ: Tất cả thiền định (orderAllMeditate)', () => {
  maGiaoGameManager.orderAllMeditate();
  const snap = maGiaoGameManager.getSnapshot();
  for (const p of snap.participants) {
    assert.equal(p.actionState, 'meditate', 'Đệ tử phải chuyển sang trạng thái ngồi thiền');
  }
});

// 14. Giáo Chủ triệu tập đệ tử lên thềm ngai diện kiến
runTest('14. Triệu tập đệ tử lên trước thềm ngai vàng (summonDiscipleToThrone)', () => {
  const snap = maGiaoGameManager.getSnapshot();
  const p = snap.participants[0];
  maGiaoGameManager.summonDiscipleToThrone(p.userId);

  const snapAfter = maGiaoGameManager.getSnapshot();
  const pAfter = snapAfter.participants[0];
  assert.equal(pAfter.targetX, 50, 'Mục tiêu X phải là chính giữa');
  assert.equal(pAfter.targetY, 35, 'Mục tiêu Y phải là trước ngai vàng');
  assert.equal(pAfter.actionState, 'run');
});

// 15. Tùy chỉnh thông số hoạt động trong Cài Đặt Admin
runTest('15. Lưu và áp dụng thông số hoạt động nhân vật', () => {
  maGiaoGameManager.saveSettings({
    moveSpeed: 1.8,
    maxConcurrentMoving: 25,
    autoMartialEnabled: false,
  });

  const snap = maGiaoGameManager.getSnapshot();
  assert.equal(snap.settings.moveSpeed, 1.8);
  assert.equal(snap.settings.maxConcurrentMoving, 25);
  assert.equal(snap.settings.autoMartialEnabled, false);
});

console.log('🎉 TẤT CẢ 15 BÀI KIỂM THỬ MA GIÁO ONLINE ĐỀU ĐẠT CHUẨN!\n');
maGiaoGameManager.stopTimers();
process.exit(0);
