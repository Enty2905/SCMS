import { createSlice } from '@reduxjs/toolkit'

import {
  fetchMyRequests,
  fetchAllRequests,
  createRequest,
  deleteRequest,
} from './repairrequest.thunks.js'

const initialState = {
  // Danh sách hiển thị (my-requests hoặc all)
  items: [],
  loading: false,
  submitting: false,
  error: null,
}

const repairRequestSlice = createSlice({
  name: 'repairRequest',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchMyRequests ──────────────────────────────────────────────────
      .addCase(fetchMyRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload || []
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Không tải được danh sách yêu cầu'
      })

      // ── fetchAllRequests ─────────────────────────────────────────────────
      .addCase(fetchAllRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllRequests.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload || []
      })
      .addCase(fetchAllRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Không tải được danh sách yêu cầu'
      })

      // ── createRequest ────────────────────────────────────────────────────
      .addCase(createRequest.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createRequest.fulfilled, (state) => {
        state.submitting = false
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.submitting = false
        state.error = action.error.message || 'Không thể tạo yêu cầu sửa chữa'
      })

      // ── deleteRequest ────────────────────────────────────────────────────
      .addCase(deleteRequest.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteRequest.fulfilled, (state, action) => {
        state.submitting = false
        // Xóa khỏi danh sách ngay lập tức (optimistic update)
        state.items = state.items.filter(
          (item) => item.requestId !== action.payload,
        )
      })
      .addCase(deleteRequest.rejected, (state, action) => {
        state.submitting = false
        state.error = action.error.message || 'Không thể xóa yêu cầu sửa chữa'
      })
  },
})

export const { clearError } = repairRequestSlice.actions
export const repairRequestReducer = repairRequestSlice.reducer
