import { z } from 'zod'

export const workspacePathSchema = z.object({
  path: z.string().optional(),
})

export const workspaceSearchSchema = z.object({
  q: z.string().min(1, 'Empty query').max(200, 'Query too long'),
  path: z.string().optional(),
  exts: z
    .string()
    .optional()
    .transform((v) => {
      if (!v)
        return undefined
      return v
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, 16)
    }),
})
