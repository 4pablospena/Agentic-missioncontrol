import type {
  ExportMemorySnapshotPayload,
  ImportMemorySnapshotPayload,
  MemorySnapshot,
  MemorySnapshotBlob,
} from '~/models/snapshot'
import type { ApiClient } from '~/services/api-client.service'

export interface SnapshotService {
  list(): Promise<MemorySnapshot[]>
  exportSnapshot(payload: ExportMemorySnapshotPayload): Promise<{ snapshot: MemorySnapshot, blob: MemorySnapshotBlob }>
  importSnapshot(payload: ImportMemorySnapshotPayload): Promise<{ imported: number }>
  get(snapshotId: string): Promise<{ snapshot: MemorySnapshot, blob: MemorySnapshotBlob }>
}

export function createSnapshotService(client: ApiClient): SnapshotService {
  return {
    list() {
      return client.get<MemorySnapshot[]>('/api/snapshots')
    },
    exportSnapshot(payload: ExportMemorySnapshotPayload) {
      return client.post<
        ExportMemorySnapshotPayload,
        { snapshot: MemorySnapshot, blob: MemorySnapshotBlob }
      >('/api/snapshots/export', payload)
    },
    importSnapshot(payload: ImportMemorySnapshotPayload) {
      return client.post<ImportMemorySnapshotPayload, { imported: number }>(
        '/api/snapshots/import',
        payload,
      )
    },
    get(snapshotId: string) {
      return client.get<{ snapshot: MemorySnapshot, blob: MemorySnapshotBlob }>(
        `/api/snapshots/${encodeURIComponent(snapshotId)}`,
      )
    },
  }
}
