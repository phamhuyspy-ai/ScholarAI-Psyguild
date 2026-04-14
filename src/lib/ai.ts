import { GoogleGenAI } from '@google/genai';
import { checkAndIncrementUsage } from './usage';

export async function generateAIContent(
  prompt: string,
  user: any,
  userData: any,
  isAdmin: boolean,
  model: string = 'gemini-2.5-pro'
): Promise<string> {
  // 1. Kiểm tra giới hạn lượt dùng
  await checkAndIncrementUsage(user?.email || user?.uid, isAdmin, userData?.subscription);

  // 2. Kiểm tra xem có cấu hình Vercel Proxy không
  const vercelUrl = localStorage.getItem('VERCEL_API_URL');
  
  if (vercelUrl) {
    const cleanUrl = vercelUrl.replace(/\/$/, '');
    const response = await fetch(`${cleanUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.email || user?.uid || 'anonymous',
        prompt,
        model
      })
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Lỗi khi gọi Vercel Proxy');
    }
    
    const data = await response.json();
    return data.text;
  }

  // 3. Fallback: Gọi trực tiếp Gemini API từ Client (nếu không dùng Proxy)
  const localKey = localStorage.getItem('GEMINI_API_KEY');
  const envKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
  const apiKey = localKey || envKey;
  
  if (!apiKey) {
    throw new Error("Vui lòng cấu hình Vercel Proxy hoặc nhập API Key trong phần Cài đặt.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  
  if (!response.text) throw new Error('Không có phản hồi từ AI');
  return response.text;
}
