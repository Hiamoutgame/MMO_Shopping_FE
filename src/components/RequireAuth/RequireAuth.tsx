import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../common/stores/useAuthStore';
import { APP_CONSTANTS } from '../../common/const/app';

export interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
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

  return <>{children}</>;
}
