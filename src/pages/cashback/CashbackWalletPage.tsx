import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { cashbackApi } from '../../common/apis/cashbackApi';
import { formatCurrency, formatDateTime } from '../../common/libs/formatter';
import { normalizeCashbackPage } from '../../common/mapping/cashback';
import { useDebounce } from '../../hooks/useDebounce';
import type { ApiError, PaginatedResponse } from '../../common/models/common';
import type { CashbackAccount, CashbackBalanceLog } from '../../common/models/cashback';
import { CashbackEmpty, CashbackError, CashbackLoading } from '../../components/CashbackState/CashbackState';
import { Pagination } from '../../components/Pagination/Pagination';
import type { CashbackOutletContext } from './CashbackCenterPage';

export default function CashbackWalletPage() {
  const { requireReconnect } = useOutletContext<CashbackOutletContext>();
  const [account, setAccount] = useState<CashbackAccount | null>(null);
  const [logs, setLogs] = useState<PaginatedResponse<CashbackBalanceLog> | null>(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [accountData, logData] = await Promise.all([
          cashbackApi.getAccount(),
          cashbackApi.listBalanceLogs({ page, perPage: 20, type: type || undefined, search: debouncedSearch || undefined }),
        ]);
        if (!cancelled) {
          setAccount(accountData);
          setLogs(normalizeCashbackPage(logData));
          setError('');
        }
      } catch (reason) {
        const apiError = reason as ApiError;
        if (apiError.errorCode === 'CASHBACK_REAUTH_REQUIRED') requireReconnect();
        if (!cancelled) setError(apiError.message || 'Không thể tải ví hoàn phí.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, type, debouncedSearch, reloadKey, requireReconnect]);

  if (loading) return <CashbackLoading label="Đang tải ví hoàn phí..." />;
  if (error) return <CashbackError message={error} onRetry={() => { setLoading(true); setReloadKey((v) => v + 1); }} />;

  const balance = account?.wallet?.balance ?? account?.balance ?? '0';
  const currency = account?.wallet?.currency ?? 'VND';

  return (
    <div className="flex flex-col gap-5">
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#35FFB1]/20 bg-[#071B1C] p-5 sm:col-span-2">
          <span className="font-mono text-[11px] font-bold uppercase text-[#35FFB1]">Số dư khả dụng</span>
          <p className="mt-2 text-3xl font-extrabold text-white">{formatCurrency(balance, currency)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0C101E] p-5">
          <span className="font-mono text-[11px] uppercase text-[#566079]">Đơn đã duyệt</span>
          <p className="mt-2 text-3xl font-extrabold text-white">{account?.stats?.ordersApproved ?? 0}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0C101EEE] p-5">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-lg font-bold text-white">Biến động số dư</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm giao dịch" className="h-10 rounded-xl border border-white/10 bg-[#07080D] px-3 text-sm text-white outline-none focus:border-[#0EA5FF]" />
            <input value={type} onChange={(event) => { setType(event.target.value); setPage(1); }} placeholder="Lọc theo loại" className="h-10 rounded-xl border border-white/10 bg-[#07080D] px-3 text-sm text-white outline-none focus:border-[#0EA5FF]" />
          </div>
        </div>
        {logs?.items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase text-[#566079]"><tr><th className="py-3">Thời gian</th><th>Loại</th><th>Mô tả</th><th className="text-right">Thay đổi</th><th className="text-right">Số dư</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {logs.items.map((log, index) => <tr key={log.id || `${log.createdAt}-${index}`}><td className="py-3 text-[#94A3B8]">{log.createdAt ? formatDateTime(log.createdAt) : '—'}</td><td className="font-mono text-xs text-[#DCE4F8]">{log.type}</td><td className="text-[#94A3B8]">{log.description || '—'}</td><td className={`text-right font-bold ${log.isCredit ? 'text-[#35FFB1]' : 'text-[#FF7B7B]'}`}>{log.isCredit ? '+' : ''}{formatCurrency(log.amountChange)}</td><td className="text-right text-white">{formatCurrency(log.amountAfter)}</td></tr>)}
              </tbody>
            </table>
          </div>
        ) : <CashbackEmpty title="Chưa có biến động" description="Các khoản cộng và trừ số dư sẽ xuất hiện tại đây." />}
        {logs && <Pagination page={logs.page} totalPages={logs.totalPages} onChange={setPage} className="mt-5" />}
      </section>
    </div>
  );
}
