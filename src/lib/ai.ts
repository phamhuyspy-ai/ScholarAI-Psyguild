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
    const formattingInstruction = "\n\nLƯU Ý QUAN TRỌNG VỀ ĐỊNH DẠNG:\n- Sử dụng Markdown chuẩn để trình bày.\n- KHÔNG sử dụng thẻ <br> để xuống dòng. Hãy sử dụng 2 lần xuống dòng (double newline) để tạo đoạn văn mới.\n- Sử dụng bảng, danh sách, in đậm để làm nổi bật thông tin quan trọng.\n- Đảm bảo văn bản rõ ràng, dễ đọc, không bị dính chữ.";
    const fullPrompt = prompt + formattingInstruction;

    const response = await fetch(`${cleanUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.email || user?.uid || 'anonymous',
        prompt: fullPrompt,
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
  
  const formattingInstruction = "\n\nLƯU Ý QUAN TRỌNG VỀ ĐỊNH DẠNG:\n- Sử dụng Markdown chuẩn để trình bày.\n- KHÔNG sử dụng thẻ <br> để xuống dòng. Hãy sử dụng 2 lần xuống dòng (double newline) để tạo đoạn văn mới.\n- Sử dụng bảng, danh sách, in đậm để làm nổi bật thông tin quan trọng.\n- Đảm bảo văn bản rõ ràng, dễ đọc, không bị dính chữ.";
  const fullPrompt = prompt + formattingInstruction;

  const ai = new GoogleGenAI({ apiKey });
  
  // Update deprecated model to current preview model
  const actualModel = model === 'gemini-2.5-pro' ? 'gemini-3.1-pro-preview' : model;
  
  const callWithRetry = async (retries = 3, delay = 1000): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: actualModel,
        contents: fullPrompt,
      });
      if (!response.text) throw new Error('Không có phản hồi từ AI');
      return response.text;
    } catch (error: any) {
      if (error.status === 503 && retries > 0) {
        console.warn(`Gemini API 503 error, retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        return callWithRetry(retries - 1, delay * 2);
      }
      
      // Friendly error messages
      if (error.status === 503) {
        throw new Error("Hệ thống AI đang quá tải (503). Vui lòng thử lại sau vài phút.");
      }
      if (error.status === 404) {
        throw new Error("Không tìm thấy mô hình AI yêu cầu (404). Vui lòng kiểm tra lại cấu hình.");
      }
      if (error.status === 401 || error.status === 403) {
        throw new Error("API Key không hợp lệ hoặc không có quyền truy cập. Vui lòng kiểm tra lại cài đặt.");
      }
      if (error.status === 429) {
        throw new Error("Bạn đã vượt quá hạn mức yêu cầu AI (429). Vui lòng đợi một lát rồi thử lại.");
      }
      
      // If it's a raw JSON error from the API, try to parse and show a friendly message
      if (error.message && error.message.includes('"status":"UNAVAILABLE"')) {
         throw new Error("Hệ thống AI đang quá tải. Vui lòng thử lại sau vài phút.");
      }
      
      throw error;
    }
  };

  return callWithRetry();
}
