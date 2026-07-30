import { createBrowserRouter, Navigate } from 'react-router-dom'

import { LoginPage } from '@/features/auth/pages/LoginPage.jsx'
import { chatRoutes } from '@/features/chat/chat.routes.jsx'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage.jsx'
import { hrRoutes } from '@/features/hr/hr.routes.jsx'
import { inventoryRoutes } from '@/features/inventory/inventory.routes.jsx'
import { equipmentRoutes } from '@/features/equipment/equipment.routes.jsx'
import { maintenanceRoutes } from '@/features/maintenance/maintenance.routes.jsx'
import { repairRequestRoutes } from '@/features/repairrequest/repairrequest.routes.jsx'
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
      ...equipmentRoutes,
      ...maintenanceRoutes,
      ...repairRequestRoutes,
      ...chatRoutes,
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
