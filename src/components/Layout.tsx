import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { BookOpen, Search, FileText, LayoutDashboard, Languages, TrendingUp, Settings, CreditCard, LogIn, LogOut, User as UserIcon, Youtube } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Button } from '../../components/ui/button';
import { AuthModal } from './AuthModal';

export default function Layout() {
  const location = useLocation();
  const { user, userData, isAdmin, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const academicItems = [
    { name: 'Bảng điều khiển', path: '/', icon: LayoutDashboard },
    { name: 'Thiết kế Nghiên cứu', path: '/design', icon: BookOpen },
    { name: 'Kiểm tra Chủ đề', path: '/topic', icon: Search },
    { name: 'Kiểm tra Đạo văn', path: '/plagiarism', icon: FileText },
    { name: 'Dịch thuật Học thuật', path: '/translation', icon: Languages },
  ];

  const marketItems = [
    { name: 'Nghiên cứu Từ khóa & Chủ đề', path: '/content-strategy', icon: TrendingUp },
    { name: 'Chiến lược Xây kênh', path: '/channel-strategy', icon: Youtube },
  ];

  const systemItems = [
    { name: 'Nâng cấp gói', path: '/pricing', icon: CreditCard },
  ];

  if (isAdmin) {
    systemItems.push({ name: 'Cài đặt (Admin)', path: '/settings', icon: Settings });
  }

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

          <nav className="px-4 space-y-1 mb-8">
            <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Hệ thống
            </div>
            {renderNavItems(systemItems)}
          </nav>
        </div>

        {/* User Profile / Auth Section */}
        <div className="p-4 border-t border-slate-200">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-slate-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user.displayName || 'Người dùng'}</p>
                  <p className="text-xs text-slate-500 truncate">{userData?.subscription === 'free' ? 'Gói Cơ Bản' : 'Gói Premium'}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full justify-start text-slate-600" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          ) : (
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white" onClick={() => setShowAuthModal(true)}>
              <LogIn className="w-4 h-4 mr-2" />
              Đăng nhập
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
