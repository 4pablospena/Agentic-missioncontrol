import { readonly, ref } from 'vue'
import type { WorkspaceFile, WorkspaceListing } from '~/models/workspace'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import { createWorkspaceService, type WorkspaceService } from '~/services/workspace.service'

export interface UseWorkspaceOptions {
  workspaceService?: WorkspaceService
}

interface ErrorState {
  status: number
  message: string
}

export function useWorkspace(options: UseWorkspaceOptions = {}) {
  const { apiBase } = useMcConfig()
  const listings = ref<Map<string, WorkspaceListing>>(new Map())
  const expanded = ref<Set<string>>(new Set())
  const selectedPath = ref<string | null>(null)
  const file = ref<WorkspaceFile | null>(null)
  const treeError = ref<ErrorState | null>(null)
  const fileError = ref<ErrorState | null>(null)
  const treeLoading = ref(false)
  const fileLoading = ref(false)

  function resolveService(): WorkspaceService {
    if (options.workspaceService)
      return options.workspaceService
    const client = createApiClient(useRequestFetch(), apiBase.value)
    return createWorkspaceService(client)
  }

  function toErrorState(e: unknown): ErrorState {
    const err = e as { statusCode?: number, status?: number, statusMessage?: string, message?: string }
    return {
      status: err?.statusCode ?? err?.status ?? 0,
      message: err?.statusMessage ?? err?.message ?? 'Unknown error',
    }
  }

  async function loadDirectory(path: string = ''): Promise<WorkspaceListing | null> {
    treeLoading.value = true
    treeError.value = null
    try {
      const listing = await resolveService().getTree(path)
      const next = new Map(listings.value)
      next.set(path, listing)
      listings.value = next
      return listing
    }
    catch (e: unknown) {
      treeError.value = toErrorState(e)
      return null
    }
    finally {
      treeLoading.value = false
    }
  }

  async function toggleDirectory(path: string): Promise<void> {
    const next = new Set(expanded.value)
    if (next.has(path)) {
      next.delete(path)
      expanded.value = next
      return
    }
    next.add(path)
    expanded.value = next
    if (!listings.value.has(path))
      await loadDirectory(path)
  }

  async function openFile(path: string): Promise<void> {
    selectedPath.value = path
    fileLoading.value = true
    fileError.value = null
    try {
      file.value = await resolveService().getFile(path)
    }
    catch (e: unknown) {
      file.value = null
      fileError.value = toErrorState(e)
    }
    finally {
      fileLoading.value = false
    }
  }

  function clearFile(): void {
    selectedPath.value = null
    file.value = null
    fileError.value = null
  }

  return {
    listings: readonly(listings),
    expanded: readonly(expanded),
    selectedPath: readonly(selectedPath),
    file: readonly(file),
    treeError: readonly(treeError),
    fileError: readonly(fileError),
    treeLoading: readonly(treeLoading),
    fileLoading: readonly(fileLoading),
    loadDirectory,
    toggleDirectory,
    openFile,
    clearFile,
  }
}
