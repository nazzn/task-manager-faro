// services/taskService.ts
import { useApi } from '~/composables/useApi'

export const taskService = {
  async getTasks() {
    const { request } = useApi()
    return request('/api/tasks', { method: 'GET' })
  },
  
  async getTask(id: number) {
    const { request } = useApi()
    return request(`/api/tasks/${id}`, { method: 'GET' })
  },
  
  async createTask(payload: any) {
    const { request } = useApi()
    return request('/api/tasks', { 
      method: 'POST',
      body: payload 
    })
  },
  
  async updateTask(id: number, payload: any) {
    const { request } = useApi()
    return request(`/api/tasks/${id}`, { 
      method: 'PUT',
      body: payload 
    })
  },
  
  async deleteTask(id: number) {
    const { request } = useApi()
    return request(`/api/tasks/${id}`, { method: 'DELETE' })
  },
    async updateSubtask(taskId: number, subtaskId: number, data: { title?: string; is_completed?: boolean; order?: number }) {
    const { request } = useApi()
    // استفاده از ساختار یکپارچه درخواست‌ها
    return request(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PUT',
      body: data,
    })
  },

  async deleteSubtask(taskId: number, subtaskId: number) {
    const { request } = useApi()
    return request(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'DELETE',
    })
  },
async uploadAttachment(taskId: number, formData: FormData) {
  const { request } = useApi()

  return request(`/api/tasks/${taskId}/attachments`, {
    method: 'POST',
    body: formData
  })
},

}