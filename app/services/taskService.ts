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
async deleteAttachment(attachmentId: number) {
  const { request } = useApi()
  return request(`/api/attachments/${attachmentId}`, { method: 'DELETE' })
},

// async getTags() {
//     const { request } = useApi()
//     return request('/api/tags', { method: 'GET' })
//   },

//   async syncTaskTags(taskId: number, tagIds: number[]) {
//     const { request } = useApi()
//     return request(`/api/tasks/${taskId}/tags`, {
//       method: 'POST',
//       body: { tag_ids: tagIds }
//     })
//   },

//   async createTag(payload: { name: string; color?: string }) {
//     const { request } = useApi()
//     return request('/api/tags', { method: 'POST', body: payload })
//   },

  async getComments(taskId: number) {
  const { request } = useApi()
  return request(`/api/tasks/${taskId}/comments`, { method: 'GET' })
},

async createComment(taskId: number, content: string) {
  const { request } = useApi()
  return request(`/api/tasks/${taskId}/comments`, {
    method: 'POST',
    body: { content },
  })
},

async updateComment(commentId: number, content: string) {
  const { request } = useApi()
  return request(`/api/comments/${commentId}`, {
    method: 'PUT',
    body: { content },
  })
},

async deleteComment(commentId: number) {
  const { request } = useApi()
  return request(`/api/comments/${commentId}`, { method: 'DELETE' })
},

}
