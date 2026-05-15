<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { public: publicConfig } = useRuntimeConfig()
const enabled = computed(() => publicConfig.workspaceEnabled === true)

const {
  listings,
  expanded,
  selectedPath,
  file,
  treeError,
  fileError,
  treeLoading,
  fileLoading,
  loadDirectory,
  toggleDirectory,
  openFile,
} = useWorkspace()

const search = useWorkspaceSearch()

const highlightLine = ref<number | null>(null)

onMounted(async () => {
  if (enabled.value)
    await loadDirectory('')
})

const treeErrorStatus = computed(() => treeError.value?.status ?? 0)
const treeErrorMessage = computed(() => treeError.value?.message ?? '')
const fileErrorStatus = computed(() => fileError.value?.status ?? 0)
const fileErrorMessage = computed(() => fileError.value?.message ?? '')
const searchErrorMessage = computed(() => search.errorMsg.value?.message ?? null)

async function onOpenHit(payload: { path: string, line: number }) {
  highlightLine.value = payload.line
  await openFile(payload.path)
}

async function onOpenFile(path: string) {
  highlightLine.value = null
  await openFile(path)
}

function onSearchInput(q: string) {
  search.setQuery(q)
}
</script>

<template>
  <DashboardPageShell
    title="Workspace"
    subtitle="Explorador de solo lectura del directorio configurado"
    icon="i-lucide-folder-tree"
    accent-color="green"
    :scroll-body="false"
    body-class="workspace-page-body"
  >
    <template #actions>
      <RetroButton
        v-if="enabled"
        color="green"
        variant="outline"
        size="sm"
        icon="i-lucide-rotate-ccw"
        :loading="treeLoading"
        type="button"
        @click="loadDirectory('')"
      >
        <span class="hidden sm:inline">Actualizar</span>
      </RetroButton>
    </template>

      <CommonEmptyState
        v-if="!enabled"
        title="Workspace desactivado"
        description="Define NUXT_WORKSPACE_ROOT con una ruta absoluta para habilitar el explorador de archivos y la búsqueda global."
        icon="i-lucide-folder-lock"
        tone="warning"
      />

      <div v-else class="flex h-full min-h-0 flex-col gap-4">
        <section class="page-toolbar pb-2">
          <p class="text-muted text-sm leading-snug">
            Explorador de solo lectura de la raíz configurada. La búsqueda recorre en el cliente los archivos de texto permitidos.
          </p>
        </section>

        <section class="panel-shell rounded-xl p-4">
          <WorkspaceSearchBar
            :query="search.query.value"
            :scope-path="search.scopePath.value"
            :result="search.result.value"
            :loading="search.loading.value"
            :error-message="searchErrorMessage"
            @update:query="onSearchInput"
            @open-hit="onOpenHit"
            @clear="search.clear()"
          />
        </section>

        <section class="panel-shell flex min-h-0 flex-1 flex-col rounded-xl md:flex-row">
          <div class="md:border-default flex min-h-48 md:w-72 md:shrink-0 md:border-r md:min-h-0">
            <WorkspaceTree
              :listings="listings"
              :expanded="expanded"
              :selected-path="selectedPath"
              :loading="treeLoading"
              :error-status="treeErrorStatus"
              :error-message="treeErrorMessage"
              class="flex-1"
              @toggle="toggleDirectory"
              @open-file="onOpenFile"
              @reload-root="loadDirectory('')"
            />
          </div>

          <div class="flex min-h-64 min-w-0 flex-1 md:min-h-0">
            <WorkspaceFileViewer
              :file="file"
              :loading="fileLoading"
              :error-status="fileErrorStatus"
              :error-message="fileErrorMessage"
              :selected-path="selectedPath"
              :highlight-line="highlightLine"
              class="flex-1"
            />
          </div>
        </section>
      </div>
  </DashboardPageShell>
</template>

<style scoped>
:deep(.workspace-page-body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
