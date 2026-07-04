<!-- app/components/TaskDetailModal.vue -->

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
        <h2 class="text-xl font-extrabold text-slate-800">{{ modalTitle }}</h2>
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
        <form id="taskForm" class="space-y-8" @submit.prevent="handleSubmit">
          <!-- Task Title -->
          <div class="space-y-1">
            <input
              v-model.trim="taskForm.title"
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
            <div class="w-[143px] relative">
              <div
                class="w-full rounded-xl hover:bg-slate-50 border border-slate-200 bg-white px-3 min-h-[52px] py-2 flex items-center transition-all focus-within:border-[#219653]"
              >
                <img
                  v-if="!taskForm.assignee_id.length"
                  src="/icons/taskModal/responsible.svg"
                  alt="assignee"
                  class="w-5 h-5 ml-2 grayscale opacity-60 pointer-events-none flex-shrink-0"
                />

                <div v-click-outside="closeAssigneeDropdown" class="w-full">
                  <button
                    type="button"
                    @click="isAssigneeOpen = !isAssigneeOpen"
                    class="w-full text-right"
                  >
                    <span
                      v-if="!taskForm.assignee_id.length"
                      class="text-sm text-slate-800"
                      >انتخاب مسئول</span
                    >
                    <div v-else class="flex flex-wrap gap-1.5">
                      <div
                        v-for="id in taskForm.assignee_id"
                        :key="id"
                        class="w-7 h-7 rounded-full bg-[#219653] text-white flex items-center justify-center text-xs font-bold"
                        :title="userList.find((u) => u.id === id)?.username"
                      >
                        {{
                          (userList.find((u) => u.id === id)?.username || "?")
                            .charAt(0)
                            .toUpperCase()
                        }}
                      </div>
                    </div>
                  </button>

                  <div
                    v-if="isAssigneeOpen"
                    class="absolute z-[9999] left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto p-1.5 dropdown-scroll"
                  >
                    <div
                      v-for="user in userList"
                      :key="user.id"
                      @click.stop="toggleAssignee(user.id)"
                      :class="[
                        'flex items-center justify-between w-full my-1 gap-1 cursor-pointer text-sm rounded-lg transition-all',
                        taskForm.assignee_id.includes(user.id)
                          ? 'bg-[#cacaca] text-white'
                          : 'hover:bg-slate-50 text-slate-700',
                      ]"
                    >
                      <div class="flex items-center gap-2">
                        <div
                          class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          :class="
                            taskForm.assignee_id.includes(user.id)
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200 text-slate-600'
                          "
                        >
                          {{ user.username.charAt(0).toUpperCase() }}
                        </div>
                        <span>{{ user.username }}</span>
                      </div>
                      <button
                        v-if="taskForm.assignee_id.includes(user.id)"
                        type="button"
                        @click.stop="removeAssignee(user.id)"
                        class="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                      >
                        <svg
                          class="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M6 18L18 6M6 6l12 12"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <span
                v-if="assigneeError"
                class="text-xs text-red-500 mt-1 block"
              >
                {{ assigneeError }}
              </span>
            </div>

            <!-- Reminder -->
            <div class="hover:bg-slate-50">
              <div class="w-[143px] border rounded-xl p-2">
                <client-only>
                  <date-picker
                    v-model="taskForm.due_date"
                    format="YYYY-MM-DD"
                    display-format="jYYYY/jMM/jDD"
                    auto-submit
                    custom-input
                  >
                    <template #input="{ value, open }">
                      <div
                        @click="open"
                        class="flex items-center h-[46px] rounded-xl border border-slate-200 bg-white px-3 cursor-pointer transition-all duration-200 hover:border-[#238A63] focus-within:border-[#238A63]"
                      >
                        <img
                          src="/icons/taskModal/calendar.svg"
                          alt="calendar"
                          class="w-5 h-5 ml-2 opacity-60 flex-shrink-0"
                        />

                        <span
                          class="text-sm w-full text-right truncate"
                          :class="value ? 'text-slate-700' : 'text-slate-400'"
                        >
                          {{ value ? value : "زمان یادآوری" }}
                        </span>
                      </div>
                    </template>
                  </date-picker>
                </client-only>
              </div>
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
            <!-- Checklist Toggle -->
            <button
              type="button"
              @click="toggleSubtasks"
              class="h-[46px] px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition flex items-center gap-2"
            >
              چک لیست
              <span class="text-xs text-slate-400">
                ({{ taskForm.subtasks.length }})
              </span>
            </button>
            <span v-if="subtasksError" class="text-xs text-red-500 block">
              {{ subtasksError }}
            </span>
          </div>

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
              v-model.trim="taskForm.description"
              class="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 outline-none transition-all focus:border-[#238A63] focus:ring-4 focus:ring-[#238A63]/5 min-h-[120px]"
              placeholder="توضیحات مربوط به این فعالیت..."
            />
            <span
              v-if="descriptionError"
              class="text-xs text-red-500 mt-1 block"
            >
              {{ descriptionError }}
            </span>
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
        </form>
        <div
          v-if="errorMessage"
          class="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4 mx-6"
        >
          {{ errorMessage }}
        </div>
      </div>

      <!-- Footer -->
      <footer
        class="p-6 bg-slate-50/80 border-t  flex flex-col-reverse sm:flex-row gap-3 justify-center"
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
          form="taskForm"
          :disabled="isSubmitting"
          class="px-10 py-3 rounded-xl bg-[#238A63] text-white text-sm font-bold shadow-lg shadow-[#238A63]/20 hover:bg-[#1b6d4e] transition-all disabled:opacity-50"
        >
          {{ isSubmitting ? "در حال ذخیره..." : submitButtonText }}
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef, ref, onMounted, onUnmounted } from "vue";
import type { Task, Subtask, TaskStatus } from "~/stores/taskStore";
import { useTaskForm } from "~/composables/useTaskForm";

