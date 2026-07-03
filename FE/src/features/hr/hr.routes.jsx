import { Navigate } from 'react-router-dom'
import { DepartmentListPage } from './pages/DepartmentListPage.jsx'
import { EmployeeListPage } from './pages/EmployeeListPage.jsx'
import { HrReportsPage } from './pages/HrReportsPage.jsx'
import { UserAccountsPage } from '@/features/user/pages/UserAccountsPage.jsx'
import { RequireRole } from '@/app/RouteGuards.jsx'
import { HR_ACCESS_ROLES } from '@/features/auth/utils/roles.js'

export const hrRoutes = [
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
    element: <Navigate replace to="/dashboard/hr/accounts" />,
  },
]
