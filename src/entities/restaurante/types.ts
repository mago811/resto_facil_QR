// src/entities/restaurante/types.ts
export interface Restaurante {
  id: string
  nombre: string
  cif: string
  razonSocial: string
  direccion: string
  ivaPorcentaje: string
  facturaSeq: number
  createdAt: Date
}
