import { readonly, ref } from 'vue'
import type { WorkspaceSearchResult } from '~/models/workspace'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import { createWorkspaceService, type WorkspaceService } from '~/services/workspace.service'

export interface UseWorkspaceSearchOptions {
  workspaceService?: WorkspaceService
  /** Debounce delay (ms) between query keystrokes. */
  debounceMs?: number
}

interface ErrorState {
  status: number
  message: string
}

export function useWorkspaceSearch(options: UseWorkspaceSearchOptions = {}) {
  const { apiBase } = useMcConfig()
  const debounceMs = options.debounceMs ?? 300

  const query = ref('')
  const scopePath = ref('')
  const result = ref<WorkspaceSearchResult | null>(null)
  const loading = ref(false)
  const errorMsg = ref<ErrorState | null>(null)

  let activeController: AbortController | null = null
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function resolveService(): WorkspaceService {
    if (options.workspaceService)
      return options.workspaceService
    const client = createApiClient(useRequestFetch(), apiBase.value)
    return createWorkspaceService(client)
  }

  function cancelInflight() {
    if (activeController) {
      activeController.abort()
      activeController = null
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  async function runSearch() {
    const q = query.value.trim()
    if (!q) {
      result.value = null
      errorMsg.value = null
      loading.value = false
      return
    }

    cancelInflight()
    const controller = new AbortController()
    activeController = controller
    loading.value = true
    errorMsg.value = null

    try {
      const data = await resolveService().search({
        query: q,
        path: scopePath.value || undefined,
        signal: controller.signal,
      })
      if (controller.signal.aborted)
        return
      result.value = data
    }
    catch (e: unknown) {
      if (controller.signal.aborted)
        return
      const err = e as { statusCode?: number, status?: number, statusMessage?: string, message?: string }
      errorMsg.value = {
        status: err?.statusCode ?? err?.status ?? 0,
        message: err?.statusMessage ?? err?.message ?? 'Unknown error',
      }
      result.value = null
    }
    finally {
      if (activeController === controller) {
        loading.value = false
        activeController = null
      }
    }
  }

  function setQuery(next: string) {
    query.value = next
    if (debounceTimer)
      clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      void runSearch()
    }, debounceMs)
  }

  function setScope(path: string) {
    scopePath.value = path
    if (query.value.trim())
      void runSearch()
  }

  function clear() {
    cancelInflight()
    query.value = ''
    result.value = null
    errorMsg.value = null
    loading.value = false
  }

  return {
    query,
    scopePath,
    result: readonly(result),
    loading: readonly(loading),
    errorMsg: readonly(errorMsg),
    setQuery,
    setScope,
    runSearch,
    clear,
  }
}
