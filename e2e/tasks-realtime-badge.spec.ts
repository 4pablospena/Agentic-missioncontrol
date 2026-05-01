import { expect, test } from '@playwright/test'

/**
 * Acotado: comprueba que la página de tareas muestra el estado de realtime,
 * sin validar un evento de negocio concreto por WebSocket.
 */
test.describe('Tasks realtime badge', () => {
  test('shows Realtime label', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByText(/Realtime/)).toBeVisible({ timeout: 25_000 })
  })
})
