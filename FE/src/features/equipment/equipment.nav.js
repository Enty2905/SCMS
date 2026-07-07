import { Network } from 'lucide-react'
import { ROLES } from '@/features/auth/utils/roles.js'

export const equipmentNavItems = [
  {
    label: 'Hệ thống thiết bị',
    href: '/dashboard/equipment-systems',
    icon: Network,
    roles: [ROLES.OPS_MANAGER, ROLES.ADMIN],
  },
]
