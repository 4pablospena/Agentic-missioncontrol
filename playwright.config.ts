import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const repoRoot = path.dirname(fileURLToPath(import.meta.url))

const defaultDb = path.join(repoRoot, 'data', 'e2e-playwright.db')

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(repoRoot, 'e2e', '.auth', 'user.json'),
      },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  webServer: {
    command: 'npm run build && node .output/server/index.mjs',
    url: 'http://127.0.0.1:3000/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    cwd: repoRoot,
    env: {
      ...process.env,
      PORT: '3000',
      HOST: '127.0.0.1',
      DATABASE_PATH: process.env.PLAYWRIGHT_DATABASE_PATH ?? defaultDb,
      NUXT_DATABASE_PATH: process.env.PLAYWRIGHT_DATABASE_PATH ?? defaultDb,
      NUXT_MC_AUTH_EMAIL:
        process.env.PLAYWRIGHT_MC_EMAIL ?? 'e2e@test.local',
      NUXT_MC_AUTH_PASSWORD:
        process.env.PLAYWRIGHT_MC_PASSWORD ?? 'e2epassword12345',
      NUXT_SESSION_PASSWORD:
        process.env.NUXT_SESSION_PASSWORD ?? '01234567890123456789012345678901',
      OPENCLAW_BRIDGE_MODE: 'mock',
      NUXT_PUBLIC_OFFICE3D_ENABLED: 'true',
      NUXT_PUBLIC_ADVANCED_ANALYTICS_ENABLED: 'true',
    },
  },
})
