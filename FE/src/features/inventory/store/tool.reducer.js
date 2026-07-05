import { createSlice } from '@reduxjs/toolkit'

import {
  fetchToolList,
  createToolItem,
  updateToolItem,
} from './tool.thunks.js'

const initialState = {
  items: [],
  loading: false,
  submitting: false,
  error: null,
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
}

const toolSlice = createSlice({
  name: 'tools',
  initialState,
  reducers: {
    clearToolError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchToolList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchToolList.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.content || []
        state.page = action.payload.page
        state.size = action.payload.size
        state.totalElements = action.payload.totalElements
        state.totalPages = action.payload.totalPages
      })
      .addCase(fetchToolList.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Không tải được danh sách CCDC'
      })
      // Create
      .addCase(createToolItem.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createToolItem.fulfilled, (state) => {
        state.submitting = false
      })
      .addCase(createToolItem.rejected, (state, action) => {
        state.submitting = false
        state.error = action.error.message || 'Không thể thêm CCDC'
      })
      // Update
      .addCase(updateToolItem.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateToolItem.fulfilled, (state) => {
        state.submitting = false
      })
      .addCase(updateToolItem.rejected, (state, action) => {
        state.submitting = false
        state.error = action.error.message || 'Không thể cập nhật CCDC'
      })
  },
})

export const { clearToolError } = toolSlice.actions
export const toolReducer = toolSlice.reducer
