import { Building2, Edit3, Plus, UsersRound } from 'lucide-react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'

import {
  selectHrDepartments,
  selectHrDirectoryError,
  selectHrDirectoryLoading,
} from '../store/hr-directory.selectors.js'
import { fetchHrDirectoryData } from '../store/hr-directory.thunks.js'

export function DepartmentListPage() {
  const dispatch = useDispatch()
  const departments = useSelector(selectHrDepartments)
  const loading = useSelector(selectHrDirectoryLoading)
  const error = useSelector(selectHrDirectoryError)

  useEffect(() => {
    dispatch(fetchHrDirectoryData())
  }, [dispatch])

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Quản lý phòng ban</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cấu trúc phòng ban và đầu mối phụ trách trong nhà máy.
          </p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700">
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

        {!loading ? departments.map((department) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={department.departmentId}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="grid size-10 place-items-center rounded-md bg-violet-100 text-violet-700">
                <Building2 size={20} />
              </div>
              <button className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600">
                <Edit3 size={16} />
              </button>
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
        )) : null}
      </section>
    </div>
  )
}
