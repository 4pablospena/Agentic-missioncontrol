import { z } from 'zod'
import { ACCOUNT_AVATAR_UPLOAD_PATH } from '~/utils/account-avatar-path'

const optionalAvatarUrl = z
  .string()
  .trim()
  .max(2048)
  .superRefine((val, ctx) => {
    if (val === '')
      return
    if (val === ACCOUNT_AVATAR_UPLOAD_PATH || val.startsWith(`${ACCOUNT_AVATAR_UPLOAD_PATH}?`))
      return
    try {
      const parsed = new URL(val)
      if (parsed.protocol !== 'https:') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Avatar URL must use HTTPS',
        })
      }
    }
    catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid avatar URL',
      })
    }
  })
  .optional()

export const accountProfilePatchSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  avatarUrl: optionalAvatarUrl,
})

export type AccountProfilePatchInput = z.infer<typeof accountProfilePatchSchema>
