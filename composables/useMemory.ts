import type { Ref } from 'vue'
import { readonly, ref, watch } from 'vue'
import type { InjectMemoryPayload, MemoryItem, MemoryListFilters, SemanticSearchResult } from '~/models/memory'
import type { MissionControlEvent } from '~/models/realtime'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import { createMemoryService, type MemoryService } from '~/services/memory.service'

export interface UseMemoryOptions {
  memoryService?: MemoryService
  events?: Ref<MissionControlEvent[]>
}

function isMemoryRealtimeType(type: string): boolean {
  return type.startsWith('memory.')
}

export function useMemory(options: UseMemoryOptions = {}) {
  const { apiBase } = useMcConfig()
  const items = ref<MemoryItem[]>([])
  const searchResults = ref<SemanticSearchResult[]>([])
  const filters = ref<MemoryListFilters & { limit?: number }>({ limit: 100 })
  const searchQuery = ref('')
  const pending = ref(false)
  const searchPending = ref(false)
  const errorMsg = ref('')

  function resolveService(): MemoryService {
    if (options.memoryService)
      return options.memoryService
    return createMemoryService(createApiClient(useRequestFetch(), apiBase.value))
  }

  async function loadItems() {
    pending.value = true
    errorMsg.value = ''
    try {
      items.value = await resolveService().list({ ...filters.value })
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
    }
    finally {
      pending.value = false
    }
  }

  async function runSemanticSearch() {
    const q = searchQuery.value.trim()
    if (!q) {
      searchResults.value = []
      return
    }
    searchPending.value = true
    errorMsg.value = ''
    try {
      searchResults.value = await resolveService().search({
        query: q,
        agentId: filters.value.agentId,
        sessionId: filters.value.sessionId,
        source: filters.value.source,
        from: filters.value.from,
        to: filters.value.to,
        limit: 10,
      })
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
    }
    finally {
      searchPending.value = false
    }
  }

  async function injectMemory(payload: InjectMemoryPayload) {
    errorMsg.value = ''
    try {
      await resolveService().inject(payload)
      await loadItems()
      await runSemanticSearch()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  async function removeMemory(memoryId: string) {
    errorMsg.value = ''
    try {
      await resolveService().remove(memoryId)
      await loadItems()
      searchResults.value = searchResults.value.filter(r => r.memory.id !== memoryId)
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  function setFilters(patch: Partial<MemoryListFilters & { limit?: number }>) {
    filters.value = { ...filters.value, ...patch }
    void loadItems()
  }

  const eventsSource = options.events ?? useRealtimeEvents().events
  watch(
    eventsSource,
    (list) => {
      const last = list[list.length - 1]
      if (last && isMemoryRealtimeType(last.type)) {
        void loadItems()
        void runSemanticSearch()
      }
    },
    { deep: true },
  )

  return {
    items: readonly(items),
    searchResults: readonly(searchResults),
    filters,
    searchQuery,
    pending: readonly(pending),
    searchPending: readonly(searchPending),
    errorMsg: readonly(errorMsg),
    loadItems,
    runSemanticSearch,
    injectMemory,
    removeMemory,
    setFilters,
  }
}
