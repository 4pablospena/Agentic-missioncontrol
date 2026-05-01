<script setup lang="ts">
import { computed, ref } from 'vue'
import { parseImportSnapshotPayload } from '~/utils/validateSnapshot'

definePageMeta({ layout: 'dashboard' })

const { events, connected } = useRealtimeEvents()
const { agents, refresh: refreshAgents } = useAgents({ events })

const {
  items,
  searchResults,
  filters,
  searchQuery,
  pending,
  searchPending,
  errorMsg,
  loadItems,
  runSemanticSearch,
  injectMemory,
  removeMemory,
} = useMemory({ events })

const snapshots = useMemorySnapshots({ events })

const exportBusy = ref(false)
const importBusy = ref(false)
const pageFlash = ref('')

const agentOptions = computed(() =>
  agents.value.map(a => ({ label: a.name, value: a.id })),
)

onMounted(async () => {
  await refreshAgents()
  await loadItems()
  await snapshots.refresh()
})

async function onDelete(id: string) {
  if (!confirm('Delete this memory item?'))
    return
  await removeMemory(id)
}

async function onInject(payload: { agentId: string, content: string, sessionId?: string }) {
  await injectMemory(payload)
}

async function onExport() {
  exportBusy.value = true
  pageFlash.value = ''
  try {
    await snapshots.exportSnapshot({
      agentId: filters.value.agentId,
      from: filters.value.from,
      to: filters.value.to,
    })
    pageFlash.value = 'Snapshot exported.'
  }
  catch {
    pageFlash.value = ''
  }
  finally {
    exportBusy.value = false
  }
}

async function onImportRaw(text: string) {
  importBusy.value = true
  pageFlash.value = ''
  try {
    let raw: unknown
    try {
      raw = JSON.parse(text) as unknown
    }
    catch {
      throw new Error('File is not valid JSON')
    }
    const payload = parseImportSnapshotPayload(raw)
    const r = await snapshots.importSnapshot(payload)
    pageFlash.value = `Imported ${r.imported} items.`
  }
  catch (e: unknown) {
    pageFlash.value = e instanceof Error ? e.message : 'Import failed'
  }
  finally {
    importBusy.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="memory">
    <template #header>
      <UDashboardNavbar title="Memory" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            label="Refresh"
            color="neutral"
            variant="ghost"
            size="sm"
            :loading="pending"
            data-testid="memory-refresh"
            @click="loadItems"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <UCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h1 class="text-highlighted font-semibold">
                Semantic memory
              </h1>
              <UBadge :color="connected ? 'success' : 'neutral'" variant="subtle">
                Realtime {{ connected ? 'connected' : 'disconnected' }}
              </UBadge>
            </div>
          </template>

          <UAlert
            v-if="errorMsg"
            color="error"
            variant="soft"
            title="Memory error"
            :description="errorMsg"
            class="mb-4"
          />

          <UAlert
            v-if="pageFlash"
            color="info"
            variant="soft"
            :title="pageFlash"
            class="mb-4"
          />

          <MemoryFilters v-model="filters" :agent-options="agentOptions" />

          <MemorySearchBox
            v-model:query="searchQuery"
            class="mt-6"
            :loading="searchPending"
            @search="runSemanticSearch"
          />

          <div class="mt-8 grid gap-6 xl:grid-cols-2">
            <div>
              <h2 class="text-muted mb-3 text-xs font-semibold uppercase tracking-wide">
                Semantic hits
              </h2>
              <div class="flex flex-col gap-3">
                <MemoryResultCard
                  v-for="r in searchResults"
                  :key="r.memory.id"
                  variant="search"
                  :item="r.memory"
                  :result="r"
                  @delete="onDelete"
                />
                <p v-if="!searchResults.length" class="text-muted text-sm">
                  Run a search to rank memories by cosine similarity (cap: server max scan).
                </p>
              </div>
            </div>
            <div>
              <h2 class="text-muted mb-3 text-xs font-semibold uppercase tracking-wide">
                Recent items
              </h2>
              <div class="flex flex-col gap-3">
                <MemoryResultCard
                  v-for="m in items"
                  :key="m.id"
                  variant="list"
                  :item="m"
                  @delete="onDelete"
                />
                <p v-if="!items.length" class="text-muted text-sm">
                  No rows yet — inject manual memory or enable chat → memory indexing.
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <div class="grid gap-6 lg:grid-cols-2">
          <MemoryInjectionForm
            :agent-id="filters.agentId ?? ''"
            @submit="onInject"
          />
          <SnapshotActions
            :export-pending="exportBusy || snapshots.pending"
            :import-pending="importBusy"
            @export="onExport"
            @import-raw="onImportRaw"
          />
        </div>

        <UCard>
          <template #header>
            <span class="text-highlighted font-semibold">Snapshot history</span>
          </template>
          <ul class="text-muted divide-default divide-y text-sm">
            <li v-for="s in snapshots.snapshots" :key="s.id" class="flex justify-between gap-2 py-2">
              <span class="font-mono text-xs">{{ s.id }}</span>
              <span>{{ s.itemCount }} items · {{ s.createdAt }}</span>
            </li>
            <li v-if="!snapshots.snapshots.length" class="py-2">
              No exports yet.
            </li>
          </ul>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
