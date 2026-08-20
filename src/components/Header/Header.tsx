
import { NavLink, Link } from 'react-router-dom';
import { APP_CONSTANTS } from '../../common/const/app';
import { useCartStore } from '../../common/stores/useCartStore';
import { Button } from '../Button/Button';
import { cn } from '../../common/libs/cn';

export function Header() {
  const totalItems = useCartStore((state) => state.getTotalItems());

  const navLinks = [
    { label: 'Sản phẩm', path: APP_CONSTANTS.ROUTES.PRODUCTS },
    { label: 'Giỏ hàng', path: APP_CONSTANTS.ROUTES.CART },
    { label: 'Tiếp sức', path: APP_CONSTANTS.ROUTES.SUPPORT },
    { label: 'Chính sách', path: APP_CONSTANTS.ROUTES.POLICY },
    { label: 'Liên hệ', path: APP_CONSTANTS.ROUTES.CONTACT },
  ];

  return (
    <header className="w-full flex justify-center py-6 bg-[#07080D] sticky top-0 z-50">
      <div className="w-[calc(100%-2rem)] max-w-[1200px] min-h-16 bg-[#0B1020CC] backdrop-blur-[18px] rounded-[32px] border border-white/10 shadow-[0_14px_30px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4 px-4 sm:px-5">

        {/* Left: Brand */}
        <Link to={APP_CONSTANTS.ROUTES.HOME} className="flex items-center gap-3 shrink-0 group">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-r from-[#0EA5FF] to-[#7C3DFF] shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform" />
          <span className="font-bold text-[15px] text-[#F8FAFC]">Chợ Tài Khoản AI</span>
        </Link>

        {/* Center: Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  'px-3.5 py-2 rounded-[18px] text-[13px] transition-colors',
                  isActive
                    ? 'bg-[#162033CC] text-[#F8FAFC] font-bold'
                    : 'text-[#94A3B8] font-medium hover:text-[#DCE4F8]'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link aria-label="Giỏ hàng" to={APP_CONSTANTS.ROUTES.CART} className="relative flex items-center justify-center w-[42px] h-[42px] bg-[#0C101CEE] border border-white/10 rounded-[14px] hover:bg-white/5 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DCE4F8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[#0EA5FF] text-white text-[10px] font-bold rounded-full shadow-lg">
                  {totalItems}
                </span>
              )}
          </Link>
          <Link className="hidden sm:block" to={APP_CONSTANTS.ROUTES.LOGIN}>
            <Button variant="secondary" className="h-[42px] px-4 rounded-[14px]">
              Đăng nhập
            </Button>
          </Link>
          <Link className="hidden sm:block" to={APP_CONSTANTS.ROUTES.REGISTER}>
            <Button variant="primary" className="h-[42px] px-4 rounded-[14px]">
              Đăng ký
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
