import { GoogleGenAI } from '@google/genai';

// Vercel Serverless Function đóng vai trò Proxy gọi Gemini API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, prompt, model = 'gemini-2.5-pro' } = req.body;

    if (!userId || !prompt) {
      return res.status(400).json({ error: 'Missing userId or prompt' });
    }

    // 1. Kiểm tra Database xem User có quyền/lượt dùng không
    // Ví dụ giả mã (Pseudocode):
    /*
    const db = await connectToDatabase(process.env.DATABASE_URL);
    const user = await db.collection('users').findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.subscription === 'free' && user.usageCount >= 10) {
      return res.status(403).json({ error: 'Usage limit exceeded. Please upgrade.' });
    }
    */

    // 2. Gọi Gemini API bằng Key của Server (Bảo mật, không lộ cho Client)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    // 3. Trừ lượt dùng trong Database (Nếu là user free)
    /*
    if (user.subscription === 'free') {
      await db.collection('users').updateOne(
        { userId },
        { $inc: { usageCount: 1 } }
      );
    }
    */

    // 4. Trả kết quả về cho Client
    return res.status(200).json({ 
      success: true, 
      text: response.text 
    });

  } catch (error) {
    console.error('Gemini Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate content',
      details: error.message 
    });
  }
}
