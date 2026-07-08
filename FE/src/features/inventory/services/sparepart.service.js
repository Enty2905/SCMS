import { apiClient } from '@/shared/api/httpClient.js'

export async function fetchSpareParts({ code, name, page = 0, size = 10 }) {
  const params = new URLSearchParams()
  if (code) params.set('code', code)
  if (name) params.set('name', name)
  params.set('page', String(page))
  params.set('size', String(size))
  const response = await apiClient.get(`/spare-parts?${params}`)
  return response.data
}

export async function createSparePart(data) {
  const response = await apiClient.post('/spare-parts', data)
  return response.data
}

export async function updateSparePart(id, data) {
  const response = await apiClient.put(`/spare-parts/${id}`, data)
  return response.data
}

export async function deleteSparePart(id) {
  await apiClient.delete(`/spare-parts/${id}`)
}
