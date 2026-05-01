import type { MemoryItem } from './memory'

export const MEMORY_SNAPSHOT_VERSION = '1.0.0' as const

export interface MemorySnapshot {
  id: string
  version: string
  agentId?: string
  itemCount: number
  createdAt: string
}

export interface ExportMemorySnapshotPayload {
  agentId?: string
  from?: string
  to?: string
}

export interface ImportMemorySnapshotPayload {
  snapshotVersion: string
  items: MemoryItem[]
}

export interface MemorySnapshotBlob {
  snapshotVersion: string
  exportedAt: string
  agentId?: string
  items: MemoryItem[]
}
