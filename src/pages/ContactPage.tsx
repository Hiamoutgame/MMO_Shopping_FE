import { useState } from 'react';
import { contactSchema } from '../common/libs/validation';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { Chip } from '../components/Chip/Chip';
import { InfoCard } from '../components/InfoCard/InfoCard';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
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

    setSubmitted(true);
    setFormData({ fullName: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="w-full max-w-[1440px] px-6 md:px-[96px] py-[60px] flex flex-col gap-10 relative">
      {/* Background Glows */}
      <div className="absolute w-[600px] h-[600px] bg-[#008CFF]/10 rounded-full blur-[140px] pointer-events-none top-0 left-1/4 -z-10" />
      <div className="absolute w-[500px] h-[500px] bg-[#7B2CFF]/10 rounded-full blur-[140px] pointer-events-none top-80 right-10 -z-10" />

      {/* Page Title */}
      <div className="flex flex-col gap-2">
        <Chip status="online">Hỗ Trợ Khách Hàng</Chip>
        <h1 className="text-3xl md:text-[38px] font-bold text-white tracking-tight">
          Liên Hệ Với Chúng Tôi
        </h1>
        <p className="text-[#94A3B8] text-base max-w-xl">
          Đội ngũ kỹ thuật Chợ Tài Khoản AI luôn sẵn sàng hỗ trợ bạn kích hoạt và giải quyết thắc mắc 24/7.
        </p>
      </div>

      {/* Main Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Contact Form */}
        <div className="lg:col-span-7 rounded-[24px] bg-[#0C101CEE] border border-[#7887BE33] p-8 backdrop-blur-[18px] shadow-[0_18px_38px_rgba(0,0,0,0.6)] flex flex-col gap-6">
          <h3 className="text-xl font-bold text-white">Gửi Yêu Cầu Hỗ Trợ</h3>

          {submitted && (
            <div className="p-4 rounded-xl bg-[#35FFB1]/10 border border-[#35FFB1]/30 text-sm text-[#35FFB1]">
              ✓ Cảm ơn bạn! Yêu cầu hỗ trợ đã được gửi thành công. Chúng tôi sẽ phản hồi qua email trong 15 phút.
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-[#566079] uppercase tracking-wider">
                TIÊU ĐỀ
              </label>
              <Input
                placeholder="Cần hỗ trợ về tài khoản ChatGPT..."
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
              {errors.subject && <span className="text-xs text-[#FF5C5C]">{errors.subject}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-[#566079] uppercase tracking-wider">
                NỘI DUNG YÊU CẦU
              </label>
              <textarea
                rows={4}
                placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-[#0C101CEE] border border-white/10 rounded-[14px] p-4 text-sm text-[#F8FAFC] placeholder-[#566079] outline-none transition-all focus:border-[#0EA5FF] focus:ring-1 focus:ring-[#0EA5FF]/30 resize-none font-sans"
              />
              {errors.message && <span className="text-xs text-[#FF5C5C]">{errors.message}</span>}
            </div>

            <Button type="submit" size="lg" variant="primary" className="mt-2">
              Gửi Tin Nhắn
            </Button>
          </form>
        </div>

        {/* Right: Contact Information Cards */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <InfoCard
            label="HOTLINE HỖ TRỢ"
            title="1900 888 999"
            desc="Hỗ trợ kỹ thuật trực tiếp từ 8:00 - 22:00"
            icon={<span>📞</span>}
          />
          <InfoCard
            label="EMAIL KỸ THUẬT"
            title="support@mmo-ai.vn"
            desc="Phản hồi nhanh trong vòng 15 phút"
            icon={<span>✉️</span>}
          />
          <InfoCard
            label="TELEGRAM / ZALO"
            title="@ChợTàiKhoảnAI_Admin"
            desc="Kênh tiếp nhận bảo hành khẩn cấp"
            icon={<span>💬</span>}
          />

          <div className="p-6 rounded-[20px] bg-[#0C101CEE] border border-white/10 flex flex-col gap-2 mt-2">
            <h4 className="text-sm font-bold text-white">Thời Gian Làm Việc</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Hệ thống thanh toán và cấp phát tài khoản hoạt động tự động 24/7. Đội ngũ CSKH hỗ trợ trực tuyến từ 8:00 đến 23:00 tất cả các ngày trong tuần (kể cả lễ tết).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
