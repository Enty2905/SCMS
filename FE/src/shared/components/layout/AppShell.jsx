import {
  Bell,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { logout } from '@/features/auth/store/auth.reducer.js'
import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'
import { Button } from '@/shared/components/ui/Button.jsx'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Orders', href: '/', icon: ClipboardList },
  { label: 'Inventory', href: '/', icon: Boxes },
  { label: 'Settings', href: '/', icon: Settings },
]

export function AppShell() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-stone-50 text-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-68 border-r border-zinc-200 bg-white px-4 py-5 lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="grid size-10 place-items-center rounded-lg bg-emerald-600 text-white">
            <Boxes size={21} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">SCMS Console</p>
            <p className="mt-1 text-xs text-zinc-500">Frontend workspace</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                [
                  'flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition',
                  isActive && item.label === 'Dashboard'
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
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

        <div className="absolute inset-x-4 bottom-5 rounded-lg border border-zinc-200 bg-stone-50 p-3">
          <p className="text-xs font-semibold uppercase text-zinc-500">
            Current user
          </p>
          <p className="mt-2 text-sm font-semibold">
            {user?.name || 'Guest user'}
          </p>
          <p className="mt-1 truncate text-xs text-zinc-500">
            {user?.email || 'Not signed in'}
          </p>
          <Button
            className="mt-4 w-full"
            onClick={handleLogout}
            size="sm"
            variant="secondary"
          >
            <LogOut size={16} />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="lg:pl-68">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-stone-50/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <div className="relative max-w-lg flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={17}
              />
              <input
                className="h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Search orders, SKUs, suppliers"
                type="search"
              />
            </div>
            <Button size="icon" variant="secondary">
              <Bell size={18} />
              <span className="sr-only">Notifications</span>
            </Button>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
