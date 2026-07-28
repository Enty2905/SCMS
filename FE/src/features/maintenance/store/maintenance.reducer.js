import { createSlice } from '@reduxjs/toolkit'

import {
  createAssessment,
  createWorkOrder,
  fetchAssessments,
  fetchPendingRequests,
  uploadSignedPdf,
  fetchWorkOrders,
  searchWorkOrders,
  fetchConsumableRequests,
  createConsumableRequest,
  fetchSparePartRequests,
  createSparePartRequest,
  fetchRepairHistories,
  createRepairHistory,
} from './maintenance.thunks.js'


const initialState = {
  // Repair Requests
  requests: [],
  requestsLoading: false,
  requestsError: null,

  // Work Order (PCT)
  workOrder: null,
  workOrders: [],
  workOrdersPage: 0,
  workOrdersTotalPages: 0,
  workOrdersTotalElements: 0,
  workOrderLoading: false,
  workOrderError: null,

  // Technical Assessment (Biên bản)
  assessment: null,
  assessments: [], // Danh sách tất cả biên bản
  assessmentLoading: false,
  assessmentError: null,

  // Materials & Requests (Consumable & Spare Part & Repair History)
  consumableRequests: [],
  consumableRequestPage: 0,
  consumableRequestTotalPages: 0,
  consumableRequestTotalElements: 0,

  sparePartRequests: [],
  sparePartRequestPage: 0,
  sparePartRequestTotalPages: 0,
  sparePartRequestTotalElements: 0,

  repairHistories: [],
  repairHistoryPage: 0,
  repairHistoryTotalPages: 0,
  repairHistoryTotalElements: 0,

  materialsLoading: false,
  materialsError: null,
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
    clearMaterialsError(state) {
      state.materialsError = null
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

    // ── fetchWorkOrders ───────────────────────────────────────────────────
    builder
      .addCase(fetchWorkOrders.pending, (state) => {
        state.workOrderLoading = true
        state.workOrderError = null
      })
      .addCase(fetchWorkOrders.fulfilled, (state, action) => {
        state.workOrderLoading = false
        state.workOrders = action.payload
      })
      .addCase(fetchWorkOrders.rejected, (state, action) => {
        state.workOrderLoading = false
        state.workOrderError = action.error.message || 'Không tải được danh sách PCT'
      })

    // ── searchWorkOrders ───────────────────────────────────────────────────
    builder
      .addCase(searchWorkOrders.pending, (state) => {
        state.workOrderLoading = true
        state.workOrderError = null
      })
      .addCase(searchWorkOrders.fulfilled, (state, action) => {
        state.workOrderLoading = false
        state.workOrders = action.payload.content || []
        state.workOrdersPage = action.payload.page || 0
        state.workOrdersTotalPages = action.payload.totalPages || 0
        state.workOrdersTotalElements = action.payload.totalElements || 0
      })
      .addCase(searchWorkOrders.rejected, (state, action) => {
        state.workOrderLoading = false
        state.workOrderError = action.error.message || 'Không tải được danh sách PCT'
      })

    // ── fetchConsumableRequests ───────────────────────────────────────────
    builder
      .addCase(fetchConsumableRequests.pending, (state) => {
        state.materialsLoading = true
        state.materialsError = null
      })
      .addCase(fetchConsumableRequests.fulfilled, (state, action) => {
        state.materialsLoading = false
        state.consumableRequests = action.payload.content || []
        state.consumableRequestPage = action.payload.number || 0
        state.consumableRequestTotalPages = action.payload.totalPages || 0
        state.consumableRequestTotalElements = action.payload.totalElements || 0
      })
      .addCase(fetchConsumableRequests.rejected, (state, action) => {
        state.materialsLoading = false
        state.materialsError = action.error.message || 'Không tải được danh sách phiếu yêu cầu vật tư tiêu hao'
      })

    // ── createConsumableRequest ───────────────────────────────────────────
    builder
      .addCase(createConsumableRequest.pending, (state) => {
        state.materialsLoading = true
        state.materialsError = null
      })
      .addCase(createConsumableRequest.fulfilled, (state) => {
        state.materialsLoading = false
      })
      .addCase(createConsumableRequest.rejected, (state, action) => {
        state.materialsLoading = false
        state.materialsError = action.error.message || 'Tạo phiếu yêu cầu vật tư tiêu hao thất bại'
      })

    // ── fetchSparePartRequests ────────────────────────────────────────────
    builder
      .addCase(fetchSparePartRequests.pending, (state) => {
        state.materialsLoading = true
        state.materialsError = null
      })
      .addCase(fetchSparePartRequests.fulfilled, (state, action) => {
        state.materialsLoading = false
        state.sparePartRequests = action.payload.content || []
        state.sparePartRequestPage = action.payload.number || 0
        state.sparePartRequestTotalPages = action.payload.totalPages || 0
        state.sparePartRequestTotalElements = action.payload.totalElements || 0
      })
      .addCase(fetchSparePartRequests.rejected, (state, action) => {
        state.materialsLoading = false
        state.materialsError = action.error.message || 'Không tải được danh sách phiếu yêu cầu phụ tùng thay thế'
      })

    // ── createSparePartRequest ────────────────────────────────────────────
    builder
      .addCase(createSparePartRequest.pending, (state) => {
        state.materialsLoading = true
        state.materialsError = null
      })
      .addCase(createSparePartRequest.fulfilled, (state) => {
        state.materialsLoading = false
      })
      .addCase(createSparePartRequest.rejected, (state, action) => {
        state.materialsLoading = false
        state.materialsError = action.error.message || 'Tạo phiếu yêu cầu phụ tùng thay thế thất bại'
      })

    // ── fetchRepairHistories ──────────────────────────────────────────────
    builder
      .addCase(fetchRepairHistories.pending, (state) => {
        state.materialsLoading = true
        state.materialsError = null
      })
      .addCase(fetchRepairHistories.fulfilled, (state, action) => {
        state.materialsLoading = false
        state.repairHistories = action.payload.content || []
        state.repairHistoryPage = action.payload.number || 0
        state.repairHistoryTotalPages = action.payload.totalPages || 0
        state.repairHistoryTotalElements = action.payload.totalElements || 0
      })
      .addCase(fetchRepairHistories.rejected, (state, action) => {
        state.materialsLoading = false
        state.materialsError = action.error.message || 'Không tải được danh sách lịch sử sửa chữa'
      })

    // ── createRepairHistory ───────────────────────────────────────────────
    builder
      .addCase(createRepairHistory.pending, (state) => {
        state.materialsLoading = true
        state.materialsError = null
      })
      .addCase(createRepairHistory.fulfilled, (state) => {
        state.materialsLoading = false
      })
      .addCase(createRepairHistory.rejected, (state, action) => {
        state.materialsLoading = false
        state.materialsError = action.error.message || 'Ghi nhận lịch sử sửa chữa thất bại'
      })
  },

})

export const { clearWorkOrderError, clearAssessmentError, clearMaterialsError } = maintenanceSlice.actions
export const maintenanceReducer = maintenanceSlice.reducer
