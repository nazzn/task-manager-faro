import { defineStore } from "pinia";
import { taskService } from "~/services/taskService";

export type TaskStatus = "todo" | "doing" | "done";
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
export type Comment = {
  id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  user?: {
    id: number;
    username: string;
    role: string;
  };
  attachment?: {
    id: number;
    name: string;
    size: number;
  } | null;
};

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
  // tag_ids: number[];
}

export const statusTabs: { label: string; value: TaskStatus; icon: any }[] = [
  { label: "برای انجام", value: "todo", icon: "status.svg" },
  { label: "در حال انجام", value: "doing", icon: "status.svg" },

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
    comments: [] as Comment[],
    commentsLoading: false,
    commentsError: null as string | null,
  }),

  getters: {
    filteredTasks: (state): Task[] => {
      let result = state.tasks;

      if (state.statusFilter) {
        result = result.filter((t) => t.status === state.statusFilter);
      } else {
        result = result.filter((t) => t.status !== "done");
      }
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase();
        result = result.filter(
          (task) =>
            task.title.toLowerCase().includes(q) ||
            task.description?.toLowerCase().includes(q),
        );
      }
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      result = [...result].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      return result;
    },

    taskCounts: (state) => {
      const counts: Record<TaskStatus, number> = {
        todo: 0,
        doing: 0,
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

    // normalizeTags(task: any) {
    //   if (task.tags && Array.isArray(task.tags) && !task.tag_ids?.length) {
    //     task.tag_ids = task.tags.map((t: any) => (t.id != null ? t.id : t));
    //   }
    //   if (!Array.isArray(task.tag_ids)) {
    //     task.tag_ids = [];
    //   }
    //   return task;
    // },

    async loadTasks() {
      try {
        const res: any = await taskService.getTasks();

        // ساختار پاسخ: { success: true, data: { tasks: [...], pagination: {...} } }
        let raw: any[] = [];
        if (res?.success && Array.isArray(res?.data?.tasks)) {
          raw = res.data.tasks;
        } else if (Array.isArray(res?.data)) {
          raw = res.data;
        } else if (Array.isArray(res)) {
          raw = res;
        }
        this.tasks = raw.filter((t: any) => t.parent_id == null);

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

        const raw: any = res?.success ? res.data : (res?.data ?? res);
        // raw = this.normalizeTags(raw);
        this.selectedTask = {
          ...raw,
          subtasks: raw.subTasks ?? raw.subtasks ?? [],
        } as Task;

        // Fetch subtasks from dedicated endpoint
        try {
          const subRes: any = await taskService.getSubtasks(id);
          const rawSubtasks =
            subRes?.data?.subtasks ?? subRes?.data ?? subRes ?? [];
          if (Array.isArray(rawSubtasks)) {
            this.selectedTask.subtasks = rawSubtasks;
          }
        } catch (e: any) {
          console.error("Load subtasks error:", e);
        }

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
        const { subtasks, ...taskPayload } = payload;

        const res: any = await taskService.createTask(taskPayload);
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
          // Upload files
          if (files && files.length > 0) {
            for (const file of files) {
              const formData = new FormData();
              formData.append("file", file);
              await taskService.uploadAttachment(createdTask.id, formData);
            }
          }

          // // Sync tags via dedicated endpoint
          // if (Array.isArray(payload.tag_ids)) {
          //   await taskService.syncTaskTags(createdTask.id, payload.tag_ids).catch(e => {
          //     console.error("Sync tags error on create:", e);
          //   });
          // }

          // Create subtasks as tasks with parent_id
          if (subtasks?.length) {
            const activeSubtasks = subtasks.filter((s: any) => s.title?.trim());
            for (const sub of activeSubtasks) {
              await taskService.createTask({
                title: sub.title.trim(),
                description: "",
                status: sub.is_completed ? "done" : "todo",
                priority: createdTask.priority,
                assignee_id: createdTask.assignee_id,
                parent_id: createdTask.id,
                due_date: createdTask.due_date,
                project_id: createdTask.project_id,
                // tag_ids: createdTask.tag_ids ?? [],
              });
            }
          }

          // Reload task to get fresh data
          createdTask = await this.loadTask(createdTask.id);

          if (createdTask) {
            // // Ensure tag_ids from payload are preserved on the task object
            // if (Array.isArray(payload.tag_ids)) {
            //   createdTask.tag_ids = [...payload.tag_ids];
            // }
            if (createdTask.parent_id == null) {
              this.tasks.unshift(createdTask);
            }
          }
          return createdTask;
        } else {
          throw new Error("پاسخ دریافتی از سرور معتبر نیست");
        }
      } catch (error: any) {
        if (error.status === 422 || error.statusCode === 422 || error.response?.status === 422) {
          throw error;
        }
        console.error("Create task error:", error);
        throw error;
      }
    },

    async updateTask(id: number, payload: any, filesToUpload?: File[]) {
      try {
        const { subtasks, ...taskPayload } = payload;

        const res: any = await taskService.updateTask(id, taskPayload);
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
          // Upload files if any
          if (filesToUpload && filesToUpload.length > 0) {
            for (const file of filesToUpload) {
              const formData = new FormData();
              formData.append("file", file);
              await taskService.uploadAttachment(id, formData);
            }
          }

          // // Sync tags via dedicated endpoint
          // if (Array.isArray(payload.tag_ids)) {
          //   await taskService.syncTaskTags(id, payload.tag_ids).catch(e => {
          //     console.error("Sync tags error on update:", e);
          //   });
          // }

          // Sync subtasks as tasks with parent_id
          if (subtasks) {
            const subRes: any = await taskService.getSubtasks(id);
            const rawSubtasks =
              subRes?.data?.subtasks ?? subRes?.data ?? subRes ?? [];
            const currentSubtasks: Subtask[] = Array.isArray(rawSubtasks)
              ? rawSubtasks
              : [];
            const currentIds = new Set(currentSubtasks.map((s) => s.id));

            const formSubtasks = (subtasks as Subtask[]).filter((s) =>
              s.title?.trim(),
            );

            // Create new subtasks
            for (const sub of formSubtasks) {
              if (!currentIds.has(sub.id)) {
                await taskService.createTask({
                  title: sub.title.trim(),
                  description: "",
                  status: sub.is_completed ? "done" : "todo",
                  priority: updatedTask.priority,
                  assignee_id: updatedTask.assignee_id,
                  parent_id: id,
                  due_date: updatedTask.due_date,
                  project_id: updatedTask.project_id,
                  // tag_ids: updatedTask.tag_ids ?? [],
                });
              }
            }

            // Update changed subtasks
            for (const sub of formSubtasks) {
              if (currentIds.has(sub.id)) {
                const current = currentSubtasks.find((s) => s.id === sub.id);
                if (current && current.title !== sub.title.trim()) {
                  await taskService.updateTask(sub.id, {
                    title: sub.title.trim(),
                    status: sub.is_completed ? "done" : "todo",
                  });
                }
              }
            }

            // Delete removed subtasks
            const formIds = new Set(formSubtasks.map((s) => s.id));
            for (const sub of currentSubtasks) {
              if (!formIds.has(sub.id)) {
                await taskService.deleteTask(sub.id);
              }
            }
          }

          // Reload task
          updatedTask = await this.loadTask(id);

          if (updatedTask) {
            // // Ensure tag_ids from payload are preserved on the task object
            // if (Array.isArray(payload.tag_ids)) {
            //   updatedTask.tag_ids = [...payload.tag_ids];
            // }

            const index = this.tasks.findIndex((t) => t.id === id);
            if (index !== -1) {
              this.tasks[index] = updatedTask;
            }

            if (this.selectedTask && this.selectedTask.id === id) {
              this.selectedTask = updatedTask;
            }
          }

          return updatedTask;
        }
      } catch (error: any) {
        if (error.status === 422 || error.statusCode === 422 || error.response?.status === 422) {
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
        if (error.status === 422 || error.statusCode === 422 || error.response?.status === 422) {
          throw error;
        }
        console.error("Delete task error:", error);
        throw error;
      }
    },

    async addSubtask(taskId: number, title: string) {
      try {
        const parentTask = this.tasks.find((t) => t.id === taskId);
        if (!parentTask) return;
        const res: any = await taskService.createTask({
          title,
          description: "",
          status: "todo",
          priority: parentTask.priority,
          assignee_id: parentTask.assignee_id,
          parent_id: taskId,
          due_date: parentTask.due_date,
          project_id: parentTask.project_id,
          // tag_ids: parentTask.tag_ids ?? [],
        });
        // Reload parent's subtasks
        const subRes: any = await taskService.getSubtasks(taskId);
        const raw = subRes?.data?.subtasks ?? subRes?.data ?? subRes ?? [];
        if (Array.isArray(raw)) {
          parentTask.subtasks = raw;
        }
        return res;
      } catch (error: any) {
        if (error.status === 422 || error.statusCode === 422 || error.response?.status === 422)
          throw error;
        throw error;
      }
    },

    async removeSubtask(taskId: number, subtaskId: number) {
      await this.deleteSubtask(taskId, subtaskId);
    },

    async updateSubtask(taskId: number, subtaskId: number, data: any) {
      const updated = await taskService.updateTask(subtaskId, data);
      const task = this.tasks.find((t) => t.id === taskId);
      if (task) {
        const subRes: any = await taskService.getSubtasks(taskId);
        const raw = subRes?.data?.subtasks ?? subRes?.data ?? subRes ?? [];
        if (Array.isArray(raw)) {
          task.subtasks = raw;
        }
      }
      return updated;
    },

    async deleteSubtask(taskId: number, subtaskId: number) {
      await taskService.deleteTask(subtaskId);
      const task = this.tasks.find((t) => t.id === taskId);
      if (task) {
        task.subtasks = task.subtasks.filter((s) => s.id !== subtaskId);
      }
    },

    async toggleSubtask(taskId: number, subtaskId: number) {
      try {
        const task = this.tasks.find((t) => t.id === taskId);
        if (!task) return;
        const sub = task.subtasks.find((s) => s.id === subtaskId);
        if (!sub) return;
        await taskService.updateTask(subtaskId, {
          status: sub.is_completed ? "todo" : "done",
        });
        // Reload subtasks
        const subRes: any = await taskService.getSubtasks(taskId);
        const raw = subRes?.data?.subtasks ?? subRes?.data ?? subRes ?? [];
        if (Array.isArray(raw)) {
          task.subtasks = raw;
        }
      } catch (error: any) {
        if (error.status === 422 || error.statusCode === 422 || error.response?.status === 422)
          throw error;
        throw error;
      }
    },
    async loadComments(taskId: number) {
      this.commentsLoading = true;
      this.commentsError = null;
      try {
        const res: any = await taskService.getComments(taskId);
        this.comments = Array.isArray(res?.data)
          ? res.data
          : (res?.data?.comments ?? []);
      } catch (e: any) {
        this.commentsError = e?.message || "خطا در دریافت گزارش‌ها";
      } finally {
        this.commentsLoading = false;
      }
    },

    async addComment(taskId: number, content: string) {
      const res: any = await taskService.createComment(taskId, content);
      const created = res?.data ?? res;
      if (created) this.comments.unshift(created);
      return created;
    },

    async editComment(commentId: number, content: string) {
      await taskService.updateComment(commentId, content);
      const idx = this.comments.findIndex((c) => c.id === commentId);
      if (idx !== -1) this.comments[idx].content = content;
    },

    async removeComment(commentId: number) {
      await taskService.deleteComment(commentId);
      this.comments = this.comments.filter((c) => c.id !== commentId);
    },
  },
});
