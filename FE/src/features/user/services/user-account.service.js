import { apiClient } from '@/shared/api/httpClient.js'

/**
 * Một trang tài khoản kèm bộ lọc: từ khóa, trạng thái, phòng ban và vai trò.
 */
export async function fetchAccountsService({
  search = '',
  status = 'all',
  departmentId = '',
  roleCode = '',
  page = 0,
  size = 10,
} = {}) {
  const response = await apiClient.get(
    `/hr/accounts${buildQuery({ search, status, departmentId, roleCode, page, size })}`,
  )

  return response.data || emptyPage(size)
}

export async function fetchEmployeesWithoutAccountService() {
  const response = await apiClient.get('/hr/employees/without-account')
  return response.data || []
}

export async function fetchAssignableRolesService() {
  const response = await apiClient.get('/hr/assignable-roles')
  return response.data || []
}

export async function fetchDepartmentOptionsService() {
  const response = await apiClient.get('/hr/departments')
  return response.data || []
}

export async function createAccountService(payload) {
  const response = await apiClient.post('/hr/accounts', payload)
  return response.data
}

export async function updateAccountRolesService(userId, roleIds) {
  const response = await apiClient.put(`/hr/accounts/${userId}/roles`, { roleIds })
  return response.data
}

export async function resetAccountPasswordService(userId, newPassword) {
  const response = await apiClient.post(`/hr/accounts/${userId}/reset-password`, { newPassword })
  return response.data
}

export async function updateAccountStatusService(userId, active) {
  const response = await apiClient.patch(`/hr/accounts/${userId}/status`, {
    active,
  })
  return response.data
}

export async function deleteAccountService(userId) {
  const response = await apiClient.delete(`/hr/accounts/${userId}`)
  return response.data
}

function emptyPage(size) {
  return { content: [], page: 0, size, totalElements: 0, totalPages: 0, last: true }
}

/**
 * Bỏ qua tham số rỗng và giá trị "all" để URL chỉ mang bộ lọc thực sự được chọn.
 */
function buildQuery(params) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      query.append(key, value)
    }
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}
