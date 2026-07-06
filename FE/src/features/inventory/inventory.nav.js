import { ClipboardList, Package2 } from 'lucide-react'
import { ROLES } from '@/features/auth/utils/roles.js'

export const inventoryNavItems = [
  {
    label: 'Danh mục vật tư',
    href: '/dashboard/inventory/materials',
    icon: Package2,
    roles: [ROLES.WAREHOUSE_MAT],
  },
  {
    label: 'Danh sách CCDC',
    href: '/dashboard/inventory/tools',
    icon: ClipboardList,
    roles: [ROLES.WAREHOUSE_TOOL],
  },
]
