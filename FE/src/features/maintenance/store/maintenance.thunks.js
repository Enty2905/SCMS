import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  createAssessmentService,
  createWorkOrderService,
  fetchAssessmentsService,
  fetchPendingRequestsService,
  uploadSignedPdfService,
  fetchWorkOrdersService,
  searchWorkOrdersService,
  exportWorkOrderPdfService,
  fetchConsumableRequestsService,
  createConsumableRequestService,
  fetchSparePartRequestsService,
  createSparePartRequestService,
  fetchRepairHistoriesService,
  createRepairHistoryService,
  uploadWorkOrderSignedPdfService,
} from '../services/maintenance.service.js'


export const fetchPendingRequests = createAsyncThunk(
  'maintenance/fetchPendingRequests',
  async () => fetchPendingRequestsService(),
)

export const createWorkOrder = createAsyncThunk(
  'maintenance/createWorkOrder',
  async (body) => createWorkOrderService(body),
)

export const createAssessment = createAsyncThunk(
  'maintenance/createAssessment',
  async (body) => createAssessmentService(body),
)

export const uploadSignedPdf = createAsyncThunk(
  'maintenance/uploadSignedPdf',
  async ({ assessmentId, file }) => uploadSignedPdfService(assessmentId, file),
)

export const fetchAssessments = createAsyncThunk(
  'maintenance/fetchAssessments',
  async () => fetchAssessmentsService(),
)

export const fetchWorkOrders = createAsyncThunk(
  'maintenance/fetchWorkOrders',
  async (params) => fetchWorkOrdersService(params),
)

export const searchWorkOrders = createAsyncThunk(
  'maintenance/searchWorkOrders',
  async (params) => searchWorkOrdersService(params),
)

export const fetchConsumableRequests = createAsyncThunk(
  'maintenance/fetchConsumableRequests',
  async (params) => fetchConsumableRequestsService(params),
)

export const createConsumableRequest = createAsyncThunk(
  'maintenance/createConsumableRequest',
  async (body) => createConsumableRequestService(body),
)

export const fetchSparePartRequests = createAsyncThunk(
  'maintenance/fetchSparePartRequests',
  async (params) => fetchSparePartRequestsService(params),
)

export const createSparePartRequest = createAsyncThunk(
  'maintenance/createSparePartRequest',
  async (body) => createSparePartRequestService(body),
)

export const fetchRepairHistories = createAsyncThunk(
  'maintenance/fetchRepairHistories',
  async (params) => fetchRepairHistoriesService(params),
)

export const createRepairHistory = createAsyncThunk(
  'maintenance/createRepairHistory',
  async (body) => createRepairHistoryService(body),
)

export const uploadWorkOrderSignedPdf = createAsyncThunk(
  'maintenance/uploadWorkOrderSignedPdf',
  async ({ orderId, file }) => uploadWorkOrderSignedPdfService(orderId, file),
)

