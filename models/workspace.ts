export type WorkspaceEntryKind = 'file' | 'dir'

export interface WorkspaceEntry {
  name: string
  /** POSIX-style workspace-relative path. */
  path: string
  kind: WorkspaceEntryKind
  size: number
  /** ISO-8601. */
  mtime: string
}

export interface WorkspaceListing {
  /** POSIX-style workspace-relative path of the listed directory (`''` for the root). */
  path: string
  /** Parent path (`''` if root, `null` when there is no parent). */
  parent: string | null
  entries: WorkspaceEntry[]
  /** True when MAX_ENTRIES_PER_DIR was hit while listing. */
  truncated: boolean
}

export interface WorkspaceFile {
  path: string
  size: number
  mtime: string
  encoding: 'utf-8'
  /** True when content was clipped at MAX_FILE_BYTES. */
  truncated: boolean
  content: string
}

export interface WorkspaceSearchHit {
  path: string
  line: number
  column: number
  snippet: string
}

export interface WorkspaceSearchResult {
  query: string
  scope: string
  hits: WorkspaceSearchHit[]
  /** True when MAX_SEARCH_MATCHES, MAX_SEARCH_FILES or SEARCH_TIMEOUT_MS was hit. */
  truncated: boolean
  /** Number of files actually scanned (caps at MAX_SEARCH_FILES). */
  filesScanned: number
}
