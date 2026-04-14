import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useMockApi } from '../lib/mockApi';
import { useAuth } from '../lib/auth';
import { Loader2, Mail, Lock, UserPlus, LogIn, KeyRound } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const api = useMockApi();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isForgot) {
        const res: any = await api.forgotPassword(email);
        if (res.success) {
          setSuccess(res.message);
          setTimeout(() => setIsForgot(false), 3000);
        } else {
          setError(res.message);
        }
      } else if (isLogin) {
        const res: any = await api.login(email, password);
        if (res.success) {
          login(res.user);
          onClose();
        } else {
          setError(res.message);
        }
      } else {
        const res: any = await api.register(email, password);
        if (res.success) {
          login(res.user);
          onClose();
        } else {
          setError(res.message);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isForgot ? 'Khôi phục mật khẩu' : isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}
          </CardTitle>
          <CardDescription className="text-center">
            {isForgot 
              ? 'Nhập email để nhận mật khẩu mới' 
              : isLogin 
                ? 'Chào mừng bạn quay lại với ScholarAI' 
                : 'Tạo tài khoản để sử dụng các tính năng cao cấp'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {!isForgot && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={() => setIsForgot(true)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isForgot ? (
                <>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Gửi mật khẩu mới
                </>
              ) : isLogin ? (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Đăng nhập
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Đăng ký
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {isForgot ? (
              <button onClick={() => setIsForgot(false)} className="text-blue-600 hover:underline font-medium">
                Quay lại đăng nhập
              </button>
            ) : isLogin ? (
              <>
                Chưa có tài khoản?{' '}
                <button onClick={() => setIsLogin(false)} className="text-blue-600 hover:underline font-medium">
                  Đăng ký ngay
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <button onClick={() => setIsLogin(true)} className="text-blue-600 hover:underline font-medium">
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
