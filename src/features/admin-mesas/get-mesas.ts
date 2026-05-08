// src/features/admin-mesas/get-mesas.ts
import { db, mesas, sesionesPos } from '@/shared/db'
import { eq, and } from 'drizzle-orm'
import type { MesaConSesion } from '@/entities/mesa/types'

export async function getMesasConSesion(restauranteId: string): Promise<MesaConSesion[]> {
  const rows = await db
    .select()
    .from(mesas)
    .leftJoin(sesionesPos, and(
      eq(sesionesPos.mesaId, mesas.id),
      eq(sesionesPos.estado, 'abierta')
    ))
    .where(eq(mesas.restauranteId, restauranteId))
    .orderBy(mesas.numero)

  return rows.map(r => ({
    ...r.mesas,
    sesionActiva: r.sesiones_pos
      ? {
          id: r.sesiones_pos.id,
          mesaId: r.sesiones_pos.mesaId,
          subtotal: r.sesiones_pos.subtotal,
          descripcion: r.sesiones_pos.descripcion ?? null,
          estado: r.sesiones_pos.estado as 'abierta' | 'facturada' | 'cerrada',
          createdAt: r.sesiones_pos.createdAt,
        }
      : null,
  }))
}
