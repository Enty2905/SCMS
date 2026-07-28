import { apiClient } from '@/shared/api/httpClient.js'

export async function fetchEmployeesService() {
  const response = await apiClient.get('/hr/employees')
  return response.data || []
}

/**
 * Tìm kiếm nhân viên phía server: từ khóa, phòng ban, tình trạng tài khoản.
 * Trả về một trang kết quả kèm tổng số bản ghi.
 */
export async function searchEmployeesService({
  search = '',
  departmentId = '',
  status = 'all',
  accountState = 'all',
  page = 0,
  size = 20,
} = {}) {
  const response = await apiClient.get(
    `/hr/employees/search${buildQuery({ search, departmentId, status, accountState, page, size })}`,
  )

  return response.data || emptyPage(size)
}

/**
 * Danh mục giới tính và tình trạng làm việc hợp lệ, lấy từ máy chủ để không khai báo cứng ở client.
 */
export async function fetchEmployeeOptionsService() {
  const response = await apiClient.get('/hr/employee-options')
  return response.data || { genders: [], statuses: [] }
}

export async function fetchDepartmentEmployeesService(departmentId, search = '') {
  const response = await apiClient.get(
    `/hr/departments/${departmentId}/employees${buildQuery({ search })}`,
  )
  return response.data || []
}

export async function fetchDepartmentsService(search = '') {
  const response = await apiClient.get(`/hr/departments${buildQuery({ search })}`)
  return response.data || []
}

export async function fetchEmployeePositionsService() {
  const response = await apiClient.get('/hr/employee-positions')
  return response.data || []
}

export async function deleteDepartmentService(departmentId) {
  await apiClient.delete(`/hr/departments/${departmentId}`)
}

export async function createDepartmentService(payload) {
  const response = await apiClient.post('/hr/departments', payload)
  return response.data
}

export async function updateDepartmentService(departmentId, payload) {
  const response = await apiClient.put(`/hr/departments/${departmentId}`, payload)
  return response.data
}

export async function createEmployeeService(payload) {
  const response = await apiClient.post('/hr/employees', toEmployeeFormData(payload))
  return response.data
}

export async function updateEmployeeService(employeeId, payload) {
  const response = await apiClient.put(`/hr/employees/${employeeId}`, toEmployeeFormData(payload))
  return response.data
}

export async function deleteEmployeeService(employeeId) {
  await apiClient.delete(`/hr/employees/${employeeId}`)
}

export async function removeEmployeeFromDepartmentService(departmentId, employeeId) {
  const response = await apiClient.delete(
    `/hr/departments/${departmentId}/employees/${employeeId}`,
  )
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

function toEmployeeFormData(payload) {
  const formData = new FormData()
  formData.append('employeeName', payload.employeeName || '')

  appendIfPresent(formData, 'phone', payload.phone)
  appendIfPresent(formData, 'email', payload.email)
  appendIfPresent(formData, 'gender', payload.gender)
  appendIfPresent(formData, 'status', payload.status)
  appendIfPresent(formData, 'departmentId', payload.departmentId)
  appendIfPresent(formData, 'positionId', payload.positionId)
  appendIfPresent(formData, 'workLocation', payload.workLocation)

  if (payload.avatar instanceof File) {
    formData.append('avatar', payload.avatar)
  }

  return formData
}

function appendIfPresent(formData, key, value) {
  if (value !== undefined && value !== null && value !== '') {
    formData.append(key, value)
  }
}
