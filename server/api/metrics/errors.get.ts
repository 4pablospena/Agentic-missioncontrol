import { listAlerts } from '../../services/alerts.server'
import { buildErrorSeverities } from '../../services/metrics.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const alertList = await listAlerts(500)
  return buildErrorSeverities(alertList)
})
