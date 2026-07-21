import { ClipboardList, FileText } from 'lucide-react'

import { ROLES } from '@/features/auth/utils/roles.js'

export const MAINTENANCE_ROLES = [ROLES.ADMIN, ROLES.REPAIR_MANAGER, ROLES.TEAM_LEADER]
export const ASSESSMENT_ROLES = [ROLES.ADMIN, ROLES.TEAM_LEADER]
export const WORK_ORDER_ROLES = [ROLES.ADMIN, ROLES.REPAIR_MANAGER, ROLES.TEAM_LEADER]

export const maintenanceNavItems = [
  {
    label: 'Phiếu công tác',
    href: '/dashboard/maintenance/work-orders',
    icon: ClipboardList,
    roles: WORK_ORDER_ROLES,
  },
  {
    label: 'Yêu cầu sửa chữa',
    href: '/dashboard/maintenance/requests',
    icon: ClipboardList,
    roles: MAINTENANCE_ROLES,
  },
  {
    label: 'Biên bản kỹ thuật',
    href: '/dashboard/maintenance/assessments',
    icon: FileText,
    roles: ASSESSMENT_ROLES,
  },
  {
    label: 'Yêu cầu cấp vật tư',
    href: '/dashboard/maintenance/material-requests',
    icon: FileText,
    roles: MAINTENANCE_ROLES,
  },
  {
    label: 'Lịch sử sửa chữa',
    href: '/dashboard/maintenance/repair-histories',
    icon: ClipboardList,
    roles: MAINTENANCE_ROLES,
  },
]
