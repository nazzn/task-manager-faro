<!-- app/components/TaskEditModal.vue -->

<template>
  <div
    class="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4"
    dir="rtl"
    tabindex="0"
    @keydown.esc.prevent="handleCancel"
  >
    <!-- Overlay -->
    <div
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      @click="handleCancel"
    />

    <section
      class="relative w-full max-w-[750px] max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <header
        class="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-white/50 backdrop-blur-md"
      >
        <h2 class="text-xl font-extrabold text-slate-800">ویرایش وظیفه</h2>
        <button
          @click="handleCancel"
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
      </header>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
        <form
          id="editTaskForm"
          class="space-y-8"
          @submit.prevent="handleSubmit"
        >
          <!-- Task Title -->
          <div class="space-y-1">
            <input
              v-model="taskForm.title"
              type="text"
              class="w-full border-b-2 border-slate-100 py-2 text-xl font-bold text-slate-800 outline-none transition-all focus:border-[#238A63]"
              :class="{ 'border-red-400': titleError }"
              placeholder="عنوان وظیفه..."
              autofocus
            />
            <span v-if="titleError" class="text-xs text-red-500 font-medium">{{
              titleError
            }}</span>
          </div>

          <!-- META ROW -->
          <div class="flex flex-wrap items-start gap-4">
            <!-- Assignee -->
            <div class="w-[143px]">
              <div
                class="rounded-xl border border-slate-200 bg-white px-3 h-[46px] flex items-center transition-all focus-within:border-[#238A63]"
              >
                <img
                  src="/icons/taskModal/responsible.svg"
                  alt="assignee"
                  class="w-5 h-5 ml-2 grayscale opacity-60 pointer-events-none"
                />
                <select
                  v-model="taskForm.assignee_id"
                  class="w-full text-sm text-slate-700 bg-transparent outline-none border-none p-0 appearance-none cursor-pointer"
                >
                  <option :value="null">انتخاب کنید</option>
                  <option
                    v-for="user in userList"
                    :key="user.id"
                    :value="user.id"
                  >
                    {{ user.username }} ({{ user.role }})
                  </option>
                </select>
              </div>
              <span
                v-if="assigneeError"
                class="text-xs text-red-500 mt-1 block"
                >{{ assigneeError }}</span
              >
            </div>

            <!-- Deadline -->
            <div class="w-[143px] relative border rounded-xl p-2">
              <client-only>
                <date-picker
                  v-model="taskForm.due_date"
                  format="YYYY-MM-DD"
                  display-format="jYYYY/jMM/jDD"
                  color="#238A63"
                  custom-input
                  auto-submit
                >
                  <template #input="{ value, open }">
                    <div
                      @click="open"
                      class="relative flex items-center w-full h-[46px] rounded-xl border border-slate-200 bg-white px-3 cursor-pointer transition-all duration-200"
                    >
                      <img
                        src="/icons/taskModal/Calendar.svg"
                        alt="calendar"
                        class="w-5 h-5 ml-2 grayscale opacity-60 flex-shrink-0"
                      /> <div
                        class="text-sm truncate w-full"
                        :class="value ? 'text-slate-700' : 'text-slate-400'">
                        {{ value || "تاریخ" }}
                      </div>
                    </div>
                  </template>
                </date-picker>
              </client-only>
              <span v-if="endDateError" class="text-xs text-red-500 mt-1 block">
                {{ endDateError }}
              </span>
            </div>

            <!-- Status -->
            <div
              class="w-[143px] relative flex items-center h-[46px] rounded-xl border border-slate-200 bg-white px-3 transition-all focus-within:border-[#238A63]"
            >
              <img
                src="/icons/taskModal/Label.svg"
                alt="status"
                class="w-5 h-5 ml-2 grayscale opacity-60"
              />
              <select
                v-model="taskForm.status"
                class="w-full text-sm text-slate-700 bg-transparent outline-none border-none p-0 appearance-none cursor-pointer"
              >
                <option value="todo">در انتظار</option>
                <option value="doing">در حال انجام</option>
                <option value="review">در انتظار بازبینی</option>
                <option value="done">تکمیل شده</option>
              </select>
            </div>
            <span v-if="statusError" class="text-xs text-red-500 mt-1 block">{{
              statusError
            }}</span>
            <span
              v-if="statusRestrictionMsg"
              class="text-xs text-amber-600 mt-1 block"
              >{{ statusRestrictionMsg }}</span
            >

            <!-- Checklist Toggle -->
            <button
              type="button"
              @click="toggleSubtasks"
              class="h-[46px] px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition flex items-center gap-2"
            >
              چک لیست
              <span class="text-xs text-slate-400"
                >({{ taskForm.subtasks.length }})</span
              >
              <span v-if="subtasksError" class="text-xs text-red-500 block">{{
                subtasksError
              }}</span>
            </button>
          </div>

          <!-- Priority (یک select جدا) -->
          <!-- <div class="flex flex-wrap items-start gap-4">
            <div class="w-[143px]">
              <div
                class="rounded-xl border border-slate-200 bg-white px-3 h-[46px] flex items-center transition-all focus-within:border-[#238A63]"
              >
                <img
                  src="/icons/taskModal/Calendar.svg"
                  alt="priority"
                  class="w-5 h-5 ml-2 grayscale opacity-60"
                />
                <select
                  v-model="taskForm.priority"
                  class="w-full text-sm text-slate-700 bg-transparent outline-none border-none p-0 appearance-none cursor-pointer"
                >
                  <option value="low">عادی</option>
                  <option value="medium">متوسط</option>
                  <option value="high">فوری</option>
                </select>
              </div>
            </div>
          </div> -->

          <!-- Subtasks Panel -->
          <transition name="fade">
            <div v-if="showSubtasks" class="space-y-3 mt-4">
              <div
                class="flex items-center justify-between border-b border-slate-100 pb-2"
              >
                <h3 class="font-bold text-slate-700">چک لیست</h3>
                <button
                  type="button"
                  @click="addSubtask()"
                  class="text-xs font-bold text-[#238A63] hover:text-[#1b6d4e]"
                >
                  + افزودن
                </button>
              </div>
              <div v-if="taskForm.subtasks.length" class="space-y-2">
                <div
                  v-for="(s, i) in taskForm.subtasks"
                  :key="s.id"
                  class="flex items-center gap-3 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition group"
                >
                  <input
                    type="checkbox"
                    v-model="s.is_completed"
                    @change="toggleSubtask(s.id)"
                  />
                  <input
                    v-model="s.title"
                    type="text"
                    class="flex-1 bg-transparent border-none outline-none text-sm"
                    placeholder="عنوان آیتم..."
                  />
                  <button
                    @click="removeSubtask(s.id)"
                    class="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div v-else class="text-xs text-slate-400 text-center">
                هنوز آیتمی ثبت نشده
              </div>
            </div>
          </transition>

          <!-- Description -->
          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700">توضیحات</label>
            <textarea
              v-model="taskForm.description"
              rows="3"
              class="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 outline-none transition-all focus:border-[#238A63] focus:ring-4 focus:ring-[#238A63]/5 min-h-[100px]"
              placeholder="توضیحات مربوط به این فعالیت..."
            />
            <span
              v-if="descriptionError"
              class="text-xs text-red-500 mt-1 block"
              >{{ descriptionError }}</span
            >
          </div>

          <!-- Attachments -->
          <div class="space-y-4">
            <div
              class="flex items-center justify-between border-b border-slate-100 pb-2"
            >
              <h3 class="font-bold text-slate-700">پیوست‌ها</h3>
              <button
                type="button"
                @click="triggerFileInput"
                class="text-xl font-bold text-[#238A63]"
              >
                +
              </button>
              <input
                ref="fileInputRef"
                type="file"
                multiple
                class="hidden"
                @change="handleFileUpload"
              />
            </div>
            <div
              v-if="attachmentsLocal.length"
              class="grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              <div
                v-for="(att, idx) in attachmentsLocal"
                :key="idx"
                class="group relative flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-2.5"
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
                  <button
                    @click="removeAttachment(idx)"
                    class="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 18L18 6M6 6l12 12" stroke-width="2" />
                    </svg>
                  </button>
                </div>
                <span
                  class="truncate text-xs font-semibold text-slate-700"
                  :title="att.name"
                  >{{ att.name }}</span
                >
                <span class="text-[10px] text-slate-400 uppercase">{{
                  formatFileSize(att.size)
                }}</span>
              </div>
            </div>
            <div v-else class="text-xs text-slate-400">
              فایلی پیوست نشده است.
            </div>
          </div>

          <!-- خطای عمومی -->
          <div
            v-if="errorMessage"
            class="text-sm text-red-600 bg-red-50 p-3 rounded-xl"
          >
            {{ errorMessage }}
          </div>
        </form>
      </div>

      <!-- Footer -->
      <footer
        class="p-6 bg-slate-50/80 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-3 justify-center"
      >
        <button
          type="button"
          class="px-8 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-colors"
          @click="handleCancel"
        >
          انصراف
        </button>
        <button
          type="submit"
          form="editTaskForm"
          :disabled="isSubmitting"
          class="px-10 py-3 rounded-xl bg-[#238A63] text-white text-sm font-bold shadow-lg shadow-[#238A63]/20 hover:bg-[#1b6d4e] transition-all disabled:opacity-50"
        >
          {{ isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات" }}
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { toRef, computed, ref, onMounted, onUnmounted } from "vue";
import type { Task } from "~/stores/taskStore";
import { useTaskForm } from "~/composables/useTaskForm";
import { useRole } from "~/composables/useRole";

const props = defineProps<{
  taskToEdit: Task;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update", task: Task): void;
}>();

const userList = [
  { id: 1, username: "admin", role: "admin" },
  { id: 2, username: "manager", role: "manager" },
  { id: 3, username: "usertest", role: "user" },
];

const { isUser } = useRole();

const {
  taskForm,
  isSubmitting,
  titleError,
  descriptionError,
  endDateError,
  subtasksError,
  errorMessage,
  submit,
  assigneeError,
  statusError,
  addSubtask,
  removeSubtask,
  toggleSubtask,
} = useTaskForm({
  taskToEdit: toRef(props, "taskToEdit"),
  emitSave: (payload) => emit("update", payload),
});

// پیام محدودیت وضعیت برای کاربر عادی
const statusRestrictionMsg = computed(() => {
  if (!isUser.value) return "";
  const order = ["todo", "doing", "review", "done"];
  const currentIdx = order.indexOf(taskForm.value.status);
  const allowedNext = order[currentIdx + 1];
  return allowedNext
    ? `شما فقط می‌توانید وضعیت را به "${allowedNext}" تغییر دهید`
    : "شما به انتهای مسیر رسیده‌اید";
});

// ========== Date picker logic ==========
const isDatePickerOpen = ref(false);
const tempDateValue = ref<string | null>(null);
const datePickerRef = ref<any>(null);
const datePickerPanel = ref<HTMLElement | null>(null);

const openDatePicker = () => {
  datePickerRef.value?.show();
};

// const confirmDate = () => {
//   taskForm.value.end_at = tempDateValue.value;
//   closeDatePicker();
// };

const cancelDatePicker = () => closeDatePicker();

const closeDatePicker = () => {
  isDatePickerOpen.value = false;
  document.removeEventListener("click", handleClickOutside);
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    datePickerPanel.value &&
    !datePickerPanel.value.contains(event.target as Node)
  ) {
    closeDatePicker();
  }
};

// ========== Subtasks visibility ==========
const showSubtasks = ref(false);
const toggleSubtasks = () => {
  showSubtasks.value = !showSubtasks.value;
};

// ========== Attachments logic ==========
const attachmentsLocal = ref<any[]>(
  props.taskToEdit?.attachments ? [...props.taskToEdit.attachments] : [],
);
const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => fileInputRef.value?.click();

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;
  const files = Array.from(input.files).map((f) => ({
    name: f.name,
    size: f.size,
    file: f,
  }));
  attachmentsLocal.value.push(...files);
  input.value = "";
};

