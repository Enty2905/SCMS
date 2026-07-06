import { BarChart3, Building2, UserRoundCog, UsersRound } from 'lucide-react'
import { HR_ACCESS_ROLES } from '@/features/auth/utils/roles.js'

export const hrNavItems = [
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
