import { env } from '@/shared/config/env.js'

async function request(path, options = {}) {
  const token = window.localStorage.getItem('scms.auth.token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  let response

  try {
    response = await fetch(url(path), {
      ...options,
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new Error('Không kết nối được tới backend. Hãy kiểm tra BE/Docker đang chạy.')
  }

  const payload = await parseJson(response)

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      window.localStorage.removeItem('scms.auth.token')
      window.localStorage.removeItem('scms.auth.refreshToken')
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
    }

    throw new Error(payload?.message || `API request failed: ${response.status}`)
  }

  return payload
}

function url(path) {
  return `${env.apiUrl}${path}`
}

export const apiClient = {
  url,
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
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
