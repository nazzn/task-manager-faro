// // services/authService.ts
// import { api } from "./api"

// export type LoginResponse = {
//   success: boolean
//     message?: string
//   data: {
//     user: {
//       id: number
//       username: string
//       role: "admin" | "manager" | "user"
//     }
//     token: string
//   }
// }

// // export const authService = {
// //   login(username: string, password: string) {
// //     return api<LoginResponse>("/auth/login", {
// //       method: "POST",
// //       body: { username, password },
// //     })
// //   },
// // }