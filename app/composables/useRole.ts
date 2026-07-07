// composables/useRole.ts
export const useRole = () => {
  const userCookie = useCookie<any | null>('auth_user')

  const isAdmin = computed(() => userCookie.value?.role === 'admin')
  const isUser = computed(() => userCookie.value?.role === 'user')

  const canCreateTask = computed(() => isAdmin.value)
  const canEditTask = computed(() => isAdmin.value)
  const canDeleteTask = computed(() => isAdmin.value)

  return {
    isAdmin,
    isUser,
    canCreateTask,
    canEditTask,
    canDeleteTask,
  }
}