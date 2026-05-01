import { listRecentLogs } from '../services/logger.server'

export default defineEventHandler(async () => {
  return listRecentLogs(100)
})
