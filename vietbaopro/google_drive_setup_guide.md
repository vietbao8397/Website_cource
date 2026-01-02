# Hướng Dẫn Cấu Hình Biến Môi Trường (OAuth2)

Bạn đã cung cấp đầy đủ thông tin xác thực OAuth2. Vui lòng cập nhật các biến môi trường sau trên **Vercel** để hệ thống hoạt động:

## 1. Google Cloud Credentials (OAuth2)
Copy các giá trị này vào Vercel Environment Variables:

- **GOOGLE_CLIENT_ID**: `(Giá trị bạn đã cung cấp)`
- **GOOGLE_CLIENT_SECRET**: `(Giá trị bạn đã cung cấp)`
- **GOOGLE_REFRESH_TOKEN**: `(Giá trị bạn đã cung cấp)`

## 2. Google AI (Gemini)
- **GOOGLE_AI_API_KEY**: `(Giá trị bạn đã cung cấp)`

## 3. Google Drive Folder (Optional)
Để lưu ảnh vào folder "Vietbaopro Media", bạn cần tìm **Folder ID** của thư mục đó và thêm biến:
- **GOOGLE_DRIVE_FOLDER_ID**: `[ID_CUA_FOLDER_VIETBAOPRO_MEDIA]`

*(Cách lấy ID: Mở folder Vietbaopro Media trên trình duyệt, copy đoạn mã cuối cùng trên thanh địa chỉ)*

---
**Sau khi cập nhật xong, hãy Redeploy project trên Vercel!**
