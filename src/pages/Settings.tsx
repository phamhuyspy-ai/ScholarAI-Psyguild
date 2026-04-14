import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Settings as SettingsIcon, Key, Save, CheckCircle2, Code, Copy, Check, Building2, Users, Link as LinkIcon, Webhook } from 'lucide-react';
import { useMockApi } from '../lib/mockApi';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [gptApiKey, setGptApiKey] = useState('');
  const [gasUrl, setGasUrl] = useState('');
  const [vercelUrl, setVercelUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [bankId, setBankId] = useState('MB');
  const [accountNo, setAccountNo] = useState('');
  const [accountName, setAccountName] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const api = useMockApi();

  useEffect(() => {
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) setApiKey(storedKey);
    
    const storedGptKey = localStorage.getItem('OPENAI_API_KEY');
    if (storedGptKey) setGptApiKey(storedGptKey);

    const storedGasUrl = localStorage.getItem('GAS_WEB_APP_URL');
    if (storedGasUrl) setGasUrl(storedGasUrl);

    const storedVercelUrl = localStorage.getItem('VERCEL_API_URL');
    if (storedVercelUrl) setVercelUrl(storedVercelUrl);

    const storedWebhookSecret = localStorage.getItem('WEBHOOK_SECRET');
    if (storedWebhookSecret) setWebhookSecret(storedWebhookSecret);

    const storedBank = localStorage.getItem('bank_config');
    if (storedBank) {
      const bank = JSON.parse(storedBank);
      setBankId(bank.bankId || 'MB');
      setAccountNo(bank.accountNo || '');
      setAccountName(bank.accountName || '');
    }

    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    const payments: any = await api.getPendingPayments();
    setPendingPayments(payments);
  };

  const handleApprove = async (transferCode: string) => {
    const res: any = await api.approvePayment(transferCode);
    if (res.success) {
      alert('Đã duyệt thanh toán thành công!');
      loadPendingPayments();
    } else {
      alert(res.message);
    }
  };

  const handleSave = () => {
    if (apiKey.trim()) localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    else localStorage.removeItem('GEMINI_API_KEY');

    if (gptApiKey.trim()) localStorage.setItem('OPENAI_API_KEY', gptApiKey.trim());
    else localStorage.removeItem('OPENAI_API_KEY');

    if (gasUrl.trim()) localStorage.setItem('GAS_WEB_APP_URL', gasUrl.trim());
    else localStorage.removeItem('GAS_WEB_APP_URL');

    if (vercelUrl.trim()) localStorage.setItem('VERCEL_API_URL', vercelUrl.trim());
    else localStorage.removeItem('VERCEL_API_URL');

    if (webhookSecret.trim()) localStorage.setItem('WEBHOOK_SECRET', webhookSecret.trim());
    else localStorage.removeItem('WEBHOOK_SECRET');

    localStorage.setItem('bank_config', JSON.stringify({
      bankId: bankId.trim(),
      accountNo: accountNo.trim(),
      accountName: accountName.trim().toUpperCase()
    }));

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const embedCode = `<iframe src="${window.location.origin}" width="100%" height="800px" style="border:none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-slate-600" />
          Cài đặt hệ thống
        </h1>
        <p className="text-slate-600 mt-2">
          Quản lý cấu hình, khóa API, thông tin thanh toán và duyệt người dùng.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Pending Payments */}
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50/50">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Users className="w-5 h-5" />
              Duyệt Thanh toán ({pendingPayments.length})
            </CardTitle>
            <CardDescription>
              Danh sách người dùng đã chuyển khoản và đang chờ duyệt.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {pendingPayments.length === 0 ? (
              <div className="p-6 text-center text-slate-500">Không có yêu cầu thanh toán nào đang chờ.</div>
            ) : (
              <div className="divide-y">
                {pendingPayments.map((payment, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">{payment.email}</p>
                      <p className="text-sm text-slate-500">
                        Mã CK: <strong className="text-slate-700">{payment.transferCode}</strong> • 
                        Gói: {payment.packageId === 'monthly' ? 'Tháng' : 'Năm'} • 
                        Số tiền: {payment.amount.toLocaleString()}đ
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleApprove(payment.transferCode)}>
                      Duyệt ngay
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Config */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Cấu hình Ngân hàng (Nhận thanh toán)
            </CardTitle>
            <CardDescription>
              Thông tin này sẽ được dùng để tạo mã QR cho người dùng quét khi mua gói.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Mã Ngân hàng (VD: MB, VCB, TCB)</label>
                <Input value={bankId} onChange={(e) => setBankId(e.target.value)} placeholder="MB" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Số tài khoản</label>
                <Input value={accountNo} onChange={(e) => setAccountNo(e.target.value)} placeholder="0123456789" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Tên chủ tài khoản</label>
                <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="NGUYEN VAN A" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Cấu hình API Keys
            </CardTitle>
            <CardDescription>
              Nhập API Key của bạn để sử dụng các tính năng AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium text-slate-700">
                Google Gemini API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="gptApiKey" className="text-sm font-medium text-slate-700">
                OpenAI (GPT) API Key
              </label>
              <Input
                id="gptApiKey"
                type="password"
                placeholder="sk-..."
                value={gptApiKey}
                onChange={(e) => setGptApiKey(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* GAS Config */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Cấu hình Google Apps Script (Database)
            </CardTitle>
            <CardDescription>
              Nhập URL Web App của Google Apps Script để kết nối với Google Sheets quản lý người dùng và thanh toán.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="gasUrl" className="text-sm font-medium text-slate-700">
                GAS Web App URL
              </label>
              <Input
                id="gasUrl"
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
              />
              <p className="text-sm text-slate-500">
                Nếu để trống, hệ thống sẽ sử dụng dữ liệu mô phỏng (Mock Data) lưu trên trình duyệt.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vercel & Webhook Config */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              Cấu hình Tự động hóa (Vercel Proxy & Webhook)
            </CardTitle>
            <CardDescription>
              Cấu hình Proxy Server để bảo mật API Key và nhận Webhook tự động duyệt thanh toán từ SePay/PayOS.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="vercelUrl" className="text-sm font-medium text-slate-700">
                Vercel Domain (Proxy Server)
              </label>
              <Input
                id="vercelUrl"
                type="url"
                placeholder="https://your-app.vercel.app"
                value={vercelUrl}
                onChange={(e) => setVercelUrl(e.target.value)}
              />
              <p className="text-sm text-slate-500">
                Nếu cấu hình, ứng dụng sẽ gọi AI qua Proxy thay vì gọi trực tiếp từ trình duyệt.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="webhookSecret" className="text-sm font-medium text-slate-700">
                Webhook Secret (SePay/PayOS)
              </label>
              <Input
                id="webhookSecret"
                type="password"
                placeholder="Nhập chuỗi bí mật để xác thực Webhook..."
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
              />
              <p className="text-sm text-slate-500">
                Dùng để xác thực chữ ký của Webhook, tránh giả mạo thanh toán.
              </p>
            </div>
            
            {vercelUrl && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
                <h4 className="font-medium text-slate-900 mb-2">Thông tin tích hợp Webhook:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Webhook URL (Copy vào SePay/PayOS):</span>
                    <code className="bg-slate-200 px-2 py-1 rounded text-slate-800">
                      {vercelUrl.replace(/\/$/, '')}/api/webhook
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Chat API Endpoint:</span>
                    <code className="bg-slate-200 px-2 py-1 rounded text-slate-800">
                      {vercelUrl.replace(/\/$/, '')}/api/chat
                    </code>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800">
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Đã lưu thành công
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu tất cả cấu hình
              </>
            )}
          </Button>
        </div>

        {/* Embed Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Mã nhúng WordPress (Embed Code)
            </CardTitle>
            <CardDescription>
              Sử dụng mã iframe dưới đây để nhúng toàn bộ ứng dụng này vào trang web WordPress hoặc bất kỳ nền tảng nào khác.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{embedCode}</code>
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white border-none"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Đã copy
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy mã
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
