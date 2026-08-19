import { Link } from 'react-router-dom';
import { APP_CONSTANTS } from '../../common/const/app';

export interface FooterProps {
  pageTitle?: string;
}

export function Footer({ pageTitle = 'TRANG CHỦ' }: FooterProps) {
  return (
    <footer className="w-full bg-[#07080D] border-t border-white/5 py-7 px-7 md:px-28 flex items-center justify-between">
      <div className="font-mono text-xs font-semibold tracking-wider text-[#566079] uppercase">
        CHỢ TÀI KHOẢN AI / {pageTitle}
      </div>

      <div className="flex items-center gap-4 text-xs font-medium text-[#6F7895]">
        <Link to={APP_CONSTANTS.ROUTES.POLICY} className="hover:text-[#DCE4F8] transition-colors">
          Điều khoản
        </Link>
        <span>·</span>
        <Link to={APP_CONSTANTS.ROUTES.POLICY} className="hover:text-[#DCE4F8] transition-colors">
          Bảo mật
        </Link>
        <span>·</span>
        <Link to={APP_CONSTANTS.ROUTES.CONTACT} className="hover:text-[#DCE4F8] transition-colors">
          Liên hệ
        </Link>
      </div>
    </footer>
  );
}
