import { apiClient } from '@/shared/api/httpClient.js'

export async function fetchTools(keyword, category, page = 0, size = 10) {
  const params = new URLSearchParams()
  if (keyword) params.set('keyword', keyword)
  if (category) params.set('category', category)
  params.set('page', String(page))
  params.set('size', String(size))
  const response = await apiClient.get(`/tools?${params}`)
  return response.data
}

export async function createTool(data) {
  const response = await apiClient.post('/tools', data)
  return response.data
}

export async function updateTool(id, data) {
  const response = await apiClient.put(`/tools/${id}`, data)
  return response.data
}
