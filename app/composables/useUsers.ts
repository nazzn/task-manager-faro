import { ref } from "vue"

type User = { id: number; username: string; role: string }

const USERS = ref<User[]>([])
let fetched = false

function normalizeUsers(data: any): User[] {
  if (!data) return []

  let list: any[] = []

  if (Array.isArray(data)) {
    list = data
  } else if (data.data && Array.isArray(data.data)) {
    list = data.data
  } else if (data.users && Array.isArray(data.users)) {
    list = data.users
  }

  return list
    .filter((u: any) => u.id != null)
    .map((u: any) => ({
      id: typeof u.id === "string" ? parseInt(u.id, 10) : u.id,
      username: u.username ?? "",
      role: u.role ?? "user",
    }))
    .filter((u) => typeof u.id === "number" && !isNaN(u.id) && u.id > 0)
}

export async function fetchUsers(force = false) {
  if (fetched && !force) return
  if (force) fetched = false
  fetched = true
  try {
    const data = await $fetch("/api/users")
    USERS.value = normalizeUsers(data)
  } catch {
    fetched = false
    USERS.value = []
  }
}

if (import.meta.client) {
  fetchUsers()
}

export function getUserById(id: number) {
  return USERS.value.find((u) => u.id === id) ?? null
}

export function getUserName(id: number) {
  return getUserById(id)?.username ?? "-"
}

export function getUserInitial(id: number) {
  return getUserById(id)?.username?.charAt(0)?.toUpperCase() ?? "?"
}

export const useUsers = () => {
  return { USERS, getUserById, getUserName, getUserInitial, fetchUsers }
}
