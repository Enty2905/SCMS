import { RequireRole } from '@/app/RouteGuards.jsx'
import { ROLES } from '@/features/auth/utils/roles.js'
import { MyRepairRequestsPage } from './pages/MyRepairRequestsPage.jsx'

export const repairRequestRoutes = [
  {
    path: 'repair-requests/my',
    element: (
      <RequireRole roles={[ROLES.SHIFT_LEADER, ROLES.OPS_MANAGER, ROLES.ADMIN]}>
        <MyRepairRequestsPage />
      </RequireRole>
    ),
  },
]
