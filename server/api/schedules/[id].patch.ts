import { schedulePatchBodySchema } from '../../utils/schedules-body-schema'
import { updateSchedule } from '../../services/scheduler.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing schedule id' })
  }
  const raw = await readBody(event)
  const parsed = schedulePatchBodySchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid patch payload',
      data: { issues: parsed.error.flatten() },
    })
  }
  try {
    const updated = await updateSchedule(id.trim(), parsed.data)
    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'Schedule not found' })
    }
    return updated
  }
  catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'statusCode' in e)
      throw e
    const msg = e instanceof Error ? e.message : 'Failed to update schedule'
    throw createError({ statusCode: 400, statusMessage: msg })
  }
})
