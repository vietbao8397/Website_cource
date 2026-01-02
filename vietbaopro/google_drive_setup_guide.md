# Hướng Dẫn Cấu Hình Google Drive Tự Động Lưu Ảnh

Để hệ thống AI có thể tự động upload ảnh đã tạo lên Google Drive, bạn cần tạo **Google Service Account**.

## Bước 1: Tạo Service Account
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo một Project mới (hoặc chọn project hiện có).
3. Vào **APIs & Services** > **Library** > Tìm "Google Drive API" > Nhấn **Enable**.
4. Vào **IAM & Admin** > **Service Accounts**.
5. Nhấn **Create Service Account**.
   - Tên: `ai-image-uploader`
   - Nhấn **Create and Continue**.
6. Chọn Role: **Editor** (hoặc Basic > Editor) để có quyền ghi file.
7. Nhấn **Done**.

## Bước 2: Tạo Key
1. Click vào email của Service Account vừa tạo (vd: `ai-image-uploader@project-id.iam.gserviceaccount.com`).
2. Tab **Keys** > **Add Key** > **Create new key**.
3. Chọn **JSON** > **Create**.
4. Một file JSON sẽ được tải về máy. Mở file này lên.

## Bước 3: Cấu hình Vercel
Vào [Vercel Environment Variables](https://vercel.com/vietbao8397s-projects/website-cource/settings/environment-variables) và thêm 2 biến sau từ file JSON:

1. **GOOGLE_CLIENT_EMAIL**
   - Value: `client_email` trong file JSON (vd: `ai-image-uploader@...`)

2. **GOOGLE_PRIVATE_KEY**
   - Value: `private_key` trong file JSON (bắt đầu bằng `-----BEGIN PRIVATE KEY-----...`)
   - **Quan trọng:** Copy toàn bộ nội dung trong ngoặc kép.

## Bước 4: Chia sẻ Folder (Tùy chọn)
Nếu bạn muốn ảnh lưu vào một folder cụ thể thay vì root:
1. Tạo folder trên Google Drive của bạn.
2. Share folder đó cho email của Service Account (`client_email`).
3. (Optional) Cấu hình thêm biến `GOOGLE_DRIVE_FOLDER_ID` trong code (hiện tại code đang lưu vào root của Service Account Drive).

---
**Lưu ý:** Sau khi cấu hình xong, nhớ Redeploy trên Vercel!
