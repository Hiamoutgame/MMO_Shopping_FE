import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { registerSchema } from '../common/libs/validation';
import { useAuthStore } from '../common/stores/useAuthStore';
import { identityApi } from '../common/apis/identityApi';
import { mapAuthAccountToUser } from '../common/mapping/identity';
import type { ApiError } from '../common/models/common';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { APP_CONSTANTS } from '../common/const/app';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse(formData);
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
    try {
      const auth = await identityApi.register({
        email: result.data.email,
        password: result.data.password,
        displayName: result.data.displayName,
      });
      const tokens = auth.tokens;
      const user = mapAuthAccountToUser(auth.account);
      setAuth(user, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      });

      const returnTo = searchParams.get('returnTo');
      const defaultRoute =
        user.role === 'admin' ? APP_CONSTANTS.ROUTES.ADMIN : APP_CONSTANTS.ROUTES.PRODUCTS;
      navigate(returnTo || defaultRoute, { replace: true });
    } catch (error) {
      const apiError = error as ApiError;
      // Email đã tồn tại hiển thị tại trường email; lỗi khác hiển thị chung.
      if (apiError.errorCode === 'EMAIL_ALREADY_EXISTS') {
        setErrors({ email: apiError.message || 'Email đã tồn tại.' });
      } else {
        setErrors({ confirmPassword: apiError.message || 'Đăng ký thất bại.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-[24px] bg-[#0C101CEE] border border-[#7887BE33] p-8 backdrop-blur-[18px] shadow-[0_18px_38px_rgba(0,0,0,0.6)] flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold text-white">Đăng Ký Tài Khoản</h1>
        <p className="text-sm text-[#94A3B8]">
          Tạo tài khoản để nhận ưu đãi và bảo hành tự động
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[#566079] uppercase tracking-wider">
            HỌ VÀ TÊN
          </label>
          <Input
            placeholder="Nguyễn Văn A"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          />
          {errors.displayName && <span className="text-xs text-[#FF5C5C]">{errors.displayName}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[#566079] uppercase tracking-wider">
            EMAIL
          </label>
          <Input
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && <span className="text-xs text-[#FF5C5C]">{errors.email}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[#566079] uppercase tracking-wider">
            MẬT KHẨU
          </label>
          <Input
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          {errors.password && <span className="text-xs text-[#FF5C5C]">{errors.password}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[#566079] uppercase tracking-wider">
            XÁC NHẬN MẬT KHẨU
          </label>
          <Input
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
          {errors.confirmPassword && (
            <span className="text-xs text-[#FF5C5C]">{errors.confirmPassword}</span>
          )}
        </div>

        <Button type="submit" size="lg" variant="primary" className="w-full mt-2" disabled={loading}>
          {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Ngay'}
        </Button>
      </form>

      <div className="text-center text-xs text-[#94A3B8] pt-4 border-t border-white/5">
        Đã có tài khoản?{' '}
        <Link to={APP_CONSTANTS.ROUTES.LOGIN} className="text-[#0EA5FF] font-semibold hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
