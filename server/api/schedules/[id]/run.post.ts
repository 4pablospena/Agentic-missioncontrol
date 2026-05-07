import { runScheduleNow } from '../../../services/scheduler.server'
import { withApiEnvelope } from '../../../utils/api-envelope'
import { assertRateLimit } from '../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  assertRateLimit(event, { key: 'scheduler.run', limit: 20, windowMs: 60_000 })
  const id = getRouterParam(event, 'id')
  if (!id?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing schedule id' })
  }
  const updated = await runScheduleNow(id.trim())
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Schedule not found' })
  }
  return withApiEnvelope('scheduler', updated)
})
