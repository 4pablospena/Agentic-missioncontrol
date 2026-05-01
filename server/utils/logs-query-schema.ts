import { z } from 'zod'

/** Shared Zod schema for `GET /api/logs` query validation + tests. */
export const logsQuerySchema = z.object({
  agentId: z.string().optional(),
  level: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  query: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sessionId: z.string().optional(),
  taskId: z.string().optional(),
  limit: z.coerce.number().min(1).max(500).optional(),
})
