import { markNotificationRead } from '../../../services/notifications.server'
import { withApiEnvelope } from '../../../utils/api-envelope'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing notification id',
    })
  }

  const updated = await markNotificationRead(id)
  if (!updated) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Notification not found',
    })
  }

  return withApiEnvelope('notifications', updated)
})
