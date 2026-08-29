import { useEffect, useState } from 'react';
import { adminCommerceApi } from '../../common/apis/adminApi';
import type {
  AdminVoucherDto,
  CreateVoucherRequest,
  DiscountType,
  UpdateVoucherRequest,
} from '../../common/models/admin';
import {
  fromDateTimeLocal,
  getAdminErrorMessage,
  optionalString,
  toDateTimeLocal,
} from '../../common/libs/adminForm';
import { formatCurrency, formatDateTime } from '../../common/libs/formatter';
import { booleanTone } from '../../common/libs/adminStatus';
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
const DISCOUNT_TYPES: DiscountType[] = ['PERCENTAGE', 'FIXED_AMOUNT'];

interface VoucherFormState {
  code: string;
  name: string;
  discountType: DiscountType;
  discountValue: string;
  minimumOrderAmount: string;
  maximumDiscountAmount: string;
  usageLimit: string;
  perAccountLimit: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

const emptyForm: VoucherFormState = {
  code: '',
  name: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minimumOrderAmount: '',
  maximumDiscountAmount: '',
  usageLimit: '100',
  perAccountLimit: '1',
  startsAt: '',
  endsAt: '',
  isActive: true,
};

function toForm(voucher: AdminVoucherDto): VoucherFormState {
  return {
    code: voucher.code,
    name: voucher.name,
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    minimumOrderAmount: voucher.minimumOrderAmount || '',
    maximumDiscountAmount: voucher.maximumDiscountAmount || '',
    usageLimit: String(voucher.usageLimit),
    perAccountLimit: String(voucher.perAccountLimit),
    startsAt: toDateTimeLocal(voucher.startsAt),
    endsAt: toDateTimeLocal(voucher.endsAt),
    isActive: voucher.isActive,
  };
}

function toCreatePayload(form: VoucherFormState): CreateVoucherRequest {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    discountType: form.discountType,
    discountValue: form.discountValue.trim(),
    minimumOrderAmount: optionalString(form.minimumOrderAmount),
    maximumDiscountAmount: optionalString(form.maximumDiscountAmount),
    usageLimit: Number(form.usageLimit),
    perAccountLimit: Number(form.perAccountLimit),
    startsAt: fromDateTimeLocal(form.startsAt) || form.startsAt,
    endsAt: fromDateTimeLocal(form.endsAt) || form.endsAt,
    isActive: form.isActive,
  };
}

