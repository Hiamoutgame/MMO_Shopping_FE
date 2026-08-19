import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from '../common/libs/validation';
import { useAuthStore } from '../common/stores/useAuthStore';
import { MOCK_USER, MOCK_TOKENS } from '../common/mocks/auth';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { APP_CONSTANTS } from '../common/const/app';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setAuth(MOCK_USER, MOCK_TOKENS);
      setLoading(false);
      alert('Đăng nhập thành công!');
      navigate(APP_CONSTANTS.ROUTES.PRODUCTS);
    }, 500);
  };

  return (
    <div className="w-full rounded-[24px] bg-[#0C101CEE] border border-[#7887BE33] p-8 backdrop-blur-[18px] shadow-[0_18px_38px_rgba(0,0,0,0.6)] flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold text-white">Đăng Nhập</h1>
        <p className="text-sm text-[#94A3B8]">
          Truy cập hệ thống quản lý đơn hàng & tài khoản AI của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[#566079] uppercase tracking-wider">
            EMAIL
          </label>
          <Input
            type="email"
            placeholder="admin@mmo-ai.vn"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && <span className="text-xs text-[#FF5C5C]">{errors.email}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono text-[#566079] uppercase tracking-wider">
              MẬT KHẨU
            </label>
            <a href="#forgot" className="text-xs text-[#0EA5FF] hover:underline">
              Quên mật khẩu?
            </a>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          {errors.password && <span className="text-xs text-[#FF5C5C]">{errors.password}</span>}
        </div>

        <Button type="submit" size="lg" variant="primary" className="w-full mt-2" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng Nhập Ngay'}
        </Button>
      </form>

      <div className="text-center text-xs text-[#94A3B8] pt-4 border-t border-white/5">
        Chưa có tài khoản?{' '}
        <Link to={APP_CONSTANTS.ROUTES.REGISTER} className="text-[#0EA5FF] font-semibold hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
