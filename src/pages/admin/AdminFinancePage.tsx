import { useEffect, useState } from 'react';
import { adminFinanceApi } from '../../common/apis/adminApi';
import type {
  AdminPaymentTransactionDto,
  AdminWalletLedgerDto,
  PaymentTransactionStatus,
} from '../../common/models/admin';
import { getAdminErrorMessage } from '../../common/libs/adminForm';
import { formatCurrency, formatDateTime } from '../../common/libs/formatter';
import { labelFromStatus, transactionStatusTone } from '../../common/libs/adminStatus';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { Pagination } from '../../components/Pagination/Pagination';
import { AdminEmpty, AdminError, AdminLoading } from '../../components/AdminState/AdminState';
import { AdminModal } from '../../components/AdminModal/AdminModal';
import { AdminDetailGrid, AdminField, AdminSelectField } from '../../components/AdminForm/AdminForm';
import { Button } from '../../components/Button/Button';
import { useAdminRequestState } from '../../hooks/useAdminRequestState';

const PAGE_SIZE = 20;
const PAYMENT_STATUSES: PaymentTransactionStatus[] = ['PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED'];

export default function AdminFinancePage() {
  const [tab, setTab] = useState<'payments' | 'ledgers'>('payments');
  const [payments, setPayments] = useState<AdminPaymentTransactionDto[]>([]);
  const [ledgers, setLedgers] = useState<AdminWalletLedgerDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [accountFilter, setAccountFilter] = useState('');
  const [appliedAccountFilter, setAppliedAccountFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentTransactionStatus | ''>('');
  const { loading, setLoading, error, setError, reloadKey, beginRequest, reload } =
    useAdminRequestState();
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentTransactionDto | null>(null);

  useEffect(() => {
    let cancelled = false;
    const commonQuery = {
      page,
      pageSize: PAGE_SIZE,
      accountId: appliedAccountFilter || undefined,
    };
    const req =
      tab === 'payments'
        ? adminFinanceApi.paymentTransactions({ ...commonQuery, status: statusFilter || undefined })
        : adminFinanceApi.walletLedgers(commonQuery);

    req
      .then((res) => {
        if (cancelled) return;
        if (tab === 'payments') setPayments(res.items as AdminPaymentTransactionDto[]);
        else setLedgers(res.items as AdminWalletLedgerDto[]);
        setTotalPages(res.totalPages);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getAdminErrorMessage(err, 'Cannot load finance data.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [appliedAccountFilter, page, reloadKey, setError, setLoading, statusFilter, tab]);

  const switchTab = (next: 'payments' | 'ledgers') => {
    if (next === tab) return;
    beginRequest();
    setTab(next);
    setPage(1);
  };

  const applyFilters = () => {
    beginRequest();
    setPage(1);
    setAppliedAccountFilter(accountFilter.trim());
    reload();
  };

  const changePage = (nextPage: number) => {
    if (nextPage === page) return;
    beginRequest();
    setPage(nextPage);
  };

  const openPayment = async (payment: AdminPaymentTransactionDto) => {
    setSelectedPayment(payment);
    try {
      const res = await adminFinanceApi.paymentTransaction(payment.id);
      setSelectedPayment(res.paymentTransaction);
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot load payment detail.'));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-white">Finance</h1>
          <p className="mt-1 text-[13px] text-[#94A3B8]">
            Payment transactions detail and wallet ledger list APIs.
          </p>
        </div>
        <div className="flex gap-1 rounded-[10px] border border-white/10 bg-[#0B1020] p-1">
          {(['payments', 'ledgers'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => switchTab(key)}
              className={
                tab === key
                  ? 'rounded-[8px] bg-[#162033CC] px-3 py-1.5 text-[12px] font-bold text-white'
                  : 'rounded-[8px] px-3 py-1.5 text-[12px] font-medium text-[#94A3B8]'
              }
            >
              {key === 'payments' ? 'Payments' : 'Wallet ledgers'}
            </button>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-[#0B1020] p-4 md:grid-cols-3">
        <AdminField
          label="Account ID"
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
        {tab === 'payments' ? (
          <AdminSelectField
            label="Payment status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentTransactionStatus | '')}
            options={[
              { label: 'All statuses', value: '' },
              ...PAYMENT_STATUSES.map((status) => ({ label: status, value: status })),
            ]}
          />
        ) : (
          <div />
        )}
        <div className="flex items-end">
          <Button variant="secondary" size="sm" onClick={applyFilters} className="h-9 w-full">
            Apply
          </Button>
        </div>
      </section>

      {error && <AdminError message={error} onRetry={reload} />}

      {loading ? (
        <AdminLoading />
      ) : tab === 'payments' ? (
        payments.length === 0 ? (
          <AdminEmpty title="No payment transactions" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[840px] text-left text-[13px]">
              <thead className="border-b border-white/10 bg-[#0B1020] text-[11px] uppercase tracking-wider text-[#566079]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Account</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-[12px] text-[#DCE4F8]">
                      {payment.merchantReference}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#94A3B8]">
                      {payment.accountId}
                    </td>
                    <td className="px-4 py-3 text-[#94A3B8]">{payment.type}</td>
                    <td className="px-4 py-3 font-mono text-[#DCE4F8]">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        tone={transactionStatusTone(payment.status)}
                        label={labelFromStatus(payment.status)}
                      />
                    </td>
                    <td className="px-4 py-3 text-[#94A3B8]">{formatDateTime(payment.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => void openPayment(payment)} className="text-[12px] font-bold text-[#0EA5FF] hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : ledgers.length === 0 ? (
        <AdminEmpty title="No wallet ledgers" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[780px] text-left text-[13px]">
            <thead className="border-b border-white/10 bg-[#0B1020] text-[11px] uppercase tracking-wider text-[#566079]">
              <tr>
                <th className="px-4 py-3 font-semibold">Wallet</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Balance before</th>
                <th className="px-4 py-3 font-semibold">Balance after</th>
                <th className="px-4 py-3 font-semibold">Purpose</th>
                <th className="px-4 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ledgers.map((ledger) => (
                <tr key={ledger.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-[11px] text-[#94A3B8]">{ledger.walletId}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={ledger.type === 'CREDIT' ? 'green' : 'red'}
                      label={labelFromStatus(ledger.type)}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-[#DCE4F8]">{formatCurrency(ledger.amount)}</td>
                  <td className="px-4 py-3 font-mono text-[#94A3B8]">
                    {formatCurrency(ledger.balanceBefore)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[#DCE4F8]">
                    {formatCurrency(ledger.balanceAfter)}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">{ledger.purpose}</td>
                  <td className="px-4 py-3 text-[#94A3B8]">{formatDateTime(ledger.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={changePage} />

      <AdminModal open={selectedPayment !== null} title="Payment transaction detail" onClose={() => setSelectedPayment(null)}>
        {selectedPayment && (
          <AdminDetailGrid
            items={[
              { label: 'ID', value: selectedPayment.id },
              { label: 'Account ID', value: selectedPayment.accountId },
              { label: 'Provider', value: selectedPayment.provider },
              { label: 'Merchant reference', value: selectedPayment.merchantReference },
              { label: 'Provider transaction ID', value: selectedPayment.providerTransactionId },
              { label: 'Type', value: selectedPayment.type },
              { label: 'Amount', value: formatCurrency(selectedPayment.amount, selectedPayment.currency) },
              { label: 'Status', value: selectedPayment.status },
              { label: 'Completed', value: selectedPayment.completedAt ? formatDateTime(selectedPayment.completedAt) : null },
              { label: 'Created', value: formatDateTime(selectedPayment.createdAt) },
              { label: 'Metadata', value: selectedPayment.metadata ? JSON.stringify(selectedPayment.metadata, null, 2) : null },
            ]}
          />
        )}
      </AdminModal>
    </div>
  );
}
