import { Network, Wrench } from 'lucide-react'
import { ROLES } from '@/features/auth/utils/roles.js'

export const equipmentNavItems = [
  {
    label: 'Danh sách thiết bị',
    href: '/dashboard/equipment',
    icon: Wrench,
    roles: [ROLES.OPS_MANAGER, ROLES.ADMIN],
  },
  {
    label: 'Hệ thống thiết bị',
    href: '/dashboard/equipment-systems',
    icon: Network,
    roles: [ROLES.OPS_MANAGER, ROLES.ADMIN],
  },
]
