import { RequireRole } from '@/app/RouteGuards.jsx'
import { ROLES } from '@/features/auth/utils/roles.js'
import { MaterialDashboardPage } from './pages/MaterialDashboardPage.jsx'
import { MaterialListPage } from './pages/MaterialListPage.jsx'
import { ConsumableImportPage } from './pages/ConsumableImportPage.jsx'
import { ConsumableStockPage } from './pages/ConsumableStockPage.jsx'
import { ToolDashboardPage } from './pages/ToolDashboardPage.jsx'
import { ToolListPage } from './pages/ToolListPage.jsx'
import { DamagedToolPage } from './pages/DamagedToolPage.jsx'

export const inventoryRoutes = [
  // Thủ kho vật tư
  {
    path: 'inventory/dashboard-material',
    element: (
      <RequireRole roles={[ROLES.WAREHOUSE_MAT]}>
        <MaterialDashboardPage />
      </RequireRole>
    ),
  },
  {
    path: 'inventory/materials',
    element: (
      <RequireRole roles={[ROLES.WAREHOUSE_MAT]}>
        <MaterialListPage />
      </RequireRole>
    ),
  },
  {
    path: 'inventory/consumable-imports',
    element: (
      <RequireRole roles={[ROLES.WAREHOUSE_MAT]}>
        <ConsumableImportPage />
      </RequireRole>
    ),
  },
  {
    path: 'inventory/consumable-stocks',
    element: (
      <RequireRole roles={[ROLES.WAREHOUSE_MAT]}>
        <ConsumableStockPage />
      </RequireRole>
    ),
  },
  // Thủ kho CCDC
  {
    path: 'inventory/dashboard-tool',
    element: (
      <RequireRole roles={[ROLES.WAREHOUSE_TOOL]}>
        <ToolDashboardPage />
      </RequireRole>
    ),
  },
  {
    path: 'inventory/tools',
    element: (
      <RequireRole roles={[ROLES.WAREHOUSE_TOOL]}>
        <ToolListPage />
      </RequireRole>
    ),
  },
  {
    path: 'inventory/damaged-tools',
    element: (
      <RequireRole roles={[ROLES.WAREHOUSE_TOOL]}>
        <DamagedToolPage />
      </RequireRole>
    ),
  },
]
