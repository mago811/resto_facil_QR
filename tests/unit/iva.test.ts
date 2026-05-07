// tests/unit/iva.test.ts
import { describe, it, expect } from 'vitest'
import { calcularIVA } from '@/shared/lib/tax/iva'

describe('calcularIVA', () => {
  it('calculates 10% IVA correctly', () => {
    const result = calcularIVA(45, 0.10)
    expect(result.baseImponible).toBe(45)
    expect(result.cuotaIva).toBe(4.50)
    expect(result.total).toBe(49.50)
  })
  it('rounds to 2 decimal places', () => {
    const result = calcularIVA(33.33, 0.10)
    expect(result.cuotaIva).toBe(3.33)
    expect(result.total).toBe(36.66)
  })
  it('handles 0% IVA', () => {
    const result = calcularIVA(100, 0)
    expect(result.cuotaIva).toBe(0)
    expect(result.total).toBe(100)
  })
  it('handles decimal base', () => {
    const result = calcularIVA(12.50, 0.10)
    expect(result.cuotaIva).toBe(1.25)
    expect(result.total).toBe(13.75)
  })
})
