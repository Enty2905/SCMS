import { createAsyncThunk } from '@reduxjs/toolkit'

import { loginService } from '../services/auth.service.js'

export const login = createAsyncThunk('auth/login', async (credentials) => {
  return loginService(credentials)
})
