# CHÙA ONLINE — Hành lễ giữa + bảng thông báo dọc + TRỤ XIN XĂM 3D GIỮA (V2)

Bản này đã **gộp đầy đủ bản vá trước**, không cần cài bản cũ riêng.
Cũng có thể áp dụng khi bản cũ đã được cài: những thay đổi cũ không bị lặp.

## Những thay đổi
- Cả sáu nghi lễ Cầu Bình An, Sức Khỏe, Gia Đạo, Tài Lộc, Công Đức và Xin Xăm thực hiện ở trung tâm thảm đỏ, luân phiên từng người.
- Phật tử Xin Xăm quỳ tại trung tâm; **trụ/ống Xin Xăm 3D thực tế cũng được dời từ cánh trái vào chính giữa, phía sau chỗ quỳ**.
- Áp dụng cho cả **chùa 3D đầy đủ** lẫn **chế độ dùng ảnh nền chùa**. Đệm quỳ đặt trước trụ.
- Các bảng thông báo nghi lễ, sự kiện và kết quả Xin Xăm thu nhỏ, xếp dọc dưới BẢNG CÔNG ĐỨC.
- Không chỉnh Gift ID, dữ liệu công đức, thời gian Phật tử 5 phút, nickname, bình luận 12 giây hay TTS.

## Cách cài một lần trên Mac

Nên kết thúc LIVE và dừng Terminal đang chạy game (Control+C), sau đó:

```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
unzip -o ~/Downloads/CHUA_ONLINE_PATCH_HANH_LE_GIUA_THONG_BAO_DOC_KEM_TRU_XIN_XAM.zip -d .
python3 apply_chua_ritual_giua_bang_doc.py
npm run build
npm run dev
```

Nếu build thành công, làm mới trang Chrome bằng Command+Shift+R và làm mới nguồn Trình duyệt trong OBS.

## Kiểm tra
- Demo Cầu Công Đức và Cầu Bình An: nhân vật ra giữa rồi về chỗ.
- Demo Xin Xăm: nhân vật đi vào giữa, ống xăm ở chính giữa (không còn ở góc trái), động tác rút quẻ và hiển thị bảng kết quả dưới Công Đức.
- Quan sát phần giữa với nghi lễ khác: trụ đặt phía sau vị trí hành lễ, không nằm ngay vị trí quỳ.
- Thử ở cả chế độ dùng ảnh nền lẫn 3D nguyên bản nếu game có sử dụng cả hai.

## An toàn
- Trước khi sửa, script sao lưu mỗi file có thay đổi, gồm `.before_ceremonies_center_20261102.bak` và `.before_xin_xam_tru_giua_v2.bak`.
- Chạy nhiều lần sẽ không áp dụng lại cùng một thay đổi.
- Nếu script không tìm thấy đoạn mã đúng, nó dừng để tránh ghi sai; gửi nội dung Terminal để cập nhật bản vá tương thích.
- Chưa kiểm tra trực tiếp trên MacBook/OBS của bạn; cần thử Demo để xác nhận vị trí thị giác.
