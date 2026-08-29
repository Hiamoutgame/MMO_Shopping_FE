import { useEffect, useState } from 'react';
import { adminSystemApi } from '../../common/apis/adminApi';
import type { AuditLogDto, AuditLogQuery } from '../../common/models/admin';
import { getAdminErrorMessage } from '../../common/libs/adminForm';
import { formatDateTime } from '../../common/libs/formatter';
import { Pagination } from '../../components/Pagination/Pagination';
import { AdminEmpty, AdminError, AdminLoading } from '../../components/AdminState/AdminState';
import { Button } from '../../components/Button/Button';
import { AdminField } from '../../components/AdminForm/AdminForm';
import { useAdminRequestState } from '../../hooks/useAdminRequestState';

const PAGE_SIZE = 20;

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [actorId, setActorId] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filtersKey, setFiltersKey] = useState(0);
  const { loading, setLoading, error, setError, reloadKey, beginRequest, reload } =
    useAdminRequestState();

  useEffect(() => {
    let cancelled = false;
    const query: AuditLogQuery = { page, pageSize: PAGE_SIZE };
    if (actorId.trim()) query.actorId = actorId.trim();
    if (action.trim()) query.action = action.trim();
    if (entityType.trim()) query.entityType = entityType.trim();
    if (from) query.from = from;
    if (to) query.to = to;

    adminSystemApi
      .auditLogs(query)
      .then((res) => {
        if (!cancelled) {
          setLogs(res.items);
          setTotalPages(res.totalPages);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getAdminErrorMessage(err, 'Cannot load audit logs.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actorId, action, entityType, filtersKey, from, page, reloadKey, setError, setLoading, to]);

  const applyFilters = () => {
    beginRequest();
    setPage(1);
    setFiltersKey((key) => key + 1);
  };

  const changePage = (nextPage: number) => {
    if (nextPage === page) return;
    beginRequest();
    setPage(nextPage);
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[20px] font-extrabold text-white">Audit logs</h1>
        <p className="mt-1 text-[13px] text-[#94A3B8]">
          Audit log list with actor, action, entity and date filters.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-[#0B1020] p-4 md:grid-cols-3 xl:grid-cols-6">
        <AdminField label="Actor ID" value={actorId} onChange={(e) => setActorId(e.target.value)} />
        <AdminField label="Action" value={action} onChange={(e) => setAction(e.target.value)} />
        <AdminField label="Entity type" value={entityType} onChange={(e) => setEntityType(e.target.value)} />
        <AdminField label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <AdminField label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <div className="flex items-end">
          <Button variant="secondary" size="sm" onClick={applyFilters} className="h-9 w-full">
            Apply
          </Button>
        </div>
      </section>

      {error && <AdminError message={error} onRetry={reload} />}

      {loading ? (
        <AdminLoading />
      ) : logs.length === 0 ? (
        <AdminEmpty title="No audit logs" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="border-b border-white/10 bg-[#0B1020] text-[11px] uppercase tracking-wider text-[#566079]">
              <tr>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Entity</th>
                <th className="px-4 py-3 font-semibold">Actor</th>
                <th className="px-4 py-3 font-semibold">IP</th>
                <th className="px-4 py-3 font-semibold">Metadata</th>
                <th className="px-4 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-[12px] text-[#DCE4F8]">{log.action}</td>
                  <td className="px-4 py-3 text-[#94A3B8]">
                    <span className="font-mono text-[11px]">{log.entityType}</span>
                    <div className="font-mono text-[10px] text-[#566079]">{log.entityId}</div>
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">
                    {log.actor?.email || log.actor?.name || '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#94A3B8]">
                    {log.ipAddress || '-'}
                  </td>
                  <td className="max-w-72 truncate px-4 py-3 font-mono text-[11px] text-[#94A3B8]">
                    {log.metadata ? JSON.stringify(log.metadata) : '-'}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">{formatDateTime(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={changePage} />
    </div>
  );
}
