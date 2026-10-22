import { useEffect, useState } from 'react';
import { adminChungSucApi } from '../../common/apis/chungSucApi';
import type {
  AdminCampaignRequestDto,
  CampaignDto,
  ParticipantStatus,
} from '../../common/models/chungSuc';
import { getAdminErrorMessage } from '../../common/libs/adminForm';
import { formatCurrency, formatDateTime } from '../../common/libs/formatter';
import {
  ADMIN_REQUEST_TRANSITIONS,
  REQUEST_STATUS_LABELS,
  requestStatusTone,
} from '../../common/libs/chungSucRequest';
import { AdminModal } from '../../components/AdminModal/AdminModal';
import { AdminEmpty, AdminError, AdminLoading } from '../../components/AdminState/AdminState';
import { AdminField } from '../../components/AdminForm/AdminForm';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';

interface Props {
  campaign: CampaignDto;
  onClose: () => void;
}

// Danh sách yêu cầu tiếp sức của một campaign; admin đổi trạng thái theo luồng xử lý.
// Parent render với key={campaign.id} để mỗi campaign bắt đầu từ state trống.
export function AdminChungSucRequestsModal({ campaign, onClose }: Props) {
  const [requests, setRequests] = useState<AdminCampaignRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [note, setNote] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const campaignId = campaign.id;

  useEffect(() => {
    let cancelled = false;
    adminChungSucApi
      .requests(campaignId)
      .then((items) => {
        if (!cancelled) {
          setRequests(items);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getAdminErrorMessage(err, 'Không thể tải yêu cầu.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId, reloadKey]);

  const changeStatus = async (request: AdminCampaignRequestDto, status: ParticipantStatus) => {
    setBusyId(request.id);
    setError(null);
    try {
      await adminChungSucApi.updateRequestStatus(request.id, {
        status,
        note: note.trim() || undefined,
      });
      setNote('');
    } catch (err) {
      // 409: khách vừa hủy hoặc admin khác vừa đổi; tải lại để thấy trạng thái mới.
      setError(getAdminErrorMessage(err, 'Không thể đổi trạng thái yêu cầu.'));
    } finally {
      setBusyId(null);
      setReloadKey((key) => key + 1);
    }
  };

  const openCount = requests.filter((item) =>
    ['PENDING', 'CHECKING', 'PROCESSING'].includes(item.status),
  ).length;

  return (
    <AdminModal
      open
      title={`Yêu cầu tiếp sức — ${campaign.name}`}
      description={`${requests.length} yêu cầu, ${openCount} đang mở. Đổi trạng thái chưa tạo đơn hay trừ ví khách.`}
      onClose={onClose}
    >
      <AdminField
        label="Ghi chú cho lần đổi trạng thái tiếp theo (tuỳ chọn)"
        placeholder="VD: đã chạy 3/5 acc, 2 acc hết lượt"
        maxLength={500}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {error && (
        <div className="mt-3">
          <AdminError message={error} onRetry={() => setReloadKey((key) => key + 1)} />
        </div>
      )}

      <div className="mt-4">
        {loading ? (
          <AdminLoading />
        ) : requests.length === 0 ? (
          <AdminEmpty title="Chưa có yêu cầu" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[680px] text-left text-[13px]">
              <thead className="border-b border-white/10 bg-[#0B1020] text-[11px] uppercase tracking-wider text-[#566079]">
                <tr>
                  <th className="px-3 py-2 font-semibold">Khách</th>
                  <th className="px-3 py-2 font-semibold">Mã mời</th>
                  <th className="px-3 py-2 font-semibold">SL × giá</th>
                  <th className="px-3 py-2 font-semibold">Trạng thái</th>
                  <th className="px-3 py-2 text-right font-semibold">Chuyển sang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requests.map((request) => {
                  const next = ADMIN_REQUEST_TRANSITIONS[request.status] ?? [];
                  const last = request.statusHistory.at(-1);
                  return (
                    <tr key={request.id} className="align-top">
                      <td className="px-3 py-2">
                        <div className="max-w-[180px] truncate text-[#DCE4F8]" title={request.account?.email}>
                          {request.account?.email ?? '-'}
                        </div>
                        <div className="text-[11px] text-[#566079]">
                          {formatDateTime(request.joinedAt)}
                        </div>
                      </td>
                      <td className="px-3 py-2 font-mono text-[#DCE4F8]">
                        {request.inviteCodeMasked}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-[#94A3B8]">
                        {request.quantity} × {formatCurrency(request.unitPrice)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <StatusBadge
                          tone={requestStatusTone(request.status)}
                          label={REQUEST_STATUS_LABELS[request.status]}
                        />
                        {last?.note && (
                          <div className="mt-1 max-w-[180px] whitespace-normal text-[11px] text-[#566079]">
                            {last.note}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                          {next.length === 0 ? (
                            <span className="text-[11px] text-[#566079]">Đã đóng</span>
                          ) : (
                            next.map((status) => (
                              <button
                                key={status}
                                type="button"
                                disabled={busyId === request.id}
                                onClick={() => void changeStatus(request, status)}
                                className={`text-[12px] font-bold hover:underline disabled:opacity-50 ${
                                  status === 'FAILED' ? 'text-[#FF5C5C]' : 'text-[#0EA5FF]'
                                }`}
                              >
                                {REQUEST_STATUS_LABELS[status]}
                              </button>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminModal>
  );
}
