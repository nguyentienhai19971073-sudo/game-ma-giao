# Sửa lỗi khởi động CHÙA ONLINE trên MacBook

## Lỗi đã khắc phục
- Thiếu src/data/fortunes100.ts (ERR_MODULE_NOT_FOUND): đã bổ sung 100 quẻ, đủ 5 loại theo định dạng phần mềm.
- Xung đột Vite 8 với esbuild 0.25: điều chỉnh devDependencies.esbuild thành ^0.28.0.
- Bản quẻ bổ sung là nội dung viết mới nhằm sửa thiếu file, không khôi phục đúng nguyên văn dữ liệu xăm từng có trong dự án cũ.
- Database các quẻ đã sửa trong /data/temple_gifts.sqlite hoặc /data/temple_xinxam_backup.json không được ghi đè bởi gói vá.

## Cập nhật source đã tải tại ~/CHUA_ONLINE_TEST/Chua_Online_3D
Giải nén file vá có cấu trúc `src/data/fortunes100.ts` vào đúng thư mục đó; sau đó:

```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
npm run dev
```

Nếu bắt đầu từ ZIP đầy đủ, giải nén vào một thư mục mới, chạy `npm install --no-audit --no-fund && npm run dev`.

Nếu esbuild báo lỗi gói nhị phân do npm chặn postinstall, chạy `npm approve-scripts` để phê duyệt esbuild rồi `npm rebuild esbuild`.

Ứng dụng tại http://localhost:3000 khi Terminal hiển thị server đã khởi động.
