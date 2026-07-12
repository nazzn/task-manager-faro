<!-- app/pages/index.vue -->
<template>
  <div class="space-y-8 px-5">
    <!-- Top Actions -->
    <div class="flex items-start gap-6 flex-col">
      <div class="flex items-center gap-4">
        <button
          v-if="canCreateTask"
          @click="openCreate"
          class="h-10 px-4 rounded-xl bg-[#219653] text-white text-sm font-semibold hover:bg-[#1d854a] transition-all"
        >
          + ایجاد وظیفه
        </button>

        <button
          class="flex items-center gap-2 text-sm text-slate-600 font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2l-7 7v5l-4 2v-7L3 6V4z"
            />
          </svg>
          جستجوی پیشرفته
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <section
      ref="tableContainer"
      class="bg-white border border-slate-200 rounded-[24px] overflow-hidden flex flex-col"
      :style="{ height: tableHeight + 'px' }"
    >
      <!-- Header -->
      <div
        class="table-header grid grid-cols-12 px-8 py-5 text-sm text-[#4B5563] font-semibold flex-shrink-0"
      >
        <div class="col-span-4">
          <!-- استفاده از flex و gap دقیقاً مشابه ردیف‌های پایین -->
          <div class="flex items-center gap-2">
            <!-- این div فضای اشغال شده توسط چک‌باکس را در هر رزولوشنی دقیقاً شبیه‌سازی می‌کند -->
            <div class="w-[10px] h-4 flex-shrink-0"></div>
            <span class="truncate text-right w-full">عنوان وظیفه</span>
          </div>
        </div>

        <div class="col-span-3 text-center">مسئول</div>
        <div class="col-span-2 text-center">مهلت انجام</div>
        <div class="col-span-3 text-center">وضعیت</div>
      </div>

      <!-- Scrollable Body with Fade Effect -->
      <div class="relative flex-1 overflow-hidden justify-center text-center">
        <div
          ref="scrollContainer"
          class="absolute inset-0 overflow-y-auto py-2 scroll-right"
        >
          <div class="divide-y divide-slate-100 rounded-xl pb-2 content-rtl px-4">
            <div
              v-for="(task, index) in paginatedTasks"
              :key="task.id"
              @click="openTaskDetail(task.id)"
              class="task-row group relative grid grid-cols-12 items-center px-8 py-5 cursor-pointer transition-all duration-200"
              :class="{
                'last-task-hint':
                  hasMoreTasks && index === paginatedTasks.length - 1,
                'opacity-50 scale-95':
                  isLastTaskPartiallyVisible &&
                  index === paginatedTasks.length - 1,
                'task-selected': taskStore.selectedTask?.id === task.id,
              }"
            >
              <div class="col-span-4">
                <div class="flex items-start gap-2">
                  <!-- چک‌باکس و دات اولویت -->
                  <div
                    class="relative inline-flex flex-shrink-0 mt-1"
                    :title="priorityLabel(task.priority)"
                  >
                    <input
                      type="checkbox"
                      class="w-4 h-4 rounded border border-[#B7D8C6] cursor-pointer accent-[#219653]"
                      :checked="task.status === 'done'"
                      @click.stop="toggleTaskStatus(task)"
                    />
                    <span
                      class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                      :class="priorityDotClass(task.priority)"
                    ></span>
                  </div>

                  <!-- عنوان + توضیحات، هر دو دقیقاً از همین نقطه شروع میشن -->
                  <div
                    class="flex flex-col items-end w-full min-w-0 text-right"
                  >
                    <div class="font-semibold text-slate-800 w-full">
                      {{ task.title }}
                    </div>

                    <div
                      v-if="task.description"
                      class="task-description-fade text-xs text-slate-400 mt-1 w-full"
                    >
                      {{ task.description }}
                    </div>
                  </div>
                </div>
              </div>
              <!-- مسئول -->
              <div class="col-span-3 flex items-center justify-center">
                <AssigneeBadge
                  v-if="getAssigneeIds(task).length <= 1"
                  :user="getUserById(getAssigneeIds(task)[0])"
                  :showName="true"
                  size="sm"
                  variant="light"
                  class="flex items-center"
                />

                <div v-else class="flex items-center flex-row-reverse">
                  <div
                    v-for="(uid, idx) in getAssigneeIds(task).slice(0, 3)"
                    :key="uid"
                    class="rounded-full ring-2 ring-white"
                    :style="{
                      marginRight: idx === 0 ? 0 : '-10px',
                      zIndex: 10 - idx,
                    }"
                    :title="getUserById(uid)?.username || ''"
                  >
                    <AssigneeBadge
                      :user="getUserById(uid)"
                      :showName="false"
                      size="sm"
                      variant="light"
                    />
                  </div>

                  <div
                    v-if="getAssigneeIds(task).length > 3"
                    class="w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
                    style="margin-right: -10px; z-index: 1"
                  >
                    +{{ getAssigneeIds(task).length - 3 }}
                  </div>
                </div>
              </div>

              <!-- Date -->
              <div class="col-span-2 text-center text-sm text-slate-600">
                {{ formatDate(task.due_date) }}
              </div>

              <!-- Status -->
              <div class="col-span-3 flex justify-center">
                <span
                  class="px-4 py-2 rounded-lg text-xs font-medium"
                  :class="statusBadgeClass(task.status)"
                >
                  {{ statusLabel(task.status) }}
                </span>
              </div>

              <!-- ===== نشانگر بارگذاری روی آخرین تسک ===== -->
              <div
                v-if="hasMoreTasks && index === paginatedTasks.length - 1"
                class="absolute left-1/2 -translate-x-1/2 bottom-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <div
                  class="bg-[#219653] text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                  <span>بارگذاری بیشتر</span>
                </div>
              </div>
            </div>

            <!-- ===== Infinity Scroll Component ===== -->
            <InfinityScroll
              v-if="filteredTasks.length > 0"
              :loading="isLoadingMore"
              :disabled="!hasMoreTasks"
              :root="scrollContainer"
              root-margin="200px"
              @load-more="loadMore"
            >
              <template #loading>
                <div v-if="isLoadingMore" class="py-6 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div
                      class="w-5 h-5 border-2 border-[#219653] border-t-transparent rounded-full animate-spin"
                    ></div>
                    <span class="text-sm text-slate-500"
                      >در حال بارگذاری...</span
                    >
                  </div>
                </div>
                <div
                  v-else-if="!hasMoreTasks"
                  class="py-6 text-center text-sm text-slate-400"
                >
                  ✅ همه تسک‌ها بارگذاری شدند
                </div>
              </template>
            </InfinityScroll>

            <div
              v-if="filteredTasks.length === 0"
              class="py-24 text-center text-slate-400 text-sm"
            >
              هیچ وظیفه‌ای یافت نشد
            </div>
          </div>
        </div>

        <!-- ===== گرادیان محو کننده در پایین ===== -->
        <div
          v-if="hasMoreTasks && !isLoadingMore"
          class="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style="
            background: linear-gradient(
              to top,
              rgba(255, 255, 255, 0.95),
              rgba(255, 255, 255, 0.2),
              transparent
            );
          "
        ></div>

        <!-- ===== نشانگر فلش در پایین ===== -->
        <button
          v-if="hasMoreTasks && !isLoadingMore"
          @click="scrollToLastTask"
          class="absolute bottom-2 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer z-10"
          title="رفتن به آخرین تسک"
        >
          <div
            class="bg-[#219653] text-white rounded-full p-2 shadow-lg hover:bg-[#1d854a] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </button>
      </div>
    </section>

    <!-- Modals -->
    <Teleport to="body">
      <TaskModal
        v-if="showCreateModal && canCreateTask"
        :task-to-edit="null"
        :on-save="handleSave"
        @close="closeCreateModal"
      />
    </Teleport>

    <div
      v-if="showDetailModal && taskStore.selectedTaskLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40"
    >
      <div
        class="rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-700"
      >
        در حال دریافت جزئیات وظیفه...
      </div>
    </div>
    <Teleport to="body">
      <TaskDetailModal
        v-if="showDetailModal && taskStore.selectedTask"
        :task="taskStore.selectedTask"
        :can-edit="canEditTask"
        :can-delete="canDeleteTask"
        @close="closeTaskDetail"
        @edit="handleEditTask"
        @delete="handleDeleteTask"
    /></Teleport>
    <Teleport to="body">
      <TaskEditModal
        v-if="showEditModal && selectedTask"
        :task-to-edit="selectedTask"
        @close="closeEditModal"
        @update="handleUpdate"
    /></Teleport>
    <ConfirmModal
      v-if="showDeleteModal"
      title="حذف وظیفه"
      message="آیا از حذف این وظیفه مطمئن هستید؟"
      confirm-text="حذف"
      cancel-text="انصراف"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  computed,
  watch,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { storeToRefs } from "pinia";