function toUpdatePayload(form: VoucherFormState): UpdateVoucherRequest {
  return toCreatePayload(form);
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<AdminVoucherDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const { loading, setLoading, error, setError, reloadKey, beginRequest, reload } =
    useAdminRequestState();

  const [selected, setSelected] = useState<AdminVoucherDto | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'detail' | null>(null);
  const [form, setForm] = useState<VoucherFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<AdminVoucherDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminCommerceApi
      .vouchers({ page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (!cancelled) {
          setVouchers(res.items);
          setTotalPages(res.totalPages);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getAdminErrorMessage(err, 'Cannot load vouchers.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey, setError, setLoading]);

  const changePage = (nextPage: number) => {
    if (nextPage === page) return;
    beginRequest();
    setPage(nextPage);
  };

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setModalMode('create');
  };

  const openVoucher = async (voucher: AdminVoucherDto, mode: 'detail' | 'edit') => {
    setSelected(voucher);
    setForm(toForm(voucher));
    setModalMode(mode);
    try {
      const res = await adminCommerceApi.voucher(voucher.id);
      setSelected(res.voucher);
      setForm(toForm(res.voucher));
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot load voucher detail.'));
    }
  };

  const saveVoucher = async () => {
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await adminCommerceApi.createVoucher(toCreatePayload(form));
      } else if (modalMode === 'edit' && selected) {
        await adminCommerceApi.updateVoucher(selected.id, toUpdatePayload(form));
      }
      setModalMode(null);
      reload();
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot save voucher.'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await adminCommerceApi.deleteVoucher(deleting.id);
      setDeleting(null);
      reload();
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot delete voucher.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-white">Vouchers</h1>
          <p className="mt-1 text-[13px] text-[#94A3B8]">
            List, detail, create, update and delete vouchers.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          Create voucher
        </Button>
      </header>

      {error && <AdminError message={error} onRetry={reload} />}

      {loading ? (
        <AdminLoading />
      ) : vouchers.length === 0 ? (
        <AdminEmpty title="No vouchers" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[920px] text-left text-[13px]">
            <thead className="border-b border-white/10 bg-[#0B1020] text-[11px] uppercase tracking-wider text-[#566079]">
              <tr>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Value</th>
                <th className="px-4 py-3 font-semibold">Used</th>
                <th className="px-4 py-3 font-semibold">Window</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-[12px] text-[#DCE4F8]">{voucher.code}</td>
                  <td className="px-4 py-3 text-[#DCE4F8]">{voucher.name}</td>
                  <td className="px-4 py-3 text-[#94A3B8]">{voucher.discountType}</td>
                  <td className="px-4 py-3 font-mono text-[#DCE4F8]">
                    {voucher.discountType === 'PERCENTAGE'
                      ? `${voucher.discountValue}%`
                      : formatCurrency(voucher.discountValue)}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">
                    {voucher.usedCount}/{voucher.usageLimit}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">
                    {formatDateTime(voucher.startsAt)} to {formatDateTime(voucher.endsAt)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={booleanTone(voucher.isActive)}
                      label={voucher.isActive ? 'active' : 'inactive'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => void openVoucher(voucher, 'detail')} className="text-[12px] font-bold text-[#0EA5FF] hover:underline">
                        View
                      </button>
                      <button type="button" onClick={() => void openVoucher(voucher, 'edit')} className="text-[12px] font-bold text-[#35FFB1] hover:underline">
                        Edit
                      </button>
                      <button type="button" onClick={() => setDeleting(voucher)} className="text-[12px] font-bold text-[#FF5C5C] hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={changePage} />

      <AdminModal
        open={modalMode !== null}
        title={modalMode === 'create' ? 'Create voucher' : modalMode === 'edit' ? 'Edit voucher' : 'Voucher detail'}
        onClose={() => setModalMode(null)}
        footer={
          modalMode === 'detail' ? undefined : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setModalMode(null)} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => void saveVoucher()} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )
        }
      >
        {modalMode === 'detail' && selected ? (
          <AdminDetailGrid
            items={[
              { label: 'ID', value: selected.id },
              { label: 'Code', value: selected.code },
              { label: 'Name', value: selected.name },
              { label: 'Type', value: selected.discountType },
              { label: 'Value', value: selected.discountValue },
              { label: 'Minimum order', value: selected.minimumOrderAmount },
              { label: 'Maximum discount', value: selected.maximumDiscountAmount },
              { label: 'Usage', value: `${selected.usedCount}/${selected.usageLimit}` },
              { label: 'Per account limit', value: selected.perAccountLimit },
              { label: 'Starts', value: formatDateTime(selected.startsAt) },
              { label: 'Ends', value: formatDateTime(selected.endsAt) },
              { label: 'Active', value: selected.isActive ? 'yes' : 'no' },
            ]}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <AdminField label="Code" value={form.code} onChange={(e) => setForm((current) => ({ ...current, code: e.target.value }))} />
            <AdminField label="Name" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
            <AdminSelectField label="Discount type" value={form.discountType} onChange={(e) => setForm((current) => ({ ...current, discountType: e.target.value as DiscountType }))} options={DISCOUNT_TYPES.map((type) => ({ label: type, value: type }))} />
            <AdminField label="Discount value" value={form.discountValue} onChange={(e) => setForm((current) => ({ ...current, discountValue: e.target.value }))} />
            <AdminField label="Minimum order" value={form.minimumOrderAmount} onChange={(e) => setForm((current) => ({ ...current, minimumOrderAmount: e.target.value }))} />
            <AdminField label="Maximum discount" value={form.maximumDiscountAmount} onChange={(e) => setForm((current) => ({ ...current, maximumDiscountAmount: e.target.value }))} />
            <AdminField label="Usage limit" value={form.usageLimit} onChange={(e) => setForm((current) => ({ ...current, usageLimit: e.target.value }))} />
            <AdminField label="Per account limit" value={form.perAccountLimit} onChange={(e) => setForm((current) => ({ ...current, perAccountLimit: e.target.value }))} />
            <AdminField label="Starts at" type="datetime-local" value={form.startsAt} onChange={(e) => setForm((current) => ({ ...current, startsAt: e.target.value }))} />
            <AdminField label="Ends at" type="datetime-local" value={form.endsAt} onChange={(e) => setForm((current) => ({ ...current, endsAt: e.target.value }))} />
            <label className="flex items-center gap-2 pt-6 text-[13px] text-[#DCE4F8]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((current) => ({ ...current, isActive: e.target.checked }))}
              />
              Active
            </label>
          </div>
        )}
      </AdminModal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete voucher"
        description={`Delete voucher ${deleting?.code}?`}
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
