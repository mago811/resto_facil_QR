// src/features/qr-session/get-active-session.ts
import { db, mesas, sesionesPos, restaurantes } from '@/shared/db'
import { eq, and } from 'drizzle-orm'
import type { SesionPos, Mesa } from '@/entities/mesa/types'
import type { Restaurante } from '@/entities/restaurante/types'

export interface ActiveSession {
  sesion: SesionPos
  mesa: Mesa
  restaurante: Restaurante
}

export async function getActiveSession(
  restauranteSlug: string,
  mesaNumero: number
): Promise<ActiveSession | null> {
  const [restaurante] = await db
    .select()
    .from(restaurantes)
    .where(eq(restaurantes.slug, restauranteSlug))
    .limit(1)

  if (!restaurante) return null

  const result = await db
    .select()
    .from(sesionesPos)
    .innerJoin(mesas, eq(sesionesPos.mesaId, mesas.id))
    .where(
      and(
        eq(mesas.numero, mesaNumero),
        eq(mesas.restauranteId, restaurante.id),
        eq(sesionesPos.estado, 'abierta')
      )
    )
    .limit(1)

  const row = result[0]
  if (!row) return null

  const sesionRaw = row.sesiones_pos
  return {
    sesion: {
      id: sesionRaw.id,
      mesaId: sesionRaw.mesaId,
      subtotal: sesionRaw.subtotal,
      descripcion: sesionRaw.descripcion ?? null,
      estado: sesionRaw.estado as 'abierta' | 'facturada' | 'cerrada',
      createdAt: sesionRaw.createdAt,
    },
    mesa: row.mesas as Mesa,
    restaurante: restaurante as Restaurante,
  }
}
