import { useEffect, useState } from 'react'
import {
  Bell,
  LayoutDashboard,
  LogOut,
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
  ROLES,
} from '@/features/auth/utils/roles.js'
import { Button } from '@/shared/components/ui/Button.jsx'
import { apiClient } from '@/shared/api/httpClient.js'

import { hrNavItems } from '@/features/hr/hr.nav.js'
import { inventoryNavItems } from '@/features/inventory/inventory.nav.js'
import { equipmentNavItems } from '@/features/equipment/equipment.nav.js'
import { maintenanceNavItems } from '@/features/maintenance/maintenance.nav.js'
import { repairRequestNavItems } from '@/features/repairrequest/repairrequest.nav.js'
import { fetchEquipments } from '@/features/equipment/services/equipment.service.js'


const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: [],
  },
  ...hrNavItems,
  ...inventoryNavItems,
  ...equipmentNavItems,
  ...maintenanceNavItems,
  ...repairRequestNavItems,
]


export function AppShell() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)

  // State for dynamic notifications
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  const canSeeNotifications = hasAnyRole(user, [ROLES.OPS_MANAGER, ROLES.ADMIN])

  useEffect(() => {
    if (!canSeeNotifications) {
      setNotifications([])
      return
    }

    async function loadNotifications() {
      try {
        const equipments = await fetchEquipments()
        const warnings = equipments
          .filter((eq) => {
            const statusLower = eq.status?.toLowerCase() || ''
            return (
              statusLower === 'sự cố' ||
              statusLower === 'bảo dưỡng' ||
              statusLower === 'broken' ||
              statusLower === 'maintenance'
            )
          })
          .map((eq) => {
            const statusLower = eq.status?.toLowerCase() || ''
            const isBroken = statusLower === 'sự cố' || statusLower === 'broken'
            return {
              id: eq.id,
              kksCode: eq.kksCode,
              name: eq.equipmentName,
              status: eq.status,
              systemId: eq.systemId,
              message: isBroken
                ? `Thiết bị ${eq.equipmentName} (${eq.kksCode}) đang gặp SỰ CỐ!`
                : `Thiết bị ${eq.equipmentName} (${eq.kksCode}) đang tiến hành BẢO DƯỠNG.`,
              type: isBroken ? 'warning' : 'info',
            }
          })
        setNotifications(warnings)
      } catch (err) {
        console.error('Failed to load notifications in AppShell', err)
      }
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [canSeeNotifications])

  const handleNotifClick = (notif) => {
    setIsNotifOpen(false)
    navigate(`/dashboard/equipment?systemId=${notif.systemId || 'all'}`)
  }
  const visibleNavItems = navItems.filter((item) => hasAnyRole(user, item.roles))
  const currentItem =
    visibleNavItems.find((item) => location.pathname === item.href) ||
    visibleNavItems.find(
      (item) => item.href !== '/dashboard' && location.pathname.startsWith(item.href),
    ) ||
    visibleNavItems[0]
  const roleLabel = getPrimaryRoleLabel(user)
  const initials = getInitials(user?.name)

  async function handleLogout() {
    try {
      const token = window.localStorage.getItem('scms.auth.token')
      const refreshToken = window.localStorage.getItem('scms.auth.refreshToken')

      if (token || refreshToken) {
        await apiClient.post('/auth/logout', { token, refreshToken })
      }
    } catch (e) {
      console.error('Logout API failed', e)
    } finally {
      clearStoredAuth()
      dispatch(logout())
      navigate('/')
    }
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
              end={item.href === '/dashboard'}
              key={item.label + item.href}
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
              <div className="relative">
                <Button 
                  className="relative" 
                  size="icon" 
                  variant="ghost"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                  <span className="sr-only">Thông báo</span>
                </Button>

                {isNotifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      <div className="border-b border-slate-100 px-3 py-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Thông báo cảnh báo ({notifications.length})
                      </div>
                      <div className="max-h-64 overflow-y-auto mt-1 divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="px-3 py-4 text-center text-xs text-slate-500 italic">
                            Không có cảnh báo nào hiện tại.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => handleNotifClick(notif)}
                              className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition rounded-md flex gap-2.5 items-start text-xs cursor-pointer"
                            >
                              <span className={`mt-0.5 inline-block size-2 rounded-full shrink-0 ${
                                notif.type === 'warning' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                              }`} />
                              <div>
                                <p className={`font-semibold ${notif.type === 'warning' ? 'text-rose-700' : 'text-amber-700'}`}>
                                  {notif.type === 'warning' ? 'Cảnh báo Sự cố' : 'Thông tin Bảo dưỡng'}
                                </p>
                                <p className="mt-0.5 text-slate-600 leading-normal">{notif.message}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
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
