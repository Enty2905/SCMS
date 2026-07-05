import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'
import { hasAnyRole, HR_ACCESS_ROLES, ROLES } from '@/features/auth/utils/roles.js'
import { HrDashboardPage } from '@/features/hr/pages/HrDashboardPage.jsx'

export function DashboardPage() {
  const user = useSelector(selectCurrentUser)
  
  // 1. Nhóm Admin & HR -> Vào xem Bảng tin Nhân sự
  if (hasAnyRole(user, HR_ACCESS_ROLES)) {
    return <HrDashboardPage />
  }

  // 2. Nhóm Kho vật tư / CCDC -> Bay vào trang quản lý kho chung (inventory)
  if (hasAnyRole(user, [ROLES.WAREHOUSE_MAT, ROLES.WAREHOUSE_TOOL])) {
    return <Navigate replace to="/dashboard/inventory" />
  }

  // 4. Mặc định cho các role khác chưa có màn hình Bảng tin riêng
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <h1 className="text-3xl font-semibold text-slate-800">Bảng tin hệ thống</h1>
      <p className="mt-4 text-slate-500 max-w-md">
        Xin chào {user?.name}. Chúc bạn một ngày làm việc hiệu quả!
      </p>
    </div>
  )
}
