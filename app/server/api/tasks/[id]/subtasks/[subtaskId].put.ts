// server/api/auth/tasks/id/[subtasksId].put.ts
    import { defineEventHandler, useRuntimeConfig, getHeader, getCookie, getRouterParam, readBody } from '#imports'
    import { $fetch } from 'ofetch'

    export default defineEventHandler(async (event) => {
      const config = useRuntimeConfig()
      const taskId = getRouterParam(event, 'id')
      const subtaskId = getRouterParam(event, 'subtaskId')
      const body = await readBody(event)

      const authorization = getHeader(event, 'authorization') || 
                            (getCookie(event, 'auth_token') ? `Bearer ${getCookie(event, 'auth_token')}` : undefined)

      return await $fetch(`${config.apiBase}/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PUT',
        body,
        headers: authorization ? { Authorization: authorization } : undefined,
      })
    })
