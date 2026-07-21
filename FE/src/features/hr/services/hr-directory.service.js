import { apiClient } from '@/shared/api/httpClient.js'

export async function fetchEmployeesService() {
  const response = await apiClient.get('/hr/employees')
  return response.data || []
}

export async function fetchDepartmentsService() {
  const response = await apiClient.get('/hr/departments')
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

function toEmployeeFormData(payload) {
  const formData = new FormData()
  formData.append('employeeName', payload.employeeName || '')

  appendIfPresent(formData, 'phone', payload.phone)
  appendIfPresent(formData, 'email', payload.email)
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
