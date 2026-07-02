const TOKEN_KEY = 'scms.auth.token'
const REFRESH_TOKEN_KEY = 'scms.auth.refreshToken'

export function parseJwt(token) {
  if (!token) {
    return {}
  }

  const [, payload] = token.split('.')

  if (!payload) {
    return {}
  }

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    )
    const json = decodeURIComponent(
      globalThis
        .atob(padded)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )

    return JSON.parse(json)
  } catch {
    return {}
  }
}

export function getStoredAuth() {
  if (!canUseStorage()) {
    return null
  }

  const token = globalThis.localStorage.getItem(TOKEN_KEY)

  if (!token) {
    return null
  }

  const claims = parseJwt(token)

  if (claims.exp && claims.exp * 1000 <= Date.now()) {
    clearStoredAuth()
    return null
  }

  const username = claims.sub || 'SCMS user'
  const refreshToken = globalThis.localStorage.getItem(REFRESH_TOKEN_KEY)

  return {
    token,
    refreshToken,
    user: {
      id: claims.userId,
      name: username,
      email: `${username}@scms.local`,
      roles: parseScope(claims.scope),
    },
  }
}

export function persistAuthTokens({ token, refreshToken }) {
  if (!canUseStorage()) {
    return
  }

  globalThis.localStorage.setItem(TOKEN_KEY, token)

  if (refreshToken) {
    globalThis.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export function clearStoredAuth() {
  if (!canUseStorage()) {
    return
  }

  globalThis.localStorage.removeItem(TOKEN_KEY)
  globalThis.localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function parseScope(scope) {
  if (!scope) {
    return []
  }

  return scope
    .split(' ')
    .map((role) => role.trim())
    .filter(Boolean)
    .map((role) => (role.startsWith('ROLE_') ? role : `ROLE_${role}`))
}

function canUseStorage() {
  return Boolean(globalThis.localStorage && globalThis.atob)
}
