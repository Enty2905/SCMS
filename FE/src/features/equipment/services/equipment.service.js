import { apiClient } from '@/shared/api/httpClient.js'

export async function fetchEquipments(keyword) {
  if (keyword) {
    const params = new URLSearchParams()
    params.set('keyword', keyword)
    const response = await apiClient.get(`/equipment/search?${params}`)
    return response.data || []
  }
  const response = await apiClient.get('/equipment')
  return response.data || []
}

export async function getEquipmentById(id) {
  const response = await apiClient.get(`/equipment/${id}`)
  return response.data
}

export async function createEquipment(data) {
  const response = await apiClient.post('/equipment', data)
  return response.data
}

export async function updateEquipment(id, data) {
  const response = await apiClient.put(`/equipment/${id}`, data)
  return response.data
}

export async function deleteEquipment(id) {
  const response = await apiClient.delete(`/equipment/${id}`)
  return response.data
}

// Systems Services
export async function fetchSystems(keyword) {
  if (keyword) {
    const params = new URLSearchParams()
    params.set('keyword', keyword)
    const response = await apiClient.get(`/equipment-systems/search?${params}`)
    return response.data || []
  }
  const response = await apiClient.get('/equipment-systems')
  return response.data || []
}

export async function getSystemById(id) {
  const response = await apiClient.get(`/equipment-systems/${id}`)
  return response.data
}

export async function createSystem(data) {
  const response = await apiClient.post('/equipment-systems', data)
  return response.data
}

export async function updateSystem(id, data) {
  const response = await apiClient.put(`/equipment-systems/${id}`, data)
  return response.data
}

export async function deleteSystem(id) {
  const response = await apiClient.delete(`/equipment-systems/${id}`)
  return response.data
}
