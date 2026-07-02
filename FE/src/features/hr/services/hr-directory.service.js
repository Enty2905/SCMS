import { apiClient } from '@/shared/api/httpClient.js'

export async function fetchEmployeesService() {
  const response = await apiClient.get('/hr/employees')
  return response.data || []
}

export async function fetchDepartmentsService() {
  const response = await apiClient.get('/hr/departments')
  return response.data || []
}
