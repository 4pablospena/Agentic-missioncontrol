import { listMemorySnapshots } from '../../services/memory-snapshot.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return listMemorySnapshots()
})
