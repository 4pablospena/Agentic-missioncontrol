import type { AuthUser } from '~/models/user'
import { ACCOUNT_AVATAR_UPLOAD_PATH } from '~/utils/account-avatar-path'

export { ACCOUNT_AVATAR_UPLOAD_PATH }

function normalizeAvatarUrl(raw: string): string | undefined {
  const t = raw.trim()
  if (!t)
    return undefined
  if (t === ACCOUNT_AVATAR_UPLOAD_PATH || t.startsWith(`${ACCOUNT_AVATAR_UPLOAD_PATH}?`))
    return ACCOUNT_AVATAR_UPLOAD_PATH
  try {
    const parsed = new URL(t)
    if (parsed.protocol === 'https:')
      return t
  }
  catch {
    /* ignore */
  }
  return undefined
}

/** Parses `session.user` after requireUserSession (handles optional avatarUrl). */
export function parseAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== 'object')
    return null
  const u = raw as Record<string, unknown>
  const id = typeof u.id === 'string' ? u.id : ''
  const email = typeof u.email === 'string' ? u.email : ''
  const name = typeof u.name === 'string' ? u.name : ''
  const role = u.role
  if (
    !id
    || !email
    || !name
    || (role !== 'admin' && role !== 'operator' && role !== 'viewer')
  ) {
    return null
  }
  const avatarRaw = u.avatarUrl
  const avatarUrl
    = typeof avatarRaw === 'string' ? normalizeAvatarUrl(avatarRaw) : undefined
  const base: AuthUser = { id, email, name, role }
  return avatarUrl ? { ...base, avatarUrl } : base
}
