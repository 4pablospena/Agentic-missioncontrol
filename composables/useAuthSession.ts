import { createApiClient } from '~/services/api-client.service'
import type { LoginPayload, LoginResponse } from '~/models/auth'

export function useAuthSession() {
  const session = useUserSession()
  const config = useRuntimeConfig()

  const apiClient = createApiClient(
    useRequestFetch(),
    String(config.public.apiBase ?? ''),
  )

  async function login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await apiClient.post<LoginPayload, LoginResponse>(
      '/api/auth/login',
      payload,
    )
    await session.fetch()
    return res
  }

  async function logout(): Promise<void> {
    await session.clear()
  }

  return {
    ready: session.ready,
    loggedIn: session.loggedIn,
    user: session.user,
    session: session.session,
    fetch: session.fetch,
    login,
    logout,
  }
}
