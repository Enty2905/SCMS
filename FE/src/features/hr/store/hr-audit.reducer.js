import { createSlice } from '@reduxjs/toolkit'

import { fetchAuditLogs, fetchAuditPageData } from './hr-audit.thunks.js'

const initialState = {
  logs: [],
  actions: [],
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },
  filters: {
    search: '',
    action: 'all',
    from: '',
    to: '',
  },
  loading: false,
  error: null,
}

const hrAuditSlice = createSlice({
  name: 'hrAudit',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditPageData.pending, startLoading)
      .addCase(fetchAuditPageData.fulfilled, (state, action) => {
        state.loading = false
        applyLogPage(state, action.payload)
        state.actions = action.payload.actions
      })
      .addCase(fetchAuditPageData.rejected, storeError)
      .addCase(fetchAuditLogs.pending, startLoading)
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false
        applyLogPage(state, action.payload)
      })
      .addCase(fetchAuditLogs.rejected, storeError)
  },
})

function applyLogPage(state, { logPage, auditQuery }) {
  state.logs = logPage.content || []
  state.pagination = {
    page: logPage.page ?? 0,
    size: logPage.size ?? state.pagination.size,
    totalElements: logPage.totalElements ?? 0,
    totalPages: logPage.totalPages ?? 0,
    last: logPage.last ?? true,
  }

  if (auditQuery) {
    state.filters = {
      search: auditQuery.search ?? '',
      action: auditQuery.action ?? 'all',
      from: auditQuery.from ?? '',
      to: auditQuery.to ?? '',
    }
  }
}

function startLoading(state) {
  state.loading = true
  state.error = null
}

function storeError(state, action) {
  state.loading = false
  state.error = action.error.message || 'Không tải được nhật ký thao tác.'
}

export const hrAuditReducer = hrAuditSlice.reducer
