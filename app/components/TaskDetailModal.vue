<!-- app/components/TaskDetailModal.vue -->

<template>
  <div
    class="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4"
    dir="rtl"
    tabindex="0"
    @keydown.esc.prevent="emit('close')"
  >
    <!-- Overlay -->
    <div
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      @click="emit('close')"
    />

    <!-- Modal -->
    <section
      class="relative w-full max-w-[750px] max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header شیشه‌ای با دکمه‌های ویرایش/حذف -->
      <header
        class="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-white/50 backdrop-blur-md"
      >
        <h2 class="text-xl font-extrabold text-slate-800">جزئیات وظیفه</h2>
        <div class="flex items-center gap-2">
          <!-- دکمه ویرایش -->
          <button
            v-if="canEdit"
            @click="emit('edit', localTask)"
            class="p-2 rounded-lg hover:bg-slate-100 transition"
            title="ویرایش"
          >
            <IconEdit class="w-5 h-5" />
          </button>
          <!-- دکمه حذف -->
          <button
            v-if="canDelete"
            @click="emit('delete', localTask.id)"
            class="p-2 rounded-lg hover:bg-red-100 transition"
            title="حذف"
          >
            <IconTrash class="w-5 h-5 text-red-600" />
          </button>
          <!-- دکمه بستن (همیشه نمایش) -->
          <button
            @click="emit('close')"
            class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            title="بستن"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke-width="2.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="w-6 h-6 border-2 border-[#238A63] border-t-transparent rounded-full animate-spin"></div>
      </div>
      <!-- Body با اسکرول اختصاصی -->
      <div class="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
        <div class="space-y-8">
          <!-- عنوان -->
          <div class="space-y-1">
            <div
              class="w-full border-b-2 border-slate-100 py-2 text-xl font-bold text-slate-800"
            >
              {{ localTask.title }}
            </div>
          </div>

          <!-- ردیف متا (مسئول، مهلت، وضعیت، چک‌لیست) -->
          <div class="flex flex-wrap items-start gap-4">
            <!-- مسئول -->
            <div class="w-[143px]">
              <div
                class="rounded-xl border border-slate-200 bg-white px-3 h-[46px] flex items-center"
              >
                <img
                  src="/icons/taskModal/responsible.svg"
                  alt="assignee"
                  class="w-5 h-5 ml-2 grayscale opacity-60"
                />
                <div class="text-sm text-slate-700 truncate">
                  {{ localTask.assignee?.username || "تعیین نشده" }}
                </div>
              </div>
            </div>

            <!-- مهلت انجام -->
            <div class="w-[143px]">
              <div
                class="flex items-center h-[46px] rounded-xl border border-slate-200 bg-white px-3"
              >
                <img
                  src="/icons/taskModal/Calendar.svg"
                  alt="calendar"
                  class="w-5 h-5 ml-2 grayscale opacity-60"
                />
                <div class="text-sm text-slate-700 truncate">
                  {{ formatDate(localTask.due_date) || "تعیین نشده" }}
                </div>
              </div>
            </div>

            <!-- وضعیت -->
            <div class="w-[143px]">
              <div
                class="flex items-center h-[46px] rounded-xl border border-slate-200 bg-white px-3"
              >
                <img
                  src="/icons/taskModal/Label.svg"
                  alt="status"
                  class="w-5 h-5 ml-2 grayscale opacity-60"
                />
                <div class="text-sm text-slate-700">
                  {{ statusLabel }}
                </div>
              </div>
            </div>

            <!-- دکمه چک‌لیست (تعداد) -->
            <button
              type="button"
              @click="showSubtasks = !showSubtasks"
              class="h-[46px] px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition flex items-center gap-2"
            >
              چک لیست
              <span class="text-xs text-slate-400"
                >({{ localTask.subtasks?.length || 0 }})</span
              >
            </button>
          </div>

          <!-- نمایش اولویت (به سبک مودال ایجاد) -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-2"
              >اولویت</label
            >
            <!-- <div
              class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 flex items-center justify-between gap-2"
            >
              <span class="text-slate-700">{{ priorityLabel }}</span>
              <span
                class="rounded-full px-2.5 py-1 text-[11px] font-bold"
                :class="priorityBadgeClass"
              >
                {{ priorityBadgeText }}
              </span>
            </div> -->
          </div>

          <!-- پنل زیرتسک‌ها (اختیاری) -->
          <transition name="fade">
            <div v-if="showSubtasks" class="space-y-3 mt-4">
              <div
                class="flex items-center justify-between border-b border-slate-100 pb-2"
              >
                <h3 class="font-bold text-slate-700">چک لیست</h3>
              </div>
              <div v-if="localTask.subtasks?.length" class="space-y-2">
                <div
                  v-for="sub in localTask.subtasks"
                  :key="sub.id"
                  class="flex items-center gap-3 p-2 rounded-lg bg-slate-50"
                >
                  <input
                    type="checkbox"
                    :checked="sub.is_completed"
                    disabled
                    class="accent-[#238A63] cursor-not-allowed"
                  />
                  <span class="text-sm text-slate-700">{{ sub.title }}</span>
                </div>
              </div>
              <div v-else class="text-xs text-slate-400 text-center">
                هیچ آیتمی ثبت نشده
              </div>
            </div>
          </transition>

          <!-- توضیحات -->
          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700">توضیحات</label>
            <div
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 min-h-[100px]"
            >
              {{ localTask.description || "—" }}
            </div>  
          </div>

          <!-- پیوست‌ها -->
          <div class="space-y-4">
            <div
              class="flex items-center justify-between border-b border-slate-100 pb-2"
            >
              <h3 class="font-bold text-slate-700">پیوست‌ها</h3>
            </div>
            <div
              v-if="localTask.attachments?.length"
              class="grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              <component
                :is="att.url || att.id ? 'a' : 'div'"
                v-for="(att, idx) in localTask.attachments"
                :key="idx"
                v-bind="att.url || att.id ? { href: att.url || `/api/tasks/${localTask.id}/attachments/${att.id}`, download: att.name, target: '_blank', rel: 'noopener noreferrer' } : {}"
                :class="[
                  'group relative flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition',
                  att.url || att.id ? 'hover:border-[#238A63]/40 hover:bg-[#238A63]/5 cursor-pointer' : ''
                ]"
              >
                <div class="flex items-center justify-between mb-1">
                  <svg
                    class="h-5 w-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M15.172 7l-2.828-2.828a4 4 0 00-5.656 0L4.93 6.828a4 4 0 000 5.656l4.242 4.242a4 4 0 005.656 0l2.828-2.828M9 15l6-6"
                      stroke-width="1.5"
                    />
                  </svg>
                </div>
                <span
                  class="truncate text-xs font-semibold text-slate-700"
                  :title="att.name"
                  >{{ att.name }}</span
                >
                <span class="text-[10px] text-slate-400 uppercase">
                  {{ formatDate(localTask.created_at) }}
                </span>
              </component>
            </div>
            <div v-else class="text-xs text-slate-400">
              هیچ فایلی پیوست نشده است.
            </div>
          </div>

          <!-- ایجاد شده توسط -->
          <!-- <div>
            <label class="block text-xs font-semibold text-slate-500 mb-2"
              >ایجاد شده توسط</label
            >
            <div
              class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800"
            >
              {{ task.createdBy?.username || "نامشخص" }}
            </div>
          </div> -->
        </div>
      </div>

      <!-- Footer با دکمه بستن -->
      <footer
        class="p-6 bg-slate-50/80 border-t border-slate-100 flex justify-center"
      >
        <button
          type="button"
          class="px-8 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-colors"
          @click="emit('close')"
        >
          بستن
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import type { Task } from "~/stores/taskStore";
import { useTaskStore } from "~/stores/taskStore";

