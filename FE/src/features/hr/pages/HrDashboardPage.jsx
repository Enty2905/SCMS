import {
  CalendarClock,
  ClipboardList,
  PackageMinus,
  Settings2,
  UsersRound,
  Wrench,
} from 'lucide-react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'
import { MetricCard } from '@/shared/components/ui/MetricCard.jsx'

import {
  selectHrDepartments,
  selectHrDirectoryError,
  selectHrEmployees,
} from '../store/hr-directory.selectors.js'
import { fetchHrDirectoryData } from '../store/hr-directory.thunks.js'

const monthlyRequests = [
  { label: 'T6', value: 8 },
  { label: 'T7', value: 12 },
  { label: 'T8', value: 9 },
  { label: 'T9', value: 15 },
  { label: 'T10', value: 11 },
  { label: 'T11', value: 14 },
]

const repairTop = [
  { name: 'HTB-PMP-001', count: 8 },
  { name: 'HTB-FAN-004', count: 6 },
  { name: 'HTB-MTR-002', count: 4 },
  { name: 'HTB-VAL-009', count: 3 },
  { name: 'HTB-CHL-003', count: 2 },
]

export function HrDashboardPage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const employees = useSelector(selectHrEmployees)
  const departments = useSelector(selectHrDepartments)
  const error = useSelector(selectHrDirectoryError)
  const employeesWithAccount = employees.filter((employee) => employee.hasAccount)
  const employeesWithoutAccount = employees.length - employeesWithAccount.length
  const metrics = [
    {
      label: 'Nhân viên',
      value: employees.length.toString(),
      change: `${departments.length} phòng ban đang hoạt động`,
      tone: 'sky',
      icon: UsersRound,
    },
    {
      label: 'Tài khoản đã cấp',
      value: employeesWithAccount.length.toString(),
      change: 'Đang sử dụng trong hệ thống',
      tone: 'emerald',
      icon: Settings2,
    },
    {
      label: 'Chưa có tài khoản',
      value: employeesWithoutAccount.toString(),
      change: 'Cần cấp khi nhân viên tham gia hệ thống',
      tone: 'amber',
      icon: ClipboardList,
    },
    {
      label: 'Phòng ban',
      value: departments.length.toString(),
      change: 'Lấy trực tiếp từ cơ sở dữ liệu',
      tone: 'rose',
      icon: CalendarClock,
    },
    {
      label: 'Vật tư sắp hết / hết hàng',
      value: '4',
      change: 'Chờ API vật tư',
      tone: 'amber',
      icon: PackageMinus,
    },
    {
      label: 'Thiết bị đang sửa chữa',
      value: '2',
      change: 'Chờ API thiết bị',
      tone: 'sky',
      icon: Wrench,
    },
  ]

  useEffect(() => {
    dispatch(fetchHrDirectoryData())
  }, [dispatch])

  return (
    <div className="mx-auto max-w-7xl">
      <section>
        <h1 className="text-2xl font-bold text-slate-950">
          Xin chào, {user?.name || 'Nhân sự'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Nhân sự - Phòng nhân sự - Tổng quan vận hành hôm nay
        </p>
      </section>

      {error ? (
        <p className="mt-5 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.slice(0, 4).map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        {metrics.slice(4).map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-950">
              Số yêu cầu sửa chữa theo tháng
            </h2>
          </div>
          <div className="mt-6 flex h-52 items-end gap-5 border-l border-b border-slate-200 pl-4">
            {monthlyRequests.map((item) => (
              <div className="flex flex-1 flex-col items-center gap-2" key={item.label}>
                <div
                  className="w-full max-w-20 rounded-t-md bg-violet-500"
                  style={{ height: `${item.value * 10}px` }}
                  title={`${item.value} yêu cầu`}
                />
                <span className="text-xs text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">
            Trạng thái thiết bị
          </h2>
          <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
            <div className="h-44 w-44 rounded-full bg-[conic-gradient(#22c55e_0_70%,#f59e0b_70%_90%,#94a3b8_90%_100%)]" />
            <div className="space-y-3 text-sm">
              <Legend color="bg-emerald-500" label="Đang hoạt động" value="7" />
              <Legend color="bg-amber-500" label="Đang sửa chữa" value="2" />
              <Legend color="bg-slate-400" label="Ngừng hoạt động" value="1" />
            </div>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">
            Chi phí vật tư theo tháng
          </h2>
          <div className="mt-6 flex h-40 items-end gap-5 border-l border-b border-slate-200 pl-4">
            {[54, 78, 61, 92, 74, 98].map((value, index) => (
              <div className="flex flex-1 flex-col items-center gap-2" key={value}>
                <div
                  className="w-full max-w-20 rounded-t-md bg-sky-500"
                  style={{ height: `${value}px` }}
                />
                <span className="text-xs text-slate-500">T{index + 6}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">
            Top 5 thiết bị sửa chữa nhiều nhất
          </h2>
          <div className="mt-5 space-y-4">
            {repairTop.map((item, index) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {index + 1}. {item.name}
                  </span>
                  <span className="text-slate-500">{item.count} lần</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-violet-500"
                    style={{ width: `${item.count * 12}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

function Legend({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-3 rounded-sm ${color}`} />
      <span className="min-w-32 text-slate-600">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  )
}
