// app/server/api/auth/loginpost.ts 

type BackendLoginResponse = {
  success: boolean
  message?: string
  data: {
    user: {
      id: number
      username: string
      role: "admin" | "manager" | "user"
    }
    token: string
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  try {
    const result = await $fetch<BackendLoginResponse>(
      `${config.apiBase}/auth/login`,
      {
        method: "POST",
        body,
      }
    )

    return result // ✅ دیگر نیازی به wrapper اضافه نیست
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.data?.message ||
        error?.message ||
        "خطا در ارتباط با سرور",
    }
  }
})
