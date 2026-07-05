import { apiClient } from '@/shared/api/httpClient.js'

export async function fetchConsumables(keyword, page = 0, size = 10) {
  const params = new URLSearchParams()
  if (keyword) params.set('keyword', keyword)
  params.set('page', String(page))
  params.set('size', String(size))
  const response = await apiClient.get(`/consumables?${params}`)
  return response.data
}

export async function createConsumable(data) {
  const response = await apiClient.post('/consumables', data)
  return response.data
}

export async function updateConsumable(id, data) {
  const response = await apiClient.put(`/consumables/${id}`, data)
  return response.data
}

export async function deleteConsumable(id) {
  await apiClient.delete(`/consumables/${id}`)
}