import { useTaskStore, type Task } from "~/stores/taskStore";
import { useRole } from "~/composables/useRole";
import { getUserById } from "~/composables/useUsers";
import { taskService } from "~/services/taskService";
import InfinityScroll from "~/components/InfinityScroll.vue";
import TaskDetailModal from "~/components/TaskDetailModal.vue";
import TaskEditModal from "~/components/TaskEditModal.vue";
import TaskModal from "~/components/TaskModal.vue";
import ConfirmModal from "~/components/ConfirmModal.vue";

// type Tag = { id: number; name: string; color?: string }

// const allTags = ref<Tag[]>([])
// const tagMap = computed(() => {
//   const map: Record<number, Tag> = {}
//   for (const tag of allTags.value) {
//     map[tag.id] = tag
//   }
//   return map
// })

const taskStore = useTaskStore();
const { canCreateTask, canEditTask, canDeleteTask } = useRole();
const { showToast } = useToast();

const { filteredTasks } = storeToRefs(taskStore);

// ========== Responsive Height ==========
const tableContainer = ref<HTMLElement | null>(null);
const tableHeight = ref(800);

const calculateHeight = () => {
  const tableElement = tableContainer.value;
  if (!tableElement) return;

  const rect = tableElement.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const desiredHeight = viewportHeight - rect.top - 200;

  const minHeight = 500;
  const maxHeight = 900;

  tableHeight.value = Math.max(minHeight, Math.min(desiredHeight, maxHeight));

  console.log(
    `Viewport: ${viewportHeight}, Table Top: ${rect.top}, Available: ${desiredHeight}, Final Height: ${tableHeight.value}`,
  );
};

