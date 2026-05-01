import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test as setup, expect } from '@playwright/test'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const email = process.env.PLAYWRIGHT_MC_EMAIL ?? 'e2e@test.local'
const password = process.env.PLAYWRIGHT_MC_PASSWORD ?? 'e2epassword12345'

const authFile = path.join(repoRoot, 'e2e', '.auth', 'user.json')

setup('authenticate', async ({ page }) => {
  mkdirSync(path.dirname(authFile), { recursive: true })

  await page.goto('/login')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 })

  await page.context().storageState({ path: authFile })
})
