// server/api/tasks/index.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  // ✅ اول Authorization header، بعد fallback به cookie
  const authorization =
    getHeader(event, "authorization") ||
    (getCookie(event, "auth_token")
      ? `Bearer ${getCookie(event, "auth_token")}`
      : undefined)

  return await $fetch(`${config.apiBase}/tasks`, {
    method: "POST",
    body,
    headers: authorization ? { Authorization: authorization } : undefined,
  })
})