# Sửa lỗi VieNeu Local quá thời gian phản hồi (10s)

Bản vá dành cho source CHÙA ONLINE mới nhất. Không cài lại thư viện.

- server/ttsProxy.ts: tăng timeout tạo giọng VieNeu Local từ 10s lên 60s.
- src/systems/TTSProviderManager.ts: tăng thời gian chờ chuẩn bị giọng từ 18s lên 70s để không hủy request trước khi server kết thúc.
- Không chỉnh VieNeu Cloud, hiệu ứng game, giọng đọc, nội dung quẻ hoặc thời lượng hiển thị.

Cập nhật trên MacBook:
1. Tải ZIP vào Downloads.
2. Ctrl+C trong Terminal game.
3. Chạy:

```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
unzip -o ~/Downloads/Chua_Online_3D_PATCH_VieNeu_Local_60s.zip -d .
npm run dev
```

Điều kiện: API VieNeu thật sự hoạt động trên cổng 8000.

Kiểm tra cổng:

```bash
lsof -nP -iTCP:8000 -sTCP:LISTEN
```

Kiểm tra tạo audio thực tế (chọn voice có trong VieNeu Local của bạn nếu khác "Adam"):

```bash
curl --max-time 75 -sS -o /tmp/chua-vieneu-test.wav \
 -w 'HTTP: %{http_code} | Thời gian: %{time_total}s | Dung lượng: %{size_download} bytes\n' \
 -H 'Content-Type: application/json' \
 -d '{"model":"vieneu-tts","input":"Nam mô A Di Đà Phật.","voice":"Adam","response_format":"wav"}' \
 http://127.0.0.1:8000/v1/audio/speech
file /tmp/chua-vieneu-test.wav
```

Nếu HTTP khác 200, cần kiểm tra API / voice / model, tăng timeout không khắc phục lỗi cấu hình.
