import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeVideo } from '../lib/gemini';
import Markdown from 'react-markdown';
import { Loader2, Video, Upload } from 'lucide-react';

export default function VideoAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:video/mp4;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const base64Data = await fileToBase64(file);
      const res = await analyzeVideo(base64Data, file.type, prompt);
      setResult(res);
    } catch (error) {
      console.error(error);
      setResult('Đã xảy ra lỗi trong quá trình phân tích video. Lưu ý: Các tệp lớn có thể không hoạt động trong môi trường này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          Phân tích Video <Video className="w-6 h-6 text-purple-600" />
        </h1>
        <p className="text-slate-600 mt-2">
          Tải lên một video để trích xuất các chủ đề chính, phương pháp luận và thông tin học thuật bằng Gemini Pro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tải Video lên</CardTitle>
              <CardDescription>Chọn một tệp video để phân tích.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  {file ? file.name : 'Nhấp để chọn video'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'MP4, WebM, v.v.'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Yêu cầu cụ thể (Tùy chọn)</label>
                <Textarea
                  placeholder="VD: Tóm tắt các lập luận chính được trình bày trong bài giảng này..."
                  className="min-h-[100px] resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleAnalyze} disabled={loading || !file}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  'Phân tích Video'
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
                  <Video className="w-12 h-12 mb-4 opacity-20" />
                  <p>Thông tin chi tiết từ video sẽ xuất hiện ở đây.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
