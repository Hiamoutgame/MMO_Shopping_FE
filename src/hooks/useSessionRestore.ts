import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../common/stores/useAuthStore';
import { identityApi } from '../common/apis/identityApi';
import { session, setSessionExpiredHandler } from '../common/apis/session';
import { mapMeToUser } from '../common/mapping/identity';
import { APP_CONSTANTS } from '../common/const/app';

const ADMIN_DEFAULT_REDIRECT_PATHS = new Set<string>([
  APP_CONSTANTS.ROUTES.HOME,
  APP_CONSTANTS.ROUTES.PRODUCTS,
  APP_CONSTANTS.ROUTES.LOGIN,
  APP_CONSTANTS.ROUTES.REGISTER,
]);

export function useSessionRestore() {
  const navigate = useNavigate();
  const startInitializing = useAuthStore((state) => state.startInitializing);
  const finishInitializing = useAuthStore((state) => state.finishInitializing);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      clearAuth();
      const current = `${window.location.pathname}${window.location.search}`;
      navigate(`${APP_CONSTANTS.ROUTES.LOGIN}?returnTo=${encodeURIComponent(current)}`, {
        replace: true,
      });
    });

    return () => setSessionExpiredHandler(null);
  }, [clearAuth, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!session.getAccessToken()) {
        finishInitializing();
        return;
      }

      startInitializing();
      try {
        const me = await identityApi.me();
        if (!cancelled) {
          const user = mapMeToUser(me);
          setUser(user);

          if (
            user.role === 'admin' &&
            ADMIN_DEFAULT_REDIRECT_PATHS.has(window.location.pathname)
          ) {
            navigate(APP_CONSTANTS.ROUTES.ADMIN, { replace: true });
          }
        }
      } catch {
        // Refresh flow / session expiry handled by the HTTP client.
      } finally {
        if (!cancelled) {
          finishInitializing();
        }
      }
    }

    void restore();

    return () => {
      cancelled = true;
    };
  }, [finishInitializing, navigate, setUser, startInitializing]);
}
