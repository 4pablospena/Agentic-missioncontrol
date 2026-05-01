import { randomUUID } from 'node:crypto'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import type { ExportMemorySnapshotPayload, MemorySnapshot, MemorySnapshotBlob } from '~/models/snapshot'
import { MEMORY_SNAPSHOT_VERSION } from '~/models/snapshot'
import type { MissionControlEvent } from '~/models/realtime'
import { parseImportSnapshotPayload } from '~/utils/validateSnapshot'
import { getDb } from '../db/client'
import { memoryItems, memorySnapshots } from '../db/schema'
import { broadcastMissionControlEvent } from '../utils/realtime-broadcast'
import { createLogEntry } from './logger.server'
import { importMemoryItemsFromSnapshot, mapMemoryRow } from './memory.server'

function nowIso(): string {
  return new Date().toISOString()
}

function broadcastEvt(partial: Omit<MissionControlEvent, 'id' | 'createdAt'> & { id?: string }) {
  const full: MissionControlEvent = {
    id: partial.id ?? randomUUID(),
    type: partial.type,
    payload: partial.payload,
    createdAt: partial.createdAt ?? nowIso(),
  }
  broadcastMissionControlEvent(full)
}

function mapSnapshotRow(row: typeof memorySnapshots.$inferSelect): MemorySnapshot {
  return {
    id: row.id,
    version: row.version,
    agentId: row.agentId ?? undefined,
    itemCount: row.itemCount,
    createdAt: row.createdAt,
    blobSizeBytes: Buffer.byteLength(row.blobJson, 'utf8'),
  }
}

export function listMemorySnapshots(): MemorySnapshot[] {
  const db = getDb()
  const rows = db.select().from(memorySnapshots).orderBy(desc(memorySnapshots.createdAt)).all()
  return rows.map(mapSnapshotRow)
}

export function getMemorySnapshotRecord(id: string): { snapshot: MemorySnapshot, blob: MemorySnapshotBlob } | null {
  const db = getDb()
  const row = db.select().from(memorySnapshots).where(eq(memorySnapshots.id, id)).get()
  if (!row)
    return null
  try {
    const blob = JSON.parse(row.blobJson) as MemorySnapshotBlob
    return { snapshot: mapSnapshotRow(row), blob }
  }
  catch {
    return null
  }
}

export async function exportMemorySnapshot(
  payload: ExportMemorySnapshotPayload,
): Promise<{ snapshot: MemorySnapshot, blob: MemorySnapshotBlob }> {
  const db = getDb()
  const conditions = []
  if (payload.agentId?.trim())
    conditions.push(eq(memoryItems.agentId, payload.agentId.trim()))
  if (payload.from?.trim())
    conditions.push(gte(memoryItems.createdAt, payload.from.trim()))
  if (payload.to?.trim())
    conditions.push(lte(memoryItems.createdAt, payload.to.trim()))

  const base = db.select().from(memoryItems)
  const qb = conditions.length > 0 ? base.where(and(...conditions)) : base
  const rows = qb.orderBy(desc(memoryItems.createdAt)).limit(10_000).all()
  const items = rows.map(mapMemoryRow)

  const blob: MemorySnapshotBlob = {
    snapshotVersion: MEMORY_SNAPSHOT_VERSION,
    exportedAt: nowIso(),
    agentId: payload.agentId?.trim(),
    items,
  }

  const id = randomUUID()
  const ts = nowIso()

  db.insert(memorySnapshots).values({
    id,
    version: MEMORY_SNAPSHOT_VERSION,
    agentId: payload.agentId?.trim() ?? null,
    itemCount: items.length,
    blobJson: JSON.stringify(blob),
    createdAt: ts,
  }).run()

  await createLogEntry({
    agentId: payload.agentId?.trim(),
    level: 'info',
    message: 'memory.snapshot.exported',
    metadata: { snapshotId: id, itemCount: items.length },
  })

  broadcastEvt({
    type: 'memory.snapshot.exported',
    payload: { snapshotId: id, itemCount: items.length, agentId: payload.agentId },
  })

  return {
    snapshot: {
      id,
      version: MEMORY_SNAPSHOT_VERSION,
      agentId: payload.agentId?.trim(),
      itemCount: items.length,
      createdAt: ts,
    },
    blob,
  }
}

export async function importMemorySnapshotRaw(raw: unknown): Promise<{ imported: number }> {
  const parsed = parseImportSnapshotPayload(raw)
  const n = await importMemoryItemsFromSnapshot(parsed.items)

  await createLogEntry({
    level: 'info',
    message: 'memory.snapshot.imported',
    metadata: { imported: n, snapshotVersion: parsed.snapshotVersion },
  })

  broadcastEvt({
    type: 'memory.snapshot.imported',
    payload: { imported: n, snapshotVersion: parsed.snapshotVersion },
  })

  return { imported: n }
}
