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

export async function fetchEquipmentImages(equipmentId) {
  const response = await apiClient.get(`/equipment/${equipmentId}/images`)
  return response.data || []
}

export async function uploadEquipmentImage(equipmentId, file) {
  const token = window.localStorage.getItem('scms.auth.token')
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(
    apiClient.url(`/equipment/${equipmentId}/images/upload`),
    {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }
  )

  if (!response.ok) {
    const errData = await response.json().catch(() => null)
    throw new Error(errData?.message || `Upload ảnh thất bại: ${response.status}`)
  }

  const payload = await response.json()
  return payload.data
}

export async function deleteEquipmentImage(imageId) {
  const response = await apiClient.delete(`/equipment/images/${imageId}`)
  return response.data
}

export async function fetchTechnicalParams() {
  const response = await apiClient.get('/equipment/params')
  return response.data || []
}

export async function fetchUnits() {
  const response = await apiClient.get('/equipment/units')
  return response.data || []
}

export async function exportEquipmentExcelService(filters = {}) {
  const token = window.localStorage.getItem('scms.auth.token')
  const params = new URLSearchParams()
  if (filters.kksCode) params.set('kksCode', filters.kksCode)
  if (filters.name) params.set('name', filters.name)
  if (filters.systemId && filters.systemId !== 'all') params.set('systemId', filters.systemId)
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)

  const response = await fetch(
    apiClient.url(`/equipment/export-excel?${params}`),
    {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Không thể tải file Excel: ${response.status}`)
  }

  return response.blob()
}

export async function exportSingleEquipmentExcelService(id) {
  const token = window.localStorage.getItem('scms.auth.token')
  const response = await fetch(
    apiClient.url(`/equipment/${id}/export-excel`),
    {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Không thể tải file Excel: ${response.status}`)
  }

  return response.blob()
}
