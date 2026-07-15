import { apiClient } from '@/shared/api/httpClient.js'

/**
 * Tạo phiếu mượn CCDC
 * @param {{ toolId: string, employeeId: string, quantity: number, dueDate: string, note?: string }} data
 */
export async function createToolBorrow(data) {
  const response = await apiClient.post('/tool-borrows', data)
  return response.data
}

/**
 * Lấy danh sách phiếu mượn với tìm kiếm và lọc
 * @param {{ keyword?: string, status?: string, page?: number, size?: number }} params
 */
export async function getToolBorrows({ keyword, status, page = 0, size = 10 } = {}) {
  const params = new URLSearchParams()
  if (keyword) params.set('keyword', keyword)
  if (status) params.set('status', status)
  params.set('page', String(page))
  params.set('size', String(size))
  const response = await apiClient.get(`/tool-borrows?${params}`)
  return response.data
}

/**
 * Lấy chi tiết phiếu mượn theo ID
 * @param {string} id
 */
export async function getToolBorrowById(id) {
  const response = await apiClient.get(`/tool-borrows/${id}`)
  return response.data
}

/**
 * Xác nhận trả CCDC
 * @param {string} id
 */
export async function returnToolBorrow(id) {
  const response = await apiClient.patch(`/tool-borrows/${id}/return`)
  return response.data
}
