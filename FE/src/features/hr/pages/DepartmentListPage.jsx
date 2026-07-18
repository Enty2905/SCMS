import { Building2, Edit3, Plus, Trash2, UserMinus, UsersRound, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'
import { ConfirmModal } from '@/shared/components/ui/ConfirmModal.jsx'

import {
  selectHrDepartments,
  selectHrDirectoryError,
  selectHrDirectoryLoading,
  selectHrDirectorySaving,
  selectHrEmployees,
} from '../store/hr-directory.selectors.js'
import {
  createDepartment,
  deleteDepartment,
  fetchHrDirectoryData,
  removeEmployeeFromDepartment,
  updateDepartment,
} from '../store/hr-directory.thunks.js'

const emptyDepartmentForm = {
  departmentName: '',
  departmentCode: '',
}

export function DepartmentListPage() {
  const dispatch = useDispatch()
  const departments = useSelector(selectHrDepartments)
  const employees = useSelector(selectHrEmployees)
  const loading = useSelector(selectHrDirectoryLoading)
  const saving = useSelector(selectHrDirectorySaving)
  const error = useSelector(selectHrDirectoryError)
  const [departmentToDelete, setDepartmentToDelete] = useState(null)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null)
  const [employeeToRemove, setEmployeeToRemove] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [form, setForm] = useState(emptyDepartmentForm)
  const [formError, setFormError] = useState('')

  const selectedDepartment = departments.find(
    (department) => department.departmentId === selectedDepartmentId,
  ) || null
  const departmentEmployees = useMemo(
    () => employees.filter((employee) => employee.departmentId === selectedDepartmentId),
    [employees, selectedDepartmentId],
  )

  useEffect(() => {
    dispatch(fetchHrDirectoryData())
  }, [dispatch])

  const handleOpenCreate = () => {
    setEditingDepartment(null)
    setForm(emptyDepartmentForm)
    setFormError('')
    setIsCreateOpen(true)
  }

  const handleOpenEdit = (department) => {
    setEditingDepartment(department)
    setForm({
      departmentName: department.departmentName || '',
      departmentCode: department.departmentCode || '',
    })
    setFormError('')
    setIsCreateOpen(true)
  }

  const handleCloseCreate = () => {
    setIsCreateOpen(false)
    setEditingDepartment(null)
    setForm(emptyDepartmentForm)
    setFormError('')
  }

  const handleSubmitCreate = async (event) => {
    event.preventDefault()

    if (!form.departmentName.trim()) {
      setFormError('Vui lòng nhập tên phòng ban.')
      return
    }

    try {
      const payload = {
        departmentName: form.departmentName.trim(),
        departmentCode: form.departmentCode.trim(),
      }

      if (editingDepartment) {
        await dispatch(updateDepartment({
          departmentId: editingDepartment.departmentId,
          payload,
        })).unwrap()
      } else {
        await dispatch(createDepartment(payload)).unwrap()
      }
      handleCloseCreate()
    } catch (err) {
      setFormError(err.message || 'Không thể lưu phòng ban. Vui lòng thử lại.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!departmentToDelete) return

    try {
      await dispatch(deleteDepartment(departmentToDelete.departmentId)).unwrap()
      setDepartmentToDelete(null)
    } catch {
      // Error is stored in Redux and displayed above the list.
    }
  }

  const handleConfirmRemoveEmployee = async () => {
    if (!selectedDepartment || !employeeToRemove) return

    try {
      await dispatch(removeEmployeeFromDepartment({
        departmentId: selectedDepartment.departmentId,
        employeeId: employeeToRemove.employeeId,
      })).unwrap()
      setEmployeeToRemove(null)
    } catch {
      // Error is stored in Redux and displayed above the department list.
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Quản lý phòng ban</h1>
          <p className="mt-1 text-sm text-slate-500">
            Xem danh sách, thêm mới và xóa phòng ban không còn sử dụng.
          </p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleOpenCreate}>
          <Plus size={17} />
          Thêm phòng ban
        </Button>
      </section>

      {error ? (
        <p className="mt-5 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <article className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            Đang tải dữ liệu...
          </article>
        ) : null}

        {!loading && !departments.length ? (
          <article className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            Chưa có phòng ban.
          </article>
        ) : null}

        {!loading
          ? departments.map((department) => (
              <article
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                key={department.departmentId}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid size-10 place-items-center rounded-md bg-violet-100 text-violet-700">
                    <Building2 size={20} />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      className="text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                      disabled={saving}
                      onClick={() => handleOpenEdit(department)}
                      size="icon"
                      title="Cập nhật phòng ban"
                      variant="ghost"
                    >
                      <Edit3 size={16} />
                    </Button>
                    <Button
                      className="text-rose-600 hover:bg-rose-50"
                      disabled={saving}
                      onClick={() => setDepartmentToDelete(department)}
                      size="icon"
                      title="Xóa phòng ban"
                      variant="ghost"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {department.departmentCode || 'N/A'}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">
                  {department.departmentName}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Dữ liệu lấy trực tiếp từ cơ sở dữ liệu.
                </p>
                <button
                  className="mt-5 flex w-full items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-left transition hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/15"
                  onClick={() => setSelectedDepartmentId(department.departmentId)}
                  type="button"
                >
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <UsersRound size={16} />
                    Nhân sự
                  </span>
                  <span className="font-semibold text-slate-950">
                    {department.employeeCount}
                  </span>
                </button>
              </article>
            ))
          : null}
      </section>

      {isCreateOpen ? (
        <DepartmentCreateModal
          department={editingDepartment}
          error={formError}
          form={form}
          onChange={setForm}
          onClose={handleCloseCreate}
          onSubmit={handleSubmitCreate}
          saving={saving}
        />
      ) : null}

      {selectedDepartment ? (
        <DepartmentEmployeesModal
          department={selectedDepartment}
          employees={departmentEmployees}
          onClose={() => setSelectedDepartmentId(null)}
          onRemove={setEmployeeToRemove}
          saving={saving}
        />
      ) : null}

      <ConfirmModal
        confirmText={saving ? 'Đang xử lý...' : 'Gỡ khỏi phòng ban'}
        isOpen={Boolean(employeeToRemove)}
        message={`Nhân viên "${employeeToRemove?.employeeName || ''}" sẽ được gỡ khỏi phòng ban "${selectedDepartment?.departmentName || ''}". Hồ sơ và tài khoản của nhân viên vẫn được giữ nguyên.`}
        onClose={() => setEmployeeToRemove(null)}
        onConfirm={handleConfirmRemoveEmployee}
        title="Xác nhận gỡ nhân viên"
        type="warning"
      />

      <ConfirmModal
        confirmText={saving ? 'Đang xóa...' : 'Xóa phòng ban'}
        isOpen={Boolean(departmentToDelete)}
        message={`Phòng ban "${departmentToDelete?.departmentName || ''}" sẽ được xóa mềm khỏi hệ thống. Chỉ có thể xóa khi phòng ban không còn nhân viên.`}
        onClose={() => setDepartmentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa phòng ban"
        type="danger"
      />
    </div>
  )
}

function DepartmentEmployeesModal({ department, employees, onClose, onRemove, saving }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <section className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Nhân sự phòng ban: {department.departmentName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Có {employees.length} nhân viên đang thuộc phòng ban này.
            </p>
          </div>
          <Button aria-label="Đóng danh sách nhân sự" onClick={onClose} size="icon" variant="ghost">
            <X size={18} />
          </Button>
        </div>

        <div className="max-h-[65vh] overflow-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="w-16 px-5 py-3 text-center font-semibold">STT</th>
                <th className="px-5 py-3 font-semibold">Nhân viên</th>
                <th className="px-5 py-3 font-semibold">Chức vụ</th>
                <th className="px-5 py-3 font-semibold">Liên hệ</th>
                <th className="px-5 py-3 font-semibold">Tài khoản</th>
                <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!employees.length ? (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500" colSpan={6}>
                    Phòng ban chưa có nhân viên.
                  </td>
                </tr>
              ) : null}
              {employees.map((employee, index) => (
                <tr className="hover:bg-slate-50" key={employee.employeeId}>
                  <td className="px-5 py-4 text-center text-slate-500">{index + 1}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-950">{employee.employeeName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{employee.employeeCode}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {employee.positionName || employee.workLocation || 'Chưa cập nhật'}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <p>{employee.phone || 'Chưa có số điện thoại'}</p>
                    <p className="mt-0.5 text-xs">{employee.email || 'Chưa có email'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={employee.hasAccount
                      ? 'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700'
                      : 'inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600'}>
                      {employee.hasAccount ? 'Đã có tài khoản' : 'Chưa có tài khoản'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      aria-label={`Gỡ ${employee.employeeName} khỏi phòng ban`}
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      disabled={saving}
                      onClick={() => onRemove(employee)}
                      size="icon"
                      title="Gỡ khỏi phòng ban"
                      variant="ghost"
                    >
                      <UserMinus size={17} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function DepartmentCreateModal({
  department,
  error,
  form,
  onChange,
  onClose,
  onSubmit,
  saving,
}) {
  const updateField = (field, value) => {
    onChange((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <form
        className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl"
        onSubmit={onSubmit}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              {department ? 'Cập nhật phòng ban' : 'Thêm phòng ban'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {department
                ? 'Thông tin mới sẽ được áp dụng cho nhân viên đang thuộc phòng ban.'
                : 'Phòng ban mới sẽ được lưu trực tiếp vào cơ sở dữ liệu.'}
            </p>
          </div>
          <Button onClick={onClose} size="icon" variant="ghost">
            <X size={18} />
          </Button>
        </div>

        <div className="grid gap-4 px-6 py-5">
          <label>
            <span className="text-sm font-semibold text-slate-700">Tên phòng ban *</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) => updateField('departmentName', event.target.value)}
              placeholder="Ví dụ: Phòng nhân sự"
              value={form.departmentName}
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">Mã phòng ban</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm uppercase outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) => updateField('departmentCode', event.target.value.toUpperCase())}
              placeholder="Ví dụ: NS"
              value={form.departmentCode}
            />
          </label>

          {error ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Button onClick={onClose} variant="secondary">
            Hủy
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700" disabled={saving} type="submit">
            {saving ? 'Đang lưu...' : department ? 'Cập nhật' : 'Thêm phòng ban'}
          </Button>
        </div>
      </form>
    </div>
  )
}
