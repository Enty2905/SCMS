import { Download, FileBarChart, TrendingUp, UsersRound } from 'lucide-react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'

import {
  selectHrDepartments,
  selectHrEmployees,
} from '../store/hr-directory.selectors.js'
import { fetchHrDirectoryData } from '../store/hr-directory.thunks.js'

const reports = [
  {
    title: 'Biến động nhân sự',
    description: 'Tổng hợp nhân sự mới, nghỉ việc và điều chuyển theo tháng.',
    icon: TrendingUp,
  },
  {
    title: 'Cơ cấu phòng ban',
    description: 'Tỷ lệ nhân viên theo phòng ban, chức vụ và trạng thái.',
    icon: UsersRound,
  },
  {
    title: 'Tài khoản hệ thống',
    description: 'Danh sách tài khoản đang hoạt động, bị khóa và chưa cấp.',
    icon: FileBarChart,
  },
]

export function HrReportsPage() {
  const dispatch = useDispatch()
  const employees = useSelector(selectHrEmployees)
  const departments = useSelector(selectHrDepartments)

  useEffect(() => {
    dispatch(fetchHrDirectoryData())
  }, [dispatch])

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Báo cáo nhân sự</h1>
          <p className="mt-1 text-sm text-slate-500">
            Các báo cáo phục vụ theo dõi nhân sự và quyền truy cập hệ thống.
          </p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700">
          <Download size={17} />
          Xuất báo cáo
        </Button>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {reports.map((report) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={report.title}
          >
            <div className="grid size-10 place-items-center rounded-md bg-violet-100 text-violet-700">
              <report.icon size={20} />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-slate-950">
              {report.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {report.description}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">
          Tổng quan nhân sự theo tháng
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Hiện có {employees.length} nhân viên thuộc {departments.length} phòng ban.
        </p>
        <div className="mt-6 flex h-56 items-end gap-5 border-l border-b border-slate-200 pl-4">
          {[8, 9, 10, employees.length, employees.length, employees.length].map((value, index) => (
            <div className="flex flex-1 flex-col items-center gap-2" key={index}>
              <div
                className="w-full max-w-24 rounded-t-md bg-violet-500"
                style={{ height: `${value * 9}px` }}
              />
              <span className="text-xs text-slate-500">T{index + 6}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
