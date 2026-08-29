import { useEffect, useState } from 'react';
import { adminInventoryApi } from '../../common/apis/adminApi';
import type {
  AdminInventoryItemDto,
  AdminInventoryQuery,
  CreateInventoryItemRequest,
  InventoryStatus,
  UpdateInventoryItemRequest,
} from '../../common/models/admin';
import {
  getAdminErrorMessage,
  parseJsonRecord,
  stringifyJson,
} from '../../common/libs/adminForm';
import { formatDateTime } from '../../common/libs/formatter';
import { inventoryStatusTone, labelFromStatus } from '../../common/libs/adminStatus';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { Pagination } from '../../components/Pagination/Pagination';
import { AdminEmpty, AdminError, AdminLoading } from '../../components/AdminState/AdminState';
import { Button } from '../../components/Button/Button';
import { AdminModal } from '../../components/AdminModal/AdminModal';
import {
  AdminDetailGrid,
  AdminField,
  AdminSelectField,
  AdminTextAreaField,
} from '../../components/AdminForm/AdminForm';
import { useAdminRequestState } from '../../hooks/useAdminRequestState';

const PAGE_SIZE = 20;
const INVENTORY_STATUSES: InventoryStatus[] = ['AVAILABLE', 'RESERVED', 'SOLD', 'VOID'];

interface InventoryFormState {
  productVariantId: string;
  status: InventoryStatus;
  payload: string;
  metadata: string;
}

const emptyForm: InventoryFormState = {
  productVariantId: '',
  status: 'AVAILABLE',
  payload: '{\n  "account": "",\n  "password": ""\n}',
  metadata: '',
};

function itemToForm(item: AdminInventoryItemDto): InventoryFormState {
  return {
    productVariantId: item.productVariantId,
    status: item.status,
    payload: '',
    metadata: stringifyJson(item.metadata),
  };
}

function toCreatePayload(form: InventoryFormState): CreateInventoryItemRequest {
  const payload = parseJsonRecord(form.payload, 'payload');
  if (!payload) throw new Error('payload is required.');
  return {
    productVariantId: form.productVariantId.trim(),
    payload,
    metadata: parseJsonRecord(form.metadata, 'metadata'),
  };
}

function toUpdatePayload(form: InventoryFormState): UpdateInventoryItemRequest {
  return {
    productVariantId: form.productVariantId.trim() || undefined,
    status: form.status,
    payload: parseJsonRecord(form.payload, 'payload'),
    metadata: parseJsonRecord(form.metadata, 'metadata'),
  };
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<AdminInventoryItemDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | ''>('');
  const [variantFilter, setVariantFilter] = useState('');
  const [appliedVariantFilter, setAppliedVariantFilter] = useState('');
  const { loading, setLoading, error, setError, reloadKey, beginRequest, reload } =
    useAdminRequestState();

  const [selected, setSelected] = useState<AdminInventoryItemDto | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'detail' | null>(null);
  const [form, setForm] = useState<InventoryFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const query: AdminInventoryQuery = { page, pageSize: PAGE_SIZE };
    if (statusFilter) query.status = statusFilter;
    if (appliedVariantFilter) query.productVariantId = appliedVariantFilter;

    adminInventoryApi
      .items(query)
      .then((res) => {
        if (!cancelled) {
          setItems(res.items);
          setTotalPages(res.totalPages);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getAdminErrorMessage(err, 'Cannot load inventory.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [appliedVariantFilter, page, reloadKey, setError, setLoading, statusFilter]);

  const applyFilters = () => {
    beginRequest();
    setPage(1);
    setAppliedVariantFilter(variantFilter.trim());
    reload();
  };

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

  const openItem = async (item: AdminInventoryItemDto, mode: 'detail' | 'edit') => {
    setSelected(item);
    setForm(itemToForm(item));
    setModalMode(mode);
    try {
      const detail = await adminInventoryApi.item(item.id);
      setSelected(detail);
      setForm(itemToForm(detail));
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot load inventory detail.'));
    }
  };

  const saveItem = async () => {
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await adminInventoryApi.create(toCreatePayload(form));
      } else if (modalMode === 'edit' && selected) {
        await adminInventoryApi.update(selected.id, toUpdatePayload(form));
      }
      setModalMode(null);
      reload();
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot save inventory item.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-white">Inventory</h1>
          <p className="mt-1 text-[13px] text-[#94A3B8]">
            List, detail, create and update inventory items.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          Create inventory
        </Button>
      </header>

      <section className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-[#0B1020] p-4 md:grid-cols-3">
        <AdminField
          label="Variant ID"
          value={variantFilter}
          onChange={(e) => setVariantFilter(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
        <AdminSelectField
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InventoryStatus | '')}
          options={[
            { label: 'All statuses', value: '' },
            ...INVENTORY_STATUSES.map((status) => ({ label: status, value: status })),
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
      ) : items.length === 0 ? (
        <AdminEmpty title="No inventory items" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="border-b border-white/10 bg-[#0B1020] text-[11px] uppercase tracking-wider text-[#566079]">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Variant ID</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Order item</th>
                <th className="px-4 py-3 font-semibold">Sold at</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-[11px] text-[#94A3B8]">{item.id}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#94A3B8]">
                    {item.productVariantId}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={inventoryStatusTone(item.status)}
                      label={labelFromStatus(item.status)}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#94A3B8]">
                    {item.orderItemId || '-'}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">
                    {item.soldAt ? formatDateTime(item.soldAt) : '-'}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">{formatDateTime(item.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => void openItem(item, 'detail')} className="text-[12px] font-bold text-[#0EA5FF] hover:underline">
                        View
                      </button>
                      <button type="button" onClick={() => void openItem(item, 'edit')} className="text-[12px] font-bold text-[#35FFB1] hover:underline">
                        Edit
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
        title={modalMode === 'create' ? 'Create inventory item' : modalMode === 'edit' ? 'Edit inventory item' : 'Inventory detail'}
        onClose={() => setModalMode(null)}
        footer={
          modalMode === 'detail' ? undefined : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setModalMode(null)} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => void saveItem()} disabled={saving}>
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
              { label: 'Variant ID', value: selected.productVariantId },
              { label: 'Status', value: selected.status },
              { label: 'Order item ID', value: selected.orderItemId },
              { label: 'Reserved until', value: selected.reservedUntil ? formatDateTime(selected.reservedUntil) : null },
              { label: 'Sold at', value: selected.soldAt ? formatDateTime(selected.soldAt) : null },
              { label: 'Metadata', value: stringifyJson(selected.metadata) },
              { label: 'Updated', value: formatDateTime(selected.updatedAt) },
            ]}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <AdminField
              label="Product variant ID"
              value={form.productVariantId}
              onChange={(e) => setForm((current) => ({ ...current, productVariantId: e.target.value }))}
            />
            <AdminSelectField
              label="Status"
              value={form.status}
              onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as InventoryStatus }))}
              options={INVENTORY_STATUSES.map((status) => ({ label: status, value: status }))}
            />
            <AdminTextAreaField
              className="md:col-span-2"
              label={modalMode === 'create' ? 'Payload JSON' : 'Payload JSON, optional'}
              value={form.payload}
              onChange={(e) => setForm((current) => ({ ...current, payload: e.target.value }))}
            />
            <AdminTextAreaField
              className="md:col-span-2"
              label="Metadata JSON, optional"
              value={form.metadata}
              onChange={(e) => setForm((current) => ({ ...current, metadata: e.target.value }))}
            />
          </div>
        )}
      </AdminModal>
    </div>
  );
}
