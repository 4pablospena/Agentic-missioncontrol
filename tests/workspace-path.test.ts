import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  _resetWorkspaceRootCacheForTests,
  isWorkspaceTextFile,
  resolveWorkspacePath,
  WorkspaceDisabledError,
  WorkspacePathError,
} from '../server/utils/workspace-path'

let root: string
let outsideDir: string

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'mc-ws-root-'))
  outsideDir = await mkdtemp(join(tmpdir(), 'mc-ws-outside-'))

  await mkdir(join(root, 'docs'), { recursive: true })
  await writeFile(join(root, 'README.md'), '# hi')
  await writeFile(join(root, 'docs', 'note.md'), 'note')
  await mkdir(join(root, 'node_modules', 'pkg'), { recursive: true })
  await writeFile(join(root, 'node_modules', 'pkg', 'index.js'), '// nope')
  await writeFile(join(outsideDir, 'secret.txt'), 'leaked')
  await symlink(outsideDir, join(root, 'escape'))

  _resetWorkspaceRootCacheForTests()
})

afterAll(async () => {
  if (root)
    await rm(root, { recursive: true, force: true })
  if (outsideDir)
    await rm(outsideDir, { recursive: true, force: true })
})

describe('resolveWorkspacePath', () => {
  it('returns the root when input is empty', async () => {
    const out = await resolveWorkspacePath(root, '')
    expect(out.relativePath).toBe('')
  })

  it('rejects when root is empty (feature disabled)', async () => {
    await expect(resolveWorkspacePath('', 'README.md')).rejects.toBeInstanceOf(WorkspaceDisabledError)
  })

  it('rejects null bytes', async () => {
    await expect(resolveWorkspacePath(root, 'README\u0000.md')).rejects.toBeInstanceOf(WorkspacePathError)
  })

  it('rejects absolute paths', async () => {
    await expect(resolveWorkspacePath(root, '/etc/passwd')).rejects.toBeInstanceOf(WorkspacePathError)
  })

  it('rejects parent traversal', async () => {
    await expect(resolveWorkspacePath(root, '../etc/passwd')).rejects.toBeInstanceOf(WorkspacePathError)
    await expect(resolveWorkspacePath(root, '..')).rejects.toBeInstanceOf(WorkspacePathError)
  })

  it('rejects denylisted segments (node_modules)', async () => {
    await expect(resolveWorkspacePath(root, 'node_modules')).rejects.toMatchObject({
      name: 'WorkspacePathError',
      statusCode: 403,
    })
    await expect(resolveWorkspacePath(root, 'node_modules/pkg/index.js')).rejects.toMatchObject({
      statusCode: 403,
    })
  })

  it('rejects symlink escape via realpath', async () => {
    await expect(resolveWorkspacePath(root, 'escape/secret.txt')).rejects.toMatchObject({
      name: 'WorkspacePathError',
      statusCode: 403,
    })
  })

  it('returns canonical relative path inside the root', async () => {
    const out = await resolveWorkspacePath(root, 'docs/note.md')
    expect(out.relativePath).toBe('docs/note.md')
    expect(out.absolute.endsWith('docs/note.md') || out.absolute.endsWith('docs\\note.md')).toBe(true)
  })

  it('returns 404 for missing entries', async () => {
    await expect(resolveWorkspacePath(root, 'nope/missing.md')).rejects.toMatchObject({
      statusCode: 404,
    })
  })
})

describe('isWorkspaceTextFile', () => {
  it('accepts allowlisted extensions', () => {
    expect(isWorkspaceTextFile('README.md')).toBe(true)
    expect(isWorkspaceTextFile('app.vue')).toBe(true)
    expect(isWorkspaceTextFile('package.json')).toBe(true)
  })

  it('rejects everything else', () => {
    expect(isWorkspaceTextFile('binary.bin')).toBe(false)
    expect(isWorkspaceTextFile('image.png')).toBe(false)
    expect(isWorkspaceTextFile('no-extension')).toBe(false)
  })
})
