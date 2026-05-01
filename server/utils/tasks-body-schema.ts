import { z } from 'zod'

const priority = z.enum(['low', 'normal', 'high', 'critical'])

const jsonishInput = z.custom<Record<string, unknown>>(
  (v): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v),
)

export const createTaskBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority,
  assignedAgentId: z.string().optional(),
  input: jsonishInput.optional(),
})

export const patchTaskBodySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: priority.optional(),
  assignedAgentId: z.string().optional(),
})
