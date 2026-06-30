import { defineStore } from "pinia";
import { taskService } from "~/services/taskService";

export type TaskStatus = "todo" | "doing" | "review" | "done";
export type StatusFilter = TaskStatus | null;

export type Subtask = {
  id: number;
  title: string;
  is_completed: boolean;
  order: number;
};

export type Role = "admin" | "manager" | "user";

export type Attachment = {
  id?: number | string;
  name: string;
  size: number;
  url?: string;
  file?: File;
};

export interface User {
  id: number;
  username: string;
  role: Role;
}

export interface Task {
  id: number;
  title: string;
  description?: string;

  status: TaskStatus;
  priority: "low" | "medium" | "high";

  assignee_id: number;

  due_date: string;
  start_at: string | null;

  created_at: string;

  subtasks: Subtask[];
  attachments: Attachment[];

  assignee?: User;
  createdBy?: User;

  parent_id: number | null;
  project_id: number | null;
  tag_ids: number[];
}

export const statusTabs: { label: string; value: TaskStatus; icon: any }[] = [
  { label: "برای انجام", value: "todo", icon: "status.svg" },
  { label: "در حال انجام", value: "doing", icon: "status.svg" },
  { label: "در انتظار بازبینی", value: "review", icon: "status.svg" },
  { label: "تکمیل شده", value: "done", icon: "status.svg" },
];

