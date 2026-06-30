    // server/api/auth/tasks/id/index.post.ts
import { defineEventHandler, useRuntimeConfig, getHeader, getCookie, getRouterParam, readBody } from '#imports'
    import { $fetch } from 'ofetch'

    export default defineEventHandler(async (event) => {
      const config = useRuntimeConfig()
      const id = getRouterParam(event, 'id')
      const body = await readBody(event)

      const authorization = getHeader(event, 'authorization') || 
                            (getCookie(event, 'auth_token') ? `Bearer ${getCookie(event, 'auth_token')}` : undefined)

      return await $fetch(`${config.apiBase}/tasks/${id}/subtasks`, {
        method: 'POST',
        body,
        headers: authorization ? { Authorization: authorization } : undefined,
      })
    })
