export type UserRole = 'admin' | 'operator' | 'viewer'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  /** HTTPS image URL stored in session; omit or clear for generated avatar. */
  avatarUrl?: string
}
