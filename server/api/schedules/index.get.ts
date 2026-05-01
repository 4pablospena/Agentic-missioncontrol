import { listSchedules } from '../../services/scheduler.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return listSchedules()
})
