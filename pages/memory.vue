<script setup lang="ts">
import { computed, ref, unref } from 'vue'
import { parseImportSnapshotPayload } from '~/utils/validateSnapshot'
import { formatIso } from '~/utils/formatDate'
import { formatBytes } from '~/utils/formatBytes'

definePageMeta({ layout: 'dashboard' })

const toast = useToast()

const { events } = useRealtimeEvents()
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
const snapshotsPending = computed(() => unref(snapshots.pending))

const memoryTab = ref<'explore' | 'inject' | 'snapshots'>('explore')
const tabItems = [
  { label: 'Explore', value: 'explore', slot: 'explore', icon: 'i-lucide-search' },
  { label: 'Inject', value: 'inject', slot: 'inject', icon: 'i-lucide-upload' },
  { label: 'Snapshots', value: 'snapshots', slot: 'snapshots', icon: 'i-lucide-camera' },
]

const exportBusy = ref(false)
const importBusy = ref(false)

const deleteModalOpen = ref(false)
const pendingDeleteId = ref<string | null>(null)

const agentOptions = computed(() =>
  agents.value.map(a => ({ label: a.name, value: a.id })),
)

onMounted(async () => {
  await refreshAgents()
  await loadItems()
  await snapshots.refresh()
})

async function onRefreshMemory() {
  await refreshAgents()
  await loadItems()
  await snapshots.refresh()
}

function requestDelete(id: string) {
  pendingDeleteId.value = id
  deleteModalOpen.value = true
}

async function confirmDelete(close: () => void) {
  const id = pendingDeleteId.value
  if (!id)
    return
  try {
    await removeMemory(id)
    toast.add({ title: 'Memory deleted', color: 'success' })
    pendingDeleteId.value = null
    deleteModalOpen.value = false
    close()
  }
  catch {
    toast.add({ title: 'Delete failed', color: 'error' })
  }
}

function cancelDelete(close: () => void) {
  pendingDeleteId.value = null
  deleteModalOpen.value = false
  close()
}

async function onInject(payload: { agentId: string, content: string, sessionId?: string }) {
  try {
    await injectMemory(payload)
    toast.add({ title: 'Memory injected', color: 'success' })
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Inject failed'
    toast.add({ title: 'Inject failed', description: msg, color: 'error' })
  }
}

async function onExport() {
  exportBusy.value = true
  try {
    await snapshots.exportSnapshot({
      agentId: filters.value.agentId,
      from: filters.value.from,
      to: filters.value.to,
    })
    toast.add({ title: 'Snapshot exported', color: 'success' })
  }
  catch {
    toast.add({
      title: 'Export failed',
      description: unref(snapshots.errorMsg) || undefined,
      color: 'error',
    })
  }
  finally {
    exportBusy.value = false
  }
}

async function onImportRaw(text: string) {
  importBusy.value = true
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
    toast.add({ title: `Imported ${r.imported} items`, color: 'success' })
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Import failed'
    toast.add({ title: 'Import failed', description: msg, color: 'error' })
  }
  finally {
    importBusy.value = false
  }
}

function truncateId(id: string) {
  return id.length > 12 ? `${id.slice(0, 10)}…` : id
}

async function copySnapshotId(id: string) {
  try {
    await navigator.clipboard.writeText(id)
    toast.add({ title: 'Snapshot id copied', color: 'success' })
  }
  catch {
    toast.add({ title: 'Could not copy', color: 'error' })
  }
}

