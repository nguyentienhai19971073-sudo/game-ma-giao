# CHÙA ONLINE — Bình luận trên đầu Phật tử: 12 giây

Bản vá chỉ đổi thời gian mặc định bong bóng bình luận từ 8 giây thành 12 giây.

- Sau 12 giây: chỉ bong bóng bình luận tự biến mất.
- Bảng tên vẫn bám theo đầu nhân vật và chỉ biến mất khi Phật tử rời chùa.
- Thông báo sự kiện: 8 giây (giữ nguyên).
- Bảng nghi lễ giữa màn hình: 8 giây (giữ nguyên).
- Kết quả Xin Xăm: 10 giây (giữ nguyên).
- Vẫn tùy chỉnh được thời lượng bình luận trong Quản trị & Demo.
- Tự cập nhật một lần từ mốc 8 giây hoặc 15 giây mặc định cũ trong localStorage; các điều chỉnh sau đó sẽ được lưu bình thường.

## Cài đặt trên MacBook

1. Tải ZIP bản vá về ~/Downloads.
2. Trong Terminal chạy game, nhấn Control + C.
3. Chạy:

```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
unzip -o ~/Downloads/Chua_Online_3D_PATCH_Binh_Luan_12_Giay.zip -d .
npm run dev
```

4. Mở http://localhost:3000 và thử bình luận Demo. Có thể cần tải lại trang trình duyệt.

Không cần `npm install`. Không đưa `.env` hoặc API key vào bản vá.
