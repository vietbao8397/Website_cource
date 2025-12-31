# 🚀 Vietbaopro - E-Learning MVP

Vietbaopro là nền tảng học trực tuyến dành cho Marketers & Creators, tập trung vào việc làm chủ AI để tối ưu hóa quy trình sáng tạo nội dung.

## ✨ Tính Năng Chính
- **Landing Page & Cửa Hàng**: Giao diện Premium Dark Mode với hiệu ứng chuyển động mượt mà.
- **Quản Lý Khóa Học**: Hệ thống bài học dạng Accordion, Video Player tích hợp YouTube Unlisted.
- **Thanh Toán**: QR code chuyển khoản ngân hàng thông minh (VietQR support).
- **Admin Dashboard**: Quản lý đơn hàng, người dùng, khóa học và biểu đồ doanh thu chi tiết.
- **Tự Động Hóa**:
  - Tự động lấy thông tin Video (Title, Duration) từ YouTube API.
  - Sao lưu dữ liệu tự động lên Google Drive.
  - Gửi Email xác nhận và kích hoạt khóa học qua Resend.

## 🛠 Tech Stack
- **Frontend**: Next.js 14, TypeScript, Vanilla CSS, Framer Motion.
- **Backend**: Supabase (Auth, Database, Storage).
- **Integrations**: Resend (Email), Google Cloud (Drive & YouTube API).
- **UI Libraries**: Recharts (Analytics), Lucide-style icons.

## ⚙️ Cài Đặt Local
1. Clone repository.
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Tạo file `.env.local` và thêm các biến môi trường sau:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `RESEND_API_KEY`
   - `FROM_EMAIL` (Đã verify trên Resend)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
4. Chạy server phát triển:
   ```bash
   npm run dev
   ```

## 🚀 Triển Khai (Deployment)
1. Đẩy mã nguồn lên GitHub.
2. Kết nối GitHub repo với **Vercel**.
3. Cấu hình tất cả các biến môi trường trên trong phần **Settings > Environment Variables** của Vercel.
4. Lưu ý: Đảm bảo `NEXT_PUBLIC_SITE_URL` được đặt đúng tên miền thật của ứng dụng trên Vercel.

---
🚀 **Hệ thống đã sẵn sàng để phát triển và vận hành chuyên nghiệp!**
