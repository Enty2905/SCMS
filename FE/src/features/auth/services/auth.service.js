import { apiClient } from '@/shared/api/httpClient.js'

import { parseJwt, parseScope, persistAuthTokens } from './token.service.js'

export async function loginService(credentials) {
  const response = await apiClient.post('/auth/login', {
    username: credentials.username?.trim(),
    password: credentials.password,
  })
  const auth = response.data
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
