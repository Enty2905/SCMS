import { createSlice } from '@reduxjs/toolkit'

import {
  createDepartment,
  createEmployee,
  deleteDepartment,
  deleteEmployee,
  fetchDepartmentEmployees,
  fetchDepartments,
  fetchEmployeeOptions,
  fetchHrDirectoryData,
  removeEmployeeFromDepartment,
  searchEmployees,
  updateDepartment,
  updateEmployee,
} from './hr-directory.thunks.js'

const initialState = {
  // Toàn bộ nhân viên, dùng cho các ô chọn nhân sự ở những phân hệ khác.
  employees: [],
  // Trang kết quả của màn hình tra cứu nhân viên.
  employeeResults: [],
  employeePage: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },
  employeeFilters: {
    search: '',
    departmentId: '',
    status: 'all',
    accountState: 'all',
  },
  // Danh mục giới tính / tình trạng làm việc do máy chủ cung cấp.
  employeeOptions: {
    genders: [],
    statuses: [],
  },
  departments: [],
  departmentSearch: '',
  departmentEmployees: [],
  departmentEmployeesLoading: false,
  positions: [],
  loading: false,
  searching: false,
  saving: false,
  error: null,
}

const hrDirectorySlice = createSlice({
  name: 'hrDirectory',
  initialState,
  reducers: {
    clearHrDirectoryError(state) {
      state.error = null
    },
    clearDepartmentEmployees(state) {
      state.departmentEmployees = []
    },
  },
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
        state.error = action.error.message || 'Không tải được dữ liệu nhân sự.'
      })
      .addCase(searchEmployees.pending, (state) => {
        state.searching = true
        state.error = null
      })
      .addCase(searchEmployees.fulfilled, (state, action) => {
        state.searching = false
        applyEmployeePage(state, action.payload)
      })
      .addCase(searchEmployees.rejected, (state, action) => {
        state.searching = false
        state.error = action.error.message || 'Không tìm được nhân viên.'
      })
      .addCase(fetchEmployeeOptions.fulfilled, (state, action) => {
        state.employeeOptions = action.payload
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments = action.payload.departments
        state.departmentSearch = action.payload.search
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.error = action.error.message || 'Không tải được danh sách phòng ban.'
      })
      .addCase(fetchDepartmentEmployees.pending, (state) => {
        state.departmentEmployeesLoading = true
        state.error = null
      })
      .addCase(fetchDepartmentEmployees.fulfilled, (state, action) => {
        state.departmentEmployeesLoading = false
        state.departmentEmployees = action.payload.employees
      })
      .addCase(fetchDepartmentEmployees.rejected, (state, action) => {
        state.departmentEmployeesLoading = false
        state.error = action.error.message || 'Không tải được nhân sự của phòng ban.'
      })
      .addCase(deleteDepartment.pending, markSaving)
      .addCase(deleteDepartment.fulfilled, markSaved)
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message || 'Không thể xóa phòng ban.'
      })
      .addCase(createDepartment.pending, markSaving)
      .addCase(createDepartment.fulfilled, markSaved)
      .addCase(createDepartment.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message || 'Không thể thêm phòng ban.'
      })
      .addCase(updateDepartment.pending, markSaving)
      .addCase(updateDepartment.fulfilled, markSaved)
      .addCase(updateDepartment.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message || 'Không thể cập nhật phòng ban.'
      })
      .addCase(createEmployee.pending, markSaving)
      .addCase(createEmployee.fulfilled, markSaved)
      .addCase(createEmployee.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message || 'Không thể thêm nhân viên.'
      })
      .addCase(updateEmployee.pending, markSaving)
      .addCase(updateEmployee.fulfilled, markSaved)
      .addCase(updateEmployee.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message || 'Không thể cập nhật nhân viên.'
      })
      .addCase(deleteEmployee.pending, markSaving)
      .addCase(deleteEmployee.fulfilled, markSaved)
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message || 'Không thể xóa nhân viên.'
      })
      .addCase(removeEmployeeFromDepartment.pending, markSaving)
      .addCase(removeEmployeeFromDepartment.fulfilled, markSaved)
      .addCase(removeEmployeeFromDepartment.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message || 'Không thể gỡ nhân viên khỏi phòng ban.'
      })
  },
})

/**
 * Ghi lại trang kết quả và bộ lọc vừa dùng để lần tải sau giữ nguyên ngữ cảnh.
 */
function applyEmployeePage(state, { employeePage, employeeQuery }) {
  state.employeeResults = employeePage.content || []
  state.employeePage = {
    page: employeePage.page ?? 0,
    size: employeePage.size ?? state.employeePage.size,
    totalElements: employeePage.totalElements ?? 0,
    totalPages: employeePage.totalPages ?? 0,
    last: employeePage.last ?? true,
  }

  if (employeeQuery) {
    state.employeeFilters = {
      search: employeeQuery.search ?? '',
      departmentId: employeeQuery.departmentId ?? '',
      status: employeeQuery.status ?? 'all',
      accountState: employeeQuery.accountState ?? 'all',
    }
  }
}

function markSaving(state) {
  state.saving = true
  state.error = null
}

function markSaved(state) {
  state.saving = false
}

export const { clearHrDirectoryError, clearDepartmentEmployees } = hrDirectorySlice.actions
export const hrDirectoryReducer = hrDirectorySlice.reducer
