import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Check, Sparkles, QrCode, Loader2, PartyPopper } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useMockApi } from '../lib/mockApi';
import { AuthModal } from '../components/AuthModal';

export default function Pricing() {
  const { user, userData } = useAuth();
  const api = useMockApi();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (userData && userData.subscription !== 'free') {
      const seenAlert = localStorage.getItem(`seen_upgrade_${userData.subscription}`);
      if (!seenAlert) {
        setShowUpgradeAlert(true);
        localStorage.setItem(`seen_upgrade_${userData.subscription}`, 'true');
      }
    }
  }, [userData]);

  const handleSubscribe = (pkg: 'monthly' | 'yearly') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (userData?.subscription === pkg) return; // Already subscribed
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
    setPaymentSuccess(false);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const amount = selectedPackage === 'monthly' ? 100000 : 960000;
      const transferCode = `PAY-${user?.email?.split('@')[0]}-${Math.random().toString(36).slice(-4)}`.toUpperCase();
      
      const res: any = await api.createPayment(user?.email || '', selectedPackage, amount, transferCode);
      if (res.success) {
        setPaymentSuccess(true);
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi khi tạo yêu cầu thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  const amount = selectedPackage === 'monthly' ? 100000 : 960000;
  // Get bank config from localStorage or use default mock
  const bankConfig = JSON.parse(localStorage.getItem('bank_config') || '{"bankId": "MB", "accountNo": "0123456789", "accountName": "NGUYEN VAN A"}');
  const qrUrl = `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-compact2.png?amount=${amount}&addInfo=Thanh toan ScholarAI&accountName=${encodeURIComponent(bankConfig.accountName)}`;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Nâng cấp gói API
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Mở khóa toàn bộ sức mạnh của AI với số lượt yêu cầu không giới hạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card className="relative flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Gói Cơ Bản</CardTitle>
            <CardDescription>Dành cho người dùng trải nghiệm</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">Miễn phí</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>10 lượt yêu cầu / ngày</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Sử dụng các công cụ cơ bản</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" disabled>
              {userData?.subscription === 'free' ? 'Đang sử dụng' : 'Gói hiện tại'}
            </Button>
          </CardFooter>
        </Card>

        {/* Monthly Plan */}
        <Card className="relative flex flex-col border-rose-200 shadow-lg scale-105 z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> Phổ biến nhất
          </div>
          <CardHeader>
            <CardTitle className="text-xl text-rose-600">Gói Tháng</CardTitle>
            <CardDescription>Linh hoạt cho nhu cầu ngắn hạn</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">100k</span>
              <span className="text-slate-500">/tháng</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-500" />
                <span className="font-medium">Không giới hạn lượt yêu cầu</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-500" />
                <span>Truy cập tất cả công cụ AI</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-500" />
                <span>Hỗ trợ ưu tiên</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {!user ? (
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white" onClick={() => setShowAuthModal(true)}>
                Đăng nhập để mua
              </Button>
            ) : userData?.subscription === 'monthly' ? (
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white cursor-default">
                <Check className="w-4 h-4 mr-2" />
                Đã đăng ký
              </Button>
            ) : (
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white" onClick={() => handleSubscribe('monthly')}>
                Đăng ký ngay
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Yearly Plan */}
        <Card className="relative flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Gói Năm</CardTitle>
            <CardDescription>Tiết kiệm 20% chi phí</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">80k</span>
              <span className="text-slate-500">/tháng</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Thanh toán 960k mỗi năm</p>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="font-medium">Không giới hạn lượt yêu cầu</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Truy cập tất cả công cụ AI</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Hỗ trợ ưu tiên 24/7</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {!user ? (
              <Button className="w-full" variant="outline" onClick={() => setShowAuthModal(true)}>
                Đăng nhập để mua
              </Button>
            ) : userData?.subscription === 'yearly' ? (
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white cursor-default border-none">
                <Check className="w-4 h-4 mr-2" />
                Đã đăng ký
              </Button>
            ) : (
              <Button className="w-full" variant="outline" onClick={() => handleSubscribe('yearly')}>
                Đăng ký ngay
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Upgrade Success Alert */}
      {showUpgradeAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowUpgradeAlert(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Nâng cấp thành công!</h3>
              <p className="text-slate-600">
                Tài khoản của bạn đã được kích hoạt gói <strong className="text-rose-600">{userData?.subscription === 'yearly' ? 'Năm' : 'Tháng'}</strong>.
                <br/><br/>
                Bạn có thể sử dụng <strong>không giới hạn</strong> tất cả các tính năng AI của hệ thống.
              </p>
              <Button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowUpgradeAlert(false)}>
                Bắt đầu trải nghiệm ngay
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <QrCode className="w-6 h-6" />
                Thanh toán {selectedPackage === 'monthly' ? 'Gói Tháng' : 'Gói Năm'}
              </CardTitle>
              <CardDescription className="text-center">
                Quét mã QR bằng ứng dụng ngân hàng để thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {paymentSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Đã gửi yêu cầu!</h3>
                  <p className="text-slate-600">
                    Hệ thống đã ghi nhận yêu cầu thanh toán của bạn. Admin sẽ kiểm tra và kích hoạt tài khoản trong thời gian sớm nhất.
                  </p>
                  <Button className="w-full mt-4" onClick={() => setShowPaymentModal(false)}>
                    Đóng
                  </Button>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 p-4 rounded-lg flex justify-center">
                    <img src={qrUrl} alt="QR Code Thanh toán" className="max-w-[250px] w-full rounded-lg shadow-sm" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Ngân hàng:</span>
                      <span className="font-medium">{bankConfig.bankId}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Số tài khoản:</span>
                      <span className="font-medium">{bankConfig.accountNo}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Chủ tài khoản:</span>
                      <span className="font-medium">{bankConfig.accountName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Số tiền:</span>
                      <span className="font-bold text-rose-600">{amount.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
                    <strong>Lưu ý:</strong> Sau khi chuyển khoản thành công, vui lòng nhấn nút bên dưới để thông báo cho Admin.
                  </div>

                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    onClick={handleConfirmPayment}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Tôi đã chuyển khoản'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
