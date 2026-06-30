import { env } from '@/shared/config/env.js'

async function request(path, options = {}) {
  const response = await fetch(url(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body:
      options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json()
}

function url(path) {
  return `${env.apiUrl}${path}`
}

export const apiClient = {
  url,
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
