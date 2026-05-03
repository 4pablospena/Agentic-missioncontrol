/**
 * Avatar shown in the shell: uploaded route, HTTPS URL from profile, or deterministic fallback from email.
 */
export function userAvatarSrc(
  email: string,
  avatarUrl?: string | null,
  apiBase = '',
): string {
  const custom = avatarUrl?.trim()
  if (custom) {
    if (custom.startsWith('/') && apiBase.trim()) {
      const base = apiBase.replace(/\/$/, '')
      return `${base}${custom}`
    }
    return custom
  }
  return `https://avatar.vercel.sh/${encodeURIComponent(email || 'operator')}`
}
