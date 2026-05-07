// tests/unit/spanish-id.test.ts
import { describe, it, expect } from 'vitest'
import { validateNIF, validateNIE, validateCIF, validateSpanishId } from '@/shared/lib/validators/spanish-id'

describe('validateNIF', () => {
  it('accepts valid NIF', () => {
    expect(validateNIF('12345678Z')).toBe(true)
    expect(validateNIF('00000000T')).toBe(true)
  })
  it('rejects wrong control letter', () => {
    expect(validateNIF('12345678A')).toBe(false)
  })
  it('rejects too short', () => {
    expect(validateNIF('1234567Z')).toBe(false)
  })
  it('is case-insensitive', () => {
    expect(validateNIF('12345678z')).toBe(true)
  })
})

describe('validateNIE', () => {
  it('accepts valid NIE with X prefix', () => {
    expect(validateNIE('X1234567L')).toBe(true)
  })
  it('accepts valid NIE with Y prefix', () => {
    expect(validateNIE('Y1234567X')).toBe(true)
  })
  it('accepts valid NIE with Z prefix', () => {
    expect(validateNIE('Z1234567R')).toBe(true)
  })
  it('rejects wrong control letter', () => {
    expect(validateNIE('X1234567A')).toBe(false)
  })
})

describe('validateCIF', () => {
  it('accepts valid CIF', () => {
    expect(validateCIF('B12345674')).toBe(true)
  })
  it('rejects invalid CIF', () => {
    expect(validateCIF('B12345670')).toBe(false)
  })
})

describe('validateSpanishId', () => {
  it('routes to correct validator by type', () => {
    expect(validateSpanishId('NIF', '12345678Z')).toBe(true)
    expect(validateSpanishId('NIE', 'X1234567L')).toBe(true)
    expect(validateSpanishId('CIF', 'B12345674')).toBe(true)
  })
  it('returns false for invalid', () => {
    expect(validateSpanishId('NIF', '00000000X')).toBe(false)
  })
})
