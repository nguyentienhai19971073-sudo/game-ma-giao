# CHÙA ONLINE 3D — Nhiều Gift ID kích hoạt cùng nghi lễ

## Cách dùng

1. Mở game ở `http://localhost:3000` → **QUẢN TRỊ & DEMO** → **Quản lý Gift ID**.
2. Ở dòng **CẦU BÌNH AN** (1 xu) nhấn **Sửa**.
3. Giữ **Gift ID chính** hiện tại. Trong ô **NHÓM GIFT ID PHỤ — NHIỀU QUÀ CÙNG MỘT NGHI LỄ**, dán **các Gift ID thật** có giá 1 xu từ TikTok LIVE — mỗi dòng một ID hoặc cách nhau bằng dấu phẩy.
4. Nhấn **Lưu cấu hình**. Mở lại dòng nghi lễ sẽ thấy `+N ID cùng nghi lễ`.
5. Làm tương tự với **CẦU SỨC KHỎE**, **CẦU GIA ĐẠO**, **CẦU TÀI LỘC**, **CẦU CÔNG ĐỨC** (hoặc các nghi lễ bạn đã tạo). Để thêm nhóm cho **Xin Xăm**, nếu chưa có cấu hình Xin Xăm trong danh sách quà thì tạo cấu hình mới, chọn nghi lễ `xin_xam`, bật chức năng Xin Xăm trong Quản trị.
6. Thử TikTok LIVE thật với ít nhất hai Gift ID phụ khác nhau; so sánh ID thật ghi ở sự kiện để xác nhận.

## Cách hoạt động

- Mọi Gift ID trong nhóm (1 ID chính và tối đa 100 ID phụ) kích hoạt **cùng hành động 3D, hiệu ứng, âm thanh, TTS, thời gian chờ, điểm công đức** được cấu hình cho nhóm.
- **Chỉ khớp chính xác Gift ID**, không tự động gán mọi quà có cùng số xu. Bạn cần chọn đúng Gift ID và kiểm tra giá xu trên TikTok.
- Mỗi Gift ID chỉ được nằm trong **một** nhóm; nếu trùng ID hệ thống từ chối lưu và không thay cấu hình cũ.
- Bảng **CÚNG DƯỜNG CẦU AN** chỉ hiện một dòng cho mỗi cấu hình nghi lễ, không xuất hiện hàng loạt dòng trùng nhau.
- Dữ liệu lưu trên máy chủ trong SQLite và backup JSON hiện có, không cần reset danh sách quà. Các Gift ID phụ cũng được lưu khi Xuất JSON và Nhập JSON.
- Gift ID chính trong form vẫn chỉ là **một ID**. Đừng xóa hoặc thay ID chính bằng danh sách ID phân tách dấu phẩy; nhập danh sách vào ô **Gift ID phụ**.
- Nếu bạn thay đổi mệnh giá một quà trên TikTok, hệ thống không tự kiểm tra giá của Gift ID; giá trong form là giá tham chiếu của nhóm.

## Cập nhật trên MacBook

1. Khi Terminal chạy game: nhấn `Control + C`.
2. Sao lưu trước: `cp -a ~/CHUA_ONLINE_TEST/Chua_Online_3D ~/CHUA_ONLINE_TEST/Chua_Online_3D_BACKUP` (bản sao mã nguồn và dữ liệu).
3. Tại Terminal chạy:
   ```bash
   cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
   unzip -o ~/Downloads/Chua_Online_3D_PATCH_Nhieu_Gift_ID_Mot_Nghi_Le.zip -d .
   npm run dev
   ```
4. Mở `http://localhost:3000` và nhấn `Cmd + Shift + R` để tải lại giao diện.

Không cần `npm install`. Không chép đè thư mục `data/` trên máy Mac.
