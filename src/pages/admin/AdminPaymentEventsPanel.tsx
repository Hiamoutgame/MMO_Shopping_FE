import { useEffect, useState } from 'react';
import { adminFinanceApi } from '../../common/apis/adminApi';
import { getAdminErrorMessage } from '../../common/libs/adminForm';
import { formatCurrency, formatDateTime } from '../../common/libs/formatter';
import type {
  AdminPaymentEventDto,
  PaymentEventStatus,
  SepaySyncResult,
} from '../../common/models/admin';
import { AdminDetailGrid, AdminField, AdminSelectField, AdminTextAreaField } from '../../components/AdminForm/AdminForm';
import { AdminModal } from '../../components/AdminModal/AdminModal';
import { AdminEmpty, AdminError, AdminLoading } from '../../components/AdminState/AdminState';
import { Button } from '../../components/Button/Button';
import { Pagination } from '../../components/Pagination/Pagination';
import { StatusBadge, type StatusTone } from '../../components/StatusBadge/StatusBadge';
import { useAdminRequestState } from '../../hooks/useAdminRequestState';

const PAGE_SIZE = 20;
const EVENT_STATUSES: PaymentEventStatus[] = ['NEEDS_REVIEW', 'PROCESSED', 'RESOLVED', 'IGNORED', 'RECEIVED'];

const REASON_LABELS: Record<string, string> = {
  OUTGOING: 'Tiền ra',
  NO_CODE: 'Không có mã nạp',
  UNKNOWN_CODE: 'Mã nạp không tồn tại',
  UNKNOWN_BANK_ACCOUNT: 'Sai tài khoản nhận',
  PAYMENT_ALREADY_COMPLETED: 'Chuyển 2 lần cùng mã',
  BELOW_MINIMUM: 'Dưới mức tối thiểu',
  AMOUNT_MISMATCH: 'Lệch số tiền',
  LATE_PAYMENT: 'Chuyển sau khi hết hạn',
  ADMIN_IGNORED: 'Admin bỏ qua',
};

function eventTone(status: PaymentEventStatus): StatusTone {
  switch (status) {
    case 'PROCESSED':
    case 'RESOLVED':
      return 'green';
    case 'NEEDS_REVIEW':
      return 'amber';
    case 'RECEIVED':
      return 'blue';
    default:
      return 'gray';
  }
}

function reasonText(reason: string | null) {
  if (!reason) return '—';
  return reason
    .split(',')
    .map((part) => REASON_LABELS[part] ?? part)
    .join(', ');
}

