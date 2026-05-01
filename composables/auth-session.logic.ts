import type { ApiClient } from '~/services/api-client.service'
import type { LoginPayload, LoginResponse } from '~/models/auth'

export interface AuthSessionLike {
  fetch: () => Promise<void>
  clear: () => Promise<void>
}

export async function loginWithApiSession(
  session: Pick<AuthSessionLike, 'fetch'>,
  apiClient: Pick<ApiClient, 'post'>,
  payload: LoginPayload,
): Promise<LoginResponse> {
  const res = await apiClient.post<LoginPayload, LoginResponse>(
    '/api/auth/login',
    payload,
  )
  await session.fetch()
  return res
}

export async function logoutSession(
  session: Pick<AuthSessionLike, 'clear'>,
): Promise<void> {
  await session.clear()
}
