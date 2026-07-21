import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  createDepartmentService,
  createEmployeeService,
  deleteDepartmentService,
  deleteEmployeeService,
  fetchDepartmentsService,
  fetchEmployeePositionsService,
  fetchEmployeesService,
  removeEmployeeFromDepartmentService,
  updateDepartmentService,
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

export const updateDepartment = createAsyncThunk(
  'hrDirectory/updateDepartment',
  async ({ departmentId, payload }, { dispatch }) => {
    const department = await updateDepartmentService(departmentId, payload)
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

export const deleteEmployee = createAsyncThunk(
  'hrDirectory/deleteEmployee',
  async (employeeId, { dispatch }) => {
    await deleteEmployeeService(employeeId)
    await dispatch(fetchHrDirectoryData())
    return employeeId
  },
)

export const removeEmployeeFromDepartment = createAsyncThunk(
  'hrDirectory/removeEmployeeFromDepartment',
  async ({ departmentId, employeeId }, { dispatch }) => {
    const employee = await removeEmployeeFromDepartmentService(departmentId, employeeId)
    await dispatch(fetchHrDirectoryData())
    return employee
  },
)
