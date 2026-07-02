export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  HR: 'ROLE_HR',
  NHAN_SU: 'ROLE_NHAN_SU',
  WAREHOUSE_MAT: 'ROLE_WAREHOUSE_MAT',
  WAREHOUSE_TOOL: 'ROLE_WAREHOUSE_TOOL',
  OPS_MANAGER: 'ROLE_OPS_MANAGER',
  SHIFT_LEADER: 'ROLE_SHIFT_LEADER',
  REPAIR_MANAGER: 'ROLE_REPAIR_MANAGER',
  TEAM_LEADER: 'ROLE_TEAM_LEADER',
  USER: 'ROLE_USER',
}

const roleLabels = {
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.HR]: 'Nhân sự',
  [ROLES.NHAN_SU]: 'Nhân sự',
  [ROLES.WAREHOUSE_MAT]: 'Thủ kho vật tư',
  [ROLES.WAREHOUSE_TOOL]: 'Thủ kho CCDC',
  [ROLES.OPS_MANAGER]: 'Quản đốc vận hành',
  [ROLES.SHIFT_LEADER]: 'Trưởng ca',
  [ROLES.REPAIR_MANAGER]: 'Quản đốc sửa chữa',
  [ROLES.TEAM_LEADER]: 'Tổ trưởng sửa chữa',
  [ROLES.USER]: 'Người dùng',
}

export const HR_ACCESS_ROLES = [ROLES.ADMIN, ROLES.HR, ROLES.NHAN_SU]

export function hasAnyRole(user, allowedRoles = []) {
  if (!allowedRoles.length) {
    return true
  }

  const userRoles = user?.roles || []

  if (userRoles.includes(ROLES.ADMIN)) {
    return true
  }

  return allowedRoles.some((role) => userRoles.includes(role))
}

export function isHrUser(user) {
  return hasAnyRole(user, [ROLES.HR, ROLES.NHAN_SU])
}

export function getPrimaryRoleLabel(user) {
  const role = user?.roles?.find((item) => roleLabels[item])

  return roleLabels[role] || 'Người dùng'
}
