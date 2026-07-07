// app/composable/useTaskForm.ts
import { computed, ref, watch, type Ref } from "vue";
import type { Task, TaskStatus, Attachment, Subtask } from "~/stores/taskStore";

export type TaskForm = {
  title: string;
  description: string;
  assignee_id: number[];
  start_at: string | null;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  status: TaskStatus;
  subtasks: Subtask[];
  attachments: Attachment[];
  tag_ids: number[];
};

type UseTaskFormOptions = {
  taskToEdit?: Ref<Task | null | undefined>;
  onSave?: (task: any, files?: File[]) => Promise<void> | void;
  emitSave?: (task: any, files?: File[]) => void;
};

function uid() {
  return Date.now();
}

function newSubtask(order: number): Subtask {
  return {
    id: uid(),
    title: "",
    is_completed: false,
    order,
  };
}

function normalizeAssigneeId(value: unknown): number[] {
  if (value == null) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => Number(item))
      .filter((item): item is number => !isNaN(item) && item > 0);
  }

  const num = Number(value);
  if (!isNaN(num) && num > 0) {
    return [num];
  }

  return [];
}

function createDefaultForm(): TaskForm {
  return {
    title: "",
    description: "",
    assignee_id: [],
    start_at: null,
    due_date: null,
    priority: "low",
    status: "todo",
    subtasks: [],
    attachments: [],
    tag_ids: [],
  };
}