export function AdminPaymentEventsPanel() {
  const [events, setEvents] = useState<AdminPaymentEventDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PaymentEventStatus | ''>('NEEDS_REVIEW');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const { loading, setLoading, error, setError, reloadKey, beginRequest, reload } =
    useAdminRequestState();
  const [selected, setSelected] = useState<AdminPaymentEventDto | null>(null);
  const [resolveAccountId, setResolveAccountId] = useState('');
  const [resolveNote, setResolveNote] = useState('');
  const [resolveError, setResolveError] = useState('');
  const [resolving, setResolving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SepaySyncResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminFinanceApi
      .paymentEvents({
        page,
        pageSize: PAGE_SIZE,
        status: status || undefined,
        search: appliedSearch || undefined,
      })
      .then((res) => {
        if (cancelled) return;
        setEvents(res.items);
        setTotalPages(res.totalPages);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getAdminErrorMessage(err, 'Cannot load bank transactions.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [appliedSearch, page, reloadKey, setError, setLoading, status]);

  const open = async (event: AdminPaymentEventDto) => {
    setSelected(event);
    setResolveAccountId('');
    setResolveNote('');
    setResolveError('');
    try {
      const res = await adminFinanceApi.paymentEvent(event.id);
      setSelected(res.event);
    } catch (err) {
      setResolveError(getAdminErrorMessage(err, 'Cannot load event detail.'));
    }
  };

  const resolve = async (action: 'CREDIT' | 'IGNORE') => {
    if (!selected) return;
    if (action === 'CREDIT' && !resolveAccountId.trim()) {
      setResolveError('Nhập Account ID của khách cần cộng tiền.');
      return;
    }
    if (resolveNote.trim().length < 3) {
      setResolveError('Ghi chú lý do (tối thiểu 3 ký tự) để lưu vết.');
      return;
    }
    const confirmText =
      action === 'CREDIT'
        ? `Cộng ${formatCurrency(selected.amount)} vào ví account ${resolveAccountId.trim()}?`
        : 'Đánh dấu bỏ qua giao dịch này?';
    if (!window.confirm(confirmText)) return;
    setResolving(true);
    setResolveError('');
    try {
      const res = await adminFinanceApi.resolvePaymentEvent(selected.id, {
        action,
        accountId: action === 'CREDIT' ? resolveAccountId.trim() : undefined,
        note: resolveNote.trim(),
      });
      setSelected(res.event);
      beginRequest();
      reload();
    } catch (err) {
      setResolveError(getAdminErrorMessage(err, 'Cannot resolve event.'));
    } finally {
      setResolving(false);
    }
  };

  const sync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      setSyncResult(await adminFinanceApi.syncSepay(24));
      beginRequest();
      reload();
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot sync from SePay.'));
    } finally {
      setSyncing(false);
    }
  };

  const canResolve =
    selected?.status === 'NEEDS_REVIEW' ||
    (selected?.status === 'IGNORED' && selected.transferType === 'in' && selected.reason !== 'ADMIN_IGNORED');

  return (
    <div className="flex flex-col gap-4">
      <section className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-[#0B1020] p-4 md:grid-cols-4">
        <AdminSelectField
          label="Trạng thái"
          value={status}
          onChange={(e) => {
            beginRequest();
            setPage(1);
            setStatus(e.target.value as PaymentEventStatus | '');
          }}
          options={[
            { label: 'Tất cả', value: '' },
            ...EVENT_STATUSES.map((value) => ({ label: value, value })),
          ]}
        />
        <AdminField
          label="Tìm mã nạp / mã GD / nội dung"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            beginRequest();
            setPage(1);
            setAppliedSearch(search.trim());
          }}
        />
        <div className="flex items-end">
          <Button
            variant="secondary"
            size="sm"
            className="h-9 w-full"
            onClick={() => {
              beginRequest();
              setPage(1);
              setAppliedSearch(search.trim());
            }}
          >
            Lọc
          </Button>
        </div>
        <div className="flex items-end">
          <Button size="sm" className="h-9 w-full" disabled={syncing} onClick={() => void sync()}>
            {syncing ? 'Đang đồng bộ…' : 'Đồng bộ SePay 24h'}
          </Button>
        </div>
      </section>

      {syncResult && (
        <p className="rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-[13px] text-[#DCE4F8]">
          SePay trả {syncResult.fetched} giao dịch, {syncResult.candidates} có mã MMO: ghi nhận mới{' '}
          <b className="text-[#35FFB1]">{syncResult.newlyProcessed}</b>, cần xem xét{' '}
          <b className="text-[#FACC15]">{syncResult.needsReview}</b>, đã có từ trước{' '}
          {syncResult.alreadyRecorded}.
        </p>
      )}

      {error && <AdminError message={error} onRetry={reload} />}

      {loading ? (
        <AdminLoading />
      ) : events.length === 0 ? (
        <AdminEmpty title="Không có giao dịch ngân hàng" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[920px] text-left text-[13px]">
            <thead className="border-b border-white/10 bg-[#0B1020] text-[11px] uppercase tracking-wider text-[#566079]">
              <tr>
                <th className="px-4 py-3 font-semibold">Thời gian NH</th>
                <th className="px-4 py-3 font-semibold">Mã SePay</th>
                <th className="px-4 py-3 font-semibold">Mã nạp</th>
                <th className="px-4 py-3 font-semibold">Số tiền</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Lý do</th>
                <th className="px-4 py-3 font-semibold">Lần nhận</th>
                <th className="px-4 py-3 text-right font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-[#94A3B8]">
                    {event.transactionDate ?? formatDateTime(event.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[#94A3B8]">
                    {event.providerEventId}
                    <span className="ml-1 text-[10px] text-[#566079]">{event.source}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[#DCE4F8]">{event.paymentCode ?? '—'}</td>
                  <td
                    className={`px-4 py-3 font-mono ${event.transferType === 'in' ? 'text-[#35FFB1]' : 'text-[#FF5C5C]'}`}
                  >
                    {event.transferType === 'in' ? '+' : '−'}
                    {formatCurrency(event.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={eventTone(event.status)} label={event.status} />
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">{reasonText(event.reason)}</td>
                  <td className="px-4 py-3 text-center text-[#94A3B8]">{event.deliveryCount}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void open(event)}
                      className="text-[12px] font-bold text-[#0EA5FF] hover:underline"
                    >
                      {event.status === 'NEEDS_REVIEW' ? 'Xử lý' : 'Xem'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(next) => {
          if (next === page) return;
          beginRequest();
          setPage(next);
        }}
      />

      <AdminModal open={selected !== null} title="Giao dịch ngân hàng" onClose={() => setSelected(null)}>
        {selected && (
          <div className="flex flex-col gap-4">
            <AdminDetailGrid
              items={[
                { label: 'Trạng thái', value: selected.status },
                { label: 'Lý do', value: reasonText(selected.reason) },
                { label: 'Số tiền', value: formatCurrency(selected.amount) },
                { label: 'Mã nạp', value: selected.paymentCode },
                { label: 'Nội dung CK', value: selected.content },
                { label: 'Mã SePay', value: selected.providerEventId },
                { label: 'Mã tham chiếu NH', value: selected.referenceCode },
                { label: 'TK nhận', value: selected.accountNumber },
                { label: 'Payment ID', value: selected.paymentTransactionId },
                { label: 'Ledger ID', value: selected.walletTransactionId },
                { label: 'Số lần nhận', value: selected.deliveryCount },
                { label: 'Ghi chú admin', value: selected.note },
                { label: 'Xử lý lúc', value: selected.processedAt ? formatDateTime(selected.processedAt) : null },
                {
                  label: 'Payload gốc',
                  value: selected.rawPayload ? JSON.stringify(selected.rawPayload, null, 2) : null,
                },
              ]}
            />
            {canResolve && (
              <div className="flex flex-col gap-3 rounded-xl border border-[#FACC15]/30 bg-[#FACC15]/5 p-4">
                <p className="text-[13px] text-[#FDE68A]">
                  Xác minh người chuyển trước khi cộng tiền. Thao tác được ghi audit log và chỉ thực hiện được một lần.
                </p>
                <AdminField
                  label="Account ID nhận tiền"
                  value={resolveAccountId}
                  onChange={(e) => setResolveAccountId(e.target.value)}
                />
                <AdminTextAreaField
                  label="Ghi chú (bắt buộc)"
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                />
                {resolveError && <p className="text-[13px] text-[#FF5C5C]">{resolveError}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" disabled={resolving} onClick={() => void resolve('CREDIT')}>
                    Cộng tiền vào ví
                  </Button>
                  {selected.status === 'NEEDS_REVIEW' && (
                    <Button variant="secondary" size="sm" disabled={resolving} onClick={() => void resolve('IGNORE')}>
                      Bỏ qua
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
}
