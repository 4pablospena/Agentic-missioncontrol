import { listSchedules } from '../../services/scheduler.server'
import { withApiEnvelope } from '../../utils/api-envelope'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return withApiEnvelope('scheduler', await listSchedules())
})
