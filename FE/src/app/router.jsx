import { createBrowserRouter, Navigate } from 'react-router-dom'

import { LoginPage } from '@/features/auth/pages/LoginPage.jsx'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage.jsx'
import { hrRoutes } from '@/features/hr/hr.routes.jsx'
import { inventoryRoutes } from '@/features/inventory/inventory.routes.jsx'
<<<<<<< HEAD
import { maintenanceRoutes } from '@/features/maintenance/maintenance.routes.jsx'
=======
import { equipmentRoutes } from '@/features/equipment/equipment.routes.jsx'
>>>>>>> f69937a9900c3e71ce48655c72057db40d48226f
import { AppShell } from '@/shared/components/layout/AppShell.jsx'

import {
  AccessDeniedPage,
  RequireAuth,
} from './RouteGuards.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      ...hrRoutes,
      ...inventoryRoutes,
<<<<<<< HEAD
      ...maintenanceRoutes,
=======
      ...equipmentRoutes,
>>>>>>> f69937a9900c3e71ce48655c72057db40d48226f
      {
        path: 'access-denied',
        element: <AccessDeniedPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
