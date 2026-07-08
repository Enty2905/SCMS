import {
  AlertTriangle,
  Lock,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Unlock,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'

import {
  selectEmployeesWithoutAccount,
  selectUserAccountError,
  selectUserAccountLoading,
  selectUserAccountSaving,
  selectUserAccounts,
  selectUserAccountSuccessMessage,
} from '../store/user-account.selectors.js'
import {
  createUserAccount,
  deleteUserAccount,
  fetchUserAccountPageData,
  updateUserAccountStatus,
} from '../store/user-account.thunks.js'

const emptyForm = {
  employeeId: '',
  username: '',
  password: '',
}

const roleLabels = {
  ADMIN: 'Quản trị viên',
  HR: 'Nhân sự',
  NHAN_SU: 'Nhân sự',
  OPS_MANAGER: 'Quản đốc vận hành',
  REPAIR_MANAGER: 'Quản đốc sửa chữa',
  SHIFT_LEADER: 'Trưởng ca',
  TEAM_LEADER: 'Tổ trưởng sửa chữa',
  WAREHOUSE_MAT: 'Thủ kho vật tư',
  WAREHOUSE_TOOL: 'Thủ kho CCDC',
  USER: 'Người dùng',
}

function getAccountRoles(account) {
  return account.roles?.length ? account.roles : []
}

function getRoleLabel(role) {
  return role.roleName || roleLabels[role.roleCode] || role.roleCode || 'Người dùng'
}

function AccountRoleBadges({ account }) {
  const roles = getAccountRoles(account)

  if (!roles.length) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
        Chưa phân quyền
      </span>
    )
  }

  return roles.map((role) => (
    <span
      className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700"
      key={role.roleCode || role.roleId}
    >
      {getRoleLabel(role)}
    </span>
  ))
}

