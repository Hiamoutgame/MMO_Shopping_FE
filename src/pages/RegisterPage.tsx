import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '../common/libs/validation';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { APP_CONSTANTS } from '../common/const/app';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      setLoading(false);
      alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate(APP_CONSTANTS.ROUTES.LOGIN);
    }, 500);
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
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          {errors.fullName && <span className="text-xs text-[#FF5C5C]">{errors.fullName}</span>}
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
