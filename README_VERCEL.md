# Hướng dẫn Deploy lên Vercel

Dự án này đã được cấu hình sẵn các file Serverless Functions trong thư mục `api/` để bạn có thể deploy lên Vercel một cách dễ dàng.

## 1. Các biến môi trường (Environment Variables) cần thiết

Khi deploy lên Vercel, bạn cần vào phần **Settings > Environment Variables** của dự án và thêm các biến sau:

- `GEMINI_API_KEY`: API Key lấy từ Google AI Studio. Dùng để server gọi API thay cho client.
- `PAYMENT_WEBHOOK_SECRET`: Chuỗi bí mật (Secret Key) lấy từ dịch vụ thanh toán (SePay, PayOS, Casso) dùng để xác thực chữ ký Webhook, tránh bị giả mạo thanh toán.
- `DATABASE_URL`: Chuỗi kết nối đến Database của bạn (MongoDB Atlas URI hoặc Supabase URL).

## 2. File `.gitignore`

Để bảo vệ API Key và thông tin nhạy cảm, hãy đảm bảo file `.gitignore` ở thư mục gốc của bạn có chứa dòng sau trước khi push code lên GitHub:

```text
# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Node modules
node_modules/
```

## 3. Cách hoạt động của hệ thống tự động

1. **Khách hàng thanh toán**: Khách quét mã QR và chuyển khoản với nội dung (VD: `PAY user123`).
2. **Webhook kích hoạt**: Ngân hàng nhận tiền -> Dịch vụ trung gian (SePay/PayOS) bắn Webhook về `https://domain-cua-ban.vercel.app/api/webhook`.
3. **Xử lý Webhook (`api/webhook.js`)**: 
   - Xác thực chữ ký bằng `PAYMENT_WEBHOOK_SECRET`.
   - Phân tích nội dung chuyển khoản lấy `user123`.
   - Cập nhật trạng thái gói (monthly/yearly) vào Database.
4. **Sử dụng AI (`api/chat.js`)**:
   - Client gửi yêu cầu lên `/api/chat`.
   - Server kiểm tra Database xem user còn hạn/lượt không.
   - Nếu hợp lệ, Server dùng `GEMINI_API_KEY` gọi Google AI Studio.
   - Trả kết quả về cho Client.

## 4. Lưu ý về Database

Trong các file `api/webhook.js` và `api/chat.js`, phần kết nối Database đang được viết dưới dạng **Giả mã (Pseudocode)** (được comment lại). 
Tùy thuộc vào việc bạn chọn **MongoDB** hay **Supabase**, bạn cần cài đặt thêm thư viện tương ứng (VD: `npm install mongodb` hoặc `npm install @supabase/supabase-js`) và bỏ comment, điều chỉnh lại code kết nối DB cho phù hợp.
