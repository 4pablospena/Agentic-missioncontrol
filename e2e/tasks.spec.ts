import { expect, test } from '@playwright/test'

test.describe('Tasks UI', () => {
  test('create task appears on board', async ({ page }) => {
    await page.goto('/tasks')
    const title = `e2e-task-${Date.now()}`
    await page.getByTestId('create-task-title-input').fill(title)
    await page.getByTestId('create-task-submit').click()
    await expect(
      page.getByRole('button', { name: new RegExp(title) }),
    ).toBeVisible({ timeout: 30_000 })
  })
})
