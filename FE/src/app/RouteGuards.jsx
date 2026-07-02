import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

import {
  selectAuthToken,
  selectCurrentUser,
} from '@/features/auth/store/auth.selectors.js'
import { hasAnyRole } from '@/features/auth/utils/roles.js'

export function RequireAuth({ children }) {
  const token = useSelector(selectAuthToken)

  if (!token) {
    return <Navigate to="/" replace />
  }

  return children
}

export function RequireRole({ children, roles }) {
  const user = useSelector(selectCurrentUser)

  if (!hasAnyRole(user, roles)) {
    return <Navigate to="/dashboard/access-denied" replace />
  }

  return children
}

export function AccessDeniedPage() {
  return (
    <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-950">Không có quyền truy cập</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Tài khoản hiện tại không thuộc nhóm được phép xem chức năng này.
      </p>
    </section>
  )
}
