import { markAllNotificationsRead } from '../../services/notifications.server'
import { withApiEnvelope } from '../../utils/api-envelope'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const updated = await markAllNotificationsRead()
  return withApiEnvelope('notifications', { updated })
})
