import { test, expect } from '@playwright/test'

// Assumes seed data: slug=demo, mesa 1 has an open session with subtotal 45.00
test('customer scans QR, fills form, gets invoice', async ({ page }) => {
  await page.goto('/factura/demo/1')

  // Should show ticket summary
  await expect(page.getByText('Solicitar factura')).toBeVisible()
  await expect(page.getByText('45.00')).toBeVisible()
  await expect(page.getByText('4.50')).toBeVisible()   // IVA
  await expect(page.getByText('49.50')).toBeVisible()  // Total

  // Fill in tax form
  await page.selectOption('[name="documentoTipo"]', 'NIF')
  await page.fill('[name="documentoId"]', '12345678Z')
  await page.fill('[name="razonSocial"]', 'Test Cliente SL')
  await page.fill('[name="direccionFacturacion"]', 'Calle Test 1, 28000 Madrid')

  // Submit
  await page.click('[type="submit"]')

  // Confirmation screen
  await expect(page.getByText('Factura emitida')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText(/REST-\d{4}-/)).toBeVisible()
  // PDF link appears when Vercel Blob is configured; in local dev it shows a "generating" message instead
  const hasPdfLink = await page.getByText('Descargar PDF').isVisible()
  const hasPdfPending = await page.getByText('El PDF se está generando').isVisible()
  expect(hasPdfLink || hasPdfPending).toBeTruthy()
})
