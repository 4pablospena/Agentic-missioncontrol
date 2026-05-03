import { listNotifications } from '../../services/notifications.server'
import { notificationsQuerySchema } from '../../utils/notifications-schema'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const parsed = notificationsQuerySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query',
      data: { issues: parsed.error.flatten() },
    })
  }

  return listNotifications({
    status: parsed.data.status,
    limit: parsed.data.limit,
  })
})
