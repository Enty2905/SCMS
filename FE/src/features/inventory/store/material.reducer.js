import { createSlice } from '@reduxjs/toolkit'

import {
  fetchMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from './material.thunks.js'

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

const materialSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    clearMaterialError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchMaterials.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.content || []
        state.page = action.payload.page
        state.size = action.payload.size
        state.totalElements = action.payload.totalElements
        state.totalPages = action.payload.totalPages
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Không tải được danh sách vật tư'
      })
      // Create
      .addCase(createMaterial.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createMaterial.fulfilled, (state) => {
        state.submitting = false
      })
      .addCase(createMaterial.rejected, (state, action) => {
        state.submitting = false
        state.error = action.error.message || 'Không thể thêm vật tư'
      })
      // Update
      .addCase(updateMaterial.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateMaterial.fulfilled, (state) => {
        state.submitting = false
      })
      .addCase(updateMaterial.rejected, (state, action) => {
        state.submitting = false
        state.error = action.error.message || 'Không thể cập nhật vật tư'
      })
      // Delete
      .addCase(deleteMaterial.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteMaterial.fulfilled, (state) => {
        state.submitting = false
      })
      .addCase(deleteMaterial.rejected, (state, action) => {
        state.submitting = false
        state.error = action.error.message || 'Không thể xóa vật tư'
      })
  },
})

export const { clearMaterialError } = materialSlice.actions
export const materialReducer = materialSlice.reducer
