export async function loginService(credentials) {
  await new Promise((resolve) => setTimeout(resolve, 150))

  return {
    token: 'demo-token',
    user: {
      id: 'demo-user',
      name: 'Operations Lead',
      email: credentials.username || 'ops@scms.local',
    },
  }
}
