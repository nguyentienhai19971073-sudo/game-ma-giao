# CHÙA ONLINE 3D — Cập nhật bảng Xin Xăm và Cúng Dường

## Những thay đổi thực tế trong source

1. `XinXamResultPanel.tsx`: đo chiều rộng/chiều cao khung livestream bằng `ResizeObserver` để popup không còn lớn theo toàn bộ cửa sổ Chrome khi xem trước trong Google AI Studio. Giới hạn 85% chiều rộng khung (tối đa 580 px); chế độ thu gọn tối đa 30% chiều cao khung, chế độ chi tiết 42%. Giữ bố cục lời xăm ngắn + lời khuyên và ẩn bớt khoảng trống; nền RGBA 0.55 và chữ vẫn rõ.
2. `BuddhistGiftPanel.tsx` + `StreamingOverlay.tsx`: panel Cúng Dường lấy chiều rộng theo khung game, không dựa `vw` của Chrome. Nhãn, diễn giải và số xu dùng bố cục rõ ràng; bảng cuộn dọc khi có nhiều sự kiện, không cắt chữ bằng dấu `...`.
3. `XinXamManagementPanel.tsx`: thêm cài đặt **Thời lượng hiển thị (3–15 giây)**, **Thu gọn / Chi tiết**, **Cỡ chữ (80–130%)** bên cạnh kích thước và độ trong suốt có sẵn. Giá trị được lưu bằng hệ thống `xinXamRegistry.saveSettings` hiện tại.
4. `OverlayTheme.ts`: hàm `calculateFortunePopupLayout` tính kích thước cho khung game có thể kiểm thử độc lập.
5. `src/index.css`: xử lý ngắt dòng tiếng Việt không cắt từ tùy tiện, không bó hẹp khối chữ.
6. `src/tests/livestreamUpgrade.test.ts`: thêm kiểm tra bố cục ở 720×1280, 1080×1920, 360×640 và khung preview; điều chỉnh kiểm tra mặc định opacity của popup Xin Xăm là 0.55.

**Không chỉnh sửa**: TikTok LIVE, VieNeuTTS, nội dung thẻ xăm, hàng chờ nghi lễ, nhân vật 3D, đồ họa Phật tử.

## Kiểm tra

- Đã kiểm tra cú pháp 40 file `.ts/.tsx` bằng TypeScript `transpileModule`: không có lỗi cú pháp.
- Đã kiểm tra số học bố cục ở 4 kích thước màn hình: PASS.
- Chưa chạy kiểm tra Vite/TypeScript kiểu đầy đủ và chưa xem hình trong browser do môi trường không cài được `node_modules`; cần chạy trên máy của bạn để xác nhận giao diện, âm thanh VieNeu và sự kiện LIVE.

## Chạy dự án trên Mac

```bash
npm install
npm run lint
npm test
npm run build
npm run dev
```

Trong Google AI Studio, hãy cập nhật các file đã thay đổi (xem ZIP bản vá đi kèm), rồi thử tab **Xin Xăm (100)** trong **Quản trị & Demo**. Chỉnh chế độ **Thu gọn**, thời lượng mặc định **8 giây**, nền **0.55**, cỡ chữ **100%**.
