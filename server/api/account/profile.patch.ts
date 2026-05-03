import type { AuthUser } from '~/models/user'
import { ACCOUNT_AVATAR_UPLOAD_PATH, isUploadedAvatarUrl } from '~/utils/account-avatar-path'
import { parseAuthUser } from '../../utils/auth-session-user'
import { accountProfilePatchSchema } from '../../utils/account-profile-schema'
import { deleteAvatarFile, resolveAvatarUploadRoot } from '../../utils/avatar-upload'

function normalizePatchAvatarUrl(raw: string | undefined): string | undefined {
  if (raw === undefined)
    return undefined
  const t = raw.trim()
  if (!t)
    return undefined
  if (t === ACCOUNT_AVATAR_UPLOAD_PATH || t.startsWith(`${ACCOUNT_AVATAR_UPLOAD_PATH}?`))
    return ACCOUNT_AVATAR_UPLOAD_PATH
  return t
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const raw = await readBody(event)
  const parsed = accountProfilePatchSchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid profile payload',
      data: { issues: parsed.error.flatten() },
    })
  }

  const current = parseAuthUser(session.user)
  if (!current) {
    throw createError({ statusCode: 500, statusMessage: 'Invalid session user' })
  }

  const nextAvatar
    = parsed.data.avatarUrl === undefined
      ? current.avatarUrl
      : normalizePatchAvatarUrl(parsed.data.avatarUrl)

  const wasUpload = isUploadedAvatarUrl(current.avatarUrl)
  const willBeUpload = isUploadedAvatarUrl(nextAvatar)
  if (wasUpload && !willBeUpload) {
    const root = resolveAvatarUploadRoot(event)
    await deleteAvatarFile(root, current.id)
  }

  const user: AuthUser = nextAvatar
    ? {
        id: current.id,
        email: current.email,
        name: parsed.data.name,
        role: current.role,
        avatarUrl: nextAvatar,
      }
    : {
        id: current.id,
        email: current.email,
        name: parsed.data.name,
        role: current.role,
      }

  await setUserSession(event, { user })

  return { user }
})
