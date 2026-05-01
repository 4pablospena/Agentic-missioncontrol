import { acknowledgeAlert } from '../../../services/alerts.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const id = getRouterParam(event, 'id')
  if (!id?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing alert id' })
  }

  const updated = await acknowledgeAlert(id)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Alert not found' })
  }

  return { alert: updated }
})
