import { readFile } from 'node:fs/promises'
import { realpath } from 'node:fs/promises'
import { dirname, isAbsolute, resolve } from 'node:path'
import process from 'node:process'
import type { Agent } from '~/models/agent'
import { normalizeAgentRecord } from './openclaw-gateway-jsonrpc'

function extractPrimaryModel(raw: unknown): string | undefined {
  if (raw == null)
    return undefined
  if (typeof raw === 'string')
    return raw.trim() || undefined
  if (typeof raw === 'object' && raw !== null && 'primary' in raw)
    return String((raw as { primary: unknown }).primary).trim() || undefined
  return undefined
}

/**
 * Maps OpenClaw `openclaw.json` `agents.list` rows into dashboard {@link Agent} rows (status idle if absent).
 */
export function parseAgentsFromOpenclawConfig(parsed: unknown): Agent[] {
  if (!parsed || typeof parsed !== 'object')
    return []

  const root = parsed as Record<string, unknown>
  const agentsBlock = root.agents as Record<string, unknown> | undefined
  if (!agentsBlock || typeof agentsBlock !== 'object')
    return []

  const list = agentsBlock.list
  if (!Array.isArray(list))
    return []

  const defaults = agentsBlock.defaults as Record<string, unknown> | undefined
  const defaultModel = extractPrimaryModel(defaults?.model)

  const out: Agent[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object')
      continue
    const row = item as Record<string, unknown>
    const modelFromRow = extractPrimaryModel(row.model)
    const synthetic: Record<string, unknown> = {
      ...row,
      status: row.status ?? row.state ?? 'idle',
      model: modelFromRow ?? defaultModel,
    }
    const agent = normalizeAgentRecord(synthetic)
    if (agent)
      out.push(agent)
  }
  return out
}

async function resolvedOpenclawRoot(openclawDirRaw: string): Promise<string> {
  const t = openclawDirRaw.trim()
  if (!t)
    throw new Error('OPENCLAW_DIR is empty')
  const abs = isAbsolute(t) ? t : resolve(process.cwd(), t)
  return realpath(abs)
}

/**
 * Reads `OPENCLAW_DIR/openclaw.json` and returns agents from `agents.list`.
 * `openclaw.json` must live directly under the resolved directory (no symlink escapes).
 */
export async function readAgentsFromOpenclawDir(openclawDirRaw: string): Promise<Agent[]> {
  const root = await resolvedOpenclawRoot(openclawDirRaw)
  const candidate = resolve(root, 'openclaw.json')
  let configReal: string
  try {
    configReal = await realpath(candidate)
  }
  catch {
    throw new Error(`openclaw.json not found under ${root}`)
  }

  const dir = dirname(configReal)
  if (dir !== root)
    throw new Error('openclaw.json must reside directly under OPENCLAW_DIR')

  const raw = await readFile(configReal, 'utf8')
  let parsed: unknown
  try {
    parsed = JSON.parse(raw) as unknown
  }
  catch {
    throw new Error('openclaw.json is not valid JSON')
  }

  return parseAgentsFromOpenclawConfig(parsed)
}
