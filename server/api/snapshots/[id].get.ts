import { getMemorySnapshotRecord } from '../../services/memory-snapshot.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }
  const rec = getMemorySnapshotRecord(id)
  if (!rec)
    throw createError({ statusCode: 404, statusMessage: 'Snapshot not found' })
  return rec
})
