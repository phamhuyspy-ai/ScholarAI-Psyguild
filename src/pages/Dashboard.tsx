import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Search, FileText, Video, Languages, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';

export default function Dashboard() {
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
    {
      title: 'Phân tích Video',
      description: 'Trích xuất các chủ đề chính và thông tin học thuật từ nội dung video.',
      icon: Video,
      path: '/video',
      color: 'text-purple-600',
      bg: 'bg-purple-100',
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
