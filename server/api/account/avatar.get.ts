import { parseAuthUser } from '../../utils/auth-session-user'
import {
  createAvatarReadStream,
  readAvatarContentType,
  resolveAvatarUploadRoot,
  statAvatarFile,
} from '../../utils/avatar-upload'

export default defineEventHandler(async (event) => {
  assertMethod(event, 'GET')
  const session = await requireUserSession(event)
  const user = parseAuthUser(session.user)
  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'Invalid session user' })
  }

  const root = resolveAvatarUploadRoot(event)
  let st
  try {
    st = await statAvatarFile(root, user.id)
  }
  catch {
    throw createError({ statusCode: 404, statusMessage: 'No uploaded avatar' })
  }

  const contentType = await readAvatarContentType(root, user.id)
  if (!contentType) {
    throw createError({ statusCode: 500, statusMessage: 'Could not read avatar' })
  }

  setResponseHeaders(event, {
    'Content-Type': contentType,
    'Cache-Control': 'private, max-age=3600',
    ETag: `"${st.mtimeMs}"`,
  })

  return sendStream(event, createAvatarReadStream(root, user.id))
})
