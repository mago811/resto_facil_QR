// src/shared/lib/validators/spanish-id.ts
const NIF_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE'

export function validateNIF(raw: string): boolean {
  const s = raw.toUpperCase().trim()
  if (!/^\d{8}[A-Z]$/.test(s)) return false
  const num = parseInt(s.slice(0, 8), 10)
  return s[8] === NIF_LETTERS[num % 23]
}

export function validateNIE(raw: string): boolean {
  const s = raw.toUpperCase().trim()
  if (!/^[XYZ]\d{7}[A-Z]$/.test(s)) return false
  const prefix = s[0] === 'X' ? '0' : s[0] === 'Y' ? '1' : '2'
  return validateNIF(prefix + s.slice(1))
}

export function validateCIF(raw: string): boolean {
  const s = raw.toUpperCase().trim()
  if (!/^[ABCDEFGHJKLMNPQRSUVW]\d{7}[\dA-J]$/.test(s)) return false
  const digits = s.slice(1, 8)
  let sumEven = 0
  let sumOdd = 0
  for (let i = 0; i < 7; i++) {
    const d = parseInt(digits[i]!, 10)
    if (i % 2 === 0) {
      const doubled = d * 2
      sumOdd += doubled > 9 ? doubled - 9 : doubled
    } else {
      sumEven += d
    }
  }
  const total = sumEven + sumOdd
  const control = (10 - (total % 10)) % 10
  const lastChar = s[8]!
  const controlLetter = 'JABCDEFGHI'[control]!
  const orgType = s[0]!
  if ('PQSNW'.includes(orgType)) return lastChar === controlLetter
  if ('ABEH'.includes(orgType)) return lastChar === String(control)
  return lastChar === String(control) || lastChar === controlLetter
}

export type DocumentoTipo = 'NIF' | 'CIF' | 'NIE'

export function validateSpanishId(tipo: DocumentoTipo, value: string): boolean {
  if (tipo === 'NIF') return validateNIF(value)
  if (tipo === 'NIE') return validateNIE(value)
  return validateCIF(value)
}
