import { getTask, listTaskEvents } from '../../../services/tasks.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task id' })
  }
  const tid = id.trim()
  const task = await getTask(tid)
  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }
  return listTaskEvents(tid)
})