const props = defineProps<{
  task: Task;
  canEdit?: boolean;
  canDelete?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "edit", task: Task): void;
  (e: "delete", id: number): void;
}>();

const taskStore = useTaskStore();

// لود تسک از سرور تا ساب‌تسک و پیوست داشته باشیم
const localTask = ref<Task>({ ...props.task });
const isLoading = ref(false);

onMounted(async () => {
  console.log("=== DETAIL MODAL MOUNTED ===");
  console.log("props.task:", JSON.stringify(props.task));
  
  const token = useCookie('auth_token').value;
  console.log("token:", token ? "دارم" : "ندارم");

  try {
    const subRes: any = await $fetch(`/api/tasks/${props.task.id}/subtasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("subtasks response:", JSON.stringify(subRes));
    const rawSubtasks = subRes?.data?.subtasks ?? subRes?.data ?? subRes ?? [];
    if (Array.isArray(rawSubtasks)) {
      localTask.value.subtasks = rawSubtasks;
    }
  } catch(e: any) {
    console.error("subtasks error:", e.message, e.statusCode);
    // اگر API جداگانه در دسترس نبود، از زیرتسک‌های خود تسک استفاده کن
  }

  try {
    const attRes: any = await $fetch(`/api/tasks/${props.task.id}/attachments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("attachments response:", JSON.stringify(attRes));
  localTask.value.attachments = attRes?.data?.attachments ?? attRes?.data ?? attRes ?? [];
  } catch(e: any) {
    console.error("attachments error:", e.message, e.statusCode);
    localTask.value.attachments = [];
  }

  isLoading.value = false;
  console.log("=== FINAL localTask ===", JSON.stringify(localTask.value));
});

// نمایش وضعیت
const statusLabel = computed(() => {
  const s = localTask.value.status;
  if (s === "todo") return "برای انجام  ";
  if (s === "doing") return "در حال انجام";
  if (s === "review") return "در انتظار بازبینی";
  if (s === "done") return "تکمیل شده";
  return s || "نامشخص";
});

// اولویت
// const normalizedPriority = computed(() =>
//   String(localTask.value.priority || "").toLowerCase(),
// );
// const priorityLabel = computed(() => {
//   const p = normalizedPriority.value;
//   if (p === "high") return "فوری";
//   if (p === "medium") return "متوسط";
//   if (p === "low") return "عادی";
//   return localTask.value.priority || "نامشخص";
// });
// const priorityBadgeText = computed(() => {
//   const p = normalizedPriority.value;
//   if (p === "high") return "High";
//   if (p === "medium") return "Med";
//   if (p === "low") return "Low";
//   return "—";
// });
// const priorityBadgeClass = computed(() => {
//   const p = normalizedPriority.value;
//   if (p === "high")
//     return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100";
//   if (p === "medium")
//     return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100";
//   if (p === "low")
//     return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100";
//   return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200";
// });

// نمایش / عدم نمایش زیرتسک‌ها
const showSubtasks = ref(true);

const formatDate = (date?: string | null) => {
  if (!date) return null;

  const d = new Date(date.replace(/-/g, "/"));

  return d.toLocaleDateString("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};
</script>

<script lang="ts">
import { defineComponent, h } from "vue";
export const IconEdit = defineComponent({
  name: "IconEdit",
  setup(_, { attrs }) {
    return () =>
      h(
        "svg",
        {
          ...attrs,
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "1.8",
            d: "M16.862 3.487a2.1 2.1 0 012.97 2.97L8.2 18.09 4 19l.91-4.2L16.862 3.487z",
          }),
        ],
      );
  },
});
export const IconTrash = defineComponent({
  name: "IconTrash",
  setup(_, { attrs }) {
    return () =>
      h(
        "svg",
        {
          ...attrs,
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "1.8",
            d: "M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 14h8l1-14",
          }),
        ],
      );
  },
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>