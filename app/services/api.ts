// app/services/api.ts
export const api = $fetch.create({
  baseURL: "/api",

  onRequest({ options }) {
    const authCookie = useCookie<string | null>("auth_token")
    const token = authCookie.value

    if (token) {
      const headers = new Headers(options.headers)
      headers.set("Authorization", `Bearer ${token}`)
      options.headers = headers
    }
  },

  onResponseError({ response, request }) {
    if (request.toString().includes("/auth/login")) return

    if (response.status === 401) {
      const authCookie = useCookie<string | null>("auth_token")
      const userCookie = useCookie("auth_user")

      authCookie.value = null
      userCookie.value = null

      if (import.meta.client) {
        navigateTo("/login")
      }
    }

    if (response.status === 403 && import.meta.client) {
      alert("شما دسترسی لازم برای این عملیات را ندارید")
    }
  },
})
