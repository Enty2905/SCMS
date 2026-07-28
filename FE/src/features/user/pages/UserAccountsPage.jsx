import {
  AlertTriangle,
  KeyRound,
  Lock,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Unlock,
  UserRoundCog,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'
import { Pagination } from '@/shared/components/ui/Pagination.jsx'

import {
  selectAssignableRoles,
  selectEmployeesWithoutAccount,
  selectUserAccountDepartments,
  selectUserAccountError,
  selectUserAccountFilters,
  selectUserAccountLoading,
  selectUserAccountPagination,
  selectUserAccountSaving,
  selectUserAccounts,
  selectUserAccountSuccessMessage,
} from '../store/user-account.selectors.js'
import {
  createUserAccount,
  deleteUserAccount,
  fetchUserAccountPageData,
  fetchUserAccounts,
  resetUserAccountPassword,
  updateUserAccountRoles,
  updateUserAccountStatus,
} from '../store/user-account.thunks.js'

const emptyForm = {
  employeeId: '',
  username: '',
  password: '',
  roleIds: [],
}

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'locked', label: 'Đã khóa' },
]

export function UserAccountsPage() {
  const dispatch = useDispatch()
  const accounts = useSelector(selectUserAccounts)
  const pagination = useSelector(selectUserAccountPagination)
  const filters = useSelector(selectUserAccountFilters)
  const employeesWithoutAccount = useSelector(selectEmployeesWithoutAccount)
  const roles = useSelector(selectAssignableRoles)
  const departments = useSelector(selectUserAccountDepartments)
  const loading = useSelector(selectUserAccountLoading)
  const saving = useSelector(selectUserAccountSaving)
  const error = useSelector(selectUserAccountError)
  const successMessage = useSelector(selectUserAccountSuccessMessage)
  const [form, setForm] = useState(emptyForm)
  const [query, setQuery] = useState(filters.search)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [accountToAssign, setAccountToAssign] = useState(null)
  const [accountToReset, setAccountToReset] = useState(null)

  useEffect(() => {
    dispatch(fetchUserAccountPageData())
  }, [dispatch])

  // Gõ xong 400ms mới gọi API để không bắn request theo từng phím.
  useEffect(() => {
    if (query === filters.search) return undefined

    const timer = setTimeout(() => {
      dispatch(fetchUserAccounts({ search: query, page: 0 }))
    }, 400)

    return () => clearTimeout(timer)
  }, [dispatch, filters.search, query])

  function applyFilter(changes) {
    dispatch(fetchUserAccounts({ ...changes, page: 0 }))
  }

  function goToPage(page) {
    if (page < 0 || page >= pagination.totalPages) return
    dispatch(fetchUserAccounts({ page }))
  }

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

  function toggleFormRole(roleId) {
    setForm((current) => ({
      ...current,
      roleIds: current.roleIds.includes(roleId)
        ? current.roleIds.filter((item) => item !== roleId)
        : [...current.roleIds, roleId],
    }))
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

  async function handleAssignRoles(roleIds) {
    const result = await dispatch(
      updateUserAccountRoles({ userId: accountToAssign.userId, roleIds }),
    )

    if (updateUserAccountRoles.fulfilled.match(result)) {
      setAccountToAssign(null)
    }
  }

  async function handleResetPassword(newPassword) {
    const result = await dispatch(
      resetUserAccountPassword({ userId: accountToReset.userId, newPassword }),
    )

    if (resetUserAccountPassword.fulfilled.match(result)) {
      setAccountToReset(null)
    }
  }

  const firstRowIndex = pagination.page * pagination.size

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Quản lý tài khoản</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cấp tài khoản kèm vai trò cho nhân viên, khóa quyền truy cập khi cần.
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

      <section className="mt-5 flex flex-col gap-3 xl:flex-row">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên đăng nhập, họ tên hoặc số điện thoại..."
            value={query}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <select
            className="h-11 min-w-44 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
            onChange={(event) => applyFilter({ status: event.target.value })}
            value={filters.status}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="h-11 min-w-48 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
            onChange={(event) => applyFilter({ departmentId: event.target.value })}
            value={filters.departmentId}
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((department) => (
              <option key={department.departmentId} value={department.departmentId}>
                {department.departmentName}
              </option>
            ))}
          </select>
          <select
            className="h-11 min-w-44 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
            onChange={(event) => applyFilter({ roleCode: event.target.value })}
            value={filters.roleCode}
          >
            <option value="">Tất cả vai trò</option>
            {roles.map((role) => (
              <option key={role.roleId} value={role.roleCode}>
                {role.roleName}
              </option>
            ))}
          </select>
        </div>
      </section>

      {successMessage && !showCreateForm ? (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {successMessage}
        </p>
      ) : null}
      {error && !showCreateForm ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}

      {showCreateForm ? (
        <form
          className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-4 lg:grid-cols-3">
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
                    {employee.employeeCode ? `${employee.employeeCode} - ` : ''}
                    {employee.employeeName}
                    {employee.departmentName ? ` (${employee.departmentName})` : ''}
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
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-slate-700">
              Vai trò trong hệ thống
            </legend>
            <p className="mt-1 text-xs text-slate-500">
              Chưa chọn vai trò thì nhân viên đăng nhập được nhưng chưa thấy chức năng nào.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {roles.map((role) => (
                <RoleChip
                  checked={form.roleIds.includes(role.roleId)}
                  key={role.roleId}
                  onToggle={() => toggleFormRole(role.roleId)}
                  role={role}
                />
              ))}
            </div>
          </fieldset>

          <div className="mt-5 flex justify-end">
            <Button
              className="bg-violet-600 hover:bg-violet-700"
              disabled={saving || !employeesWithoutAccount.length}
              type="submit"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={17} />}
              Cấp tài khoản
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
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {accounts.length} / {pagination.totalElements} tài khoản
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-16 px-5 py-3 text-center font-semibold">STT</th>
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
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={8}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && !accounts.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={8}>
                    Chưa có tài khoản phù hợp.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? accounts.map((account, index) => (
                    <tr className="hover:bg-slate-50/80" key={account.userId}>
                      <td className="px-5 py-4 text-center font-medium text-slate-500">
                        {firstRowIndex + index + 1}
                      </td>
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
                          {[account.employeeCode, account.phone].filter(Boolean).join(' · ') ||
                            'Chưa cập nhật'}
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
                            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-violet-50 px-3 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
                            disabled={saving}
                            onClick={() => setAccountToAssign(account)}
                            type="button"
                          >
                            <UserRoundCog size={16} />
                            Vai trò
                          </button>
                          <button
                            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-sky-50 px-3 text-xs font-bold text-sky-700 transition hover:bg-sky-100"
                            disabled={saving}
                            onClick={() => setAccountToReset(account)}
                            title="Đặt lại mật khẩu khi nhân viên quên"
                            type="button"
                          >
                            <KeyRound size={16} />
                            Mật khẩu
                          </button>
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

        <Pagination
          disabled={loading}
          onChange={goToPage}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      </section>

      <ConfirmAccountActionModal
        action={confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        saving={saving}
      />

      {accountToReset ? (
        <ResetPasswordModal
          account={accountToReset}
          error={error}
          onClose={() => setAccountToReset(null)}
          onSubmit={handleResetPassword}
          saving={saving}
        />
      ) : null}

      {accountToAssign ? (
        <AssignRolesModal
          account={accountToAssign}
          error={error}
          onClose={() => setAccountToAssign(null)}
          onSubmit={handleAssignRoles}
          roles={roles}
          saving={saving}
        />
      ) : null}
    </div>
  )
}

function RoleChip({ checked, onToggle, role }) {
  return (
    <label
      className={[
        'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
        checked
          ? 'border-violet-500 bg-violet-50 text-violet-700'
          : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300',
      ].join(' ')}
      title={role.description || role.roleName}
    >
      <input
        checked={checked}
        className="size-3.5 accent-violet-600"
        onChange={onToggle}
        type="checkbox"
      />
      {role.roleName}
    </label>
  )
}

function ResetPasswordModal({ account, error, onClose, onSubmit, saving }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [formError, setFormError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (password.length < 6) {
      setFormError('Mật khẩu tạm phải có ít nhất 6 ký tự.')
      return
    }

    if (password !== confirmation) {
      setFormError('Hai lần nhập mật khẩu chưa khớp nhau.')
      return
    }

    setFormError('')
    onSubmit(password)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <form
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">Đặt lại mật khẩu</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {account.username}
              {account.employeeName ? ` · ${account.employeeName}` : ''}
            </p>
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

        <div className="grid gap-4 px-6 py-5">
          <p className="text-sm text-slate-600">
            Mật khẩu cũ sẽ mất hiệu lực ngay. Hãy báo mật khẩu tạm này cho nhân viên và nhắc họ
            tự đổi lại sau khi đăng nhập.
          </p>

          <label>
            <span className="text-sm font-semibold text-slate-700">Mật khẩu tạm *</span>
            <input
              autoComplete="new-password"
              className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              type="password"
              value={password}
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">Nhập lại mật khẩu *</span>
            <input
              autoComplete="new-password"
              className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) => setConfirmation(event.target.value)}
              type="password"
              value={confirmation}
            />
          </label>

          {formError || error ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {formError || error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Button disabled={saving} onClick={onClose} type="button" variant="secondary">
            Hủy
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700" disabled={saving} type="submit">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={16} />}
            Đặt lại mật khẩu
          </Button>
        </div>
      </form>
    </div>
  )
}

function AssignRolesModal({ account, error, onClose, onSubmit, roles, saving }) {
  const [selected, setSelected] = useState(
    () => (account.roles || []).map((role) => role.roleId),
  )

  const toggle = (roleId) => {
    setSelected((current) =>
      current.includes(roleId)
        ? current.filter((item) => item !== roleId)
        : [...current, roleId],
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">Phân quyền tài khoản</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {account.username}
              {account.employeeName ? ` · ${account.employeeName}` : ''}
            </p>
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
          <p className="text-sm text-slate-600">
            Chọn các vai trò tài khoản được phép đảm nhiệm. Danh sách mới sẽ thay thế toàn bộ
            vai trò hiện tại.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {roles.map((role) => (
              <RoleChip
                checked={selected.includes(role.roleId)}
                key={role.roleId}
                onToggle={() => toggle(role.roleId)}
                role={role}
              />
            ))}
          </div>

          {error ? (
            <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex justify-end gap-3">
            <Button disabled={saving} onClick={onClose} variant="secondary">
              Hủy
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700"
              disabled={saving}
              onClick={() => onSubmit(selected)}
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : null}
              Lưu vai trò
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AccountRoleBadges({ account }) {
  const roles = account.roles?.length ? account.roles : []

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
      key={role.roleId || role.roleCode}
    >
      {role.roleName || role.roleCode}
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
  const confirmLabel = isDelete ? 'Xóa tài khoản' : isLock ? 'Khóa tài khoản' : 'Mở khóa'
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

function formatDate(value) {
  if (!value) {
    return 'Chưa cập nhật'
  }

  return new Intl.DateTimeFormat('vi-VN').format(new Date(value))
}
