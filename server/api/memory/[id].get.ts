import { getMemoryItem } from '../../services/memory.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }
  const item = getMemoryItem(id)
  if (!item)
    throw createError({ statusCode: 404, statusMessage: 'Memory item not found' })
  return item
})