const removeAttachment = (idx: number) => attachmentsLocal.value.splice(idx, 1);

const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
};

// ========== Scroll lock ==========
const toggleScroll = (lock: boolean) => {
  document.body.style.overflow = lock ? "hidden" : "";
};
onMounted(() => toggleScroll(true));
onUnmounted(() => toggleScroll(false));

// ========== Submit handler ==========
const handleSubmit = async () => {
  taskForm.value.attachments = attachmentsLocal.value

  taskForm.value.subtasks =
    taskForm.value.subtasks.filter((s) => s.title.trim())

  const result = await submit()

  if (result.ok) {
    emit("close")
  }
}

const handleCancel = () => {
  if (isSubmitting.value) return;
  toggleScroll(false);
  emit("close");
};
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
:deep(.vpd-input-group) {
  display: flex;
  width: 100%;
}
:deep(.vpd-input-group input) {
  border: none !important;
  width: 100%;
  outline: none !important;
  font-size: 0.875rem;
  color: #334155;
  background: transparent;
}
:deep(.vpd-main) {
  --vpd-accent-color: #238a63;
  --vpd-selected-bg: #238a63;
}
:deep(.vpd-content) {
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
:deep(.hidden-picker .vpd-input-group) {
  display: none;
}

/* دسترسی به لایه‌های درونی دیت‌پیکر */
:deep(.vpd-input-group) {
  display: flex;
  width: 100%;
}

:deep(.vpd-input-group input) {
  border: none !important;
  width: 100%;
  outline: none !important;
  font-size: 0.875rem; /* text-sm */
  color: #334155; /* slate-700 */
  background: transparent;
}

/* رنگ اصلی دکمه‌ها و انتخابگرها */
:deep(.vpd-main) {
  --vpd-accent-color: #238a63; /* سبز برند شما */
  --vpd-selected-bg: #238a63;
}

/* برای حذف سایه و حاشیه‌های اضافه خود پکیج که با دیزاین شما نمی‌خواند */
:deep(.vpd-content) {
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
:deep(.hidden-picker .vpd-input-group) {
  display: none;
}
:deep(.vpd-input-group svg) {
  display: none !important;
}

:deep(.vpd-input-group .vpd-icon) {
  display: none !important;
}
/* حذف کامل استایل داخلی پکیج */
:deep(.vpd-input-group) {
  display: block !important;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

/* حذف هرگونه آیکون و addon داخلی */
:deep(.vpd-input-group svg),
:deep(.vpd-icon),
:deep(.vpd-input-addon) {
  display: none !important;
  background: transparent !important;
}

/* حذف accent سبز داخلی */
:deep(.vpd-main) {
  --vpd-accent-color: transparent !important;
  --vpd-selected-bg: #238a63; /* فقط روز انتخابی سبز باشد */
}
</style>
