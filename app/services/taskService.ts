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

  async getSubtasks(taskId: number) {
    const { request } = useApi()
    return request(`/api/tasks/${taskId}/subtasks`, { method: 'GET' })
  },

  async uploadAttachment(taskId: number, formData: FormData) {
  const { request } = useApi()

  return request(`/api/tasks/${taskId}/attachments`, {
    method: 'POST',
    body: formData
  })
},

}