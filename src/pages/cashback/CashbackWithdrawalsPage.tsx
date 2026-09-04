import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { cashbackApi } from '../../common/apis/cashbackApi';
import { compareDecimalStrings, formatCurrency, formatDateTime } from '../../common/libs/formatter';
import { cashbackPaymentAccountSchema, cashbackWithdrawalSchema } from '../../common/libs/validation';
import { cashbackStatusTone, normalizeCashbackPage } from '../../common/mapping/cashback';
import type { ApiError, PaginatedResponse } from '../../common/models/common';
import type { CashbackPaymentAccount, CashbackWithdrawal } from '../../common/models/cashback';
import { Button } from '../../components/Button/Button';
import { CashbackEmpty, CashbackError, CashbackLoading } from '../../components/CashbackState/CashbackState';
import { Input } from '../../components/Input/Input';
import { Pagination } from '../../components/Pagination/Pagination';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import type { CashbackOutletContext } from './CashbackCenterPage';

interface WithdrawalFormState {
  amount: string;
  paymentMethod: 'bank' | 'wallet';
  bankName: string;
  accountNumber: string;
  accountName: string;
  otpCode: string;
}

interface AccountFormState {
  paymentMethod: 'bank' | 'wallet';
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const emptyWithdrawal: WithdrawalFormState = { amount: '', paymentMethod: 'bank', bankName: '', accountNumber: '', accountName: '', otpCode: '' };
const emptyAccount: AccountFormState = { paymentMethod: 'bank', bankName: '', accountNumber: '', accountName: '' };

export default function CashbackWithdrawalsPage() {
  const { config, requireReconnect } = useOutletContext<CashbackOutletContext>();
  const [withdrawals, setWithdrawals] = useState<PaginatedResponse<CashbackWithdrawal> | null>(null);
  const [accounts, setAccounts] = useState<CashbackPaymentAccount[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [withdrawalForm, setWithdrawalForm] = useState(emptyWithdrawal);
  const [accountForm, setAccountForm] = useState(emptyAccount);
  const [showAccountForm, setShowAccountForm] = useState(false);

  const refresh = () => { setLoading(true); setReloadKey((value) => value + 1); };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [withdrawalData, accountData] = await Promise.all([
          cashbackApi.listWithdrawals({ page, perPage: 20 }),
          cashbackApi.listPaymentAccounts(),
        ]);
        if (!cancelled) {
          setWithdrawals(normalizeCashbackPage(withdrawalData));
          setAccounts(Array.isArray(accountData.items) ? accountData.items : []);
          setError('');
        }
      } catch (reason) {
        handleApiError(reason, requireReconnect, (message) => !cancelled && setError(message));
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [page, reloadKey, requireReconnect]);

  const selectSavedAccount = (id: string) => {
    const selected = accounts.find((account) => account.id === id);
    if (!selected) return;
    setWithdrawalForm({
      ...withdrawalForm,
      paymentMethod: selected.paymentMethod,
      bankName: selected.bankName,
      accountNumber: selected.accountNumber,
      accountName: selected.accountName,
    });
  };

  const createWithdrawal = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); setSuccess('');
    const parsed = cashbackWithdrawalSchema.safeParse(withdrawalForm);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || 'Thông tin chưa hợp lệ.'); return; }
    const minimum = config?.withdraw?.minAmount;
    if (minimum && compareDecimalStrings(parsed.data.amount, minimum) < 0) {
      setError(`Số tiền rút tối thiểu là ${formatCurrency(minimum)}.`); return;
    }
    if (config?.withdraw?.otpRequired && !withdrawalForm.otpCode.trim()) {
      setError('Vui lòng nhập OTP rút tiền.'); return;
    }
    setSubmitting(true);
    try {
      await cashbackApi.createWithdrawal({
        amount: parsed.data.amount,
        paymentMethod: withdrawalForm.paymentMethod,
        bankName: withdrawalForm.paymentMethod === 'bank' ? parsed.data.bankName : undefined,
        walletName: withdrawalForm.paymentMethod !== 'bank' ? parsed.data.bankName : undefined,
        accountNumber: parsed.data.accountNumber,
        accountName: parsed.data.accountName,
        otpCode: withdrawalForm.otpCode || undefined,
      });
      setWithdrawalForm(emptyWithdrawal); setSuccess('Đã gửi yêu cầu rút tiền.'); refresh();
    } catch (reason) { handleApiError(reason, requireReconnect, setError); }
    finally { setSubmitting(false); }
  };

  const sendOtp = async () => {
    setSubmitting(true); setError('');
    try { await cashbackApi.sendWithdrawalOtp(); setSuccess('Mã OTP đã được gửi.'); }
    catch (reason) { handleApiError(reason, requireReconnect, setError); }
    finally { setSubmitting(false); }
  };

  const createAccount = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    const parsed = cashbackPaymentAccountSchema.safeParse(accountForm);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || 'Thông tin chưa hợp lệ.'); return; }
    setSubmitting(true);
    try { await cashbackApi.createPaymentAccount({ ...parsed.data, paymentMethod: accountForm.paymentMethod }); setAccountForm(emptyAccount); setShowAccountForm(false); setSuccess('Đã lưu tài khoản nhận tiền.'); refresh(); }
    catch (reason) { handleApiError(reason, requireReconnect, setError); }
    finally { setSubmitting(false); }
  };

  const deleteAccount = async (id: string) => {
    if (!window.confirm('Xóa tài khoản nhận tiền này?')) return;
    setSubmitting(true); setError('');
    try { await cashbackApi.deletePaymentAccount(id); refresh(); }
    catch (reason) { handleApiError(reason, requireReconnect, setError); }
    finally { setSubmitting(false); }
  };

  if (loading) return <CashbackLoading label="Đang tải dữ liệu rút tiền..." />;
  if (error && !withdrawals) return <CashbackError message={error} onRetry={refresh} />;

  const institutions = withdrawalForm.paymentMethod === 'bank' ? config?.withdraw?.allowedBanks : config?.withdraw?.allowedWallets;

  return <div className="flex flex-col gap-5">
    {(error || success) && <div className={`rounded-xl border p-3 text-sm ${error ? 'border-[#FF5C5C]/30 bg-[#FF5C5C]/10 text-[#FF8A8A]' : 'border-[#35FFB1]/30 bg-[#35FFB1]/10 text-[#35FFB1]'}`} role="status">{error || success}</div>}
    <section className="rounded-2xl border border-white/10 bg-[#0C101EEE] p-5">
      <h2 className="text-xl font-bold text-white">Tạo yêu cầu rút tiền</h2>
      <p className="mt-1 text-sm text-[#94A3B8]">Tối thiểu {formatCurrency(config?.withdraw?.minAmount || '0')}{config?.withdraw?.feeValue ? ` · Phí ${config.withdraw.feeValue}${config.withdraw.feeType === 'percentage' ? '%' : ' VND'}` : ''}</p>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={createWithdrawal}>
        <label className="flex flex-col gap-1.5 text-xs font-mono uppercase text-[#566079]">Số tiền<Input value={withdrawalForm.amount} inputMode="decimal" onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })} /></label>
        <label className="flex flex-col gap-1.5 text-xs font-mono uppercase text-[#566079]">Tài khoản đã lưu<select className="h-11 rounded-[14px] border border-white/10 bg-[#0C101E] px-3 text-sm text-white" defaultValue="" onChange={(e) => selectSavedAccount(e.target.value)}><option value="">Nhập mới</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.bankName} · {account.accountNumber}</option>)}</select></label>
        <label className="flex flex-col gap-1.5 text-xs font-mono uppercase text-[#566079]">Phương thức<select className="h-11 rounded-[14px] border border-white/10 bg-[#0C101E] px-3 text-sm text-white" value={withdrawalForm.paymentMethod} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, paymentMethod: e.target.value as 'bank' | 'wallet', bankName: '' })}><option value="bank">Ngân hàng</option><option value="wallet">Ví điện tử</option></select></label>
        <label className="flex flex-col gap-1.5 text-xs font-mono uppercase text-[#566079]">Ngân hàng / ví{institutions?.length ? <select className="h-11 rounded-[14px] border border-white/10 bg-[#0C101E] px-3 text-sm text-white" value={withdrawalForm.bankName} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, bankName: e.target.value })}><option value="">Chọn</option>{institutions.map((name) => <option key={name}>{name}</option>)}</select> : <Input value={withdrawalForm.bankName} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, bankName: e.target.value })} />}</label>
        <label className="flex flex-col gap-1.5 text-xs font-mono uppercase text-[#566079]">Số tài khoản<Input value={withdrawalForm.accountNumber} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, accountNumber: e.target.value })} /></label>
        <label className="flex flex-col gap-1.5 text-xs font-mono uppercase text-[#566079]">Tên chủ tài khoản<Input value={withdrawalForm.accountName} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, accountName: e.target.value.toUpperCase() })} /></label>
        {config?.withdraw?.otpRequired && <label className="flex flex-col gap-1.5 text-xs font-mono uppercase text-[#566079]">OTP<div className="flex gap-2"><Input value={withdrawalForm.otpCode} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, otpCode: e.target.value })} /><Button type="button" variant="secondary" onClick={() => void sendOtp()} disabled={submitting}>Gửi mã</Button></div></label>}
        <Button type="submit" size="lg" className="sm:self-end" disabled={submitting || config?.withdraw?.enabled === false}>{submitting ? 'Đang xử lý...' : 'Gửi yêu cầu rút'}</Button>
      </form>
    </section>

    <section className="rounded-2xl border border-white/10 bg-[#0C101EEE] p-5">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-white">Tài khoản nhận tiền</h2><Button size="sm" variant="secondary" onClick={() => setShowAccountForm((v) => !v)}>Thêm tài khoản</Button></div>
      {showAccountForm && <form className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-[#080B14] p-4 sm:grid-cols-2" onSubmit={createAccount}><select className="h-11 rounded-xl border border-white/10 bg-[#0C101E] px-3 text-sm text-white" value={accountForm.paymentMethod} onChange={(e) => setAccountForm({ ...accountForm, paymentMethod: e.target.value as 'bank' | 'wallet' })}><option value="bank">Ngân hàng</option><option value="wallet">Ví điện tử</option></select><Input placeholder="Ngân hàng / ví" value={accountForm.bankName} onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })} /><Input placeholder="Số tài khoản" value={accountForm.accountNumber} onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })} /><Input placeholder="Tên chủ tài khoản" value={accountForm.accountName} onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value.toUpperCase() })} /><Button type="submit" disabled={submitting}>Lưu tài khoản</Button></form>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{accounts.map((account) => <div key={account.id} className="rounded-xl border border-white/10 bg-[#080B14] p-4"><div className="flex justify-between gap-3"><div><p className="font-semibold text-white">{account.bankName}</p><p className="mt-1 text-sm text-[#94A3B8]">{account.accountNumber} · {account.accountName}</p></div>{account.isDefault && <StatusBadge label="Mặc định" tone="green" />}</div><div className="mt-3 flex gap-2">{!account.isDefault && <Button size="sm" variant="ghost" disabled={submitting} onClick={() => void cashbackApi.setDefaultPaymentAccount(account.id).then(refresh).catch((reason) => handleApiError(reason, requireReconnect, setError))}>Đặt mặc định</Button>}<Button size="sm" variant="ghost" disabled={submitting} onClick={() => void deleteAccount(account.id)}>Xóa</Button></div></div>)}</div>
    </section>

    <section className="rounded-2xl border border-white/10 bg-[#0C101EEE] p-5"><h2 className="mb-4 text-lg font-bold text-white">Lịch sử rút tiền</h2>{withdrawals?.items.length ? <div className="grid gap-3">{withdrawals.items.map((item) => <div key={item.id} className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#080B14] p-4 sm:flex-row sm:items-center"><div><p className="font-semibold text-white">{item.code || `Yêu cầu ${item.id}`}</p><p className="mt-1 text-xs text-[#94A3B8]">{item.createdAt ? formatDateTime(item.createdAt) : '—'} · {item.bankName || item.paymentMethod || '—'}</p></div><div className="flex items-center gap-3"><strong className="text-white">{formatCurrency(item.realAmount || item.amount)}</strong><StatusBadge label={item.status} tone={cashbackStatusTone(item.status)} /></div></div>)}</div> : <CashbackEmpty title="Chưa có yêu cầu rút" description="Lịch sử rút tiền sẽ xuất hiện tại đây." />}{withdrawals && <Pagination page={withdrawals.page} totalPages={withdrawals.totalPages} onChange={(value) => { setPage(value); setLoading(true); }} className="mt-5" />}</section>
  </div>;
}

function handleApiError(reason: unknown, reconnect: () => void, setError: (message: string) => void) {
  const error = reason as ApiError;
  if (error.errorCode === 'CASHBACK_REAUTH_REQUIRED') reconnect();
  setError(error.message || 'Yêu cầu thất bại.');
}
