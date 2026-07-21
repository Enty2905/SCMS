import { apiClient } from '@/shared/api/httpClient.js'

export const sparePartImportService = {
  create: async (data) => {
    const response = await apiClient.post('/spare-part-imports', data)
    return response.data
  },

  getAll: async (params) => {
    const response = await apiClient.get('/spare-part-imports', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await apiClient.get(`/spare-part-imports/${id}`)
    return response.data
  },
}
