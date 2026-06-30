import { defineEventHandler, useRuntimeConfig, getHeader, getCookie, getRouterParam } from '#imports'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const attachmentId = getRouterParam(event, 'attachmentId')

  const authorization =
    getHeader(event, 'authorization') ||
    (getCookie(event, 'auth_token')
      ? `Bearer ${getCookie(event, 'auth_token')}`
      : undefined)

  return await $fetch(`${config.apiBase}/tasks/${id}/attachments/${attachmentId}`, {
    method: 'GET',
    headers: authorization ? { Authorization: authorization } : undefined,
  })
})
