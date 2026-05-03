import { readdir, readFile, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
import type {
  WorkspaceEntry,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchHit,
  WorkspaceSearchResult,
} from '~/models/workspace'
import {
  isWorkspaceTextFile,
  joinForResponse,
  parentForResponse,
  resolveWorkspacePath,
  WORKSPACE_DENYLIST_SEGMENTS,
  WORKSPACE_LIMITS,
  WorkspacePathError,
} from '../utils/workspace-path'

interface WorkspaceContext {
  root: string
}

function getRoot(): WorkspaceContext {
  const cfg = useRuntimeConfig()
  const root = String(cfg.workspaceRoot ?? '').trim()
  return { root }
}

export async function listDirectory(input: string | undefined): Promise<WorkspaceListing> {
  const { root } = getRoot()
  const { absolute, relativePath } = await resolveWorkspacePath(root, input)

  const stats = await stat(absolute)
  if (!stats.isDirectory())
    throw new WorkspacePathError('Path is not a directory', 400)

  const dirents = await readdir(absolute, { withFileTypes: true })
  const filtered = dirents.filter(d => !WORKSPACE_DENYLIST_SEGMENTS.has(d.name))
  const truncated = filtered.length > WORKSPACE_LIMITS.MAX_ENTRIES_PER_DIR
  const slice = filtered.slice(0, WORKSPACE_LIMITS.MAX_ENTRIES_PER_DIR)

  const entries: WorkspaceEntry[] = []
  for (const dirent of slice) {
    if (!dirent.isDirectory() && !dirent.isFile())
      continue
    try {
      const childAbs = join(absolute, dirent.name)
      const s = await stat(childAbs)
      entries.push({
        name: dirent.name,
        path: joinForResponse(relativePath, dirent.name),
        kind: dirent.isDirectory() ? 'dir' : 'file',
        size: dirent.isFile() ? s.size : 0,
        mtime: s.mtime.toISOString(),
      })
    }
    catch {
      // skip unreadable / racy entries
    }
  }

  entries.sort((a, b) => {
    if (a.kind !== b.kind)
      return a.kind === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  return {
    path: relativePath,
    parent: parentForResponse(relativePath),
    entries,
    truncated,
  }
}

export async function readTextFile(input: string | undefined): Promise<WorkspaceFile> {
  const { root } = getRoot()
  const { absolute, relativePath } = await resolveWorkspacePath(root, input)

  const stats = await stat(absolute)
  if (!stats.isFile())
    throw new WorkspacePathError('Path is not a file', 400)

  const filename = relativePath.split('/').pop() ?? ''
  if (!isWorkspaceTextFile(filename))
    throw new WorkspacePathError('Unsupported file type', 415)

  const buf = await readFile(absolute)
  const truncated = buf.length > WORKSPACE_LIMITS.MAX_FILE_BYTES
  const sliced = truncated ? buf.subarray(0, WORKSPACE_LIMITS.MAX_FILE_BYTES) : buf

  return {
    path: relativePath,
    size: stats.size,
    mtime: stats.mtime.toISOString(),
    encoding: 'utf-8',
    truncated,
    content: sliced.toString('utf-8'),
  }
}

export interface SearchFilesInput {
  query: string
  path?: string
  exts?: string[]
  signal?: AbortSignal
}

export class WorkspaceSearchTimeoutError extends Error {
  constructor() {
    super('Search timed out')
    this.name = 'WorkspaceSearchTimeoutError'
  }
}

export async function searchFiles(input: SearchFilesInput): Promise<WorkspaceSearchResult> {
  const { root } = getRoot()
  const query = input.query.trim()
  if (!query)
    throw new WorkspacePathError('Empty query', 400)

  const { absolute, relativePath } = await resolveWorkspacePath(root, input.path ?? '')

  const stats = await stat(absolute)
  if (!stats.isDirectory())
    throw new WorkspacePathError('Search scope must be a directory', 400)
  const startDir = absolute
  const startRel = relativePath

  const lcQuery = query.toLowerCase()
  const allowedExts = (input.exts && input.exts.length > 0)
    ? new Set(input.exts.map(e => (e.startsWith('.') ? e : `.${e}`).toLowerCase()))
    : null

  const hits: WorkspaceSearchHit[] = []
  let filesScanned = 0
  let truncated = false
  const startedAt = Date.now()
  const queue: Array<{ abs: string, rel: string, depth: number }> = [
    { abs: startDir, rel: startRel, depth: 0 },
  ]

  while (queue.length > 0) {
    if (input.signal?.aborted)
      break
    if (Date.now() - startedAt > WORKSPACE_LIMITS.SEARCH_TIMEOUT_MS) {
      truncated = true
      break
    }
    if (filesScanned >= WORKSPACE_LIMITS.MAX_SEARCH_FILES) {
      truncated = true
      break
    }
    if (hits.length >= WORKSPACE_LIMITS.MAX_SEARCH_MATCHES) {
      truncated = true
      break
    }

    const next = queue.shift()!
    if (next.depth > WORKSPACE_LIMITS.MAX_DEPTH)
      continue

    let dirents
    try {
      dirents = await readdir(next.abs, { withFileTypes: true })
    }
    catch {
      continue
    }

    for (const dirent of dirents) {
      if (WORKSPACE_DENYLIST_SEGMENTS.has(dirent.name))
        continue
      const childAbs = join(next.abs, dirent.name)
      const childRel = joinForResponse(next.rel, dirent.name)

      if (dirent.isDirectory()) {
        queue.push({ abs: childAbs, rel: childRel, depth: next.depth + 1 })
        continue
      }
      if (!dirent.isFile())
        continue

      const ext = extname(dirent.name).toLowerCase()
      if (!isWorkspaceTextFile(dirent.name))
        continue
      if (allowedExts && !allowedExts.has(ext))
        continue

      filesScanned += 1
      try {
        await scanFile({ abs: childAbs, rel: childRel, lcQuery, hits })
      }
      catch {
        // skip unreadable / binary files
      }

      if (hits.length >= WORKSPACE_LIMITS.MAX_SEARCH_MATCHES) {
        truncated = true
        break
      }
      if (filesScanned >= WORKSPACE_LIMITS.MAX_SEARCH_FILES) {
        truncated = true
        break
      }
    }
  }

  return {
    query,
    scope: startRel,
    hits,
    truncated,
    filesScanned,
  }
}

interface ScanFileArgs {
  abs: string
  rel: string
  lcQuery: string
  hits: WorkspaceSearchHit[]
}

async function scanFile({ abs, rel, lcQuery, hits }: ScanFileArgs): Promise<void> {
  const stats = await stat(abs)
  if (stats.size > WORKSPACE_LIMITS.MAX_FILE_BYTES)
    return
  const buf = await readFile(abs, 'utf-8')
  const lines = buf.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lower = line.toLowerCase()
    const col = lower.indexOf(lcQuery)
    if (col === -1)
      continue
    hits.push({
      path: rel,
      line: i + 1,
      column: col + 1,
      snippet: clip(line, col, lcQuery.length),
    })
    if (hits.length >= WORKSPACE_LIMITS.MAX_SEARCH_MATCHES)
      return
  }
}

function clip(line: string, col: number, needleLen: number): string {
  const PAD = 40
  const start = Math.max(0, col - PAD)
  const end = Math.min(line.length, col + needleLen + PAD)
  const prefix = start > 0 ? '… ' : ''
  const suffix = end < line.length ? ' …' : ''
  return `${prefix}${line.slice(start, end)}${suffix}`
}
