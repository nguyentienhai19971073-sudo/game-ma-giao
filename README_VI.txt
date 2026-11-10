BẢN VÁ MA GIÁO ONLINE — LOẠI BỎ CHÙA ONLINE

Mục tiêu: chỉ giữ game Ma Giáo và quản trị Ma Giáo, xóa nút chuyển sang Chùa Online, xóa mã frontend Chùa Online không còn sử dụng, sửa lỗi thiếu src/data/maGiaoDialogues.ts.

CẢNH BÁO: bản vá xóa 206 file code/backup/tài liệu cũ. HÃY SAO LƯU SOURCE/GIT TRƯỚC.

CÀI ĐẶT:
1) Giải nén ZIP này vào thư mục game-ma-giao-main, ghi đè các file đã sửa.
2) Tại thư mục game-ma-giao-main: python3 APPLY_PATCH.py
3) npm install
4) npm run build
5) npm run test:magiao

Bản vá KHÔNG đụng các API TikTok LIVE, TTS, OBS và quản trị Ma Giáo dùng chung với server. Do đó một số kiểu dữ liệu/giao thức cũ có thể còn tên 'temple' nhưng không khởi tạo Chùa Online.

KIỂM THỬ: npm build chưa được xác thực trong môi trường tạo bản vá do chưa cài được npm dependencies.
