import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { Loader2, Search } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { ProgressBar } from '../components/ProgressBar';
import { generateAIContent } from '../lib/ai';
import { ResultActions } from '../components/ResultActions';

export default function TopicCheck() {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, userData, isAdmin } = useAuth();

  const handleCheck = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const prompt = `Bạn là một chuyên gia đánh giá đề tài nghiên cứu khoa học.

Hãy phân tích chủ đề nghiên cứu sau để kiểm tra mức độ trùng lặp và tính mới:
"${topic}"

Vui lòng cung cấp báo cáo phân tích chi tiết bằng Markdown RÕ RÀNG, ĐẸP MẮT, bắt buộc sử dụng BẢNG (Table) và DANH SÁCH (List) theo cấu trúc sau:

1. Đánh giá Tính mới (Sử dụng Danh sách):
   - Mức độ trùng lặp ước tính (Cao/Trung bình/Thấp).
   - Đánh giá chung về tính cấp thiết và khả năng thực hiện.

2. Các Nghiên cứu Tương tự Đã có (BẮT BUỘC TRÌNH BÀY BẰNG BẢNG MARKDOWN):
   - Tạo một bảng gồm 3 cột: "Hướng nghiên cứu đã có", "Hạn chế của các nghiên cứu này", "Khoảng trống nghiên cứu (Research Gap)".
   - Liệt kê 3-4 hướng nghiên cứu phổ biến liên quan đến chủ đề này.

3. Gợi ý Hướng đi Mới (Sử dụng Numbered list):
   - Đề xuất 3-5 góc độ tiếp cận mới mẻ, độc đáo hơn để tránh trùng lặp.
   - Mỗi gợi ý cần có giải thích ngắn gọn lý do tại sao nó khả thi và có giá trị.

4. Từ khóa Tìm kiếm Tài liệu (Sử dụng Bullet list):
   - Gợi ý các từ khóa tiếng Việt và tiếng Anh (Keywords) để người dùng tìm kiếm thêm tài liệu tham khảo trên Google Scholar, ResearchGate.`;

      const res = await generateAIContent(prompt, user, userData, isAdmin);
      setResult(res);
    } catch (error: any) {
      console.error(error);
      setResult(error.message || 'Đã xảy ra lỗi trong quá trình kiểm tra chủ đề.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          Kiểm tra Trùng lặp Chủ đề <Search className="w-6 h-6 text-emerald-600" />
        </h1>
        <p className="text-slate-600 mt-2">
          Đảm bảo chủ đề nghiên cứu của bạn là nguyên bản. Chúng tôi sẽ tìm kiếm các tài liệu hiện có và đề xuất các góc độ độc đáo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chủ đề Đề xuất</CardTitle>
              <CardDescription>Nhập chủ đề bạn muốn nghiên cứu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProgressBar isLoading={loading} className="mb-2" />
              <Textarea
                placeholder="VD: Ảnh hưởng của mạng xã hội đến giấc ngủ của thanh thiếu niên..."
                className="min-h-[150px] resize-none"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleCheck} disabled={loading || !topic.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tìm kiếm...
                  </>
                ) : (
                  'Kiểm tra Nguyên bản'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Kết quả Phân tích</CardTitle>
              {result && (
                <ResultActions text={result} elementId="topic-check-result" fileName="kiem-tra-chu-de.pdf" />
              )}
            </CardHeader>
            <CardContent>
              {result ? (
                <div id="topic-check-result" className="markdown-body bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                  <Markdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm, remarkBreaks]}>{result}</Markdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                  <Search className="w-12 h-12 mb-4 opacity-20" />
                  <p>Kết quả sẽ xuất hiện ở đây.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
