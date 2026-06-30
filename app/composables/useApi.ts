// composables/useApi.ts
import { useToast } from "~/composables/useToast";
import { useAuth } from "~/composables/useAuth";

export const useApi = () => {
  const { showToast } = useToast();
  const { logout } = useAuth();
  const router = useRouter();

  const request = async <T = any>(
    url: string,
    options: any = {},
  ): Promise<T> => {
    const token = useCookie("auth_token").value;
    const isFormData = options.body instanceof FormData;

    const headers: any = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await $fetch(url, {
        ...options,
        headers,
      });

      // ✅ پاسخ را مستقیماً برمی‌گردانیم
      return response as T;
    } catch (error: any) {
      const status = error.response?.status || error.statusCode;
      const message = error.data?.message || error.message;

      // خطاهای 422 را برای پردازش در کامپوننت پرتاب می‌کنیم
      if (status === 422) {
        throw { status, data: error.data, message };
      }

      // مدیریت سایر خطاها
      switch (status) {
        case 401:
          showToast("نشست شما منقضی شده است. لطفاً دوباره وارد شوید.");
          await logout();
          await router.push("/login");
          break;
        case 403:
          showToast(message || "شما دسترسی لازم برای این عملیات را ندارید");
          break;
        case 404:
          showToast(message || "تسک مورد نظر یافت نشد");
          break;
        default:
          showToast(message || "خطایی رخ داده است");
      }

      throw error;
    }
  };

  return { request };
};
