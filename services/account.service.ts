import type { ApiClient } from '~/services/api-client.service'
import type {
  DeleteUploadedAvatarResponse,
  UpdateOperatorProfilePayload,
  UpdateOperatorProfileResponse,
  UploadAvatarResponse,
} from '~/models/auth'

export async function updateOperatorProfile(
  apiClient: Pick<ApiClient, 'patch'>,
  payload: UpdateOperatorProfilePayload,
): Promise<UpdateOperatorProfileResponse> {
  return apiClient.patch<
    UpdateOperatorProfilePayload,
    UpdateOperatorProfileResponse
  >('/api/account/profile', payload)
}

export async function uploadOperatorAvatar(
  apiClient: Pick<ApiClient, 'postFormData'>,
  file: File,
): Promise<UploadAvatarResponse> {
  const fd = new FormData()
  fd.append('file', file)
  return apiClient.postFormData<UploadAvatarResponse>('/api/account/avatar', fd)
}

export async function deleteUploadedAvatar(
  apiClient: Pick<ApiClient, 'delete'>,
): Promise<DeleteUploadedAvatarResponse> {
  return apiClient.delete<DeleteUploadedAvatarResponse>('/api/account/avatar')
}
