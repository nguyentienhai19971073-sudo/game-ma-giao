# Ẩn chữ Demo ở góc trên bên phải — CHÙA ONLINE

Vào Terminal đang chạy game, nhấn Control + C rồi chạy:

```bash
cd ~/CHUA_ONLINE_TEST/Chua_Online_3D
unzip -o ~/Downloads/CHUA_ONLINE_PATCH_An_Chu_Demo_Goc_Tren.zip -d .
python3 apply_hide_demo.py
npm run dev
```

Chỉ sửa điều kiện render nhãn trạng thái trong src/components/ui/StreamingOverlay.tsx.
Không tắt chức năng quản trị, chế độ Demo, thao tác giả lập sự kiện hoặc kết nối TikTok.
Không cần npm install.
