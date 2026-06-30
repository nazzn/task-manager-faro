// // import { tasks } from "../../mock/tasks"

// export default defineEventHandler(async (event) => {

//   const id = Number(event.context.params?.id)

//   const task = tasks.find(t => t.id === id)

//   if (!task) {

//     throw createError({
//       statusCode: 404,
//       message: "Task not found",
//     })

//   }

//   task.deleted_at = null
//   task.deleted_by = null

//   return {
//     success: true,
//     data: task,
//   }

// })
