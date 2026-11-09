# CHÙA ONLINE — V4: Bắt buộc hành lễ giữa + chuyển TRỤ Xin Xăm giữa

Sửa lỗi bản trước: 5 nghi lễ đã cấu hình để `none`, `no_animation`, `seat_prayer` hoặc đổi tiêu đề trong Admin có thể không đi hành lễ. Bản V4 đưa TẤT CẢ quà đã gán nghi lễ vào hàng chờ đi giữa chùa. Giữ hiệu ứng và âm thanh của nghi lễ; Xin Xăm giữ hành động rút quẻ. Trụ Xin Xăm thực sự được dịch vào giữa ở cả chế độ 3D và ảnh nền. Kế thừa bảng thông báo xếp dọc dưới bảng Công Đức.

## Cài (sau khi kết thúc livestream)

```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
unzip -o ~/Downloads/CHUA_ONLINE_FIX_HANH_LE_V4_TRU_XIN_XAM_GIUA.zip -d .
python3 apply_chua_hanh_le_giua_v4.py
npm run build
npm run dev
```

Sau đó **làm mới nguồn Trình duyệt trong OBS và tải lại Chrome**. Lưu ý việc CHÙA ONLINE chạy 2 phiên trình duyệt sẽ gia tăng tải GPU khi LIVE.

## Kiểm chứng

```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
grep -n 'CHUA_GIFT_CENTER_FORCE_ALL_V4' src/systems/TikTokEventManager.ts
grep -nF 'group position={[0, 0, 3.12]}' src/components/three/BuddhaAltar.tsx
grep -nF 'group position={[xinXamStation.x, 0, xinXamStation.z - 1.12]}' src/components/three/TempleScene.tsx
```

Cần cả ba lệnh đều tìm thấy dòng tương ứng. Nếu lệnh `python3` báo lỗi, gửi nguyên thông báo Terminal, đừng sửa thủ công. Giữ nguyên toàn bộ cài đặt bảng, gift, TTS, nickname, thời gian Phật tử và bình luận. Cần kiểm tra thật bằng Demo và phiên LIVE; chưa kiểm thử trực tiếp trên MacBook.
