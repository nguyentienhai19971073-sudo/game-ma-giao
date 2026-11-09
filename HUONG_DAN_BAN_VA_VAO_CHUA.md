# CHÙA ONLINE — Chỉ bình luận hoặc tặng quà mới vào chùa

## Quy tắc
- Bình luận hợp lệ đầu tiên: một Phật tử vào chùa.
- Gift đầu tiên (kể cả ID chưa cấu hình): một Phật tử vào chùa; nếu có cấu hình hợp lệ, kích hoạt nghi lễ tương ứng.
- Một `userId` chỉ có **một Phật tử**, cùng một ghế; tặng quà sau bình luận không sinh thêm nhân vật.
- Tặng quà khi đang ngồi hoặc đang đi: sử dụng hàng đợi nghi lễ hiện có, quay lại đúng ghế.
- Gift chưa gán ID: chỉ cho vào chùa và lưu quà chưa cấu hình, **không tự chọn** nghi lễ theo giá xu.
- Like, follow, share, join không tự sinh Phật tử mới; vẫn cập nhật tương tác cho Phật tử đã có theo logic gốc.
- 120 giây không tương tác: rời chùa; điểm công đức giữ lại trong phiên.
- Tắt việc tự sinh tài khoản Demo mẫu khi mở trang. Có thể bật mẫu bằng `http://localhost:3000/?demoIntro=1` khi cần.

## Cài trên MacBook
1. Tải `Chua_Online_3D_PATCH_Binh_Luan_Hoac_Qua_Vao_Chua.zip` vào Downloads.
2. Dừng game trong Terminal bằng **Control + C**.
3. Chạy:

```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
unzip -o ~/Downloads/Chua_Online_3D_PATCH_Binh_Luan_Hoac_Qua_Vao_Chua.zip -d .
python3 apply_binh_luan_hoac_tang_qua_vao_chua.py
npm run dev
```

4. Mở `http://localhost:3000` và làm mới Browser Source trong OBS.

**Lưu ý:** Đây là patch cập nhật nội dung trong hai file hiện có, không thay toàn bộ file nguồn, để giữ các bản sửa UI, Gift ID và Xin Xăm trước đó. Script tạo bản sao `.bak_entry_gift` cho từng file được sửa.

## Test LIVE
- Dùng tài khoản A bình luận → có một Phật tử A.
- Tài khoản A gửi quà đã gán Gift ID → đúng Phật tử A đi làm nghi lễ → trở về ghế, không có A thứ hai.
- Dùng tài khoản B chỉ gửi quà chưa gán ID → B vẫn vào chùa, nhưng không có nghi lễ ngẫu nhiên.
- Dùng tài khoản C chỉ like/follow/share → không xuất hiện Phật tử C.
- Chờ 120 giây không tương tác → người rời chùa.

Chưa được kiểm thử với phiên TikTok LIVE thật; nên thử bằng một tài khoản phụ trước khi mở rộng.
