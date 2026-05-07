import { listAlerts } from '../../services/alerts.server'
import { buildErrorSeverities } from '../../services/metrics.server'
import { withApiEnvelope } from '../../utils/api-envelope'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const alertList = await listAlerts(500)
  return withApiEnvelope('metrics', buildErrorSeverities(alertList))
})
