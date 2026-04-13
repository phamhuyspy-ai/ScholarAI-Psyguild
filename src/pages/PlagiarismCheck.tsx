import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { checkPlagiarism } from '../lib/gemini';
import Markdown from 'react-markdown';
import { Loader2, FileText, Upload } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function PlagiarismCheck() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCheck = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await checkPlagiarism(text);
      setResult(res);
    } catch (error) {
      console.error(error);
      setResult('Đã xảy ra lỗi trong quá trình phân tích văn bản.');
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer) => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\\n';
    }
    return fullText;
  };

  const extractTextFromDOCX = async (arrayBuffer: ArrayBuffer) => {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      let extractedText = '';

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        extractedText = await extractTextFromPDF(arrayBuffer);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        extractedText = await extractTextFromDOCX(arrayBuffer);
      } else {
        alert('Vui lòng tải lên file PDF hoặc DOCX.');
        setExtracting(false);
        return;
      }

      setText(extractedText);
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Đã xảy ra lỗi khi đọc file. Vui lòng thử lại.');
    } finally {
      setExtracting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          Kiểm tra Đạo văn <FileText className="w-6 h-6 text-amber-600" />
        </h1>
        <p className="text-slate-600 mt-2">
          Tải lên file PDF/Word hoặc dán văn bản để nén, trích xuất nội dung và rà soát tính nguyên bản.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Văn bản cần Phân tích</span>
                <div>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={extracting}
                  >
                    {extracting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {extracting ? 'Đang trích xuất...' : 'Tải file lên (PDF/Word)'}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>Dán bản nháp hoặc tải file lên để tự động trích xuất chữ.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 h-[calc(100%-100px)] flex flex-col">
              <Textarea
                placeholder="Dán văn bản của bạn vào đây hoặc tải file lên..."
                className="flex-1 min-h-[300px] resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={extracting}
              />
              <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handleCheck} disabled={loading || !text.trim() || extracting}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  'Phân tích Văn bản'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full min-h-[500px]">
            <CardHeader>
              <CardTitle>Báo cáo Phân tích</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="prose prose-slate max-w-none">
                  <Markdown>{result}</Markdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                  <FileText className="w-12 h-12 mb-4 opacity-20" />
                  <p>Báo cáo phân tích sẽ xuất hiện ở đây.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
