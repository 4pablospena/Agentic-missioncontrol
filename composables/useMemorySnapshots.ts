import type { Ref } from 'vue'
import { readonly, ref, watch } from 'vue'
import type { MissionControlEvent } from '~/models/realtime'
import type { ExportMemorySnapshotPayload, ImportMemorySnapshotPayload, MemorySnapshot } from '~/models/snapshot'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import { createSnapshotService, type SnapshotService } from '~/services/snapshot.service'

export interface UseMemorySnapshotsOptions {
  snapshotService?: SnapshotService
  events?: Ref<MissionControlEvent[]>
}

function isSnapshotRealtimeType(type: string): boolean {
  return type.startsWith('memory.snapshot.')
}

export function useMemorySnapshots(options: UseMemorySnapshotsOptions = {}) {
  const { apiBase } = useMcConfig()
  const snapshots = ref<MemorySnapshot[]>([])
  const pending = ref(false)
  const errorMsg = ref('')

  function resolveService(): SnapshotService {
    if (options.snapshotService)
      return options.snapshotService
    return createSnapshotService(createApiClient(useRequestFetch(), apiBase.value))
  }

  async function refresh() {
    pending.value = true
    errorMsg.value = ''
    try {
      snapshots.value = await resolveService().list()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
    }
    finally {
      pending.value = false
    }
  }

  async function exportSnapshot(payload: ExportMemorySnapshotPayload) {
    errorMsg.value = ''
    try {
      const out = await resolveService().exportSnapshot(payload)
      await refresh()
      return out
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  async function importSnapshot(payload: ImportMemorySnapshotPayload) {
    errorMsg.value = ''
    try {
      const out = await resolveService().importSnapshot(payload)
      await refresh()
      return out
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  const eventsSource = options.events ?? useRealtimeEvents().events
  watch(
    eventsSource,
    (list) => {
      const last = list[list.length - 1]
      if (last && isSnapshotRealtimeType(last.type))
        void refresh()
    },
    { deep: true },
  )

  return {
    snapshots: readonly(snapshots),
    pending: readonly(pending),
    errorMsg: readonly(errorMsg),
    refresh,
    exportSnapshot,
    importSnapshot,
  }
}
