import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  createAssessmentService,
  createWorkOrderService,
  fetchAssessmentsService,
  fetchPendingRequestsService,
  uploadSignedPdfService,
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

