import { patchTaskBodySchema } from '../../utils/tasks-body-schema'
import { updateTask } from '../../services/tasks.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task id' })
  }
  const raw = await readBody(event)
  const parsed = patchTaskBodySchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid patch payload',
      data: { issues: parsed.error.flatten() },
    })
  }
  const task = await updateTask(id.trim(), parsed.data)
  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }
  return task
})
