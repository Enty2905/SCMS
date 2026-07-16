import { RequireRole } from '@/app/RouteGuards.jsx'

import { RepairRequestPage } from './pages/RepairRequestPage.jsx'
import { TechnicalAssessmentPage } from './pages/TechnicalAssessmentPage.jsx'
import { MaterialRequestPage } from './pages/MaterialRequestPage.jsx'
import { RepairHistoryPage } from './pages/RepairHistoryPage.jsx'
import { DailyLogPage } from './pages/DailyLogPage.jsx'
import { ASSESSMENT_ROLES, MAINTENANCE_ROLES } from './maintenance.nav.js'
import { ROLES } from '@/features/auth/utils/roles.js'

export const maintenanceRoutes = [
  {
    path: 'maintenance/requests',
    element: (
      <RequireRole roles={MAINTENANCE_ROLES}>
        <RepairRequestPage />
      </RequireRole>
    ),
  },
  {
    path: 'maintenance/assessments',
    element: (
      <RequireRole roles={ASSESSMENT_ROLES}>
        <TechnicalAssessmentPage />
      </RequireRole>
    ),
  },
  {
    path: 'maintenance/material-requests',
    element: (
      <RequireRole roles={MAINTENANCE_ROLES}>
        <MaterialRequestPage />
      </RequireRole>
    ),
  },
  {
    path: 'maintenance/repair-histories',
    element: (
      <RequireRole roles={MAINTENANCE_ROLES}>
        <RepairHistoryPage />
      </RequireRole>
    ),
  },
  {
    path: 'maintenance/daily-logs',
    element: (
      <RequireRole roles={[ROLES.ADMIN, ROLES.SHIFT_LEADER]}>
        <DailyLogPage />
      </RequireRole>
    ),
  },
]
