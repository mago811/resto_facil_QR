// src/entities/mesa/types.ts
export interface Mesa {
  id: string
  numero: number
  nombre: string | null
  restauranteId: string
  activa: boolean
  createdAt: Date
}

export interface SesionPos {
  id: string
  mesaId: string
  subtotal: string
  descripcion: string | null
  estado: 'abierta' | 'facturada' | 'cerrada'
  createdAt: Date
}

export interface MesaConSesion extends Mesa {
  sesionActiva: SesionPos | null
}
