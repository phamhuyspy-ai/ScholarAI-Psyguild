import html2pdf from 'html2pdf.js';
import { Copy, Download, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/button';

interface ResultActionsProps {
  text: string;
  elementId: string;
  fileName?: string;
}

export function ResultActions({ text, elementId, fileName = 'ket-qua.pdf' }: ResultActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for iframes or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed', err);
        }
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID ${elementId} not found.`);
      return;
    }

    const opt = {
      margin:       15,
      filename:     fileName,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true,
        logging: false
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    console.log('Attempting to generate PDF for:', elementId);
    html2pdf().set(opt).from(element).save().catch((err: any) => {
      console.error('html2pdf error:', err);
      alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.');
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs">
        {copied ? <Check className="w-3.5 h-3.5 mr-1 text-green-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
        {copied ? 'Đã chép' : 'Copy'}
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="h-8 text-xs">
        <Download className="w-3.5 h-3.5 mr-1" />
        Xuất PDF
      </Button>
    </div>
  );
}
