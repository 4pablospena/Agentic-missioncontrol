import { importMemorySnapshotRaw } from '../../services/memory-snapshot.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const raw = await readBody(event)
  try {
    return await importMemorySnapshotRaw(raw)
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Import failed'
    throw createError({
      statusCode: 400,
      statusMessage: msg,
    })
  }
})
