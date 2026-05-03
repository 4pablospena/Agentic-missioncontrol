import type { AuthUser } from '~/models/user'
import { isUploadedAvatarUrl } from '~/utils/account-avatar-path'
import { parseAuthUser } from '../../utils/auth-session-user'
import { deleteAvatarFile, resolveAvatarUploadRoot } from '../../utils/avatar-upload'

export default defineEventHandler(async (event) => {
  assertMethod(event, 'DELETE')
  const session = await requireUserSession(event)
  const user = parseAuthUser(session.user)
  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'Invalid session user' })
  }

  const root = resolveAvatarUploadRoot(event)
  await deleteAvatarFile(root, user.id)

  let next: AuthUser = user
  if (isUploadedAvatarUrl(user.avatarUrl)) {
    next = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
    await setUserSession(event, { user: next })
  }

  return { user: next }
})
