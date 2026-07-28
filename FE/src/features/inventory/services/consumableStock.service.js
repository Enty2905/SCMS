import { apiClient } from '@/shared/api/httpClient.js'

export async function fetchConsumableStocks({ code, name, page = 0, size = 10 }) {
  const params = new URLSearchParams()
  if (code) params.set('code', code)
  if (name) params.set('name', name)
  params.set('page', String(page))
  params.set('size', String(size))
  const response = await apiClient.get(`/consumable-stocks?${params}`)
  return response.data
}
