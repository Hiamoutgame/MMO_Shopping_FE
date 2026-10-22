import { useCallback, useEffect, useRef, useState } from 'react';
import { walletApi } from '../../common/apis/walletApi';
import { formatCurrency, formatDateTime } from '../../common/libs/formatter';
import type { ApiError, PaginatedResponse } from '../../common/models/common';
import type {
  DepositConfig,
  DepositDto,
  WalletDto,
  WalletTransactionDto,
} from '../../common/models/wallet';
import { Button } from '../../components/Button/Button';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { Pagination } from '../../components/Pagination/Pagination';
import { StatusBadge, type StatusTone } from '../../components/StatusBadge/StatusBadge';

const PRESET_AMOUNTS = [10000, 50000, 100000, 200000, 500000, 1000000];
const POLL_INTERVAL_MS = 4000;
const PAGE_SIZE = 10;

function depositTone(deposit: DepositDto): StatusTone {
  if (deposit.status === 'SUCCEEDED') return 'green';
  if (deposit.status === 'PENDING') return deposit.isExpired ? 'gray' : 'amber';
  return 'red';
}

function depositLabel(deposit: DepositDto): string {
  if (deposit.status === 'SUCCEEDED') return 'Thành công';
  if (deposit.status === 'PENDING') return deposit.isExpired ? 'Hết hạn' : 'Chờ chuyển khoản';
  return 'Thất bại';
}

function useCountdown(expiresAt: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const remaining = Math.max(0, new Date(expiresAt).getTime() - now);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return { remaining, text: `${minutes}:${String(seconds).padStart(2, '0')}` };
}

