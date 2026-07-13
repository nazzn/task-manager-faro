import { api } from "~/services/api";

export const taskService = {
  async getTasks() {
    return api("/api/tasks", { method: "GET" });
  },

  async getTask(id: number) {
    return api(`/api/tasks/${id}`, { method: "GET" });
  },

  async createTask(payload: any) {
    return api("/api/tasks", {
      method: "POST",
      body: payload,
    });
  },

  async updateTask(id: number, payload: any) {
    return api(`/api/tasks/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  async deleteTask(id: number) {
    return api(`/api/tasks/${id}`, { method: "DELETE" });
  },

  async getSubtasks(taskId: number) {
    return api(`/api/tasks/${taskId}/subtasks`, { method: "GET" });
  },

  async uploadAttachment(taskId: number, formData: FormData) {
    return api(`/api/tasks/${taskId}/attachments`, {
      method: "POST",
      body: formData,
    });
  },

  async deleteAttachment(attachmentId: number) {
    return api(`/api/attachments/${attachmentId}`, { method: "DELETE" });
  },

  async getComments(taskId: number) {
    return api(`/api/tasks/${taskId}/comments`, { method: "GET" });
  },

  async createComment(taskId: number, content: string) {
    return api(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      body: { content },
    });
  },

  async updateComment(commentId: number, content: string) {
    return api(`/api/comments/${commentId}`, {
      method: "PUT",
      body: { content },
    });
  },

  async deleteComment(commentId: number) {
    return api(`/api/comments/${commentId}`, { method: "DELETE" });
  },
};
