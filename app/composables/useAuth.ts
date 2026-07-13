// app/composables/useAuth.ts
import { api } from "~/services/api";

type LoginResponse = {
  success: boolean;
  message?: string;
  data: {
    user: {
      id: number;
      username: string;
      role: "admin" | "manager" | "user";
    };
    token: string;
  };
};

export const useAuth = () => {
  const tokenCookie = useCookie<string | null>("auth_token", {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });

  const userCookie = useCookie<any | null>("auth_user", {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });

  const login = async (username: string, password: string) => {
    const response = await api<LoginResponse>("/auth/login", {
      method: "POST",
      body: {
        username,
        password,
      },
    });

    if (!response.success) {
      throw new Error(response.message || "ورود ناموفق بود");
    }

    const token = response.data.token;
    const user = response.data.user;

    tokenCookie.value = token;
    userCookie.value = user;

    if (import.meta.client) {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
    }

    return response;
  };

  const logout = async () => {
    tokenCookie.value = null;
    userCookie.value = null;

    if (import.meta.client) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }

    await navigateTo("/login");
  };

  return {
    login,
    logout,
    tokenCookie,
    userCookie,
  };
};