function CopyField({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#07080D] px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-[#566079]">{label}</p>
        <p className={`truncate text-[14px] font-bold text-white ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
      <button
        type="button"
        onClick={() => void copy()}
        className="shrink-0 rounded-lg border border-white/10 px-2.5 py-1 text-[12px] font-semibold text-[#0EA5FF] hover:bg-white/5"
      >
        {copied ? 'Đã chép' : 'Sao chép'}
      </button>
    </div>
  );
}

function DepositPanel({ deposit, onClose }: { deposit: DepositDto; onClose: () => void }) {
  const countdown = useCountdown(deposit.status === 'PENDING' ? deposit.expiresAt : null);
  const instructions = deposit.instructions;

  if (deposit.status === 'SUCCEEDED') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#35FFB1]/30 bg-[#071B1C] p-8 text-center">
        <span className="text-4xl">✓</span>
        <h3 className="text-xl font-extrabold text-white">Nạp tiền thành công</h3>
        <p className="text-[#94A3B8]">
          Đã cộng <b className="text-[#35FFB1]">{formatCurrency(deposit.amount)}</b> vào ví
          (mã {deposit.paymentCode}).
        </p>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      </div>
    );
  }

  if (!instructions) return null;
  const expired = deposit.isExpired || countdown?.remaining === 0;

  return (
    <div className="grid gap-5 rounded-2xl border border-white/10 bg-[#0C101EEE] p-5 md:grid-cols-[260px_1fr]">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-2xl bg-white p-3">
          <img
            src={instructions.qrImageUrl}
            alt={`QR chuyển khoản ${instructions.transferContent}`}
            className="h-[220px] w-[220px] object-contain"
          />
        </div>
        <p className="text-center text-[12px] text-[#94A3B8]">
          Mở app ngân hàng, quét mã QR để tự điền đúng số tiền và nội dung.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-white">Chuyển khoản để nạp ví</h3>
          {expired ? (
            <StatusBadge tone="gray" label="QR đã hết hạn" />
          ) : (
            <StatusBadge tone="amber" label={`Còn ${countdown?.text ?? ''}`} />
          )}
        </div>
        <CopyField label="Ngân hàng" value={instructions.bankCode} mono={false} />
        <CopyField label="Số tài khoản" value={instructions.accountNumber} />
        {instructions.accountHolder && (
          <CopyField label="Chủ tài khoản" value={instructions.accountHolder} mono={false} />
        )}
        <CopyField label="Số tiền" value={instructions.amount} />
        <CopyField label="Nội dung chuyển khoản (bắt buộc)" value={instructions.transferContent} />
        <div className="rounded-xl border border-[#FACC15]/30 bg-[#FACC15]/5 px-3 py-2.5 text-[13px] text-[#FDE68A]">
          Ghi <b>đúng nội dung {instructions.transferContent}</b>. Sai nội dung, hệ thống không tự
          cộng tiền được và phải chờ admin đối soát. Chuyển sau khi QR hết hạn vẫn được ghi nhận.
        </div>
        <div className="flex items-center gap-2 text-[13px] text-[#94A3B8]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#0EA5FF]" />
          Đang chờ ngân hàng báo về, trang sẽ tự cập nhật…
        </div>
        <div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Ẩn mã QR
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletDto | null>(null);
  const [config, setConfig] = useState<DepositConfig | null>(null);
  const [amount, setAmount] = useState('50000');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeDeposit, setActiveDeposit] = useState<DepositDto | null>(null);
  const [tab, setTab] = useState<'deposits' | 'ledger'>('deposits');
  const [page, setPage] = useState(1);
  const [deposits, setDeposits] = useState<PaginatedResponse<DepositDto> | null>(null);
  const [ledger, setLedger] = useState<PaginatedResponse<WalletTransactionDto> | null>(null);
  const [historyError, setHistoryError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  // Cùng một lần bấm (kể cả bấm lại sau lỗi mạng) dùng chung key để BE không tạo trùng.
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const minAmount = Number(config?.minAmount ?? 10000);
  const maxAmount = Number(config?.maxAmount ?? 1_000_000_000);

  const refreshAll = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    walletApi.getDepositConfig().then(setConfig).catch(() => setConfig(null));
  }, []);

  useEffect(() => {
    walletApi
      .getWallet()
      .then((res) => setWallet(res.wallet))
      .catch(() => undefined);
  }, [reloadKey]);

  useEffect(() => {
    let cancelled = false;
    const request =
      tab === 'deposits'
        ? walletApi.listDeposits({ page, pageSize: PAGE_SIZE }).then((res) => {
            if (!cancelled) setDeposits(res);
          })
        : walletApi.listTransactions({ page, pageSize: PAGE_SIZE }).then((res) => {
            if (!cancelled) setLedger(res);
          });
    request
      .then(() => {
        if (!cancelled) setHistoryError('');
      })
      .catch((reason: ApiError) => {
        if (!cancelled) setHistoryError(reason.message || 'Không thể tải lịch sử.');
      });
    return () => {
      cancelled = true;
    };
  }, [tab, page, reloadKey]);

  // Poll trạng thái yêu cầu đang mở cho tới khi thành công.
  const activeId = activeDeposit?.status === 'PENDING' ? activeDeposit.id : null;
  useEffect(() => {
    if (!activeId) return;
    const timer = window.setInterval(async () => {
      try {
        const res = await walletApi.getDeposit(activeId);
        setActiveDeposit(res.deposit);
        if (res.deposit.status !== 'PENDING') refreshAll();
      } catch {
        // Lỗi mạng tạm thời: thử lại ở lượt poll sau.
      }
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [activeId, refreshAll]);

  const changeAmount = (value: string) => {
    setAmount(value.replace(/\D/g, ''));
    setFormError('');
    idempotencyKeyRef.current = crypto.randomUUID();
  };

  const submit = async () => {
    const value = Number(amount);
    if (!amount || !Number.isInteger(value) || value < minAmount) {
      setFormError(`Số tiền nạp tối thiểu là ${formatCurrency(minAmount)}.`);
      return;
    }
    if (value > maxAmount) {
      setFormError(`Số tiền nạp tối đa là ${formatCurrency(maxAmount)}.`);
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const res = await walletApi.createDeposit(String(value), idempotencyKeyRef.current);
      setActiveDeposit(res.deposit);
      idempotencyKeyRef.current = crypto.randomUUID();
      setTab('deposits');
      setPage(1);
      refreshAll();
    } catch (reason) {
      setFormError((reason as ApiError).message || 'Không thể tạo yêu cầu nạp tiền.');
    } finally {
      setSubmitting(false);
    }
  };

  const items = tab === 'deposits' ? deposits : ledger;

  return (
    <PageContainer className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#35FFB1]/20 bg-[#071B1C] p-5 md:col-span-1">
          <span className="font-mono text-[11px] font-bold uppercase text-[#35FFB1]">Số dư ví</span>
          <p className="mt-2 text-3xl font-extrabold text-white">
            {wallet ? formatCurrency(wallet.balance, wallet.currency) : '—'}
          </p>
          <button
            type="button"
            onClick={refreshAll}
            className="mt-3 text-[12px] font-semibold text-[#0EA5FF] hover:underline"
          >
            Làm mới
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0C101EEE] p-5 md:col-span-2">
          <h2 className="text-lg font-bold text-white">Nạp tiền qua chuyển khoản</h2>
          <p className="mt-1 text-[13px] text-[#94A3B8]">
            Tối thiểu {formatCurrency(minAmount)}. Tiền được cộng tự động sau khi ngân hàng báo
            về (thường dưới 1 phút).
          </p>
          {config && !config.enabled ? (
            <p className="mt-4 rounded-xl border border-[#FF5C5C]/30 bg-[#FF5C5C]/5 px-3 py-2.5 text-[13px] text-[#FCA5A5]">
              Chức năng nạp tiền đang tạm đóng. Vui lòng liên hệ shop.
            </p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                {PRESET_AMOUNTS.filter((preset) => preset >= minAmount).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => changeAmount(String(preset))}
                    className={
                      Number(amount) === preset
                        ? 'rounded-xl border border-[#0EA5FF] bg-[#0EA5FF]/10 px-3 py-1.5 text-[13px] font-bold text-white'
                        : 'rounded-xl border border-white/10 px-3 py-1.5 text-[13px] text-[#DCE4F8] hover:bg-white/5'
                    }
                  >
                    {formatCurrency(preset)}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => changeAmount(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && void submit()}
                  placeholder="Nhập số tiền (VND)"
                  aria-label="Số tiền nạp"
                  className="h-11 flex-1 rounded-xl border border-white/10 bg-[#07080D] px-3 font-mono text-white outline-none focus:border-[#0EA5FF]"
                />
                <Button onClick={() => void submit()} disabled={submitting} className="h-11">
                  {submitting ? 'Đang tạo…' : 'Tạo mã nạp'}
                </Button>
              </div>
              {amount && Number(amount) >= minAmount && (
                <p className="mt-2 text-[12px] text-[#566079]">= {formatCurrency(amount)}</p>
              )}
              {formError && <p className="mt-2 text-[13px] text-[#FF5C5C]">{formError}</p>}
            </>
          )}
        </div>
      </section>

      {activeDeposit && (
        <DepositPanel deposit={activeDeposit} onClose={() => setActiveDeposit(null)} />
      )}

      <section className="rounded-2xl border border-white/10 bg-[#0C101EEE] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white">Lịch sử</h2>
          <div className="flex gap-1 rounded-[10px] border border-white/10 bg-[#0B1020] p-1">
            {(['deposits', 'ledger'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setTab(key);
                  setPage(1);
                }}
                className={
                  tab === key
                    ? 'rounded-[8px] bg-[#162033CC] px-3 py-1.5 text-[12px] font-bold text-white'
                    : 'rounded-[8px] px-3 py-1.5 text-[12px] font-medium text-[#94A3B8]'
                }
              >
                {key === 'deposits' ? 'Yêu cầu nạp' : 'Biến động số dư'}
              </button>
            ))}
          </div>
        </div>

        {historyError && <p className="mb-3 text-[13px] text-[#FF5C5C]">{historyError}</p>}

        {!items ? (
          <p className="py-8 text-center text-[#94A3B8]">Đang tải…</p>
        ) : items.items.length === 0 ? (
          <p className="py-8 text-center text-[#94A3B8]">Chưa có giao dịch.</p>
        ) : tab === 'deposits' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-[#566079]">
                <tr>
                  <th className="py-3">Thời gian</th>
                  <th>Mã nạp</th>
                  <th className="text-right">Số tiền</th>
                  <th>Trạng thái</th>
                  <th className="text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(deposits?.items ?? []).map((deposit) => (
                  <tr key={deposit.id}>
                    <td className="py-3 text-[#94A3B8]">{formatDateTime(deposit.createdAt)}</td>
                    <td className="font-mono text-[#DCE4F8]">{deposit.paymentCode}</td>
                    <td className="text-right font-mono text-white">
                      {formatCurrency(deposit.amount)}
                      {deposit.amount !== deposit.requestedAmount && (
                        <span className="block text-[11px] text-[#566079]">
                          yêu cầu {formatCurrency(deposit.requestedAmount)}
                        </span>
                      )}
                    </td>
                    <td>
                      <StatusBadge tone={depositTone(deposit)} label={depositLabel(deposit)} />
                    </td>
                    <td className="text-right">
                      {deposit.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => setActiveDeposit(deposit)}
                          className="text-[12px] font-bold text-[#0EA5FF] hover:underline"
                        >
                          Xem QR
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-[#566079]">
                <tr>
                  <th className="py-3">Thời gian</th>
                  <th>Nội dung</th>
                  <th className="text-right">Thay đổi</th>
                  <th className="text-right">Số dư sau</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(ledger?.items ?? []).map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-3 text-[#94A3B8]">{formatDateTime(entry.createdAt)}</td>
                    <td className="text-[#DCE4F8]">{entry.description || entry.purpose}</td>
                    <td
                      className={`text-right font-mono font-bold ${entry.type === 'CREDIT' ? 'text-[#35FFB1]' : 'text-[#FF5C5C]'}`}
                    >
                      {entry.type === 'CREDIT' ? '+' : '−'}
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="text-right font-mono text-white">
                      {formatCurrency(entry.balanceAfter)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4">
          <Pagination page={page} totalPages={items?.totalPages ?? 0} onChange={setPage} />
        </div>
      </section>
    </PageContainer>
  );
}
