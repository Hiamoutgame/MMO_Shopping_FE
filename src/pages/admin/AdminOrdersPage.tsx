import { useEffect, useState } from 'react';
import { adminCommerceApi } from '../../common/apis/adminApi';
import type { AdminOrderDto, AdminOrderQuery, OrderStatus } from '../../common/models/admin';
import { getAdminErrorMessage } from '../../common/libs/adminForm';
import { formatCurrency, formatDateTime } from '../../common/libs/formatter';
import { labelFromStatus, orderStatusTone } from '../../common/libs/adminStatus';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { Pagination } from '../../components/Pagination/Pagination';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { AdminEmpty, AdminError, AdminLoading } from '../../components/AdminState/AdminState';
import { Button } from '../../components/Button/Button';
import { AdminModal } from '../../components/AdminModal/AdminModal';
import {
  AdminDetailGrid,
  AdminField,
  AdminSelectField,
} from '../../components/AdminForm/AdminForm';
import { useAdminRequestState } from '../../hooks/useAdminRequestState';

const PAGE_SIZE = 20;
const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'CANCELLED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [accountFilter, setAccountFilter] = useState('');
  const [appliedAccountFilter, setAppliedAccountFilter] = useState('');
  const { loading, setLoading, error, setError, reloadKey, beginRequest, reload } =
    useAdminRequestState();

  const [selected, setSelected] = useState<AdminOrderDto | null>(null);
  const [nextStatus, setNextStatus] = useState<OrderStatus>('PENDING');
  const [statusLoading, setStatusLoading] = useState(false);
  const [refunding, setRefunding] = useState<AdminOrderDto | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const query: AdminOrderQuery = { page, pageSize: PAGE_SIZE };
    if (statusFilter) query.status = statusFilter;
    if (appliedAccountFilter) query.accountId = appliedAccountFilter;

    adminCommerceApi
      .orders(query)
      .then((res) => {
        if (!cancelled) {
          setOrders(res.items);
          setTotalPages(res.totalPages);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getAdminErrorMessage(err, 'Cannot load orders.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [appliedAccountFilter, page, reloadKey, setError, setLoading, statusFilter]);

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

  const openOrder = async (order: AdminOrderDto) => {
    setSelected(order);
    setNextStatus(order.status);
    try {
      const res = await adminCommerceApi.order(order.id);
      setSelected(res.order);
      setNextStatus(res.order.status);
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot load order detail.'));
    }
  };

  const updateStatus = async () => {
    if (!selected) return;
    setStatusLoading(true);
    try {
      const res = await adminCommerceApi.updateOrderStatus(selected.id, nextStatus);
      setSelected(res.order);
      setOrders((current) => current.map((order) => (order.id === res.order.id ? res.order : order)));
      setError(null);
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot update order status.'));
    } finally {
      setStatusLoading(false);
    }
  };

  const confirmRefund = async () => {
    if (!refunding) return;
    setRefundLoading(true);
    try {
      const res = await adminCommerceApi.refundOrder(
        refunding.id,
        refundAmount.trim() ? { amount: refundAmount.trim() } : {},
      );
      setRefunding(null);
      setRefundAmount('');
      setSelected((current) => (current?.id === res.order.id ? res.order : current));
      reload();
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot refund order.'));
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[20px] font-extrabold text-white">Orders</h1>
        <p className="mt-1 text-[13px] text-[#94A3B8]">
          List, detail, status update and refund order APIs.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-[#0B1020] p-4 md:grid-cols-3">
        <AdminField
          label="Account ID"
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
        <AdminSelectField
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          options={[
            { label: 'All statuses', value: '' },
            ...ORDER_STATUSES.map((status) => ({ label: status, value: status })),
          ]}
        />
        <div className="flex items-end">
          <Button variant="secondary" size="sm" onClick={applyFilters} className="h-9 w-full">
            Apply
          </Button>
        </div>
      </section>

      {error && <AdminError message={error} onRetry={reload} />}

      {loading ? (
        <AdminLoading />
      ) : orders.length === 0 ? (
        <AdminEmpty title="No orders" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[900px] text-left text-[13px]">
            <thead className="border-b border-white/10 bg-[#0B1020] text-[11px] uppercase tracking-wider text-[#566079]">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 text-right font-semibold">Refunded</th>
                <th className="px-4 py-3 font-semibold">Placed</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-[12px] text-[#DCE4F8]">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={orderStatusTone(order.status)} label={labelFromStatus(order.status)} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={orderStatusTone(order.paymentStatus)} label={labelFromStatus(order.paymentStatus)} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[#DCE4F8]">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[#94A3B8]">
                    {formatCurrency(order.refundedAmount)}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">{formatDateTime(order.placedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => void openOrder(order)} className="text-[12px] font-bold text-[#0EA5FF] hover:underline">
                        View
                      </button>
                      {order.paymentStatus === 'PAID' && (
                        <button type="button" onClick={() => setRefunding(order)} className="text-[12px] font-bold text-[#FF5C5C] hover:underline">
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={changePage} />

      <AdminModal open={selected !== null} title="Order detail" onClose={() => setSelected(null)}>
        {selected && (
          <div className="flex flex-col gap-5">
            <AdminDetailGrid
              items={[
                { label: 'ID', value: selected.id },
                { label: 'Order number', value: selected.orderNumber },
                { label: 'Account ID', value: selected.accountId },
                { label: 'Order status', value: selected.status },
                { label: 'Payment status', value: selected.paymentStatus },
                { label: 'Subtotal', value: formatCurrency(selected.subtotal) },
                { label: 'Discount', value: formatCurrency(selected.discountAmount) },
                { label: 'Total', value: formatCurrency(selected.totalAmount) },
                { label: 'Refunded', value: formatCurrency(selected.refundedAmount) },
                { label: 'Placed', value: formatDateTime(selected.placedAt) },
              ]}
            />
            <section className="rounded-xl border border-white/10 bg-[#07080D] p-4">
              <h3 className="text-[14px] font-bold text-white">Update status</h3>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <AdminSelectField
                  label="Next status"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
                  options={ORDER_STATUSES.map((status) => ({ label: status, value: status }))}
                  className="min-w-56"
                />
                <Button size="sm" onClick={() => void updateStatus()} disabled={statusLoading}>
                  {statusLoading ? 'Updating...' : 'Update status'}
                </Button>
                {selected.paymentStatus === 'PAID' && (
                  <Button variant="secondary" size="sm" onClick={() => setRefunding(selected)}>
                    Refund
                  </Button>
                )}
              </div>
            </section>
            <section className="rounded-xl border border-white/10 bg-[#07080D] p-4">
              <h3 className="text-[14px] font-bold text-white">Items</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-[12px]">
                  <thead className="text-[10px] uppercase text-[#566079]">
                    <tr>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">SKU</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selected.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-[#DCE4F8]">
                          {item.productName} / {item.variantName}
                        </td>
                        <td className="px-3 py-2 font-mono text-[#94A3B8]">{item.sku}</td>
                        <td className="px-3 py-2 text-right text-[#94A3B8]">{item.quantity}</td>
                        <td className="px-3 py-2 text-right font-mono text-[#DCE4F8]">
                          {formatCurrency(item.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </AdminModal>

      <ConfirmDialog
        open={refunding !== null}
        title="Refund order"
        description={`Refund ${refunding?.orderNumber}. Leave amount blank for remaining amount.`}
        confirmLabel="Refund"
        loading={refundLoading}
        onConfirm={confirmRefund}
        onCancel={() => {
          setRefunding(null);
          setRefundAmount('');
        }}
      />
      {refunding && (
        <div className="fixed bottom-6 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-white/10 bg-[#0C101CEE] p-4 shadow-[0_18px_38px_rgba(0,0,0,0.6)]">
          <AdminField
            label="Refund amount, optional"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            placeholder="blank = remaining"
          />
        </div>
      )}
    </div>
  );
}
