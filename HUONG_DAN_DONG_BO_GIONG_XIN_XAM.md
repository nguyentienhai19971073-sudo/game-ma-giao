# CHÙA ONLINE — ĐỒNG BỘ GIỌNG ĐỌC VÀ BẢNG XIN XĂM

## Cập nhật trên MacBook

1. Tải file ZIP bản vá về thư mục Downloads.
2. Trong Terminal đang chạy `npm run dev`, nhấn Control + C.
3. Thực hiện:

```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
unzip -o ~/Downloads/Chua_Online_3D_PATCH_Dong_Bo_Giong_Xin_Xam.zip -d .
npm run dev
```

4. Mở http://localhost:3000, nhấn nút BẬT ÂM THANH nếu giao diện yêu cầu, rồi test Xin Xăm.

## Các chỉnh sửa
- TTS VieNeu bắt đầu tổng hợp âm thanh NGAY KHI RÚT QUẺ (trước khi 3D rút thẻ và công bố kết quả), chỉ lưu cache, không phát sớm.
- Bảng Xin Xăm chỉ xuất hiện khi VieNeu thật sự bắt đầu phát (audio.onplaying, với fallback SpeechSynthesis.onstart), ưu tiên Xin Xăm trước bình luận và thông báo cấp thấp.
- Khi TTS lỗi/tắt, vẫn hiện kết quả, có dự phòng tối đa 14 giây để không bị mất quẻ.
- Không có giọng chồng nhau; lời luận giải và cách cấu hình TTS giữ nguyên.
- Giữ bảng Xin Xăm 10 giây, font đẹp, bảng tên user, bố cục 9:16 và các thay đổi trước đây.

Lưu ý: Nếu mạng/giọng VieNeu chậm, bảng kết quả có thể đợi âm thanh sẵn sàng để bắt đầu cùng nhau. Nhạc chuông, hiệu ứng rút que vẫn diễn ra trước đó. Để giảm thời gian chờ, chọn VieNeu Local đang chạy ổn định và bật âm thanh trong trang.

Bản này chưa được chạy kiểm tra giao diện thực tế trên MacBook của bạn. Đã kiểm tra cú pháp TypeScript và mô phỏng tải sẵn âm thanh/cache/phát audio.
