export const selectCurrentUser = (state) => state.auth.user
export const selectAuthToken = (state) => state.auth.token
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error
export const selectFailedLoginAttempts = (state) => state.auth.failedAttempts
export const selectLockedUntil = (state) => state.auth.lockedUntil
export const selectIsAuthenticated = (state) => Boolean(state.auth.token)
