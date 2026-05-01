import type { AuthUser } from '~/models/user'

export type { AuthUser }

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  ok: true
  user: AuthUser
}
