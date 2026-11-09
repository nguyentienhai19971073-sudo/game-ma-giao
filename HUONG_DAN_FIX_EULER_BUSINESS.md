# CHÙA ONLINE — Sửa lỗi Euler Stream yêu cầu Business plan

## Nguyên nhân

Trong `server/tiktokAdapter.ts`, tùy chọn `enableExtendedGiftInfo: true` buộc thư viện `tiktok-live-connector` tải danh sách quà mở rộng **trước khi** kết nối WebSocket. Theo tài liệu của thư viện, yêu cầu gift-list cần ký URL và có thể thất bại với lỗi Euler Stream **This endpoint requires a Business plan**.

## Cài trên MacBook

1. Giữ TikTok LIVE Studio đang phát; không cần tắt phiên LIVE.
2. Tại Terminal đang chạy `npm run dev`, nhấn **Control + C** (chỉ dừng server game).
3. Tải ZIP này về thư mục `~/Downloads`.
4. Chạy:

```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
unzip -o ~/Downloads/CHUA_ONLINE_FIX_EULER_BUSINESS_PLAN.zip -d .
python3 apply_fix_tiktok_euler_business.py
npm run dev
```

5. Vào `http://localhost:3000`, trong Quản trị & Demo → TikTok LIVE nhập `@vovankienthuc` rồi nhấn **KẾT NỐI LIVE**.
6. Thử bình luận, tặng quà từ một tài khoản TikTok khác.

## Ảnh hưởng

- **Giữ:** bình luận, sự kiện quà, Gift ID, tên người gửi, nhân vật 3D, nghi lễ đã gán, UI, OBS/TTS.
- **Thay đổi:** không tải trước danh sách quà mở rộng, nên tên/hình/giá xu của một số quà mới có thể không đầy đủ trong sự kiện thô. Các Gift ID đã lưu trong quản trị vẫn dùng được.
- **Không đảm bảo:** dịch vụ ký kết nối WebSocket của Euler Stream vẫn có giới hạn riêng; nếu gặp lỗi khác, gửi log mới. Chưa thử với tài khoản LIVE thực tế.

Tài liệu tham khảo:
- https://ttlc.docs.isaackogan.com/configuration/options/
- https://ttlc.docs.isaackogan.com/guides/gifts/
