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

export interface UpdateOperatorProfilePayload {
  name: string
}

export interface UpdateOperatorProfileResponse {
  user: AuthUser
}

export interface UploadAvatarResponse {
  user: AuthUser
}

export interface DeleteUploadedAvatarResponse {
  user: AuthUser
}
