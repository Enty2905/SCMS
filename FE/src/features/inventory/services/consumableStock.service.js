import { apiClient } from '@/shared/api/httpClient.js'

export async function fetchConsumableStocks(keyword, page = 0, size = 10) {
  const params = new URLSearchParams()
  if (keyword) params.set('keyword', keyword)
  params.set('page', String(page))
  params.set('size', String(size))
  const response = await apiClient.get(`/consumable-stocks?${params}`)
  return response.data
}
