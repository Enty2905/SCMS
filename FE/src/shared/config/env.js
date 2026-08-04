const browserHostname = globalThis.location?.hostname || 'localhost'

export const env = {
  apiUrl:
    import.meta.env.VITE_API_URL ||
    `http://${browserHostname}:8081/scms/api`,
}
