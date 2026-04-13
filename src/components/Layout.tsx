import { Outlet, Link, useLocation } from 'react-router';
import { BookOpen, Search, FileText, Video, LayoutDashboard, Languages, TrendingUp } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const academicItems = [
    { name: 'Bảng điều khiển', path: '/', icon: LayoutDashboard },
    { name: 'Thiết kế Nghiên cứu', path: '/design', icon: BookOpen },
    { name: 'Kiểm tra Chủ đề', path: '/topic', icon: Search },
    { name: 'Kiểm tra Đạo văn', path: '/plagiarism', icon: FileText },
    { name: 'Dịch thuật Học thuật', path: '/translation', icon: Languages },
    { name: 'Phân tích Video', path: '/video', icon: Video },
  ];

  const marketItems = [
    { name: 'Nghiên cứu Từ khóa & Chủ đề', path: '/content-strategy', icon: TrendingUp },
  ];

  const renderNavItems = (items: any[]) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.path;
      return (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Icon className="w-4 h-4" />
          {item.name}
        </Link>
      );
    });
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            ScholarAI Psyguild
          </h1>
          <p className="text-xs text-slate-500 mt-1">Trợ lý Nghiên cứu Học thuật</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="px-4 space-y-1 mb-8">
            <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Nghiên cứu Khoa học
            </div>
            {renderNavItems(academicItems)}
          </nav>

          <nav className="px-4 space-y-1 mb-8">
            <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Nghiên cứu Thị trường
            </div>
            {renderNavItems(marketItems)}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
