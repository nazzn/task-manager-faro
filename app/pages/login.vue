<!-- app/pages/login.vue -->
<template>
  <div
    class="min-h-screen bg-slate-50 flex items-center justify-center p-4"
    dir="rtl"
  >
    <div
      class="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200 p-8"
    >
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-black text-slate-900">ورود به پنل</h1>
        <!-- <p class="text-slate-500 text-sm mt-2">نام کاربری: admin | رمز: 1234</p> -->
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Username -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2">
            نام کاربری  
          </label>
          <input
            v-model="form.username"
            type="text"
            class="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            placeholder="Username"
            required
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2">
            رمز عبور
          </label>
          <input
            v-model="form.password"
            type="password"
            class="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            placeholder="••••••••"
            required
          />
        </div>

        <!-- Error -->
        <p
          v-if="error"
          class="text-rose-500 text-xs bg-rose-50 p-3 rounded-xl border border-rose-100"
        >
          {{ error }}
        </p>

        <!-- Submit -->
        <button type="submit" :disabled="loading" class="w-full h-12 bg-indigo-600 text-white font-bold rounded-2xl shadow-md hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50">
          {{ loading ? "در حال بررسی..." : "ورود به سیستم" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const { login } = useAuth();

interface LoginForm {
  username: string;
  password: string;
}

const form = reactive<LoginForm>({
  username: "",
  password: "",
});

const loading = ref(false);
const error = ref("");

const handleLogin = async (): Promise<void> => {
  if (loading.value) return;

  error.value = "";
  loading.value = true;

   try {
    await login(form.username, form.password)
    await navigateTo("/")
  } catch (err: any) {
    error.value = err?.message || "خطا در ورود"
  } finally {
    loading.value = false
  }
}
</script>


