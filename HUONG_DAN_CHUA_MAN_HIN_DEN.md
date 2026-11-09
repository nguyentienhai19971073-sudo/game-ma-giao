# CHÙA ONLINE — Sửa màn hình đen sau khi chạy một thời gian

## Hiện tượng
Mất hình 3D sau khi chạy Chrome + OBS + TikTok LIVE Studio trong thời gian dài. Không kết luận chắc chắn là WebGL nếu chưa kiểm tra Console / Terminal.

## Bản vá sửa gì?
- Giữ React Three Fiber Canvas đang gắn trên trang khi WebGL bị mất để nó nhận được sự kiện `webglcontextrestored`.
- Nếu không phục hồi, game tự khởi tạo lại renderer tối đa 2 lần (sau 7 giây/lần), để tránh lặp lại vô hạn.
- Thêm `?safe3d=1` để ép chất lượng 3D thấp hơn **chỉ cho cửa sổ OBS có tham số đó**, giảm DPR, tắt bóng/MSAA. Vẫn giữ kích thước video 9:16, kích cỡ chữ, toàn bộ dữ liệu người xem.
- Không sửa bảng Công Đức, Cúng Dường, Xin Xăm, nickname TikTok, bình luận hay API.

## Cài đặt (nên làm sau khi kết thúc LIVE)
```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
# Dừng server bằng Control + C trước
unzip -o ~/Downloads/CHUA_ONLINE_FIX_MAN_HIN_DEN_WEBGL.zip -d .
python3 apply_chua_webgl_black_screen_fix.py
npm run dev
```

Trong OBS → nguồn **Trình duyệt** → **Thuộc tính** → URL `http://localhost:3000/?safe3d=1` → Đồng ý → Làm mới nguồn.

## Nếu còn bị đen
- Chrome cũng đen, nhưng Terminal server vẫn chạy: mở Developer Tools (Option + Command + J), tìm `WebGL context lost`, `Out of memory`, hoặc lỗi JavaScript đỏ, gửi ảnh.
- Chỉ OBS bị đen, Chrome bình thường: ở OBS làm mới nguồn Trình duyệt. Kiểm tra độ phân giải Browser Source, bỏ bớt các nguồn Browser Source trùng.
- Chrome báo localhost không truy cập được: kiểm tra Terminal `npm run dev` có còn chạy và còn dòng `[CHÙA ONLINE] ... listening` không.
- MacBook M1 8GB: cân nhắc OBS 720×1280 30fps nếu 1080×1920 vẫn quá tải; thử chỉ chạy game trong OBS, đóng tab Chrome đang chạy 3D nếu không cần quản trị ở đó.
