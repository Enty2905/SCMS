import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  fetchAuditActionsService,
  fetchAuditLogsService,
} from '../services/hr-audit.service.js'

/**
 * Bộ lọc đang áp dụng, để mọi lần tải lại giữ nguyên ngữ cảnh người dùng đang xem.
 */
function currentQuery(getState, overrides = {}) {
  const { filters, pagination } = getState().hrAudit

  return {
    ...filters,
    page: pagination.page,
    size: pagination.size,
    ...overrides,
  }
}

export const fetchAuditPageData = createAsyncThunk(
  'hrAudit/fetchPageData',
  async (query, { getState }) => {
    const auditQuery = currentQuery(getState, query)

    const [logPage, actions] = await Promise.all([
      fetchAuditLogsService(auditQuery),
      fetchAuditActionsService(),
    ])

    return { logPage, actions, auditQuery }
  },
)

export const fetchAuditLogs = createAsyncThunk(
  'hrAudit/fetchLogs',
  async (query, { getState }) => {
    const auditQuery = currentQuery(getState, query)
    const logPage = await fetchAuditLogsService(auditQuery)

    return { logPage, auditQuery }
  },
)
