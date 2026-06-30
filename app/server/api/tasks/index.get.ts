// server/api/tasks/index.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const authorization =
    getHeader(event, 'authorization') ||
    (getCookie(event, 'auth_token')
      ? `Bearer ${getCookie(event, 'auth_token')}`
      : undefined)

  const query = getQuery(event) // ✅ اضافه شد

  return await $fetch(`${config.apiBase}/tasks`, {
    method: 'GET',
    query, // ✅ اضافه شد
    headers: authorization ? { Authorization: authorization } : undefined,
  })
})