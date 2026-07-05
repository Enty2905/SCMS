import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Package,
  Wrench,
} from 'lucide-react'
import { useSelector } from 'react-redux'

import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'

import { MetricCard } from '@/shared/components/ui/MetricCard.jsx'

/**
 * Dashboard Thủ kho CCDC
 *
 * TODO: Backend chưa có endpoint dashboard thống kê cho CCDC.
 * Khi BE có API, thay thế các giá trị placeholder bằng dữ liệu thực.
 */

// TODO: Replace with real overdue data from BE API
const overdueItems = [
  { borrower: 'Chu Văn Tài', tool: 'Máy khoan điện Bosch GSB 16', dueDate: '2025-11-25', overdueDays: 5 },
  { borrower: 'Trần Văn Hải', tool: 'Máy hàn MIG Lincoln 350A', dueDate: '2025-11-22', overdueDays: 8 },
]

export function ToolDashboardPage() {
  const user = useSelector(selectCurrentUser)
  const today = new Date()
  const dayOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][today.getDay()]
  const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // TODO: Fetch from BE dashboard API when available
  const metrics = [
    {
      label: 'Tổng số CCDC',
      value: '—',
      change: 'TODO: Chờ API dashboard',
      tone: 'sky',
      icon: Package,
    },
    {
      label: 'CCDC hiện có sẵn',
      value: '—',
      change: 'TODO: Chờ API dashboard',
      tone: 'emerald',
      icon: CheckCircle2,
    },
    {
      label: 'CCDC đang được mượn',
      value: '—',
      change: 'TODO: Chờ API dashboard',
      tone: 'sky',
      icon: Clock,
    },
  ]

  const metrics2 = [
    {
      label: 'Phiếu mượn quá hạn',
      value: '—',
      change: 'TODO: Chờ API dashboard',
      tone: 'rose',
      icon: AlertTriangle,
    },
    {
      label: 'CCDC hư hỏng cần xử lý',
      value: '—',
      change: 'TODO: Chờ API dashboard',
      tone: 'amber',
      icon: Wrench,
    },
    {
      label: 'Phiếu trả CCDC chờ XN',
      value: '—',
      change: 'TODO: Chờ API dashboard',
      tone: 'sky',
      icon: Download,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      {/* Greeting */}
      <section className="mb-5 flex items-start justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Xin chào, {user?.name || 'Thủ kho'} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Thủ kho CCDC · Phòng kế hoạch vật tư · Tổng quan kho CCDC hôm nay
          </p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p className="font-medium">{dayOfWeek}</p>
          <p>{dateStr}</p>
        </div>
      </section>

      {/* Alert banner */}
      <section className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-5 py-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-amber-600" size={20} />
          <p className="text-sm font-medium text-amber-800">
            TODO: Thông báo quá hạn sẽ hiển thị khi Backend có API dashboard
          </p>
        </div>
      </section>

      {/* Metric cards row 1 */}
      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      {/* Metric cards row 2 */}
      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics2.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      {/* Bottom section: Pie chart + Overdue table */}
      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr]">
        {/* Pie chart placeholder */}
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">Trạng thái CCDC</h2>
          <p className="mt-1 text-xs text-slate-400">
            TODO: Dữ liệu mẫu — thay bằng API khi Backend sẵn sàng
          </p>
          <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
            <div className="h-44 w-44 rounded-full bg-[conic-gradient(#22c55e_0_65%,#6366f1_65%_90%,#ef4444_90%_100%)]" />
            <div className="space-y-3 text-sm">
              <PieLegend color="bg-emerald-500" label="Có sẵn" value="—" />
              <PieLegend color="bg-indigo-500" label="Đang mượn" value="—" />
              <PieLegend color="bg-rose-500" label="Hư hỏng" value="—" />
            </div>
          </div>
        </article>

        {/* Overdue table */}
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-950">CCDC quá hạn trả</h2>
            <span className="text-xs text-slate-400">TODO: Chờ API</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="pb-2 font-semibold">Người mượn</th>
                  <th className="pb-2 font-semibold">CCDC</th>
                  <th className="pb-2 font-semibold">Hạn trả</th>
                  <th className="pb-2 font-semibold">Quá hạn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueItems.map((item) => (
                  <tr key={item.borrower + item.tool}>
                    <td className="py-3 text-slate-700">{item.borrower}</td>
                    <td className="py-3 text-slate-600">{item.tool}</td>
                    <td className="py-3 text-slate-600">{item.dueDate}</td>
                    <td className="py-3">
                      <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
                        +{item.overdueDays} ngày
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  )
}

function PieLegend({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-3 rounded-sm ${color}`} />
      <span className="min-w-28 text-slate-600">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  )
}