const isDatePickerOpen = ref(false);
const tempDateValue = ref<string | null>(null);
const datePickerRef = ref(null);
const datePickerPanel = ref<HTMLElement | null>(null);
const isAssigneeOpen = ref(false);
const isStatusOpen = ref(false);

const closeAssigneeDropdown = () => {
  isAssigneeOpen.value = false;
};

const closeStatusDropdown = () => {
  isStatusOpen.value = false;
};

const statuses: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "برای انجام" },
  { value: "doing", label: "در حال انجام" },
  { value: "done", label: "تکمیل شده" },
];

const statusLabel = (s: TaskStatus) =>
  statuses.find((st) => st.value === s)?.label || s;

/* Props */
const props = defineProps<{
  taskToEdit?: Task | null;
  onSave?: (task: any) => Promise<void> | void;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", task: any): void;
}>();

const {
  taskForm,
  isEditing,
  isSubmitting,
  titleError,
  descriptionError,
  assigneeError, // ← این اضافه شد (جای assigneesError)
  endDateError,
  subtasksError,
  statusError, // ← این اضافه شد
  errorMessage,
  addSubtask,
  removeSubtask,
  toggleSubtask,
  //   parent_id: ,
  // project_id: ,
  // tag_ids: ,

  submit,
} = useTaskForm({
  taskToEdit: toRef(props, "taskToEdit"),
  onSave: props.onSave,
  // emitSave: (task) => emit("save", task),
});

const userList = [
  { id: 1, username: "naz", role: "admin" },
  { id: 4, username: "mamad", role: "user" },
  { id: 5, username: "mina", role: "user" },
  { id: 2, username: "goli", role: "manager" },
  { id: 3, username: "sara", role: "user" },
];

/* Ensure subtasks exists */
if (!taskForm.value.subtasks) taskForm.value.subtasks = [];

/* Attachments */
const attachmentsLocal = ref<any[]>(
  props.taskToEdit?.attachments ? [...props.taskToEdit.attachments] : [],
);
const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => fileInputRef.value?.click();

const toggleAssignee = (id: number) => {
  if (taskForm.value.assignee_id.includes(id)) {
    taskForm.value.assignee_id = taskForm.value.assignee_id.filter(
      (i: number) => i !== id,
    );
  } else {
    taskForm.value.assignee_id.push(id);
  }
  isAssigneeOpen.value = false;
};

const removeAssignee = (id: number) => {
  taskForm.value.assignee_id = taskForm.value.assignee_id.filter(
    (i: number) => i !== id,
  );
};

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
const openDatePicker = (event: MouseEvent) => {
  event.stopPropagation(); // جلوگیری از بسته شدن آنی به دلیل کلیک روی والد
  isDatePickerOpen.value = !isDatePickerOpen.value;

  if (isDatePickerOpen.value) {
    setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
  }
};

const handleDateSelect = (value: string) => {
  taskForm.value.due_date = value;
  closeDatePicker();
};

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

/* Subtasks Logic */
const showSubtasks = ref(false);

const toggleSubtasks = () => {
  showSubtasks.value = !showSubtasks.value;
};

/* Prevent page scroll */
const toggleScroll = (lock: boolean) => {
  document.body.style.overflow = lock ? "hidden" : "";
};
onMounted(() => toggleScroll(true));
onUnmounted(() => toggleScroll(false));

/* Submit */
const handleSubmit = async () => {
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

const modalTitle = computed(() =>
  isEditing.value ? "ویرایش وظیفه" : "ایجاد وظیفه جدید",
);
const submitButtonText = computed(() =>
  isEditing.value ? "بروزرسانی وظیفه" : "ثبت وظیفه",
);
</script>

<style scoped>
.dropdown-scroll {
  direction: ltr;
}

.dropdown-scroll > * {
  direction: rtl;
}

.dropdown-scroll::-webkit-scrollbar {
  width: 5px;
}

.dropdown-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.dropdown-scroll::-webkit-scrollbar-thumb {
  background: #219653;
  border-radius: 10px;
}

.dropdown-scroll::-webkit-scrollbar-thumb:hover {
  background: #1d854a;
}

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

/* :deep(.vpd-main) {
  --vpd-accent-color: #238a63; 
  --vpd-selected-bg: #238a63;
} */

.vpd-main {
  background-color: red;
  width: 40px;
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
