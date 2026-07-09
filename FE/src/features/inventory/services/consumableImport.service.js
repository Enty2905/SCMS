import { apiClient } from '@/shared/api/httpClient.js'

export async function fetchConsumableImports(page = 0, size = 10) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  const response = await apiClient.get(`/consumable-imports?${params}`)
  return response.data
}

export async function getConsumableImportById(id) {
  const response = await apiClient.get(`/consumable-imports/${id}`)
  return response.data
}

export async function createConsumableImport(data) {
  const response = await apiClient.post('/consumable-imports', data)
  return response.data
}
