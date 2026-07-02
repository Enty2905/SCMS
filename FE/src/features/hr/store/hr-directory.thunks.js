import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  fetchDepartmentsService,
  fetchEmployeesService,
} from '../services/hr-directory.service.js'

export const fetchHrDirectoryData = createAsyncThunk(
  'hrDirectory/fetchPageData',
  async () => {
    const [employees, departments] = await Promise.all([
      fetchEmployeesService(),
      fetchDepartmentsService(),
    ])

    return { employees, departments }
  },
)
