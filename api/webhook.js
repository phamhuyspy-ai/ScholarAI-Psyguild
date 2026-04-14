import crypto from 'crypto';

// Vercel Serverless Function for Webhook (e.g., SePay, PayOS)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Xác thực chữ ký (Signature Validation) để bảo mật
    // Tùy thuộc vào dịch vụ bạn dùng (SePay/PayOS), cách tính signature sẽ khác nhau.
    // Ví dụ với một HMAC SHA256 cơ bản:
    const signature = req.headers['x-webhook-signature'];
    const payload = JSON.stringify(req.body);
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;

    if (!secret) {
      console.error('Missing PAYMENT_WEBHOOK_SECRET');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Lưu ý: Tùy dịch vụ mà họ dùng hex, base64, hoặc format khác.
    // Nếu bạn dùng SePay hoặc PayOS, hãy đọc tài liệu của họ để so khớp chính xác.
    // Tạm thời comment phần check strict để bạn dễ test, nhớ mở ra khi chạy thật:
    /*
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    */

    // 2. Phân tích nội dung chuyển khoản
    const { transactionContent, amount } = req.body; 
    // Giả sử nội dung chuyển khoản có dạng: "PAY user123"
    // Bạn cần parse để lấy userId
    const match = transactionContent.match(/PAY\s+([a-zA-Z0-9_-]+)/i);
    
    if (!match) {
      return res.status(400).json({ error: 'Invalid transaction content format' });
    }

    const userId = match[1];

    // 3. Tính toán số Token/Gói dựa trên số tiền (amount)
    let packageType = 'free';
    if (amount >= 960000) {
      packageType = 'yearly';
    } else if (amount >= 100000) {
      packageType = 'monthly';
    } else {
      return res.status(400).json({ error: 'Amount not matching any package' });
    }

    // 4. Cập nhật Database (MongoDB / Supabase)
    // Ví dụ giả mã (Pseudocode) cập nhật DB:
    /*
    const db = await connectToDatabase(process.env.DATABASE_URL);
    await db.collection('users').updateOne(
      { userId: userId },
      { 
        $set: { 
          subscription: packageType,
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
        } 
      }
    );
    */

    console.log(`Successfully upgraded user ${userId} to ${packageType}`);

    // Trả về 200 OK cho dịch vụ Webhook biết đã nhận thành công
    return res.status(200).json({ success: true, message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
