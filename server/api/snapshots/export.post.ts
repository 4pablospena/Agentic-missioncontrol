import { exportSnapshotBodySchema } from '../../utils/snapshot-body-schema'
import { exportMemorySnapshot } from '../../services/memory-snapshot.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const raw = await readBody(event)
  const parsed = exportSnapshotBodySchema.safeParse(raw ?? {})
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid body',
      data: { issues: parsed.error.flatten() },
    })
  }
  return exportMemorySnapshot(parsed.data)
})
