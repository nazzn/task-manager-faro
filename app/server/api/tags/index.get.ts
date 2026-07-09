import { mockTags } from "./mock"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authorization =
    getHeader(event, 'authorization') ||
    (getCookie(event, 'auth_token') ? `Bearer ${getCookie(event, 'auth_token')}` : undefined)

  try {
    return await $fetch(`${config.apiBase}/tags`, {
      method: 'GET',
      headers: authorization ? { Authorization: authorization } : undefined,
    })
  } catch {
    return mockTags
  }
})
