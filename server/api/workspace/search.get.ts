import { searchFiles } from '../../services/workspace.server'
import { withApiEnvelope } from '../../utils/api-envelope'
import { WorkspaceDisabledError, WorkspacePathError } from '../../utils/workspace-path'
import { workspaceSearchSchema } from '../../utils/workspace-schema'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const parsed = workspaceSearchSchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query',
      data: { issues: parsed.error.flatten() },
    })
  }

  try {
    const result = await searchFiles({
      query: parsed.data.q,
      path: parsed.data.path,
      exts: parsed.data.exts,
    })
    return withApiEnvelope('workspace', result)
  }
  catch (err: unknown) {
    if (err instanceof WorkspaceDisabledError) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Workspace disabled',
      })
    }
    if (err instanceof WorkspacePathError) {
      throw createError({
        statusCode: err.statusCode,
        statusMessage: err.message,
      })
    }
    throw err
  }
})
