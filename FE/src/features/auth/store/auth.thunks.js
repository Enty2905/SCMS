import { createAsyncThunk } from '@reduxjs/toolkit'

import { loginService } from '../services/auth.service.js'
import {
  LOGIN_LOCK_DURATION_MS,
  MAX_LOGIN_ATTEMPTS,
} from './auth.constants.js'

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { getState, rejectWithValue }) => {
    const auth = getState().auth
    const now = Date.now()

    if (auth.lockedUntil && auth.lockedUntil > now) {
      return rejectWithValue({
        failedAttempts: auth.failedAttempts,
        lockedUntil: auth.lockedUntil,
        message: 'Bạn nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút.',
      })
    }

    try {
      return await loginService(credentials)
    } catch (error) {
      const nextFailedAttempts = auth.failedAttempts + 1
      const shouldLock = nextFailedAttempts >= MAX_LOGIN_ATTEMPTS

      return rejectWithValue({
        failedAttempts: nextFailedAttempts,
        lockedUntil: shouldLock ? now + LOGIN_LOCK_DURATION_MS : null,
        message: shouldLock
          ? 'Bạn nhập sai quá nhiều lần. Tạm khóa đăng nhập trong 1 phút.'
          : error.message,
      })
    }
  },
)
