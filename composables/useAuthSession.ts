import { loginWithApiSession, logoutSession } from '~/composables/auth-session.logic'
import { createApiClient } from '~/services/api-client.service'
import {
  deleteUploadedAvatar as deleteUploadedAvatarRequest,
  updateOperatorProfile as patchOperatorProfile,
  uploadOperatorAvatar as uploadOperatorAvatarRequest,
} from '~/services/account.service'
import type {
  DeleteUploadedAvatarResponse,
  LoginPayload,
  LoginResponse,
  UpdateOperatorProfilePayload,
  UpdateOperatorProfileResponse,
  UploadAvatarResponse,
} from '~/models/auth'

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

  async function updateProfile(
    payload: UpdateOperatorProfilePayload,
  ): Promise<UpdateOperatorProfileResponse> {
    const res = await patchOperatorProfile(apiClient, payload)
    await session.fetch()
    return res
  }

  async function uploadAvatar(file: File): Promise<UploadAvatarResponse> {
    const res = await uploadOperatorAvatarRequest(apiClient, file)
    await session.fetch()
    return res
  }

  async function removeUploadedAvatar(): Promise<DeleteUploadedAvatarResponse> {
    const res = await deleteUploadedAvatarRequest(apiClient)
    await session.fetch()
    return res
  }

  return {
    ready: session.ready,
    loggedIn: session.loggedIn,
    user: session.user,
    session: session.session,
    fetch: session.fetch,
    login,
    logout,
    updateProfile,
    uploadAvatar,
    removeUploadedAvatar,
  }
}
