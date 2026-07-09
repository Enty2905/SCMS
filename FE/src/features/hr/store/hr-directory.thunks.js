import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  createDepartmentService,
  createEmployeeService,
  deleteDepartmentService,
  fetchDepartmentsService,
  fetchEmployeePositionsService,
  fetchEmployeesService,
  updateEmployeeService,
} from '../services/hr-directory.service.js'

export const fetchHrDirectoryData = createAsyncThunk(
  'hrDirectory/fetchPageData',
  async () => {
    const [employees, departments, positions] = await Promise.all([
      fetchEmployeesService(),
      fetchDepartmentsService(),
      fetchEmployeePositionsService(),
    ])

    return { employees, departments, positions }
  },
)

export const deleteDepartment = createAsyncThunk(
  'hrDirectory/deleteDepartment',
  async (departmentId, { dispatch }) => {
    await deleteDepartmentService(departmentId)
    await dispatch(fetchHrDirectoryData())
    return departmentId
  },
)

export const createDepartment = createAsyncThunk(
  'hrDirectory/createDepartment',
  async (payload, { dispatch }) => {
    const department = await createDepartmentService(payload)
    await dispatch(fetchHrDirectoryData())
    return department
  },
)

export const createEmployee = createAsyncThunk(
  'hrDirectory/createEmployee',
  async (payload, { dispatch }) => {
    const employee = await createEmployeeService(payload)
    await dispatch(fetchHrDirectoryData())
    return employee
  },
)

export const updateEmployee = createAsyncThunk(
  'hrDirectory/updateEmployee',
  async ({ employeeId, payload }, { dispatch }) => {
    const employee = await updateEmployeeService(employeeId, payload)
    await dispatch(fetchHrDirectoryData())
    return employee
  },
)
