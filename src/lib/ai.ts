import { GoogleGenAI } from '@google/genai';
import { checkAndIncrementUsage } from './usage';

export async function generateAIContent(
  prompt: string,
  user: any,
  userData: any,
  isAdmin: boolean,
  defaultModel: string = 'gemini-2.0-flash'
): Promise<string> {
  // 1. Kiểm tra giới hạn lượt dùng
  await checkAndIncrementUsage(user?.email || user?.uid, isAdmin, userData?.subscription);

  // Lấy model từ cấu hình người dùng (nếu có)
  const userModel = localStorage.getItem('AI_MODEL');
  const model = userModel || defaultModel;

  // 2. Kiểm tra xem có cấu hình Vercel Proxy không
  const vercelUrl = localStorage.getItem('VERCEL_API_URL');
  
  if (vercelUrl) {
    const cleanUrl = vercelUrl.replace(/\/$/, '');
    const formattingInstruction = "\n\nLƯU Ý QUAN TRỌNG VỀ ĐỊNH DẠNG:\n- Sử dụng Markdown chuẩn để trình bày.\n- KHÔNG sử dụng thẻ <br> để xuống dòng. Hãy sử dụng 2 lần xuống dòng (double newline) để tạo đoạn văn mới.\n- Sử dụng bảng, danh sách, in đậm để làm nổi bật thông tin quan trọng.\n- Đảm bảo văn bản rõ ràng, dễ đọc, không bị dính chữ.";
    const fullPrompt = prompt + formattingInstruction;

    // Xác định API endpoint dựa trên model
    const isOpenAI = model.startsWith('gpt-');
    const endpoint = isOpenAI ? `${cleanUrl}/api/chat-openai` : `${cleanUrl}/api/chat`;
    const apiKey = isOpenAI ? localStorage.getItem('OPENAI_API_KEY') : undefined;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.email || user?.uid || 'anonymous',
        prompt: fullPrompt,
        model,
        apiKey // Gửi API Key nếu dùng OpenAI
      })
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || `Lỗi khi gọi Vercel Proxy (${isOpenAI ? 'OpenAI' : 'Gemini'})`);
    }
    
    const data = await response.json();
    return data.text;
  }

  // 3. Fallback: Gọi trực tiếp API từ Client (nếu không dùng Proxy)
  const formattingInstruction = "\n\nLƯU Ý QUAN TRỌNG VỀ ĐỊNH DẠNG:\n- Sử dụng Markdown chuẩn để trình bày.\n- KHÔNG sử dụng thẻ <br> để xuống dòng. Hãy sử dụng 2 lần xuống dòng (double newline) để tạo đoạn văn mới.\n- Sử dụng bảng, danh sách, in đậm để làm nổi bật thông tin quan trọng.\n- Đảm bảo văn bản rõ ràng, dễ đọc, không bị dính chữ.";
  const fullPrompt = prompt + formattingInstruction;

  if (model.startsWith('gpt-')) {
    const apiKey = localStorage.getItem('OPENAI_API_KEY');
    if (!apiKey) throw new Error("Vui lòng nhập OpenAI API Key trong phần Cài đặt.");
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: fullPrompt }]
      })
    });
    
    if (!response.ok) throw new Error('Lỗi khi gọi OpenAI API');
    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Fallback Gemini
  const localKey = localStorage.getItem('GEMINI_API_KEY');
  const envKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
  const apiKey = localKey || envKey;
  
  if (!apiKey) {
    throw new Error("Vui lòng cấu hình Vercel Proxy hoặc nhập API Key trong phần Cài đặt.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: fullPrompt,
  });
  
  if (!response.text) throw new Error('Không có phản hồi từ AI');
  return response.text;
}
