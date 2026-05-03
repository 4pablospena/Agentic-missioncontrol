import { z } from 'zod'

/** Profile PATCH: display name only (avatar via POST/DELETE `/api/account/avatar`). */
export const accountProfilePatchSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  })
  .strict()

export type AccountProfilePatchInput = z.infer<typeof accountProfilePatchSchema>
