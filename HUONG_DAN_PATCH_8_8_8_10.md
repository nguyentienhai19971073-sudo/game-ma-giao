# CHÙA ONLINE 3D – Bản sửa 8/8/8/10 và nhãn tên cố định

## Tính năng

- Bình luận trên đầu Phật tử mặc định 8 giây; tên Phật tử vẫn hiện trong thời gian người đó còn trong scene.
- Thông báo sự kiện (kể cả huy hiệu lễ) 8 giây, bảng nghi lễ giữa màn hình 8 giây, kết quả Xin Xăm 10 giây.
- Thời lượng vẫn có thể chỉnh qua Quản trị & Demo. Các giá trị mặc định cũ trong localStorage / máy chủ sẽ được nâng cấp; cài đặt tùy chỉnh khác được giữ.
- Bảng kết quả Xin Xăm nằm giữa **khung hình game** 9:16, không tính theo toàn bộ cửa sổ Chrome.
- Avatar và username ở **hàng riêng, rộng toàn bảng**; cỡ chữ được tăng để dễ đọc hơn.
- Tên trên đầu Phật tử ưu tiên luôn hiển thị ngay cả khi nhãn khác quá gần (có thể chồng nhãn khi rất đông).
- Giữ nguyên toàn bộ dữ liệu quẻ, giọng VieNeu, vị trí ghế, thảm quỳ, nghi lễ và TikTok LIVE.

## Áp dụng nhanh trên MacBook (đang chạy bản trước)

1. Tải file `Chua_Online_3D_PATCH_8s_XinXam_CanGiua_TenLienTuc.zip` vào Downloads.
2. Trong Terminal chạy game, nhấn **Control + C**.
3. Dán lần lượt:

```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
unzip -o ~/Downloads/Chua_Online_3D_PATCH_8s_XinXam_CanGiua_TenLienTuc.zip -d .
npm run dev
```

4. Mở `http://localhost:3000` rồi dùng Quản trị & Demo test người dùng, bình luận và Xin Xăm.

Nếu bạn trước đó tự đặt thời lượng bằng thanh điều chỉnh, hệ thống giữ cài đặt tùy chỉnh. Muốn chính xác 8–8–8–10, chỉnh lại bốn thanh thời lượng trong Quản trị & Demo; bấm Lưu trong phần Xin Xăm.

## Các file cập nhật
- `server/fortuneStore.ts`
- `src/components/three/TempleScene.tsx`
- `src/components/ui/AdminDashboard.tsx`
- `src/components/ui/XinXamResultPanel.tsx`
- `src/systems/LabelCollisionManager.ts`
- `src/systems/OverlayTheme.ts`
- `src/systems/TikTokEventManager.ts`
- `src/systems/XinXamRegistry.ts`
- `src/types/temple.ts`
