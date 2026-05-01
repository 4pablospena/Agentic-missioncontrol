import { listAlerts } from '../services/alerts.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return listAlerts(150)
})
