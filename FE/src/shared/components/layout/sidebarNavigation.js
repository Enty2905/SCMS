import {
  ClipboardList,
  Factory,
  MessageSquare,
  Package2,
  UsersRound,
  Wrench,
} from 'lucide-react'

import { hasAnyRole, ROLES } from '@/features/auth/utils/roles.js'
import { chatNavItems } from '@/features/chat/chat.nav.js'
import { equipmentNavItems } from '@/features/equipment/equipment.nav.js'
import { hrNavItems } from '@/features/hr/hr.nav.js'
import { inventoryNavItems } from '@/features/inventory/inventory.nav.js'
import { maintenanceNavItems } from '@/features/maintenance/maintenance.nav.js'
import { repairRequestNavItems } from '@/features/repairrequest/repairrequest.nav.js'

const materialNavItems = inventoryNavItems.filter((item) =>
  item.roles.includes(ROLES.WAREHOUSE_MAT),
)
const toolNavItems = inventoryNavItems.filter((item) =>
  item.roles.includes(ROLES.WAREHOUSE_TOOL),
)
const dailyLogNavItems = maintenanceNavItems.filter((item) =>
  item.href.endsWith('/daily-logs'),
)
const repairNavItems = maintenanceNavItems.filter(
  (item) => !item.href.endsWith('/daily-logs'),
)

export const sidebarNavGroups = [
  {
    id: 'common',
    label: 'Chat',
    icon: MessageSquare,
    items: chatNavItems,
  },
  {
    id: 'hr',
    label: 'Nhân sự',
    icon: UsersRound,
    items: hrNavItems,
  },
  {
    id: 'material-warehouse',
    label: 'Thủ kho vật tư',
    icon: Package2,
    items: materialNavItems,
  },
  {
    id: 'tool-warehouse',
    label: 'Thủ kho CCDC',
    icon: Wrench,
    items: toolNavItems,
  },
  {
    id: 'operations',
    label: 'Vận hành',
    icon: Factory,
    items: [...equipmentNavItems, ...repairRequestNavItems, ...dailyLogNavItems],
  },
  {
    id: 'maintenance',
    label: 'Sửa chữa',
    icon: ClipboardList,
    items: repairNavItems,
  },
]

export const sidebarNavItems = sidebarNavGroups.flatMap((group) => group.items)

export function getVisibleSidebarGroups(user) {
  return sidebarNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasAnyRole(user, item.roles)),
    }))
    .filter((group) => group.items.length > 0)
}

export function getVisibleSidebarItems(user) {
  return sidebarNavItems.filter((item) => hasAnyRole(user, item.roles))
}

export function isSidebarItemActive(pathname, item) {
  return (
    pathname === item.href ||
    (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
  )
}
