import {
  AlertCircle,
  ArrowUpCircle,
  CheckCircle2,
  ClipboardList,
  Download,
  Package,
} from 'lucide-react'
import { useSelector } from 'react-redux'

import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'
import { MetricCard } from '@/shared/components/ui/MetricCard.jsx'

/**
 * Dashboard Thủ kho vật tư
 *
 * TODO: Backend chưa có endpoint dashboard thống kê cho vật tư.
 * Khi BE có API, thay thế các giá trị placeholder bằng dữ liệu thực.
 */

const monthlyData = [
  { label: 'T6', nhap: 150, xuat: 100 },
  { label: 'T7', nhap: 200, xuat: 150 },
  { label: 'T8', nhap: 180, xuat: 130 },
  { label: 'T9', nhap: 420, xuat: 350 },
  { label: 'T10', nhap: 280, xuat: 200 },
  { label: 'T11', nhap: 300, xuat: 250 },
]

const maxBarValue = Math.max(...monthlyData.flatMap((d) => [d.nhap, d.xuat]))

export function MaterialDashboardPage() {
  const user = useSelector(selectCurrentUser)
  const today = new Date()
  const dayOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][today.getDay()]
  const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // TODO: Fetch from BE dashboard API when available
  const metrics = [
    {
      label: 'Tổng loại vật tư trong kho',
      value: '—',
      change: 'TODO: Chờ API dashboard',
      tone: 'sky',
      icon: Package,
    },
    {
      label: 'Sắp hết / Hết hàng',
      value: '—',
      change: 'TODO: Chờ API dashboard',
      tone: 'amber',
      icon: AlertCircle,
    },
    {
      label: 'Phiếu nhập kho hôm nay',
      value: '—',
      change: 'TODO: Chờ API dashboard',
      tone: 'emerald',
      icon: Download,
    },
  ]

  const metrics2 = [
    {
      label: 'Phiếu cấp VT chờ xử lý',
      value: '—',
      change: 'TODO: Chờ API dashboard',
      tone: 'amber',
      icon: ClipboardList,
    },
    {
      label: 'Phiếu cấp VT hoàn thành hôm nay',
      value: '—',
      change: 'TODO: Chờ API dashboard',
      tone: 'emerald',
      icon: CheckCircle2,
    },
    {
      label: 'Giao dịch nhập/xuất hôm nay',
      value: '—',
      change: 'TODO: Chờ API dashboard',
      tone: 'sky',
      icon: ArrowUpCircle,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      {/* Greeting */}
      <section className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Xin chào, {user?.name || 'Thủ kho'} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Thủ kho vật tư · Phòng kế hoạch vật tư · Tổng quan kho vật tư hôm nay
          </p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p className="font-medium">{dayOfWeek}</p>
          <p>{dateStr}</p>
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

      {/* Chart: Nhập kho và xuất kho theo tháng */}
      <section className="mt-6">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">
            Nhập kho và xuất kho theo tháng (số lượt)
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            TODO: Dữ liệu mẫu — thay bằng API khi Backend sẵn sàng
          </p>
          <div className="mt-6 flex h-56 items-end gap-6 border-b border-l border-slate-200 pb-2 pl-4">
            {monthlyData.map((item) => (
              <div className="flex flex-1 flex-col items-center gap-1" key={item.label}>
                <div className="flex w-full items-end justify-center gap-1">
                  <div
                    className="w-5 rounded-t-sm bg-emerald-500"
                    style={{ height: `${(item.nhap / maxBarValue) * 180}px` }}
                    title={`Nhập kho: ${item.nhap}`}
                  />
                  <div
                    className="w-5 rounded-t-sm bg-slate-400"
                    style={{ height: `${(item.xuat / maxBarValue) * 180}px` }}
                    title={`Xuất kho: ${item.xuat}`}
                  />
                </div>
                <span className="text-xs text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <Legend color="bg-emerald-500" label="Nhập kho" />
            <Legend color="bg-slate-400" label="Xuất kho" />
          </div>
        </article>
      </section>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-3 rounded-sm ${color}`} />
      <span className="text-slate-600">{label}</span>
    </div>
  )
}
