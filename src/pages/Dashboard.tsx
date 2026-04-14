import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BookOpen, Search, FileText, Languages, TrendingUp, Users, Youtube } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../lib/auth';
import { useMockApi } from '../lib/mockApi';

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const api = useMockApi();
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      loadPendingPayments();
    }
  }, [isAdmin]);

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

  const academicTools = [
    {
      title: 'Thiết kế Nghiên cứu',
      description: 'Tạo phương pháp luận và mục tiêu nghiên cứu toàn diện bằng AI tư duy bậc cao.',
      icon: BookOpen,
      path: '/design',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Kiểm tra Trùng lặp Chủ đề',
      description: 'Phân tích chủ đề nghiên cứu của bạn so với tài liệu hiện có để đảm bảo tính nguyên bản.',
      icon: Search,
      path: '/topic',
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Kiểm tra Đạo văn',
      description: 'Rà soát văn bản để tìm nội dung thiếu nguyên bản và các trích dẫn còn thiếu.',
      icon: FileText,
      path: '/plagiarism',
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      title: 'Dịch thuật Học thuật',
      description: 'Dịch thuật tài liệu nghiên cứu chuẩn xác, giữ nguyên văn phong và thuật ngữ chuyên ngành.',
      icon: Languages,
      path: '/translation',
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
    },
  ];

  const marketTools = [
    {
      title: 'Nghiên cứu Từ khóa & Chủ đề',
      description: 'Nghiên cứu từ khóa hot, chủ đề đang nổi và lập chiến lược nội dung đa kênh.',
      icon: TrendingUp,
      path: '/content-strategy',
      color: 'text-rose-600',
      bg: 'bg-rose-100',
    },
    {
      title: 'Chiến lược Xây kênh',
      description: 'Lập kế hoạch phát triển kênh YouTube, TikTok, Facebook bài bản và tối ưu.',
      icon: Youtube,
      path: '/channel-strategy',
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
  ];

  const renderToolCard = (tool: any) => {
    const Icon = tool.icon;
    return (
      <Link key={tool.path} to={tool.path}>
        <Card className="h-full hover:shadow-md transition-shadow border-slate-200 cursor-pointer">
          <CardHeader>
            <div className={`w-12 h-12 rounded-lg ${tool.bg} flex items-center justify-center mb-4`}>
              <Icon className={`w-6 h-6 ${tool.color}`} />
            </div>
            <CardTitle>{tool.title}</CardTitle>
            <CardDescription>{tool.description}</CardDescription>
          </CardHeader>
        </Card>
      </Link>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Chào mừng đến với ScholarAI Psyguild</h1>
        <p className="text-slate-600 mt-2">Chọn một công cụ bên dưới để hỗ trợ cho quá trình nghiên cứu học thuật của bạn.</p>
      </div>

      {isAdmin && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 border-b pb-2">Quản trị viên (Admin)</h2>
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
        </div>
      )}

      <div className="mb-12">
        <h2 className="text-xl font-semibold text-slate-800 mb-6 border-b pb-2">Nghiên cứu Khoa học</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {academicTools.map(renderToolCard)}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-6 border-b pb-2">Nghiên cứu Thị trường & Nội dung</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketTools.map(renderToolCard)}
        </div>
      </div>
    </div>
  );
}
