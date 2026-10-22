import { useEffect, useState } from 'react';
import { adminCatalogApi } from '../../common/apis/adminApi';
import { adminChungSucApi, chungSucApi } from '../../common/apis/chungSucApi';
import type { AdminProductDto } from '../../common/models/admin';
import type {
  CampaignDto,
  CampaignLifecycleAction,
  CampaignStatus,
  CreateCampaignRequest,
  EventRules,
  EventVariant,
  EventVariantPresetDto,
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
import { EVENT_VARIANT_LABELS, describeEventRules } from '../../common/libs/eventRules';
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

// Khớp với bảng chuyển trạng thái của BE (chung-suc.service.ts).
// Kích hoạt / tạm dừng nằm ở công tắc Bật/Tắt (POST /campaigns/:id/toggle).
const LIFECYCLE_ACTIONS: Array<{
  action: CampaignLifecycleAction;
  label: string;
  from: CampaignStatus[];
}> = [
  { action: 'end', label: 'Kết thúc', from: ['UPCOMING', 'ACTIVE', 'PAUSED'] },
  {
    action: 'close',
    label: 'Đóng',
    from: ['DRAFT', 'UPCOMING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ENDED'],
  },
];

const RUNNING_STATUSES: CampaignStatus[] = ['ACTIVE', 'UPCOMING'];
const TOGGLEABLE_STATUSES: CampaignStatus[] = ['DRAFT', 'UPCOMING', 'ACTIVE', 'PAUSED'];

const VARIANTS: EventVariant[] = ['XAP_XINH', 'DOT_PHAO', 'TINH_HOA', 'BAN_BI', 'CUSTOM'];

type LimitField = Exclude<keyof EventRules, 'dailyReset'>;

const LIMIT_FIELDS: Array<{ field: LimitField; label: string; daily: boolean }> = [
  { field: 'ownerLimitPerDay', label: 'Mã mời nhận tối đa / ngày', daily: true },
  { field: 'ownerLimitTotal', label: 'Mã mời nhận tối đa / sự kiện', daily: false },
  { field: 'helperLimitPerDay', label: 'Acc hỗ trợ giúp tối đa / ngày', daily: true },
  { field: 'helperLimitTotal', label: 'Acc hỗ trợ giúp tối đa / sự kiện', daily: false },
  { field: 'pointsCap', label: 'Điểm tối đa mỗi mã', daily: false },
];

// Ô giới hạn để trống = không giới hạn (gửi null lên BE).
type RulesFormState = Record<LimitField, string> & { dailyReset: boolean };

function rulesToForm(rules: EventRules): RulesFormState {
  const text = (value: number | null) => (value === null ? '' : String(value));
  return {
    helperLimitPerDay: text(rules.helperLimitPerDay),
    helperLimitTotal: text(rules.helperLimitTotal),
    ownerLimitPerDay: text(rules.ownerLimitPerDay),
    ownerLimitTotal: text(rules.ownerLimitTotal),
    pointsCap: text(rules.pointsCap),
    dailyReset: rules.dailyReset,
  };
}

function formToRules(form: RulesFormState): EventRules {
  const limit = (value: string) => (value.trim() ? Number(value) : null);
  return {
    // Tắt reset thì giới hạn theo ngày không còn ý nghĩa: bỏ luôn.
    helperLimitPerDay: form.dailyReset ? limit(form.helperLimitPerDay) : null,
    helperLimitTotal: limit(form.helperLimitTotal),
    ownerLimitPerDay: form.dailyReset ? limit(form.ownerLimitPerDay) : null,
    ownerLimitTotal: limit(form.ownerLimitTotal),
    pointsCap: limit(form.pointsCap),
    dailyReset: form.dailyReset,
  };
}

interface CampaignFormState extends RulesFormState {
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
  eventCode: string;
  variant: EventVariant;
}

const emptyRules: EventRules = {
  helperLimitPerDay: null,
  helperLimitTotal: null,
  ownerLimitPerDay: null,
  ownerLimitTotal: null,
  pointsCap: null,
  dailyReset: false,
};

const emptyForm: CampaignFormState = {
  ...rulesToForm(emptyRules),
  eventCode: '',
  variant: 'CUSTOM',
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
    ...rulesToForm(campaign),
    eventCode: campaign.eventCode || '',
    variant: campaign.variant,
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
    eventCode: form.eventCode.trim() || null,
    variant: form.variant,
    ...formToRules(form),
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
    return 'Số tài khoản tối đa mỗi đơn phải là số nguyên từ 1 trở lên.';
  }
  if (form.eventCode.trim() && !/^[A-Z0-9_]{3,64}$/.test(form.eventCode.trim())) {
    return 'Mã sự kiện chỉ gồm A-Z, 0-9, dấu gạch dưới (3–64 ký tự), VD XAP_XINH_2026.';
  }
  for (const { field, label } of LIMIT_FIELDS) {
    const value = form[field].trim();
    if (value && (!Number.isInteger(Number(value)) || Number(value) < 1)) {
      return `${label}: nhập số nguyên từ 1 trở lên, hoặc để trống nếu không giới hạn.`;
    }
  }
  const rules = formToRules(form);
  if (
    rules.ownerLimitPerDay !== null &&
    rules.ownerLimitTotal !== null &&
    rules.ownerLimitPerDay > rules.ownerLimitTotal
  ) {
    return 'Giới hạn theo ngày của mã mời không được lớn hơn giới hạn toàn sự kiện.';
  }
  if (
    rules.helperLimitPerDay !== null &&
    rules.helperLimitTotal !== null &&
    rules.helperLimitPerDay > rules.helperLimitTotal
  ) {
    return 'Giới hạn theo ngày của acc hỗ trợ không được lớn hơn giới hạn toàn sự kiện.';
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

function ToggleSwitch({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-[#35FFB1]' : 'bg-white/15'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-[#07080D] transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function AdminChungSucPage() {
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
  const [seasons, setSeasons] = useState<SeasonDto[]>([]);
  const [products, setProducts] = useState<AdminProductDto[]>([]);
  const [presets, setPresets] = useState<EventVariantPresetDto[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const { loading, setLoading, error, setError, reloadKey, reload } = useAdminRequestState();

  const [editing, setEditing] = useState<CampaignDto | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<CampaignFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<CampaignDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      adminChungSucApi.campaigns(),
      adminChungSucApi.seasons(),
      adminCatalogApi.products({ pageSize: 100 }),
      chungSucApi.variantPresets(),
    ])
      .then(([campaignItems, seasonItems, productPage, presetItems]) => {
        if (!cancelled) {
          setCampaigns(campaignItems);
          setSeasons(seasonItems);
          setProducts(productPage.items);
          setPresets(presetItems);
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

  const toggleCampaign = async (campaign: CampaignDto) => {
    setBusyId(campaign.id);
    try {
      const updated = await adminChungSucApi.toggleCampaign(campaign.id);
      // Cập nhật tại chỗ để công tắc đổi ngay, không tải lại cả bảng.
      setCampaigns((items) =>
        items.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Không thể bật/tắt campaign.'));
    } finally {
      setBusyId(null);
    }
  };

  // Chọn biến thể thì điền luật mặc định của biến thể đó; admin vẫn sửa tiếp được.
  const applyVariant = (variant: EventVariant) => {
    const preset = presets.find((item) => item.variant === variant);
    setForm((current) => ({
      ...current,
      variant,
      ...(preset ? rulesToForm(preset) : {}),
    }));
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

  const setField = (field: keyof CampaignFormState, value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  const selectedPreset = presets.find((item) => item.variant === form.variant);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-white">Chung sức</h1>
          <p className="mt-1 text-[13px] text-[#94A3B8]">
            Cấu hình luật từng mùa sự kiện, bật/tắt campaign và điều khiển vòng đời.
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
          <table className="w-full min-w-[1080px] text-left text-[13px]">
            <thead className="border-b border-white/10 bg-[#0B1020] text-[11px] uppercase tracking-wider text-[#566079]">
              <tr>
                <th className="px-4 py-3 font-semibold">Campaign</th>
                <th className="px-4 py-3 font-semibold">Sự kiện</th>
                <th className="px-4 py-3 font-semibold">Luật</th>
                <th className="px-4 py-3 font-semibold">Thời gian</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Bật/Tắt</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="text-[#DCE4F8]">{campaign.name}</div>
                    <div className="font-mono text-[11px] text-[#566079]">{campaign.slug}</div>
                    {campaign.season && (
                      <div className="text-[11px] text-[#566079]">Season: {campaign.season.name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[#DCE4F8]">{EVENT_VARIANT_LABELS[campaign.variant]}</div>
                    <div className="font-mono text-[11px] text-[#566079]">
                      {campaign.eventCode || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#94A3B8]">
                    <div>
                      Tối đa / đơn:{' '}
                      <span className="font-mono text-[#DCE4F8]">{campaign.targetQuantity}</span>
                    </div>
                    {describeEventRules(campaign).map((item) => (
                      <div key={item.label}>
                        {item.label}: <span className="text-[#DCE4F8]">{item.value}</span>
                      </div>
                    ))}
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
                    {TOGGLEABLE_STATUSES.includes(campaign.status) ? (
                      <ToggleSwitch
                        checked={RUNNING_STATUSES.includes(campaign.status)}
                        disabled={busyId === campaign.id}
                        label={`Bật/tắt ${campaign.name}`}
                        onChange={() => void toggleCampaign(campaign)}
                      />
                    ) : (
                      <span className="text-[11px] text-[#566079]">Đã kết thúc</span>
                    )}
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
            label="Số tài khoản tối đa mỗi đơn"
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
          <fieldset className="md:col-span-2 rounded-xl border border-white/10 p-3">
            <legend className="px-1 font-mono text-[10px] font-extrabold uppercase tracking-[1.3px] text-[#94A3B8]">
              Luật sự kiện
            </legend>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <AdminSelectField
                label="Biến thể sự kiện"
                value={form.variant}
                onChange={(e) => applyVariant(e.target.value as EventVariant)}
                options={VARIANTS.map((variant) => ({
                  label: EVENT_VARIANT_LABELS[variant],
                  value: variant,
                }))}
              />
              <AdminField
                label="Mã sự kiện"
                placeholder="XAP_XINH_2026"
                value={form.eventCode}
                onChange={(e) => setField('eventCode', e.target.value.toUpperCase())}
              />
              {selectedPreset && (
                <p className="md:col-span-2 text-[12px] text-[#94A3B8]">
                  {selectedPreset.description} Đổi biến thể sẽ điền lại luật mặc định bên dưới.
                </p>
              )}
              <label className="md:col-span-2 flex items-center gap-2 text-[13px] text-[#DCE4F8]">
                <input
                  type="checkbox"
                  checked={form.dailyReset}
                  onChange={(e) => setField('dailyReset', e.target.checked)}
                  className="h-4 w-4 accent-[#0EA5FF]"
                />
                Reset lượt lúc 00:00 mỗi ngày (giờ Việt Nam)
              </label>
              {LIMIT_FIELDS.filter((item) => form.dailyReset || !item.daily).map((item) => (
                <AdminField
                  key={item.field}
                  label={item.label}
                  type="number"
                  min={1}
                  placeholder="Không giới hạn"
                  value={form[item.field]}
                  onChange={(e) => setField(item.field, e.target.value)}
                />
              ))}
            </div>
          </fieldset>
          <AdminTextAreaField
            className="md:col-span-2"
            label="Rewards (JSON object)"
            placeholder='{"milestone50": "Tặng 5 account"}'
            value={form.rewards}
            onChange={(e) => setField('rewards', e.target.value)}
          />
        </div>
      </AdminModal>

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
