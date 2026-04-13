import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateResearchDesign } from '../lib/gemini';
import Markdown from 'react-markdown';
import { Loader2, Sparkles } from 'lucide-react';

export default function ResearchDesign() {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await generateResearchDesign(topic);
      setResult(res);
    } catch (error) {
      console.error(error);
      setResult('Đã xảy ra lỗi trong quá trình tạo thiết kế nghiên cứu.');
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
            <CardHeader>
              <CardTitle>Phương pháp luận được đề xuất</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="prose prose-slate max-w-none">
                  <Markdown>{result}</Markdown>
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
