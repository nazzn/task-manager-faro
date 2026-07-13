// server/api/tasks/[id].get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const id = getRouterParam(event, "id");

  // ✅ اول Authorization header، بعد fallback به cookie
  const authorization =
    getHeader(event, "authorization") ||
    (getCookie(event, "auth_token") ? `Bearer ${getCookie(event, "auth_token")}` : undefined);

  return await $fetch(`${config.apiBase}/tasks/${id}`, {
    method: "GET",
    headers: authorization ? { Authorization: authorization } : undefined,
  });
});
