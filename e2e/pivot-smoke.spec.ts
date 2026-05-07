import { expect, test } from '@playwright/test'

test.describe('Pivot smoke routes', () => {
  test('overview renders mission control shell', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Mission Control' })).toBeVisible()
  })

  test('monitoring renders analytics panels', async ({ page }) => {
    await page.goto('/monitoring')
    await expect(page.getByText('Telemetry for engineers')).toBeVisible()
  })

  test('scheduler supports run-now section', async ({ page }) => {
    await page.goto('/scheduler')
    await expect(page.getByText('Weekly timeline')).toBeVisible()
  })

  test('workspace route loads', async ({ page }) => {
    await page.goto('/workspace')
    await expect(page.getByRole('heading', { name: 'Workspace' })).toBeVisible()
  })

  test('office fallback and scene route render', async ({ page }) => {
    await page.goto('/office?fallback=1')
    await expect(page.getByText('WebGL not available')).toBeVisible()
    await page.goto('/office')
    await expect(page.getByText('Office map')).toBeVisible()
  })
})
