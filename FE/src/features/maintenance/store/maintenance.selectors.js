export const selectRequests = (state) => state.maintenance.requests
export const selectRequestsLoading = (state) => state.maintenance.requestsLoading
export const selectRequestsError = (state) => state.maintenance.requestsError

export const selectWorkOrder = (state) => state.maintenance.workOrder
export const selectWorkOrderLoading = (state) => state.maintenance.workOrderLoading
export const selectWorkOrderError = (state) => state.maintenance.workOrderError

export const selectAssessment = (state) => state.maintenance.assessment
export const selectAssessments = (state) => state.maintenance.assessments
export const selectAssessmentLoading = (state) => state.maintenance.assessmentLoading
export const selectAssessmentError = (state) => state.maintenance.assessmentError

export const selectWorkOrders = (state) => state.maintenance.workOrders

export const selectConsumableRequests = (state) => state.maintenance.consumableRequests
export const selectConsumableRequestPage = (state) => state.maintenance.consumableRequestPage
export const selectConsumableRequestTotalPages = (state) => state.maintenance.consumableRequestTotalPages
export const selectConsumableRequestTotalElements = (state) => state.maintenance.consumableRequestTotalElements

export const selectSparePartRequests = (state) => state.maintenance.sparePartRequests
export const selectSparePartRequestPage = (state) => state.maintenance.sparePartRequestPage
export const selectSparePartRequestTotalPages = (state) => state.maintenance.sparePartRequestTotalPages
export const selectSparePartRequestTotalElements = (state) => state.maintenance.sparePartRequestTotalElements

export const selectRepairHistories = (state) => state.maintenance.repairHistories
export const selectRepairHistoryPage = (state) => state.maintenance.repairHistoryPage
export const selectRepairHistoryTotalPages = (state) => state.maintenance.repairHistoryTotalPages
export const selectRepairHistoryTotalElements = (state) => state.maintenance.repairHistoryTotalElements

export const selectMaterialsLoading = (state) => state.maintenance.materialsLoading
export const selectMaterialsError = (state) => state.maintenance.materialsError

