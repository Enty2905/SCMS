import { apiClient } from '@/shared/api/httpClient.js'

export const sparePartStockService = {
  getAll: async (params) => {
    const response = await apiClient.get('/spare-part-stocks', { params })
    return response.data
  },
}
