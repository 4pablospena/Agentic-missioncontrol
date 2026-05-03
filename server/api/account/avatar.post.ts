import type { AuthUser } from '~/models/user'
import { ACCOUNT_AVATAR_UPLOAD_PATH } from '~/utils/account-avatar-path'
import { parseAuthUser } from '../../utils/auth-session-user'
import {
  AVATAR_MAX_BYTES,
  resolveAvatarUploadRoot,
  saveAvatarFile,
  sniffImageContentType,
} from '../../utils/avatar-upload'

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST')
  const session = await requireUserSession(event)
  const user = parseAuthUser(session.user)
  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'Invalid session user' })
  }

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(p => p.name === 'file' && p.data && p.data.length > 0)
  if (!filePart?.data?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Missing image file (field name: file)' })
  }

  if (filePart.data.length > AVATAR_MAX_BYTES) {
    throw createError({
      statusCode: 413,
      statusMessage: `Image too large (max ${AVATAR_MAX_BYTES} bytes)`,
    })
  }

  const sniffed = sniffImageContentType(filePart.data)
  if (!sniffed) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported image type (use JPEG, PNG, or WebP)',
    })
  }

  const root = resolveAvatarUploadRoot(event)
  await saveAvatarFile(root, user.id, filePart.data)

  const next: AuthUser = { ...user, avatarUrl: ACCOUNT_AVATAR_UPLOAD_PATH }
  await setUserSession(event, { user: next })

  return { user: next }
})
