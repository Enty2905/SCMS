import { Edit3, Filter, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'

import {
  selectHrDirectoryError,
  selectHrDirectoryLoading,
  selectHrEmployees,
} from '../store/hr-directory.selectors.js'
import { fetchHrDirectoryData } from '../store/hr-directory.thunks.js'

export function EmployeeListPage() {
  const dispatch = useDispatch()
  const employees = useSelector(selectHrEmployees)
  const loading = useSelector(selectHrDirectoryLoading)
  const error = useSelector(selectHrDirectoryError)
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('all')
  const [status, setStatus] = useState('all')
  const departments = [...new Set(employees.map((item) => item.departmentName).filter(Boolean))]
  const filteredEmployees = useMemo(
    () =>
      employees.filter((employee) => {
        const keyword = query.trim().toLowerCase()
        const matchesQuery =
          !keyword ||
          employee.employeeCode?.toLowerCase().includes(keyword) ||
          employee.employeeName?.toLowerCase().includes(keyword) ||
          employee.phone?.includes(keyword)
        const matchesDepartment =
          department === 'all' || employee.departmentName === department
        const matchesStatus = status === 'all' || employee.status === status

        return matchesQuery && matchesDepartment && matchesStatus
      }),
    [department, employees, query, status],
  )

  useEffect(() => {
    dispatch(fetchHrDirectoryData())
  }, [dispatch])

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Quản lý nhân viên</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi hồ sơ, phòng ban, chức vụ và trạng thái làm việc.
          </p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700">
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
            placeholder="Tìm mã NV, tên, số điện thoại..."
            value={query}
          />
        </label>
        <div className="flex gap-3">
          <Button size="icon" variant="secondary">
            <Filter size={17} />
          </Button>
          <select
            className="h-11 min-w-48 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
            onChange={(event) => setDepartment(event.target.value)}
            value={department}
          >
            <option value="all">Tất cả phòng ban</option>
            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            className="h-11 min-w-40 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang làm việc">Đang làm việc</option>
            <option value="Nghỉ việc">Nghỉ việc</option>
          </select>
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3 text-sm text-slate-500">
          Hiển thị {filteredEmployees.length} / {employees.length} nhân viên
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
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={8}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && !filteredEmployees.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={8}>
                    Không có nhân viên phù hợp.
                  </td>
                </tr>
              ) : null}

              {!loading ? filteredEmployees.map((employee) => (
                <tr className="hover:bg-slate-50/80" key={employee.employeeId}>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {employee.employeeCode}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                        {employee.employeeName?.[0] || 'N'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">
                          {employee.employeeName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {employee.gender || (employee.hasAccount ? 'Đã có tài khoản' : 'Chưa có tài khoản')}
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
                  <td className="px-5 py-4 text-slate-600">{employee.phone}</td>
                  <td className="px-5 py-4 text-slate-600">{employee.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className={[
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
                        employee.status === 'Đang làm việc'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600',
                      ].join(' ')}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2 text-slate-400">
                      <button className="rounded-md p-2 hover:bg-slate-100 hover:text-violet-600">
                        <Edit3 size={16} />
                      </button>
                      <button className="rounded-md p-2 hover:bg-slate-100 hover:text-rose-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
