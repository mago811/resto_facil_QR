import { test, expect } from '@playwright/test'

test('mesa without open session shows friendly error', async ({ page }) => {
  await page.goto('/factura/demo/999')
  await expect(page.getByText('Sin consumo activo')).toBeVisible()
})

test('invalid NIF shows validation error on blur', async ({ page }) => {
  await page.goto('/factura/demo/1')
  await page.fill('[name="documentoId"]', '00000000A')
  await page.press('[name="documentoId"]', 'Tab')
  await expect(page.getByText('Documento de identidad no válido')).toBeVisible()
  // Submit button does not post to server — form shows error
  await page.click('[type="submit"]')
  await expect(page.getByText('Factura emitida')).not.toBeVisible()
})
