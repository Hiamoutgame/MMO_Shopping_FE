import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { cashbackApi } from '../../common/apis/cashbackApi';
import { formatCurrency, formatDateTime } from '../../common/libs/formatter';
import { useDebounce } from '../../hooks/useDebounce';
import { cashbackStatusTone, normalizeCashbackPage } from '../../common/mapping/cashback';
import type { ApiError, PaginatedResponse } from '../../common/models/common';
import type { CashbackOrder } from '../../common/models/cashback';
import { CashbackEmpty, CashbackError, CashbackLoading } from '../../components/CashbackState/CashbackState';
import { Pagination } from '../../components/Pagination/Pagination';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import type { CashbackOutletContext } from './CashbackCenterPage';

export default function CashbackOrdersPage() {
  const { id } = useParams();
  return id ? <OrderDetail id={id} /> : <OrderList />;
}

function OrderList() {
  const { requireReconnect } = useOutletContext<CashbackOutletContext>();
  const [data, setData] = useState<PaginatedResponse<CashbackOrder> | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [platform, setPlatform] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await cashbackApi.listOrders({ page, perPage: 20, status: status || undefined, platform: platform || undefined, search: debouncedSearch || undefined });
        if (!cancelled) { setData(normalizeCashbackPage(result)); setError(''); }
      } catch (reason) {
        const apiError = reason as ApiError;
        if (apiError.errorCode === 'CASHBACK_REAUTH_REQUIRED') requireReconnect();
        if (!cancelled) setError(apiError.message || 'Không thể tải đơn hàng.');
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [page, status, platform, debouncedSearch, reloadKey, requireReconnect]);

  if (loading) return <CashbackLoading label="Đang tải đơn hoàn phí..." />;
  if (error) return <CashbackError message={error} onRetry={() => { setLoading(true); setReloadKey((value) => value + 1); }} />;

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0C101EEE] p-5">
      <div className="mb-5 flex flex-wrap gap-3">
        <input className="h-10 min-w-48 flex-1 rounded-xl border border-white/10 bg-[#07080D] px-3 text-sm text-white" placeholder="Tìm đơn hàng" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        <select className="h-10 rounded-xl border border-white/10 bg-[#07080D] px-3 text-sm text-white" value={platform} onChange={(event) => { setPlatform(event.target.value); setPage(1); }}><option value="">Mọi nền tảng</option><option value="shopee">Shopee</option><option value="tiktok">TikTok Shop</option></select>
        <select className="h-10 rounded-xl border border-white/10 bg-[#07080D] px-3 text-sm text-white" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Mọi trạng thái</option><option value="pending">Chờ duyệt</option><option value="approved">Đã duyệt</option><option value="rejected">Từ chối</option><option value="recalled">Thu hồi</option></select>
      </div>
      {data?.items.length ? <div className="grid gap-3">
        {data.items.map((order) => <Link key={order.id || order.orderId} to={`/cashback/orders/${encodeURIComponent(order.id || order.orderId)}`} className="grid gap-2 rounded-xl border border-white/10 bg-[#080B14] p-4 transition-colors hover:border-[#0EA5FF]/35 sm:grid-cols-[1.2fr_1fr_auto] sm:items-center"><div><p className="font-semibold text-white">{order.productName || `Đơn ${order.orderId}`}</p><p className="mt-1 font-mono text-xs text-[#566079]">{order.orderId}</p></div><div className="text-sm text-[#94A3B8]">{order.platform || '—'} · {order.createdAt ? formatDateTime(order.createdAt) : '—'}</div><div className="flex items-center gap-3 sm:justify-end"><strong className="text-[#35FFB1]">{formatCurrency(order.cashbackAmount)}</strong><StatusBadge label={order.status} tone={cashbackStatusTone(order.status)} /></div></Link>)}
      </div> : <CashbackEmpty title="Chưa có đơn hoàn phí" description="Đơn mua qua link hoàn phí sẽ được ghi nhận tại đây." />}
      {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} className="mt-5" />}
    </section>
  );
}

function OrderDetail({ id }: { id: string }) {
  const { requireReconnect } = useOutletContext<CashbackOutletContext>();
  const [order, setOrder] = useState<CashbackOrder | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { let cancelled = false; cashbackApi.getOrder(id).then((value) => { if (!cancelled) setOrder(value); }).catch((reason: ApiError) => { if (reason.errorCode === 'CASHBACK_REAUTH_REQUIRED') requireReconnect(); if (!cancelled) setError(reason.message); }); return () => { cancelled = true; }; }, [id, requireReconnect]);
  if (error) return <CashbackError message={error} />;
  if (!order) return <CashbackLoading label="Đang tải chi tiết đơn..." />;
  return <section className="rounded-2xl border border-white/10 bg-[#0C101EEE] p-5 sm:p-7"><Link to="/cashback/orders" className="text-sm text-[#0EA5FF]">← Danh sách đơn</Link><div className="mt-5 flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-xs text-[#566079]">{order.orderId}</p><h2 className="mt-1 text-2xl font-bold text-white">{order.productName || 'Chi tiết đơn hoàn phí'}</h2></div><StatusBadge label={order.status} tone={cashbackStatusTone(order.status)} /></div><dl className="mt-6 grid gap-4 sm:grid-cols-2"><Detail label="Nền tảng" value={order.platform || '—'} /><Detail label="Tiền hoàn" value={formatCurrency(order.cashbackAmount)} /><Detail label="Giá trị đơn" value={order.originalPrice ? formatCurrency(order.originalPrice) : '—'} /><Detail label="Thời gian" value={order.createdAt ? formatDateTime(order.createdAt) : '—'} /></dl>{order.rejectionReason && <p className="mt-5 rounded-xl border border-[#FF5C5C]/25 bg-[#FF5C5C]/10 p-4 text-sm text-[#FF8A8A]">{order.rejectionReason}</p>}</section>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/10 bg-[#080B14] p-4"><dt className="font-mono text-[10px] uppercase text-[#566079]">{label}</dt><dd className="mt-1 font-semibold text-white">{value}</dd></div>; }
