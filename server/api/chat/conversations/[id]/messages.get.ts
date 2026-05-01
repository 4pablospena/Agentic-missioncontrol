import { listMessages } from '../../../../services/chat.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing conversation id' })
  }
  return listMessages(id)
})
