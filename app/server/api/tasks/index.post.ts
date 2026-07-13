// server/api/tasks/index.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  const authorization =
    getHeader(event, "authorization") ||
    (getCookie(event, "auth_token") ? `Bearer ${getCookie(event, "auth_token")}` : undefined);

  try {
    return await $fetch(`${config.apiBase}/tasks`, {
      method: "POST",
      body,
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.response?.statusText,
      data: error.data,
    });
  }
});
