# CHÙA ONLINE 3D — Bản vá tương thích TikTok LIVE Connector 2.5

## Đã sửa

- Nhận nội dung bình luận từ `data.content` (fallback `data.comment`).
- Nhận TikTok user ID từ `data.user.id`, tên @ từ `data.user.displayId` (fallback schema cũ).
- Đọc metadata quà mới từ `data.gift`: tên, loại, xu, ảnh (vẫn fallback schema cũ).
- Tách xử lý combo quà từ khử trùng `msgId` để không bỏ nhầm các bước cập nhật.
- Đọc `count` của Like và `total` của ROOM_USER theo schema mới.

## Cài trên MacBook đang chạy game

1. Tải ZIP này về ~/Downloads.
2. Dừng game đang chạy trong Terminal bằng Control + C.
3. Dán:

```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
cp server/tiktokAdapter.ts server/tiktokAdapter.ts.bak
unzip -o ~/Downloads/Chua_Online_3D_PATCH_TikTok_LIVE_2_5.zip -d .
npm run dev
```

Không phải chạy lại `npm install`. File `.env` không thay đổi.

## Kiểm tra kết nối thật

1. Phát TikTok LIVE từ tài khoản chủ phòng.
2. Vào CHÙA ONLINE > QUẢN TRỊ & DEMO > TikTok LIVE.
3. Nhập `@ten_tai_khoan` chủ phòng (không dùng số ID nội bộ người xem).
4. Nhấn KẾT NỐI LIVE, xác nhận trạng thái LIVE và Room ID xuất hiện.
5. Dùng tài khoản khác để bình luận (phải thấy tên Phật tử và bình luận trên đầu).
6. Thử quà đã map Gift ID và xem nghi lễ; quà chưa map chỉ xuất hiện trong danh sách "Chưa cấu hình".

Kiểm tra nhanh trạng thái bằng Terminal khác:

```bash
curl -s http://127.0.0.1:3000/api/health | python3 -c 'import json,sys; x=json.load(sys.stdin)["connection"]; print({k:x.get(k) for k in ("status","tiktokUsername","roomId","receiverActive","incomingEventCount","lastError")})'
```

## Giới hạn và bảo mật

Bản vá được thử với các payload TikTok 2.5 *giả lập*, không phải phiên LIVE thật. Kết nối sử dụng thư viện không chính thức, nên TikTok có thể thay đổi giao thức hoặc chặn kết nối. `server.ts` hiện có endpoint webhook và kết nối không yêu cầu xác thực quản trị — tránh mở cổng 3000 cho Internet khi chưa bổ sung bảo mật.
