import { apiClient } from '@/shared/api/httpClient.js'

/**
 * Một trang nhật ký thao tác, lọc theo từ khóa, loại thao tác và khoảng ngày.
 */
export async function fetchAuditLogsService({
  search = '',
  action = 'all',
  from = '',
  to = '',
  page = 0,
  size = 20,
} = {}) {
  const response = await apiClient.get(
    `/hr/audit-logs${buildQuery({ search, action, from, to, page, size })}`,
  )

  return response.data || { content: [], page: 0, size, totalElements: 0, totalPages: 0, last: true }
}

export async function fetchAuditActionsService() {
  const response = await apiClient.get('/hr/audit-actions')
  return response.data || []
}

/**
 * Bỏ qua tham số rỗng và giá trị "all" để URL chỉ mang bộ lọc thực sự được chọn.
 */
function buildQuery(params) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      query.append(key, value)
    }
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}