// ========== Infinite Scroll State ==========
const PAGE_SIZE = 7;
const visibleCount = ref(PAGE_SIZE);
const isLoadingMore = ref(false);
const scrollContainer = ref<HTMLElement | null>(null);
const isLastTaskPartiallyVisible = ref(false);

const paginatedTasks = computed(() => {
  return filteredTasks.value.slice(0, visibleCount.value);
});

const hasMoreTasks = computed(() => {
  return visibleCount.value < filteredTasks.value.length;
});

// ========== Check if last task is partially visible ==========
const checkLastTaskVisibility = () => {
  if (!scrollContainer.value || paginatedTasks.value.length === 0) {
    isLastTaskPartiallyVisible.value = false;
    return;
  }

  const container = scrollContainer.value;
  const tasks = container.querySelectorAll(".divide-y > div:not(:last-child)");
  const lastTask = tasks[tasks.length - 1] as HTMLElement;

  if (!lastTask) {
    isLastTaskPartiallyVisible.value = false;
    return;
  }
  // const selectTask = (task: Task) => {
  //   selectedTask.value = task;
  //   openDetail(task);
  // };

  const containerRect = container.getBoundingClientRect();
  const lastTaskRect = lastTask.getBoundingClientRect();

  const visibleHeight =
    Math.min(lastTaskRect.bottom, containerRect.bottom) -
    Math.max(lastTaskRect.top, containerRect.top);
  const totalHeight = lastTaskRect.height;

  isLastTaskPartiallyVisible.value =
    visibleHeight < totalHeight * 0.6 && visibleHeight > 0;
};

// ========== تابع بارگذاری ==========
const loadMore = async () => {
  if (isLoadingMore.value || !hasMoreTasks.value) return;

  isLoadingMore.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newCount = Math.min(
      visibleCount.value + PAGE_SIZE,
      filteredTasks.value.length,
    );
    visibleCount.value = newCount;

    await nextTick();
    checkLastTaskVisibility();
  } finally {
    isLoadingMore.value = false;
  }
};

// ========== وقتی filteredTasks تغییر می‌کنه ==========
watch(filteredTasks, async () => {
  visibleCount.value = PAGE_SIZE;
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0;
  }
  await nextTick();
  checkLastTaskVisibility();
});

