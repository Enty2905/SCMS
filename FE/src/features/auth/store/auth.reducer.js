import { createSlice } from '@reduxjs/toolkit'

import { getStoredAuth } from '../services/token.service.js'
import { login } from './auth.thunks.js'

const storedAuth = getStoredAuth()

const initialState = {
  user: storedAuth?.user || null,
  token: storedAuth?.token || null,
  refreshToken: storedAuth?.refreshToken || null,
  loading: false,
  error: null,
  failedAttempts: 0,
  lockedUntil: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.error = null
      state.failedAttempts = 0
      state.lockedUntil = null
    },
    clearLoginLock(state) {
      state.failedAttempts = 0
      state.lockedUntil = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.failedAttempts = 0
        state.lockedUntil = null
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.failedAttempts =
          action.payload?.failedAttempts ?? state.failedAttempts
        state.lockedUntil = action.payload?.lockedUntil ?? state.lockedUntil
        state.error =
          action.payload?.message || action.error.message || 'Unable to sign in'
      })
  },
})

export const { clearLoginLock, logout } = authSlice.actions
export const authReducer = authSlice.reducer
