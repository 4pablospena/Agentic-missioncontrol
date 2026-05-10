import { expect, test } from '@playwright/test'

/**
 * Acotado: comprueba que la página de tareas muestra el estado de realtime,
 * sin validar un evento de negocio concreto por WebSocket.
 */
test.describe('Tasks realtime badge', () => {
  test('shows live connection badge', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByText(/EN VIVO|OFFLINE/)).toBeVisible({ timeout: 25_000 })
  })
})
