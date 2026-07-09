import { apiClient } from '@/shared/api/httpClient.js'

/**
 * Trưởng Ca: Lấy danh sách request do mình tạo (có phân trang client-side)
 */
export async function fetchMyRepairRequests() {
  const response = await apiClient.get('/repair-requests/my-requests')
  return response.data // { status, message, data: [...] }
}

/**
 * Quản đốc SC / Tổ trưởng: Lấy tất cả request, lọc theo status
 * @param {string|null} status - 'pending' | 'confirmed' | 'in_progress' | 'done' | 'cancelled' | null (tất cả)
 */
export async function fetchAllRepairRequests(status = null) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  const query = params.toString() ? `?${params}` : ''
  const response = await apiClient.get(`/repair-requests${query}`)
  return response.data
}

/**
 * Trưởng Ca: Tạo mới yêu cầu sửa chữa
 * @param {{ equipmentId: string, description: string, priority?: string }} data
 */
export async function createRepairRequest(data) {
  const response = await apiClient.post('/repair-requests', data)
  return response.data
}

/**
 * Trưởng Ca: Xóa yêu cầu sửa chữa (chỉ khi còn pending)
 * @param {string} requestId
 */
export async function deleteRepairRequest(requestId) {
  await apiClient.delete(`/repair-requests/${requestId}`)
}
