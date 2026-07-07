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
    return [
      { id: 1, name: "urgent", color: "#ef4444" },
      { id: 2, name: "frontend", color: "#3b82f6" },
      { id: 3, name: "backend", color: "#8b5cf6" },
      { id: 4, name: "bug", color: "#f59e0b" },
      { id: 5, name: "feature", color: "#10b981" },
    ]
  }
})
