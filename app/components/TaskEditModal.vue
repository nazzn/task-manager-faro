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
      class="relative w-full max-w-[750px] max-h-[95vh] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <header
        class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white"
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
            <AssigneeSelector
              v-model="taskForm.assignee_id"
              :users="userList"
              :error="assigneeError"
            />

            <!-- Deadline -->
            <div class="w-[143px] relative">
              <div
                class="relative flex items-center w-full h-[46px] rounded-xl border border-slate-200 bg-white px-3 cursor-pointer transition-all duration-200 hover:border-[#238A63] focus-within:border-[#238A63]"
                @click="editDueDateInput?.focus()"
              >
                <img
                  src="/icons/taskModal/calendar.svg"
                  alt="calendar"
                  class="w-5 h-5 ml-2 grayscale opacity-90 flex-shrink-0"
                />

                <input
                  id="edit-due-date-input"
                  ref="editDueDateInput"
                  type="text"
                  readonly
                  placeholder="تاریخ"
                  class="w-full bg-transparent text-sm text-right truncate outline-none cursor-pointer text-slate-700 placeholder:text-slate-400"
                />
              </div>

              <client-only>
                <date-picker
                  v-model="taskForm.due_date"
                  format="YYYY-MM-DD"
                  display-format="jYYYY/jMM/jDD"
                  color="#238A63"
                  auto-submit
                  convert-numbers
                  custom-input="#edit-due-date-input"
                />
              </client-only>

              <span v-if="endDateError" class="text-xs text-red-500 mt-1 block">
                {{ endDateError }}
              </span>
            </div>

            <!-- Status -->
            <div class="w-[143px] relative">
              <div
                class="flex items-center h-[46px] rounded-xl border border-slate-200 bg-white px-3 cursor-pointer transition-all duration-200 hover:border-[#219653]"
                v-click-outside="closeStatusDropdown"
              >
                <img
                  src="/icons/taskModal/Label.svg"
                  alt="status"
                  class="w-5 h-5 ml-2 grayscale opacity-60 flex-shrink-0"
                />

                <button
                  type="button"
                  @click="isStatusOpen = !isStatusOpen"
                  class="w-full text-right text-sm text-slate-700"
                >
                  <span class="truncate">{{
                    statusLabel(taskForm.status)
                  }}</span>
                </button>
              </div>

              <div
                v-if="isStatusOpen"
                class="absolute z-[9999] left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
              >
                <div
                  v-for="st in statuses"
                  :key="st.value"
                  @click="
                    taskForm.status = st.value;
                    isStatusOpen = false;
                  "
                  :class="[
                    'flex items-center w-full px-3 py-2.5 cursor-pointer text-sm transition-all',
                    taskForm.status === st.value
                      ? 'bg-[#219653] text-white'
                      : 'hover:bg-slate-50 text-slate-700',
                  ]"
                >
                  <span>{{ st.label }}</span>
                </div>
              </div>
              <span v-if="statusError" class="text-xs text-red-500 mt-1 block">
                {{ statusError }}
              </span>
            </div>
            <span
              v-if="statusRestrictionMsg"
              class="text-xs text-amber-600 mt-1 block"
              >{{ statusRestrictionMsg }}</span
            >

            <!-- Tags -->
            <!-- <TagSelector v-model="taskForm.tag_ids" /> -->

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

            <!-- Priority -->
            <div class="w-[143px] relative">
              <div
                class="flex items-center h-[46px] rounded-xl border border-slate-200 bg-white px-3 cursor-pointer transition-all duration-200 hover:border-[#219653]"
                v-click-outside="closePriorityDropdown"
              >
                <svg
                  class="w-5 h-5 ml-2 grayscale opacity-60 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 3v4M5 3h4M5 3l4 4m6-4v4m0-4h4m0 0l-4 4m-6 8l-2 3h4l-2 3m6-6l-2 3h4l-2 3"
                  />
                </svg>

                <button
                  type="button"
                  @click="isPriorityOpen = !isPriorityOpen"
                  class="w-full text-right text-sm text-slate-700"
                >
                  <span class="truncate">{{
                    priorityLabel(taskForm.priority)
                  }}</span>
                </button>
              </div>

              <div
                v-if="isPriorityOpen"
                class="absolute z-[9999] left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
              >
                <div
                  v-for="pr in priorities"
                  :key="pr.value"
                  @click="
                    taskForm.priority = pr.value;
                    isPriorityOpen = false;
                  "
                  :class="[
                    'flex items-center w-full px-3 py-2.5 cursor-pointer text-sm transition-all',
                    taskForm.priority === pr.value
                      ? 'bg-[#219653] text-white'
                      : 'hover:bg-slate-50 text-slate-700',
                  ]"
                >
                  <span>{{ pr.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Subtasks Panel -->
          <div
            v-if="showSubtasks"
            class="rounded-2xl border border-slate-200 bg-white p-4 mt-4"
          >
            <div
              class="flex items-center justify-between border-b border-slate-100 pb-3 mb-3"
            >
              <h3 class="font-bold text-slate-700">چک لیست</h3>
              <button
                type="button"
                @click="addSubtask()"
                class="text-xl font-bold text-[#238A63] hover:text-[#1b6d4e]"
              >
                +
              </button>
            </div>
            <div v-if="taskForm.subtasks.length" class="space-y-2">
              <div
                v-for="(s, i) in taskForm.subtasks"
                :key="s.id"
                class="flex items-center gap-3 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition group"
              >
                <input type="checkbox" v-model="s.is_completed" />
                <input
                  v-model="s.title"
                  type="text"
                  class="flex-1 bg-transparent border-none outline-none text-sm"
                  placeholder="عنوان آیتم..."
                />
                <button
                  type="button"
                  @click="removeSubtask(s.id)"
                  class="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div v-else class="text-xs text-slate-400 text-center py-4">
              هنوز آیتمی ثبت نشده
            </div>
          </div>

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
            <div v-if="attachmentsLocal.length" class="space-y-2">
              <div
                v-for="(att, idx) in attachmentsLocal"
                :key="idx"
                class="group relative w-[40%] flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
              >
                <span
                  class="flex-shrink-0 rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-slate-600"
                >
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
                <button
                  @click="removeAttachment(idx)"
                  class="flex-shrink-0 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                  title="حذف"
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
          <!-- بخش گزارش‌ها — فقط در ویرایش نمایش داده می‌شه -->
          <!-- <div
            v-if="props.taskToEdit?.id"
            class="space-y-3 border-t border-slate-100 pt-6">
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
            <TaskComments :task-id="props.taskToEdit.id" />
          </div> -->
        </form>
      </div>

      <!-- Footer -->
      <footer
        class="p-6 bg-slate-50/80 border-t flex flex-col-reverse sm:flex-row gap-3 justify-center"
      >
        <button
          type="button"
          class="px-8 py-3 rounded-xl text-sm font-bold bg-[#F3F4F6] text-slate-500 hover:bg-slate-200 transition-colors"
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
import { toRef, computed, ref, watch, onMounted, onUnmounted } from "vue";
import type { Task, TaskStatus } from "~/stores/taskStore";
import { useTaskForm } from "~/composables/useTaskForm";
import { useRole } from "~/composables/useRole";
const { USERS } = useUsers();

const props = defineProps<{
  taskToEdit: Task;
}>();

const editDueDateInput = ref<HTMLInputElement | null>(null);

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update", task: Task, files?: File[]): void;
}>();

const userList = USERS;

const isStatusOpen = ref(false);
const isPriorityOpen = ref(false);

const closeStatusDropdown = () => {
  isStatusOpen.value = false;
};

const closePriorityDropdown = () => {
  isPriorityOpen.value = false;
};

const statuses: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "برای انجام" },
  { value: "doing", label: "در حال انجام" },
  { value: "done", label: "تکمیل شده" },
];

