import { z } from 'zod'
import { createTaskBodySchema } from './tasks-body-schema'

export const scheduleCreateBodySchema = z.object({
  taskTemplate: createTaskBodySchema,
  cronExpression: z.string().min(1),
  enabled: z.boolean().optional().default(true),
})

export const schedulePatchBodySchema = z.object({
  taskTemplate: createTaskBodySchema.optional(),
  cronExpression: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
})
