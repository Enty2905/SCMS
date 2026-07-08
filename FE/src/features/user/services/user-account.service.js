import { apiClient } from '@/shared/api/httpClient.js'

export async function fetchAccountsService() {
  const response = await apiClient.get('/hr/accounts')
  return response.data || []
}

export async function fetchEmployeesWithoutAccountService() {
  const response = await apiClient.get('/hr/employees/without-account')
  return response.data || []
}

export async function createAccountService(payload) {
  const response = await apiClient.post('/hr/accounts', payload)
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
