import { Link } from 'react-router-dom';
import { APP_CONSTANTS } from '../common/const/app';

export default function HomePage() {
  return (
    <div className="w-full max-w-[1440px] flex flex-col bg-[#07080D] relative text-[#F8FAFC] overflow-hidden">

      {/* ========================================================================= */}
      {/* 4. HERO SLOT (Width: 1440px, Height: ~760px)                              */}
      {/* ========================================================================= */}
      <section className="w-full min-h-[760px] relative px-6 lg:px-[120px] pt-12 pb-20 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Decorative background glows & streaks */}
        <div className="absolute w-[620px] h-[320px] bg-[#008CFF] rounded-full blur-[54px] opacity-32 pointer-events-none top-0 left-[40%]" />
        <div className="absolute w-[520px] h-[520px] bg-[#7B2CFF] rounded-full blur-[62px] opacity-36 pointer-events-none top-[110px] left-[60%]" />
        <div className="absolute w-[520px] h-[240px] bg-[#00D5FF] rounded-full blur-[48px] opacity-18 pointer-events-none top-[520px] left-[120px]" />

        {/* Signal streaks */}
        <div className="absolute w-[420px] h-[4px] bg-[#6A35FF99] blur-[36px] rounded-[4px] -rotate-8 top-[80px] left-[55%] pointer-events-none" />
        <div className="absolute w-[520px] h-[4px] bg-[#008CFF66] blur-[36px] rounded-[4px] rotate-7 top-[620px] left-[150px] pointer-events-none" />
        <div className="absolute w-[340px] h-[4px] bg-[#BF40FF66] blur-[36px] rounded-[4px] rotate-10 top-[615px] left-[68%] pointer-events-none" />

        {/* Left: Hero Copy Column (Width ~650px) */}
        <div className="w-full lg:w-[650px] flex flex-col items-start gap-[14px] z-10">
          {/* Eyebrow Pill */}
          <div className="h-[34px] bg-[#0E1420] border border-[#4F6DFF33] rounded-[18px] px-[14px] flex items-center gap-[10px]">
            <span className="w-2 h-2 rounded-full bg-[#35FFB1] shadow-[0_0_8px_#35FFB199]" />
            <span className="font-mono text-xs font-bold tracking-[1.1px] text-[#AFC2FF] uppercase">
              HỆ THỐNG GIAO TÀI KHOẢN TỰ ĐỘNG 24/7
            </span>
          </div>

          {/* Headline (Geist 58px) */}
          <h1 className="font-geist text-4xl sm:text-5xl lg:text-[58px] font-semibold text-white leading-[1.08] tracking-tight">
            Chợ Tài Khoản AI & <br />
            <span className="bg-gradient-to-r from-[#18B7FF] to-[#8F54FF] bg-clip-text text-transparent">
              Dịch Vụ Số Tự Động
            </span>{' '}
            <br />
            <span className="bg-gradient-to-r from-[#18B7FF] to-[#8F54FF] bg-clip-text text-transparent">
              Giao Ngay Tức Thì.
            </span>
          </h1>

          {/* Body */}
          <p className="font-sans text-base lg:text-[18px] text-[#A7B0C1] leading-[1.5] max-w-[620px]">
            Nền tảng cung cấp tài khoản AI (ChatGPT, Gemini, Claude), email ngâm sẵn, công cụ đồ họa và VPN bản quyền. Hệ thống giao tự động, hỗ trợ nạp mã tiếp sức và bảo hành 1 đổi 1.
          </p>

          {/* CTA Row */}
          <div className="flex flex-wrap items-center gap-[14px] pt-3">
            <Link to={APP_CONSTANTS.ROUTES.PRODUCTS}>
              <button
                type="button"
                className="h-[52px] px-[22px] rounded-[26px] bg-gradient-to-r from-[#0EA5FF] to-[#7C3DFF] shadow-[0_12px_24px_#4E64FF66] text-white font-sans text-[15px] font-bold hover:opacity-95 transition-all cursor-pointer"
              >
                Khám phá sản phẩm
              </button>
            </Link>
            <Link to={APP_CONSTANTS.ROUTES.SUPPORT}>
              <button
                type="button"
                className="h-[52px] px-[20px] rounded-[26px] bg-[#090B12] border border-[#FFFFFF2B] text-[#DCE4F8] font-sans text-[15px] font-bold hover:bg-white/5 transition-all cursor-pointer"
              >
                Tiếp sức ngay
              </button>
            </Link>
          </div>

          {/* Realtime Status Line */}
          <div className="flex items-center gap-[10px] pt-2">
            <div className="w-[28px] h-[2px] rounded-[2px] bg-[#3BE7FF] shadow-[0_0_8px_#3BE7FF99]" />
            <span className="font-mono text-xs text-[#7F8DA8]">
              ⚡ Hệ thống giao tự động đang hoạt động · Cập nhật kho 10 giây trước
            </span>
          </div>
        </div>

        {/* Right: Monitoring Visualization (540px x 500px) */}
        <div className="w-full lg:w-[540px] h-[500px] rounded-[28px] bg-[#0A0E17CC] border border-[#8198FF24] shadow-[0_26px_46px_#00000099] relative overflow-hidden backdrop-blur-md z-10 flex flex-col justify-between p-6">
          {/* Orb Core & Rings Visualization (Absolute Centered) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Outer Glow */}
            <div className="w-[314px] h-[314px] rounded-full bg-gradient-to-r from-[#2BD7FF] to-[#6C3BFF66] blur-[18px] opacity-55" />
            {/* Ring One */}
            <div className="absolute w-[338px] h-[338px] rounded-full border border-[#4B83FF3D]" />
            {/* Ring Two */}
            <div className="absolute w-[426px] h-[426px] rounded-full border border-[#7E52FF26]" />
            {/* Ring Three */}
            <div className="absolute w-[242px] h-[242px] rounded-full border border-[#B7D7FF2E]" />
            {/* Core Orb */}
            <div className="absolute w-[130px] h-[130px] rounded-full bg-radial from-white via-[#35D6FF] to-[#15152B] shadow-[0_0_30px_#4E73FFFF]" />
            {/* Scan Lines */}
            <div className="absolute w-[366px] h-px bg-[#B7CCFF33]" />
            <div className="absolute h-[366px] w-px bg-[#B7CCFF22]" />
          </div>

          {/* Floating Metric Badges */}
          {/* Badge 1 */}
          <div className="absolute top-[50px] left-[28px] w-[150px] h-[70px] rounded-[18px] bg-[#101521E6] border border-[#7EA7FF33] shadow-[0_0_22px_#246BFF26] p-3 flex flex-col justify-center backdrop-blur-sm">
            <span className="font-mono text-[11px] font-bold text-[#8E9BB5] tracking-[0.7px]">TỐC ĐỘ GIAO</span>
            <span className="font-geist text-[19px] font-semibold text-white">&lt; 30 giây</span>
          </div>

          {/* Badge 2 */}
          <div className="absolute top-[80px] right-[28px] w-[154px] h-[70px] rounded-[18px] bg-[#101521E6] border border-[#7EA7FF33] shadow-[0_0_22px_#246BFF26] p-3 flex flex-col justify-center backdrop-blur-sm">
            <span className="font-mono text-[11px] font-bold text-[#8E9BB5] tracking-[0.7px]">TRẠNG THÁI</span>
            <span className="font-geist text-[19px] font-semibold text-white">100% tự động</span>
          </div>

          {/* Badge 3 */}
          <div className="absolute bottom-[80px] left-[35%] w-[156px] h-[70px] rounded-[18px] bg-[#101521E6] border border-[#7EA7FF33] shadow-[0_0_22px_#246BFF26] p-3 flex flex-col justify-center backdrop-blur-sm">
            <span className="font-mono text-[11px] font-bold text-[#8E9BB5] tracking-[0.7px]">TỒN KHO</span>
            <span className="font-geist text-[19px] font-semibold text-white">Sẵn sàng 24/7</span>
          </div>

          {/* Visualization Footer */}
          <div className="mt-auto w-full h-[34px] bg-[#070A11] border border-white/10 rounded-[17px] px-4 flex items-center justify-between z-20">
            <span className="font-mono text-[10px] tracking-wider uppercase text-[#7987A2]">
              GIAO TỰ ĐỘNG / ĐANG HOẠT ĐỘNG
            </span>
            <span className="font-mono text-[10px] font-bold text-[#41E5FF]">42ms</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. DARK SAAS SECTIONS SLOT (Padding: 96px 112px, Gap: 80px)               */}
      {/* ========================================================================= */}
      <div className="w-full px-6 lg:px-[112px] py-[80px] flex flex-col gap-[80px] items-center relative">

        {/* Ambient Wash Decorations */}
        <div className="absolute w-[520px] h-[360px] bg-[#6D5DF211] rounded-full blur-[70px] pointer-events-none top-[60px] right-10" />
        <div className="absolute w-[520px] h-[420px] bg-[#21B7FF0E] rounded-full blur-[80px] pointer-events-none top-[520px] left-0" />
        <div className="absolute w-[510px] h-[4px] bg-[#2F7BFF66] blur-[34px] -rotate-7 top-[392px] right-20 pointer-events-none" />
        <div className="absolute w-[760px] h-[4px] bg-[#8C5CF666] blur-[42px] rotate-6 top-[1184px] left-10 pointer-events-none" />

        {/* 9. SERVICES AND PLATFORMS SECTION */}
        <section className="w-full max-w-[1216px] flex flex-col gap-[34px]">
          <div className="flex flex-col gap-[18px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#35FFB1]" />
              <span className="font-mono text-xs font-bold text-[#35FFB1] uppercase tracking-wider">
                HỆ SINH THÁI ĐA NĂNG
              </span>
            </div>
            <h2 className="font-sans text-3xl md:text-[48px] font-bold text-white tracking-[-1.6px] leading-[1.12] max-w-[780px]">
              Đầy đủ tài khoản công nghệ cho cá nhân và đội nhóm
            </h2>
            <p className="font-sans text-[17px] text-[#9AA3B7] leading-[1.55] max-w-[650px]">
              Cung cấp sẵn sàng các loại tài khoản và công cụ cao cấp với giá tối ưu nhất.
            </p>
          </div>

          {/* 3 Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: AI & Năng suất */}
            <div className="rounded-[16px] bg-[#0C1020] border border-[#FFFFFF18] p-7 flex flex-col justify-between gap-[22px] shadow-[0_10px_24px_#2F7BFF08] hover:border-[#0EA5FF]/40 transition-all">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-gradient-to-r from-[#00D5FF] to-[#7B2CFF] flex items-center justify-center text-white text-lg">
                  🤖
                </div>
                <span className="font-mono text-xs font-bold text-[#2DD4BF] uppercase">AI & NĂNG SUẤT</span>
                <h3 className="font-sans text-[22px] font-bold text-white">ChatGPT, Claude, Gemini</h3>
                <p className="font-sans text-[14px] text-[#9AA3B7] leading-relaxed">
                  Tài khoản Plus, Pro và Advanced tốc độ cao, hỗ trợ làm việc và phân tích dữ liệu chuyên nghiệp.
                </p>
              </div>
              <span className="font-mono text-[11px] text-[#8D94AA] bg-[#07080D] px-3 py-1.5 rounded-full w-fit border border-white/10">
                100% SẴN SÀNG
              </span>
            </div>

            {/* Card 2: Đồ họa & Sáng tạo */}
            <div className="rounded-[16px] bg-[#0C1020] border border-[#FFFFFF18] p-7 flex flex-col justify-between gap-[22px] shadow-[0_10px_24px_#2F7BFF08] hover:border-[#8A2EFF]/40 transition-all">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-gradient-to-r from-[#21D4FD] to-[#8A2EFF] flex items-center justify-center text-white text-lg">
                  🎨
                </div>
                <span className="font-mono text-xs font-bold text-[#9AA8FF] uppercase">ĐỒ HỌA & SÁNG TẠO</span>
                <h3 className="font-sans text-[22px] font-bold text-white">Canva, Midjourney, CapCut</h3>
                <p className="font-sans text-[14px] text-[#9AA3B7] leading-relaxed">
                  Mở khóa toàn bộ template thiết kế, không giới hạn dung lượng lưu trữ đám mây và render video.
                </p>
              </div>
              <span className="font-mono text-[11px] text-[#8D94AA] bg-[#07080D] px-3 py-1.5 rounded-full w-fit border border-white/10">
                GIA HẠN CHÍNH CHỦ
              </span>
            </div>

            {/* Card 3: Email & VPN */}
            <div className="rounded-[16px] bg-[#0C1020] border border-[#FFFFFF18] p-7 flex flex-col justify-between gap-[22px] shadow-[0_10px_24px_#2F7BFF08] hover:border-[#35FFB1]/40 transition-all">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-gradient-to-r from-[#35FFB1] to-[#0EA5FF] flex items-center justify-center text-white text-lg">
                  🔒
                </div>
                <span className="font-mono text-xs font-bold text-[#35FFB1] uppercase">EMAIL, VPN & PHẦN MỀM</span>
                <h3 className="font-sans text-[22px] font-bold text-white">Office 365, YouTube, Netflix</h3>
                <p className="font-sans text-[14px] text-[#9AA3B7] leading-relaxed">
                  Bản quyền phần mềm văn phòng, giải trí không quảng cáo và hệ thống email ngâm sẵn tuổi thọ cao.
                </p>
              </div>
              <span className="font-mono text-[11px] text-[#8D94AA] bg-[#07080D] px-3 py-1.5 rounded-full w-fit border border-white/10">
                BẢO HÀNH 1 ĐỔI 1
              </span>
            </div>
          </div>
        </section>

        {/* 10. INFRASTRUCTURE FEATURES SECTION */}
        <section className="w-full max-w-[1216px] flex flex-col lg:flex-row items-center gap-[50px]">
          {/* Left Narrative (Width 430px) */}
          <div className="w-full lg:w-[430px] flex flex-col gap-[26px]">
            <h2 className="font-sans text-3xl md:text-[44px] font-bold text-[#F5F7FF] leading-tight">
              Hạ tầng vận hành phía sau trải nghiệm
            </h2>
            <p className="font-sans text-[17px] text-[#9AA3B7] leading-[1.55]">
              Chúng tôi đầu tư vào hệ thống cấp phát tự động và máy chủ giám sát tồn kho để đảm bảo bạn không bao giờ phải chờ đợi.
            </p>
            <Link to={APP_CONSTANTS.ROUTES.PRODUCTS}>
              <button
                type="button"
                className="w-fit h-[48px] px-6 rounded-[14px] bg-[#0C101CEE] border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all cursor-pointer"
              >
                Xem danh mục kho hàng &rarr;
              </button>
            </Link>
          </div>

          {/* Right Feature Matrix (4 Rows) */}
          <div className="w-full lg:w-[736px] flex flex-col gap-4">
            {/* Row 1 */}
            <div className="w-full rounded-[16px] bg-[#0B1020] border border-white/10 p-[22px] flex items-center gap-5">
              <div className="w-[52px] h-[52px] rounded-[12px] bg-[#35FFB1]/10 border border-[#35FFB1]/30 flex items-center justify-center text-xl shrink-0">
                ⚡
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] font-bold text-[#35FFB1] uppercase">TỰ ĐỘNG HÓA</span>
                <h4 className="font-sans text-[18px] font-extrabold text-[#F8FAFC]">Giao tài khoản tự động</h4>
                <p className="text-[14px] text-[#9AA3B7]">Hệ thống cấp phát tài khoản và key bản quyền qua email chỉ trong 10–30 giây.</p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="w-full rounded-[16px] bg-[#0A0E1A] border border-white/10 p-[22px] flex items-center gap-5">
              <div className="w-[52px] h-[52px] rounded-[12px] bg-[#9AA8FF]/10 border border-[#9AA8FF]/30 flex items-center justify-center text-xl shrink-0">
                📡
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] font-bold text-[#9AA8FF] uppercase">REALTIME MONITOR</span>
                <h4 className="font-sans text-[18px] font-extrabold text-[#F8FAFC]">Kiểm tra tồn kho realtime</h4>
                <p className="text-[14px] text-[#9AA3B7]">Đồng bộ trạng thái kho hàng chính xác từng giây, đảm bảo luôn có sẵn tài khoản.</p>
              </div>
            </div>

            {/* Row 3 */}
            <div className="w-full rounded-[16px] bg-[#0B1020] border border-white/10 p-[22px] flex items-center gap-5">
              <div className="w-[52px] h-[52px] rounded-[12px] bg-[#0EA5FF]/10 border border-[#0EA5FF]/30 flex items-center justify-center text-xl shrink-0">
                🎁
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] font-bold text-[#0EA5FF] uppercase">LUỒNG TIẾP SỨC</span>
                <h4 className="font-sans text-[18px] font-extrabold text-[#F8FAFC]">Nạp mã tiếp sức nhanh</h4>
                <p className="text-[14px] text-[#9AA3B7]">Nhập mã tiếp sức nhận ngay tài khoản hỗ trợ học tập và nghiên cứu tức thì.</p>
              </div>
            </div>

            {/* Row 4 */}
            <div className="w-full rounded-[16px] bg-[#0A0E1A] border border-white/10 p-[22px] flex items-center gap-5">
              <div className="w-[52px] h-[52px] rounded-[12px] bg-[#8A2EFF]/10 border border-[#8A2EFF]/30 flex items-center justify-center text-xl shrink-0">
                🛡️
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] font-bold text-[#8A2EFF] uppercase">BẢO HÀNH 1 ĐỔI 1</span>
                <h4 className="font-sans text-[18px] font-extrabold text-[#F8FAFC]">Quy trình hỗ trợ minh bạch</h4>
                <p className="text-[14px] text-[#9AA3B7]">Cam kết xử lý lỗi trong vòng 15–30 phút hoặc hoàn tiền 100% nếu không còn hàng.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 11. TRUST METRICS SECTION */}
        <section className="w-full max-w-[1216px] flex flex-col gap-[34px]">
          <div className="flex flex-col gap-[18px]">
            <h2 className="font-sans text-3xl md:text-[48px] font-bold text-[#F5F7FF] tracking-[-1.6px] leading-[1.12] max-w-[780px]">
              Được tin dùng bởi hơn 10.000+ khách hàng và đội nhóm MMO
            </h2>
            <p className="font-sans text-[17px] text-[#9AA3B7] leading-[1.55] max-w-[650px]">
              Đảm bảo độ ổn định, uy tín và tốc độ xử lý nhanh nhất trên thị trường.
            </p>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1 */}
            <div className="rounded-[16px] bg-[#0C1020] border border-[#FFFFFF18] p-[26px] flex flex-col gap-3">
              <span className="font-mono text-[42px] font-extrabold text-white">99.9%</span>
              <h4 className="font-sans text-[17px] font-extrabold text-[#F8FAFC]">Độ khả dụng hệ thống</h4>
              <p className="text-[13px] text-[#9AA3B7]">Hệ thống server trực tuyến không gián đoạn.</p>
            </div>

            {/* Metric 2 */}
            <div className="rounded-[16px] bg-[#0C1020] border border-[#FFFFFF18] p-[26px] flex flex-col gap-3">
              <span className="font-mono text-[42px] font-extrabold text-[#35FFB1]">&lt; 30s</span>
              <h4 className="font-sans text-[17px] font-extrabold text-[#F8FAFC]">Giao tài khoản</h4>
              <p className="text-[13px] text-[#9AA3B7]">Tốc độ cấp phát mã tự động qua email.</p>
            </div>

            {/* Metric 3 */}
            <div className="rounded-[16px] bg-[#0C1020] border border-[#FFFFFF18] p-[26px] flex flex-col gap-3">
              <span className="font-mono text-[42px] font-extrabold text-[#0EA5FF]">10K+</span>
              <h4 className="font-sans text-[17px] font-extrabold text-[#F8FAFC]">Khách hàng</h4>
              <p className="text-[13px] text-[#9AA3B7]">Cá nhân và đội nhóm MMO tin tưởng sử dụng.</p>
            </div>

            {/* Metric 4 */}
            <div className="rounded-[16px] bg-[#0C1020] border border-[#FFFFFF18] p-[26px] flex flex-col gap-3">
              <span className="font-mono text-[42px] font-extrabold text-[#8A2EFF]">24/7</span>
              <h4 className="font-sans text-[17px] font-extrabold text-[#F8FAFC]">Hỗ trợ trực tuyến</h4>
              <p className="text-[13px] text-[#9AA3B7]">Kỹ thuật viên túc trực giải quyết vấn đề.</p>
            </div>
          </div>
        </section>

      </div>

      {/* ========================================================================= */}
      {/* 12. DARK SAAS CONVERSION SLOT (Final CTA Panel)                           */}
      {/* ========================================================================= */}
      <section className="w-full px-6 lg:px-[96px] py-16 bg-[#07080D] relative flex justify-center">
        {/* Glows */}
        <div className="absolute w-[320px] h-[250px] bg-[#9267FF33] rounded-full blur-[70px] pointer-events-none top-0 right-10" />
        <div className="absolute w-[360px] h-[260px] bg-[#5B78FF22] rounded-full blur-[70px] pointer-events-none top-10 left-10" />

        {/* CTA Panel (Width 1248px) */}
        <div className="w-full max-w-[1248px] rounded-[24px] bg-[#0C101CEE] border border-[#7887BE2A] p-8 lg:p-[36px_42px] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 backdrop-blur-[18px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-10">
          <div className="flex flex-col gap-[14px] max-w-[650px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#35FFB1]" />
              <span className="font-mono text-xs font-bold text-[#35FFB1] uppercase">SẴN SÀNG KHỞI ĐẦU</span>
            </div>
            <h3 className="font-sans text-2xl sm:text-[34px] font-extrabold text-[#F2F4FF] leading-[1.12]">
              Bắt đầu sở hữu tài khoản AI & dịch vụ số ngay hôm nay.
            </h3>
            <p className="font-sans text-base text-[#8D94AA] leading-[1.5] max-w-[560px]">
              Chọn gói sản phẩm phù hợp tại Danh mục hoặc nhập mã tiếp sức để mở khóa tài khoản ngay lập tức.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-[14px] shrink-0 w-full sm:w-auto">
            <Link to={APP_CONSTANTS.ROUTES.PRODUCTS} className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-[190px] h-[52px] rounded-[15px] bg-gradient-to-r from-[#5B78FF] to-[#9267FF] shadow-[0_10px_24px_#5B78FF44] text-white font-sans text-[15px] font-bold hover:opacity-95 transition-all cursor-pointer"
              >
                Xem sản phẩm
              </button>
            </Link>
            <Link to={APP_CONSTANTS.ROUTES.SUPPORT} className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-[190px] h-[48px] rounded-[15px] bg-[#07080D99] border border-[#7887BE33] text-[#DCE4F8] font-sans text-[14px] font-semibold hover:bg-white/5 transition-all cursor-pointer"
              >
                Nhập mã tiếp sức
              </button>
            </Link>
            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-[#42E6A4]" />
              <span className="font-mono text-xs text-[#8D94AA]">Kho đang sẵn sàng</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
