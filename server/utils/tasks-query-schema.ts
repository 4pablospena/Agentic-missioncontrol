import { z } from 'zod'

export const tasksQuerySchema = z.object({
  status: z.enum(['queued', 'running', 'completed', 'failed', 'cancelled', 'scheduled']).optional(),
  assignedAgentId: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
})
