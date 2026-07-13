// server/api/auth/tasks/id/index.get.ts

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const id = getRouterParam(event, "id");

  const authorization =
    getHeader(event, "authorization") ||
    (getCookie(event, "auth_token") ? `Bearer ${getCookie(event, "auth_token")}` : undefined);

  return await $fetch(`${config.apiBase}/tasks/${id}/subtasks`, {
    method: "GET",
    headers: authorization ? { Authorization: authorization } : undefined,
  });
});
