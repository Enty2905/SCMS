import { describe, expect, it } from 'vitest'

import { authReducer, logout } from './auth.reducer.js'
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from './auth.selectors.js'

describe('auth reducer', () => {
  it('clears the current session on logout', () => {
    const state = {
      user: { id: '1', name: 'Ops', email: 'ops@scms.local' },
      token: 'token',
      loading: false,
      error: null,
    }

    const nextState = authReducer(state, logout())

    expect(nextState.user).toBeNull()
    expect(nextState.token).toBeNull()
  })

  it('selects authentication state', () => {
    const state = {
      auth: {
        user: { id: '1', name: 'Ops', email: 'ops@scms.local' },
        token: 'token',
        loading: false,
        error: null,
      },
    }

    expect(selectCurrentUser(state).name).toBe('Ops')
    expect(selectIsAuthenticated(state)).toBe(true)
  })
})
