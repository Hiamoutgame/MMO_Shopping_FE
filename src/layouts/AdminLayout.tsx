import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../common/stores/useAuthStore';
import { identityApi } from '../common/apis/identityApi';
import { session } from '../common/apis/session';
import { Button } from '../components/Button/Button';
import { cn } from '../common/libs/cn';
import { APP_CONSTANTS } from '../common/const/app';

interface AdminNavItem {
  label: string;
  path: string;
}

const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Tài khoản', path: '/admin/accounts' },
  { label: 'Catalog', path: '/admin/catalog' },
  { label: 'Kho hàng', path: '/admin/inventory' },
  { label: 'Đơn hàng', path: '/admin/orders' },
  { label: 'Voucher', path: '/admin/vouchers' },
  { label: 'Tài chính', path: '/admin/finance' },
  { label: 'Audit logs', path: '/admin/audit-logs' },
];

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const refreshToken = session.getRefreshToken();
    try {
      await identityApi.logout(refreshToken ? { refreshToken } : {});
    } catch {
      // Luôn dọn local session kể cả khi API lỗi.
    }
    clearAuth();
    navigate(APP_CONSTANTS.ROUTES.PRODUCTS, { replace: true });
  };

  const sidebar = (
    <aside className="flex h-full w-60 flex-col border-r border-white/10 bg-[#0B1020CC]">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <div className="h-8 w-8 rounded-[10px] bg-gradient-to-r from-[#0EA5FF] to-[#7C3DFF]" />
        <div className="flex flex-col leading-none">
          <span className="font-mono text-[11px] font-extrabold uppercase tracking-[1.4px] text-[#F8FAFC]">
            Admin
          </span>
          <span className="text-[10px] text-[#566079]">MMO Shopping</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {ADMIN_NAV.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block rounded-[10px] px-3 py-2 text-[13px] transition-colors',
                    isActive
                      ? 'bg-[#162033CC] font-bold text-[#F8FAFC]'
                      : 'font-medium text-[#94A3B8] hover:bg-white/5 hover:text-[#DCE4F8]',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 truncate text-[12px] font-medium text-[#DCE4F8]">
          {user?.displayName || user?.email}
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout} className="w-full">
          Đăng xuất
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-[#07080D] text-white">
      {/* Desktop sidebar */}
      <div className="hidden lg:block lg:shrink-0">{sidebar}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#07080D] px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-[10px] border border-white/10 px-3 py-2 text-[13px] font-bold text-[#DCE4F8] lg:hidden"
          >
            Menu
          </button>
          <span className="hidden font-mono text-[11px] font-extrabold uppercase tracking-[1.6px] text-[#566079] lg:block">
            Quản trị hệ thống
          </span>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
