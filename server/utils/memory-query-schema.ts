import { z } from 'zod'

export const memorySourceSchema = z.enum(['chat', 'task', 'manual', 'system'])

export const memoryListQuerySchema = z.object({
  agentId: z.string().optional(),
  sessionId: z.string().optional(),
  source: memorySourceSchema.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
})

export type MemoryListQuery = z.infer<typeof memoryListQuerySchema>
