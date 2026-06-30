// composables/useRole.ts
export const useRole = () => {
  const user = useState<any>('auth_user')

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager')
  const isUser = computed(() => user.value?.role === 'user')
  const canCreateTask = computed(() => isAdmin.value || isManager.value)
  const canEditTask = computed(() => isAdmin.value || isManager.value)
  const canDeleteTask = computed(() => isAdmin.value || isManager.value)
  const canViewTrash = computed(() => isAdmin.value || isManager.value)
  const canRestoreTask = computed(() => isAdmin.value || isManager.value)
  const canChangeStatus = computed(() => true) // همه می‌توانند، ولی با محدودیت دنباله

  return {
    isAdmin,
    isManager,
    isUser,
    canCreateTask,
    canEditTask,
    canDeleteTask,
    canViewTrash,
    canRestoreTask,
    canChangeStatus,
  }
}