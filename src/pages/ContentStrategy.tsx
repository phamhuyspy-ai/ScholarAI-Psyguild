import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, TrendingUp, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ContentStrategy() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const generateStrategy = async () => {
    if (!input.trim()) {
      setError('Vui lòng nhập ý tưởng hoặc dữ liệu nghiên cứu.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Bạn là một chuyên gia Content Marketing, SEO và Phân tích xu hướng mạng xã hội.

Dựa trên chủ đề/ý tưởng sau:
"${input}"

Hãy nghiên cứu và lập một chiến lược nội dung chi tiết, tập trung vào các xu hướng đang nổi (hot trends) và tối ưu hóa tăng trưởng. Trình bày bằng Markdown RÕ RÀNG, ĐẸP MẮT, bắt buộc sử dụng BẢNG (Table) và DANH SÁCH (List) theo cấu trúc sau:

1. Nghiên cứu Từ khóa & Chủ đề Hot (BẮT BUỘC TRÌNH BÀY BẰNG BẢNG MARKDOWN):
   - Tạo một bảng gồm 3 cột: "Từ khóa / Chủ đề", "Lượng tìm kiếm / Độ thu hút", "Nền tảng phù hợp".
   - Sắp xếp dữ liệu trong bảng theo lượng tìm kiếm/thu hút từ CAO xuống THẤP.

2. Hướng xây dựng nội dung & Trend hot cho từng nền tảng (Sử dụng Bullet list gọn gàng):
   - Website/Blog: Các chủ đề bài viết dài chuẩn SEO đang được săn đón.
   - YouTube: Các dạng video dài, nội dung giáo dục/giải trí đang trending.
   - TikTok: Các trend ngắn, format video, hoặc góc độ nội dung dễ viral.
   - Facebook: Dạng bài đăng (hình ảnh, text, reels) dễ tương tác và chia sẻ.

3. Chiến lược tăng Follower và Tăng View (Sử dụng Numbered list hoặc Bullet list):
   - Các chiến thuật cụ thể để thu hút người xem mới.
   - Cách giữ chân người dùng và chuyển đổi view thành follower/subscriber.
   - Mẹo tối ưu hóa thuật toán cho từng nền tảng.

4. Tiêu đề Viral mẫu (Sử dụng Danh sách):
   - Gợi ý 5-7 tiêu đề giật tít, thu hút sự chú ý ngay từ 3 giây đầu tiên.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });

      if (response.text) {
        setResult(response.text);
      } else {
        setError('Không thể tạo chiến lược. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error('Error generating strategy:', err);
      setError(err.message || 'Đã xảy ra lỗi khi kết nối với AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-rose-600" />
          Nghiên cứu Từ khóa & Chủ đề
        </h1>
        <p className="text-slate-600 mt-2">
          Nghiên cứu từ khóa hot, chủ đề đang nổi và lập chiến lược nội dung đa kênh.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Đầu vào Dữ liệu</CardTitle>
              <CardDescription>
                Nhập ý tưởng, chủ đề hoặc tóm tắt dữ liệu nghiên cứu của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Ví dụ: Khảo sát N=314 về áp lực đồng trang lứa ở sinh viên IT..."
                className="min-h-[200px] resize-y"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
              <Button 
                className="w-full bg-rose-600 hover:bg-rose-700 text-white" 
                onClick={generateStrategy}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tạo Chiến lược
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-rose-50 border-rose-100">
            <CardContent className="p-4 text-sm text-rose-800">
              <p className="font-semibold mb-2">💡 Mẹo:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Cung cấp số liệu cụ thể (nếu có) để AI đưa ra góc nhìn thực tế hơn.</li>
                <li>Nêu rõ đối tượng mục tiêu nếu bạn muốn nhắm đến một nhóm cụ thể (VD: Gen Z, dân văn phòng).</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full min-h-[500px]">
            <CardHeader>
              <CardTitle className="text-lg">Kết quả Chiến lược</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-rose-600" />
                  <p>AI đang xây dựng chiến lược nội dung đa kênh...</p>
                </div>
              ) : result ? (
                <div className="prose prose-slate max-w-none 
                  prose-headings:text-slate-800 prose-headings:font-bold 
                  prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                  prose-a:text-rose-600 hover:prose-a:text-rose-700
                  prose-table:w-full prose-table:border-collapse prose-table:overflow-hidden prose-table:rounded-lg prose-table:shadow-sm prose-table:my-6
                  prose-th:bg-rose-50 prose-th:text-rose-800 prose-th:py-3 prose-th:px-4 prose-th:text-left prose-th:border-b-2 prose-th:border-rose-200
                  prose-td:py-3 prose-td:px-4 prose-td:border-b prose-td:border-slate-100
                  prose-tr:hover:bg-slate-50
                  prose-li:marker:text-rose-500
                  prose-strong:text-rose-700
                  prose-blockquote:border-l-4 prose-blockquote:border-rose-300 prose-blockquote:bg-rose-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                ">
                  <Markdown remarkPlugins={[remarkGfm]}>{result}</Markdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 py-20 text-center">
                  <p>Kết quả chiến lược sẽ hiển thị ở đây sau khi bạn nhấn "Tạo Chiến lược".</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
