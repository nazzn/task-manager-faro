// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const authCookie = useCookie<string | null>("auth_token")

  const publicRoutes = ["/login"]
  const isPublicRoute = publicRoutes.includes(to.path)

  if (!authCookie.value && !isPublicRoute) {
    return navigateTo("/login")
  }

  if (import.meta.client && authCookie.value && to.path === "/login") {
    return navigateTo("/")
  }
})
