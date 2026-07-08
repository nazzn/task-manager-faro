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
      class="relative w-full max-w-[750px] max-h-[95vh] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header شیشه‌ای با دکمه‌های ویرایش/حذف -->
      <header
        class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white"
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
        <div
          class="w-6 h-6 border-2 border-[#238A63] border-t-transparent rounded-full animate-spin"
        ></div>
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

          <!-- ردیف متا (اولویت، مسئول، مهلت، وضعیت، چک‌لیست) -->
          <div class="flex flex-wrap items-start gap-4">
           

            <div class="w-[143px]">
              <div
                class="rounded-xl border border-slate-200 bg-white px-3 min-h-[46px] py-2 flex items-center"
              >
                <AssigneeBadge
                  :user="getUserById(localTask.assignee_id)"
                />
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

            <!-- زیرتسک‌ها (تعداد و درصد پیشرفت) -->
            <button
              type="button"
              @click="showSubtasks = !showSubtasks"
              class="h-[46px] px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition flex items-center gap-2"
            >
              چک لیست
              <span class="text-xs text-slate-400"
                >{{ completedSubtasks }}/{{ localTask.subtasks?.length || 0 }}</span
              >
              <span
                v-if="localTask.subtasks?.length"
                class="text-xs font-bold"
                :class="subtaskPercentClass"
              >{{ subtaskPercent }}%</span>
            </button>

            <!-- برچسب‌ها -->
            <div class="flex items-center gap-1.5 min-h-[46px] rounded-xl border border-slate-200 bg-white px-3">
              <template v-if="localTask.tag_ids?.length">
                <span
                  v-for="id in localTask.tag_ids"
                  :key="id"
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  :style="{ backgroundColor: (tagMap[id]?.color || '#e2e8f0') + '30', color: tagMap[id]?.color || '#475569', border: '1px solid ' + (tagMap[id]?.color || '#e2e8f0') }"
                >
                  {{ tagMap[id]?.name || "?" }}
                </span>
              </template>
              <span v-else class="text-sm text-slate-400">بدون برچسب</span>
            </div>

            <!-- اولویت -->
            <div class="w-[143px]">
              <div
                class="flex items-center h-[46px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800"
              >
                <svg class="w-5 h-5 ml-2 grayscale opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M5 3h4M5 3l4 4m6-4v4m0-4h4m0 0l-4 4m-6 8l-2 3h4l-2 3m6-6l-2 3h4l-2 3" />
                </svg>
                <span class="text-slate-700">{{ priorityLabel }}</span>
              </div>
            </div> 
          </div>

          <!-- پنل زیرتسک‌ها (فقط در صورت وجود داده) -->
          <div v-if="showSubtasks && localTask.subtasks?.length" class="rounded-2xl border border-slate-200 bg-white p-4">
            <div
              class="flex items-center justify-between border-b border-slate-100 pb-3 mb-3"
            >
              <h3 class="font-bold text-slate-700">چک لیست</h3>
              <span class="text-xs text-slate-400"
                >{{ completedSubtasks }}/{{ localTask.subtasks.length }}</span
              >
            </div>
            <div class="w-full h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="subtaskPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'"
                :style="{ width: subtaskPercent + '%' }"
              ></div>
            </div>
            <div class="space-y-2">
              <div
                v-for="sub in localTask.subtasks"
                :key="sub.id"
                class="flex items-center gap-3 p-2 rounded-lg bg-slate-50"
              >
                <input
                  type="checkbox"
                  :checked="sub.is_completed"
                  @click.stop="toggleSubtask(sub)"
                  class="accent-[#238A63] cursor-pointer"
                />
                <span class="text-sm text-slate-700">{{ sub.title }}</span>
              </div>
            </div>
          </div>

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
            <div v-if="localTask.attachments?.length" class="space-y-2">
              <component
                :is="att.url || att.id ? 'a' : 'div'"
                v-for="(att, idx) in localTask.attachments"
                :key="idx"
                v-bind="
                  att.url || att.id
                    ? {
                        href: att.url || `/api/attachments/${att.id}/download`,
                        download: att.name,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      }
                    : {}
                "
                :class="[
                  'group relative w-[40%] flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 transition',
                  att.url || att.id
                    ? 'hover:border-[#238A63]/40 hover:bg-[#238A63]/5 cursor-pointer'
                    : '',
                ]"
              >
                <span class="flex-shrink-0 rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-slate-600">
                  {{ getFileExtension(att.name) }}
                </span>
                <span
                  class="flex-1 truncate text-xs font-semibold text-slate-700"
                  :title="att.name"
                  >{{ att.name }}</span
                >
                <span class="flex-shrink-0 text-[10px] text-slate-400">{{
                  formatFileSize(att.size)
                }}</span>
                <a
                  v-if="att.id"
                  :href="att.url || `/api/attachments/${att.id}/download`"
                  download
                  class="flex-shrink-0 p-1 text-slate-400 hover:text-[#219653] transition-colors"
                  title="دانلود"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      stroke-width="2"
                    />
                  </svg>
                </a>
              </component>
            </div>
            <div v-else class="text-xs text-slate-400">
              هیچ فایلی پیوست نشده است.
            </div>
          </div>
          <!-- بخش گزارش‌ها -->
          <div class="space-y-3 border-t border-slate-100 pt-6">
            <h3 class="font-bold text-slate-700 flex items-center gap-2">
              <svg
                class="w-4 h-4 text-[#238A63]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              گزارش‌ها
            </h3>
            <TaskComments :task-id="props.task.id" />
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
        class="p-6 bg-slate-50/80 border-t flex justify-center"
      >
        <button
          type="button"
          class="px-8 py-3 rounded-xl text-sm font-bold bg-[#F3F4F6] text-slate-500 hover:bg-slate-200 transition-colors"
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
import type { Task, Subtask } from "~/stores/taskStore";
import { useTaskStore } from "~/stores/taskStore";
import { getUserById } from "~/composables/useUsers";
import { taskService } from "~/services/taskService";
type Tag = { id: number; name: string; color?: string }
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

  const token = useCookie("auth_token").value;
  console.log("token:", token ? "دارم" : "ندارم");

  try {
    const subRes: any = await $fetch(`/api/tasks/${props.task.id}/subtasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("subtasks response:", JSON.stringify(subRes));
    const rawSubtasks = subRes?.data?.subtasks ?? subRes?.data ?? subRes ?? [];
    if (Array.isArray(rawSubtasks)) {
      localTask.value.subtasks = rawSubtasks;
    }
  } catch (e: any) {
    console.error("subtasks error:", e.message, e.statusCode);
    localTask.value.subtasks = props.task.subtasks ?? [];
  }

  try {
    const attRes: any = await $fetch(
      `/api/tasks/${props.task.id}/attachments`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log("attachments response:", JSON.stringify(attRes));
    localTask.value.attachments =
      attRes?.data?.attachments ?? attRes?.data ?? attRes ?? [];
  } catch (e: any) {
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

  if (s === "done") return "تکمیل شده";
  return s || "نامشخص";
});

const normalizedPriority = computed(() =>
  String(localTask.value.priority || "").toLowerCase(),
);
const priorityLabel = computed(() => {
  const p = normalizedPriority.value;
  if (p === "high") return "فوری";
  if (p === "medium") return "متوسط";
  if (p === "low") return "عادی";
  return localTask.value.priority || "نامشخص";
});

const showSubtasks = ref(true)

const completedSubtasks = computed(() =>
  localTask.value.subtasks?.filter(s => s.is_completed).length ?? 0
)
const subtaskPercent = computed(() => {
  const total = localTask.value.subtasks?.length ?? 0
  return total ? Math.round((completedSubtasks.value / total) * 100) : 0
})
const subtaskPercentClass = computed(() => {
  if (subtaskPercent.value === 100) return "text-emerald-600"
  if (subtaskPercent.value >= 50) return "text-amber-600"
  return "text-slate-400"
})

const allTags = ref<Tag[]>([])
const tagMap = computed(() => {
  const map: Record<number, Tag> = {}
  for (const tag of allTags.value) {
    map[tag.id] = tag
  }
  return map
})

onMounted(async () => {
  try {
    const res: any = await taskService.getTags()
    allTags.value = res?.data?.tags ?? res?.data ?? res ?? []
  } catch (e) {
    console.error("Failed to load tags:", e)
  }
})

const formatDate = (date?: string | null) => {
  if (!date) return null;

  const d = new Date(date.replace(/-/g, "/"));

  return d.toLocaleDateString("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const toggleSubtask = async (sub: Subtask) => {
  const newStatus = sub.is_completed ? "todo" : "done"
  try {
    await taskService.updateTask(sub.id, { status: newStatus })
    sub.is_completed = !sub.is_completed
  } catch (e) {
    console.error("Failed to toggle subtask:", e)
  }
}

const getFileExtension = (name: string) => {
  const parts = name?.split(".") ?? [];
  return parts.length > 1 ? parts.pop()!.toUpperCase() : "FILE";
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
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
.custom-scrollbar {
  direction: ltr;
  scrollbar-width: thin;
  scrollbar-color: #219653 #f1f1f1;
}
.custom-scrollbar > * {
  direction: rtl;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #219653;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #1d854a;
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
