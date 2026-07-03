import { apiClient } from '@/shared/api/httpClient.js'

import { parseJwt, parseScope, persistAuthTokens } from './token.service.js'

export async function loginService(credentials) {
  // BE returns: { status, message, data: { token, refreshToken, authenticated } }
  const response = await apiClient.post('/auth/login', {
    username: credentials.username?.trim(),
    password: credentials.password,
  })

  // apiClient returns the raw ApiResponse body (parsed JSON)
  // BE wraps LoginResponse inside the 'data' field
  const auth = response.data ?? response
  const claims = parseJwt(auth.token)
  const username = claims.sub || credentials.username?.trim()

  persistAuthTokens(auth)

  return {
    token: auth.token,
    refreshToken: auth.refreshToken,
    user: {
      id: claims.userId,
      name: username,
      email: `${username}@scms.local`,
      roles: parseScope(claims.scope),
    },
  }
}
