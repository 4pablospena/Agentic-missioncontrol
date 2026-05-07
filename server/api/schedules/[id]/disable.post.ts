import { setScheduleEnabled } from '../../../services/scheduler.server'
import { withApiEnvelope } from '../../../utils/api-envelope'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing schedule id' })
  }
  const updated = await setScheduleEnabled(id.trim(), false)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Schedule not found' })
  }
  return withApiEnvelope('scheduler', updated)
})
