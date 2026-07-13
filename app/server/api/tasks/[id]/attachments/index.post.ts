// server/api/auth/tasks/[id]/Attachments.post.ts
import {
  defineEventHandler,
  useRuntimeConfig,
  getHeader,
  getCookie,
  getRouterParam,
  readFormData,
} from "#imports";
import { $fetch } from "ofetch";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const id = getRouterParam(event, "id");
  const formData = await readFormData(event);

  const authHeader = getHeader(event, "authorization");
  const authCookie = getCookie(event, "auth_token");
  const authorization = authHeader || (authCookie ? `Bearer ${authCookie}` : undefined);

  return await $fetch(`${config.apiBase}/tasks/${id}/attachments`, {
    method: "POST",
    body: formData,
    headers: authorization ? { Authorization: authorization } : undefined,
  });
});
