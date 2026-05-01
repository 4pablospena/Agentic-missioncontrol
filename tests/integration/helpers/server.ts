import { randomUUID } from 'node:crypto'
import { spawn, type ChildProcess } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Repo root (mission-control-agentic/). */
export const repoRoot = fileURLToPath(new URL('../../../', import.meta.url))

export interface IntegrationServer {
  baseUrl: string
  dbPath: string
  auth: { email: string, password: string }
  stop: () => void
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Starts production Nitro entry (`npm run build` required).
 * Uses an isolated SQLite file under the system temp directory.
 */
export async function startIntegrationServer(): Promise<IntegrationServer> {
  const port = 31000 + Math.floor(Math.random() * 4000)
  const dbPath = join(tmpdir(), `mc-integration-${randomUUID()}.db`)
  const email = 'integration@test.local'
  const password = 'testpassword123'

  const sessionPassword
    = process.env.NUXT_SESSION_PASSWORD ?? '01234567890123456789012345678901'

  let stderr = ''
  const proc: ChildProcess = spawn(
    process.execPath,
    [join(repoRoot, '.output/server/index.mjs')],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: String(port),
        HOST: '127.0.0.1',
        DATABASE_PATH: dbPath,
        /** Overrides baked build-time `runtimeConfig.databasePath` at Nitro startup */
        NUXT_DATABASE_PATH: dbPath,
        NUXT_MC_AUTH_EMAIL: email,
        NUXT_MC_AUTH_PASSWORD: password,
        NUXT_SESSION_PASSWORD: sessionPassword,
        OPENCLAW_BRIDGE_MODE: 'mock',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  proc.stderr?.on('data', (chunk: Buffer) => {
    stderr += chunk.toString()
  })

  const deadline = Date.now() + 90_000
  let ok = false
  while (Date.now() < deadline) {
    if (proc.exitCode !== null)
      break
    try {
      const r = await fetch(`http://127.0.0.1:${port}/api/health`)
      if (r.ok) {
        ok = true
        break
      }
    }
    catch {
      /* server not ready */
    }
    await sleep(150)
  }

  if (!ok) {
    proc.kill('SIGTERM')
    throw new Error(
      `Integration server failed to start on port ${port}. stderr:\n${stderr.slice(-4000)}`,
    )
  }

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    dbPath,
    auth: { email, password },
    stop: () => {
      proc.kill('SIGTERM')
    },
  }
}

export async function loginSessionCookie(
  baseUrl: string,
  email: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Login failed ${res.status}: ${t}`)
  }
  const cookies = res.headers.getSetCookie?.() ?? []
  if (!cookies.length)
    throw new Error('Login response missing Set-Cookie')
  return cookies.map(c => c.split(';')[0]).filter(Boolean).join('; ')
}
