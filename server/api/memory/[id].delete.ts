import { deleteMemoryItem } from '../../services/memory.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }
  const ok = await deleteMemoryItem(id)
  if (!ok)
    throw createError({ statusCode: 404, statusMessage: 'Memory item not found' })
  return { ok: true }
})
