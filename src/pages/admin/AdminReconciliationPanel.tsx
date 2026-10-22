import { useState } from 'react';
import { adminFinanceApi } from '../../common/apis/adminApi';
import { getAdminErrorMessage } from '../../common/libs/adminForm';
import { formatCurrency, formatDateTime } from '../../common/libs/formatter';
import type { WalletReconciliationReport } from '../../common/models/admin';
import { AdminError } from '../../components/AdminState/AdminState';
import { Button } from '../../components/Button/Button';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';

function IssueList({ title, rows }: { title: string; rows: Array<Record<string, unknown>> }) {
  if (rows.length === 0) return null;
  return (
    <div className="rounded-xl border border-[#FF5C5C]/30 bg-[#FF5C5C]/5 p-4">
      <h3 className="mb-2 text-[14px] font-bold text-[#FCA5A5]">
        {title} ({rows.length})
      </h3>
      <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap text-[12px] text-[#DCE4F8]">
        {JSON.stringify(rows, null, 2)}
      </pre>
    </div>
  );
}

/** Đối soát chỉ đọc: số dư ví phải khớp tổng ledger, mỗi nạp tiền có đúng một dòng ledger. */
export function AdminReconciliationPanel() {
  const [report, setReport] = useState<WalletReconciliationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await adminFinanceApi.reconciliation());
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot run reconciliation.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0B1020] p-4">
        <p className="max-w-[640px] text-[13px] text-[#94A3B8]">
          Kiểm tra: số dư từng ví = tổng CREDIT − DEBIT trong ledger, chuỗi số dư trước/sau liền mạch, mỗi lệnh nạp
          thành công có đúng một dòng ledger cùng số tiền. Chỉ đọc, không tự sửa dữ liệu.
        </p>
        <Button size="sm" disabled={loading} onClick={() => void run()}>
          {loading ? 'Đang đối soát…' : 'Chạy đối soát'}
        </Button>
      </section>

      {error && <AdminError message={error} onRetry={() => void run()} />}

      {report && (
        <>
          <section className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-[#0B1020] p-4">
              <p className="text-[11px] uppercase text-[#566079]">Kết quả</p>
              <div className="mt-2">
                <StatusBadge tone={report.ok ? 'green' : 'red'} label={report.ok ? 'Khớp' : 'Có sai lệch'} />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0B1020] p-4">
              <p className="text-[11px] uppercase text-[#566079]">Số ví</p>
              <p className="mt-1 text-xl font-bold text-white">{report.walletsChecked}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0B1020] p-4">
              <p className="text-[11px] uppercase text-[#566079]">Tổng số dư khách</p>
              <p className="mt-1 text-xl font-bold text-white">{formatCurrency(report.totalBalance)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0B1020] p-4">
              <p className="text-[11px] uppercase text-[#566079]">GD chờ xem xét</p>
              <p className="mt-1 text-xl font-bold text-[#FACC15]">{report.eventsNeedingReview}</p>
            </div>
          </section>
          <p className="text-[12px] text-[#566079]">Chạy lúc {formatDateTime(report.checkedAt)}</p>
          <IssueList title="Ví lệch số dư / đứt chuỗi ledger" rows={report.walletMismatches} />
          <IssueList title="Nạp tiền thành công nhưng ledger sai" rows={report.paymentIssues} />
          <IssueList title="Ledger gắn payment chưa thành công" rows={report.orphanLedgers} />
          <IssueList title="Sự kiện đã xử lý nhưng thiếu ledger" rows={report.eventsWithoutLedger} />
        </>
      )}
    </div>
  );
}