async function downloadSnapshotJson(id: string) {
  try {
    const { blob } = await snapshots.fetchSnapshot(id)
    const json = JSON.stringify(blob, null, 2)
    const file = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = `memory-snapshot-${id.slice(0, 8)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.add({ title: 'Snapshot downloaded', color: 'success' })
  }
  catch {
    toast.add({ title: 'Download failed', color: 'error' })
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
            :loading="pending || snapshotsPending"
            data-testid="memory-refresh"
            @click="onRefreshMemory"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <section class="page-toolbar flex flex-wrap items-center justify-between gap-3 pb-2">
          <p class="text-muted text-sm leading-snug">
            Search, inject and snapshot the semantic memory store.
          </p>
          <UTooltip text="Searches use cosine similarity. Snapshots export the current filters as JSON.">
            <UButton
              icon="i-lucide-info"
              color="neutral"
              variant="ghost"
              size="xs"
              square
              aria-label="How memory works"
            />
          </UTooltip>
        </section>

        <UCard class="panel-shell" :ui="{ root: 'shadow-none ring-0' }">
          <UAlert
            v-if="errorMsg"
            color="error"
            variant="soft"
            title="Memory error"
            :description="errorMsg"
            class="mb-4"
          />

          <UTabs v-model="memoryTab" :items="tabItems" class="w-full">
            <template #explore>
              <div class="flex flex-col gap-6 pt-4">
                <MemoryFilters v-model="filters" :agent-options="agentOptions" />

                <MemorySearchBox
                  v-model:query="searchQuery"
                  :loading="searchPending"
                  data-testid="memory-search-box"
                  @search="runSemanticSearch"
                />

                <div class="grid gap-6 xl:grid-cols-2">
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
                        @delete="requestDelete"
                      />
                      <CommonEmptyState
                        v-if="!searchResults.length"
                        title="No semantic hits yet."
                        description="Run a search to rank memories by cosine similarity (cap: server max scan)."
                        icon="i-lucide-sparkles"
                        :cta="{ label: 'Run semantic search', icon: 'i-lucide-search', onClick: runSemanticSearch }"
                      />
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
                        @delete="requestDelete"
                      />
                      <CommonEmptyState
                        v-if="!items.length"
                        title="No memory rows yet."
                        description="Inject manual memory or enable chat → memory indexing."
                        icon="i-lucide-inbox"
                        :cta="{ label: 'Go to Inject', icon: 'i-lucide-upload', onClick: () => { memoryTab = 'inject' } }"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template #inject>
              <div class="pt-4">
                <MemoryInjectionForm
                  :agent-id="filters.agentId ?? ''"
                  @submit="onInject"
                />
              </div>
            </template>

            <template #snapshots>
              <div class="flex flex-col gap-6 pt-4">
                <MemorySnapshotActions
                  :export-pending="exportBusy || snapshotsPending"
                  :import-pending="importBusy"
                  @export="onExport"
                  @import-raw="onImportRaw"
                />

                <UCard>
                  <template #header>
                    <span class="text-highlighted font-semibold">Snapshot history</span>
                  </template>
                  <ul class="divide-default divide-y">
                    <li
                      v-for="s in snapshots.snapshots"
                      :key="s.id"
                      class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div class="min-w-0 flex-1 space-y-1">
                        <UTooltip :text="s.id">
                          <span class="text-highlighted font-mono text-sm">{{ truncateId(s.id) }}</span>
                        </UTooltip>
                        <div class="text-muted flex flex-wrap gap-x-3 gap-y-1 text-xs">
                          <span>{{ formatIso(s.createdAt) }}</span>
                          <span>{{ s.itemCount }} items</span>
                          <span v-if="s.blobSizeBytes != null">{{ formatBytes(s.blobSizeBytes) }}</span>
                        </div>
                      </div>
                      <div class="flex shrink-0 flex-wrap gap-2">
                        <UButton
                          icon="i-lucide-copy"
                          label="Copy id"
                          color="neutral"
                          variant="ghost"
                          size="xs"
                          @click="copySnapshotId(s.id)"
                        />
                        <UButton
                          icon="i-lucide-download"
                          label="Download JSON"
                          color="neutral"
                          variant="soft"
                          size="xs"
                          @click="downloadSnapshotJson(s.id)"
                        />
                      </div>
                    </li>
                    <li v-if="!snapshots.snapshots.length" class="py-8">
                      <CommonEmptyState
                        title="No exports yet."
                        description="Export from current filters on this tab."
                        icon="i-lucide-camera-off"
                        variant="compact"
                      />
                    </li>
                  </ul>
                </UCard>
              </div>
            </template>
          </UTabs>
        </UCard>

        <UModal
          v-model:open="deleteModalOpen"
          title="Delete memory?"
          description="This removes the row from the index. This cannot be undone."
          aria-label="Delete memory confirmation"
        >
          <template #footer="{ close }">
            <div class="flex w-full justify-end gap-2">
              <UButton label="Cancel" color="neutral" variant="ghost" @click="cancelDelete(close)" />
              <UButton label="Delete" color="error" @click="confirmDelete(close)" />
            </div>
          </template>
        </UModal>
      </div>
    </template>
  </UDashboardPanel>
</template>
