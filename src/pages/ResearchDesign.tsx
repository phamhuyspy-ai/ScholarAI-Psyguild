import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { ProgressBar } from '../components/ProgressBar';
import { generateAIContent } from '../lib/ai';
import { ResultActions } from '../components/ResultActions';

export default function ResearchDesign() {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, userData, isAdmin } = useAuth();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const prompt = `Bạn là một Giáo sư hướng dẫn nghiên cứu khoa học xuất sắc.

Dựa trên chủ đề nghiên cứu sau:
"${topic}"

Hãy thiết kế một khung nghiên cứu toàn diện. Trình bày bằng Markdown RÕ RÀNG, ĐẸP MẮT, bắt buộc sử dụng BẢNG (Table) và DANH SÁCH (List) theo cấu trúc sau:

1. Mục tiêu Nghiên cứu (Sử dụng Bullet list):
   - Mục tiêu tổng quát.
   - Các mục tiêu cụ thể (ít nhất 3 mục tiêu).

2. Câu hỏi Nghiên cứu (Sử dụng Numbered list):
   - Đặt ra 3-5 câu hỏi nghiên cứu cốt lõi cần giải quyết.

3. Phương pháp Nghiên cứu (BẮT BUỘC TRÌNH BÀY BẰNG BẢNG MARKDOWN):
   - Tạo một bảng gồm 3 cột: "Khía cạnh", "Phương pháp đề xuất", "Lý do lựa chọn".
   - Các khía cạnh bao gồm: Cách tiếp cận (Định lượng/Định tính/Hỗn hợp), Thu thập dữ liệu, Phân tích dữ liệu, Đối tượng nghiên cứu.

4. Khung Lý thuyết & Khái niệm (Sử dụng Danh sách):
   - Các lý thuyết chính làm nền tảng.
   - Các biến số chính (Độc lập, Phụ thuộc, Trung gian - nếu có).

5. Đóng góp Dự kiến (Sử dụng Bullet list):
   - Đóng góp về mặt lý luận.
   - Đóng góp về mặt thực tiễn.`;

      const res = await generateAIContent(prompt, user, userData, isAdmin);
      setResult(res);
    } catch (error: any) {
      console.error('Error generating research design:', error);
      let errorMessage = 'Đã xảy ra lỗi trong quá trình tạo thiết kế nghiên cứu.';
      
      try {
        const errInfo = JSON.parse(error.message);
        if (errInfo.error) {
          errorMessage = `Lỗi hệ thống: ${errInfo.error}`;
        }
      } catch (e) {
        // Not a JSON error message, use original
        errorMessage = error.message || errorMessage;
      }
      
      setResult(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          Thiết kế Nghiên cứu <Sparkles className="w-6 h-6 text-blue-600" />
        </h1>
        <p className="text-slate-600 mt-2">
          Mô tả chủ đề hoặc ý tưởng nghiên cứu của bạn. AI sẽ sử dụng tư duy bậc cao để tạo ra một phương pháp luận nghiên cứu toàn diện.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mô tả Chủ đề</CardTitle>
              <CardDescription>Hãy mô tả càng chi tiết càng tốt về mục tiêu của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProgressBar isLoading={loading} className="mb-2" />
              <Textarea
                placeholder="VD: Tác động của trí tuệ nhân tạo đối với giáo dục mầm non ở môi trường đô thị..."
                className="min-h-[200px] resize-none"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <Button className="w-full" onClick={handleGenerate} disabled={loading || !topic.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang suy nghĩ sâu...
                  </>
                ) : (
                  'Tạo Thiết kế'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Phương pháp luận được đề xuất</CardTitle>
              {result && (
                <ResultActions text={result} elementId="research-design-result" fileName="thiet-ke-nghien-cuu.pdf" />
              )}
            </CardHeader>
            <CardContent>
              {result ? (
                <div id="research-design-result" className="markdown-body bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                  <Markdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm, remarkBreaks]}>{result}</Markdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                  <BookOpenIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p>Thiết kế nghiên cứu của bạn sẽ xuất hiện ở đây.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BookOpenIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
