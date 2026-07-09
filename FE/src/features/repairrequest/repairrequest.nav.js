import { ClipboardList } from 'lucide-react'
import { ROLES } from '@/features/auth/utils/roles.js'

export const repairRequestNavItems = [
  {
    label: 'Yêu cầu sửa chữa',
    href: '/dashboard/repair-requests/my',
    icon: ClipboardList,
    roles: [ROLES.SHIFT_LEADER, ROLES.OPS_MANAGER, ROLES.ADMIN],
  },
]
