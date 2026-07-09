import { createSlice } from '@reduxjs/toolkit'

import {
  createDepartment,
  createEmployee,
  deleteDepartment,
  fetchHrDirectoryData,
  updateEmployee,
} from './hr-directory.thunks.js'

const initialState = {
  employees: [],
  departments: [],
  positions: [],
  loading: false,
  saving: false,
  error: null,
}

const hrDirectorySlice = createSlice({
  name: 'hrDirectory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHrDirectoryData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHrDirectoryData.fulfilled, (state, action) => {
        state.loading = false
        state.employees = action.payload.employees
        state.departments = action.payload.departments
        state.positions = action.payload.positions
      })
      .addCase(fetchHrDirectoryData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Khong tai duoc du lieu nhan su'
      })
      .addCase(deleteDepartment.pending, markSaving)
      .addCase(deleteDepartment.fulfilled, markSaved)
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message || 'Khong the xoa phong ban'
      })
      .addCase(createDepartment.pending, markSaving)
      .addCase(createDepartment.fulfilled, markSaved)
      .addCase(createDepartment.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message || 'Khong the them phong ban'
      })
      .addCase(createEmployee.pending, markSaving)
      .addCase(createEmployee.fulfilled, markSaved)
      .addCase(createEmployee.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message || 'Khong the them nhan vien'
      })
      .addCase(updateEmployee.pending, markSaving)
      .addCase(updateEmployee.fulfilled, markSaved)
      .addCase(updateEmployee.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message || 'Khong the cap nhat nhan vien'
      })
  },
})

function markSaving(state) {
  state.saving = true
  state.error = null
}

function markSaved(state) {
  state.saving = false
}

export const hrDirectoryReducer = hrDirectorySlice.reducer