export const useTaskStore = defineStore("taskStore", {
  state: () => ({
    tasks: [] as Task[],
    selectedTask: null as Task | null,
    selectedTaskLoading: false,
    selectedTaskError: "" as string | null,
    statusFilter: null as StatusFilter,
    searchQuery: "",
  }),

  getters: {
    filteredTasks: (state): Task[] => {
      let result = state.tasks;

      if (state.statusFilter) {
        result = result.filter((t) => t.status === state.statusFilter);
      }
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase();
        result = result.filter(
          (task) =>
            task.title.toLowerCase().includes(q) ||
            task.description?.toLowerCase().includes(q),
        );
      }
      return result;
    },

    taskCounts: (state) => {
      const counts: Record<TaskStatus, number> = {
        todo: 0,
        doing: 0,
        review: 0,
        done: 0,
      };
      state.tasks.forEach((task) => {
        if (task.status in counts) {
          counts[task.status]++;
        }
      });
      return counts;
    },
  },

  actions: {
    setStatusFilter(status: StatusFilter) {
      this.statusFilter = status;
    },

    setSearchQuery(query: string) {
      this.searchQuery = query;
    },

    async loadTasks() {
      try {
        const res: any = await taskService.getTasks();

        // ساختار پاسخ: { success: true, data: { tasks: [...], pagination: {...} } }
        if (res?.success && Array.isArray(res?.data?.tasks)) {
          this.tasks = res.data.tasks;
        } else if (Array.isArray(res?.data)) {
          this.tasks = res.data;
        } else if (Array.isArray(res)) {
          this.tasks = res;
        } else {
          this.tasks = [];
        }

        console.log("Tasks loaded:", this.tasks.length);
      } catch (error: any) {
        console.error("Load tasks error:", error);
        this.tasks = [];
        throw error;
      }
    },

    async loadTask(id: number) {
      this.selectedTaskLoading = true;
      this.selectedTaskError = null;

      try {
        const res = await taskService.getTask(id);
        console.log("getTask response:", res);

        // ساختار پاسخ: { success: true, data: { ...task } }
        const raw: any = res?.success ? res.data : (res?.data ?? res);
        this.selectedTask = {
          ...raw,
          subtasks: raw.subTasks ?? raw.subtasks ?? [],
        } as Task;

        return this.selectedTask;
      } catch (error: any) {
        console.error("Load task error:", error);
        this.selectedTaskError =
          error?.data?.message ||
          error?.message ||
          "خطا در دریافت جزئیات وظیفه";
        throw error;
      } finally {
        this.selectedTaskLoading = false;
      }
    },

    clearSelectedTask() {
      this.selectedTask = null;
      this.selectedTaskError = null;
    },

    async addTask(payload: any, files?: File[]) {
      try {
        // ۱. ابتدا خود تسک را بدون پیوست‌ها می‌سازیم
        const res: any = await taskService.createTask(payload);
        console.log("createTask response:", res);

        let createdTask: Task | null = null;
        if (res?.success && res?.data) {
          createdTask = res.data;
        } else if (res?.data) {
          createdTask = res.data;
        } else {
          createdTask = res;
        }

        if (createdTask && createdTask.id) {
          // ۲. اگر کاربر فایلی انتخاب کرده بود، آن‌ها را آپلود می‌کنیم
          if (files && files.length > 0) {
            for (const file of files) {
              const formData = new FormData();
              formData.append("file", file);
              await taskService.uploadAttachment(createdTask.id, formData);
            }
            // ۳. تسک را مجدداً لود می‌کنیم تا پیوست‌های ثبت شده به همراه آبجکت بازگردند
            createdTask = await this.loadTask(createdTask.id);
          }

          if (createdTask) {
            this.tasks.unshift(createdTask);
          }
          return createdTask;
        } else {
          throw new Error("پاسخ دریافتی از سرور معتبر نیست");
        }
      } catch (error: any) {
        if (error.statusCode === 422 || error.response?.status === 422) {
          throw error;
        }
        console.error("Create task error:", error);
        throw error;
      }
    },

    async updateTask(id: number, payload: any, filesToUpload?: File[]) {
      try {
        // ۱. آپدیت جزییات اصلی تسک
        const res: any = await taskService.updateTask(id, payload);
        console.log("updateTask response:", res);

        let updatedTask: Task | null = null;
        if (res?.success && res?.data) {
          updatedTask = res.data;
        } else if (res?.data) {
          updatedTask = res.data;
        } else {
          updatedTask = res;
        }

        if (updatedTask) {
          // ۲. اگر فایل‌های جدیدی برای اضافه کردن وجود دارد
          if (filesToUpload && filesToUpload.length > 0) {
            for (const file of filesToUpload) {
              const formData = new FormData();
              formData.append("file", file);
              await taskService.uploadAttachment(id, formData);
            }
            // بارگذاری مجدد تسک برای به دست آوردن آرایه جدید پیوست‌ها
            updatedTask = await this.loadTask(id);
          }

          const index = this.tasks.findIndex((t) => t.id === id);
          if (index !== -1 && updatedTask) {
            this.tasks[index] = updatedTask;
          }

          // همچنینselectedTask فعلی را بروزرسانی می‌کنیم
          if (this.selectedTask && this.selectedTask.id === id && updatedTask) {
            this.selectedTask = updatedTask;
          }

          return updatedTask;
        }
      } catch (error: any) {
        if (error.statusCode === 422 || error.response?.status === 422) {
          throw error;
        }
        console.error("Update task error:", error);
        throw error;
      }
    },

    async deleteTask(id: number) {
      try {
        await taskService.deleteTask(id);
        this.tasks = this.tasks.filter((t) => t.id !== id);
      } catch (error: any) {
        if (error.statusCode === 422 || error.response?.status === 422) {
          throw error;
        }
        console.error("Delete task error:", error);
        throw error;
      }
    },

    async addSubtask(taskId: number, title: string) {
      try {
        const task = this.tasks.find((t) => t.id === taskId);
        if (!task) return;
        const newSubtask: Subtask = {
          id: Date.now(),
          title,
          is_completed: false,
          order: task.subtasks.length,
        };
        const updatedSubtasks = [...task.subtasks, newSubtask];
        await this.updateTask(taskId, { subtasks: updatedSubtasks });
      } catch (error: any) {
        if (error.statusCode === 422 || error.response?.status === 422)
          throw error;
        throw error;
      }
    },
    async removeSubtask(taskId: number, subtaskId: number) {
      try {
        const task = this.tasks.find((t) => t.id === taskId);
        if (!task) return;
        const updatedSubtasks = task.subtasks
          .filter((s) => s.id !== subtaskId)
          .map((s, index) => ({ ...s, order: index }));
        await this.updateTask(taskId, { subtasks: updatedSubtasks });
      } catch (error: any) {
        if (error.statusCode === 422 || error.response?.status === 422)
          throw error;
        throw error;
      }
    },
    async updateSubtask(taskId: number, subtaskId: number, data: any) {
      const updated = await taskService.updateSubtask(taskId, subtaskId, data);
      const task = this.tasks.find((t) => t.id === taskId);
      if (task) {
        const idx = task.subtasks.findIndex((s) => s.id === subtaskId);
        if (idx !== -1 && updated && typeof updated === "object") {
          task.subtasks[idx] = Object.assign({}, task.subtasks[idx], updated);
        }
      }
      return updated;
    },

    async deleteSubtask(taskId: number, subtaskId: number) {
      await taskService.deleteSubtask(taskId, subtaskId);
      const task = this.tasks.find((t) => t.id === taskId);
      if (task) {
        task.subtasks = task.subtasks.filter((s) => s.id !== subtaskId);
      }
    },
    async toggleSubtask(taskId: number, subtaskId: number) {
      try {
        const task = this.tasks.find((t) => t.id === taskId);
        if (!task) return;
        const updatedSubtasks = task.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, is_completed: !s.is_completed } : s,
        );
        await this.updateTask(taskId, { subtasks: updatedSubtasks });
      } catch (error: any) {
        if (error.statusCode === 422 || error.response?.status === 422)
          throw error;
        throw error;
      }
    },
  },
});
