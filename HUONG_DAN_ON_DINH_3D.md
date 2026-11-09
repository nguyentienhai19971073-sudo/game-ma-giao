# CHÙA ONLINE 3D — Tăng ổn định GPU và ghi nhật ký màn hình đen (V3)

**Yêu cầu:** Đã cài bản `CHUA_ONLINE_WEBGL_RECOVERY_V1` (xác nhận có dòng trong `src/components/three/TempleScene.tsx`).

## Những gì đã sửa

- Nếu mở URL với `?safe3d=1`, giới hạn dựng cảnh 3D ở khoảng 30 FPS bằng React Three Fiber `frameloop="demand"` + `invalidate()`, thay vì mặc định vẽ liên tục theo màn hình.
- Giữ cấu hình giảm tải DPR=1, tắt đổ bóng và khử răng cưa của bản vá trước khi `safe3d=1`.
- Không tạo sẵn 160 ô nhãn tên và 160 ô bình luận khi chùa chưa có người; chỉ tạo số ô theo lượng Phật tử có mặt.
- Thêm nhật ký **cục bộ** về lỗi JavaScript, lỗi React, mất/khôi phục WebGL, số texture/geometry GPU, FPS mỗi 30 giây. Giữ tối đa 120 bản ghi. Không ghi TikTok ID, nickname, bình luận, tài khoản hoặc khóa API.
- Nếu React gặp lỗi render, có thông báo thay vì trắng/đen hoàn toàn. Giữ bản WebGL Recovery V1, đồng thời ghi số lần thử khôi phục.

## Cài đặt (ngừng server trước bằng Control + C; nên làm sau LIVE)

1. Tải ZIP và để trong `~/Downloads`.
2. Mở Terminal:

```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
unzip -o ~/Downloads/CHUA_ONLINE_ON_DINH_3D_30FPS_V3.zip -d .
python3 apply_chua_on_dinh_3d_v3.py
npm run build
npm run dev
```

Nếu `npm run build` không thành công, **không dùng bản vá để livestream ngay**; gửi lỗi Terminal. Script dừng nếu mã nguồn khác dự kiến và không ghi đè file không khớp. Script tạo các file `.bak` cho 2 file gốc.

## OBS và Chrome

- OBS → nguồn `Trình duyệt` → URL: `http://localhost:3000/?obs=1&empty=1&safe3d=1`
- Width `720`; Height `1280`; FPS `30`; Biến đổi → Vừa màn hình.
- Chrome khi cần Quản trị: `http://localhost:3000/?empty=1&safe3d=1`
- Nếu Chrome không cần mở, có thể đóng tab Chrome game để chỉ còn OBS dựng cảnh 3D. **Không cần đóng server Terminal.** Sau khi cấu hình nguồn, xác nhận LIVE vẫn tiếp tục kết nối khi đóng Chrome, vì phiên giao diện khác nhau.

## Nếu lại đen: lấy nhật ký ngay hoặc sau khi tải lại

Trên Chrome, mở DevTools Console bằng `Option + Command + J`, chạy:

```js
window.__chuaDiagnostics?.().slice(-25)
```

Nếu hiện bản ghi lỗi, chụp ảnh hoặc sao chép nội dung. Có thể xem nhật ký sau khi tải lại trang vì nó được lưu trong localStorage của Chrome. OBS Browser Source có kho lưu trữ riêng, không chia sẻ nhật ký với Chrome.

Kiểm tra Terminal khác:

```bash
curl -I http://localhost:3000
sysctl vm.swapusage
memory_pressure | head -n 18
```

- Nếu `curl` không phản hồi: kiểm tra tiến trình server.
- Nếu có `webglcontextlost`/`render_stalled` và GPU texture tăng dần: cần xác định rò rỉ đồ họa hoặc vượt giới hạn GPU.
- Nếu `react_error`/`javascript_error`: sửa đúng mã gây lỗi.
- Nếu cả Chrome/OBS đen nhưng không có nhật ký, chụp màn hình Console, trạng thái CPU/GPU máy và kiểm tra Chrome GPU process.

**Không hứa sửa dứt điểm khi chưa có nhật ký thời điểm lỗi.** Bản V3 ưu tiên giảm tải và thu bằng chứng; nếu nguồn gây lỗi là driver GPU, giới hạn bộ nhớ chung, lỗi OBS/CEF hoặc máy chủ, cần xử lý theo nhật ký thực tế.
