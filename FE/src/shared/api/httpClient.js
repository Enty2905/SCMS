import { env } from '@/shared/config/env.js'

let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const getHeaders = (token) => {
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    if (!isFormData) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json'
    }

    return headers
  }

  let token = window.localStorage.getItem('scms.auth.token')
  let response

  try {
    response = await fetch(url(path), {
      ...options,
      headers: getHeaders(token),
      body: options.body === undefined
        ? undefined
        : isFormData
          ? options.body
          : JSON.stringify(options.body),
    })
  } catch {
    throw new Error('Không kết nối được tới backend. Hãy kiểm tra BE/Docker đang chạy.')
  }

  // Handle 401 (Unauthorized) - Attempt to refresh token
  if (response.status === 401 && !options._retry) {
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          options.headers = getHeaders(newToken)
          resolve(request(path, { ...options, _retry: true }))
        })
      })
    }

    const refreshToken = window.localStorage.getItem('scms.auth.refreshToken')
    if (refreshToken) {
      isRefreshing = true
      try {
        const refreshRes = await fetch(url('/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // BE RefreshRequest uses field 'token' for the refresh token
          body: JSON.stringify({ token: refreshToken }),
        })

        if (refreshRes.ok) {
          const payload = await refreshRes.json()
          // BE ApiResponse wraps data in 'data' field, not 'result'
          const newToken = payload.data?.token
          if (!newToken) throw new Error('No token in refresh response')
          window.localStorage.setItem('scms.auth.token', newToken)
          
          isRefreshing = false
          onRefreshed(newToken)

          options.headers = getHeaders(newToken)
          return request(path, { ...options, _retry: true })
        }
      } catch (err) {
        console.error('Refresh token failed', err)
      }
      isRefreshing = false
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      window.localStorage.removeItem('scms.auth.token')
      window.localStorage.removeItem('scms.auth.refreshToken')
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
    }

    if (response.status === 403) {
      throw new Error('Bạn không có quyền truy cập chức năng này.')
    }

    const errorPayload = await parseJson(response)
    throw new Error(errorPayload?.message || `API request failed: ${response.status}`)
  }

  if (options.responseType === 'blob') {
    const blob = await response.blob()
    return Object.assign(blob, { data: blob })
  }

  const payload = await parseJson(response)
  return payload
}

function url(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${env.apiUrl}${path}`
}

export const apiClient = {
  url,
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
}

async function parseJson(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
