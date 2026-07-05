import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  fetchTools,
  createTool,
  updateTool,
} from '../services/tool.service.js'

export const fetchToolList = createAsyncThunk(
  'tools/fetchList',
  async ({ keyword, category, page = 0, size = 10 }) => {
    return fetchTools(keyword, category, page, size)
  },
)

export const createToolItem = createAsyncThunk(
  'tools/create',
  async (data) => {
    return createTool(data)
  },
)

export const updateToolItem = createAsyncThunk(
  'tools/update',
  async ({ id, data }) => {
    return updateTool(id, data)
  },
)
