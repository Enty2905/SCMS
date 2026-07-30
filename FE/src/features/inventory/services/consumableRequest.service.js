import { apiClient } from '@/shared/api/httpClient.js'

/**
 * Lấy danh sách phiếu yêu cầu cấp vật tư tiêu hao
 */
export async function fetchConsumableRequests({ reqNumber, orderNumber, status, page = 0, size = 10 } = {}) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (reqNumber) params.set('reqNumber', reqNumber)
  if (orderNumber) params.set('orderNumber', orderNumber)
  if (status) params.set('status', status)
  const response = await apiClient.get(`/maintenance/consumable-requests?${params}`)
  return response.data
}

/**
 * Lấy chi tiết phiếu yêu cầu cấp vật tư tiêu hao
 */
export async function getConsumableRequestById(id) {
  const response = await apiClient.get(`/maintenance/consumable-requests/${id}`)
  return response.data
}

/**
 * Thủ kho cấp phát vật tư tiêu hao
 * @param {string} id - reqId của phiếu
 * @param {{ items: Array<{ itemId: string, quantityIssued: number }>, note?: string }} data
 */
export async function issueConsumableRequest(id, data) {
  const response = await apiClient.post(`/maintenance/consumable-requests/${id}/issue`, data)
  return response.data
}

/**
 * Thủ kho từ chối phiếu cấp vật tư tiêu hao
 * @param {string} id - reqId của phiếu
 * @param {string} reason - Lý do từ chối
 */
export async function rejectConsumableRequest(id, reason = '') {
  const params = new URLSearchParams()
  if (reason) params.set('reason', reason)
  const response = await apiClient.post(`/maintenance/consumable-requests/${id}/reject?${params}`)
  return response.data
}

/**
 * Upload PDF phiếu cấp vật tư tiêu hao đã ký lên Cloudinary
 */
export async function uploadConsumableRequestPdf(id, file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post(
    `/maintenance/consumable-requests/${id}/upload-pdf`,
    formData
  )
  return response.data
}

/**
 * Tải xuất PDF phiếu (generate PDF từ server)
 */
export async function exportConsumableRequestPdf(id) {
  const response = await apiClient.get(`/maintenance/consumable-requests/${id}/export-pdf`, {
    responseType: 'blob',
  })
  return response
}
