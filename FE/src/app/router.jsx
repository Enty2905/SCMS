import { createBrowserRouter, Navigate } from 'react-router-dom'

import { LoginPage } from '@/features/auth/pages/LoginPage.jsx'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage.jsx'
import { AppShell } from '@/shared/components/layout/AppShell.jsx'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
