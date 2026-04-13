import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { checkTopicDuplication } from '../lib/gemini';
import Markdown from 'react-markdown';
import { Loader2, Search } from 'lucide-react';

export default function TopicCheck() {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await checkTopicDuplication(topic);
      setResult(res);
    } catch (error) {
      console.error(error);
      setResult('Đã xảy ra lỗi trong quá trình kiểm tra chủ đề.');
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
            <CardHeader>
              <CardTitle>Kết quả Phân tích</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="prose prose-slate max-w-none">
                  <Markdown>{result}</Markdown>
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
