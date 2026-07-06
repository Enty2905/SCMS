import { RequireRole } from '@/app/RouteGuards.jsx'

import { RepairRequestPage } from './pages/RepairRequestPage.jsx'
import { TechnicalAssessmentPage } from './pages/TechnicalAssessmentPage.jsx'
import { ASSESSMENT_ROLES, MAINTENANCE_ROLES } from './maintenance.nav.js'

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
]