const statusLabel = (s: TaskStatus) =>
  statuses.find((st) => st.value === s)?.label || s;

const priorities: { value: "low" | "medium" | "high"; label: string }[] = [
  { value: "low", label: "عادی" },
  { value: "medium", label: "متوسط" },
  { value: "high", label: "فوری" },
];

const priorityLabel = (p: "low" | "medium" | "high") =>
  priorities.find((pr) => pr.value === p)?.label || p;

const { isUser, canEditTask } = useRole();

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
  emitSave: (payload, files) => emit("update", payload, files),
});

// پیام محدودیت وضعیت برای کاربر عادی
const statusRestrictionMsg = computed(() => {
  if (!isUser.value) return "";
  const order = ["todo", "doing", "done"];
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

watch(
  () => taskForm.value.subtasks.length,
  (len) => {
    if (len > 0) showSubtasks.value = true;
  },
  { immediate: true },
);

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

const getFileExtension = (name: string) => {
  const parts = name?.split(".") ?? [];
  return parts.length > 1 ? parts.pop()!.toUpperCase() : "FILE";
};

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
  if (!canEditTask.value) {
    emit("close");
    return;
  }

  taskForm.value.subtasks = taskForm.value.subtasks.filter((s) =>
    s.title.trim(),
  );

  const files = attachmentsLocal.value
    .filter((a: any) => a.file)
    .map((a: any) => a.file) as File[];
  const result = await submit(files.length > 0 ? files : undefined);

  if (result.ok) {
    emit("close");
  }
};

const handleCancel = () => {
  if (isSubmitting.value) return;
  toggleScroll(false);
  emit("close");
};
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

/* اصلاح رنگ پلیس‌هولدر به صورت تضمینی */
#due-date-input::placeholder {
  color: #475569 !important; /* رنگ slate-600 برای خوانایی عالی */
  opacity: 1 !important; /* رفع باگ کم‌رنگ نشان دادن در مرورگر فایرفاکس */
}

/* اگر خواستید همرنگ تم سبز شود */
#due-date-input:focus::placeholder {
  color: #238A63 !important;
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
