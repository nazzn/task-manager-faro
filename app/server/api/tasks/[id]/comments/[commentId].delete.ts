export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const commentId = getRouterParam(event, "commentId");
  const authorization =
    getHeader(event, "authorization") ||
    (getCookie(event, "auth_token") ? `Bearer ${getCookie(event, "auth_token")}` : undefined);

  return await $fetch(`${config.apiBase}/comments/${commentId}`, {
    method: "DELETE",
    headers: authorization ? { Authorization: authorization } : undefined,
  });
});