// ========== Lifecycle ==========
onMounted(async () => {
  // try {
  //   const res: any = await taskService.getTags()
  //   allTags.value = res?.data?.tags ?? res?.data ?? res ?? []
  // } catch (e) {
  //   console.error("Failed to load tags:", e)
  // }

  try {
    await taskStore.loadTasks();
    console.log("Tasks after load:", taskStore.tasks);
    console.log("Filtered tasks:", filteredTasks.value);

    await nextTick();
    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    setTimeout(checkLastTaskVisibility, 100);
  } catch (error) {
    console.error("Error loading tasks:", error);
    showToast("خطا در بارگذاری تسک‌ها");
  }
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", calculateHeight);
});

// ========== Event Handlers ==========
const openCreate = () => {
  selectedTask.value = null;
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  selectedTask.value = null;
};

// const closeDetailModal = () => {
//   showDetailModal.value = false;
//   selectedTask.value = null;
// };

const closeEditModal = () => {
  showEditModal.value = false;
  selectedTask.value = null;
};

const closeTaskDetail = () => {
  showDetailModal.value = false;
  taskStore.clearSelectedTask();
};

const handleEditTask = (task: Task) => {
  selectedTask.value = task;
  showDetailModal.value = false;
  taskStore.clearSelectedTask();
  showEditModal.value = true;
};

const handleDeleteTask = async (id: number) => {
  taskToDeleteId.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (taskToDeleteId.value === null) return;
  showDeleteModal.value = false;
  try {
    await taskStore.deleteTask(taskToDeleteId.value);
    showDetailModal.value = false;
    taskStore.clearSelectedTask();
    await taskStore.loadTasks();
  } catch (error) {
    console.error("Delete task error:", error);
  }
  taskToDeleteId.value = null;
};
// چند مسئولی یا تک‌مسئولی رو یکدست می‌کنه به آرایه‌ای از id ها
const getAssigneeIds = (task: Task): number[] => {
  const anyTask = task as any;
  if (Array.isArray(anyTask.assignee_ids)) return anyTask.assignee_ids;
  if (Array.isArray(anyTask.assignees)) {
    return anyTask.assignees.map((a: any) =>
      typeof a === "object" ? a.id : a,
    );
  }
  return task.assignee_id ? [task.assignee_id] : [];
};
console.log(JSON.stringify(filteredTasks.value[0], null, 2));
// const openEditFromDetail = (task: Task) => {
//   closeDetailModal();
//   selectedTask.value = task;
//   showEditModal.value = true;
// };

// const handleDelete = (id: string | number) => {
//   const confirmed = confirm("آیا از حذف این وظیفه مطمئت هستید؟");
//   if (!confirmed) return;
//   taskStore.deleteTask(id as number);
//   showToast("وظیفه حذف شد 🗑️");
//   closeDetailModal();
// };

const handleSave = async (payload: Partial<Task>, files?: File[]) => {
  await taskStore.addTask(payload, files);
  showToast("وظیفه جدید ایجاد شد 🚀");
};

const handleUpdate = async (updatedTask: Task, files?: File[]) => {
  await taskStore.updateTask(updatedTask.id, updatedTask, files);
  showToast("وظیفه با موفقیت ویرایش شد ✨");
  closeEditModal();
};

const toggleTaskStatus = async (task: Task) => {
  const newStatus = task.status === "done" ? "doing" : "done";

  try {
    await taskStore.updateTask(task.id, { status: newStatus });
    showToast(
      newStatus === "done" ? "✅ تسک تکمیل شد" : "🔄 تسک در حال انجام شد",
    );
  } catch (error: any) {
    if (
      error.status === 422 ||
      error.statusCode === 422 ||
      error.response?.status === 422
    ) {
      showToast("❌ تغییر وضعیت مجاز نیست. ترتیب تغییرات: todo → doing → done");
    } else {
      showToast("خطایی رخ داد. لطفاً دوباره تلاش کنید");
    }
  }
};

const formatDate = (date?: string | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fa-IR");
};

const statusLabel = (s: Task["status"]) => {
  if (s === "todo") return "برای انجام";
  if (s === "doing") return "در حال انجام";

  if (s === "done") return "تکمیل شده";
  return "نامشخص";
};

const statusBadgeClass = (s: Task["status"]) => {
  if (s === "done") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s === "doing") return "bg-blue-50 text-blue-700 border-blue-100";

  return "bg-slate-50 text-slate-700 border-slate-200";
};

