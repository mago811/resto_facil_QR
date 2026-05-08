// src/shared/lib/tax/iva.ts
export interface IVAResult {
  baseImponible: number
  cuotaIva: number
  total: number
}

// Input is the total price IVA-included. Back-calculates base and IVA quota.
export function calcularIVA(totalConIva: number, ivaRate: number): IVAResult {
  const baseImponible = +(totalConIva / (1 + ivaRate)).toFixed(2)
  const cuotaIva = +(totalConIva - baseImponible).toFixed(2)
  const total = +(baseImponible + cuotaIva).toFixed(2)
  return { baseImponible, cuotaIva, total }
}