function ConfirmAccountActionModal({ action, saving, onClose, onConfirm }) {
  if (!action) return null

  const isDelete = action.type === 'delete'
  const isLock = action.type === 'lock'
  const title = isDelete
    ? 'Xác nhận xóa tài khoản'
    : isLock
      ? 'Xác nhận khóa tài khoản'
      : 'Xác nhận mở khóa tài khoản'
  const description = isDelete
    ? 'Tài khoản sẽ được vô hiệu hóa và vẫn được giữ trong dữ liệu hệ thống.'
    : isLock
      ? 'Người dùng sẽ không thể đăng nhập cho đến khi tài khoản được mở khóa.'
      : 'Người dùng sẽ có thể đăng nhập lại sau khi tài khoản được mở khóa.'
  const confirmLabel = isDelete ? 'Xóa ' : isLock ? 'Khóa tài khoản' : 'Mở khóa'
  const confirmClass =
    isDelete || isLock ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">Tác vụ quản lý tài khoản</p>
          </div>
          <button
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            disabled={saving}
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="flex gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-700">
                Bạn đang thao tác với tài khoản{' '}
                <strong className="text-slate-950">{action.account.username}</strong>.
              </p>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button disabled={saving} onClick={onClose} variant="secondary">
              Hủy
            </Button>
            <Button className={confirmClass} disabled={saving} onClick={onConfirm}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : null}
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function UserAccountsPage() {
  const dispatch = useDispatch()
  const accounts = useSelector(selectUserAccounts)
  const employeesWithoutAccount = useSelector(selectEmployeesWithoutAccount)
  const loading = useSelector(selectUserAccountLoading)
  const saving = useSelector(selectUserAccountSaving)
  const error = useSelector(selectUserAccountError)
  const successMessage = useSelector(selectUserAccountSuccessMessage)
  const [form, setForm] = useState(emptyForm)
  const [query, setQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  const filteredAccounts = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    if (!keyword) {
      return accounts
    }

    return accounts.filter((account) => {
      const matchesText =
        account.username?.toLowerCase().includes(keyword) ||
        account.employeeName?.toLowerCase().includes(keyword) ||
        account.departmentName?.toLowerCase().includes(keyword)
      const matchesRole = getAccountRoles(account).some((role) =>
        [role.roleCode, role.roleName].some((value) => value?.toLowerCase().includes(keyword)),
      )

      return matchesText || matchesRole
    })
  }, [accounts, query])

  useEffect(() => {
    dispatch(fetchUserAccountPageData())
  }, [dispatch])

  async function handleSubmit(event) {
    event.preventDefault()

    const result = await dispatch(createUserAccount(form))

    if (createUserAccount.fulfilled.match(result)) {
      setForm(emptyForm)
      setShowCreateForm(false)
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function openStatusConfirm(account) {
    setConfirmAction({
      type: account.active ? 'lock' : 'unlock',
      account,
    })
  }

  function openDeleteConfirm(account) {
    setConfirmAction({ type: 'delete', account })
  }

  async function handleConfirmAction() {
    if (!confirmAction) {
      return
    }

    const { account, type } = confirmAction
    const result =
      type === 'delete'
        ? await dispatch(deleteUserAccount(account.userId))
        : await dispatch(
            updateUserAccountStatus({
              userId: account.userId,
              active: type === 'unlock',
            }),
          )

    if (
      deleteUserAccount.fulfilled.match(result) ||
      updateUserAccountStatus.fulfilled.match(result)
    ) {
      setConfirmAction(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Quản lý tài khoản</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cấp tài khoản cho nhân viên và khóa quyền truy cập khi cần.
          </p>
        </div>
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={() => setShowCreateForm((value) => !value)}
        >
          <Plus size={17} />
          Cấp tài khoản
        </Button>
      </section>

      <section className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative max-w-xl flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên đăng nhập, họ tên hoặc vai trò..."
            value={query}
          />
        </label>
      </section>

      {showCreateForm ? (
        <form
          className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Nhân viên
              <select
                className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                onChange={(event) => updateField('employeeId', event.target.value)}
                required
                value={form.employeeId}
              >
                <option value="">Chọn nhân viên</option>
                {employeesWithoutAccount.map((employee) => (
                  <option key={employee.employeeId} value={employee.employeeId}>
                    {employee.employeeName}
                    {employee.departmentName ? ` - ${employee.departmentName}` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Tên đăng nhập
              <input
                className="h-11 rounded-md border border-slate-200 px-3 text-sm font-normal outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                onChange={(event) => updateField('username', event.target.value)}
                placeholder="vd: nguyenvana"
                required
                value={form.username}
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Mật khẩu tạm
              <input
                className="h-11 rounded-md border border-slate-200 px-3 text-sm font-normal outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                minLength={6}
                onChange={(event) => updateField('password', event.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
                type="password"
                value={form.password}
              />
            </label>

            <Button
              className="bg-violet-600 hover:bg-violet-700"
              disabled={saving || !employeesWithoutAccount.length}
              type="submit"
            >
              <ShieldCheck size={17} />
              Lưu
            </Button>
          </div>

          {error ? (
            <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </p>
          ) : null}
          {successMessage ? (
            <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {successMessage}
            </p>
          ) : null}
          {!employeesWithoutAccount.length ? (
            <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              Hiện chưa có nhân viên nào chưa được cấp tài khoản.
            </p>
          ) : null}
        </form>
      ) : null}

      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Tên đăng nhập</th>
                <th className="px-5 py-3 font-semibold">Nhân viên</th>
                <th className="px-5 py-3 font-semibold">Phòng ban</th>
                <th className="px-5 py-3 font-semibold">Vai trò</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold">Ngày tạo</th>
                <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={7}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && !filteredAccounts.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={7}>
                    Chưa có tài khoản phù hợp.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? filteredAccounts.map((account) => (
                    <tr className="hover:bg-slate-50/80" key={account.userId}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid size-8 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                            {account.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="font-semibold text-slate-950">{account.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {account.employeeName || 'Chưa gắn nhân viên'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {account.phone || account.workLocation || 'Chưa cập nhật'}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {account.departmentName || 'Chưa cập nhật'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <AccountRoleBadges account={account} />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
                            account.active
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-600',
                          ].join(' ')}
                        >
                          {account.active ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(account.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            className={[
                              'inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-bold transition',
                              account.active
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                            ].join(' ')}
                            disabled={saving}
                            onClick={() => openStatusConfirm(account)}
                            type="button"
                          >
                            {account.active ? <Lock size={16} /> : <Unlock size={16} />}
                            {account.active ? 'Khóa' : 'Mở khóa'}
                          </button>
                          <button
                            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                            disabled={saving}
                            onClick={() => openDeleteConfirm(account)}
                            type="button"
                          >
                            <Trash2 size={16} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmAccountActionModal
        action={confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        saving={saving}
      />
    </div>
  )
}

function formatDate(value) {
  if (!value) {
    return 'Chưa cập nhật'
  }

  return new Intl.DateTimeFormat('vi-VN').format(new Date(value))
}
