import { z } from 'zod'

export const conversationsQuerySchema = z.object({
  agentId: z.string().optional(),
})
