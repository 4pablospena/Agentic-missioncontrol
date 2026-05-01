import { z } from 'zod'

export const createLogBodySchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']),
  message: z.string().min(1),
  agentId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type CreateLogBody = z.infer<typeof createLogBodySchema>

export function parseCreateLogBody(input: unknown):
  | { ok: true, data: CreateLogBody }
  | { ok: false, issues: z.ZodIssue[] } {
  const result = createLogBodySchema.safeParse(input)
  if (!result.success)
    return { ok: false, issues: result.error.issues }
  return { ok: true, data: result.data }
}
