import { describe, expect, it } from 'vitest'

import { authReducer, logout } from './auth.reducer.js'
import {
  selectCurrentUser,
  selectFailedLoginAttempts,
  selectIsAuthenticated,
  selectLockedUntil,
} from './auth.selectors.js'
import { login } from './auth.thunks.js'

describe('auth reducer', () => {
  it('clears the current session on logout', () => {
    const state = {
      user: { id: '1', name: 'Ops', email: 'ops@scms.local' },
      token: 'token',
      loading: false,
      error: null,
      failedAttempts: 3,
      lockedUntil: 123456,
    }

    const nextState = authReducer(state, logout())

    expect(nextState.user).toBeNull()
    expect(nextState.token).toBeNull()
    expect(nextState.failedAttempts).toBe(0)
    expect(nextState.lockedUntil).toBeNull()
  })

  it('selects authentication state', () => {
    const state = {
      auth: {
        user: { id: '1', name: 'Ops', email: 'ops@scms.local' },
        token: 'token',
        loading: false,
        error: null,
        failedAttempts: 2,
        lockedUntil: 123456,
      },
    }

    expect(selectCurrentUser(state).name).toBe('Ops')
    expect(selectIsAuthenticated(state)).toBe(true)
    expect(selectFailedLoginAttempts(state)).toBe(2)
    expect(selectLockedUntil(state)).toBe(123456)
  })

  it('stores failed login attempts and lock time from rejected login', () => {
    const nextState = authReducer(
      undefined,
      login.rejected(null, 'request-id', {}, {
        failedAttempts: 5,
        lockedUntil: 987654,
        message: 'Bạn nhập sai quá nhiều lần.',
      }),
    )

    expect(nextState.loading).toBe(false)
    expect(nextState.failedAttempts).toBe(5)
    expect(nextState.lockedUntil).toBe(987654)
    expect(nextState.error).toBe('Bạn nhập sai quá nhiều lần.')
  })
})
