// import { mockTags } from "./mock"

// export default defineEventHandler(async (event) => {
//   const config = useRuntimeConfig()
//   const authorization =
//     getHeader(event, "authorization") ||
//     (getCookie(event, "auth_token")
//       ? `Bearer ${getCookie(event, "auth_token")}`
//       : undefined)

//   const body = await readBody(event)

//   try {
//     return await $fetch(`${config.apiBase}/tags`, {
//       method: "POST",
//       body,
//       headers: authorization ? { Authorization: authorization } : undefined,
//     })
//   } catch {
//     const id = Math.max(...mockTags.map(t => t.id), 0) + 1
//     const newTag = {
//       id,
//       name: body.name,
//       color: body.color || "#94a3b8",
//     }
//     mockTags.push(newTag)
//     return newTag
//   }
// })
