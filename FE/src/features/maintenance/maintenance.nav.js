import { ClipboardList, FileText } from 'lucide-react'

import { ROLES } from '@/features/auth/utils/roles.js'

export const MAINTENANCE_ROLES = [ROLES.ADMIN, ROLES.REPAIR_MANAGER, ROLES.TEAM_LEADER]
export const ASSESSMENT_ROLES = [ROLES.ADMIN, ROLES.TEAM_LEADER]

export const maintenanceNavItems = [
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
]
