import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Loader2, TrendingUp, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../lib/auth';
import { ProgressBar } from '../components/ProgressBar';
import { generateAIContent } from '../lib/ai';
import { ResultActions } from '../components/ResultActions';

export default function ContentStrategy() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const { user, userData, isAdmin } = useAuth();

  const generateStrategy = async () => {
    if (!input.trim()) {
      setError('Vui lòng nhập ý tưởng hoặc dữ liệu nghiên cứu.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
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
              <ProgressBar isLoading={loading} className="mb-2" />
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Kết quả Chiến lược</CardTitle>
              {result && !loading && (
                <ResultActions text={result} elementId="content-strategy-result" fileName="chien-luoc-noi-dung.pdf" />
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-rose-600" />
                  <p>AI đang xây dựng chiến lược nội dung đa kênh...</p>
                </div>
              ) : result ? (
                <div id="content-strategy-result" className="markdown-body bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                  <Markdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm, remarkBreaks]}>{result}</Markdown>
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
