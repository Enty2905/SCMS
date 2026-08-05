const browserHostname = globalThis.location?.hostname || 'localhost'

function readEnv(value, fallback) {
  return value?.trim() || fallback
}

export const env = {
  apiUrl:
    import.meta.env.VITE_API_URL ||
    `http://${browserHostname}:8081/scms/api`,
  appName: readEnv(import.meta.env.VITE_APP_NAME, 'SCMS'),
  appDescription: readEnv(
    import.meta.env.VITE_APP_DESCRIPTION,
    'Hệ thống quản lý thiết bị, sửa chữa và bảo dưỡng',
  ),
  companyName: readEnv(
    import.meta.env.VITE_COMPANY_NAME,
    'Nhà máy Nhiệt điện',
  ),
  companyShortName: readEnv(
    import.meta.env.VITE_COMPANY_SHORT_NAME,
    'Nhiệt điện',
  ),
  teamName: readEnv(import.meta.env.VITE_TEAM_NAME, 'Team 2 TBNNH'),
  copyrightYear: readEnv(import.meta.env.VITE_COPYRIGHT_YEAR, '2026'),
  emailDomain: readEnv(import.meta.env.VITE_EMAIL_DOMAIN, 'nhm.vn'),
  demoUsername: readEnv(import.meta.env.VITE_DEMO_USERNAME, 'admin'),
  demoPassword: readEnv(import.meta.env.VITE_DEMO_PASSWORD, 'password'),
}
