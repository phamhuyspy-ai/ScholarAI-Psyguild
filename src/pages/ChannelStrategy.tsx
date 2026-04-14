import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Loader2, Youtube, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../lib/auth';
import { ProgressBar } from '../components/ProgressBar';
import { generateAIContent } from '../lib/ai';

export default function ChannelStrategy() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const { user, userData, isAdmin } = useAuth();

  const generateStrategy = async () => {
    if (!input.trim()) {
      setError('Vui lòng nhập thông tin về kênh bạn muốn xây dựng.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const prompt = `Bạn là một chuyên gia xây dựng thương hiệu cá nhân và phát triển kênh (YouTube, TikTok, Facebook, Instagram) hàng đầu.

Dựa trên thông tin sau về kênh muốn xây dựng:
"${input}"

Hãy lập một chiến lược xây kênh chi tiết, bài bản từ con số 0. Trình bày bằng Markdown RÕ RÀNG, ĐẸP MẮT, bắt buộc sử dụng BẢNG (Table) và DANH SÁCH (List) theo cấu trúc sau:

1. Định vị Kênh & Chân dung Khán giả (Sử dụng Bullet list):
   - Concept chính của kênh (Sự khác biệt, USP).
   - Chân dung khán giả mục tiêu (Độ tuổi, sở thích, nỗi đau).
   - Tone & Mood (Phong cách truyền đạt).

2. Tuyến nội dung chính (Content Pillars) (BẮT BUỘC TRÌNH BÀY BẰNG BẢNG MARKDOWN):
   - Tạo một bảng gồm 3 cột: "Tuyến nội dung (Pillar)", "Tỷ lệ (%)", "Ví dụ chủ đề cụ thể".
   - Chia tỷ lệ hợp lý (VD: 40% Giáo dục, 40% Giải trí, 20% Bán hàng/Cá nhân).

3. Kế hoạch Đăng bài 30 ngày đầu tiên (Sử dụng Numbered list hoặc Bullet list):
   - Tần suất đăng bài trên từng nền tảng (YouTube, TikTok, Facebook, v.v.).
   - Gợi ý lịch đăng bài cụ thể cho tuần đầu tiên.

4. Chiến lược Tăng trưởng & Kiếm tiền (Monetization) (Sử dụng Danh sách):
   - Cách kéo traffic ban đầu (Seeding, Collab, Chạy Ads nhẹ).
   - Các mô hình kiếm tiền phù hợp với kênh này (Affiliate, Booking, Bán khóa học, Bán sản phẩm vật lý).`;

      const text = await generateAIContent(prompt, user, userData, isAdmin);
      setResult(text);
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
          <Youtube className="w-8 h-8 text-red-600" />
          Chiến lược Xây kênh
        </h1>
        <p className="text-slate-600 mt-2">
          Lập kế hoạch phát triển kênh YouTube, TikTok, Facebook bài bản và tối ưu từ con số 0.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin Kênh</CardTitle>
              <CardDescription>
                Nhập chủ đề, mục tiêu, nền tảng muốn tập trung và điểm mạnh của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProgressBar isLoading={loading} className="mb-2" />
              <Textarea
                placeholder="Ví dụ: Mình muốn xây kênh TikTok và YouTube Shorts về chủ đề Review sách tâm lý học. Mục tiêu là bán Affiliate và xây dựng thương hiệu cá nhân. Điểm mạnh của mình là giọng đọc truyền cảm..."
                className="min-h-[200px] resize-y"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white" 
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

          <Card className="bg-red-50 border-red-100">
            <CardContent className="p-4 text-sm text-red-800">
              <p className="font-semibold mb-2">💡 Mẹo:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Càng cung cấp nhiều chi tiết về điểm mạnh/yếu, AI càng đưa ra chiến lược cá nhân hóa tốt hơn.</li>
                <li>Đừng quên nhắc đến mục tiêu cuối cùng của bạn (VD: nổi tiếng, bán hàng, hay chỉ để chia sẻ).</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full min-h-[500px]">
            <CardHeader>
              <CardTitle className="text-lg">Bản đồ Chiến lược</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-red-600" />
                  <p>AI đang phác thảo chiến lược xây kênh cho bạn...</p>
                </div>
              ) : result ? (
                <div className="prose prose-slate max-w-none 
                  prose-headings:text-slate-800 prose-headings:font-bold 
                  prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                  prose-a:text-red-600 hover:prose-a:text-red-700
                  prose-table:w-full prose-table:border-collapse prose-table:overflow-hidden prose-table:rounded-lg prose-table:shadow-sm prose-table:my-6
                  prose-th:bg-red-50 prose-th:text-red-800 prose-th:py-3 prose-th:px-4 prose-th:text-left prose-th:border-b-2 prose-th:border-red-200
                  prose-td:py-3 prose-td:px-4 prose-td:border-b prose-td:border-slate-100
                  prose-tr:hover:bg-slate-50
                  prose-li:marker:text-red-500
                  prose-strong:text-red-700
                  prose-blockquote:border-l-4 prose-blockquote:border-red-300 prose-blockquote:bg-red-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                ">
                  <Markdown remarkPlugins={[remarkGfm]}>{result}</Markdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 py-20 text-center">
                  <p>Bản đồ chiến lược sẽ hiển thị ở đây sau khi bạn nhấn "Tạo Chiến lược".</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
