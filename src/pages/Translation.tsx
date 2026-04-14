import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import Markdown from 'react-markdown';
import { Loader2, Languages } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { ProgressBar } from '../components/ProgressBar';
import { generateAIContent } from '../lib/ai';

export default function Translation() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetLang, setTargetLang] = useState('Vietnamese');
  const { user, userData, isAdmin } = useAuth();

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const prompt = `Bạn là một dịch giả chuyên nghiệp và chuyên gia học thuật.

Hãy dịch đoạn văn bản sau sang ${targetLang}, đảm bảo giữ nguyên văn phong học thuật, tính chính xác của các thuật ngữ chuyên ngành và cấu trúc câu mạch lạc:

"${text}"

Chỉ trả về bản dịch, không cần giải thích thêm.`;

      const res = await generateAIContent(prompt, user, userData, isAdmin);
      setResult(res);
    } catch (error: any) {
      console.error(error);
      setResult(error.message || 'Đã xảy ra lỗi trong quá trình dịch thuật.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          Dịch thuật Học thuật <Languages className="w-6 h-6 text-indigo-600" />
        </h1>
        <p className="text-slate-600 mt-2">
          Dịch thuật tài liệu nghiên cứu chuẩn xác, giữ nguyên văn phong học thuật và thuật ngữ chuyên ngành.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Văn bản gốc</CardTitle>
              <CardDescription>Nhập văn bản bạn muốn dịch.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 h-[calc(100%-100px)] flex flex-col">
              <ProgressBar isLoading={loading} className="mb-2" />
              <Textarea
                placeholder="Nhập hoặc dán văn bản vào đây..."
                className="flex-1 min-h-[300px] resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  variant={targetLang === 'Vietnamese' ? 'default' : 'outline'} 
                  className={targetLang === 'Vietnamese' ? 'bg-indigo-600 hover:bg-indigo-700 flex-1' : 'flex-1'}
                  onClick={() => setTargetLang('Vietnamese')}
                >
                  Dịch sang Tiếng Việt
                </Button>
                <Button 
                  variant={targetLang === 'English' ? 'default' : 'outline'} 
                  className={targetLang === 'English' ? 'bg-indigo-600 hover:bg-indigo-700 flex-1' : 'flex-1'}
                  onClick={() => setTargetLang('English')}
                >
                  Dịch sang Tiếng Anh
                </Button>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleTranslate} disabled={loading || !text.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang dịch...
                  </>
                ) : (
                  'Bắt đầu dịch'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full min-h-[500px]">
            <CardHeader>
              <CardTitle>Bản dịch</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="prose prose-slate max-w-none whitespace-pre-wrap">
                  {result}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                  <Languages className="w-12 h-12 mb-4 opacity-20" />
                  <p>Bản dịch sẽ hiển thị ở đây.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
