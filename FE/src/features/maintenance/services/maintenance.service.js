import { apiClient } from '@/shared/api/httpClient.js'

// ── Repair Request ───────────────────────────────────────────────────────────

export async function fetchPendingRequestsService() {
  const response = await apiClient.get('/repair-requests/pending')
  return response.data || []
}

// ── Work Order (PCT) ─────────────────────────────────────────────────────────

export async function createWorkOrderService(body) {
  const response = await apiClient.post('/maintenance/work-orders', body)
  return response.data
}

export async function getWorkOrderService(orderId) {
  const response = await apiClient.get(`/maintenance/work-orders/${orderId}`)
  return response.data
}

// ── Technical Assessment (Biên bản đánh giá kỹ thuật) ───────────────────────

export async function createAssessmentService(body) {
  const response = await apiClient.post('/maintenance/assessments', body)
  return response.data
}

export async function getAssessmentService(assessmentId) {
  const response = await apiClient.get(`/maintenance/assessments/${assessmentId}`)
  return response.data
}

/**
 * Export PDF – trả về Blob để trigger download trên trình duyệt
 */
export async function exportPdfService(assessmentId) {
  const token = window.localStorage.getItem('scms.auth.token')
  const response = await fetch(
    apiClient.url(`/maintenance/assessments/${assessmentId}/export-pdf`),
    {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Không thể xuất PDF: ${response.status}`)
  }

  return response.blob()
}

/**
 * Upload file PDF đã ký – dùng multipart/form-data
 */
export async function uploadSignedPdfService(assessmentId, file) {
  const token = window.localStorage.getItem('scms.auth.token')
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(
    apiClient.url(`/maintenance/assessments/${assessmentId}/upload-signed-pdf`),
    {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Không set Content-Type – browser tự set boundary cho multipart
      },
      body: formData,
    },
  )

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message || `Upload thất bại: ${response.status}`)
  }

  const payload = await response.json()
  return payload.data
}

export async function fetchAssessmentsService() {
  const response = await apiClient.get('/maintenance/assessments')
  return response.data || []
}

export async function downloadSignedPdfService(assessmentId) {
  const token = window.localStorage.getItem('scms.auth.token')
  const response = await fetch(
    apiClient.url(`/maintenance/assessments/${assessmentId}/download-signed`),
    {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Không thể lấy PDF đã ký: ${response.status}`)
  }

  return response.blob()
}

// ── Work Orders (PCT List) ───────────────────────────────────────────────────

export async function fetchWorkOrdersService({ orderNumber, kksCode } = {}) {
  const params = new URLSearchParams()
  if (orderNumber) params.set('orderNumber', orderNumber)
  if (kksCode) params.set('kksCode', kksCode)
  const query = params.toString()
  const response = await apiClient.get(`/maintenance/work-orders${query ? '?' + query : ''}`)
  return response.data || []
}

export async function searchWorkOrdersService({ keyword = '', page = 0, size = 10 } = {}) {
  const params = new URLSearchParams()
  if (keyword) params.set('keyword', keyword)
  params.set('page', String(page))
  params.set('size', String(size))
  const response = await apiClient.get(`/maintenance/work-orders/search?${params}`)
  return response.data
}

// ── Daily Log (Nhật ký PCT) ──────────────────────────────────────────────────

export async function openDailyLogService(orderId) {
  const response = await apiClient.post(`/maintenance/work-orders/${orderId}/daily-logs/open`)
  return response.data
}

export async function closeDailyLogService(orderId, note = '') {
  const body = note ? { note } : {}
  const response = await apiClient.post(`/maintenance/work-orders/${orderId}/daily-logs/close`, body)
  return response.data
}

export async function fetchDailyLogsService(orderId, { page = 0, size = 10 } = {}) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  const response = await apiClient.get(`/maintenance/work-orders/${orderId}/daily-logs?${params}`)
  return response.data || { content: [], totalPages: 0, totalElements: 0 }
}

export async function completeWorkOrderService(orderId) {
  const response = await apiClient.post(`/maintenance/work-orders/${orderId}/complete`)
  return response.data
}

export async function exportWorkOrderPdfService(orderId) {
  const token = window.localStorage.getItem('scms.auth.token')
  const response = await fetch(
    apiClient.url(`/maintenance/work-orders/${orderId}/export-pdf`),
    {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  )
  if (!response.ok) {
    throw new Error(`Không thể xuất PDF: ${response.status}`)
  }
  return response.blob()
}

// ── Consumable Request ────────────────────────────────────────────────────────

export async function fetchConsumableRequestsService({ reqNumber, orderNumber, page = 0, size = 10 } = {}) {
  const params = new URLSearchParams()
  if (reqNumber) params.set('reqNumber', reqNumber)
  if (orderNumber) params.set('orderNumber', orderNumber)
  params.set('page', String(page))
  params.set('size', String(size))
  const response = await apiClient.get(`/maintenance/consumable-requests?${params}`)
  return response.data
}

export async function createConsumableRequestService(body) {
  const response = await apiClient.post('/maintenance/consumable-requests', body)
  return response.data
}

export async function exportConsumableRequestPdfService(reqId) {
  const token = window.localStorage.getItem('scms.auth.token')
  const response = await fetch(
    apiClient.url(`/maintenance/consumable-requests/${reqId}/export-pdf`),
    {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Không thể xuất PDF: ${response.status}`)
  }

  return response.blob()
}

// ── Spare Part Request ────────────────────────────────────────────────────────

export async function fetchSparePartRequestsService({ reqNumber, orderNumber, page = 0, size = 10 } = {}) {
  const params = new URLSearchParams()
  if (reqNumber) params.set('reqNumber', reqNumber)
  if (orderNumber) params.set('orderNumber', orderNumber)
  params.set('page', String(page))
  params.set('size', String(size))
  const response = await apiClient.get(`/maintenance/spare-part-requests?${params}`)
  return response.data
}

export async function createSparePartRequestService(body) {
  const response = await apiClient.post('/maintenance/spare-part-requests', body)
  return response.data
}

export async function exportSparePartRequestPdfService(reqId) {
  const token = window.localStorage.getItem('scms.auth.token')
  const response = await fetch(
    apiClient.url(`/maintenance/spare-part-requests/${reqId}/export-pdf`),
    {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Không thể xuất PDF: ${response.status}`)
  }

  return response.blob()
}

// ── Repair History ────────────────────────────────────────────────────────────

export async function fetchRepairHistoriesService({ equipmentId, kksCode, equipmentName, orderNumber, page = 0, size = 10 } = {}) {
  const params = new URLSearchParams()
  if (equipmentId) params.set('equipmentId', equipmentId)
  if (kksCode) params.set('kksCode', kksCode)
  if (equipmentName) params.set('equipmentName', equipmentName)
  if (orderNumber) params.set('orderNumber', orderNumber)
  params.set('page', String(page))
  params.set('size', String(size))
  const response = await apiClient.get(`/maintenance/repair-histories?${params}`)
  return response.data
}

export async function createRepairHistoryService(body) {
  const response = await apiClient.post('/maintenance/repair-histories', body)
  return response.data
}

