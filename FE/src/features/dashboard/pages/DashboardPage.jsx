import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import {
  Boxes,
  ClipboardCheck,
  LayoutDashboard,
  ShieldCheck,
  UsersRound,
  Wrench,
} from 'lucide-react'

import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'
import { getPrimaryRoleLabel, ROLES } from '@/features/auth/utils/roles.js'

const overviewCards = [
  {
    label: 'Nhân sự',
    value: 'Tài khoản, nhân viên, phòng ban',
    icon: UsersRound,
    tone: 'bg-violet-50 text-violet-700',
  },
  {
    label: 'Thiết bị',
    value: 'Danh mục thiết bị và hệ thống',
    icon: Wrench,
    tone: 'bg-blue-50 text-blue-700',
  },
  {
    label: 'Kho vật tư',
    value: 'Vật tư tiêu hao, thay thế, CCDC',
    icon: Boxes,
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    label: 'Bảo trì',
    value: 'Yêu cầu sửa chữa và phiếu công tác',
    icon: ClipboardCheck,
    tone: 'bg-amber-50 text-amber-700',
  },
]

export function DashboardPage() {
  const user = useSelector(selectCurrentUser)
  const roleLabel = getPrimaryRoleLabel(user)

  const userRoles = user?.roles || []
  if (userRoles.includes(ROLES.TEAM_LEADER) || userRoles.includes(ROLES.REPAIR_MANAGER)) {
    return <Navigate to="/dashboard/maintenance/requests" replace />
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">SCMS Dashboard</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">
              Xin chào, {user?.name || user?.username || 'người dùng'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Đây là dashboard chung cho toàn bộ tài khoản. Các chức năng chi tiết
              sẽ hiển thị theo quyền ở thanh menu bên trái.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="grid size-10 place-items-center rounded-md bg-white text-violet-600 shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Vai trò</p>
              <p className="text-sm font-semibold text-slate-900">{roleLabel}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((item) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={item.label}
          >
            <div
              className={`grid size-10 place-items-center rounded-md ${item.tone}`}
            >
              <item.icon size={20} />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-950">
              {item.label}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md bg-slate-950 text-white">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Không gian làm việc chung
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Dashboard này giữ nguyên cho mọi tài khoản; quyền truy cập module
              được kiểm soát ở từng menu và từng route.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
