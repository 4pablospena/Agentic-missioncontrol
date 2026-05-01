import { loginWithApiSession, logoutSession } from '~/composables/auth-session.logic'
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
    return loginWithApiSession(session, apiClient, payload)
  }

  async function logout(): Promise<void> {
    return logoutSession(session)
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
