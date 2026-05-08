// src/features/admin-config/get-config.ts
import { db, restaurantes } from '@/shared/db'
import { eq } from 'drizzle-orm'
import type { Restaurante } from '@/entities/restaurante/types'

export async function getRestauranteConfig(restauranteId: string): Promise<Restaurante | null> {
  const [r] = await db.select().from(restaurantes).where(eq(restaurantes.id, restauranteId))
  if (!r) return null
  return {
    id: r.id,
    nombre: r.nombre,
    cif: r.cif,
    razonSocial: r.razonSocial,
    direccion: r.direccion,
    ivaPorcentaje: r.ivaPorcentaje,
    facturaSeq: r.facturaSeq,
    createdAt: r.createdAt,
  }
}
