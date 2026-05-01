import { setScheduleEnabled } from '../../../services/scheduler.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing schedule id' })
  }
  const updated = await setScheduleEnabled(id.trim(), true)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Schedule not found' })
  }
  return updated
})
