import { useEffect, useState } from 'react';
import { adminIdentityApi } from '../../common/apis/adminApi';
import type {
  AccountStatus,
  AdminAccountDto,
  AdminAccountQuery,
  AdminRoleDto,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../../common/models/admin';
import { getAdminErrorMessage, optionalString } from '../../common/libs/adminForm';
import { formatDateTime } from '../../common/libs/formatter';
import { accountStatusTone, labelFromStatus } from '../../common/libs/adminStatus';
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
const ACCOUNT_STATUSES: AccountStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

interface AccountFormState {
  email: string;
  password: string;
  roleCode: string;
  displayName: string;
  phone: string;
  status: AccountStatus;
}

const emptyForm: AccountFormState = {
  email: '',
  password: '',
  roleCode: 'USER',
  displayName: '',
  phone: '',
  status: 'ACTIVE',
};

function toForm(account: AdminAccountDto): AccountFormState {
  return {
    email: account.email,
    password: '',
    roleCode: account.role?.code || 'USER',
    displayName: account.name || '',
    phone: account.phone || '',
    status: account.status,
  };
}

function toCreatePayload(form: AccountFormState): CreateAccountRequest {
  return {
    email: form.email.trim(),
    password: form.password,
    roleCode: form.roleCode,
    displayName: optionalString(form.displayName),
    phone: optionalString(form.phone),
    status: form.status,
  };
}

function toUpdatePayload(form: AccountFormState): UpdateAccountRequest {
  return {
    email: optionalString(form.email),
    password: optionalString(form.password),
    roleCode: optionalString(form.roleCode),
    displayName: optionalString(form.displayName),
    phone: optionalString(form.phone),
    status: form.status,
  };
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AdminAccountDto[]>([]);
  const [roles, setRoles] = useState<AdminRoleDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | ''>('');
  const { loading, setLoading, error, setError, reloadKey, beginRequest, reload } =
    useAdminRequestState();

  const [selected, setSelected] = useState<AdminAccountDto | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'detail' | null>(null);
  const [form, setForm] = useState<AccountFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<AdminAccountDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void adminIdentityApi.roles().then((res) => {
      if (!cancelled) setRoles(res.roles);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const query: AdminAccountQuery = { page, pageSize: PAGE_SIZE };
    if (appliedSearch) query.search = appliedSearch;
    if (roleFilter) query.role = roleFilter;
    if (statusFilter) query.status = statusFilter;

    adminIdentityApi
      .accounts(query)
      .then((res) => {
        if (!cancelled) {
          setAccounts(res.items);
          setTotalPages(res.totalPages);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getAdminErrorMessage(err, 'Cannot load accounts.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [appliedSearch, page, reloadKey, roleFilter, setError, setLoading, statusFilter]);

  const applyFilters = () => {
    beginRequest();
    setPage(1);
    setAppliedSearch(search.trim());
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

  const openAccount = async (account: AdminAccountDto, mode: 'detail' | 'edit') => {
    setModalMode(mode);
    setSelected(account);
    setForm(toForm(account));
    try {
      const res = await adminIdentityApi.account(account.id);
      setSelected(res.account);
      setForm(toForm(res.account));
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot load account detail.'));
    }
  };

  const saveAccount = async () => {
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await adminIdentityApi.createAccount(toCreatePayload(form));
      } else if (modalMode === 'edit' && selected) {
        await adminIdentityApi.updateAccount(selected.id, toUpdatePayload(form));
      }
      setModalMode(null);
      reload();
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot save account.'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await adminIdentityApi.deleteAccount(deleting.id);
      setDeleting(null);
      reload();
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot delete account.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const roleOptions = [
    { label: 'All roles', value: '' },
    ...roles.map((role) => ({ label: role.code, value: role.code })),
  ];

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-white">Accounts</h1>
          <p className="mt-1 text-[13px] text-[#94A3B8]">
            List, detail, roles, create, update and soft delete accounts.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          Create account
        </Button>
      </header>

      <section className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-[#0B1020] p-4 md:grid-cols-4">
        <AdminField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          placeholder="email or name"
        />
        <AdminSelectField
          label="Role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={roleOptions}
        />
        <AdminSelectField
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AccountStatus | '')}
          options={[
            { label: 'All statuses', value: '' },
            ...ACCOUNT_STATUSES.map((status) => ({ label: status, value: status })),
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
      ) : accounts.length === 0 ? (
        <AdminEmpty title="No accounts" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[860px] text-left text-[13px]">
            <thead className="border-b border-white/10 bg-[#0B1020] text-[11px] uppercase tracking-wider text-[#566079]">
              <tr>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Last login</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-[#DCE4F8]">{account.email}</td>
                  <td className="px-4 py-3 text-[#DCE4F8]">{account.name || '-'}</td>
                  <td className="px-4 py-3 text-[#DCE4F8]">{account.role?.code || '-'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={accountStatusTone(account.status)}
                      label={labelFromStatus(account.status)}
                    />
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">
                    {account.lastLoginAt ? formatDateTime(account.lastLoginAt) : '-'}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">{formatDateTime(account.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => void openAccount(account, 'detail')}
                        className="text-[12px] font-bold text-[#0EA5FF] hover:underline"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => void openAccount(account, 'edit')}
                        className="text-[12px] font-bold text-[#35FFB1] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(account)}
                        className="text-[12px] font-bold text-[#FF5C5C] hover:underline"
                      >
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
        title={modalMode === 'create' ? 'Create account' : modalMode === 'edit' ? 'Edit account' : 'Account detail'}
        onClose={() => setModalMode(null)}
        footer={
          modalMode === 'detail' ? undefined : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setModalMode(null)} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => void saveAccount()} disabled={saving}>
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
              { label: 'Email', value: selected.email },
              { label: 'Name', value: selected.name },
              { label: 'Phone', value: selected.phone },
              { label: 'Role', value: selected.role?.code },
              { label: 'Status', value: selected.status },
              { label: 'Last login', value: selected.lastLoginAt ? formatDateTime(selected.lastLoginAt) : null },
              { label: 'Updated', value: formatDateTime(selected.updatedAt) },
            ]}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <AdminField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
            />
            <AdminField
              label={modalMode === 'create' ? 'Password' : 'New password'}
              type="password"
              value={form.password}
              onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
              placeholder={modalMode === 'edit' ? 'leave blank to keep current' : undefined}
            />
            <AdminSelectField
              label="Role"
              value={form.roleCode}
              onChange={(e) => setForm((current) => ({ ...current, roleCode: e.target.value }))}
              options={roles.map((role) => ({ label: role.code, value: role.code }))}
            />
            <AdminSelectField
              label="Status"
              value={form.status}
              onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as AccountStatus }))}
              options={ACCOUNT_STATUSES.map((status) => ({ label: status, value: status }))}
            />
            <AdminField
              label="Display name"
              value={form.displayName}
              onChange={(e) => setForm((current) => ({ ...current, displayName: e.target.value }))}
            />
            <AdminField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
            />
          </div>
        )}
      </AdminModal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete account"
        description={`Soft delete account ${deleting?.email}?`}
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
