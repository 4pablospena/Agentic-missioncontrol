import { z } from 'zod'

export const exportSnapshotBodySchema = z.object({
  agentId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})
