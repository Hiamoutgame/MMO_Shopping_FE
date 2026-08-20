import { Link } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import { APP_CONSTANTS } from '../common/const/app';

export default function PolicyPage() {
  return (
    <div className="w-full max-w-[1440px] px-6 lg:px-[96px] py-12 lg:py-[72px] flex flex-col gap-10 relative text-[#F2F4FF]">
      {/* Background Glows */}
      <div className="absolute w-[600px] h-[600px] bg-[#0EA5FF]/10 rounded-full blur-[140px] pointer-events-none top-0 left-1/3 -z-10" />
      <div className="absolute w-[500px] h-[500px] bg-[#7C3DFF]/10 rounded-full blur-[140px] pointer-events-none top-96 right-10 -z-10" />

      {/* 4. Body Layout - Main Policy Panel */}
      <div className="w-full rounded-[24px] bg-[#0C101CEE] border border-[#7887BE33] p-6 sm:p-8 lg:p-9 backdrop-blur-[18px] shadow-[0_18px_38px_#00000066] flex flex-col gap-6">

        {/* 5. Opening block */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] font-extrabold tracking-[1.1px] uppercase text-[#35FFB1]">
            POLICY CENTER
          </span>
          <h1 className="text-3xl sm:text-[38px] font-bold text-white leading-[1.12] tracking-tight">
            Chính sách bảo hành & sử dụng dịch vụ
          </h1>
          <p className="text-[#DCE4F8] text-[15px] font-medium leading-[1.75] mt-1">
            Tại Chợ Tài Khoản AI, chúng tôi không chỉ bán tài khoản — chúng tôi mang đến giải pháp phục vụ công việc và học tập của bạn. Một tài khoản gặp lỗi không chỉ là mất tiền, mà còn làm gián đoạn tiến độ. Vì vậy, chính sách được xây dựng với tiêu chí:{' '}
            <strong className="text-white">NHANH CHÓNG – MINH BẠCH – ƯU TIÊN KHÁCH HÀNG.</strong>
          </p>
        </div>

        <div className="w-full h-px bg-[#7887BE33]" />

        {/* 6. Policy Sections */}

        {/* Section 1 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[22px] font-bold text-white tracking-tight">
            Định nghĩa “Bảo Hành Trọn Đời”
          </h2>
          <div className="flex flex-col gap-2 text-sm text-[#C8D2EA] font-medium leading-[1.7]">
            <p>
              Chúng tôi cam kết hỗ trợ trọn vẹn trong suốt thời hạn sử dụng của gói. Ví dụ: bạn mua ChatGPT Plus 1 tháng, chúng tôi chịu trách nhiệm đảm bảo tài khoản hoạt động ổn định đủ 30 ngày.
            </p>
            <p>
              Hình thức hỗ trợ: đổi mới 1–1 ngay hoặc hoàn tiền nếu không còn sản phẩm thay thế phù hợp.
            </p>
          </div>
        </section>

        <div className="w-full h-px bg-[#7887BE33]" />

        {/* Section 2 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[22px] font-bold text-white tracking-tight">
            Phạm vi hỗ trợ theo nhóm sản phẩm
          </h2>
          <div className="flex flex-col gap-2.5 text-sm text-[#C8D2EA] font-medium leading-[1.7]">
            <p>
              <strong className="text-white">1) Nhóm AI & Năng suất:</strong> ChatGPT, Canva, Gemini... Lỗi được hỗ trợ gồm mất quyền Premium/Plus, sai mật khẩu, tài khoản bị hệ thống quét hoặc hạn chế truy cập.
            </p>
            <p>
              <strong className="text-white">2) Nhóm Học tập & Nghiên cứu:</strong> Turnitin, Elsa, Quillbot... Lỗi được hỗ trợ gồm tài khoản bị hạ xuống bản Free, lỗi không kiểm tra được đạo văn hoặc sai quyền truy cập.
            </p>
            <p>
              <strong className="text-white">3) Nhóm Giải trí & Phần mềm:</strong> Netflix, YouTube, Windows, Office... Lỗi được hỗ trợ gồm sai gói, key báo Used/Invalid hoặc tài khoản không đúng mô tả ban đầu.
            </p>
          </div>
        </section>

        <div className="w-full h-px bg-[#7887BE33]" />

        {/* Section 3 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[22px] font-bold text-white tracking-tight">
            Trường hợp miễn trừ
          </h2>
          <div className="flex flex-col gap-2 text-sm text-[#C8D2EA] font-medium leading-[1.7]">
            <p>
              Chúng tôi rất tiếc không thể hỗ trợ nếu lỗi phát sinh từ việc vi phạm quy định sử dụng.
            </p>
            <p>
              <strong className="text-white">Tự ý thay đổi thông tin:</strong> đổi email/mật khẩu đối với tài khoản dùng chung. <strong className="text-white">Vi phạm chính sách hãng:</strong> tạo nội dung nhạy cảm, spam API, auto-click hoặc hành vi khiến tài khoản bị khóa.
            </p>
            <p>
              <strong className="text-white">Chia sẻ vượt mức:</strong> dùng quá số thiết bị cho phép. <strong className="text-white">Yếu tố chủ quan:</strong> để lộ thông tin tài khoản hoặc thiết bị cá nhân nhiễm virus/hack.
            </p>
          </div>
        </section>

        <div className="w-full h-px bg-[#7887BE33]" />

        {/* Section 4 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[22px] font-bold text-white tracking-tight">
            Quy trình xử lý 3 bước nhanh gọn
          </h2>
          <div className="flex flex-col gap-2.5 text-sm text-[#C8D2EA] font-medium leading-[1.7]">
            <p>
              <strong className="text-white">Bước 1:</strong> Tiếp nhận yêu cầu qua hotline, email hoặc form liên hệ. Yêu cầu của bạn được ghi nhận cùng mã đơn hàng.
            </p>
            <p>
              <strong className="text-white">Bước 2:</strong> Gửi bằng chứng quan trọng. Để xử lý trong 5–15 phút, vui lòng gửi mã đơn hàng, ảnh chụp màn hình hoặc video lỗi đăng nhập/báo sai mật khẩu.
            </p>
            <p>
              <strong className="text-white">Bước 3:</strong> Xử lý dứt điểm. Trong 30 phút: cấp lại tài khoản/key mới nếu lỗi xác thực. Trong 24 giờ: hoàn tiền 100% nếu sản phẩm ngừng kinh doanh hoặc không có hàng thay thế.
            </p>
          </div>
        </section>

        <div className="w-full h-px bg-[#7887BE33]" />

        {/* Section 5 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[22px] font-bold text-white tracking-tight">
            Mẹo hạn chế lỗi khi sử dụng
          </h2>
          <div className="flex flex-col gap-2.5 text-sm text-[#C8D2EA] font-medium leading-[1.7]">
            <p>
              <strong className="text-white">Netflix/YouTube:</strong> không xóa profile của người khác trong tài khoản dùng chung. <strong className="text-white">Tài khoản AI:</strong> hạn chế đổi IP liên tục giữa nhiều quốc gia để tránh bị quét bảo mật.
            </p>
            <p>
              <strong className="text-white">Bảo mật:</strong> dùng mật khẩu riêng cho tài khoản cá nhân được nâng cấp chính chủ. Không chia sẻ thông tin đăng nhập công khai trong nhóm hoặc diễn đàn.
            </p>
            <p className="text-[#35FFB1] font-bold mt-1">
              Chợ Tài Khoản AI – uy tín tạo nên thương hiệu dẫn đầu.
            </p>
          </div>
        </section>

        {/* 7. Bottom CTA Strip */}
        <div className="w-full rounded-[18px] bg-[#101521E6] border border-white/14 p-4 lg:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] font-extrabold tracking-[1px] text-[#35FFB1] uppercase">
              CẦN KIỂM TRA ĐIỀU KIỆN?
            </span>
            <p className="text-sm font-medium text-[#DCE4F8]">
              Gửi mã đơn, ảnh lỗi và email mua hàng để đội hỗ trợ kiểm tra chính xác chính sách áp dụng.
            </p>
          </div>
          <Link to={APP_CONSTANTS.ROUTES.CONTACT} className="shrink-0 w-full sm:w-auto">
            <Button
              variant="primary"
              className="w-full sm:w-auto px-[22px] py-[14px] rounded-[14px] shadow-[0_8px_24px_#4E64FF66] text-[15px] font-semibold"
            >
              Liên hệ ngay
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
