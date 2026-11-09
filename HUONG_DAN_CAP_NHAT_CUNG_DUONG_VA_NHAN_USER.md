# CHÙA ONLINE 3D — Bảng Cúng Dường gọn và nhãn gắn đầu Phật tử

## Đã thay đổi

1. `src/components/ui/BuddhistGiftPanel.tsx` — Thu gọn chiều cao bảng Cúng Dường (danh sách cuộn tối đa 186px), giảm padding, icon và cỡ chữ một cách có kiểm soát; nội dung tên nghi lễ, tên vật phẩm và số xu vẫn hiển thị đầy đủ theo dòng, không dùng dấu `...`.
2. `src/components/ui/StreamingOverlay.tsx` — Điều chỉnh chiều rộng vùng bảng Cúng Dường để chữ có đủ chỗ, vẫn gọn ở mép phải khung livestream.
3. `src/components/three/TempleScene.tsx` — Tăng số slot nhãn, ưu tiên người đang tương tác nếu đông, dùng đúng tọa độ ghế của chế độ ảnh nền khi chờ nhân vật khởi tạo; cả tên và bình luận cập nhật theo vị trí nhân vật lúc di chuyển, áp dụng hiệu ứng mờ dần trong 5 giây.
4. `src/systems/LabelCollisionManager.ts` — Bố trí bình luận *ngay trên* bảng tên thành một cụm gắn trên đầu nhân vật; giới hạn lệch ngang 10px theo tỷ lệ, không đẩy bảng lên xa hoặc sang mép tượng Phật. Khi đông sẽ tạm ẩn nhãn thấp ưu tiên thay vì đặt nhãn sai người. Không avatar, không thêm tên vào bong bóng bình luận.

## Lưu ý

- Không sửa vị trí ghế, đồ họa Phật tử, hiệu ứng nghi lễ, TikTok LIVE, Xin Xăm, VieNeuTTS hay logic tự rời chùa.
- Kết quả chỉ kiểm tra cú pháp TypeScript/TSX và thuật toán bố trí nhãn với tình huống mô phỏng. Cần kiểm tra hiển thị thực tế khi chạy game; chưa xác nhận build Vite vì môi trường này không có thư viện npm của dự án.
- Trong lúc đông người, một vài tên/bình luận có thể tạm ẩn nếu không có đủ không gian để hiển thị an toàn, nhưng không bị gán nhầm cho nhân vật khác.

## Áp dụng bản vá

Giải nén file ZIP bản vá và chép đè đúng bốn file vào thư mục mã nguồn game hiện có. Sao lưu dự án trước khi chép đè.

## Chạy trên MacBook

Từ thư mục gốc có `package.json`:

```bash
npm install
npm run dev
```

Sau đó mở `http://localhost:3000` (nếu cổng chưa được thay đổi).

## Kiểm thử

- Demo một người bình luận: tên nhỏ nằm ngay trên đầu, bình luận chỉ có nội dung và nằm phía trên tên.
- Cho người đó đứng lên đi dâng hoa: cả hai nhãn di chuyển theo người.
- Thử nhiều Phật tử: nhãn không trùng nhau, không nằm lên tượng Phật.
- Xem bảng Cúng Dường: tất cả nội dung hiển thị đầy đủ trong mỗi hàng, các hàng còn lại cuộn được.
