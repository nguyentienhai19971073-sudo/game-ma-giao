# CHÙA ONLINE — TĂNG KÍCH THƯỚC CÁC BẢNG (TRỪ KẾT QUẢ XIN XĂM)

Bản vá áp dụng trực tiếp trên các file đang có trong máy Mac, không ghi đè các tính năng TikTok LIVE, Gemini/VieNeu, Gift ID hoặc các bản vá bạn đã cài trước đó.

## Cài đặt

1. Dừng `npm run dev` trong Terminal bằng `Control + C`.
2. Tải `Chua_Online_3D_PATCH_Tang_Cac_Bang_Tru_Xin_Xam.zip` vào Downloads.
3. Mở Terminal và chạy:

```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
unzip -o ~/Downloads/Chua_Online_3D_PATCH_Tang_Cac_Bang_Tru_Xin_Xam.zip -d .
python3 apply_tang_co_cac_bang_tru_xin_xam.py
npm run dev
```

4. Mở `http://localhost:3000` trong Chrome rồi nhấn `Command + Shift + R`.
5. Nếu OBS không cập nhật ngay: nhấn chuột phải vào nguồn **Trình duyệt** > **Thuộc tính** > **Refresh cache of current page / Làm mới**.

## Điều chỉnh

- **BẢNG CÔNG ĐỨC**: rộng hơn khoảng 15%, chữ to hơn.
- **CÚNG DƯỜNG CẦU AN**: rộng vừa đủ để chữ to hơn, vẫn giữ 2 cột trái/phải và giá xu căn phải; giảm padding-right đã cài trước đó vẫn giữ nguyên.
- **Thông báo sự kiện / giọng đọc**: chữ rõ hơn, khung rộng hơn.
- **Bảng nghi lễ giữa màn hình**, **huy hiệu nghi lễ**: chữ/ảnh tăng theo tỷ lệ.
- **Bảng tên và bình luận trên đầu Phật tử**: tăng nhẹ font và kích thước, có cập nhật tính toán tránh chồng lấn.
- **Thanh trên**: chữ tiêu đề, số Phật tử và lượt thích lớn hơn.
- **KẾT QUẢ XIN XĂM**: KHÔNG sửa kích thước, font hoặc cấu hình.
- **Thời gian hiển thị**: giữ nguyên cấu hình đã chọn.

Bản vá tự sao lưu các file được thay vào `*.before_ui_enlarge.bak`, và chạy lại script lần hai sẽ không nhân đôi kích thước.

Lưu ý: hình ảnh thật cần kiểm tra trong OBS 9:16, đặc biệt khi rất đông Phật tử; bảng tên có thể gần nhau trên màn hình nhỏ.
