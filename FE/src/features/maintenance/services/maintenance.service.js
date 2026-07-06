import { apiClient } from '@/shared/api/httpClient.js'

// ── Repair Request ───────────────────────────────────────────────────────────

export async function fetchPendingRequestsService() {
  const response = await apiClient.get('/maintenance/requests/pending')
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

