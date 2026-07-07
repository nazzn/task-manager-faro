export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const authorization =
    getHeader(event, "authorization") ||
    (getCookie(event, "auth_token")
      ? `Bearer ${getCookie(event, "auth_token")}`
      : undefined)

  try {
    const result = await $fetch(`${config.apiBase}/users`, {
      method: "GET",
      headers: authorization ? { Authorization: authorization } : undefined,
    })

    return result
  } catch {
    return [
      { id: 1, username: "naz", role: "admin" },
      { id: 2, username: "goli", role: "manager" },
      { id: 3, username: "sara", role: "user" },
      { id: 4, username: "mamad", role: "user" },
      { id: 5, username: "mina", role: "user" },
    ]
  }
})
