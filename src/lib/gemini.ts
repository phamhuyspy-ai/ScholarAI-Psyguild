import { GoogleGenAI, ThinkingLevel } from "@google/genai";

let currentApiKey: string | null = null;
let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  const localKey = localStorage.getItem('GEMINI_API_KEY');
  const envKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
  const apiKey = localKey || envKey;

  if (!apiKey) {
    throw new Error("Vui lòng nhập API Key trong phần Cài đặt hoặc cấu hình biến môi trường.");
  }

  if (!aiClient || currentApiKey !== apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
    currentApiKey = apiKey;
  }
  return aiClient;
}

export async function generateResearchDesign(topic: string) {
  const ai = getAIClient();
  const prompt = `Bạn là một chuyên gia nghiên cứu học thuật. Hãy thiết kế một nghiên cứu toàn diện cho chủ đề sau: "${topic}".
  
Bao gồm:
1. Mục tiêu nghiên cứu (Research Objectives)
2. Câu hỏi nghiên cứu (Research Questions)
3. Phương pháp luận (Định lượng, Định tính, hoặc Hỗn hợp)
4. Phương pháp thu thập dữ liệu
5. Kế hoạch phân tích dữ liệu
6. Kết quả dự kiến
7. Hạn chế tiềm ẩn

Định dạng đầu ra bằng Markdown. Vui lòng trả lời hoàn toàn bằng tiếng Việt.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  return response.text;
}

export async function checkTopicDuplication(topic: string) {
  const ai = getAIClient();
  const prompt = `Bạn là một trợ lý nghiên cứu học thuật. Một sinh viên muốn nghiên cứu chủ đề sau: "${topic}".
  
Yêu cầu truy tìm thông tin phải có nguồn gốc chính xác, đúng link nguồn. Tập trung tìm kiếm trên các nền tảng nghiên cứu chính thống:
- Tâm lý học: APA PsycInfo, PubMed, SpringerLink, Wiley Online Library, Thư viện HUTECH.
- Lập trình & Công nghệ: IEEE Xplore, ACM Digital Library, arXiv.org, Medium (Towards Data Science).

1. Xác định xem chủ đề này đã được nghiên cứu nhiều chưa.
2. Liệt kê 3-5 nghiên cứu tương tự hiện có. BẮT BUỘC cung cấp link nguồn chính xác và trích dẫn chuẩn APA.
3. Đề xuất 3 góc độ độc đáo hoặc khoảng trống trong tài liệu (research gap) để sinh viên có thể khai thác nhằm đảm bảo tính nguyên bản.

Định dạng đầu ra bằng Markdown. Vui lòng trả lời hoàn toàn bằng tiếng Việt.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  return response.text;
}

export async function checkPlagiarism(text: string) {
  const ai = getAIClient();
  const prompt = `Bạn là một hệ thống kiểm tra đạo văn học thuật (Plagiarism Detection System) sử dụng NLP. Hãy phân tích văn bản sau để tìm kiếm sự trùng lặp ý tưởng hoặc thiếu tính nguyên bản.

Văn bản cần phân tích:
"""
${text}
"""

Yêu cầu truy tìm thông tin phải có nguồn gốc chính xác, đúng link nguồn. Tập trung tìm kiếm trên các nền tảng nghiên cứu chính thống (APA PsycInfo, PubMed, IEEE Xplore, arXiv, v.v.).

1. Xác định các cụm từ, câu hoặc ý tưởng có khả năng trùng lặp với các tài liệu đã xuất bản.
2. Cung cấp đánh giá mức độ nguyên bản (ước tính %).
3. BẮT BUỘC chỉ ra các nguồn tài liệu gốc có thể bị trùng lặp kèm theo link nguồn chính xác và đề xuất vị trí cần thêm trích dẫn chuẩn APA.
4. Lưu ý: Phân tích dựa trên ngữ nghĩa (Semantic Analysis) để phát hiện việc thay đổi từ đồng nghĩa hoặc đảo cấu trúc câu.

Định dạng đầu ra bằng Markdown. Vui lòng trả lời hoàn toàn bằng tiếng Việt.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  return response.text;
}

export async function analyzeVideo(fileData: string, mimeType: string, prompt: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: fileData,
            mimeType: mimeType,
          },
        },
        {
          text: prompt || "Phân tích video này cho mục đích nghiên cứu học thuật. Trích xuất các chủ đề chính, phương pháp luận được thảo luận và các kết luận chính. Vui lòng trả lời hoàn toàn bằng tiếng Việt.",
        },
      ],
    },
  });

  return response.text;
}

export async function translateText(text: string, targetLanguage: string) {
  const ai = getAIClient();
  const prompt = `Bạn là một chuyên gia dịch thuật tài liệu học thuật. Hãy dịch đoạn văn bản sau sang ${targetLanguage} một cách chính xác nhất.
Giữ nguyên văn phong học thuật, thuật ngữ chuyên ngành và ý nghĩa gốc. Không thêm bất kỳ bình luận nào, chỉ cung cấp bản dịch.

Văn bản cần dịch:
"""
${text}
"""`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });

  return response.text;
}
