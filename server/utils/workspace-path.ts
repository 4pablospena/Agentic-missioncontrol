import { realpath } from 'node:fs/promises'
import { isAbsolute, normalize, relative, resolve, sep } from 'node:path'

/**
 * Hard limits for the read-only workspace browser. Tuned for browsing a moderate
 * workspace from a single operator; not a general code-search tool. Tightening
 * these is always safe; relaxing them requires re-auditing the path guard.
 */
export const WORKSPACE_LIMITS = {
  MAX_DEPTH: 8,
  MAX_ENTRIES_PER_DIR: 500,
  MAX_FILE_BYTES: 1_000_000,
  MAX_SEARCH_FILES: 2_000,
  MAX_SEARCH_MATCHES: 200,
  SEARCH_TIMEOUT_MS: 4_000,
} as const

/** Path segments that are never enumerated, read or searched. */
export const WORKSPACE_DENYLIST_SEGMENTS = new Set<string>([
  '.git',
  'node_modules',
  '.output',
  '.nuxt',
  'dist',
  '.env',
  '.env.local',
])

/**
 * File extensions we are willing to serve as text. Any other extension yields
 * 415 — protects against binary downloads and lets the UI assume utf-8.
 */
export const WORKSPACE_TEXT_EXTENSIONS = new Set<string>([
  '.md',
  '.txt',
  '.json',
  '.yml',
  '.yaml',
  '.toml',
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.vue',
  '.css',
  '.html',
  '.svg',
  '.lock',
])

export class WorkspaceDisabledError extends Error {
  constructor() {
    super('Workspace browser disabled (set NUXT_WORKSPACE_ROOT)')
    this.name = 'WorkspaceDisabledError'
  }
}

export class WorkspacePathError extends Error {
  constructor(message: string, readonly statusCode: number = 400) {
    super(message)
    this.name = 'WorkspacePathError'
  }
}

interface ResolveResult {
  /** Real absolute path on disk after symlink resolution. */
  absolute: string
  /** Workspace-relative POSIX-style path (uses `/`), `''` for the root. */
  relativePath: string
}

/**
 * Validates the user-supplied relative `input` against `rootRaw` and returns the
 * canonical real path inside the workspace. Rejects null bytes, absolute paths,
 * `..` traversal, denylisted segments and symlink escapes.
 */
export async function resolveWorkspacePath(rootRaw: string, input: string | undefined): Promise<ResolveResult> {
  if (!rootRaw || !rootRaw.trim())
    throw new WorkspaceDisabledError()

  const raw = (input ?? '').trim()
  if (raw.includes('\0'))
    throw new WorkspacePathError('Path contains null byte')

  if (isAbsolute(raw))
    throw new WorkspacePathError('Absolute paths are not allowed')

  const normalised = normalize(raw === '' ? '.' : raw)
  if (normalised.startsWith('..') || normalised === '..')
    throw new WorkspacePathError('Path traversal is not allowed')

  for (const part of normalised.split(/[\\/]/)) {
    if (WORKSPACE_DENYLIST_SEGMENTS.has(part))
      throw new WorkspacePathError(`Path contains denylisted segment: ${part}`, 403)
  }

  const root = await realRoot(rootRaw)
  const candidate = resolve(root, normalised === '.' ? '' : normalised)
  let real: string
  try {
    real = await realpath(candidate)
  }
  catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException)?.code
    if (code === 'ENOENT')
      throw new WorkspacePathError('Path not found', 404)
    throw err
  }

  if (real !== root && !real.startsWith(root + sep))
    throw new WorkspacePathError('Path escapes workspace root', 403)

  const rel = real === root ? '' : relative(root, real).split(sep).join('/')
  return { absolute: real, relativePath: rel }
}

let cachedRootRaw: string | undefined
let cachedRoot: string | undefined

async function realRoot(rootRaw: string): Promise<string> {
  if (cachedRootRaw === rootRaw && cachedRoot)
    return cachedRoot
  try {
    const real = await realpath(rootRaw)
    cachedRootRaw = rootRaw
    cachedRoot = real
    return real
  }
  catch {
    throw new WorkspacePathError('Workspace root is not accessible', 500)
  }
}

/** Test-only: invalidates the realpath cache so per-test root swaps work. */
export function _resetWorkspaceRootCacheForTests(): void {
  cachedRootRaw = undefined
  cachedRoot = undefined
}

export function isWorkspaceTextFile(filename: string): boolean {
  const lower = filename.toLowerCase()
  const dot = lower.lastIndexOf('.')
  if (dot < 0)
    return false
  return WORKSPACE_TEXT_EXTENSIONS.has(lower.slice(dot))
}

export function joinForResponse(parent: string, name: string): string {
  if (!parent)
    return name
  return `${parent}/${name}`
}

export function parentForResponse(relPath: string): string | null {
  if (!relPath)
    return null
  const idx = relPath.lastIndexOf('/')
  if (idx < 0)
    return ''
  return relPath.slice(0, idx)
}
