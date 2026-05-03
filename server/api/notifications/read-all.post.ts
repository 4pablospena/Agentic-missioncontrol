import { markAllNotificationsRead } from '../../services/notifications.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const updated = await markAllNotificationsRead()
  return { updated }
})
