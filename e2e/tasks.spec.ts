import { expect, test } from '@playwright/test'

test.describe('Tasks UI', () => {
  test('create task appears on board', async ({ page }) => {
    await page.goto('/tasks')
    const topic = `e2e-task-${Date.now()}`
    await page.getByRole('button', { name: /Nueva orden/i }).click()
    await page.locator('.rs-card--interactive').filter({ hasText: 'Publicar post en LinkedIn' }).click()
    await expect(page.getByRole('button', { name: /^Enviar$/ })).toBeVisible({ timeout: 10_000 })
    await page.locator('.rs-modal input.rs-input').first().fill(topic)
    const postTask = page.waitForResponse(
      res => res.url().includes('/api/tasks') && res.request().method() === 'POST' && res.ok(),
    )
    await page.getByRole('button', { name: /^Enviar$/ }).click()
    await postTask
    const cardTitle = `LinkedIn: ${topic}`
    // Guided modal lives on `layouts/dashboard.vue` and mutates a different `useTasks()`
    // instance than `/tasks`; reload so the board refetches from the API.
    await page.reload()
    await expect(page.getByText(cardTitle).first()).toBeVisible({ timeout: 30_000 })
  })
})
