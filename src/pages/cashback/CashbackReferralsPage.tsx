import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { cashbackApi } from '../../common/apis/cashbackApi';
import { formatCurrency, formatDateTime } from '../../common/libs/formatter';
import type { ApiError } from '../../common/models/common';
import type { CashbackReferralSummary } from '../../common/models/cashback';
import { Button } from '../../components/Button/Button';
import { CashbackEmpty, CashbackError, CashbackLoading } from '../../components/CashbackState/CashbackState';
import type { CashbackOutletContext } from './CashbackCenterPage';

export default function CashbackReferralsPage() {
  const { requireReconnect } = useOutletContext<CashbackOutletContext>();
  const [data, setData] = useState<CashbackReferralSummary | null>(null);
  const [level, setLevel] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    cashbackApi.getReferrals({ level, page: 1, perPage: 20 }).then((value) => { if (!cancelled) { setData(value); setError(''); } }).catch((reason: ApiError) => { if (reason.errorCode === 'CASHBACK_REAUTH_REQUIRED') requireReconnect(); if (!cancelled) setError(reason.message || 'Không thể tải dữ liệu giới thiệu.'); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [level, reloadKey, requireReconnect]);

  if (loading) return <CashbackLoading label="Đang tải dữ liệu giới thiệu..." />;
  if (error) return <CashbackError message={error} onRetry={() => { setLoading(true); setReloadKey((value) => value + 1); }} />;
  if (!data) return <CashbackEmpty title="Chưa có dữ liệu" description="Dữ liệu giới thiệu hiện chưa khả dụng." />;

  const members = level === 1 ? data.f1Members || [] : data.f2Members || [];
  return <div className="flex flex-col gap-5">
    <section className="rounded-2xl border border-[#7C3DFF]/25 bg-[#0D0C20] p-5 sm:p-7"><span className="font-mono text-[11px] font-bold uppercase text-[#A78BFA]">Link giới thiệu của bạn</span><div className="mt-3 flex flex-col gap-3 sm:flex-row"><div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#07080D] px-4 py-3 text-sm text-white break-all">{data.referralLink}</div><Button onClick={() => void navigator.clipboard.writeText(data.referralLink).then(() => setCopied(true))}>{copied ? 'Đã sao chép' : 'Sao chép link'}</Button></div><p className="mt-3 font-mono text-sm text-[#94A3B8]">Mã: <strong className="text-white">{data.referralCode}</strong></p></section>
    <section className="grid gap-3 sm:grid-cols-3"><Metric label="Thành viên F1" value={String(data.stats?.f1Count ?? 0)} /><Metric label="Thành viên F2" value={String(data.stats?.f2Count ?? 0)} /><Metric label="Tổng hoa hồng" value={formatCurrency(data.stats?.totalCommission || '0')} /></section>
    <section className="rounded-2xl border border-white/10 bg-[#0C101EEE] p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-white">Thành viên tuyến dưới</h2><div className="flex rounded-xl border border-white/10 p-1"><button className={`rounded-lg px-3 py-1.5 text-xs font-bold ${level === 1 ? 'bg-[#162033] text-white' : 'text-[#94A3B8]'}`} onClick={() => { setLevel(1); setLoading(true); }}>F1</button><button className={`rounded-lg px-3 py-1.5 text-xs font-bold ${level === 2 ? 'bg-[#162033] text-white' : 'text-[#94A3B8]'}`} onClick={() => { setLevel(2); setLoading(true); }}>F2</button></div></div>{members.length ? <div className="grid gap-3">{members.map((member, index) => <div key={member.id || index} className="flex justify-between gap-3 rounded-xl border border-white/10 bg-[#080B14] p-4"><div><p className="font-semibold text-white">{member.name || member.email || 'Thành viên'}</p><p className="mt-1 text-xs text-[#94A3B8]">{member.email || 'Thông tin được bảo mật'}</p></div><span className="text-xs text-[#566079]">{member.createdAt ? formatDateTime(member.createdAt) : ''}</span></div>)}</div> : <CashbackEmpty title={`Chưa có thành viên F${level}`} description="Chia sẻ link giới thiệu để bắt đầu xây dựng hệ thống." />}</section>
    <section className="rounded-2xl border border-white/10 bg-[#0C101EEE] p-5"><h2 className="mb-4 text-lg font-bold text-white">Lịch sử hoa hồng</h2>{data.commissions?.items?.length ? <div className="grid gap-3">{data.commissions.items.map((commission, index) => <div key={commission.id || index} className="flex justify-between gap-3 rounded-xl border border-white/10 bg-[#080B14] p-4"><div><p className="text-sm text-white">{commission.description || 'Hoa hồng giới thiệu'}</p><p className="mt-1 text-xs text-[#566079]">{commission.createdAt ? formatDateTime(commission.createdAt) : ''}</p></div><strong className="text-[#35FFB1]">{formatCurrency(commission.amount || '0')}</strong></div>)}</div> : <CashbackEmpty title="Chưa có hoa hồng" description="Hoa hồng được duyệt sẽ xuất hiện tại đây." />}</section>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-[#0C101EEE] p-5"><span className="font-mono text-[10px] uppercase text-[#566079]">{label}</span><p className="mt-2 text-2xl font-extrabold text-white">{value}</p></div>; }
