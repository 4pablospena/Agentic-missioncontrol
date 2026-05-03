import type {
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResult,
} from '~/models/workspace'
import type { ApiClient } from '~/services/api-client.service'

export interface SearchWorkspaceParams {
  query: string
  path?: string
  exts?: string[]
  signal?: AbortSignal
}

export interface WorkspaceService {
  getTree(path?: string): Promise<WorkspaceListing>
  getFile(path: string): Promise<WorkspaceFile>
  search(params: SearchWorkspaceParams): Promise<WorkspaceSearchResult>
}

export function createWorkspaceService(client: ApiClient): WorkspaceService {
  return {
    getTree(path?: string) {
      const search = new URLSearchParams()
      if (path)
        search.set('path', path)
      const qs = search.toString()
      return client.get<WorkspaceListing>(`/api/workspace/tree${qs ? `?${qs}` : ''}`)
    },
    getFile(path: string) {
      const search = new URLSearchParams({ path })
      return client.get<WorkspaceFile>(`/api/workspace/file?${search.toString()}`)
    },
    search(params: SearchWorkspaceParams) {
      const search = new URLSearchParams({ q: params.query })
      if (params.path)
        search.set('path', params.path)
      if (params.exts && params.exts.length > 0)
        search.set('exts', params.exts.join(','))
      return client.get<WorkspaceSearchResult>(
        `/api/workspace/search?${search.toString()}`,
        params.signal ? { signal: params.signal } : undefined,
      )
    },
  }
}
