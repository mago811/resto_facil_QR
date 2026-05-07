// src/shared/lib/tax/iva.ts
export interface IVAResult {
  baseImponible: number
  cuotaIva: number
  total: number
}

export function calcularIVA(subtotal: number, ivaRate: number): IVAResult {
  const baseImponible = +subtotal.toFixed(2)
  const cuotaIva = +(baseImponible * ivaRate).toFixed(2)
  const total = +(baseImponible + cuotaIva).toFixed(2)
  return { baseImponible, cuotaIva, total }
}
