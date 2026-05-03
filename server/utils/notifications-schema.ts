import { z } from 'zod'

/** Shared Zod schema for `GET /api/notifications` query validation. */
export const notificationsQuerySchema = z.object({
  status: z.enum(['unread', 'all']).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
})
