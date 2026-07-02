import { createBrowserRouter, Navigate } from 'react-router-dom'

import { LoginPage } from '@/features/auth/pages/LoginPage.jsx'
import { HR_ACCESS_ROLES } from '@/features/auth/utils/roles.js'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage.jsx'
import { DepartmentListPage } from '@/features/hr/pages/DepartmentListPage.jsx'
import { EmployeeListPage } from '@/features/hr/pages/EmployeeListPage.jsx'
import { HrReportsPage } from '@/features/hr/pages/HrReportsPage.jsx'
import { UserAccountsPage } from '@/features/users/pages/UserAccountsPage.jsx'
import { AppShell } from '@/shared/components/layout/AppShell.jsx'

import {
  AccessDeniedPage,
  RequireAuth,
  RequireRole,
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
        element: (
          <RequireRole roles={HR_ACCESS_ROLES}>
            <DashboardPage />
          </RequireRole>
        ),
      },
      {
        path: 'hr/departments',
        element: (
          <RequireRole roles={HR_ACCESS_ROLES}>
            <DepartmentListPage />
          </RequireRole>
        ),
      },
      {
        path: 'hr/employees',
        element: (
          <RequireRole roles={HR_ACCESS_ROLES}>
            <EmployeeListPage />
          </RequireRole>
        ),
      },
      {
        path: 'hr/accounts',
        element: (
          <RequireRole roles={HR_ACCESS_ROLES}>
            <UserAccountsPage />
          </RequireRole>
        ),
      },
      {
        path: 'hr/reports',
        element: (
          <RequireRole roles={HR_ACCESS_ROLES}>
            <HrReportsPage />
          </RequireRole>
        ),
      },
      {
        path: 'users/accounts',
        element: <Navigate to="/dashboard/hr/accounts" replace />,
      },
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
