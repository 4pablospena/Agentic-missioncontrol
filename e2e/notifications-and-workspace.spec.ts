import { expect, test } from '@playwright/test'

/**
 * Smoke checks for the Phase 5 surfaces:
 * - The notification bell renders inside the dashboard sidebar footer with an aria label.
 * - The /workspace route renders an empty state when NUXT_WORKSPACE_ROOT is not set
 *   (Playwright's webServer starts without that env var).
 */
test.describe('Notifications + workspace smoke', () => {
  test('notification bell is mounted in the dashboard layout', async ({ page }) => {
    await page.goto('/')
    const bell = page.getByRole('button', { name: /^Notifications/ })
    await expect(bell).toBeVisible()
  })

  test('workspace page renders disabled empty state without NUXT_WORKSPACE_ROOT', async ({ page }) => {
    const res = await page.goto('/workspace')
    expect(res?.status()).toBeLessThan(400)
    await expect(page.getByText('Workspace browser disabled')).toBeVisible()
  })
})
