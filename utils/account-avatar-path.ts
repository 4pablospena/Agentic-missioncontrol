/** Session value when the photo is served from `GET /api/account/avatar` (uploaded file). */
export const ACCOUNT_AVATAR_UPLOAD_PATH = '/api/account/avatar' as const

export function isUploadedAvatarUrl(url: string | undefined | null): boolean {
  const t = url?.trim()
  return t === ACCOUNT_AVATAR_UPLOAD_PATH || t?.startsWith(`${ACCOUNT_AVATAR_UPLOAD_PATH}?`) === true
}
