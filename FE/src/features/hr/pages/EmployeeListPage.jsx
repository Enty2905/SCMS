import { Edit3, ImagePlus, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { apiClient } from '@/shared/api/httpClient.js'
import { Button } from '@/shared/components/ui/Button.jsx'
import { ConfirmModal } from '@/shared/components/ui/ConfirmModal.jsx'
import { Pagination } from '@/shared/components/ui/Pagination.jsx'

import {
  selectHrDepartments,
  selectHrDirectoryError,
  selectHrDirectorySaving,
  selectHrEmployeeFilters,
  selectHrEmployeeOptions,
  selectHrEmployeePage,
  selectHrEmployeeResults,
  selectHrEmployeeSearching,
  selectHrPositions,
} from '../store/hr-directory.selectors.js'
import {
  createEmployee,
  deleteEmployee,
  fetchEmployeeOptions,
  fetchHrDirectoryData,
  searchEmployees,
  updateEmployee,
} from '../store/hr-directory.thunks.js'

const emptyForm = {
  employeeName: '',
  phone: '',
  email: '',
  gender: '',
  status: '',
  departmentId: '',
  positionId: '',
  workLocation: '',
  avatar: null,
}

const statusStyles = {
  'Đang làm việc': 'bg-emerald-100 text-emerald-700',
  'Tạm nghỉ': 'bg-amber-100 text-amber-700',
  'Đã nghỉ việc': 'bg-slate-200 text-slate-600',
}

const accountStateOptions = [
  { value: 'all', label: 'Tất cả tài khoản' },
  { value: 'has-account', label: 'Đã có tài khoản' },
  { value: 'no-account', label: 'Chưa có tài khoản' },
]

export function EmployeeListPage() {
  const dispatch = useDispatch()
  const employees = useSelector(selectHrEmployeeResults)
  const employeePage = useSelector(selectHrEmployeePage)
  const filters = useSelector(selectHrEmployeeFilters)
  const departments = useSelector(selectHrDepartments)
  const positions = useSelector(selectHrPositions)
  const options = useSelector(selectHrEmployeeOptions)
  const loading = useSelector(selectHrEmployeeSearching)
  const saving = useSelector(selectHrDirectorySaving)
  const error = useSelector(selectHrDirectoryError)
  const [query, setQuery] = useState(filters.search)
  const [editingEmployee, setEditingEmployee] = useState(undefined)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    // Phòng ban, chức vụ và danh mục cho biểu mẫu, kèm trang nhân viên đầu tiên.
    dispatch(fetchHrDirectoryData())
    dispatch(fetchEmployeeOptions())
    dispatch(searchEmployees({ page: 0 }))
  }, [dispatch])

  // Gõ xong 400ms mới gọi API để không bắn request theo từng phím.
  useEffect(() => {
    if (query === filters.search) return undefined

    const timer = setTimeout(() => {
      dispatch(searchEmployees({ search: query, page: 0 }))
    }, 400)

    return () => clearTimeout(timer)
  }, [dispatch, filters.search, query])

  const applyFilter = (changes) => {
    dispatch(searchEmployees({ ...changes, page: 0 }))
  }

  const goToPage = (page) => {
    if (page < 0 || page >= employeePage.totalPages) return
    dispatch(searchEmployees({ page }))
  }

  const openCreateModal = () => {
    setEditingEmployee(null)
    setForm(emptyForm)
    setFormError('')
  }

  const openEditModal = (employee) => {
    setEditingEmployee(employee)
    setForm({
      employeeName: employee.employeeName || '',
      phone: employee.phone || '',
      email: employee.email || '',
      gender: employee.gender || '',
      status: employee.status || '',
      departmentId: employee.departmentId || '',
      positionId: employee.positionId || '',
      workLocation: employee.workLocation || '',
      avatar: null,
    })
    setFormError('')
  }

  const closeModal = () => {
    setEditingEmployee(undefined)
    setForm(emptyForm)
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.employeeName.trim()) {
      setFormError('Vui lòng nhập họ tên nhân viên.')
      return
    }

    if (!form.departmentId) {
      setFormError('Vui lòng chọn phòng ban cho nhân viên.')
      return
    }

    const payload = {
      ...form,
      employeeName: form.employeeName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      workLocation: form.workLocation.trim(),
    }

    try {
      if (editingEmployee) {
        await dispatch(updateEmployee({ employeeId: editingEmployee.employeeId, payload })).unwrap()
      } else {
        await dispatch(createEmployee(payload)).unwrap()
      }

      closeModal()
    } catch (err) {
      setFormError(err.message || 'Không thể lưu nhân viên. Vui lòng thử lại.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return

    try {
      await dispatch(deleteEmployee(employeeToDelete.employeeId)).unwrap()
      setEmployeeToDelete(null)
    } catch {
      // Redux stores and displays the backend business-rule message.
    }
  }

  const isModalOpen = editingEmployee !== undefined
  const firstRowIndex = employeePage.page * employeePage.size

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Quản lý nhân viên</h1>
          <p className="mt-1 text-sm text-slate-500">
            Thêm mới, cập nhật hồ sơ, phòng ban và ảnh đại diện nhân viên.
          </p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700" onClick={openCreateModal}>
          <Plus size={17} />
          Thêm nhân viên
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
            placeholder="Tìm mã NV, tên, email, số điện thoại, vị trí làm việc..."
            value={query}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <select
            className="h-11 min-w-48 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
            onChange={(event) => applyFilter({ departmentId: event.target.value })}
            value={filters.departmentId}
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((item) => (
              <option key={item.departmentId} value={item.departmentId}>
                {item.departmentName}
              </option>
            ))}
          </select>
          <select
            className="h-11 min-w-44 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
            onChange={(event) => applyFilter({ status: event.target.value })}
            value={filters.status}
          >
            <option value="all">Tất cả tình trạng</option>
            {options.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            className="h-11 min-w-44 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
            onChange={(event) => applyFilter({ accountState: event.target.value })}
            value={filters.accountState}
          >
            {accountStateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {employees.length} / {employeePage.totalElements} nhân viên
        </div>
        {error ? (
          <p className="mx-5 mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            {error}
          </p>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-16 px-5 py-3 text-center font-semibold">STT</th>
                <th className="px-5 py-3 font-semibold">Mã NV</th>
                <th className="px-5 py-3 font-semibold">Họ tên</th>
                <th className="px-5 py-3 font-semibold">Phòng ban</th>
                <th className="px-5 py-3 font-semibold">Chức vụ</th>
                <th className="px-5 py-3 font-semibold">Số điện thoại</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={9}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && !employees.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={9}>
                    Không có nhân viên phù hợp.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? employees.map((employee, index) => (
                    <tr className="hover:bg-slate-50/80" key={employee.employeeId}>
                      <td className="px-5 py-4 text-center font-medium text-slate-500">
                        {firstRowIndex + index + 1}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {employee.employeeCode || 'Chưa cấp'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <EmployeeAvatar employee={employee} />
                          <div>
                            <p className="font-semibold text-slate-950">
                              {employee.employeeName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {describeAccount(employee)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {employee.departmentName || 'Chưa cập nhật'}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {employee.positionName || employee.workLocation || 'Chưa cập nhật'}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{employee.phone || 'N/A'}</td>
                      <td className="px-5 py-4 text-slate-600">{employee.email || 'N/A'}</td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
                            statusStyles[employee.status] || 'bg-slate-100 text-slate-600',
                          ].join(' ')}
                        >
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2 text-slate-400">
                          <Button
                            className="hover:text-violet-600"
                            aria-label={`Cập nhật ${employee.employeeName}`}
                            onClick={() => openEditModal(employee)}
                            size="icon"
                            title="Cập nhật nhân viên"
                            variant="ghost"
                          >
                            <Edit3 size={16} />
                          </Button>
                          <Button
                            aria-label={`Xóa ${employee.employeeName}`}
                            className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={saving}
                            onClick={() => setEmployeeToDelete(employee)}
                            size="icon"
                            title={employee.hasAccount
                              ? 'Xóa mềm nhân viên và khóa tài khoản liên quan'
                              : 'Xóa nhân viên'}
                            variant="ghost"
                          >
                            <Trash2 size={16} />
                          </Button>
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
          page={employeePage.page}
          totalPages={employeePage.totalPages}
        />
      </section>

      {isModalOpen ? (
        <EmployeeFormModal
          departments={departments}
          employee={editingEmployee}
          error={formError}
          form={form}
          onChange={setForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
          options={options}
          positions={positions}
          saving={saving}
        />
      ) : null}

      <ConfirmModal
        confirmText={saving ? 'Đang xóa...' : 'Xóa nhân viên'}
        isOpen={Boolean(employeeToDelete)}
        message={`Nhân viên "${employeeToDelete?.employeeName || ''}" sẽ được xóa mềm và không còn xuất hiện trong danh sách.${employeeToDelete?.hasAccount ? ' Tài khoản liên quan cũng sẽ bị khóa và xóa mềm.' : ''} Dữ liệu lịch sử vẫn được giữ lại.`}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa nhân viên"
        type="danger"
      />
    </div>
  )
}

function describeAccount(employee) {
  if (!employee.hasAccount) {
    return 'Chưa có tài khoản'
  }

  return employee.accountActive ? 'Đã có tài khoản' : 'Tài khoản đang bị khóa'
}

function EmployeeAvatar({ employee }) {
  const avatarUrl = resolveAvatarUrl(employee.avatarUrl)

  if (avatarUrl) {
    return (
      <img
        alt={employee.employeeName}
        className="size-9 rounded-full object-cover ring-1 ring-slate-200"
        src={avatarUrl}
      />
    )
  }

  return (
    <div className="grid size-9 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
      {employee.employeeName?.[0] || 'N'}
    </div>
  )
}

function EmployeeFormModal({
  departments,
  employee,
  error,
  form,
  onChange,
  onClose,
  onSubmit,
  options,
  positions,
  saving,
}) {
  const existingAvatarUrl = resolveAvatarUrl(employee?.avatarUrl)

  const updateField = (field, value) => {
    onChange((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <form
        className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl"
        onSubmit={onSubmit}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              {employee ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Nhân viên phải được gán vào một phòng ban đang có trong hệ thống.
            </p>
          </div>
          <Button onClick={onClose} size="icon" variant="ghost">
            <X size={18} />
          </Button>
        </div>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          {employee?.employeeCode ? (
            <p className="md:col-span-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Mã nhân viên: <strong className="text-slate-900">{employee.employeeCode}</strong>
            </p>
          ) : null}

          <label className="md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Họ tên *</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) => updateField('employeeName', event.target.value)}
              value={form.employeeName}
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">Số điện thoại</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) => updateField('phone', event.target.value)}
              value={form.phone}
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="vd: nguyenvana@nhm.vn"
              type="email"
              value={form.email}
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">Giới tính</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) => updateField('gender', event.target.value)}
              value={form.gender}
            >
              <option value="">Chưa khai báo</option>
              {options.genders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">Tình trạng làm việc</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) => updateField('status', event.target.value)}
              value={form.status || options.statuses[0] || ''}
            >
              {options.statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">Vị trí làm việc</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) => updateField('workLocation', event.target.value)}
              value={form.workLocation}
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">Phòng ban *</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) => updateField('departmentId', event.target.value)}
              value={form.departmentId}
            >
              <option value="">Chọn phòng ban</option>
              {departments.map((department) => (
                <option key={department.departmentId} value={department.departmentId}>
                  {department.departmentName}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">Chức vụ</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) => updateField('positionId', event.target.value)}
              value={form.positionId}
            >
              <option value="">Chưa chọn</option>
              {positions.map((position) => (
                <option key={position.positionId} value={position.positionId}>
                  {position.positionName}
                </option>
              ))}
            </select>
          </label>

          <label className="md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Ảnh nhân viên</span>
            <div className="mt-2 flex items-center gap-4 rounded-md border border-dashed border-slate-300 p-4">
              {existingAvatarUrl ? (
                <img
                  alt={employee.employeeName}
                  className="size-16 rounded-full object-cover ring-1 ring-slate-200"
                  src={existingAvatarUrl}
                />
              ) : (
                <div className="grid size-16 place-items-center rounded-full bg-slate-100 text-slate-400">
                  <ImagePlus size={24} />
                </div>
              )}
              <div className="flex-1">
                <input
                  accept="image/*"
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                  onChange={(event) => updateField('avatar', event.target.files?.[0] || null)}
                  type="file"
                />
                <p className="mt-2 text-xs text-slate-500">
                  {form.avatar ? `Đã chọn: ${form.avatar.name}` : 'Hỗ trợ ảnh PNG, JPG, WEBP.'}
                </p>
              </div>
            </div>
          </label>

          {error ? (
            <p className="md:col-span-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Button onClick={onClose} variant="secondary">
            Hủy
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700" disabled={saving} type="submit">
            {saving ? 'Đang lưu...' : employee ? 'Cập nhật' : 'Thêm nhân viên'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function resolveAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null
  if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl

  return apiClient.url(avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`)
}
