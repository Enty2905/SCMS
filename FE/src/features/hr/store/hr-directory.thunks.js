import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  createDepartmentService,
  createEmployeeService,
  deleteDepartmentService,
  deleteEmployeeService,
  fetchDepartmentEmployeesService,
  fetchDepartmentsService,
  fetchEmployeeOptionsService,
  fetchEmployeePositionsService,
  fetchEmployeesService,
  removeEmployeeFromDepartmentService,
  searchEmployeesService,
  updateDepartmentService,
  updateEmployeeService,
} from '../services/hr-directory.service.js'

/**
 * Bộ lọc nhân viên đang áp dụng, dùng để tải lại đúng trang sau mỗi lần ghi dữ liệu.
 */
function currentEmployeeQuery(getState, overrides = {}) {
  const { employeeFilters, employeePage } = getState().hrDirectory

  return {
    ...employeeFilters,
    page: employeePage.page,
    size: employeePage.size,
    ...overrides,
  }
}

export const fetchEmployeeOptions = createAsyncThunk(
  'hrDirectory/fetchEmployeeOptions',
  async () => fetchEmployeeOptionsService(),
)

/**
 * Dữ liệu nền của phân hệ nhân sự: toàn bộ nhân viên (dùng cho các ô chọn nhân sự
 * ở phân hệ bảo trì), phòng ban và chức vụ.
 */
export const fetchHrDirectoryData = createAsyncThunk(
  'hrDirectory/fetchPageData',
  async (_, { getState }) => {
    const { departmentSearch } = getState().hrDirectory

    const [employees, departments, positions] = await Promise.all([
      fetchEmployeesService(),
      fetchDepartmentsService(departmentSearch),
      fetchEmployeePositionsService(),
    ])

    return { employees, departments, positions }
  },
)

export const searchEmployees = createAsyncThunk(
  'hrDirectory/searchEmployees',
  async (query, { getState }) => {
    const employeeQuery = currentEmployeeQuery(getState, query)
    const employeePage = await searchEmployeesService(employeeQuery)

    return { employeePage, employeeQuery }
  },
)

export const fetchDepartments = createAsyncThunk(
  'hrDirectory/fetchDepartments',
  async (search = '') => {
    const departments = await fetchDepartmentsService(search)
    return { departments, search }
  },
)

export const fetchDepartmentEmployees = createAsyncThunk(
  'hrDirectory/fetchDepartmentEmployees',
  async ({ departmentId, search = '' }) => {
    const employees = await fetchDepartmentEmployeesService(departmentId, search)
    return { departmentId, employees }
  },
)

/**
 * Sau mỗi lần ghi dữ liệu: tải lại danh sách nền và trang kết quả tìm kiếm hiện tại.
 */
async function refreshDirectory(dispatch) {
  await Promise.all([
    dispatch(fetchHrDirectoryData()),
    dispatch(searchEmployees()),
  ])
}

export const deleteDepartment = createAsyncThunk(
  'hrDirectory/deleteDepartment',
  async (departmentId, { dispatch }) => {
    await deleteDepartmentService(departmentId)
    await refreshDirectory(dispatch)
    return departmentId
  },
)

export const createDepartment = createAsyncThunk(
  'hrDirectory/createDepartment',
  async (payload, { dispatch }) => {
    const department = await createDepartmentService(payload)
    await refreshDirectory(dispatch)
    return department
  },
)

export const updateDepartment = createAsyncThunk(
  'hrDirectory/updateDepartment',
  async ({ departmentId, payload }, { dispatch }) => {
    const department = await updateDepartmentService(departmentId, payload)
    await refreshDirectory(dispatch)
    return department
  },
)

export const createEmployee = createAsyncThunk(
  'hrDirectory/createEmployee',
  async (payload, { dispatch }) => {
    const employee = await createEmployeeService(payload)
    await refreshDirectory(dispatch)
    return employee
  },
)

export const updateEmployee = createAsyncThunk(
  'hrDirectory/updateEmployee',
  async ({ employeeId, payload }, { dispatch }) => {
    const employee = await updateEmployeeService(employeeId, payload)
    await refreshDirectory(dispatch)
    return employee
  },
)

export const deleteEmployee = createAsyncThunk(
  'hrDirectory/deleteEmployee',
  async (employeeId, { dispatch }) => {
    await deleteEmployeeService(employeeId)
    await refreshDirectory(dispatch)
    return employeeId
  },
)

export const removeEmployeeFromDepartment = createAsyncThunk(
  'hrDirectory/removeEmployeeFromDepartment',
  async ({ departmentId, employeeId, search = '' }, { dispatch }) => {
    const employee = await removeEmployeeFromDepartmentService(departmentId, employeeId)
    await refreshDirectory(dispatch)
    await dispatch(fetchDepartmentEmployees({ departmentId, search }))
    return employee
  },
)
