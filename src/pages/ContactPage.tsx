import { useState } from 'react';
import { contactSchema } from '../common/libs/validation';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { Chip } from '../components/Chip/Chip';
import { InfoCard } from '../components/InfoCard/InfoCard';
import { PageContainer } from '../components/PageContainer/PageContainer';

const initialFormData = { fullName: '', email: '', subject: '', message: '' };

function FieldError({ id, children }: { id: string; children?: string }) {
  return children ? <span id={id} className="text-xs text-[#FF5C5C]" role="alert">{children}</span> : null;
}

export default function ContactPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof typeof initialFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setSubmitted(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setSubmitted(true);
    setFormData(initialFormData);
  };

  return (
    <PageContainer className="flex flex-col gap-8 sm:gap-10">
      <div className="pointer-events-none absolute -top-20 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-[#008CFF]/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 top-64 -z-10 h-[420px] w-[420px] rounded-full bg-[#7B2CFF]/10 blur-[140px]" />

      <header className="flex flex-col items-start gap-2">
        <Chip status="online">Hỗ Trợ Khách Hàng</Chip>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-[38px]">Liên Hệ Với Chúng Tôi</h1>
        <p className="max-w-xl text-base leading-relaxed text-[#94A3B8]">Đội ngũ kỹ thuật Chợ Tài Khoản AI luôn sẵn sàng hỗ trợ bạn kích hoạt và giải quyết thắc mắc 24/7.</p>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <section className="flex flex-col gap-6 rounded-2xl border border-[#7887BE33] bg-[#0C101CEE] p-5 shadow-[0_18px_38px_rgba(0,0,0,0.6)] backdrop-blur-[18px] sm:p-7 lg:col-span-7">
          <h2 className="text-xl font-bold text-white">Gửi Yêu Cầu Hỗ Trợ</h2>
          {submitted && <div className="rounded-xl border border-[#35FFB1]/30 bg-[#35FFB1]/10 p-4 text-sm text-[#35FFB1]" role="status">Cảm ơn bạn! Yêu cầu hỗ trợ đã được gửi thành công. Chúng tôi sẽ phản hồi qua email trong 15 phút.</div>}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-full-name" className="text-xs font-mono uppercase tracking-wider text-[#566079]">Họ và tên</label>
                <Input id="contact-full-name" placeholder="Nguyễn Văn A" value={formData.fullName} aria-invalid={Boolean(errors.fullName)} aria-describedby="full-name-error" onChange={(event) => updateField('fullName', event.target.value)} />
                <FieldError id="full-name-error">{errors.fullName}</FieldError>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-email" className="text-xs font-mono uppercase tracking-wider text-[#566079]">Email</label>
                <Input id="contact-email" type="email" placeholder="email@example.com" value={formData.email} aria-invalid={Boolean(errors.email)} aria-describedby="email-error" onChange={(event) => updateField('email', event.target.value)} />
                <FieldError id="email-error">{errors.email}</FieldError>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-subject" className="text-xs font-mono uppercase tracking-wider text-[#566079]">Tiêu đề</label>
              <Input id="contact-subject" placeholder="Cần hỗ trợ về tài khoản ChatGPT..." value={formData.subject} aria-invalid={Boolean(errors.subject)} aria-describedby="subject-error" onChange={(event) => updateField('subject', event.target.value)} />
              <FieldError id="subject-error">{errors.subject}</FieldError>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-message" className="text-xs font-mono uppercase tracking-wider text-[#566079]">Nội dung yêu cầu</label>
              <textarea id="contact-message" rows={5} placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..." value={formData.message} aria-invalid={Boolean(errors.message)} aria-describedby="message-error" onChange={(event) => updateField('message', event.target.value)} className="w-full resize-none rounded-[14px] border border-white/10 bg-[#0C101CEE] p-4 text-sm text-[#F8FAFC] outline-none transition-all placeholder:text-[#566079] focus:border-[#0EA5FF] focus:ring-1 focus:ring-[#0EA5FF]/30" />
              <FieldError id="message-error">{errors.message}</FieldError>
            </div>
            <Button type="submit" size="lg" variant="primary" className="mt-1 w-full sm:w-auto sm:self-start">Gửi Tin Nhắn</Button>
          </form>
        </section>

        <aside className="flex flex-col gap-4 lg:col-span-5">
          <InfoCard label="HOTLINE HỖ TRỢ" title="1900 888 999" desc="Hỗ trợ kỹ thuật trực tiếp từ 8:00 - 22:00" icon={<PhoneIcon />} />
          <InfoCard label="EMAIL KỸ THUẬT" title="support@mmo-ai.vn" desc="Phản hồi nhanh trong vòng 15 phút" icon={<MailIcon />} />
          <InfoCard label="TELEGRAM / ZALO" title="@ChợTàiKhoảnAI_Admin" desc="Kênh tiếp nhận bảo hành khẩn cấp" icon={<MessageIcon />} />
          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#0C101CEE] p-5">
            <h2 className="text-sm font-bold text-white">Thời Gian Làm Việc</h2>
            <p className="text-xs leading-relaxed text-[#94A3B8]">Hệ thống thanh toán và cấp phát tài khoản hoạt động tự động 24/7. Đội ngũ CSKH hỗ trợ trực tuyến từ 8:00 đến 23:00 tất cả các ngày trong tuần.</p>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}

function IconBox({ children }: { children: React.ReactNode }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

function PhoneIcon() { return <IconBox><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 3.18 2 2 0 0 1 4.11 1h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 8.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" /></IconBox>; }
function MailIcon() { return <IconBox><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></IconBox>; }
function MessageIcon() { return <IconBox><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.4 9.4 0 0 1-4-.9L3 21l1.4-4A8.3 8.3 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" /></IconBox>; }
