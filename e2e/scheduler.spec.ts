import { expect, test } from '@playwright/test'

test.describe('Scheduler UI', () => {
  test('create schedule shows row with next run', async ({ page }) => {
    await page.goto('/scheduler')
    const title = `e2e-sched-${Date.now()}`
    await page.getByTestId('schedule-cron-input').fill('0 * * * *')
    await page.getByTestId('schedule-title-input').fill(title)
    await page.getByTestId('schedule-submit').click()
    await expect(page.getByText(title)).toBeVisible({ timeout: 30_000 })
    /** Same cron ⇒ identical "Next:" text on every row; anchor to this schedule's card. */
    await expect(page.locator(`[data-schedule-title="${title}"]`).getByText(/^Next:/)).toBeVisible()
  })
})
