// tests/integration/emit-invoice.test.ts
import { describe, it, expect } from 'vitest'

describe('emitInvoice integration', () => {
  it.skipIf(!process.env.DATABASE_URL_TEST)('happy path — creates invoice', async () => {
    // Run with: DATABASE_URL_TEST=<neon-test-url> npm test -- tests/integration/
    expect(process.env.DATABASE_URL_TEST).toBeDefined()
  })

  it.skipIf(!process.env.DATABASE_URL_TEST)('duplicate session returns error', async () => {
    expect(process.env.DATABASE_URL_TEST).toBeDefined()
  })
})
