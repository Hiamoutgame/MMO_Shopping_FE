import { useCallback, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { cashbackApi } from '../../common/apis/cashbackApi';
import { FEATURE_FLAGS } from '../../common/const/app';
import { readApiError } from '../../common/libs/apiError';
import type { CashbackConfig, CashbackConnection } from '../../common/models/cashback';
import { Button } from '../../components/Button/Button';
import { CashbackError, CashbackLoading } from '../../components/CashbackState/CashbackState';
import { Input } from '../../components/Input/Input';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { CashbackLayout } from '../../layouts/CashbackLayout';

export interface CashbackOutletContext {
  config: CashbackConfig | null;
  requireReconnect: () => void;
}

type LinkStep = 'LOGIN' | 'TWO_FACTOR' | 'VERIFY_EMAIL';

export default function CashbackCenterPage() {
  const navigate = useNavigate();
  const [connection, setConnection] = useState<CashbackConnection | null>(null);
  const [config, setConfig] = useState<CashbackConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [step, setStep] = useState<LinkStep>('LOGIN');
  const [form, setForm] = useState({ email: '', password: '', code: '' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([cashbackApi.getConnection(), cashbackApi.getConfig()]).then(
      ([connectionResult, configResult]) => {
        if (cancelled) return;
        if (connectionResult.status === 'fulfilled') setConnection(connectionResult.value);
        else setError(readApiError(connectionResult.reason));
        if (configResult.status === 'fulfilled') setConfig(configResult.value);
        setLoading(false);
      },
    );
    return () => { cancelled = true; };
  }, [reloadKey]);

  const retryLoad = () => {
    setLoading(true);
    setError('');
    setReloadKey((value) => value + 1);
  };

  const requireReconnect = useCallback(() => {
    setConnection({ status: 'REAUTH_REQUIRED' });
    setStep('LOGIN');
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Vui lòng nhập email và mật khẩu Hoàn Phí 247.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await cashbackApi.login({
        email: form.email.trim(),
        password: form.password,
        deviceName: 'MMO Shopping Web',
      });
      setConnection(result);
      setForm((current) => ({ ...current, password: '' }));
      if (result.status === 'CONNECTED') return;
      setStep(result.nextStep === 'VERIFY_EMAIL' ? 'VERIFY_EMAIL' : 'TWO_FACTOR');
    } catch (reason) {
      setError(readApiError(reason));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChallenge = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.code.trim()) {
      setError('Vui lòng nhập mã xác thực.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = step === 'VERIFY_EMAIL'
        ? await cashbackApi.verifyEmail(form.code.trim())
        : await cashbackApi.verifyTwoFactor(
            connection?.challengeMethods?.includes('google2fa')
              ? { google2faCode: form.code.trim() }
              : { emailOtpCode: form.code.trim() },
          );
      setConnection(result);
      setForm((current) => ({ ...current, code: '' }));
    } catch (reason) {
      setError(readApiError(reason));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setSubmitting(true);
    setError('');
    try {
      if (step === 'VERIFY_EMAIL') await cashbackApi.resendVerifyEmail();
      else await cashbackApi.resendTwoFactor();
    } catch (reason) {
      setError(readApiError(reason));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlink = async () => {
    setUnlinking(true);
    try {
      const result = await cashbackApi.unlink();
      setConnection(result);
      setStep('LOGIN');
      navigate('/cashback', { replace: true });
    } catch (reason) {
      setError(readApiError(reason));
    } finally {
      setUnlinking(false);
    }
  };

  if (!FEATURE_FLAGS.CASHBACK) {
    return <PageContainer><CashbackError message="Chức năng Hoàn phí chưa được bật ở môi trường này." /></PageContainer>;
  }

  if (loading) return <PageContainer><CashbackLoading label="Đang mở Trung tâm Hoàn phí..." /></PageContainer>;

  if (!connection && error) {
    return <PageContainer><CashbackError message={error} onRetry={retryLoad} /></PageContainer>;
  }

  const connected = connection?.status === 'CONNECTED';

  return (
    <PageContainer className="flex flex-col gap-7 pb-16">
      <div className="pointer-events-none absolute -top-20 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-[#008CFF]/10 blur-[140px]" />
      <header>
        <span className="font-mono text-[11px] font-extrabold uppercase tracking-[1.4px] text-[#35FFB1]">Hoàn phí / Thành viên</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-[42px]">Trung tâm Hoàn phí</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#94A3B8]">Tạo link mua sắm, theo dõi đơn và quản lý số dư hoàn phí trong cùng một nơi.</p>
      </header>

      {!connected ? (
        <section className="mx-auto w-full max-w-xl rounded-3xl border border-[#7887BE33] bg-[#0C101EEE] p-6 shadow-[0_22px_42px_#00000080] sm:p-8">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#9AA8FF]">Liên kết tài khoản</span>
          <h2 className="mt-2 text-2xl font-bold text-white">{step === 'LOGIN' ? 'Đăng nhập Hoàn Phí 247' : 'Xác minh tài khoản'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">Mật khẩu chỉ được chuyển tới nhà cung cấp để lấy token và không được lưu trên hệ thống MMO Shopping.</p>
          {error && <div className="mt-4 rounded-xl border border-[#FF5C5C]/30 bg-[#FF5C5C]/10 p-3 text-sm text-[#FF8A8A]" role="alert">{error}</div>}

          {step === 'LOGIN' ? (
            <form className="mt-6 flex flex-col gap-4" onSubmit={handleLogin}>
              <label className="flex flex-col gap-1.5 text-xs font-mono uppercase text-[#566079]">Email
                <Input type="email" autoComplete="username" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-mono uppercase text-[#566079]">Mật khẩu
                <Input type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              </label>
              <Button type="submit" size="lg" disabled={submitting}>{submitting ? 'Đang liên kết...' : 'Liên kết tài khoản'}</Button>
            </form>
          ) : (
            <form className="mt-6 flex flex-col gap-4" onSubmit={handleChallenge}>
              <label className="flex flex-col gap-1.5 text-xs font-mono uppercase text-[#566079]">Mã xác thực
                <Input inputMode="numeric" autoComplete="one-time-code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
              </label>
              <Button type="submit" size="lg" disabled={submitting}>{submitting ? 'Đang xác minh...' : 'Xác minh'}</Button>
              <div className="flex justify-between gap-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep('LOGIN')}>Đăng nhập lại</Button>
                <Button type="button" variant="ghost" size="sm" disabled={submitting} onClick={() => void handleResend()}>Gửi lại mã</Button>
              </div>
            </form>
          )}
        </section>
      ) : (
        <CashbackLayout providerEmail={connection.providerEmail} unlinking={unlinking} onUnlink={() => void handleUnlink()}>
          <Outlet context={{ config, requireReconnect } satisfies CashbackOutletContext} />
        </CashbackLayout>
      )}
    </PageContainer>
  );
}
