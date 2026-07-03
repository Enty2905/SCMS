import { Package2 } from 'lucide-react'
import { ROLES } from '@/features/auth/utils/roles.js'

export const inventoryNavItems = [
  {
    label: 'Quản lý Kho',
    href: '/dashboard/inventory',
    icon: Package2,
    roles: [ROLES.WAREHOUSE_MAT, ROLES.WAREHOUSE_TOOL],
  }
]
