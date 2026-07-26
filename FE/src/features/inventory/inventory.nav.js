import { ArrowRightLeft, ClipboardList, Package2, Wrench, HandHelping } from 'lucide-react'
import { ROLES } from '@/features/auth/utils/roles.js'

export const inventoryNavItems = [
  {
    label: 'Danh mục vật tư',
    href: '/dashboard/inventory/materials',
    icon: Package2,
    roles: [ROLES.WAREHOUSE_MAT],
  },
  {
    label: 'Nhập kho vật tư',
    href: '/dashboard/inventory/consumable-imports',
    icon: ClipboardList,
    roles: [ROLES.WAREHOUSE_MAT],
  },
  {
    label: 'Tồn kho vật tư',
    href: '/dashboard/inventory/consumable-stocks',
    icon: Package2,
    roles: [ROLES.WAREHOUSE_MAT],
  },
  {
    label: 'Cấp phát vật tư',
    href: '/dashboard/inventory/material-dispatch',
    icon: ArrowRightLeft,
    roles: [ROLES.WAREHOUSE_MAT],
  },
  {
    label: 'Danh sách CCDC',
    href: '/dashboard/inventory/tools',
    icon: ClipboardList,
    roles: [ROLES.WAREHOUSE_TOOL],
  },
  {
    label: 'CCDC hư hỏng',
    href: '/dashboard/inventory/damaged-tools',
    icon: Wrench,
    roles: [ROLES.WAREHOUSE_TOOL],
  },
  {
    label: 'Mượn / Trả CCDC',
    href: '/dashboard/inventory/tool-borrows',
    icon: HandHelping,
    roles: [ROLES.WAREHOUSE_TOOL],
  },
]
