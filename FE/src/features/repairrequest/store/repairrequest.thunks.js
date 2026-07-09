import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  fetchMyRepairRequests,
  fetchAllRepairRequests,
  createRepairRequest,
  deleteRepairRequest,
} from '../services/repairrequest.service.js'

/** Trưởng Ca: lấy request của chính mình */
export const fetchMyRequests = createAsyncThunk(
  'repairRequest/fetchMy',
  async () => {
    const res = await fetchMyRepairRequests()
    return res // mảng RepairRequestResponse[]
  },
)

/** Quản đốc / Tổ trưởng: lấy tất cả, lọc theo status */
export const fetchAllRequests = createAsyncThunk(
  'repairRequest/fetchAll',
  async (status = null) => {
    const res = await fetchAllRepairRequests(status)
    return res // mảng RepairRequestResponse[]
  },
)

/** Trưởng Ca: tạo mới */
export const createRequest = createAsyncThunk(
  'repairRequest/create',
  async (data) => {
    const res = await createRepairRequest(data)
    return res // RepairRequestResponse
  },
)

/** Trưởng Ca: xóa */
export const deleteRequest = createAsyncThunk(
  'repairRequest/delete',
  async (requestId) => {
    await deleteRepairRequest(requestId)
    return requestId
  },
)
