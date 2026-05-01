import { retryTask } from '../../../services/tasks.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task id' })
  }
  try {
    const task = await retryTask(id.trim())
    if (!task) {
      throw createError({ statusCode: 404, statusMessage: 'Task not found' })
    }
    return task
  }
  catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'statusCode' in e)
      throw e
    const msg = e instanceof Error ? e.message : 'Cannot retry task'
    throw createError({ statusCode: 400, statusMessage: msg })
  }
})
