import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../common/stores/useAuthStore';
import { APP_CONSTANTS } from '../../common/const/app';

export interface RequireAdminProps {
  children: React.ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`${APP_CONSTANTS.ROUTES.LOGIN}?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07080D] px-6 text-center">
        <div className="max-w-md rounded-2xl border border-white/10 bg-[#0C101CEE] p-8">
          <div className="font-mono text-[11px] font-extrabold uppercase tracking-[1.6px] text-[#FF5C5C]">
            403 Forbidden
          </div>
          <h1 className="mt-3 text-xl font-bold text-white">Bạn không có quyền truy cập</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
            Khu vực quản trị chỉ dành cho tài khoản có vai trò admin.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
