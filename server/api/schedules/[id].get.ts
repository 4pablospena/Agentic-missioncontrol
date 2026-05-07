import { getSchedule } from '../../services/scheduler.server'
import { withApiEnvelope } from '../../utils/api-envelope'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing schedule id' })
  }
  const row = await getSchedule(id.trim())
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Schedule not found' })
  }
  return withApiEnvelope('scheduler', row)
})
