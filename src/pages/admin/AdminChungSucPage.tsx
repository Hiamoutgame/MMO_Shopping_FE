import { useEffect, useState } from 'react';
import { adminCatalogApi } from '../../common/apis/adminApi';
import { adminChungSucApi } from '../../common/apis/chungSucApi';
import type { AdminProductDto } from '../../common/models/admin';
import type {
  CampaignDto,
  CampaignLifecycleAction,
  CampaignStatus,
  CreateCampaignRequest,
  SeasonDto,
  UpdateCampaignRequest,
} from '../../common/models/chungSuc';
import {
  fromDateTimeLocal,
  getAdminErrorMessage,
  optionalString,
  parseJsonRecord,
  stringifyJson,
  toDateTimeLocal,
} from '../../common/libs/adminForm';
import { formatDateTime } from '../../common/libs/formatter';
import { campaignStatusTone, labelFromStatus } from '../../common/libs/adminStatus';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { AdminEmpty, AdminError, AdminLoading } from '../../components/AdminState/AdminState';
import { Button } from '../../components/Button/Button';
import { AdminModal } from '../../components/AdminModal/AdminModal';
import {
  AdminField,
  AdminSelectField,
  AdminTextAreaField,
} from '../../components/AdminForm/AdminForm';
import { useAdminRequestState } from '../../hooks/useAdminRequestState';
import { AdminChungSucRequestsModal } from './AdminChungSucRequestsModal';

// Khớp với bảng chuyển trạng thái của BE (chung-suc.service.ts).
const LIFECYCLE_ACTIONS: Array<{
  action: CampaignLifecycleAction;
  label: string;
  from: CampaignStatus[];
}> = [
  { action: 'activate', label: 'Kích hoạt', from: ['DRAFT', 'UPCOMING', 'PAUSED'] },
  { action: 'pause', label: 'Tạm dừng', from: ['UPCOMING', 'ACTIVE'] },
  { action: 'end', label: 'Kết thúc', from: ['UPCOMING', 'ACTIVE', 'PAUSED'] },
  {
    action: 'close',
    label: 'Đóng',
    from: ['DRAFT', 'UPCOMING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ENDED'],
  },
];

interface CampaignFormState {
  seasonId: string;
  productId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  targetQuantity: string;
  startTime: string;
  endTime: string;
  rewards: string;
}

const emptyForm: CampaignFormState = {
  seasonId: '',
  productId: '',
  name: '',
  slug: '',
  description: '',
  imageUrl: '',
  targetQuantity: '8',
  startTime: '',
  endTime: '',
  rewards: '',
};

function toForm(campaign: CampaignDto): CampaignFormState {
  return {
    seasonId: campaign.seasonId || '',
    productId: campaign.productId,
    name: campaign.name,
    slug: campaign.slug,
    description: campaign.description || '',
    imageUrl: campaign.imageUrl || '',
    targetQuantity: String(campaign.targetQuantity),
    startTime: toDateTimeLocal(campaign.startTime),
    endTime: toDateTimeLocal(campaign.endTime),
    rewards: stringifyJson(campaign.rewards),
  };
}

function toUpdatePayload(form: CampaignFormState) {
  return {
    name: form.name.trim(),
    description: optionalString(form.description),
    imageUrl: optionalString(form.imageUrl),
    targetQuantity: Number(form.targetQuantity),
    startTime: fromDateTimeLocal(form.startTime) || form.startTime,
    endTime: fromDateTimeLocal(form.endTime) || form.endTime,
    rewards: parseJsonRecord(form.rewards, 'Rewards'),
  } satisfies UpdateCampaignRequest;
}

