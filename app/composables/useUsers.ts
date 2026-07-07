// composables/useUsers.ts
export const USERS = [
  { id: 1, username: "naz", role: "admin" },
  { id: 4, username: "mamad", role: "user" },
  { id: 5, username: "mina", role: "user" },
  { id: 2, username: "goli", role: "manager" },
  { id: 3, username: "sara", role: "user" },
]

export function getUserById(id: number) {
  return USERS.find(u => u.id === id)
}

export function getUserName(id: number) {
  return getUserById(id)?.username ?? "-"
}

export function getUserInitial(id: number) {
  return getUserById(id)?.username?.charAt(0)?.toUpperCase() ?? "?"
}

export const useUsers = () => {
  return { USERS, getUserById, getUserName, getUserInitial }
}