const priorityLabel = (p: Task["priority"]) => {
  if (p === "high") return "فوری";
  if (p === "medium") return "متوسط";
  if (p === "low") return "عادی";
  return "نامشخص";
};

const priorityDotClass = (p: Task["priority"]) => {
  if (p === "high") return "bg-red-500";
  if (p === "medium") return "bg-yellow-500";
  if (p === "low") return "bg-blue-500";
  return "bg-slate-300";
};

// ========== Modal States ==========
const showCreateModal = ref(false);
const showDetailModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const taskToDeleteId = ref<number | null>(null);
const selectedTask = ref<Task | null>(null);

const openTaskDetail = async (taskId: number) => {
  showDetailModal.value = true;
  try {
    await taskStore.loadTask(taskId);
  } catch (error) {
    console.error("Open task detail error:", error);
    showDetailModal.value = false;
    showToast("خطا در دریافت جزئیات وظیفه");
  }
};
const scrollToLastTask = () => {
  if (!scrollContainer.value) return;

  const tasks = scrollContainer.value.querySelectorAll(".task-row");
  const lastTask = tasks[tasks.length - 1] as HTMLElement;

  if (lastTask) {
    lastTask.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};
</script>

<style scoped>
/* ===== افکت محو شدن آخرین تسک ===== */
.opacity-50 {
  opacity: 0.5 !important;
  transition: all 0.3s ease;
}

.scale-95 {
  transform: scale(0.95) !important;
}

/* ===== افکت hover روی آخرین تسک ===== */
.last-task-hint {
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}
/* توضیحات: یک خط، راست‌چین، محو در انتها به‌جای بریده‌شدن خشک */
.task-description-fade {
  white-space: nowrap;
  overflow: hidden;
  text-align: right;
  -webkit-mask-image: linear-gradient(to left, black 75%, transparent 100%);
  mask-image: linear-gradient(to left, black 75%, transparent 100%);
}
.last-task-hint:hover {
  transform: scale(1.01);
}

.last-task-hint:hover::before {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  box-shadow: 0 4px 12px rgba(33, 150, 83, 0.15);
  border: 1px solid rgba(33, 150, 83, 0.2);
}

.last-task-hint:hover::after {
  content: "⬇️ برای بارگذاری بیشتر اسکرول کنید";
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(33, 150, 83, 0.95);
  color: white;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(33, 150, 83, 0.3);
  animation: slideUp 0.3s ease;
  z-index: 10;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* ===== انیمیشن فلش ===== */
.animate-bounce {
  animation: bounce 1.5s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-8px);
  }
}

/* ===== استایل اسکرول بار ===== */
.scroll-right {
  direction: ltr;
  scrollbar-width: thin;
  scrollbar-color: #219653 #f1f1f1;
}

.content-rtl {
  direction: rtl;
}

.scroll-right::-webkit-scrollbar {
  width: 6px;
}

.scroll-right::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.scroll-right::-webkit-scrollbar-thumb {
  background: #219653;
  border-radius: 10px;
}

.scroll-right::-webkit-scrollbar-thumb:hover {
  background: #1d854a;
}

/* ===== انیمیشن‌های دیگر ===== */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
.scroll-right {
  direction: ltr;
  scrollbar-width: thin;
  scrollbar-color: #219653 #f1f1f1;
}

.content-rtl {
  direction: rtl;
}
/* حالت عادی تسک */
.task-row {
  border-bottom: 1px solid #f1f5f9;
  border-radius: 0;
  transition: all 0.2s ease;
}

/* hover */
.task-row {
  position: relative;
}

.task-row::before {
  content: "";
  position: absolute;
  inset: 0 32px; /* همون فاصله 32px که هدر با px-8 و خط زیرش داره */
  z-index: -1;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.task-row:hover::before {
  background: #f9fafb;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
}

.task-selected::before {
  border: 1px solid rgba(33, 150, 83, 0.35);
  background: #f0fdf4;
  box-shadow: 0 4px 14px rgba(33, 150, 83, 0.15);
}
.table-header {
  position: relative;
}

/* خط پایین با فاصله از دو طرف */
.table-header::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 32px;
  right: 32px;
  height: 1px;
  background: #e5e7eb;
}
</style>
