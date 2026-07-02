import { createSlice } from '@reduxjs/toolkit'

import { fetchHrDirectoryData } from './hr-directory.thunks.js'

const initialState = {
  employees: [],
  departments: [],
  loading: false,
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
      })
      .addCase(fetchHrDirectoryData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Không tải được dữ liệu nhân sự'
      })
  },
})

export const hrDirectoryReducer = hrDirectorySlice.reducer