// Trả về lỗi đầu tiên của form, hoặc null nếu gửi được.
function validateForm(form: CampaignFormState, mode: 'create' | 'edit'): string | null {
  if (mode === 'create') {
    if (!form.productId) return 'Vui lòng chọn sản phẩm.';
    if (!form.slug.trim()) return 'Vui lòng nhập slug.';
  }
  if (!form.name.trim()) return 'Vui lòng nhập tên campaign.';
  const target = Number(form.targetQuantity);
  if (!Number.isInteger(target) || target < 1) {
    return 'Số tài khoản tối đa mỗi mã phải là số nguyên từ 1 trở lên.';
  }
  if (!form.startTime || !form.endTime) return 'Vui lòng chọn thời gian bắt đầu và kết thúc.';
  if (new Date(form.startTime) >= new Date(form.endTime)) {
    return 'Thời gian bắt đầu phải trước thời gian kết thúc.';
  }
  return null;
}

function toCreatePayload(form: CampaignFormState): CreateCampaignRequest {
  return {
    ...toUpdatePayload(form),
    productId: form.productId.trim(),
    seasonId: optionalString(form.seasonId),
    slug: form.slug.trim(),
  };
}

export default function AdminChungSucPage() {
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
  const [seasons, setSeasons] = useState<SeasonDto[]>([]);
  const [products, setProducts] = useState<AdminProductDto[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const { loading, setLoading, error, setError, reloadKey, reload } = useAdminRequestState();

  const [editing, setEditing] = useState<CampaignDto | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<CampaignFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<CampaignDto | null>(null);
  const [viewingRequests, setViewingRequests] = useState<CampaignDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      adminChungSucApi.campaigns(),
      adminChungSucApi.seasons(),
      adminCatalogApi.products({ pageSize: 100 }),
    ])
      .then(([campaignItems, seasonItems, productPage]) => {
        if (!cancelled) {
          setCampaigns(campaignItems);
          setSeasons(seasonItems);
          setProducts(productPage.items);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getAdminErrorMessage(err, 'Không thể tải danh sách campaign.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey, setError, setLoading]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setModalMode('create');
  };

  const openEdit = (campaign: CampaignDto) => {
    setEditing(campaign);
    setForm(toForm(campaign));
    setFormError(null);
    setModalMode('edit');
  };

  const saveCampaign = async () => {
    if (!modalMode) return;
    const invalid = validateForm(form, modalMode);
    if (invalid) {
      setFormError(invalid);
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (modalMode === 'create') {
        await adminChungSucApi.createCampaign(toCreatePayload(form));
      } else if (modalMode === 'edit' && editing) {
        await adminChungSucApi.updateCampaign(editing.id, toUpdatePayload(form));
      }
      setModalMode(null);
      reload();
    } catch (err) {
      // Hiện trong modal: lỗi ở đầu trang bị modal che mất.
      setFormError(getAdminErrorMessage(err, 'Không thể lưu campaign.'));
    } finally {
      setSaving(false);
    }
  };

  const runLifecycle = async (campaign: CampaignDto, action: CampaignLifecycleAction) => {
    setBusyId(campaign.id);
    try {
      await adminChungSucApi.runLifecycle(campaign.id, action);
      reload();
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Không thể đổi trạng thái campaign.'));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await adminChungSucApi.deleteCampaign(deleting.id);
      setDeleting(null);
      reload();
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Không thể xoá campaign.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const setField = (field: keyof CampaignFormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-white">Chung sức</h1>
          <p className="mt-1 text-[13px] text-[#94A3B8]">
            Tạo, sửa và điều khiển vòng đời các campaign tiếp sức mã mời.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          Tạo campaign
        </Button>
      </header>

      {error && <AdminError message={error} onRetry={reload} />}

      {loading ? (
        <AdminLoading />
      ) : campaigns.length === 0 ? (
        <AdminEmpty title="Chưa có campaign" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[920px] text-left text-[13px]">
            <thead className="border-b border-white/10 bg-[#0B1020] text-[11px] uppercase tracking-wider text-[#566079]">
              <tr>
                <th className="px-4 py-3 font-semibold">Campaign</th>
                <th className="px-4 py-3 font-semibold">Season</th>
                <th className="px-4 py-3 font-semibold">Tối đa / mã</th>
                <th className="px-4 py-3 font-semibold">Thời gian</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="text-[#DCE4F8]">{campaign.name}</div>
                    <div className="font-mono text-[11px] text-[#566079]">{campaign.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">{campaign.season?.name || '-'}</td>
                  <td className="px-4 py-3 font-mono text-[#DCE4F8]">
                    {campaign.targetQuantity}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">
                    {formatDateTime(campaign.startTime)} → {formatDateTime(campaign.endTime)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={campaignStatusTone(campaign.status)}
                      label={labelFromStatus(campaign.status)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-3">
                      {LIFECYCLE_ACTIONS.filter((item) => item.from.includes(campaign.status)).map(
                        (item) => (
                          <button
                            key={item.action}
                            type="button"
                            disabled={busyId === campaign.id}
                            onClick={() => void runLifecycle(campaign, item.action)}
                            className="text-[12px] font-bold text-[#0EA5FF] hover:underline disabled:opacity-50"
                          >
                            {item.label}
                          </button>
                        ),
                      )}
                      <button
                        type="button"
                        onClick={() => setViewingRequests(campaign)}
                        className="text-[12px] font-bold text-[#DCE4F8] hover:underline"
                      >
                        Yêu cầu
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(campaign)}
                        className="text-[12px] font-bold text-[#35FFB1] hover:underline"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(campaign)}
                        className="text-[12px] font-bold text-[#FF5C5C] hover:underline"
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal
        open={modalMode !== null}
        title={modalMode === 'create' ? 'Tạo campaign' : 'Sửa campaign'}
        description={
          modalMode === 'edit'
            ? 'Sản phẩm, season và slug không đổi được sau khi tạo.'
            : 'Campaign mới ở trạng thái DRAFT, cần Kích hoạt để hiển thị cho người dùng.'
        }
        onClose={() => setModalMode(null)}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setModalMode(null)}
              disabled={saving}
            >
              Huỷ
            </Button>
            <Button size="sm" onClick={() => void saveCampaign()} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </>
        }
      >
        {formError && (
          <p className="mb-3 text-[13px] text-[#FF5C5C]" role="alert">
            {formError}
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {modalMode === 'create' && (
            <>
              <AdminSelectField
                label="Sản phẩm"
                value={form.productId}
                onChange={(e) => setField('productId', e.target.value)}
                options={[
                  { label: 'Chọn sản phẩm', value: '' },
                  ...products.map((product) => ({ label: product.name, value: product.id })),
                ]}
              />
              <AdminSelectField
                label="Season"
                value={form.seasonId}
                onChange={(e) => setField('seasonId', e.target.value)}
                options={[
                  { label: 'Không gắn season', value: '' },
                  ...seasons.map((season) => ({ label: season.name, value: season.id })),
                ]}
              />
              <AdminField
                label="Slug"
                value={form.slug}
                onChange={(e) => setField('slug', e.target.value)}
              />
            </>
          )}
          <AdminField
            label="Tên campaign"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
          />
          <AdminField
            label="Số tài khoản tối đa mỗi mã"
            type="number"
            min={1}
            value={form.targetQuantity}
            onChange={(e) => setField('targetQuantity', e.target.value)}
          />
          <AdminField
            label="URL hình ảnh"
            value={form.imageUrl}
            onChange={(e) => setField('imageUrl', e.target.value)}
          />
          <AdminField
            label="Bắt đầu"
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => setField('startTime', e.target.value)}
          />
          <AdminField
            label="Kết thúc"
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => setField('endTime', e.target.value)}
          />
          <AdminTextAreaField
            className="md:col-span-2"
            label="Mô tả"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
          />
          <AdminTextAreaField
            className="md:col-span-2"
            label="Rewards (JSON object)"
            placeholder='{"milestone50": "Tặng 5 account"}'
            value={form.rewards}
            onChange={(e) => setField('rewards', e.target.value)}
          />
        </div>
      </AdminModal>

      {viewingRequests && (
        <AdminChungSucRequestsModal
          key={viewingRequests.id}
          campaign={viewingRequests}
          onClose={() => setViewingRequests(null)}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Xoá campaign"
        description={`Xoá campaign ${deleting?.name}?`}
        confirmLabel="Xoá"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
