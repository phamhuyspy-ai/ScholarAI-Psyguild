import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateResearchDesign(topic: string) {
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

export async function generateContentStrategy(topic: string) {
  const prompt = `Bạn là một Chuyên gia Chiến lược Nội dung số (Digital Content Strategist) và SEO. Khách hàng của bạn là một sinh viên Tâm lý học tại HUTECH kiêm Full-stack Developer.
Họ muốn xây dựng nội dung "thực chứng" (data-driven) và chuyên sâu dựa trên chủ đề hoặc dữ liệu nghiên cứu sau: "${topic}".

Hãy lập một chiến lược nội dung đa kênh cho năm 2026 bao gồm:
1. Nghiên cứu từ khóa theo mục đích (User Intent):
   - Website (SEO): Từ khóa dạng câu hỏi, định nghĩa chuyên sâu.
   - YouTube: Từ khóa "How-to", "Review".
   - TikTok/Facebook: Từ khóa cảm xúc, nỗi đau (Pain points), xu hướng ngắn hạn.
2. Đề xuất các góc độ nội dung "Hot":
   - Kết hợp Tâm lý học & Công nghệ (AI Therapy, Digital Detox, v.v.)
   - Đời sống sinh viên & Học thuật (Kinh nghiệm thực tập, khảo sát thực tế)
   - Xu hướng xã hội (Eco-Anxiety, Neurodiversity, v.v.)
3. Công thức phân phối nội dung (Multi-channel):
   - Gợi ý cách "xào nấu" (repurpose) nội dung này cho Website, YouTube, TikTok, và Facebook.
4. Tiêu đề Viral:
   - Tạo 5 tiêu đề video TikTok/Shorts có khả năng viral cao, đánh trúng tâm lý Gen Z.

Định dạng đầu ra bằng Markdown. Vui lòng trả lời hoàn toàn bằng tiếng Việt, giọng văn hiện đại, thực tế và truyền cảm hứng.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  return response.text;
}
