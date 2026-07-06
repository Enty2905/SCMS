import { createSlice } from '@reduxjs/toolkit'

import {
  createAssessment,
  createWorkOrder,
  fetchAssessments,
  fetchPendingRequests,
  uploadSignedPdf,
} from './maintenance.thunks.js'


const initialState = {
  // Repair Requests
  requests: [],
  requestsLoading: false,
  requestsError: null,

  // Work Order (PCT)
  workOrder: null,
  workOrderLoading: false,
  workOrderError: null,

  // Technical Assessment (Biên bản)
  assessment: null,
  assessments: [], // Danh sách tất cả biên bản
  assessmentLoading: false,
  assessmentError: null,
}


const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    clearWorkOrderError(state) {
      state.workOrderError = null
    },
    clearAssessmentError(state) {
      state.assessmentError = null
    },
  },
  extraReducers: (builder) => {
    // ── fetchPendingRequests ──────────────────────────────────────────────
    builder
      .addCase(fetchPendingRequests.pending, (state) => {
        state.requestsLoading = true
        state.requestsError = null
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.requestsLoading = false
        state.requests = action.payload
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.requestsLoading = false
        state.requestsError = action.error.message || 'Không tải được danh sách yêu cầu'
      })

    // ── createWorkOrder ───────────────────────────────────────────────────
    builder
      .addCase(createWorkOrder.pending, (state) => {
        state.workOrderLoading = true
        state.workOrderError = null
      })
      .addCase(createWorkOrder.fulfilled, (state, action) => {
        state.workOrderLoading = false
        state.workOrder = action.payload
      })
      .addCase(createWorkOrder.rejected, (state, action) => {
        state.workOrderLoading = false
        state.workOrderError = action.error.message || 'Tạo phiếu công tác thất bại'
      })

    // ── createAssessment ──────────────────────────────────────────────────
    builder
      .addCase(createAssessment.pending, (state) => {
        state.assessmentLoading = true
        state.assessmentError = null
      })
      .addCase(createAssessment.fulfilled, (state, action) => {
        state.assessmentLoading = false
        state.assessment = action.payload
      })
      .addCase(createAssessment.rejected, (state, action) => {
        state.assessmentLoading = false
        state.assessmentError = action.error.message || 'Tạo biên bản thất bại'
      })

    // ── uploadSignedPdf ───────────────────────────────────────────────────
    builder
      .addCase(uploadSignedPdf.pending, (state) => {
        state.assessmentLoading = true
        state.assessmentError = null
      })
      .addCase(uploadSignedPdf.fulfilled, (state, action) => {
        state.assessmentLoading = false
        state.assessment = action.payload
        // Cập nhật lại biên bản tương ứng trong danh sách assessments
        state.assessments = state.assessments.map((a) =>
          a.assessmentId === action.payload.assessmentId ? action.payload : a
        )
      })
      .addCase(uploadSignedPdf.rejected, (state, action) => {
        state.assessmentLoading = false
        state.assessmentError = action.error.message || 'Upload PDF thất bại'
      })

    // ── fetchAssessments ──────────────────────────────────────────────────
    builder
      .addCase(fetchAssessments.pending, (state) => {
        state.assessmentLoading = true
        state.assessmentError = null
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.assessmentLoading = false
        state.assessments = action.payload
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.assessmentLoading = false
        state.assessmentError = action.error.message || 'Không tải được danh sách biên bản'
      })
  },

})

export const { clearWorkOrderError, clearAssessmentError } = maintenanceSlice.actions
export const maintenanceReducer = maintenanceSlice.reducer
