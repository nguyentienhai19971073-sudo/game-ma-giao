# CHÙA ONLINE 3D — Bản sửa bảng Xin Xăm nhỏ gọn, số quẻ không xuống dòng

Cập nhật từ bản CHUA ONLINE 3D 8s XinXam Giua Ten Co Dinh.

## Thay đổi
- Bảng Xin Xăm nằm giữa khung game, rộng tối đa 80% khung và 520px; cao tối đa 28% (chế độ gọn).
- Giảm nhẹ kích thước chữ, avatar và khoảng cách; tóm tắt nội dung trên bảng ngắn hơn, không tác động nội dung quẻ đã lưu hoặc VieNeuTTS đọc đầy đủ.
- Dòng QUẺ XĂM 16 dùng font Plus Jakarta Sans, chữ và số giữ cùng một dòng; loại xăm có thể chuyển dòng riêng trên màn hình quá hẹp.
- Giữ mặc định thời lượng: bình luận 8s, sự kiện 8s, bảng giữa 8s, Xin Xăm 10s; tên nhân vật hiện đến khi rời chùa.

## Cập nhật bản vá vào MacBook
1. Trong Terminal đang chạy, nhấn Ctrl+C.
2. cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
3. unzip -o ~/Downloads/Chua_Online_3D_PATCH_XinXam_Gon_Font_So_Khong_Rot.zip -d .
4. npm run dev
5. Mở http://localhost:3000 và dùng Quản trị & Demo để test.

Các thanh chỉnh kích thước, cỡ chữ, độ trong suốt và thời gian tiếp tục khả dụng trong Quản trị & Demo. Cài đặt đã lưu có thể ghi đè mặc định.
