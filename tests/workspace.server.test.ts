import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

let root = ''

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({ workspaceRoot: root }),
}))

const useRuntimeConfigMock = vi.fn(() => ({ workspaceRoot: root }))
vi.stubGlobal('useRuntimeConfig', useRuntimeConfigMock)

import { _resetWorkspaceRootCacheForTests } from '../server/utils/workspace-path'

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'mc-ws-svc-'))
  await mkdir(join(root, 'docs'), { recursive: true })
  await writeFile(join(root, 'README.md'), '# Welcome\nMission Control test fixture.\n')
  await writeFile(join(root, 'docs', 'note.md'), 'first line\nMatch HERE\nlast line\n')
  await writeFile(join(root, 'docs', 'large.md'), 'x'.repeat(2_000_000))
  await writeFile(join(root, 'binary.bin'), Buffer.from([0, 1, 2, 3]))
  _resetWorkspaceRootCacheForTests()
  // re-stub now that root is populated
  useRuntimeConfigMock.mockImplementation(() => ({ workspaceRoot: root }))
  vi.stubGlobal('useRuntimeConfig', useRuntimeConfigMock)
})

afterAll(async () => {
  if (root)
    await rm(root, { recursive: true, force: true })
})

describe('workspace.server', () => {
  it('listDirectory returns sorted entries (dirs first)', async () => {
    const { listDirectory } = await import('../server/services/workspace.server')
    const listing = await listDirectory('')
    expect(listing.path).toBe('')
    const names = listing.entries.map(e => e.name)
    expect(names[0]).toBe('docs')
    expect(names).toContain('README.md')
  })

  it('readTextFile returns text content', async () => {
    const { readTextFile } = await import('../server/services/workspace.server')
    const file = await readTextFile('README.md')
    expect(file.content).toContain('Welcome')
    expect(file.encoding).toBe('utf-8')
    expect(file.truncated).toBe(false)
  })

  it('readTextFile truncates oversized files', async () => {
    const { readTextFile } = await import('../server/services/workspace.server')
    const file = await readTextFile('docs/large.md')
    expect(file.truncated).toBe(true)
    expect(file.content.length).toBeLessThanOrEqual(1_000_000)
  })

  it('readTextFile rejects binary extensions with 415', async () => {
    const { readTextFile } = await import('../server/services/workspace.server')
    await expect(readTextFile('binary.bin')).rejects.toMatchObject({
      name: 'WorkspacePathError',
      statusCode: 415,
    })
  })

  it('searchFiles finds matches with snippet, line and column', async () => {
    const { searchFiles } = await import('../server/services/workspace.server')
    const result = await searchFiles({ query: 'match here' })
    expect(result.hits.length).toBeGreaterThan(0)
    const hit = result.hits[0]!
    expect(hit.path).toBe('docs/note.md')
    expect(hit.line).toBe(2)
    expect(hit.column).toBe(1)
    expect(hit.snippet.toLowerCase()).toContain('match here')
  })

  it('searchFiles is case-insensitive', async () => {
    const { searchFiles } = await import('../server/services/workspace.server')
    const result = await searchFiles({ query: 'MISSION CONTROL' })
    expect(result.hits.some(h => h.path === 'README.md')).toBe(true)
  })
})
