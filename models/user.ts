export type UserRole = 'admin' | 'operator' | 'viewer'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}
