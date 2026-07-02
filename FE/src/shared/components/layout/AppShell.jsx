import {
  Bell,
  BarChart3,
  Building2,
  LayoutDashboard,
  LogOut,
  UserRoundCog,
  UsersRound,
  Zap,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { clearStoredAuth } from '@/features/auth/services/token.service.js'
import { logout } from '@/features/auth/store/auth.reducer.js'
import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'
import {
  getPrimaryRoleLabel,
  hasAnyRole,
  HR_ACCESS_ROLES,
} from '@/features/auth/utils/roles.js'
import { Button } from '@/shared/components/ui/Button.jsx'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: HR_ACCESS_ROLES,
  },
  {
    label: 'Phòng ban',
    href: '/dashboard/hr/departments',
    icon: Building2,
    roles: HR_ACCESS_ROLES,
  },
  {
    label: 'Nhân viên',
    href: '/dashboard/hr/employees',
    icon: UsersRound,
    roles: HR_ACCESS_ROLES,
  },
  {
    label: 'Tài khoản',
    href: '/dashboard/hr/accounts',
    icon: UserRoundCog,
    roles: HR_ACCESS_ROLES,
  },
  {
    label: 'Báo cáo',
    href: '/dashboard/hr/reports',
    icon: BarChart3,
    roles: HR_ACCESS_ROLES,
  },
]

export function AppShell() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const visibleNavItems = navItems.filter((item) => hasAnyRole(user, item.roles))
  const currentItem =
    visibleNavItems.find((item) => location.pathname === item.href) ||
    visibleNavItems.find(
      (item) => item.href !== '/dashboard' && location.pathname.startsWith(item.href),
    ) ||
    visibleNavItems[0]
  const roleLabel = getPrimaryRoleLabel(user)
  const initials = getInitials(user?.name)

  function handleLogout() {
    clearStoredAuth()
    dispatch(logout())
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-800 bg-slate-950 px-3 py-4 text-white lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="grid size-9 place-items-center rounded-lg bg-violet-600 text-white">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">SCMS</p>
            <p className="mt-1 text-xs text-slate-300">Nhiệt điện</p>
          </div>
        </div>

        <nav className="mt-6 space-y-2">
          {visibleNavItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                [
                  'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition',
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-950/20'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white',
                ].join(' ')
              }
              key={item.label}
              to={item.href}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute inset-x-3 bottom-4 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="grid size-9 place-items-center rounded-full bg-violet-600 text-sm font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.name || 'Guest user'}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-300">{roleLabel}</p>
            </div>
          </div>
          <Button
            className="mt-4 w-full border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
            onClick={handleLogout}
            size="sm"
            variant="secondary"
          >
            <LogOut size={16} />
            Đăng xuất
          </Button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div>
              <p className="text-base font-semibold text-slate-950">
                {currentItem?.label || 'Dashboard'}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 lg:hidden">
                {roleLabel}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="relative" size="icon" variant="ghost">
                <Bell size={18} />
                <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  4
                </span>
                <span className="sr-only">Thông báo</span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white">
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-950">
                    {user?.name || 'Guest user'}
                  </p>
                  <p className="text-xs text-slate-500">{roleLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function getInitials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'S'
  )
}
