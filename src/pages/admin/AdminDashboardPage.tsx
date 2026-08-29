import { useEffect, useState } from 'react';
import { adminSystemApi } from '../../common/apis/adminApi';
import type { DashboardOverviewDto, ReportSummaryDto } from '../../common/models/admin';
import { getAdminErrorMessage } from '../../common/libs/adminForm';
import { formatCurrency, formatDateTime } from '../../common/libs/formatter';
import { AdminError, AdminLoading } from '../../components/AdminState/AdminState';
import { AdminField } from '../../components/AdminForm/AdminForm';
import { Button } from '../../components/Button/Button';
import { useAdminRequestState } from '../../hooks/useAdminRequestState';

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0C101CEE] p-5">
      <div className="font-mono text-[10px] font-extrabold uppercase tracking-[1.6px] text-[#566079]">
        {label}
      </div>
      <div className="mt-2 text-[24px] font-extrabold leading-none text-white">{value}</div>
      {sub && <div className="mt-1 text-[12px] text-[#94A3B8]">{sub}</div>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<DashboardOverviewDto | null>(null);
  const [report, setReport] = useState<ReportSummaryDto | null>(null);
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');
  const [reportTimezone, setReportTimezone] = useState('Asia/Saigon');
  const [reportLoading, setReportLoading] = useState(false);
  const { loading, setLoading, error, setError, reloadKey, reload } = useAdminRequestState();

  useEffect(() => {
    let cancelled = false;
    adminSystemApi
      .dashboardOverview()
      .then((res) => {
        if (!cancelled) {
          setOverview(res.overview);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getAdminErrorMessage(err, 'Cannot load dashboard.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey, setError, setLoading]);

  const loadReport = async () => {
    setReportLoading(true);
    setError(null);
    try {
      const res = await adminSystemApi.reportsSummary({
        from: reportFrom || undefined,
        to: reportTo || undefined,
        timezone: reportTimezone || undefined,
      });
      setReport(res.summaryReport);
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot load summary report.'));
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) return <AdminLoading />;
  if (error || !overview) {
    return <AdminError message={error ?? undefined} onRetry={reload} />;
  }

  const last30 = overview.last30Days;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[20px] font-extrabold text-white">Dashboard</h1>
        <p className="mt-1 text-[13px] text-[#94A3B8]">
          Overview metrics plus the admin summary report endpoint.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Net revenue, 30 days"
          value={formatCurrency(last30.revenue.net)}
          sub={`Gross ${formatCurrency(last30.revenue.gross)} / Refund ${formatCurrency(last30.revenue.refunded)}`}
        />
        <StatCard
          label="Orders, 30 days"
          value={String(last30.orders.total)}
          sub={`${last30.orders.paid} paid`}
        />
        <StatCard label="Users" value={String(overview.current.users.total)} />
        <StatCard
          label="Open orders"
          value={String(overview.current.orders.pending + overview.current.orders.processing)}
          sub={`${overview.current.orders.pending} pending / ${overview.current.orders.processing} processing`}
        />
      </section>

      <section className="rounded-xl border border-white/10 bg-[#0C101CEE] p-5">
        <h2 className="text-[14px] font-bold text-white">Summary report</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <AdminField
            label="From"
            type="date"
            value={reportFrom}
            onChange={(e) => setReportFrom(e.target.value)}
            className="min-w-44"
          />
          <AdminField
            label="To"
            type="date"
            value={reportTo}
            onChange={(e) => setReportTo(e.target.value)}
            className="min-w-44"
          />
          <AdminField
            label="Timezone"
            value={reportTimezone}
            onChange={(e) => setReportTimezone(e.target.value)}
            className="min-w-44"
          />
          <Button size="sm" onClick={() => void loadReport()} disabled={reportLoading}>
            {reportLoading ? 'Loading...' : 'Load report'}
          </Button>
        </div>
        {report && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Report revenue" value={formatCurrency(report.revenue.net)} />
            <StatCard label="Report orders" value={String(report.orders.total)} />
            <StatCard label="Report new users" value={String(report.users.new)} />
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#0C101CEE] p-5">
          <h2 className="text-[14px] font-bold text-white">Orders by status, 30 days</h2>
          <dl className="mt-4 flex flex-col gap-2">
            {Object.entries(last30.orders.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-[13px]">
                <span className="text-[#94A3B8]">{status}</span>
                <span className="font-mono font-bold text-[#DCE4F8]">{count}</span>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0C101CEE] p-5">
          <h2 className="text-[14px] font-bold text-white">Product views, 30 days</h2>
          <dl className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#94A3B8]">Total</span>
              <span className="font-mono font-bold text-[#DCE4F8]">{last30.productViews.total}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#94A3B8]">Authenticated</span>
              <span className="font-mono font-bold text-[#DCE4F8]">
                {last30.productViews.authenticated}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#94A3B8]">Anonymous</span>
              <span className="font-mono font-bold text-[#DCE4F8]">{last30.productViews.anonymous}</span>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#0C101CEE] p-5">
        <h2 className="text-[14px] font-bold text-white">Current inventory</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-[12px] text-[#94A3B8]">Total items</dt>
            <dd className="text-[18px] font-extrabold text-white">{overview.current.inventory.total}</dd>
          </div>
          {Object.entries(overview.current.inventory.byStatus).map(([status, count]) => (
            <div key={status}>
              <dt className="text-[12px] text-[#94A3B8]">{status}</dt>
              <dd className="text-[18px] font-extrabold text-white">{count}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="text-[11px] text-[#566079]">
        Updated at {formatDateTime(new Date())}
      </footer>
    </div>
  );
}
