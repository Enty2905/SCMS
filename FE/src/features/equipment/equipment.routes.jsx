import { RequireRole } from '@/app/RouteGuards.jsx'
import { ROLES } from '@/features/auth/utils/roles.js'
import { EquipmentListPage } from './pages/EquipmentListPage.jsx'
import { EquipmentSystemPage } from './pages/EquipmentSystemPage.jsx'

export const equipmentRoutes = [
  {
    path: 'equipment',
    element: (
      <RequireRole roles={[ROLES.OPS_MANAGER, ROLES.ADMIN]}>
        <EquipmentListPage />
      </RequireRole>
    ),
  },
  {
    path: 'equipment-systems',
    element: (
      <RequireRole roles={[ROLES.OPS_MANAGER, ROLES.ADMIN]}>
        <EquipmentSystemPage />
      </RequireRole>
    ),
  },
]
