import { z } from 'zod'
import { memorySourceSchema } from './memory-query-schema'

export const semanticSearchBodySchema = z.object({
  query: z.string().min(1),
  agentId: z.string().optional(),
  sessionId: z.string().optional(),
  source: memorySourceSchema.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const injectMemoryBodySchema = z.object({
  agentId: z.string().min(1),
  sessionId: z.string().optional(),
  content: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
})
