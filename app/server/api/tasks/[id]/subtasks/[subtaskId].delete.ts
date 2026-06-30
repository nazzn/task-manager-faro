// server/api/auth/tasks/id/[subtasksid].delete.ts
import { defineEventHandler, useRuntimeConfig, getHeader, getCookie, getRouterParam } from '#imports'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const taskId = getRouterParam(event, 'id')
  const subtaskId = getRouterParam(event, 'subtaskId')

  const authHeader = getHeader(event, 'authorization')
  const authCookie = getCookie(event, 'auth_token')
  const authorization = authHeader || (authCookie ? `Bearer ${authCookie}` : undefined)

  return await $fetch(`${config.apiBase}/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: 'DELETE',
    headers: authorization ? { Authorization: authorization } : undefined,
  })
})