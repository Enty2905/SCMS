import { Building2, Plus, Trash2, UsersRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'
import { ConfirmModal } from '@/shared/components/ui/ConfirmModal.jsx'

import {
  selectHrDepartments,
  selectHrDirectoryError,
  selectHrDirectoryLoading,
  selectHrDirectorySaving,
} from '../store/hr-directory.selectors.js'
import {
  createDepartment,
  deleteDepartment,
  fetchHrDirectoryData,
} from '../store/hr-directory.thunks.js'

const emptyDepartmentForm = {
  departmentName: '',
  departmentCode: '',
}

export function DepartmentListPage() {
  const dispatch = useDispatch()
  const departments = useSelector(selectHrDepartments)
  const loading = useSelector(selectHrDirectoryLoading)
  const saving = useSelector(selectHrDirectorySaving)
  const error = useSelector(selectHrDirectoryError)
  const [departmentToDelete, setDepartmentToDelete] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyDepartmentForm)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    dispatch(fetchHrDirectoryData())
  }, [dispatch])

  const handleOpenCreate = () => {
    setForm(emptyDepartmentForm)
    setFormError('')
    setIsCreateOpen(true)
  }

  const handleCloseCreate = () => {
    setIsCreateOpen(false)
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
      await dispatch(createDepartment({
        departmentName: form.departmentName.trim(),
        departmentCode: form.departmentCode.trim(),
      })).unwrap()
      handleCloseCreate()
    } catch (err) {
      setFormError(err.message || 'Không thể thêm phòng ban. Vui lòng thử lại.')
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
                  <Button
                    className="text-rose-600 hover:bg-rose-50"
                    disabled={saving}
                    onClick={() => setDepartmentToDelete(department)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 size={16} />
                  </Button>
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
                <div className="mt-5 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <UsersRound size={16} />
                    Nhân sự
                  </span>
                  <span className="font-semibold text-slate-950">
                    {department.employeeCount}
                  </span>
                </div>
              </article>
            ))
          : null}
      </section>

      {isCreateOpen ? (
        <DepartmentCreateModal
          error={formError}
          form={form}
          onChange={setForm}
          onClose={handleCloseCreate}
          onSubmit={handleSubmitCreate}
          saving={saving}
        />
      ) : null}

      <ConfirmModal
        confirmText={saving ? 'Đang xóa...' : 'Xóa phòng ban'}
        isOpen={Boolean(departmentToDelete)}
        message={`Phòng ban "${departmentToDelete?.departmentName || ''}" sẽ bị xóa khỏi hệ thống. Nhân viên thuộc phòng ban này sẽ được bỏ liên kết phòng ban theo cấu hình database.`}
        onClose={() => setDepartmentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa phòng ban"
        type="danger"
      />
    </div>
  )
}

function DepartmentCreateModal({
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
            <h2 className="text-lg font-bold text-slate-950">Thêm phòng ban</h2>
            <p className="mt-1 text-sm text-slate-500">
              Phòng ban mới sẽ được lưu trực tiếp vào cơ sở dữ liệu.
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
            {saving ? 'Đang lưu...' : 'Thêm phòng ban'}
          </Button>
        </div>
      </form>
    </div>
  )
}
