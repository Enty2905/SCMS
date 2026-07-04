import { ClipboardList, LayoutDashboard, Package2 } from 'lucide-react'
import { ROLES } from '@/features/auth/utils/roles.js'

export const inventoryNavItems = [
  // Thủ kho vật tư
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: [ROLES.WAREHOUSE_MAT],
  },
  {
    label: 'Danh mục vật tư',
    href: '/dashboard/inventory/materials',
    icon: Package2,
    roles: [ROLES.WAREHOUSE_MAT],
  },
  // Thủ kho CCDC
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: [ROLES.WAREHOUSE_TOOL],
  },
  {
    label: 'Danh sách CCDC',
    href: '/dashboard/inventory/tools',
    icon: ClipboardList,
    roles: [ROLES.WAREHOUSE_TOOL],
  },
]