export function useTaskForm(options: UseTaskFormOptions = {}) {
  const { taskToEdit, onSave, emitSave } = options;

  const taskForm = ref<TaskForm>(createDefaultForm());

  const isSubmitting = ref(false);
  const errorMessage = ref("");

  const titleError = ref("");
  const descriptionError = ref("");
  const assigneeError = ref("");
  const endDateError = ref("");
  const subtasksError = ref("");
  const statusError = ref("");

  const isEditing = computed(() => !!taskToEdit?.value);

  function clearErrors() {
    titleError.value = "";
    descriptionError.value = "";
    assigneeError.value = "";
    endDateError.value = "";
    subtasksError.value = "";
    statusError.value = "";
    errorMessage.value = "";
  }

  function resetForm() {
    taskForm.value = createDefaultForm();
    clearErrors();
  }

  function fillForm(task: Task) {
    taskForm.value = {
      title: task.title ?? "",
      description: task.description ?? "",

      /**
       * اگر task.assignee_id از بک‌اند عدد باشد:
       * 1 -> [1]
       *
       * اگر آرایه باشد:
       * [1, 2] -> [1, 2]
       *
       * اگر null/undefined باشد:
       * []
       */
      assignee_id: normalizeAssigneeId((task as any).assignee_id),

      start_at: task.start_at ?? null,
      due_date: task.due_date ?? null,
      priority: (task.priority as "low" | "medium" | "high") ?? "low",
      status: (task.status as TaskStatus) ?? "todo",
    attachments: Array.isArray(task.attachments) ? [...task.attachments] : [],

      subtasks:
        Array.isArray(task.subtasks) && task.subtasks.length > 0
          ? task.subtasks.map((item, index) => ({
              id: item.id ?? uid(),
              title: item.title ?? "",
              is_completed: !!item.is_completed,
              order: item.order ?? index + 1,
            }))
          : [newSubtask(1)],
      tag_ids: Array.isArray((task as any).tag_ids) ? [...(task as any).tag_ids] : [],
    };

    clearErrors();
  }

  function reindexSubtasks() {
    taskForm.value.subtasks = (taskForm.value.subtasks ?? []).map((x, i) => ({
      ...x,
      order: i + 1,
    }));
  }

  function addSubtask(afterId?: number) {
    const list = [...(taskForm.value.subtasks ?? [])];

    if (list.length === 0) {
      taskForm.value.subtasks = [newSubtask(1)];
      return;
    }

    if (!afterId) {
      list.push(newSubtask(list.length + 1));
      taskForm.value.subtasks = list;
      return;
    }

    const idx = list.findIndex((x) => x.id === afterId);

    if (idx === -1) {
      list.push(newSubtask(list.length + 1));
    } else {
      list.splice(idx + 1, 0, newSubtask(idx + 2));
    }

    taskForm.value.subtasks = list;
    reindexSubtasks();
  }

  function removeSubtask(id: number) {
    const list = taskForm.value.subtasks ?? [];

    if (list.length <= 1) return;

    taskForm.value.subtasks = list.filter((x) => x.id !== id);
    reindexSubtasks();
  }

  function toggleSubtask(id: number) {
    const item = taskForm.value.subtasks.find((x) => x.id === id);

    if (!item) return;

    item.is_completed = !item.is_completed;
  }

  const checklistStats = computed(() => {
    const items = taskForm.value.subtasks ?? [];
    const total = items.length;
    const done = items.filter((i) => i.is_completed).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    return {
      total,
      done,
      percent,
    };
  });

  function normalizeSubtasksBeforeSubmit() {
    taskForm.value.subtasks = (taskForm.value.subtasks ?? []).map((x, i) => ({
      ...x,
      title: x.title.trim(),
      order: i + 1,
    }));
  }

  function validateForm() {
    clearErrors();

    let isValid = true;

    if (!taskForm.value.title.trim()) {
      titleError.value = "عنوان تسک الزامی است.";
      isValid = false;
    }

    if (!taskForm.value.description.trim()) {
      descriptionError.value = "توضیحات تسک الزامی است.";
      isValid = false;
    }

    if (!taskForm.value.assignee_id.length) {
      assigneeError.value = "انتخاب حداقل یک مسئول الزامی است.";
      isValid = false;
    }

    if (!taskForm.value.due_date) {
      endDateError.value = "تاریخ پایان الزامی است.";
      isValid = false;
    }

    if (taskForm.value.start_at && taskForm.value.due_date) {
      if (taskForm.value.due_date < taskForm.value.start_at) {
        errorMessage.value = "تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.";
        isValid = false;
      }
    }

    const subtasks = taskForm.value.subtasks ?? [];

    if (subtasks.length > 0 && subtasks.some((s) => !s.title.trim())) {
      subtasksError.value = "عنوان آیتم چک‌لیست نمی‌تواند خالی باشد.";
      isValid = false;
    }

    return isValid;
  }

  function buildTaskPayload() {
    normalizeSubtasksBeforeSubmit();

    const editingTask = taskToEdit?.value;

    return {
      ...(editingTask?.id ? { id: editingTask.id } : {}),

      title: taskForm.value.title.trim(),
      description: taskForm.value.description.trim(),
      assignee_id: taskForm.value.assignee_id[0] ?? null, // فقط اولین مسئول
      due_date: taskForm.value.due_date ?? null, // تغییر نام
      priority: taskForm.value.priority,
      status: taskForm.value.status,
      parent_id: null,
      project_id: null,
      tag_ids: taskForm.value.tag_ids,
      subtasks: taskForm.value.subtasks
        .filter((s) => s.title.trim())
        .map((x, i) => ({
          id: x.id,
          title: x.title.trim(),
          is_completed: x.is_completed,
          order: i + 1,
        })),
    };
  }

  function handleApiError(err: any) {
    if (err.status === 422 || err.statusCode === 422 || err.response?.status === 422) {
      const nested = err.data?.data;
      const errors = nested?.errors || err.data?.errors || err.response?.data?.errors || {};

      titleError.value = errors.title?.[0] || "";
      descriptionError.value = errors.description?.[0] || "";
      assigneeError.value = errors.assignee_id?.[0] || "";
      endDateError.value = errors.due_date?.[0] || errors.end_at?.[0] || "";
      statusError.value = errors.status?.[0] || "";
      subtasksError.value = errors.subtasks?.[0] || "";

      errorMessage.value =
        nested?.message || err.data?.message || err.response?.data?.message || "";
    } else {
      errorMessage.value =
        err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "خطایی رخ داد.";
    }
  }

  async function submit(files?: File[]) {
    if (!validateForm()) {
      return {
        ok: false,
      };
    }

    isSubmitting.value = true;

    try {
      const payload = buildTaskPayload();

      if (onSave) {
        await onSave(payload, files);
      }

      if (emitSave) {
        emitSave(payload, files);
      }

      return {
        ok: true,
        data: payload,
      };
    } catch (err: any) {
      handleApiError(err);

      return {
        ok: false,
        error: err,
      };
    } finally {
      isSubmitting.value = false;
    }
  }

  /**
   * Watchers برای پاک کردن خطاها
   */
  watch(
    () => taskForm.value.title,
    () => {
      if (titleError.value) titleError.value = "";
    },
  );

  watch(
    () => taskForm.value.description,
    () => {
      if (descriptionError.value) descriptionError.value = "";
    },
  );

  watch(
    () => [...taskForm.value.assignee_id],
    () => {
      if (assigneeError.value) assigneeError.value = "";
    },
  );

  watch(
    () => taskForm.value.due_date,
    () => {
      if (endDateError.value) endDateError.value = "";
      if (errorMessage.value) errorMessage.value = "";
    },
  );

  watch(
    () => taskForm.value.start_at,
    () => {
      if (errorMessage.value) errorMessage.value = "";
    },
  );

  watch(
    () => taskForm.value.status,
    () => {
      if (statusError.value) statusError.value = "";
    },
  );

  watch(
    () => taskForm.value.subtasks.map((x) => x.title),
    () => {
      if (subtasksError.value) subtasksError.value = "";
    },
  );

  watch(
    () => taskToEdit?.value,
    (task) => {
      if (task) {
        fillForm(task);
      } else {
        resetForm();
      }
    },
    {
      immediate: true,
    },
  );

  return {
    taskForm,
    isEditing,
    isSubmitting,
    errorMessage,

    titleError,
    descriptionError,
    assigneeError,
    endDateError,
    subtasksError,
    statusError,

    checklistStats,

    addSubtask,
    removeSubtask,
    toggleSubtask,

    submit,
    validateForm,
    clearErrors,
    buildTaskPayload,
    resetForm,
  };
}
