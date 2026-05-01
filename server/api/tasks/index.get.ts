import { tasksQuerySchema } from '../../utils/tasks-query-schema'
import { listTasks } from '../../services/tasks.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const parsed = tasksQuerySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query',
      data: { issues: parsed.error.flatten() },
    })
  }
  const q = parsed.data
  return listTasks({
    status: q.status,
    assignedAgentId: q.assignedAgentId,
    priority: q.priority,
  })
})
