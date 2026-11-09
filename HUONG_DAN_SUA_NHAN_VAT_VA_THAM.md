# CHÙA ONLINE 3D — cập nhật nhân vật và thảm ngồi

## Các thay đổi
- `src/components/three/WorshipperCharacter.tsx`: giữ phom **Phật tử low-poly áo lam cũ**, dùng vật liệu vải lì thay cho hiệu ứng bóng nhựa, tăng độ tự nhiên ở phần cổ/viền áo, thu nhỏ tỷ lệ hiển thị **8% chỉ trong chế độ nền ảnh**. Giữ nguyên quy trình đi bộ, quỳ lạy, dâng hoa, thắp hương, gõ mõ, xin xăm và các props nghi lễ.
- `src/components/three/FixedPrayerMats.tsx`: **tệp mới** tạo 104 thảm quỳ cố định trên chế độ ảnh nền, 2 draw calls bằng `InstancedMesh`. Thảm còn nguyên khi không có người, khi Phật tử lên bàn Phật và sau khi Phật tử rời phiên LIVE. Khi có vị trí overflow đang được dùng, hệ thống dựng thêm thảm tại vị trí đó.
- `src/components/three/TempleScene.tsx`: gắn hệ thảm mới trong chế độ ảnh nền. Chế độ chùa 3D gốc vẫn dùng thảm sẵn có, không sinh thảm trùng nhau.

**Không chỉnh** `SeatManager.ts` hay `SceneCalibration.ts`: các tọa độ ghế, đường đi, camera và thảm đỏ giữ nguyên.

## Cách thử trên Mac

```bash
npm install
npm run lint
npm run build
npm run dev
```

Mở game trong trình duyệt, chọn chế độ **Image Background**, nhấn nút demo bình luận để nhân vật vào chỗ và thử nghi lễ hoa hồng/xin xăm. Kiểm tra thảm vẫn ở vị trí cũ khi nhân vật rời chỗ. Chuyển chế độ **Original 3D Temple** để xác minh thảm gốc không bị nhân đôi.

## Đưa cập nhật vào dự án Google AI Studio hiện tại

Có thể đồng bộ mã nguồn qua GitHub hoặc dùng trình chỉnh sửa mã của dự án để thay đúng 2 tệp trên và **thêm** `FixedPrayerMats.tsx`. Không cần thay server hay cài thêm thư viện so với `package.json` hiện có. ZIP bản đầy đủ cũng được cung cấp.

## Trạng thái kiểm thử

- Đã kiểm tra cú pháp 40 file TypeScript/TSX bằng TypeScript transpiler: không có lỗi phân tích cú pháp.
- Kiểm tra sự thay đổi: đúng 2 file chỉnh sửa + 1 file tạo mới (không thay logic TikTok, VieNeu, SeatManager).
- Không chạy được `npm run lint`/`npm run build` hoàn chỉnh ở môi trường tạo file do thiếu dependency và npm install không hoàn tất. Vui lòng chạy các lệnh trên tại máy có mạng.
- Chưa thử các kết nối TikTok LIVE và VieNeuTTS thực tế.
