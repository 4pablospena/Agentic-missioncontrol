import { z } from 'zod'
import type { MemoryItem } from '~/models/memory'
import type { ImportMemorySnapshotPayload } from '~/models/snapshot'
import { MEMORY_SNAPSHOT_VERSION } from '~/models/snapshot'

const memorySourceZ = z.enum(['chat', 'task', 'manual', 'system'])

const snapshotItemSchema = z.object({
  id: z.string().optional(),
  agentId: z.string().min(1),
  sessionId: z.string().optional(),
  content: z.string().min(1),
  source: memorySourceZ,
  embeddingModel: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().optional(),
})

export const importMemorySnapshotPayloadSchema = z.object({
  snapshotVersion: z.string().min(1),
  items: z.array(snapshotItemSchema).min(1).max(10_000),
})

export function isSnapshotVersionCompatible(version: string): boolean {
  const major = version.trim().split('.')[0]
  const expectedMajor = MEMORY_SNAPSHOT_VERSION.split('.')[0]
  return major === expectedMajor
}

export function parseImportSnapshotPayload(raw: unknown): ImportMemorySnapshotPayload {
  const parsed = importMemorySnapshotPayloadSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(`Invalid snapshot payload: ${parsed.error.message}`)
  }
  if (!isSnapshotVersionCompatible(parsed.data.snapshotVersion)) {
    throw new Error(
      `Unsupported snapshot version (expected major ${MEMORY_SNAPSHOT_VERSION.split('.')[0]}.x)`,
    )
  }

  const items: MemoryItem[] = parsed.data.items.map((it, idx) => ({
    id: it.id ?? `import-${idx}-${it.agentId}`,
    agentId: it.agentId,
    sessionId: it.sessionId,
    content: it.content,
    source: it.source,
    embeddingModel: it.embeddingModel,
    metadata: {
      ...it.metadata,
      ...(it.createdAt ? { _importedCreatedAt: it.createdAt } : {}),
    },
    createdAt: it.createdAt ?? new Date().toISOString(),
  }))

  return {
    snapshotVersion: parsed.data.snapshotVersion,
    items,
  }
}
