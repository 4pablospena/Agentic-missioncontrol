import { createTaskBodySchema } from '../../utils/tasks-body-schema'
import { createTask } from '../../services/tasks.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const raw = await readBody(event)
  const parsed = createTaskBodySchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid task payload',
      data: { issues: parsed.error.flatten() },
    })
  }
  try {
    return await createTask(parsed.data)
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create task'
    throw createError({ statusCode: 400, statusMessage: msg })
  }
})
