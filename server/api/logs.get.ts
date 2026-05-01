import { listRecentLogs } from '../services/logger.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return listRecentLogs(100)
})
