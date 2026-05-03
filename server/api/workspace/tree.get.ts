import { listDirectory } from '../../services/workspace.server'
import { WorkspaceDisabledError, WorkspacePathError } from '../../utils/workspace-path'
import { workspacePathSchema } from '../../utils/workspace-schema'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const parsed = workspacePathSchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query',
      data: { issues: parsed.error.flatten() },
    })
  }

  try {
    return await listDirectory(parsed.data.path)
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
